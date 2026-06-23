import sqlite3
import os
import json
import hashlib
import time
from datetime import datetime
from dotenv import load_dotenv

# Load local environment variables from .env if present
load_dotenv()

_DATABASE_URL = os.environ.get('DATABASE_URL')
_USE_POSTGRES = bool(_DATABASE_URL)

if _USE_POSTGRES:
    try:
        import psycopg2
    except ImportError:
        print("[WARNING] DATABASE_URL is set, but 'psycopg2' is not installed. Falling back to local SQLite database.")
        _USE_POSTGRES = False

# psycopg2 is imported lazily inside get_db_connection() to avoid
# crashing Vercel cold-starts when the package is installed but
# DATABASE_URL isn't yet set (or vice-versa).

def format_datetime(val, fmt="%b %d, %Y"):
    if not val:
        return "Just Now"
    if isinstance(val, datetime):
        return val.strftime(fmt)
    if isinstance(val, str):
        for f in ("%Y-%m-%d %H:%M:%S", "%Y-%m-%d %H:%M:%S.%f"):
            try:
                return datetime.strptime(val, f).strftime(fmt)
            except ValueError:
                continue
        return val
    return str(val)

class DictRow(dict):
    def __init__(self, row_dict, row_tuple):
        super().__init__(row_dict)
        self._tuple = row_tuple
        
    def __getitem__(self, key):
        if isinstance(key, int):
            return self._tuple[key]
        return super().__getitem__(key)

def make_row(row, cursor):
    if row is None:
        return None
    if isinstance(row, sqlite3.Row):
        return DictRow(dict(row), tuple(row))
    elif hasattr(row, 'keys'):
        return DictRow({k: row[k] for k in row.keys()}, tuple(row))
    elif isinstance(row, (list, tuple)):
        description = cursor.description
        if description:
            keys = [col[0] for col in description]
            row_dict = dict(zip(keys, row))
            return DictRow(row_dict, tuple(row))
    return row

class DBCursorWrapper:
    def __init__(self, cursor):
        self.cursor = cursor

    @property
    def lastrowid(self):
        if _USE_POSTGRES:
            return getattr(self, '_last_inserted_id', None)
        else:
            return self.cursor.lastrowid

    def execute(self, query, params=None):
        if params is None:
            params = ()
        
        if _USE_POSTGRES:
            query = query.replace('?', '%s')
            query = query.replace('CREATE INDEX IF NOT EXISTS', 'CREATE INDEX')
            query = query.replace('INTEGER PRIMARY KEY AUTOINCREMENT', 'SERIAL PRIMARY KEY')
            query = query.replace('is_admin BOOLEAN DEFAULT 0', 'is_admin BOOLEAN DEFAULT FALSE')
            query = query.replace('last_ping REAL', 'last_ping DOUBLE PRECISION')
            query = query.replace("STRFTIME('%w', created_at)", "CAST(EXTRACT(dow FROM created_at) AS INTEGER)::text")
            query = query.replace("strftime('%w', created_at)", "CAST(EXTRACT(dow FROM created_at) AS INTEGER)::text")
            
            if 'INSERT OR REPLACE' in query:
                if 'active_sessions' in query:
                    query = '''INSERT INTO active_sessions (email, name, last_ping) VALUES (%s, %s, %s)
                               ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, last_ping = EXCLUDED.last_ping'''
            
            is_insert = query.strip().upper().startswith('INSERT')
            if is_insert and 'RETURNING' not in query.upper() and 'active_sessions' not in query:
                query = query.rstrip(';').strip() + ' RETURNING id'
                self.cursor.execute(query, params)
                row = self.cursor.fetchone()
                self._last_inserted_id = row[0] if row else None
                return self
                
        self.cursor.execute(query, params)
        return self

    def fetchone(self):
        row = self.cursor.fetchone()
        return make_row(row, self.cursor)

    def fetchall(self):
        rows = self.cursor.fetchall()
        return [make_row(r, self.cursor) for r in rows]

    def close(self):
        self.cursor.close()

    def __iter__(self):
        return iter(self.cursor)

class DBConnectionWrapper:
    def __init__(self, conn):
        self.conn = conn

    def cursor(self):
        if _USE_POSTGRES:
            import psycopg2.extras
            return DBCursorWrapper(self.conn.cursor(cursor_factory=psycopg2.extras.DictCursor))
        return DBCursorWrapper(self.conn.cursor())

    def commit(self):
        self.conn.commit()

    def close(self):
        self.conn.close()

    def rollback(self):
        self.conn.rollback()

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type:
            self.conn.rollback()
        else:
            self.conn.commit()
        self.conn.close()

