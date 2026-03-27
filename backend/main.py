import os
from fastapi import FastAPI, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session
from database import SessionLocal
from schemas import ProfileCreate, SkillAdd
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
from pydantic import BaseModel
from typing import List
import requests
import pdfplumber
from fastapi import File, UploadFile
from pydantic import BaseModel
from ats_advanced import extract_resume_text, detect_skills
from job_recommender import recommend_jobs
from fastapi import HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from ats_advanced import extract_resume_text, run_advanced_ats
from ai_resume_analyzer import ai_resume_review, generate_interview_questions
import models
import re


app = FastAPI()
APP_ID = os.getenv("YOUR_APP_ID")
APP_KEY = os.getenv("YOUR_APP_KEY")

class LoginRequest(BaseModel):
    email: str
    password: str

class ATSRequest(BaseModel):
    job_skills: List[str]

class ResumeRequest(BaseModel):
    resume_text: str

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def extract_skills(text):
    skills_list = [
        "python", "java", "javascript", "react", "node",
        "sql", "mongodb", "html", "css", "machine learning",
        "ai", "data science"
    ]

    found_skills = []

    text = text.lower()

    for skill in skills_list:
        if skill in text:
            found_skills.append(skill)

    return found_skills
def calculate_match(resume_skills, job_title):
    score = 0

    job_title = job_title.lower()

    for skill in resume_skills:
        if skill in job_title:
            score += 20  # simple scoring

    return min(score, 100)

@app.post("/signup")
def signup(name: str, email: str, password: str, db: Session = Depends(get_db)):
    user = models.User(name=name, email=email, password=password)
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"message": "User created successfully"}


@app.post("/create-profile")
def create_profile(profile: ProfileCreate, db: Session = Depends(get_db)):
    new_profile = models.Profile(
        user_id=profile.user_id,
        cgpa=profile.cgpa,
        github_link=profile.github_link,
        leetcode_count=profile.leetcode_count,
        projects_count=profile.projects_count
    )
    db.add(new_profile)
    db.commit()
    return {"message": "Profile created successfully"}


@app.post("/add-user-skills")
def add_user_skills(data: SkillAdd, db: Session = Depends(get_db)):
    for skill_id in data.skill_ids:
        db.execute(
            text("INSERT INTO user_skills (user_id, skill_id) VALUES (:uid, :sid)"),
            {"uid": data.user_id, "sid": skill_id}
        )
    db.commit()
    return {"message": "Skills added successfully"}


@app.get("/skill-match/{user_id}/{role_id}")
def skill_match(user_id: int, role_id: int, db: Session = Depends(get_db)):

    user_skills = db.execute(
        text("SELECT skill_id FROM user_skills WHERE user_id = :uid"),
        {"uid": user_id}
    ).fetchall()

    role_skills = db.execute(
        text("SELECT skill_id FROM role_skills WHERE role_id = :rid"),
        {"rid": role_id}
    ).fetchall()

    user_skill_set = set([u[0] for u in user_skills])
    role_skill_set = set([r[0] for r in role_skills])

    common_skills = user_skill_set.intersection(role_skill_set)

    if len(role_skill_set) == 0:
        return {"match_percentage": 0}

    match_percentage = (len(common_skills) / len(role_skill_set)) * 100

    return {
        "match_percentage": round(match_percentage, 2),
        "matched_skills": list(common_skills),
        "missing_skills": list(role_skill_set - user_skill_set)
    }

