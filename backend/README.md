# AI Chatbot Platform - Backend

FastAPI backend for the AI Chatbot Platform with API endpoints, AI/ML logic, and database management.

## Setup

1. Create a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

3. Copy `.env.example` to `.env` and fill in your API keys.

4. Initialize the database:
   ```
   python -m scripts.init_db
   ```

5. Run the development server:
   ```
   uvicorn app.main:app --reload
   ```

## Project Structure

- `app/`: Main application code
  - `main.py`: FastAPI application entry point
  - `api/`: API endpoints and schemas
  - `core/`: Core business logic
  - `database/`: Database models and operations
  - `utils/`: Utility functions

## Environment Variables

- `DATABASE_URL`: Database connection string
- `OPENAI_API_KEY`: OpenAI API key for LLM capabilities
- `PINECONE_API_KEY`: Pinecone API key for vector database
- `PINECONE_ENVIRONMENT`: Pinecone environment (e.g., "us-west1-gcp")
