# Advanced Features Implementation Guide

## 1. RESUME RANKING SYSTEM

### Database Schema for Rankings

```sql
-- Rankings table
CREATE TABLE rankings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    job_description_id INTEGER,
    ranking_name TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(job_description_id) REFERENCES job_descriptions(id)
);

-- Resume rankings (many-to-many)
CREATE TABLE ranking_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ranking_id INTEGER NOT NULL,
    resume_id INTEGER NOT NULL,
    rank_position INTEGER,
    ats_score INTEGER,
    skill_match_percent REAL,
    experience_match_percent REAL,
    education_match_percent REAL,
    final_score REAL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(ranking_id) REFERENCES rankings(id) ON DELETE CASCADE,
    FOREIGN KEY(resume_id) REFERENCES resumes(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX idx_rankings_user ON rankings(user_id);
CREATE INDEX idx_ranking_items_ranking ON ranking_items(ranking_id);
CREATE INDEX idx_ranking_items_rank ON ranking_items(rank_position);
```

### Ranking Algorithm Implementation

```python
# backend/ranking_engine.py
import json
from typing import List, Dict
from database import COMMON_SKILLS, STOP_WORDS, get_db_connection
import re

class RankingEngine:
    """Advanced resume ranking system"""
    
    def __init__(self):
        self.common_skills = COMMON_SKILLS
        self.stop_words = STOP_WORDS
    
    def rank_resumes(self, resumes: List[Dict], job_description: str) -> List[Dict]:
        """
        Rank multiple resumes against job description
        
        Args:
            resumes: List of resume dictionaries with parsed_text
            job_description: Job description text
        
        Returns:
            Sorted list of resumes with scores
        """
        ranked_resumes = []
        
        for resume in resumes:
            scores = self._calculate_comprehensive_score(
                resume['parsed_text'],
                job_description,
                resume.get('parsed_details', {})
            )
            
            ranked_resumes.append({
                'resume_id': resume['id'],
                'filename': resume['filename'],
                'ats_score': scores['ats_score'],
                'skill_match': scores['skill_match_percent'],
                'experience_match': scores['experience_match_percent'],
                'education_match': scores['education_match_percent'],
                'final_score': scores['final_score'],
                'matched_skills': scores['matched_skills'],
                'missing_skills': scores['missing_skills']
            })
        
        # Sort by final score descending
        ranked_resumes.sort(key=lambda x: x['final_score'], reverse=True)
        
        # Add rank position
        for i, resume in enumerate(ranked_resumes, 1):
            resume['rank'] = i
        
        return ranked_resumes
    
    def _calculate_comprehensive_score(self, resume_text: str, job_desc: str, 
                                      parsed_details: Dict) -> Dict:
        """Calculate comprehensive ranking score"""
        
        resume_lower = resume_text.lower()
        jd_lower = job_desc.lower()
        
        # 1. ATS Score (0-100)
        ats_score = self._calculate_ats_score(resume_text, job_desc)
        
        # 2. Skill Match (0-100)
        skill_match = self._calculate_skill_match(resume_lower, jd_lower)
        
        # 3. Experience Match (0-100)
        experience_match = self._calculate_experience_match(resume_lower, jd_lower)
        
        # 4. Education Match (0-100)
        education_match = self._calculate_education_match(resume_lower, jd_lower)
        
        # Weighted final score
        final_score = (
            ats_score * 0.35 +          # 35% - ATS compatibility
            skill_match * 0.35 +        # 35% - Skill match
            experience_match * 0.20 +   # 20% - Experience relevance
            education_match * 0.10      # 10% - Education alignment
        )
        
        return {
            'ats_score': int(ats_score),
            'skill_match_percent': round(skill_match, 2),
            'experience_match_percent': round(experience_match, 2),
            'education_match_percent': round(education_match, 2),
            'final_score': round(final_score, 2),
            'matched_skills': self._get_matched_skills(resume_lower, jd_lower),
            'missing_skills': self._get_missing_skills(resume_lower, jd_lower)
        }
    
    def _calculate_ats_score(self, resume_text: str, job_desc: str) -> float:
        """Calculate ATS score based on keyword matching"""
        resume_words = set(re.findall(r'[a-z0-9+#]+', resume_text.lower()))
        jd_words = set(re.findall(r'[a-z0-9+#]+', job_desc.lower()))
        
        # Filter stopwords
        jd_keywords = jd_words - self.stop_words
        overlap = resume_words.intersection(jd_keywords)
        
        if not jd_keywords:
            return 50
        
        score = (len(overlap) / len(jd_keywords)) * 100
        return min(100, max(15, score))
    
    def _calculate_skill_match(self, resume_lower: str, jd_lower: str) -> float:
        """Calculate skill match percentage"""
        
        # Extract skills from JD
        jd_skills = set()
        for skill in self.common_skills:
            skill_words = skill.split()
            if len(skill_words) == 1:
                if re.search(rf'\b{re.escape(skill)}\b', jd_lower):
                    jd_skills.add(skill)
            else:
                if all(word in jd_lower for word in skill_words):
                    jd_skills.add(skill)
        
        if not jd_skills:
            return 50
        
        # Match skills in resume
        matched = 0
        for skill in jd_skills:
            skill_words = skill.split()
            if len(skill_words) == 1:
                if re.search(rf'\b{re.escape(skill)}\b', resume_lower):
                    matched += 1
            else:
                if all(word in resume_lower for word in skill_words):
                    matched += 1
        
        return (matched / len(jd_skills)) * 100
    
    def _calculate_experience_match(self, resume_lower: str, jd_lower: str) -> float:
        """Calculate experience relevance"""
        
        # Extract years of experience needed from JD
        exp_patterns = [
            r'(\d+)[\s\-]*(?:years?|yrs?)',
            r'(\d+)\+[\s]*(?:years?|yrs?)',
        ]
        
        required_exp = 0
        for pattern in exp_patterns:
            matches = re.findall(pattern, jd_lower)
            if matches:
                required_exp = max(int(m) for m in matches)
                break
        
        # Extract years in resume
        candidate_exp = 0
        for pattern in exp_patterns:
            matches = re.findall(pattern, resume_lower)
            if matches:
                candidate_exp = max(int(m) for m in matches)
                break
        
        if required_exp == 0:
            return 70  # Default if not specified
        
        # Calculate match ratio
        if candidate_exp >= required_exp:
            return 100
        elif candidate_exp >= required_exp * 0.75:
            return 85
        elif candidate_exp >= required_exp * 0.5:
            return 70
        else:
            return (candidate_exp / required_exp) * 100
    
    def _calculate_education_match(self, resume_lower: str, jd_lower: str) -> float:
        """Calculate education alignment"""
        
        education_levels = {
            'phd': 100,
            'masters': 90,
            'm.tech': 85,
            'bachelor': 80,
            'b.tech': 75,
            'diploma': 60,
            'high school': 40
        }
        
        required_level = 50  # Default
        for level, score in education_levels.items():
            if level in jd_lower:
                required_level = score
                break
        
        candidate_level = 40
        for level, score in education_levels.items():
            if level in resume_lower:
                candidate_level = score
                break
        
        if candidate_level >= required_level:
            return 100
        else:
            return (candidate_level / required_level) * 100
    
    def _get_matched_skills(self, resume_lower: str, jd_lower: str) -> List[str]:
        """Get list of matched skills"""
        matched = []
        for skill in self.common_skills:
            skill_words = skill.split()
            if len(skill_words) == 1:
                if re.search(rf'\b{re.escape(skill)}\b', jd_lower) and \
                   re.search(rf'\b{re.escape(skill)}\b', resume_lower):
                    matched.append(skill.title())
            else:
                if all(word in jd_lower for word in skill_words) and \
                   all(word in resume_lower for word in skill_words):
                    matched.append(skill.title())
        
        return matched[:15]
    
    def _get_missing_skills(self, resume_lower: str, jd_lower: str) -> List[str]:
        """Get list of skills missing from resume"""
        missing = []
        for skill in self.common_skills:
            skill_words = skill.split()
            if len(skill_words) == 1:
                if re.search(rf'\b{re.escape(skill)}\b', jd_lower) and \
                   not re.search(rf'\b{re.escape(skill)}\b', resume_lower):
                    missing.append(skill.title())
            else:
                if all(word in jd_lower for word in skill_words) and \
                   not all(word in resume_lower for word in skill_words):
                    missing.append(skill.title())
        
        return missing[:15]

# Usage in app.py
@app.route("/api/rank-resumes", methods=["POST"])
@token_required
def rank_resumes(current_user):
    """Rank multiple resumes"""
    try:
        data = request.get_json() or {}
        
        resume_ids = data.get("resume_ids", [])
        job_description = data.get("job_description", "")
        
        if not resume_ids or not job_description:
            return jsonify({"success": False, "error": "Resume IDs and job description required"}), 400
        
        # Get resumes
        resumes = database.get_resumes_by_ids(resume_ids, current_user["id"])
        
        # Rank resumes
        engine = RankingEngine()
        ranked = engine.rank_resumes(resumes, job_description)
        
        # Save ranking
        ranking_id = database.save_ranking(current_user["id"], ranked, job_description)
        
        return jsonify({
            "success": True,
            "ranking_id": ranking_id,
            "ranked_resumes": ranked
        }), 200
    
    except Exception as e:
        logger.error(f"Ranking error: {e}", exc_info=True)
        return jsonify({"success": False, "error": "Ranking failed"}), 500
```

