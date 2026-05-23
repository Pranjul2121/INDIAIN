import os
import json
from google import genai
from dotenv import load_dotenv

# Force load from .env file to override any setx variables remaining in the terminal session
load_dotenv(override=True)

# create client
client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))

# force usage of newest generation models
MODEL = "gemini-2.5-flash"

def clean_json(text):
    """Extracts JSON string from potential markdown blocks."""
    text = text.strip()
    if "```json" in text:
        text = text.split("```json")[1].split("```")[0].strip()
    elif "```" in text:
        text = text.split("```")[1].split("```")[0].strip()
    return text

def ai_resume_review(resume_text):
    prompt = f"""
    Analyze this resume and give professional feedback.

    Resume:
    {resume_text}

    Provide:
    1. Resume strengths
    2. Weak areas
    3. Improvements
    4. ATS optimization tips
    """
    try:
        response = client.models.generate_content(
            model=MODEL,
            contents=prompt
        )
        return response.text
    except Exception as e:
        err_str = str(e).lower()
        if "429" in err_str or "quota" in err_str:
            return "AI Quota exceeded. Please wait a few minutes or check your API limit."
        if "503" in err_str or "unavailable" in err_str:
            return "AI Model is currently overloaded (503). Please try again in a few seconds."
        return f"AI Review Error: {str(e)}"


def generate_interview_questions(resume_text):
    prompt = f"""
    Based on this resume generate 5 technical interview questions.

    Resume:
    {resume_text}
    """
    try:
        response = client.models.generate_content(
            model=MODEL,
            contents=prompt
        )
        return response.text
    except Exception as e:
        err_str = str(e).lower()
        if "429" in err_str or "quota" in err_str:
            return "Quota reached. Could not generate questions."
        if "503" in err_str or "unavailable" in err_str:
            return "AI Model overloaded. Please retry."
        return f"Interview Prep Error: {str(e)}"

def generate_cover_letter(resume_text, job_description):
    prompt = f"""
    You are an expert career coach. Write a highly tailored, professional cover letter 
    based on the following resume and job description. 
    Make it engaging and concise (max 300 words).

    My Resume:
    {resume_text}

    Target Job Description/Keywords:
    {job_description}
    """
    try:
        response = client.models.generate_content(
            model=MODEL,
            contents=prompt
        )
        return response.text
    except Exception as e:
        err_str = str(e).lower()
        if "429" in err_str or "quota" in err_str:
            return "Error: AI Quota Exceeded. Please try again later."
        if "503" in err_str or "unavailable" in err_str:
            return "Error: AI Model Overloaded. Please try again in 30 seconds."
        return f"Error generating cover letter: {str(e)}"

def tailor_resume(resume_text, job_description, instructions=None):
    prompt = f"""
    You are a professional MAANG-level resume writer. Tailor this resume for the given job.
    
    My Current Resume: {resume_text}
    Target Job Description: {job_description}
    Additional Instructions: {instructions if instructions else "Focus on technical impact and ATS optimization."}

    Output MUST be a STRICT RAW JSON string. No markdown blocks. No extra text.
    JSON Schema:
    {{
      "fullName": "...",
      "contact": {{ "email": "...", "phone": "...", "linkedin": "...", "github": "...", "location": "..." }},
      "summary": "High impact 2-3 sentence summary.",
      "experience": [ {{ "role": "...", "company": "...", "location": "...", "date": "...", "bullets": ["Action-oriented impact bullet 1", "..."] }} ],
      "education": [ {{ "degree": "...", "school": "...", "date": "...", "details": "CGPA, Honors, etc" }} ],
      "skills": {{ "languages": "...", "frameworks": "...", "tools": "...", "others": "..." }},
      "projects": [ {{ "name": "...", "tech": "...", "date": "...", "bullets": ["..."] }} ]
    }}
    Focus on quantified impact (e.g. 'Improved latency by 20%').
    """
    try:
        from google import genai
        # Gemini specific JSON formatting
        response = client.models.generate_content(
            model=MODEL, 
            contents=prompt,
            config=genai.types.GenerateContentConfig(
                response_mime_type="application/json"
            )
        )
        text = clean_json(response.text)
        json.loads(text) # Validate
        return text
    except Exception as e:
        error_msg = str(e)
        
        # LOG ERROR FOR DEBUGGING
        with open("last_ai_error.txt", "w") as f:
            f.write(error_msg)
            
        err_low = error_msg.lower()
        if "429" in err_low or "quota" in err_low:
            error_details = "DAILY_QUOTA_REACHED"
        elif "503" in err_low or "unavailable" in err_low:
            error_details = "MODEL_OVERLOADED_503"
        else:
            error_details = error_msg
            
        return json.dumps({
            "error": "AI_GENERATION_FAILED",
            "details": error_details,
            "fullName": "AI Generation Error",
            "summary": f"Could not generate tailored resume: {error_details}"
        })