# Vercel serverless: only /tmp/ is writable. Locally, use the file next to this script.
_IS_VERCEL = os.environ.get('VERCEL') == '1' or os.environ.get('VERCEL_ENV') is not None
db_name = "ats_analyzer.db"
DATABASE_FILE = "/tmp/" + db_name if _IS_VERCEL else os.path.join(os.path.dirname(__file__), db_name)

def get_db_connection():
    if _USE_POSTGRES:
        # Lazy import — only executed when DATABASE_URL is actually set
        import psycopg2
        import psycopg2.extras
        if "sslmode=" in _DATABASE_URL:
            conn = psycopg2.connect(_DATABASE_URL)
        else:
            conn = psycopg2.connect(_DATABASE_URL, sslmode='require')
        return DBConnectionWrapper(conn)
    else:
        conn = sqlite3.connect(DATABASE_FILE)
        conn.row_factory = sqlite3.Row
        return DBConnectionWrapper(conn)

def db_init():
    """Initializes the SQLite database tables and seeds the admin user if absent."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            is_admin BOOLEAN DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Resumes table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS resumes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            filename TEXT NOT NULL,
            parsed_text TEXT,
            uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    ''')
    
    # Analyses table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS analyses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            resume_id INTEGER,
            job_desc TEXT,
            score INTEGER,
            matched_skills TEXT,
            missing_skills TEXT,
            missing_keywords TEXT,
            parsed_details TEXT, -- JSON holding extra details: skills, education, experience, certs
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY(resume_id) REFERENCES resumes(id) ON DELETE SET NULL
        )
    ''')

    # Job Descriptions table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS job_descriptions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            title TEXT,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    ''')

    # Chat messages table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS chats (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_email TEXT NOT NULL,
            sender TEXT NOT NULL, -- 'user' or 'admin'
            message TEXT NOT NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Active sessions table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS active_sessions (
            email TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            last_ping REAL
        )
    ''')
    
    # Indices for high performance
    # Use try/except per index so re-runs on PostgreSQL (which doesn't
    # support IF NOT EXISTS for indexes in older versions) don't abort.
    for idx_sql in [
        'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
        'CREATE INDEX IF NOT EXISTS idx_analyses_user ON analyses(user_id)',
        'CREATE INDEX IF NOT EXISTS idx_chats_email ON chats(user_email)',
    ]:
        try:
            cursor.execute(idx_sql)
            conn.commit()
        except Exception:
            conn.rollback()

    _ADMIN_EMAIL = "lvishnu181" + "@" + "gmail.com"
    # Seed Admin User if not exists
    cursor.execute('SELECT * FROM users WHERE email = ?', (_ADMIN_EMAIL,))
    if not cursor.fetchone():
        # Secure salt and hashing for default admin
        admin_pass = "6302797232@a"
        salt = os.urandom(16)
        pwd_hash = hashlib.pbkdf2_hmac('sha256', admin_pass.encode('utf-8'), salt, 100000)
        stored_hash = salt.hex() + ":" + pwd_hash.hex()
        
        cursor.execute(
            'INSERT INTO users (name, email, password_hash, is_admin) VALUES (?, ?, ?, ?)',
            ('Vishnu', _ADMIN_EMAIL, stored_hash, True)
        )

    # Seed Mock Google and Github users if not exists for OAuth bypass demos
    for mock_email, mock_name in [('vishnu@gmail.com', 'Vishnu Google'), ('vishnu@github.com', 'Vishnu Github')]:
        cursor.execute('SELECT * FROM users WHERE email = ?', (mock_email,))
        if not cursor.fetchone():
            salt = os.urandom(16)
            pwd_hash = hashlib.pbkdf2_hmac('sha256', "mockpass123".encode('utf-8'), salt, 100000)
            stored_hash = salt.hex() + ":" + pwd_hash.hex()
            cursor.execute(
                'INSERT INTO users (name, email, password_hash, is_admin) VALUES (?, ?, ?, ?)',
                (mock_name, mock_email, stored_hash, False)
            )
    
    conn.commit()
    conn.close()

# Password Security Utilities
def hash_password(password: str) -> str:
    salt = os.urandom(16)
    pwd_hash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000)
    return salt.hex() + ":" + pwd_hash.hex()

def verify_password(stored_hash: str, password: str) -> bool:
    try:
        salt_hex, hash_hex = stored_hash.split(":")
        salt = bytes.fromhex(salt_hex)
        expected_hash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000)
        return expected_hash.hex() == hash_hex
    except Exception:
        return False

# Database Query Handlers
def create_user(name, email, password, is_admin=False):
    conn = get_db_connection()
    cursor = conn.cursor()
    pwd_hash = hash_password(password)
    # Always store email as lowercase so login lookups always match
    email_clean = email.strip().lower()
    try:
        cursor.execute(
            'INSERT INTO users (name, email, password_hash, is_admin) VALUES (?, ?, ?, ?)',
            (name, email_clean, pwd_hash, bool(is_admin))
        )
        conn.commit()
        user_id = cursor.lastrowid
        return {"success": True, "user_id": user_id}
    except Exception as e:
        err_str = str(e).lower()
        if "unique" in err_str or "duplicate" in err_str:
            return {"success": False, "error": "Email address already registered"}
        return {"success": False, "error": f"Database error: {str(e)}"}
    finally:
        conn.close()

def update_user_password(email, password, name=None):
    """Update password hash for an existing user. Optionally update name."""
    conn = get_db_connection()
    cursor = conn.cursor()
    email_clean = email.strip().lower()
    pwd_hash = hash_password(password)
    try:
        if name:
            cursor.execute(
                'UPDATE users SET password_hash = ?, name = ? WHERE email = ?',
                (pwd_hash, name.strip(), email_clean)
            )
        else:
            cursor.execute(
                'UPDATE users SET password_hash = ? WHERE email = ?',
                (pwd_hash, email_clean)
            )
        conn.commit()
        return {"success": True}
    except Exception as e:
        return {"success": False, "error": f"Database error: {str(e)}"}
    finally:
        conn.close()

def get_user_by_email(email):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM users WHERE email = ?', (email.lower().strip(),))
    row = cursor.fetchone()
    conn.close()
    return row

def save_resume(user_id, filename, parsed_text):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        'INSERT INTO resumes (user_id, filename, parsed_text) VALUES (?, ?, ?)',
        (user_id, filename, parsed_text)
    )
    conn.commit()
    resume_id = cursor.lastrowid
    conn.close()
    return resume_id

def save_analysis(user_id, resume_id, job_desc, score, matched_skills, missing_skills, missing_keywords, parsed_details):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        '''INSERT INTO analyses 
           (user_id, resume_id, job_desc, score, matched_skills, missing_skills, missing_keywords, parsed_details) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)''',
        (
            user_id, 
            resume_id, 
            job_desc, 
            score, 
            json.dumps(matched_skills), 
            json.dumps(missing_skills), 
            json.dumps(missing_keywords), 
            json.dumps(parsed_details)
        )
    )
    conn.commit()
    analysis_id = cursor.lastrowid
    conn.close()
    return analysis_id

def get_analyses_for_user(user_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        '''SELECT a.*, r.filename 
           FROM analyses a 
           LEFT JOIN resumes r ON a.resume_id = r.id 
           WHERE a.user_id = ? 
           ORDER BY a.created_at DESC''',
        (user_id,)
    )
    rows = cursor.fetchall()
    conn.close()
    
    analyses = []
    for r in rows:
        analyses.append({
            "id": r["id"],
            "role": "Job Match Analysis" if r["job_desc"] else "Resume Scan",
            "date": format_datetime(r["created_at"], "%b %d, %Y"),
            "count": 1,
            "topScore": r["score"],
            "status": "Completed",
            "filename": r["filename"]
        })
    return analyses

def save_job_description(user_id, title, description):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        'INSERT INTO job_descriptions (user_id, title, description) VALUES (?, ?, ?)',
        (user_id, title, description)
    )
    conn.commit()
    conn.close()

def get_job_descriptions(user_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM job_descriptions WHERE user_id = ? ORDER BY created_at DESC', (user_id,))
    rows = cursor.fetchall()
    conn.close()
    return [{"id": r["id"], "title": r["title"], "description": r["description"]} for r in rows]

# Chat persistence
def add_chat_message(user_email, sender, message):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        'INSERT INTO chats (user_email, sender, message) VALUES (?, ?, ?)',
        (user_email, sender, message)
    )
    conn.commit()
    conn.close()

def get_chat_messages(user_email):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM chats WHERE user_email = ? ORDER BY timestamp ASC', (user_email,))
    rows = cursor.fetchall()
    conn.close()
    
    messages = []
    for r in rows:
        ts = format_datetime(r["timestamp"], "%I:%M %p")
        messages.append({
            "sender": r["sender"],
            "text": r["message"],
            "time": ts
        })
    return messages

def get_active_chat_summaries():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT c1.user_email, c1.message, c1.sender, c1.timestamp, u.name 
        FROM chats c1
        LEFT JOIN users u ON u.email = c1.user_email
        WHERE c1.id = (
            SELECT MAX(id) FROM chats c2 WHERE c2.user_email = c1.user_email
        )
        ORDER BY c1.timestamp DESC
    ''')
    rows = cursor.fetchall()
    conn.close()
    
    summaries = []
    for r in rows:
        ts = format_datetime(r["timestamp"], "%I:%M %p")
            
        summaries.append({
            "email": r["user_email"],
            "name": r["name"] or r["user_email"].split("@")[0],
            "last_message": r["message"],
            "time": ts,
            "unread": r["sender"] == "user"
        })
    return summaries

# Session Management
def ping_active_session(email, name):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        'INSERT OR REPLACE INTO active_sessions (email, name, last_ping) VALUES (?, ?, ?)',
        (email, name, time.time())
    )
    conn.commit()
    conn.close()

def get_online_users():
    conn = get_db_connection()
    cursor = conn.cursor()
    threshold = time.time() - 30
    
    # Delete expired sessions
    cursor.execute('DELETE FROM active_sessions WHERE last_ping < ?', (threshold,))
    conn.commit()
    
    cursor.execute('SELECT email, name FROM active_sessions')
    rows = cursor.fetchall()
    conn.close()
    
    return [{"email": r["email"], "name": r["name"], "status": "online"} for r in rows]

# Admin statistics
def get_admin_metrics():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('SELECT COUNT(*) FROM users')
    total_users = cursor.fetchone()[0]
    
    cursor.execute('SELECT COUNT(*) FROM resumes')
    total_resumes = cursor.fetchone()[0]
    
    cursor.execute('SELECT COUNT(*) FROM analyses')
    total_analyses = cursor.fetchone()[0]
    
    # Fetch recent analyses details
    cursor.execute('''
        SELECT a.id, a.score, a.created_at, r.filename, u.name as candidate_name 
        FROM analyses a
        LEFT JOIN resumes r ON a.resume_id = r.id
        LEFT JOIN users u ON a.user_id = u.id
        ORDER BY a.created_at DESC LIMIT 20
    ''')
    recent_rows = cursor.fetchall()
    
    recent_analyses = []
    score_history = []
    
    for idx, r in enumerate(recent_rows):
        formatted_date = format_datetime(r["created_at"], "%b %d, %Y")
        formatted_time = format_datetime(r["created_at"], "%I:%M %p")
            
        recent_analyses.append({
            "id": r["id"],
            "role": f"Scan: {r['filename'] or 'Resume'}" if r["candidate_name"] else "Resume Scan",
            "date": formatted_date,
            "count": 1,
            "topScore": r["score"],
            "status": "Completed"
        })
        
        if idx < 10:
            score_history.append({
                "name": formatted_time,
                "score": r["score"]
            })
            
    score_history.reverse()

    # Score stats
    cursor.execute('SELECT AVG(score) FROM analyses')
    avg_score_row = cursor.fetchone()
    avg_score = round(avg_score_row[0]) if avg_score_row and avg_score_row[0] is not None else 0

    # Skill analytics (Mock aggregates from DB parsing)
    cursor.execute('SELECT parsed_details FROM analyses')
    details_rows = cursor.fetchall()
    skill_freq = {}
    for row in details_rows:
        if row[0]:
            try:
                det = json.loads(row[0])
                skills = det.get("skills", [])
                for s in skills:
                    s_lower = s.lower().strip()
                    skill_freq[s_lower] = skill_freq.get(s_lower, 0) + 1
            except Exception:
                pass
                
    sorted_skills = sorted(skill_freq.items(), key=lambda x: x[1], reverse=True)[:5]
    top_skills = [{"skill": k, "count": v} for k, v in sorted_skills]
    if not top_skills:
        top_skills = [{"skill": "Python", "count": 2}, {"skill": "React", "count": 1}]

    # Format analytics
    formats = {"PDF": int(total_resumes * 0.75), "DOCX": int(total_resumes * 0.20), "TXT": int(total_resumes * 0.05)}
    if total_resumes == 0:
        formats = {"PDF": 0, "DOCX": 0, "TXT": 0}

    # Volume by day
    volume = {"Mon": 0, "Tue": 0, "Wed": 0, "Thu": 0, "Fri": 0, "Sat": 0, "Sun": 0}
    cursor.execute('''
        SELECT STRFTIME('%w', created_at) as day_num, COUNT(*) 
        FROM analyses 
        GROUP BY day_num
    ''')
    day_mapping = {"0": "Sun", "1": "Mon", "2": "Tue", "3": "Wed", "4": "Thu", "5": "Fri", "6": "Sat"}
    for r in cursor.fetchall():
        d_name = day_mapping.get(r[0])
        if d_name:
            volume[d_name] = r[1]

    conn.close()
    
    return {
        "total_users": total_users,
        "total_candidates": total_resumes,
        "total_analyses": total_analyses,
        "average_score": avg_score,
        "volume_by_day": volume,
        "score_history": score_history,
        "recent_analyses": recent_analyses,
        "top_skills": top_skills,
        "file_formats": formats
    }
