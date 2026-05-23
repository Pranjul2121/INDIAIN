from database import engine
from sqlalchemy import text

queries = [
    "ALTER TABLE profiles ADD COLUMN college VARCHAR",
    "ALTER TABLE profiles ADD COLUMN experience_years INTEGER",
    "ALTER TABLE profiles ADD COLUMN preferred_role VARCHAR",
    "ALTER TABLE profiles ADD COLUMN leetcode_username VARCHAR",
    "ALTER TABLE profiles ADD COLUMN github_username VARCHAR",
    "ALTER TABLE profiles ADD COLUMN is_leetcode_verified BOOLEAN DEFAULT FALSE",
    "ALTER TABLE profiles ADD COLUMN is_github_verified BOOLEAN DEFAULT FALSE",
    "ALTER TABLE profiles ADD COLUMN skills VARCHAR",
    "ALTER TABLE profiles ADD COLUMN certifications VARCHAR"
]

with engine.begin() as conn:
    for q in queries:
        try:
            conn.execute(text(q))
            print(f"Executed: {q}")
        except Exception as e:
            print(f"Skipped (likely exists): {q}")