def generate_resume_from_scratch(base_info, instructions):
    prompt = f"""
    You are an expert ATS-friendly Resume Writer. Generate a professional resume from this raw info.
    
    Raw Info: {base_info}
    Custom Instructions: {instructions if instructions else "No custom instructions."}

    Output MUST be a STRICT RAW JSON string. No markdown blocks.
    JSON Schema:
    {{
      "fullName": "...",
      "contact": {{ "email": "...", "phone": "...", "linkedin": "...", "github": "...", "location": "..." }},
      "summary": "...",
      "experience": [ {{ "role": "...", "company": "...", "location": "...", "date": "...", "bullets": ["..."] }} ],
      "education": [ {{ "degree": "...", "school": "...", "date": "...", "details": "..." }} ],
      "skills": {{ "languages": "...", "frameworks": "...", "tools": "...", "others": "..." }},
      "projects": [ {{ "name": "...", "tech": "...", "date": "...", "bullets": ["..."] }} ]
    }}
    Make it professional, MAANG-standard.
    """
    try:
        from google import genai
        response = client.models.generate_content(
            model=MODEL, 
            contents=prompt,
            config=genai.types.GenerateContentConfig(
                response_mime_type="application/json"
            )
        )
        text = clean_json(response.text)
        json.loads(text) # Validate
        return text
    except Exception as e:
        error_msg = str(e)
        err_low = error_msg.lower()
        if "429" in err_low or "quota" in err_low:
            error_details = "DAILY_QUOTA_REACHED"
        elif "503" in err_low or "unavailable" in err_low:
            error_details = "MODEL_OVERLOADED_503"
        else:
            error_details = error_msg
            
        return json.dumps({
            "error": "AI_GENERATION_FAILED",
            "details": error_details,
            "fullName": "AI Generation Error",
            "summary": f"Could not generate resume from scratch: {error_details}"
        })

def generate_career_roadmap(target_role, base_info=None):
    prompt = f"""
    You are an expert career coach. Your task is to generate a comprehensive, step-by-step 
    month-wise career learning roadmap for the role of '{target_role}'.
    
    {"Based on this user's current profile: " + base_info if base_info else "Assume the user is starting from basics or early intermediate."}
    
    You MUST output the roadmap STRICTLY as a raw JSON array of objects. Do NOT include any markdown blocks or formatting.
    Each object representing a month MUST follow this exact schema:
    {{
        "month_number": 1,
        "title": "Learn the Basics",
        "description": "A 2-sentence description of what to learn this month.",
        "resources": ["YouTube: FreeCodeCamp", "LeetCode: Arrays and Hashing", "Coursera: Fundamentals"]
    }}
    
    Make it 3 to 6 months long depending on complexity. Resources must be highly specific and actionable (include names of youtube channels, platforms, etc).
    """
    try:
        from google import genai
        response = client.models.generate_content(
            model=MODEL,
            contents=prompt,
            config=genai.types.GenerateContentConfig(
                response_mime_type="application/json"
            )
        )
        text = clean_json(response.text)
        return json.loads(text)
    except Exception as e:
        err_str = str(e).lower()
        print(f"Roadmap Error: {err_str}")
        # Return a structure that tells main.py it was a quota issue if possible
        # but for now, main.py expects a list. If we return None, main.py can check it.
        return None

def analyze_role_fit(base_info):
    prompt = f"""
    You are an expert Talent Scout. Analyze this user's resume/profile data and identify the top 3 job roles they are most suited for right now.
    
    User Profile: {base_info}
    
    Output MUST be a STRICT RAW JSON object.
    {{
      "best_roles": [
        {{ "role": "Fullstack Developer", "match_score": 85, "reasoning": "Strong React and Node.js projects." }},
        {{ "role": "Backend Engineer", "match_score": 70, "reasoning": "Experience with SQL and APIs." }},
        {{ "role": "Frontend Engineer", "match_score": 90, "reasoning": "Exceptional UI design skills." }}
      ],
      "overall_summary": "User is a strong candidate for web development roles."
    }}
    """
    response = client.models.generate_content(
        model=MODEL,
        contents=prompt,
        config=genai.types.GenerateContentConfig(response_mime_type="application/json")
    )
    return json.loads(clean_json(response.text))

def analyze_skill_gap(target_role, base_info):
    prompt = f"""
    You are an expert Technical Recruiter. Compare the user's current skills against the requirements for a '{target_role}'.
    
    User Current Profile: {base_info if base_info else "No resume uploaded yet."}
    Target Role: {target_role}
    
    Output MUST be a STRICT RAW JSON object.
    {{
      "target_role": "{target_role}",
      "current_skills": ["Python", "JavaScript"],
      "required_skills": ["Python", "AWS", "Docker", "Kubernetes"],
      "missing_skills": ["AWS", "Docker", "Kubernetes"],
      "action_plan": [
        "Take a course on AWS Cloud Practitioner",
        "Build a project using Docker containers",
        "Learn Kubernetes orchestration basics"
      ],
      "readiness_percentage": 40
    }}
    """
    try:
        from google import genai
        response = client.models.generate_content(
            model=MODEL,
            contents=prompt,
            config=genai.types.GenerateContentConfig(response_mime_type="application/json")
        )
        return json.loads(clean_json(response.text))
    except Exception as e:
        print(f"Skill Gap Error: {e}")
        return {"error": str(e)}