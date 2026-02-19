# Support Ticket System

## Setup
1. Clone the repo
2. Create a `.env` file in the root with:
   OPENAI_API_KEY=your_key_here
3. Run: docker-compose up --build
4. Frontend: http://localhost:3000
5. Backend: http://localhost:8000

## LLM Choice
Used OpenAI's gpt-4o-mini for ticket classification...

## Design Decisions
- Django REST Framework for clean API design
- DB-level aggregation in stats endpoint using ORM annotate/Count
- Graceful LLM fallback returns general/medium defaults if API fails