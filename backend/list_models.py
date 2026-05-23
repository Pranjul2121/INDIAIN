import os
from google import genai
from dotenv import load_dotenv

load_dotenv()

client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))

try:
    print("Available models:")
    for model in client.models.list():
        print(f"Name: {model.name}")
except Exception as e:
    print(f"Error: {e}")
