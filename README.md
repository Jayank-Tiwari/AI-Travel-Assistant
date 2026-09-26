# AI-Assisted Travel Platform - Technical Exercise

This repository contains the solution for the AI-Assisted Travel Platform technical exercise.

## Overview
The system takes a traveler's free-text request, matches it against a local supplier catalog (`sample_data.json`), and generates a grounded, priced itinerary using an LLM. It carefully checks past traveler feedback and gracefully handles un-fulfillable requests.

## How to Run

### Prerequisites
1. Python 3.8+
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

### Execution

You can run this project in two modes:

**1. Backend API (Mock Mode or Real)**
First, start the FastAPI server. If you have an API key, set it before running, otherwise it will run in Mock Mode.
```bash
# On Windows
set GEMINI_API_KEY=your_api_key_here
python api.py

# On macOS/Linux
export GEMINI_API_KEY=your_api_key_here
python api.py
```

**2. React Frontend**
In a new terminal window, navigate to the `frontend` directory and start the Vite dev server:
```bash
cd frontend
npm install
npm run dev
```
Then, open your browser to `http://localhost:5173` to view the UI.

## Structure
- `main.py` - Core logic for retrieval, prompt formatting, and LLM execution.
- `sample_data.json` - Supplier catalog, traveler profile, and test requests.
- `requirements.txt` - Python dependencies.
- `outputs.md` - Generated outputs for all 3 test requests.
- `writeup.md` - Part B write-up detailing architecture, grounding, and evaluation.
- `knowledge_transfer.md` - KT document explaining the project.