@app.get("/readiness-score/{user_id}/{role_id}")
def readiness_score(user_id: int, role_id: int, db: Session = Depends(get_db)):

    # --- Get Skill Match ---
    user_skills = db.execute(
        text("SELECT skill_id FROM user_skills WHERE user_id = :uid"),
        {"uid": user_id}
    ).fetchall()

    role_skills = db.execute(
        text("SELECT skill_id FROM role_skills WHERE role_id = :rid"),
        {"rid": role_id}
    ).fetchall()

    user_skill_set = set([u[0] for u in user_skills])
    role_skill_set = set([r[0] for r in role_skills])

    if len(role_skill_set) == 0:
        skill_match = 0
    else:
        skill_match = (len(user_skill_set.intersection(role_skill_set)) / len(role_skill_set)) * 100 

    # --- Get Profile Data ---
    profile = db.execute(
        text("SELECT leetcode_count, projects_count, cgpa FROM profiles WHERE user_id = :uid"),
        {"uid": user_id}
    ).fetchone()

    if not profile:
        return {"error": "Profile not found"}

    user_dsa, user_projects, user_cgpa = profile
    user_cgpa = float(user_cgpa)

    role_data = db.execute(
        text("SELECT required_dsa_count, required_projects FROM roles WHERE id = :rid"),
        {"rid": role_id}
    ).fetchone()

    required_dsa, required_projects = role_data

    # --- Calculate DSA Score ---
    dsa_score = min((user_dsa / required_dsa) * 100, 100) if required_dsa > 0 else 0

    # --- Calculate Project Score ---
    project_score = min((user_projects / required_projects) * 100, 100) if required_projects > 0 else 0

    # --- CGPA Score (Assume out of 10) ---
    cgpa_score = (user_cgpa / 10) * 100

    # --- Final Weighted Score ---
    final_score = (
        skill_match * 0.40 + 
        dsa_score * 0.25 +
        project_score * 0.20 +
        cgpa_score * 0.15
    )

    return {
        "skill_match": round(skill_match, 2),
        "dsa_score": round(dsa_score, 2),
        "project_score": round(project_score, 2),
        "cgpa_score": round(cgpa_score, 2),
        "placement_readiness_score": round(final_score, 2)
    }

@app.get("/recommend-jobs/{user_id}")
def recommend_jobs(user_id: int, db: Session = Depends(get_db)):

    # Get user skills
    user_skills = db.execute(
        text("SELECT skill_id FROM user_skills WHERE user_id = :uid"),
        {"uid": user_id}
    ).fetchall()

    user_skill_set = set([u[0] for u in user_skills])

    # Get all jobs
    jobs = db.execute(text("SELECT id, job_title, company, salary_range FROM jobs")).fetchall()

    recommendations = []

    for job in jobs:

        job_id, title, company, salary = job

        job_skills = db.execute(
            text("SELECT skill_id FROM job_skills WHERE job_id = :jid"),
            {"jid": job_id}
        ).fetchall()

        job_skill_set = set([j[0] for j in job_skills])

        if len(job_skill_set) == 0:
            continue

        common = user_skill_set.intersection(job_skill_set)
        match_percentage = (len(common) / len(job_skill_set)) * 100

        recommendations.append({
            "job_title": title,
            "company": company,
            "salary_range": salary,
            "match_percentage": round(match_percentage, 2),
            "missing_skills": list(job_skill_set - user_skill_set)
        })

    # Sort by best match
    recommendations.sort(key=lambda x: x["match_percentage"], reverse=True)

    return recommendations

@app.get("/career-roadmap/{user_id}/{target_role_id}")
def career_roadmap(user_id: int, target_role_id: int, db: Session = Depends(get_db)):

    # User skills
    user_skills = db.execute(
        text("SELECT skill_id FROM user_skills WHERE user_id = :uid"),
        {"uid": user_id}
    ).fetchall()

    user_skill_set = set([u[0] for u in user_skills])

    # Role required skills
    role_skills = db.execute(
        text("SELECT skill_id FROM role_skills WHERE role_id = :rid"),
        {"rid": target_role_id}
    ).fetchall()

    role_skill_set = set([r[0] for r in role_skills])

    missing_skills = role_skill_set - user_skill_set

    roadmap = []

    for skill in missing_skills:
        roadmap.append({
            "skill_id": skill,
            "estimated_time_weeks": 4
        })

    return {
        "current_skills": list(user_skill_set),
        "required_skills": list(role_skill_set),
        "missing_skills": list(missing_skills),
        "learning_roadmap": roadmap,
        "estimated_total_time_weeks": len(missing_skills) * 4
    }

#LOGIN & AUTH (Bonus)
SECRET_KEY = "supersecretkey123"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

@app.post("/register")
def register(name: str, email: str, password: str, db: Session = Depends(get_db)):

    hashed = hash_password(password)

    db.execute(
        text("INSERT INTO users (name, email, password) VALUES (:n, :e, :p)"),
        {"n": name, "e": email, "p": hashed}
    )
    db.commit()

    return {"message": "User registered successfully"}

