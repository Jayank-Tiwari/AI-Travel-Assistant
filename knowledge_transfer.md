# Knowledge Transfer (KT) Document

Welcome to the AI-Assisted Travel Platform exercise project! This document is designed to help you understand the architecture, logic, and reasoning behind the project so you can easily present it, discuss it during your debrief, or extend it in the future.

## 1. Project Goal
The objective is to take a free-text travel request, match it with a mock supplier catalog (`sample_data.json`), and use an LLM (Large Language Model) to generate a priced, day-by-day itinerary. Most importantly, the AI must NOT hallucinate (invent) hotels or prices.

## 2. File Overview
- **`sample_data.json`**: This is your "database". It holds the hotels, activities, and transport options. It also holds the user profile (their past feedback) and the three test requests. 
- **`main.py`**: The main Python script. It loads the JSON data, constructs a prompt, and handles the LLM generation (or mocked generation).
- **`outputs.md`**: Pre-generated examples of what the script outputs for the three requests.
- **`writeup.md`**: Your strategic "Part B" document. It answers the deeper architecture, business, and production-level questions the prompt asked for.

## 3. How the Code Works (Step-by-Step)
1. **Loading Data**: `main.py` reads `sample_data.json` into a Python dictionary.
2. **Environment Check**: It checks if you have a `GEMINI_API_KEY` set as an environment variable. 
   - *Why?* To make it easy to run on any machine. If you have the key, it does a real AI call. If not, it falls back to a "mock" function (`generate_itinerary_mock`) that just prints a hardcoded response so you can still demonstrate the logic without an API key.
3. **Prompt Construction**: If using the real LLM, it creates a massive string (the "prompt"). This string contains:
   - Your persona ("You are an AI travel agent...")
   - The user's past feedback (so it knows to avoid tiring activities).
   - The ENTIRE catalog (so it has the exact prices and IDs).
   - Strict rules (CITE YOUR SOURCES, DO NOT INVENT).
4. **Execution**: The LLM reads the prompt, figures out what fits, and returns a markdown string.

## 4. Key Concepts to Understand for the Debrief

### Grounding
**What is it?** Ensuring the AI only speaks truth based on the data you provided.
**How we did it?** We forced the AI to output Catalog IDs (like `[HOT-001]`). In a real company, if the AI outputs an ID that doesn't exist in the database, the system can automatically block the response. This is a very robust way to stop hallucinations.

### Handling the "Goa" Request (REQ-3)
**What happens?** The prompt explicitly tells the AI to check if the location exists in the catalog. Since Goa isn't in `sample_data.json`, the AI gracefully says "Sorry, we don't have inventory for Goa."
**Why does this matter?** LLMs are designed to please the user. If you ask an unconstrained LLM for a trip to Goa, it will happily invent a fake hotel and a fake price. We proved we can restrain it.

### Cost & Latency Strategy
If you run this in production with thousands of users, shoving the entire global catalog into the prompt is too slow and expensive (you pay per word/token).
**The solution**: You filter the database *before* calling the LLM. If they ask for Kerala, you run an SQL query for Kerala items, and ONLY pass those into the prompt. 

### Human-in-the-Loop
The company stressed that AI should never auto-confirm bookings. 
**Our stance**: The AI generates a draft. It outputs markdown (or JSON in a real app). This data populates a dashboard. A human agent reviews it, clicks "Approve", and *then* the customer sees it.

## 5. How to present this
When you push this to GitHub and submit it:
1. Emphasize that you focused on **Grounding**. Show them how the IDs map perfectly to the JSON.
2. Explain the dual-mode of the Python script (Mock vs Real API) as a thoughtful developer experience choice.
3. Point to the `writeup.md` as proof of your product sense—you aren't just coding a script, you're thinking about how this scales as a real product.
