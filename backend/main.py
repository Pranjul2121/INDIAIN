import os
from dotenv import load_dotenv
load_dotenv(override=True)

from fastapi import FastAPI, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session
from database import SessionLocal
from schemas import ProfileCreate, SkillAdd
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
from pydantic import BaseModel, ConfigDict
from typing import List, Optional
import requests
import pdfplumber
import urllib.parse
from fastapi import File, UploadFile
from pydantic import BaseModel
from ats_advanced import extract_resume_text, detect_skills
from job_recommender import recommend_jobs
from fastapi import HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from ats_advanced import extract_resume_text, run_advanced_ats
from ai_resume_analyzer import ai_resume_review, generate_interview_questions, generate_cover_letter, tailor_resume, generate_resume_from_scratch, generate_career_roadmap
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

class CoverLetterRequest(BaseModel):
    job_description: str

class TailorRequest(BaseModel):
    job_description: str
    instructions: str = None

class RoadmapGenerateRequest(BaseModel):
    role: str
    auto_mode: bool = False

class TaskUpdateRequest(BaseModel):
    is_completed: bool

class ProfileUpdateRequest(BaseModel):
    model_config = ConfigDict(extra='allow')
    
    college: str | None = None
    experience_years: int | None = None
    preferred_role: str | None = None
    skills: str | None = None
    certifications: str | None = None
    leetcode_username: str | None = None
    github_username: str | None = None

class VerifyRequest(BaseModel):
    username: str

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
    
    if not os.path.exists(resume_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found. Please upload your resume in the Dashboard first."
        )

    text = extract_resume_text(resume_path)

    review = ai_resume_review(text)

    questions = generate_interview_questions(text)

    return {
        "ai_review": review,
        "interview_questions": questions
    }

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
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
def smart_match(data: ResumeRequest, current_user: str = Depends(get_current_user), db: Session = Depends(get_db)):

    resume_text = data.resume_text
    skills = extract_skills(resume_text)

    # Enhance logic utilizing user profile
    my_cgpa = 0.0
    profile = db.execute(text("SELECT cgpa FROM profiles WHERE user_id = :uid"), {"uid": current_user}).fetchone()
    if profile and profile[0]:
        try:
            my_cgpa = float(profile[0])
        except:
            my_cgpa = 0.0

    # 🔥 Adzuna API call
    url = f"https://api.adzuna.com/v1/api/jobs/in/search/1?app_id={APP_ID}&app_key={APP_KEY}&what=developer&where=india"

    response = requests.get(url)
    data_json = response.json()

    result = []

    for job in data_json.get("results", []):
        job_id = job.get("id")
        title = job.get("title", "")
        company = job.get("company", {}).get("display_name", "")
        location = job.get("location", {}).get("display_name", "")
        desc = job.get("description", "")
        url_redirect = job.get("redirect_url", "")

        # Dynamic mapping of missing required skills
        req_skills = set(extract_skills(title + " " + desc))
        my_skill_set = set(skills)
        missing = list(req_skills - my_skill_set)

        base_match = calculate_match(skills, title)
        # Apply missing skill penalty and profile bonuses
        if len(req_skills) > 0:
             base_match = max(0, base_match - (len(missing) * 5))
        
        if my_cgpa >= 8.0:
            base_match = min(100, base_match + 10)

        result.append({
            "id": job_id,
            "title": title,
            "company": company,
            "location": location,
            "match": base_match,
            "missing_skills": missing,
            "redirect_url": url_redirect
        })

    # Sort so best matching jobs come first
    result.sort(key=lambda x: x["match"], reverse=True)

    return {
        "skills": skills,
        "jobs": result
    }

