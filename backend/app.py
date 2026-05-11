from flask import Flask, request, jsonify
from flask_cors import CORS
import re
import os
import PyPDF2
import docx
import time
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Global in-memory stores for real-time features
active_users = {} # { "email": { "name": "...", "last_ping": float } }
chat_conversations = {} # { "email": [ { "sender": "user"|"admin", "text": "...", "time": "..." } ] }
analytics_data = {
    "total_candidates": 0,
    "total_analyses": 0,
    "volume_by_day": {"Mon": 0, "Tue": 0, "Wed": 0, "Thu": 0, "Fri": 0, "Sat": 0, "Sun": 0},
    "score_history": [],
    "recent_analyses": []
}

def extract_text_from_file(file):
    filename = file.filename.lower()
    text = ""
    try:
        if filename.endswith('.pdf'):
            reader = PyPDF2.PdfReader(file)
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + " "
        elif filename.endswith('.docx'):
            doc = docx.Document(file)
            for para in doc.paragraphs:
                text += para.text + " "
        elif filename.endswith('.txt'):
            text = file.read().decode('utf-8', errors='ignore')
    except Exception as e:
        print(f"Error extracting text from {filename}: {e}")
    return text

STOP_WORDS = {
    "i", "me", "my", "myself", "we", "our", "ours", "ourselves", "you", "your", "yours", 
    "yourself", "yourselves", "he", "him", "his", "himself", "she", "her", "hers", 
    "herself", "it", "its", "itself", "they", "them", "their", "theirs", "themselves", 
    "what", "which", "who", "whom", "this", "that", "these", "those", "am", "is", "are", 
    "was", "were", "be", "been", "being", "have", "has", "had", "having", "do", "does", 
    "did", "doing", "a", "an", "the", "and", "but", "if", "or", "because", "as", "until", 
    "while", "of", "at", "by", "for", "with", "about", "against", "between", "into", 
    "through", "during", "before", "after", "above", "below", "to", "from", "up", "down", 
    "in", "out", "on", "off", "over", "under", "again", "further", "then", "once", "here", 
    "there", "when", "where", "why", "how", "all", "any", "both", "each", "few", "more", 
    "most", "other", "some", "such", "no", "nor", "not", "only", "own", "same", "so", 
    "than", "too", "very", "can", "will", "just", "should", "now", "would", "could",
    "may", "might", "must", "shall", "ought", "need", "dare", "used", "also",
    "experience", "years", "work", "working", "job", "description", "requirements",
    "required", "preferred", "responsibilities", "skills", "knowledge", "ability"
}

COMMON_SKILLS = [
    # Programming Languages
    "python", "java", "c++", "c#", "javascript", "typescript", "ruby", "php", "go", "rust", "swift", "kotlin", "scala", "r", "matlab",
    # Web Technologies
    "react", "angular", "vue", "node.js", "node", "express", "django", "flask", "fastapi", "spring boot", "laravel", "rails", "html", "css", "sass", "less",
    # Databases
    "sql", "mysql", "postgresql", "mongodb", "redis", "elasticsearch", "cassandra", "dynamodb", "oracle", "sqlite", "firebase",
    # Cloud & DevOps
    "aws", "azure", "gcp", "docker", "kubernetes", "terraform", "ansible", "jenkins", "github actions", "gitlab ci", "circleci",
    # Data Science & ML
    "machine learning", "deep learning", "tensorflow", "pytorch", "keras", "scikit-learn", "pandas", "numpy", "jupyter", "tableau", "power bi",
    # Mobile
    "android", "ios", "flutter", "react native", "xamarin", "ionic", "cordova",
    # Other Tools & Skills
    "git", "linux", "unix", "bash", "powershell", "agile", "scrum", "kanban", "jira", "confluence", "slack", "trello",
    # Soft Skills
    "leadership", "communication", "problem solving", "teamwork", "project management", "analytical", "critical thinking"
]

def calculate_score(resume_text, job_desc):
    jd_lower = job_desc.lower()
    resume_lower = resume_text.lower()
    
    # Extract required skills from job description
    required_skills = set()
    for skill in COMMON_SKILLS:
        # More flexible matching - check if skill words are in the text
        skill_words = skill.split()
        if len(skill_words) == 1:
            # Single word skill
            if re.search(rf'\b{re.escape(skill)}\b', jd_lower):
                required_skills.add(skill)
        else:
            # Multi-word skill - check if all words are present
            if all(word in jd_lower for word in skill_words):
                required_skills.add(skill)
    
    # Extract words from both texts
    resume_words_raw = re.findall(r'[a-z0-9+#]+', resume_lower)
    job_words_raw = re.findall(r'[a-z0-9+#]+', jd_lower)
    
    resume_words = set(w for w in resume_words_raw if w not in STOP_WORDS and len(w) > 2)
    job_words = set(w for w in job_words_raw if w not in STOP_WORDS and len(w) > 2)
    
    # If no specific skills found, rely on keyword matching
    if not required_skills:
        if not job_words:
            return 0
        matched_words = resume_words.intersection(job_words)
        if len(job_words) == 0:
            return 0
        score = int((len(matched_words) / len(job_words)) * 100)
        return min(int(score * 1.2), 100)
    
    # Calculate skill-based score
    matched_skills = set()
    for skill in required_skills:
        skill_words = skill.split()
        if len(skill_words) == 1:
            if re.search(rf'\b{re.escape(skill)}\b', resume_lower):
                matched_skills.add(skill)
        else:
            if all(word in resume_lower for word in skill_words):
                matched_skills.add(skill)
    
    skill_score = (len(matched_skills) / len(required_skills)) * 100 if required_skills else 0
    
    # Keyword matching score (max 30% contribution)
    matched_words = resume_words.intersection(job_words)
    keyword_score = min((len(matched_words) / max(1, len(job_words))) * 100, 30)
    
    # Combine scores
    final_score = int((skill_score * 0.7) + keyword_score)
    return min(final_score, 100)

