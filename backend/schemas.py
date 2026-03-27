from pydantic import BaseModel
from typing import List

class ProfileCreate(BaseModel):
    user_id: int
    cgpa: float
    github_link: str
    leetcode_count: int
    projects_count: int

class SkillAdd(BaseModel):
    user_id: int
    skill_ids: List[int]