@app.get("/market-trends")
def api_market_trends():
    terms = ["Python", "React", "Node", "Java", "AI", "Cloud"]
    trends = []
    
    import concurrent.futures
    import random
    
    def fetch_term(term):
        url = f"https://api.adzuna.com/v1/api/jobs/in/search/1?app_id={APP_ID}&app_key={APP_KEY}&what={term}&where=india"
        try:
            r = requests.get(url, timeout=4).json()
            val = r.get("count", 0)
            if val == 0: val = random.randint(200, 1500)
            return {"name": term, "value": val}
        except:
            return {"name": term, "value": random.randint(200, 1500)}

    with concurrent.futures.ThreadPoolExecutor() as executor:
        trends = list(executor.map(fetch_term, terms))
            
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "CURRENT (Live)"]
    roles = ["Frontend", "Backend", "Data Science", "DevOps"]
    
    live_roles = {}
    with concurrent.futures.ThreadPoolExecutor() as executor:
        results = list(executor.map(fetch_term, roles))
        for r in results:
            live_roles[r["name"]] = r["value"]
            
    role_trends_time_series = []
    
    for i, month in enumerate(months):
        month_data = {"name": month}
        is_current = (i == len(months) - 1)
        
        for role in roles:
            live_val = live_roles[role]
            if is_current:
                month_data[role] = live_val
            else:
                distance = len(months) - 1 - i
                multiplier = 1.0 - (distance * random.uniform(0.02, 0.08))
                month_data[role] = max(10, int(live_val * multiplier))
                
        role_trends_time_series.append(month_data)

    return {"skills": trends, "roles_time_series": role_trends_time_series, "roles": roles}

@app.post("/generate-cover-letter")
def api_generate_cover_letter(data: CoverLetterRequest, current_user: str = Depends(get_current_user)):
    resume_path = f"resumes/{current_user}_resume.pdf"
    try:
        text_content = extract_resume_text(resume_path)
    except:
        return {"cover_letter": "Please upload a resume in the Dashboard first."}
    
    result = generate_cover_letter(text_content, data.job_description)
    return {"cover_letter": result}

@app.post("/tailor-resume")
def api_tailor_resume(data: TailorRequest, current_user: str = Depends(get_current_user)):
    resume_path = f"resumes/{current_user}_resume.pdf"
    try:
         text_content = extract_resume_text(resume_path)
    except:
         return {"tailored_resume": "Please upload a resume in the Dashboard first."}
         
    result = tailor_resume(text_content, data.job_description, data.instructions)
    return {"tailored_resume": result}
import shutil
import pdfplumber

@app.post("/upload-resume")
async def upload_resume(
    file: UploadFile = File(...),
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Ensure resumes directory exists
    import os
    if not os.path.exists("resumes"):
        os.makedirs("resumes")

    file_location = f"resumes/{current_user}_resume.pdf"

    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    db.execute(
        text("INSERT INTO resumes (user_id, file_path) VALUES (:uid, :path)"),
        {"uid": current_user, "path": file_location}
    )
    db.commit()

    text_content = ""
    with pdfplumber.open(file_location) as pdf:
        for page in pdf.pages:
            text_content += page.extract_text() or ""

    return {"message": "Resume uploaded successfully", "text": text_content}

from fastapi import Form
import uuid

@app.post("/generate-resume-from-scratch")
async def api_generate_resume(
    instructions: str = Form(""),
    raw_text: str = Form(""),
    file: UploadFile = File(None),
    current_user: str = Depends(get_current_user)
):
    text_content = raw_text
    
    if file and file.filename:
        temp_path = f"resumes/temp_{current_user}_{uuid.uuid4()}.pdf"
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        try:
            with pdfplumber.open(temp_path) as pdf:
                for page in pdf.pages:
                    text_content += "\n" + (page.extract_text() or "")
        except Exception as e:
            pass
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)

    if not text_content.strip():
        return {"generated_resume": "Please provide some raw information or upload a valid PDF profile."}

    result = generate_resume_from_scratch(text_content, instructions)
    return {"generated_resume": result}

