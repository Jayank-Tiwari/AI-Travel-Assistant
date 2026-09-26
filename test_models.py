import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()
api_key = os.environ.get('GEMINI_API_KEY').strip().strip('"').strip("'")
genai.configure(api_key=api_key)

try:
    models = list(genai.list_models())
    print("AVAILABLE MODELS:")
    for m in models:
        print(f"- {m.name} (supports: {m.supported_generation_methods})")
except Exception as e:
    print(f"ERROR: {e}")