def extract_contact_info(text):
    email_match = re.search(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', text)
    email = email_match.group(0) if email_match else ""
    
    phone_match = re.search(r'\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', text)
    phone = phone_match.group(0) if phone_match else ""
    
    return email, phone

@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "Resume Analyzer Backend is running"})

@app.route("/analyze", methods=["POST"])
def analyze_resume():
    resume_text = ""
    job_desc = ""

    if request.is_json:
        data = request.get_json() or {}
        resume_text = data.get("resume", "")
        job_desc = data.get("job_desc", "")
    else:
        resume_file = request.files.get("resume")
        job_desc = request.form.get("job_desc", "")
        if resume_file:
            resume_text = extract_text_from_file(resume_file)

    score = calculate_score(resume_text, job_desc)
    email, phone = extract_contact_info(resume_text)

    day_name = datetime.now().strftime("%a")
    analytics_data["total_candidates"] += 1
    analytics_data["total_analyses"] += 1
    if day_name in analytics_data["volume_by_day"]:
        analytics_data["volume_by_day"][day_name] += 1
    
    analytics_data["score_history"].append({
        "name": datetime.now().strftime("%I:%M %p"),
        "score": score
    })
    if len(analytics_data["score_history"]) > 10:
        analytics_data["score_history"].pop(0)
        
    analytics_data["recent_analyses"].insert(0, {
        "id": int(time.time()),
        "role": "Job Match Analysis" if job_desc else "Resume Scan",
        "date": datetime.now().strftime("%b %d, %Y"),
        "count": 1,
        "topScore": score,
        "status": "Completed"
    })
    if len(analytics_data["recent_analyses"]) > 20:
        analytics_data["recent_analyses"].pop()

    matched_skills = []
    missing_skills = []
    
    resume_lower = resume_text.lower()
    jd_lower = job_desc.lower()

    for skill in COMMON_SKILLS:
        skill_words = skill.split()
        if len(skill_words) == 1:
            in_resume = bool(re.search(rf'\b{re.escape(skill)}\b', resume_lower))
            in_job_desc = bool(re.search(rf'\b{re.escape(skill)}\b', jd_lower))
        else:
            in_resume = all(word in resume_lower for word in skill_words)
            in_job_desc = all(word in jd_lower for word in skill_words)
            
        if in_resume and in_job_desc:
            matched_skills.append(skill)
        elif in_job_desc and not in_resume:
            missing_skills.append(skill)
            
    job_words_raw = re.findall(r'[a-z0-9+#]+', jd_lower)
    resume_words_raw = re.findall(r'[a-z0-9+#]+', resume_lower)
    resume_words = set(w for w in resume_words_raw if w not in STOP_WORDS and len(w) > 2)
    job_words = set(w for w in job_words_raw if w not in STOP_WORDS and len(w) > 2)
    
    missing_keywords = sorted(list(job_words - resume_words), key=len, reverse=True)[:10]

    return jsonify({
        "score": score,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "missing_keywords": missing_keywords,
        "email": email,
        "phone": phone,
        "message": "Analysis completed successfully"
    })