---

## 2. ADVANCED ATS ANALYZER

```python
# backend/ats_analyzer.py
import re
from typing import Dict, List
from database import COMMON_SKILLS

class ATSAnalyzer:
    """Advanced ATS analysis engine"""
    
    ATS_SCORE_FACTORS = {
        'keyword_match': 0.30,      # 30% - Keyword matching
        'skill_match': 0.25,        # 25% - Skill matching
        'format_score': 0.15,       # 15% - Resume formatting/ATS compatibility
        'section_presence': 0.15,   # 15% - Required sections present
        'experience_relevance': 0.10, # 10% - Experience relevance
        'education_match': 0.05     # 5% - Education match
    }
    
    REQUIRED_SECTIONS = [
        'contact information',
        'experience',
        'education',
        'skills'
    ]
    
    def analyze(self, resume_text: str, job_description: str) -> Dict:
        """Perform comprehensive ATS analysis"""
        
        results = {
            'score': 0,
            'score_breakdown': {},
            'matched_skills': [],
            'missing_skills': [],
            'missing_keywords': [],
            'improvements': [],
            'parsed_details': {}
        }
        
        # Calculate individual scores
        keyword_score = self._calculate_keyword_score(resume_text, job_description)
        skill_score = self._calculate_skill_score(resume_text, job_description)
        format_score = self._calculate_format_score(resume_text)
        section_score = self._calculate_section_score(resume_text)
        exp_score = self._calculate_experience_score(resume_text, job_description)
        edu_score = self._calculate_education_score(resume_text, job_description)
        
        # Store breakdown
        results['score_breakdown'] = {
            'keyword_match': keyword_score,
            'skill_match': skill_score,
            'format_score': format_score,
            'section_presence': section_score,
            'experience_relevance': exp_score,
            'education_match': edu_score
        }
        
        # Calculate weighted final score
        final_score = (
            keyword_score * self.ATS_SCORE_FACTORS['keyword_match'] +
            skill_score * self.ATS_SCORE_FACTORS['skill_match'] +
            format_score * self.ATS_SCORE_FACTORS['format_score'] +
            section_score * self.ATS_SCORE_FACTORS['section_presence'] +
            exp_score * self.ATS_SCORE_FACTORS['experience_relevance'] +
            edu_score * self.ATS_SCORE_FACTORS['education_match']
        )
        
        results['score'] = min(100, max(15, int(final_score)))
        
        # Get skill analysis
        matched, missing = self._analyze_skills(resume_text, job_description)
        results['matched_skills'] = matched
        results['missing_skills'] = missing
        
        # Get missing keywords
        results['missing_keywords'] = self._find_missing_keywords(resume_text, job_description)
        
        # Generate improvements
        results['improvements'] = self._generate_improvements(
            resume_text, job_description, results
        )
        
        return results
    
    def _calculate_keyword_score(self, resume_text: str, job_desc: str) -> int:
        """Score based on keyword matching"""
        resume_words = set(re.findall(r'\b\w+\b', resume_text.lower()))
        jd_words = set(re.findall(r'\b\w+\b', job_desc.lower()))
        
        jd_keywords = jd_words - set(['the', 'a', 'an', 'and', 'or', 'is', 'are', 'was', 'be'])
        overlap = resume_words.intersection(jd_keywords)
        
        if not jd_keywords:
            return 50
        
        return min(100, int((len(overlap) / len(jd_keywords)) * 100))
    
    def _calculate_skill_score(self, resume_text: str, job_desc: str) -> int:
        """Score based on skill matching"""
        resume_lower = resume_text.lower()
        jd_lower = job_desc.lower()
        
        jd_skills = [s for s in COMMON_SKILLS if s.lower() in jd_lower]
        
        if not jd_skills:
            return 50
        
        matched = 0
        for skill in jd_skills:
            if skill.lower() in resume_lower:
                matched += 1
        
        return int((matched / len(jd_skills)) * 100) if jd_skills else 50
    
    def _calculate_format_score(self, resume_text: str) -> int:
        """Score resume formatting for ATS compatibility"""
        score = 50  # Base score
        
        # Check for proper sections
        if re.search(r'(experience|work history)', resume_text.lower()):
            score += 10
        
        # Check for dates
        if re.search(r'\d{1,2}/\d{1,2}/\d{4}|\d{4}', resume_text):
            score += 10
        
        # Check for bullet points
        if '•' in resume_text or '\n-' in resume_text:
            score += 10
        
        # Check for contact info
        if re.search(r'[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}', resume_text.lower()):
            score += 10
        
        # Check for no excessive special characters (bad for ATS)
        special_chars = len(re.findall(r'[^\w\s\-\+#@.]', resume_text))
        if special_chars < 10:
            score += 10
        
        return min(100, score)
    
    def _calculate_section_score(self, resume_text: str) -> int:
        """Score based on presence of required sections"""
        resume_lower = resume_text.lower()
        score = 0
        
        for section in self.REQUIRED_SECTIONS:
            if section in resume_lower:
                score += 25
        
        return score
    
    def _calculate_experience_score(self, resume_text: str, job_desc: str) -> int:
        """Score experience relevance"""
        # Check for relevant job titles
        relevant_titles = ['developer', 'engineer', 'analyst', 'manager', 'specialist']
        resume_lower = resume_text.lower()
        jd_lower = job_desc.lower()
        
        score = 50
        for title in relevant_titles:
            if title in jd_lower and title in resume_lower:
                score += 10
                break
        
        return min(100, score)
    
    def _calculate_education_score(self, resume_text: str, job_desc: str) -> int:
        """Score education match"""
        resume_lower = resume_text.lower()
        jd_lower = job_desc.lower()
        
        edu_keywords = ['bachelor', 'master', 'phd', 'degree', 'diploma']
        score = 50
        
        for keyword in edu_keywords:
            if keyword in jd_lower and keyword in resume_lower:
                score += 10
                break
        
        return min(100, score)
    
    def _analyze_skills(self, resume_text: str, job_desc: str) -> tuple:
        """Analyze skill matching"""
        resume_lower = resume_text.lower()
        jd_lower = job_desc.lower()
        
        matched_skills = []
        missing_skills = []
        
        for skill in COMMON_SKILLS:
            skill_lower = skill.lower()
            if skill_lower in jd_lower:
                if skill_lower in resume_lower:
                    matched_skills.append(skill.title())
                else:
                    missing_skills.append(skill.title())
        
        return matched_skills[:15], missing_skills[:15]
    
    def _find_missing_keywords(self, resume_text: str, job_desc: str) -> List[str]:
        """Find important keywords missing from resume"""
        resume_words = set(re.findall(r'\b\w+\b', resume_text.lower()))
        jd_words = set(re.findall(r'\b\w+\b', job_desc.lower()))
        
        stopwords = set(['the', 'a', 'an', 'and', 'or', 'is', 'are', 'was'])
        important_jd_words = jd_words - stopwords
        missing = list(important_jd_words - resume_words)
        
        return sorted(missing, key=len, reverse=True)[:10]
    
    def _generate_improvements(self, resume_text: str, job_desc: str, 
                              analysis: Dict) -> List[str]:
        """Generate actionable improvement suggestions"""
        improvements = []
        
        # If score is low, suggest adding missing keywords
        if analysis['score'] < 70:
            if analysis['missing_skills']:
                improvements.append(f"Add missing skills: {', '.join(analysis['missing_skills'][:5])}")
            
            if analysis['missing_keywords']:
                improvements.append(f"Include keywords: {', '.join(analysis['missing_keywords'][:5])}")
        
        # Check for weak action verbs
        weak_verbs = ['helped', 'responsible for', 'worked on', 'made']
        for weak in weak_verbs:
            if weak.lower() in resume_text.lower():
                improvements.append(f"Replace '{weak}' with stronger action verbs like 'orchestrated', 'spearheaded'")
                break
        
        # Check for quantifiable metrics
        if not re.search(r'\d+\s*%|\$\d+|increased\s+by', resume_text):
            improvements.append("Add quantifiable metrics and results (e.g., '30% improvement', '$100K savings')")
        
        # Check for required sections
        for section in self.REQUIRED_SECTIONS:
            if section.lower() not in resume_text.lower():
                improvements.append(f"Add '{section.title()}' section")
        
        return improvements[:5]
```

