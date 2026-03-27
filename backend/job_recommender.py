from job_roles import JOB_ROLES

def calculate_match(user_skills, role_skills):
    matched = set(user_skills) & set(role_skills)

    if not role_skills:
        return 0

    score = (len(matched) / len(role_skills)) * 100
    return round(score, 2)


def recommend_jobs(user_skills):

    results = []

    for role in JOB_ROLES:
        score = calculate_match(user_skills, role["skills"])

        results.append({
            "role": role["role"],
            "match": score
        })

    # highest match first
    results.sort(key=lambda x: x["match"], reverse=True)

    return results