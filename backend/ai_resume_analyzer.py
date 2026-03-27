import os
from google import genai

# create client
client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))

MODEL = "gemini-2.5-flash"

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

    response = client.models.generate_content(
        model=MODEL,
        contents=prompt
    )

    return response.text


def generate_interview_questions(resume_text):

    prompt = f"""
    Based on this resume generate 5 technical interview questions.

    Resume:
    {resume_text}
    """

    response = client.models.generate_content(
        model=MODEL,
        contents=prompt
    )

    return response.text