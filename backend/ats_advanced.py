from pdfminer.high_level import extract_text

#extract text from resume and convert to lowercase for easier skill detection

def extract_resume_text(file_path):
    text = extract_text(file_path)
    return text.lower()

#A simple skills database for demonstration purposes. In a real application, this would likely be more comprehensive and stored in a database.

SKILLS_DB = [
"python","java","c++","javascript","react","node",
"sql","mongodb","machine learning","data science",
"docker","kubernetes","aws","html","css","git"
]

#Detect skills in the resume text by checking for the presence of each skill in the SKILLS_DB. This is a simple approach and can be improved with more advanced NLP techniques.
def detect_skills(resume_text):

    skills = []

    for skill in SKILLS_DB:
        if skill in resume_text:
            skills.append(skill)

    return skills


import re

def detect_experience(resume_text):

    exp_pattern = r"\d+\s+years|\d+\+?\s+year"

    experience = re.findall(exp_pattern, resume_text)

    return experience


def detect_education(resume_text):

    degrees = ["b.tech","bachelor","m.tech","master","phd","bsc","msc"]

    found = []

    for degree in degrees:
        if degree in resume_text:
            found.append(degree)

    return found
    
def keyword_match(resume_skills, job_skills):

    matched = list(set(resume_skills) & set(job_skills))

    return matched

def resume_length_score(resume_text):

    words = resume_text.split()

    length = len(words)

    if 400 <= length <= 900:
        return 100

    if 200 <= length < 400:
        return 70

    if length > 900:
        return 60

    return 40

def calculate_ats_score(resume_skills, job_skills, resume_text):

    matched = keyword_match(resume_skills, job_skills)

    skill_score = (len(matched) / len(job_skills)) * 60 if job_skills else 0

    length_score = resume_length_score(resume_text) * 0.2

    exp = detect_experience(resume_text)
    exp_score = 20 if exp else 10

    total = skill_score + length_score + exp_score

    return round(total,2)

def generate_feedback(resume_skills, job_skills):

    missing = list(set(job_skills) - set(resume_skills))

    suggestions = []

    if missing:
        suggestions.append(
            f"Add these skills to improve ATS score: {', '.join(missing)}"
        )

    if len(resume_skills) < 5:
        suggestions.append("Add more technical skills")

    if not suggestions:
        suggestions.append("Your resume is well optimized")

    return suggestions


def run_advanced_ats(file_path, job_skills):

    text = extract_resume_text(file_path)

    resume_skills = detect_skills(text)

    experience = detect_experience(text)

    education = detect_education(text)

    score = calculate_ats_score(resume_skills, job_skills, text)

    feedback = generate_feedback(resume_skills, job_skills)

    return {

        "ats_score": score,
        "resume_skills": resume_skills,
        "experience_detected": experience,
        "education_detected": education,
        "feedback": feedback

    }