@app.post("/api/roadmap/generate")
def api_roadmap_generate(req: RoadmapGenerateRequest, current_user: str = Depends(get_current_user), db: Session = Depends(get_db)):
    base_info = None
    if req.auto_mode:
        resume_path = f"resumes/{current_user}_resume.pdf"
        try:
            base_info = extract_resume_text(resume_path)
        except:
            pass 
            
    roadmap_data = generate_career_roadmap(req.role, base_info)
    if roadmap_data is None:
        raise HTTPException(status_code=503, detail="AI Model is currently overloaded or Quota reached. Please try again in 30 seconds.")
    if not roadmap_data:
        raise HTTPException(status_code=500, detail="AI returned an empty roadmap. Please try a different role.")
        
    db.execute(text("DELETE FROM roadmap_tasks WHERE roadmap_id IN (SELECT id FROM roadmaps WHERE user_id = :uid)"), {"uid": current_user})
    db.execute(text("DELETE FROM roadmaps WHERE user_id = :uid"), {"uid": current_user})
    db.commit()
    
    import json
    new_roadmap = models.Roadmap(user_id=int(current_user), target_role=req.role)
    db.add(new_roadmap)
    db.commit()
    db.refresh(new_roadmap)
    
    for item in roadmap_data:
        new_task = models.RoadmapTask(
            roadmap_id=new_roadmap.id,
            month_number=item.get("month_number", 1),
            title=item.get("title", "Task"),
            description=item.get("description", ""),
            resources=json.dumps(item.get("resources", [])),
            is_completed=False
        )
        db.add(new_task)
    db.commit()
    
    return {"message": "Roadmap created successfully"}

@app.get("/api/roadmap")
def api_get_roadmap(current_user: str = Depends(get_current_user), db: Session = Depends(get_db)):
    roadmap = db.query(models.Roadmap).filter(models.Roadmap.user_id == int(current_user)).first()
    if not roadmap:
        return {"roadmap": None}
        
    import json
    tasks = db.query(models.RoadmapTask).filter(models.RoadmapTask.roadmap_id == roadmap.id).order_by(models.RoadmapTask.month_number).all()
    task_list = []
    for t in tasks:
        task_list.append({
            "id": t.id,
            "month_number": t.month_number,
            "title": t.title,
            "description": t.description,
            "resources": json.loads(t.resources) if t.resources else [],
            "is_completed": t.is_completed
        })
        
    return {
        "roadmap": {
            "id": roadmap.id,
            "target_role": roadmap.target_role,
            "tasks": task_list
        }
    }

@app.put("/api/roadmap/task/{task_id}")
def api_update_roadmap_task(task_id: int, req: TaskUpdateRequest, current_user: str = Depends(get_current_user), db: Session = Depends(get_db)):
    task = db.query(models.RoadmapTask).join(models.Roadmap).filter(models.RoadmapTask.id == task_id, models.Roadmap.user_id == int(current_user)).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    task.is_completed = req.is_completed
    db.commit()
    return {"status": "success"}
    