@app.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):

    user = db.execute(
        text("SELECT id, email, password FROM users WHERE email = :e"),
        {"e": form_data.username}
    ).fetchone()

    if not user:
        raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid credentials"
    )

    user_id, email, hashed_password = user

    if not verify_password(form_data.password, hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

    access_token = create_access_token({"sub": str(user_id)})

    return {"access_token": access_token, "token_type": "bearer"}

def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        return user_id
    except JWTError:
        return None
    
@app.get("/protected")
def protected_route(current_user: str = Depends(get_current_user)):
    if not current_user:
        return {"error": "Not authenticated"}

    return {"message": f"Hello User {current_user}"}

#TO APPLY FOR A JOB RECOMMENEDED BY THE SYSTEM

@app.post("/apply-job/{job_id}")
def apply_job(
    job_id: int,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user:
        return {"error": "Not authenticated"}

    # Check already applied
    existing = db.execute(
        text("SELECT id FROM job_applications WHERE user_id = :uid AND job_id = :jid"),
        {"uid": current_user, "jid": job_id}
    ).fetchone()

    if existing:
        return {"message": "Already applied to this job"}

    db.execute(
        text("INSERT INTO job_applications (user_id, job_id) VALUES (:uid, :jid)"),
        {"uid": current_user, "jid": job_id}
    )
    db.commit()

    return {"message": "Applied successfully"}


#to see user applications and their status (applied, in review, rejected, accepted) 

@app.get("/my-applications")
def my_applications(
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user:
        return {"error": "Not authenticated"}

    apps = db.execute(
        text("""
            SELECT j.job_title, j.company, ja.status, ja.applied_at
            FROM job_applications ja
            JOIN jobs j ON ja.job_id = j.id
            WHERE ja.user_id = :uid
        """),
        {"uid": current_user}
    ).fetchall()

    return [
        {
            "job_title": a[0],
            "company": a[1],
            "status": a[2],
            "applied_at": a[3]
        }
        for a in apps
    ]

# RESUMES KO STORE KARNE KA KAAM
from fastapi import File, UploadFile
import shutil

@app.post("/upload-resume")
def upload_resume(
    file: UploadFile = File(...),
    current_user: str = Depends(get_current_user)
):

    file_location = f"resumes/{current_user}_resume.pdf"

    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {"message": "Resume uploaded"}

#Resume database m jayega 
@app.post("/upload-resume")
def upload_resume(
    file: UploadFile = File(...),
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    file_location = f"resumes/{current_user}_{file.filename}"

    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    db.execute(
        text("INSERT INTO resumes (user_id, file_path) VALUES (:uid, :path)"),
        {"uid": current_user, "path": file_location}
    )
    db.commit()

    return {"message": "Resume uploaded successfully"}


#ADVANCED ATS CHECK

@app.post("/advanced-ats-check")
def advanced_ats_check(
    data: ATSRequest,
    current_user: str = Depends(get_current_user)
):

    job_skills = data.job_skills

    resume_path = f"resumes/{current_user}_resume.pdf"

    result = run_advanced_ats(resume_path, job_skills)

    return result

#RESUME ANALYZER
@app.get("/ai-resume-review")
def ai_review(current_user: str = Depends(get_current_user)):

    resume_path = f"resumes/{current_user}_resume.pdf"

    text = extract_resume_text(resume_path)

    review = ai_resume_review(text)

    questions = generate_interview_questions(text)

    return {
        "ai_review": review,
        "interview_questions": questions
    }

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#AI JOB RECOMMENDER
@app.get("/recommend-jobs")
def recommend_jobs():
    url = f"https://api.adzuna.com/v1/api/jobs/in/search/1?app_id={APP_ID}&app_key={APP_KEY}&what=developer&where=india"

    response = requests.get(url)
    data = response.json()

    jobs = []

    for job in data.get("results", []):
        jobs.append({
            "title": job.get("title"),
            "company": job.get("company", {}).get("display_name"),
            "location": job.get("location", {}).get("display_name")
        })

    return {"jobs": jobs}

@app.post("/smart-job-match")
def smart_match(data: ResumeRequest):

    resume_text = data.resume_text
    skills = extract_skills(resume_text)

    # 🔥 Adzuna API call
    url = f"https://api.adzuna.com/v1/api/jobs/in/search/1?app_id={APP_ID}&app_key={APP_KEY}&what=developer&where=india"

    response = requests.get(url)
    data = response.json()

    result = []

    for job in data.get("results", []):
        title = job.get("title")
        company = job.get("company", {}).get("display_name")
        location = job.get("location", {}).get("display_name")

        match = calculate_match(skills, title)

        result.append({
            "title": title,
            "company": company,
            "location": location,
            "match": match
        })

    return {
        "skills": skills,
        "jobs": result
    }
@app.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...)):
    
    text = ""

    with pdfplumber.open(file.file) as pdf:
        for page in pdf.pages:
            text += page.extract_text() or ""

    return {"text": text}