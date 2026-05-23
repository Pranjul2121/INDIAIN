from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, DateTime, Table
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True)
    password = Column(String)
    
    profiles = relationship("Profile", back_populates="user")
    applications = relationship("JobApplication", back_populates="user")

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    cgpa = Column(String)
    github_link = Column(String)
    leetcode_count = Column(Integer)
    projects_count = Column(Integer)
    
    college = Column(String, nullable=True)
    experience_years = Column(Integer, nullable=True)
    preferred_role = Column(String, nullable=True)
    leetcode_username = Column(String, nullable=True)
    github_username = Column(String, nullable=True)
    
    is_leetcode_verified = Column(Boolean, default=False)
    is_github_verified = Column(Boolean, default=False)
    
    skills = Column(String, nullable=True)
    certifications = Column(String, nullable=True)
    
    user = relationship("User", back_populates="profiles")

class Resume(Base):
    __tablename__ = "resumes"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    file_path = Column(String)
    uploaded_at = Column(DateTime, default=datetime.utcnow)

class Job(Base):
    __tablename__ = "jobs"
    id = Column(Integer, primary_key=True, index=True)
    job_title = Column(String)
    company = Column(String)
    salary_range = Column(String)
    location = Column(String, nullable=True)

class Role(Base):
    __tablename__ = "roles"
    id = Column(Integer, primary_key=True, index=True)
    role_name = Column(String)
    required_dsa_count = Column(Integer, default=0)
    required_projects = Column(Integer, default=0)

class JobApplication(Base):
    __tablename__ = "job_applications"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    job_id = Column(Integer, ForeignKey("jobs.id"))
    status = Column(String, default="Applied") # applied, in review, rejected, accepted
    applied_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="applications")

# Simple tables for many-to-many or skill relationships used via raw SQL
class UserSkill(Base):
    __tablename__ = "user_skills"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer)
    skill_id = Column(String)

class RoleSkill(Base):
    __tablename__ = "role_skills"
    id = Column(Integer, primary_key=True, index=True)
    role_id = Column(Integer)
    skill_id = Column(String)

class JobSkill(Base):
    __tablename__ = "job_skills"
    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer)
    skill_id = Column(String)

class Roadmap(Base):
    __tablename__ = "roadmaps"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    target_role = Column(String)
    
    tasks = relationship("RoadmapTask", back_populates="roadmap", cascade="all, delete-orphan")

class RoadmapTask(Base):
    __tablename__ = "roadmap_tasks"

    id = Column(Integer, primary_key=True, index=True)
    roadmap_id = Column(Integer, ForeignKey("roadmaps.id"))
    month_number = Column(Integer)
    title = Column(String)
    description = Column(String)
    resources = Column(String) # JSON string array
    is_completed = Column(Boolean, default=False)
    
    roadmap = relationship("Roadmap", back_populates="tasks")