@app.get("/api/readiness")
def api_readiness(current_user: str = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        profile = db.execute(text("SELECT leetcode_count, projects_count, cgpa, is_leetcode_verified, is_github_verified FROM profiles WHERE user_id = :uid"), {"uid": current_user}).fetchone()
        
        skills_score = 0
        projects_score = 0
        github_score = 0
        dsa_score = 0
        resume_score = 0 
        
        is_lc_ver = False
        is_gh_ver = False
        
        if profile:
            leetcode, projects, cgpa, lc_ver, gh_ver = profile
            
            if lc_ver:
                is_lc_ver = True
                if leetcode:
                    dsa_score = min(int((leetcode / 100) * 100), 100)
                else:
                    dsa_score = 20
            
            if gh_ver:
                is_gh_ver = True
                if projects:
                    projects_score = min(int((projects / 10) * 100), 100)
                else:
                    projects_score = 20
                github_score = min(60 + (projects_score // 2), 100)
                
        user_skills = db.execute(text("SELECT COUNT(*) FROM user_skills WHERE user_id = :uid"), {"uid": current_user}).scalar()
        if user_skills:
            skills_score = min(int((user_skills / 15) * 100), 100)
            
        # check if resume exists to give a basic resume score
        resume = db.execute(text("SELECT id FROM resumes WHERE user_id = :uid LIMIT 1"), {"uid": current_user}).fetchone()
        if resume:
            resume_score = 80
        
        total = int(
            (skills_score * 0.30) +
            (projects_score * 0.20) +
            (github_score * 0.20) +
            (dsa_score * 0.20) +
            (resume_score * 0.10)
        )

        
        return {
            "total_score": total,
            "is_leetcode_verified": is_lc_ver,
            "is_github_verified": is_gh_ver,
            "metrics": {
                "skills": skills_score,
                "projects": projects_score,
                "github": github_score,
                "dsa": dsa_score,
                "resume": resume_score
            }
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/profile/update")
def api_update_profile(req: ProfileUpdateRequest, current_user: str = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        profile = db.query(models.Profile).filter(models.Profile.user_id == int(current_user)).first()
        if not profile:
            profile = models.Profile(user_id=int(current_user))
            db.add(profile)
            
        if req.college is not None: profile.college = req.college
        if req.experience_years is not None: profile.experience_years = req.experience_years
        if req.preferred_role is not None: profile.preferred_role = req.preferred_role
        if req.skills is not None: profile.skills = req.skills
        if req.certifications is not None: profile.certifications = req.certifications
        if req.leetcode_username is not None: profile.leetcode_username = req.leetcode_username
        if req.github_username is not None: profile.github_username = req.github_username
        
        db.commit()
        return {"status": "success"}
    except Exception as e:
        db.rollback()
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/profile/me")
def api_get_profile(current_user: str = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(models.Profile).filter(models.Profile.user_id == int(current_user)).first()
    if not profile:
        return {"profile": {}}
    return {"profile": {
        "college": profile.college,
        "experience_years": profile.experience_years,
        "preferred_role": profile.preferred_role,
        "skills": profile.skills,
        "certifications": profile.certifications,
        "leetcode_username": profile.leetcode_username,
        "github_username": profile.github_username,
        "is_leetcode_verified": profile.is_leetcode_verified,
        "is_github_verified": profile.is_github_verified,
        "leetcode_count": profile.leetcode_count,
        "projects_count": profile.projects_count
    }}

@app.post("/api/verify/leetcode")
def api_verify_leetcode(req: VerifyRequest, current_user: str = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        username = req.username.strip()
        if username.startswith('@'):
            username = username[1:]
            
        # Robust extraction
        if "leetcode.com/" in username:
            parsed = urllib.parse.urlparse(username if "://" in username else f"https://{username}")
            path_parts = parsed.path.strip("/").split("/")
            if not path_parts:
                raise HTTPException(status_code=400, detail="Invalid LeetCode URL")
            # Handle leetcode.com/u/user or leetcode.com/user
            username = path_parts[1] if path_parts[0] == "u" and len(path_parts) > 1 else path_parts[0]
        
        # Strip any query params if user just pasted username?tab=...
        username = username.split("?")[0].split("#")[0].strip()


        # Try multiple LeetCode public APIs for reliability
        total_solved = None
        
        # 1. Leetcode Stats API
        try:
            r1 = requests.get(f"https://leetcode-stats-api.herokuapp.com/{username}", timeout=10).json()
            if r1.get("status") == "success":
                total_solved = int(r1.get("totalSolved", 0))
        except:
            pass
            
        # 2. Alfa API (Fallback)
        if total_solved is None:
            try:
                r2 = requests.get(f"https://alfa-leetcode-api.onrender.com/{username}/solved", timeout=10).json()
                if "solvedProblem" in r2:
                    total_solved = int(r2.get("solvedProblem", 0))
            except:
                pass
                
        if total_solved is None:
            raise HTTPException(status_code=400, detail="Invalid LeetCode username or API unavailable.")
            
        profile = db.query(models.Profile).filter(models.Profile.user_id == int(current_user)).first()
        if not profile:
            profile = models.Profile(user_id=int(current_user))
            db.add(profile)
                
        profile.leetcode_username = username
        profile.leetcode_count = total_solved
        profile.is_leetcode_verified = True
        db.commit()
        return {"status": "success", "solved": total_solved}
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="LeetCode API error.")

@app.post("/api/verify/github")
def api_verify_github(req: VerifyRequest, current_user: str = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        username = req.username.strip()
        if username.startswith('@'):
            username = username[1:]
            
        if "github.com/" in username:
            parsed = urllib.parse.urlparse(username if "://" in username else f"https://{username}")
            path_parts = parsed.path.strip("/").split("/")
            if not path_parts:
                 raise HTTPException(status_code=400, detail="Invalid GitHub URL")
            username = path_parts[0]
            
        username = username.split("?")[0].split("#")[0].strip()
            
        r = requests.get(f"https://api.github.com/users/{username}", timeout=10)
        if r.status_code == 200:
            data = r.json()
            repos = int(data.get("public_repos", 0))
            
            profile = db.query(models.Profile).filter(models.Profile.user_id == int(current_user)).first()
            if not profile:
                profile = models.Profile(user_id=int(current_user))
                db.add(profile)
                
            profile.github_username = username
            profile.projects_count = repos
            profile.is_github_verified = True
            db.commit()
            return {"status": "success", "repos": repos}
        else:
            raise HTTPException(status_code=400, detail="Invalid GitHub username.")
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="GitHub API error.")

@app.post("/api/verify/leetcode/detach")
def api_detach_leetcode(current_user: str = Depends(get_current_user), db: Session = Depends(get_db)):
    """Remove LeetCode verification from the user's profile."""
    profile = db.query(models.Profile).filter(models.Profile.user_id == int(current_user)).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found.")
    profile.leetcode_username = None
    profile.leetcode_count = None
    profile.is_leetcode_verified = False
    db.commit()
    return {"status": "detached"}

@app.post("/api/verify/github/detach")
def api_detach_github(current_user: str = Depends(get_current_user), db: Session = Depends(get_db)):
    """Remove GitHub verification from the user's profile."""
    profile = db.query(models.Profile).filter(models.Profile.user_id == int(current_user)).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found.")
    profile.github_username = None
    profile.projects_count = None
    profile.is_github_verified = False
    db.commit()
    return {"status": "detached"}


class ChatbotRequest(BaseModel):
    message: str
    context: str = ""

@app.post("/api/chatbot")
def api_chatbot(req: ChatbotRequest):
    """Chatbot endpoint using Gemini AI to answer platform-related questions."""
    from google import genai as genai_sdk
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        return {"reply": "AI is not configured. Please set GOOGLE_API_KEY."}
    try:
        chat_client = genai_sdk.Client(api_key=api_key)
        prompt = req.context if req.context else f"You are INDIA-Bot, a helpful assistant for the INDIAIN career platform. Answer this question: {req.message}"
        response = chat_client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        return {"reply": response.text.strip()}
    except Exception as e:
        return {"reply": f"Could not generate a response. Error: {str(e)}"}

# --- NEW: AI ROLE FIT & SKILL GAP ANALYSIS ---

class SkillGapRequest(BaseModel):
    target_role: str

@app.get("/api/ai/role-fit")
def api_role_fit(current_user: str = Depends(get_current_user)):
    print(f"Role fit requested for user: {current_user}")
    resume_path = f"resumes/{current_user}_resume.pdf"
    if not os.path.exists(resume_path):
        raise HTTPException(status_code=404, detail="Please upload your resume first.")
    
    try:
        from ai_resume_analyzer import analyze_role_fit
        text = extract_resume_text(resume_path)
        result = analyze_role_fit(text)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Error: {str(e)}")

@app.post("/api/ai/skill-gap")
def api_skill_gap(req: SkillGapRequest, current_user: str = Depends(get_current_user)):
    print(f"Skill gap requested for user: {current_user}, role: {req.target_role}")
    resume_path = f"resumes/{current_user}_resume.pdf"
    resume_text = ""
    if os.path.exists(resume_path):
        resume_text = extract_resume_text(resume_path)
    
    try:
        from ai_resume_analyzer import analyze_skill_gap
        result = analyze_skill_gap(req.target_role, resume_text)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Error: {str(e)}")