---

## 3. PDF REPORT GENERATOR

```python
# backend/report_generator.py
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
from reportlab.lib import colors
from datetime import datetime
import os

class ReportGenerator:
    """Generate professional PDF reports"""
    
    def __init__(self, output_dir='reports'):
        self.output_dir = output_dir
        os.makedirs(output_dir, exist_ok=True)
    
    def generate_ats_report(self, analysis: Dict) -> str:
        """Generate ATS analysis PDF report"""
        
        filename = f"ats_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        filepath = os.path.join(self.output_dir, filename)
        
        doc = SimpleDocTemplate(filepath, pagesize=letter)
        styles = getSampleStyleSheet()
        story = []
        
        # Title
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#2563eb'),
            spaceAfter=30,
            alignment=1  # Center
        )
        story.append(Paragraph("ATS Resume Analysis Report", title_style))
        story.append(Spacer(1, 0.3*inch))
        
        # Score Card
        score_data = [
            ['Metric', 'Score', 'Status'],
            ['Overall ATS Score', f"{analysis['score']}/100", self._get_status(analysis['score'])],
            ['Keyword Match', f"{analysis['score_breakdown'].get('keyword_match', 0)}/100", '✓'],
            ['Skill Match', f"{analysis['score_breakdown'].get('skill_match', 0)}/100", '✓'],
        ]
        
        score_table = Table(score_data, colWidths=[2*inch, 2*inch, 2*inch])
        score_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2563eb')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 14),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        story.append(score_table)
        story.append(Spacer(1, 0.3*inch))
        
        # Matched Skills
        story.append(Paragraph("Matched Skills", styles['Heading2']))
        matched_text = ', '.join(analysis.get('matched_skills', []))
        story.append(Paragraph(matched_text or "None", styles['Normal']))
        story.append(Spacer(1, 0.2*inch))
        
        # Missing Skills
        story.append(Paragraph("Missing Skills", styles['Heading2']))
        missing_text = ', '.join(analysis.get('missing_skills', []))
        story.append(Paragraph(missing_text or "None", styles['Normal']))
        story.append(Spacer(1, 0.2*inch))
        
        # Improvements
        story.append(Paragraph("Recommended Improvements", styles['Heading2']))
        for improvement in analysis.get('improvements', []):
            story.append(Paragraph(f"• {improvement}", styles['Normal']))
        
        # Build PDF
        doc.build(story)
        return filepath
    
    def _get_status(self, score: int) -> str:
        """Get status based on score"""
        if score >= 80:
            return "✓ Excellent"
        elif score >= 60:
            return "~ Good"
        elif score >= 40:
            return "! Fair"
        else:
            return "✗ Poor"
```

---

This implementation provides enterprise-grade ranking and analysis capabilities ready for production deployment.
