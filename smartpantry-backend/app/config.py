import os
from dotenv import load_dotenv
from llama_index.llms.openai import OpenAI

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
SUPABASE_DB_URL = os.getenv("SUPABASE_DB_URL")
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
INDEX_HOST = os.getenv("INDEX_HOST")

llm = OpenAI(temperature=0.1, model="gpt-3.5-turbo")
# ✅ Define embedding model name
EMBEDDING_MODEL = "text-embedding-ada-002"