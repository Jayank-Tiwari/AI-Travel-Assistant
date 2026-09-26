# Part B - Write-up

## Architecture
The system employs a straightforward prompt-based generation architecture. The process follows a Retrieval-Augmented Generation (RAG) pattern, though currently using in-memory data for simplicity. 
1. **Retrieval**: When a request comes in, the relevant catalog items and user profile are injected directly into the LLM prompt. In a production scenario, this step would involve vector search or metadata filtering (e.g. searching a database for `location == 'Kerala'`) to keep context windows small.
2. **LLM**: The LLM acts as the decision engine. It takes the retrieved, constrained subset of items and maps them against the user's free-text request and past feedback.
3. **Grounding**: The LLM is strictly instructed to only use items provided in the prompt context. 

## Grounding
Grounding is achieved through strict prompt engineering and data injection:
- The prompt explicitly lists the available catalog.
- The instructions strictly forbid inventing items or locations not present in the catalog.
- **Citation requirement**: Every item must be cited with its unique catalog ID (e.g., `[HOT-001]`). This citation forces the LLM to cross-reference its generated text with the provided context. In a production environment, this citation mechanism makes it trivial for a post-processing script to programmatically verify that all IDs in the output exist in the database.

## Cost & Latency
To keep the system cheap and fast in production:
1. **Model Choice**: Use a fast, cost-effective model (like Gemini Flash, Claude Haiku, or GPT-4o-mini) for the core parsing and basic matching. A more complex model is only needed if reasoning over very long, nuanced traveler profiles.
2. **Context Budgeting (Token Management)**: Rather than passing the entire global catalog into the prompt, a pre-retrieval step (e.g. Elasticsearch or Postgres) should filter inventory by the destination mentioned in the request. If the user asks for "Kerala", only Kerala items go into the context window.
3. **Streaming**: LLM responses should stream directly back to the human agent's UI, reducing perceived latency. 
4. **Caching**: Common requests (e.g. "3 days in Paris budget") could be semantically cached using a tool like Redis to serve instant responses.

## Failure Handling
Production systems face rate limits, network timeouts, and model downtime:
- **Retries**: Implement exponential backoff for LLM API calls.
- **Graceful Degradation**: If the LLM times out or is down mid-request, surface an error to the human agent UI: "AI Assistant is currently unavailable. Please manually select inventory from the catalog."
- **Streaming Interruptions**: If streaming breaks mid-way, the UI should indicate the generation was aborted and offer a one-click "Regenerate" button.

## Evaluation
To catch hallucinations and measure quality:
1. **Automated ID Verification**: A deterministic script that parses the output for `[ID]` tags and checks if they exist in the DB, and checks if the math for the quoted price adds up perfectly.
2. **LLM-as-a-Judge**: A separate, smaller LLM pass can grade the output on specific metrics: "Did it respect the budget?", "Did it adhere to past feedback?".
3. **Business Metrics**: The most important metric is **Human Agent Acceptance Rate** (how often the human agent sends the generated itinerary to the customer without edits) and **Time-to-Quote** (how much time the AI saves the human).

## Human-in-the-Loop
The system acts solely as a drafting tool. The AI generates the itinerary, but the final output is populated into a dashboard where the human agent must click "Approve and Send". The AI has no permission to confirm bookings, send emails, or charge credit cards. The human agent can manually swap out an activity or adjust a price before sending.

## With More Time (Top 3 Additions)
1. **JSON Structured Output**: Enforce strict JSON output from the LLM (e.g., `response_format={ "type": "json_object" }`). This allows seamless rendering in a rich frontend UI rather than plain markdown.
2. **Vector/Hybrid Search**: Implement a real retrieval layer (like Pinecone or Weaviate) to handle a catalog of 100,000+ items efficiently.
3. **Evaluation Harness**: Build a CI/CD pipeline step that runs a test suite of 50 varied requests and asserts that 100% of generated IDs are valid and all prices sum up correctly.
