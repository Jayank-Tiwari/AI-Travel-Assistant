import json
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()  # Load environment variables from .env file

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def load_data(filepath="sample_data.json"):
    with open(filepath, 'r') as f:
        return json.load(f)

data = load_data()

class RequestModel(BaseModel):
    id: str
    text: str

@app.get("/requests")
def get_requests():
    return data["requests"]

@app.post("/generate")
def generate_itinerary(req: RequestModel):
    api_key = os.environ.get("GEMINI_API_KEY")
    if api_key and api_key != "your_api_key_here":
        return StreamingResponse(generate_itinerary_llm_stream(req.model_dump(), data), media_type="text/plain")
    else:
        # For mock, just return it as a single chunk in a stream
        return StreamingResponse(iter([generate_itinerary_mock(req.model_dump(), data)]), media_type="text/plain")

def generate_itinerary_llm_stream(request, data):
    api_key = os.environ.get("GEMINI_API_KEY").strip().strip('"').strip("'")
    genai.configure(api_key=api_key)
    
    catalog_str = json.dumps(data['catalog'], indent=2)
    profile_str = json.dumps(data['traveler_profile'], indent=2)
    
    prompt = f"""
    You are an AI travel agent assistant. Your job is to create a grounded, priced itinerary based on the user's request.
    
    Traveler Profile and Past Feedback:
    {profile_str}
    
    Supplier Catalog (ONLY use these items, do not invent anything):
    {catalog_str}
    
    User Request:
    "{request['text']}"
    
    Instructions:
    1. Check if the requested location exists in the catalog. If it does NOT exist, output a graceful response saying inventory is not available.
    2. Create a day-by-day itinerary if the location exists.
    3. Select items matching user request and past feedback.
    4. Provide a priced quote for each selected item and total cost.
    5. CITE SOURCES: Every recommended item must explicitly cite its catalog ID (e.g., [HOT-001]).
    6. Ensure total price equals the sum of per-item prices.
    
    Format response cleanly in Markdown. Include:
    - Summary
    - Day-by-day breakdown with item citations and costs
    - A priced quote section showing math (DO NOT use LaTeX or $$ symbols, just use plain text formatting).
    """
    
    try:
        model = genai.GenerativeModel("gemini-3.5-flash")
        response = model.generate_content(prompt, stream=True)
        for chunk in response:
            yield chunk.text
    except Exception as e:
        try:
            model2 = genai.GenerativeModel("gemini-2.5-flash")
            response2 = model2.generate_content(prompt, stream=True)
            for chunk in response2:
                yield chunk.text
        except Exception as e2:
            yield f"Error generating itinerary via Gemini API: {str(e2)}"

def generate_itinerary_mock(request, data):
    req_id = request.get('id', '')
    if req_id == "REQ-1":
        return """### Kerala Family Getaway
Based on your preference for mid-range, clean hotels and your love for food and nature, here is a grounded 5-day itinerary in Kerala.

**Day 1 & 2: Arrival & Spice Tour**
- **Accommodation:** Kerala Nature Resort [HOT-001] ($100/night) - Family-friendly, nature-oriented mid-range stay.
- **Activity (Day 2):** Spice Plantation Tour [ACT-001] ($50) - Walk through aromatic plantations, great for the family.

**Day 3: Cooking & Culture**
- **Accommodation:** Kerala Nature Resort [HOT-001] ($100/night)
- **Activity (Day 3):** Traditional Cooking Class [ACT-002] ($80) - Learn to cook local cuisine, matching your food interest.

**Day 4 & 5: Relaxation & Departure**
- **Accommodation:** Kerala Nature Resort [HOT-001] ($100/night)
- **Transport:** Private Van 5 Days [TPT-001] ($200) - Comfortable family travel for the entire trip.

### Priced Quote
- **Hotel:** Kerala Nature Resort [HOT-001] (5 nights @ $100/night) = $500
- **Transport:** Private Van 5 Days [TPT-001] = $200
- **Activity:** Spice Plantation Tour [ACT-001] = $50
- **Activity:** Traditional Cooking Class [ACT-002] = $80
**Total Estimated Cost:** $830

*(Note: We skipped the Munnar Trekking [ACT-003] as past feedback indicated a preference against tiring adventure activities for the kids).*
"""
    elif req_id == "REQ-2":
        return """### Paris Budget Trip
Based on your request for a budget trip for two, here is your 3-day Paris itinerary.

**Day 1 - 3: City Exploration**
- **Accommodation:** Paris City Center Hotel [HOT-003] ($80/night) - Budget-friendly and right in the center.
- **Activity:** Eiffel Tower Visit [ACT-004] ($30) - Classic experience.
- **Transport:** Metro Pass 3 Days [TPT-002] ($25) - Budget travel.

### Priced Quote
- **Hotel:** Paris City Center Hotel [HOT-003] (3 nights @ $80/night) = $240
- **Transport:** Metro Pass 3 Days [TPT-002] = $25
- **Activity:** Eiffel Tower Visit [ACT-004] = $30
**Total Estimated Cost:** $295
"""
    elif req_id == "REQ-3":
        return """### Goa Request
I'd love to help you plan your trip to Goa! However, looking at our current verified supplier catalog, we do not currently have any inventory (hotels, activities, or transport) available for Goa.

To ensure we provide the high-quality, verified experiences we're known for, I cannot generate a quote for Goa at this time. Would you be interested in exploring our options in **Kerala** instead?
"""
    else:
        return "Custom request mock logic. In a real environment, please provide a valid GEMINI_API_KEY in the `.env` file to see actual generation."

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
