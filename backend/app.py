from flask import Flask, request, jsonify
from flask_cors import CORS
import re
import PyPDF2
import docx
import time
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Global in-memory stores for real-time features
active_users = {} # { "email": { "name": "...", "last_ping": float } }
chat_conversations = {} # { "email": [ { "sender": "user"|"admin", "text": "...", "time": "..." } ] }

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

def calculate_score(resume_text, job_desc):
    resume_words = set(re.findall(r'\w+', resume_text.lower()))
    job_words = set(re.findall(r'\w+', job_desc.lower()))

    if not job_words:
        return 0

    matched_words = resume_words.intersection(job_words)
    score = int((len(matched_words) / len(job_words)) * 100)

    return min(score, 100)

def extract_contact_info(text):
    email_match = re.search(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', text)
    email = email_match.group(0) if email_match else ""
    
    phone_match = re.search(r'\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', text)
    phone = phone_match.group(0) if phone_match else ""
    
    return email, phone

@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "message": "Resume Analyzer Backend is running"
    })

@app.route("/analyze", methods=["POST"])
def analyze_resume():
    resume_text = ""
    job_desc = ""

    if request.is_json:
        data = request.get_json()
        resume_text = data.get("resume", "")
        job_desc = data.get("job_desc", "")
    else:
        resume_file = request.files.get("resume")
        job_desc = request.form.get("job_desc", "")
        
        if resume_file:
            resume_text = extract_text_from_file(resume_file)

    score = calculate_score(resume_text, job_desc)
    email, phone = extract_contact_info(resume_text)
    matched_skills = []
    skills = [
        "python", "java", "react", "node", "html", "css",
        "javascript", "typescript", "sql", "mongodb",
        "machine learning", "deep learning", "tensorflow",
        "flask", "django", "git", "docker", "aws"
    ]

    for skill in skills:
        if skill in resume_text.lower() and skill in job_desc.lower():
            matched_skills.append(skill)

    return jsonify({
        "score": score,
        "matched_skills": matched_skills,
        "email": email,
        "phone": phone,
        "message": "Analysis completed successfully"
    })

@app.route("/ping", methods=["POST"])
def ping_user():
    data = request.get_json()
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
        # Consider online if pinged within the last 30 seconds
        if current_time - info["last_ping"] < 30:
            online_users.append({
                "email": email,
                "name": info["name"],
                "status": "online"
            })
        else:
            # Cleanup old users to save memory
            del active_users[email]
    return jsonify(online_users)

@app.route("/chat/send", methods=["POST"])
def send_chat():
    data = request.get_json()
    sender = data.get("sender") # "admin" or user_email
    target_user = data.get("target_user") # user_email (who the chat belongs to)
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
    # Return a summary of all conversations for the admin
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
                "unread": last_message["sender"] == "user" # Simple unread logic
            })
    return jsonify(summaries)

if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True, port=5000)