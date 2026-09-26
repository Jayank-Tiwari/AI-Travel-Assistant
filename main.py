import json
import os
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env file

try:
    import google.generativeai as genai
    HAS_GENAI = True
except ImportError:
    HAS_GENAI = False

def load_data(filepath="sample_data.json"):
    with open(filepath, 'r') as f:
        return json.load(f)

def generate_itinerary_llm(request, data):
    """
    Real LLM call using Google Gemini.
    Requires GEMINI_API_KEY environment variable.
    """
    if not HAS_GENAI:
        return "Error: google-generativeai package not installed."
        
    api_key = os.environ.get("GEMINI_API_KEY")
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("gemini-1.5-pro")
    
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
    1. Check if the requested location exists in the catalog. If it does NOT exist (e.g., Goa is not in the catalog), output a graceful response saying the inventory is not available for this location. Do NOT invent items.
    2. If the location exists, create a day-by-day itinerary.
    3. Select items that match the user's request and past feedback (e.g., family-friendly, mid-range, food).
    4. Provide a priced quote for each selected item and the total cost.
    5. CITE SOURCES: Every recommended hotel, activity, or transport must explicitly cite its catalog ID (e.g., [HOT-001]).
    6. Ensure the total price equals the sum of the per-item prices (e.g. 5 nights at $100/night = $500).
    
    Format your response cleanly in Markdown. Include:
    - A summary
    - Day-by-day breakdown with item citations and costs
    - A priced quote section showing the math
    """
    
    response = model.generate_content(prompt)
    return response.text

def generate_itinerary_mock(request, data):
    """
    Mocked LLM boundary to demonstrate output without requiring an API key.
    """
    req_id = request['id']
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
    return "Unknown Request."

def main():
    data = load_data()
    api_key = os.environ.get("GEMINI_API_KEY")
    
    if api_key and HAS_GENAI:
        print("Using real Gemini LLM API...")
        llm_function = generate_itinerary_llm
    else:
        print("GEMINI_API_KEY not found or google-generativeai not installed. Using mock LLM boundary...")
        llm_function = generate_itinerary_mock

    for req in data['requests']:
        print(f"--- Processing Request: {req['id']} ---")
        print(f"Request: {req['text']}\n")
        output = llm_function(req, data)
        print("Output:\n")
        print(output)
        print("\n" + "="*50 + "\n")

if __name__ == "__main__":
    main()
