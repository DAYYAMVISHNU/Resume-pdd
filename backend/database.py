import sqlite3
import os
import json
import hashlib
import time
from datetime import datetime

# Vercel serverless: only /tmp/ is writable. Locally, use the file next to this script.
_IS_VERCEL = os.environ.get('VERCEL') == '1' or os.environ.get('VERCEL_ENV') is not None
DATABASE_FILE = '/tmp/ats_analyzer.db' if _IS_VERCEL else os.path.join(os.path.dirname(__file__), "ats_analyzer.db")

def get_db_connection():
    conn = sqlite3.connect(DATABASE_FILE)
    conn.row_factory = sqlite3.Row
    return conn

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
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_analyses_user ON analyses(user_id)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_chats_email ON chats(user_email)')

    # Seed Admin User if not exists
    cursor.execute('SELECT * FROM users WHERE email = ?', ('lvishnu181@gmail.com',))
    if not cursor.fetchone():
        # Secure salt and hashing for default admin
        admin_pass = "6302797232@a"
        salt = os.urandom(16)
        pwd_hash = hashlib.pbkdf2_hmac('sha256', admin_pass.encode('utf-8'), salt, 100000)
        stored_hash = salt.hex() + ":" + pwd_hash.hex()
        
        cursor.execute(
            'INSERT INTO users (name, email, password_hash, is_admin) VALUES (?, ?, ?, 1)',
            ('Vishnu', 'lvishnu181@gmail.com', stored_hash)
        )

    # Seed Mock Google and Github users if not exists for OAuth bypass demos
    for mock_email, mock_name in [('vishnu@gmail.com', 'Vishnu Google'), ('vishnu@github.com', 'Vishnu Github')]:
        cursor.execute('SELECT * FROM users WHERE email = ?', (mock_email,))
        if not cursor.fetchone():
            salt = os.urandom(16)
            pwd_hash = hashlib.pbkdf2_hmac('sha256', "mockpass123".encode('utf-8'), salt, 100000)
            stored_hash = salt.hex() + ":" + pwd_hash.hex()
            cursor.execute(
                'INSERT INTO users (name, email, password_hash, is_admin) VALUES (?, ?, ?, 0)',
                (mock_name, mock_email, stored_hash)
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
    try:
        cursor.execute(
            'INSERT INTO users (name, email, password_hash, is_admin) VALUES (?, ?, ?, ?)',
            (name, email, pwd_hash, 1 if is_admin else 0)
        )
        conn.commit()
        user_id = cursor.lastrowid
        return {"success": True, "user_id": user_id}
    except sqlite3.IntegrityError:
        return {"success": False, "error": "Email address already registered"}
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
            "date": datetime.strptime(r["created_at"], "%Y-%m-%d %H:%M:%S").strftime("%b %d, %Y") if r["created_at"] else "Just Now",
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
        try:
            ts = datetime.strptime(r["timestamp"], "%Y-%m-%d %H:%M:%S").strftime("%I:%M %p")
        except Exception:
            ts = "Just Now"
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
        try:
            ts = datetime.strptime(r["timestamp"], "%Y-%m-%d %H:%M:%S").strftime("%I:%M %p")
        except Exception:
            ts = "Just now"
            
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
        try:
            ts = datetime.strptime(r["created_at"], "%Y-%m-%d %H:%M:%S")
            formatted_date = ts.strftime("%b %d, %Y")
            formatted_time = ts.strftime("%I:%M %p")
        except Exception:
            formatted_date = "Just now"
            formatted_time = "Just now"
            
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