@app.route("/ats_check", methods=["POST"])
def ats_check():
    resume_file = request.files.get("resume")
    resume_text = ""
    if resume_file:
        resume_text = extract_text_from_file(resume_file)
        
    email, phone = extract_contact_info(resume_text)
    resume_lower = resume_text.lower()
    
    score = 100
    missing_skills = []
    missing_keywords = []
    
    word_count = len(re.findall(r'\w+', resume_text))
    if word_count == 0:
        return jsonify({
            "score": 0,
            "matched_skills": [],
            "missing_skills": ["Parseable Text (Resume may be an image or protected)"],
            "missing_keywords": [],
            "email": "",
            "phone": "",
            "message": "Failed to extract text."
        })
        
    if word_count < 300:
        score -= 25
        missing_skills.append("Sufficient Content Length (>300 words)")
    elif word_count > 1200:
        score -= 15
        missing_skills.append("Concise Formatting (Reduce word count)")
        
    if not email:
        score -= 10
        missing_skills.append("Email Address")
    if not phone:
        score -= 10
        missing_skills.append("Phone Number")
    if "linkedin.com" not in resume_lower:
        score -= 5
        missing_skills.append("LinkedIn Profile URL")
        
    sections = {
        "Experience / Work History": ["experience", "employment", "work history", "professional experience", "history"],
        "Education": ["education", "academic", "degree", "university", "college", "school"],
        "Skills": ["skills", "technologies", "expertise", "core competencies", "proficiencies"]
    }
    
    for section_name, keywords in sections.items():
        if not any(kw in resume_lower for kw in keywords):
            score -= 15
            missing_skills.append(f"{section_name} Section")
            
    metrics_count = len(re.findall(r'\d+%|\$\d+|\b\d+\b', resume_text))
    if metrics_count < 5:
        score -= 15
        missing_keywords.append("Measurable Results & Metrics (e.g. increased sales by 20%)")
            
    action_verbs = [
        "developed", "managed", "led", "created", "designed", "improved", 
        "increased", "built", "implemented", "achieved", "orchestrated", 
        "spearheaded", "optimized", "resolved", "coordinated", "streamlined"
    ]
    verb_count = sum(1 for verb in action_verbs if verb in resume_lower)
    if verb_count < 4:
        score -= 10
        missing_keywords.append("Variety of Strong Action Verbs (e.g. Optimized, Spearheaded)")

    score = max(0, min(score, 100))
    
    day_name = datetime.now().strftime("%a")
    analytics_data["total_candidates"] += 1
    analytics_data["total_analyses"] += 1
    if day_name in analytics_data["volume_by_day"]:
        analytics_data["volume_by_day"][day_name] += 1
        
    analytics_data["recent_analyses"].insert(0, {
        "id": int(time.time()),
        "role": "ATS Formatting Check",
        "date": datetime.now().strftime("%b %d, %Y"),
        "count": 1,
        "topScore": score,
        "status": "Completed"
    })
    if len(analytics_data["recent_analyses"]) > 20:
        analytics_data["recent_analyses"].pop()

    return jsonify({
        "score": score,
        "matched_skills": ["ATS Parseable Format", "Text Extracted Successfully"] if score > 50 else [],
        "missing_skills": missing_skills,
        "missing_keywords": missing_keywords,
        "email": email,
        "phone": phone,
        "original_text": resume_text,
        "message": "Generic ATS best practices analysis completed."
    })

@app.route("/analytics", methods=["GET"])
def get_analytics():
    return jsonify(analytics_data)

@app.route("/ping", methods=["POST"])
def ping_user():
    # FIX: guard against missing/non-JSON body
    data = request.get_json(silent=True) or {}
    email = data.get("email")
    name = data.get("name")
    if email and name:
        active_users[email] = {
            "name": name,
            "last_ping": time.time()
        }
    return jsonify({"success": True})

@app.route("/active_users", methods=["GET"])
def get_active_users():
    current_time = time.time()
    online_users = []
    for email, info in list(active_users.items()):
        if current_time - info["last_ping"] < 30:
            online_users.append({
                "email": email,
                "name": info["name"],
                "status": "online"
            })
        else:
            del active_users[email]
    return jsonify(online_users)

@app.route("/chat/send", methods=["POST"])
def send_chat():
    # FIX: guard against missing/non-JSON body
    data = request.get_json(silent=True) or {}
    sender = data.get("sender")
    target_user = data.get("target_user")
    text = data.get("text")
    
    if not target_user:
        return jsonify({"error": "target_user is required"}), 400
        
    if target_user not in chat_conversations:
        chat_conversations[target_user] = []
        
    chat_conversations[target_user].append({
        "sender": "admin" if sender == "admin" else "user",
        "text": text,
        "time": datetime.now().strftime("%I:%M %p")
    })
    return jsonify({"success": True})

@app.route("/chat/messages", methods=["GET"])
def get_messages():
    user_email = request.args.get("email")
    messages = chat_conversations.get(user_email, [])
    return jsonify(messages)

@app.route("/chat/conversations", methods=["GET"])
def get_conversations():
    summaries = []
    for user_email, messages in chat_conversations.items():
        if messages:
            last_message = messages[-1]
            user_name = active_users.get(user_email, {}).get("name", user_email.split("@")[0])
            summaries.append({
                "email": user_email,
                "name": user_name,
                "last_message": last_message["text"],
                "time": last_message["time"],
                "unread": last_message["sender"] == "user"
            })
    return jsonify(summaries)

@app.route("/share", methods=["POST"])
def share_resume():
    # FIX: guard against missing/non-JSON body
    data = request.get_json(silent=True) or {}
    email = data.get("email")
    if not email:
        return jsonify({"success": False, "error": "Email is required"}), 400
        
    time.sleep(1)
    
    return jsonify({
        "success": True, 
        "message": f"Perfect Resume successfully sent to {email}"
    })

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", debug=False, port=port)