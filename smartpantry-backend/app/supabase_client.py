from sqlalchemy import make_url, create_engine
from supabase import create_client
from app.config import SUPABASE_URL, SUPABASE_KEY, SUPABASE_DB_URL
from llama_index.core import SQLDatabase

# Initialize Supabase Client
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# ✅ Create SQLAlchemy engine (FOR STRUCTURED QUERIES)
sql_engine = create_engine(SUPABASE_DB_URL)  # Uses Supabase DB connection string

# ✅ Create SQLDatabase (FOR STRUCTURED QUERIES)
sql_database = SQLDatabase(sql_engine)  # 🔥 FIX: Now it's an actual database connection

# # Ensure the connection string is correctly formatted
# url = make_url(SUPABASE_DB_URL)
# # Initialize PGVectorStore for LlamaIndex
# pg_vector_store = PGVectorStore.from_params(
#     database="postgres",
#     host=url.host,
#     user="postgres",
#     password=url.password,
#     table_name="recipe_vectors",  # Table to store vectors
#     embed_dim=1536,  # Match OpenAI embedding size
#     hnsw_kwargs={
#         "hnsw_m": 16,
#         "hnsw_ef_construction": 64,
#         "hnsw_ef_search": 40,
#         "hnsw_dist_method": "vector_cosine_ops",
#     }
# )
