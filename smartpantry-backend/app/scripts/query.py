from app.supabase_client import sql_database  # Import exposed SQLDatabas
from llama_index.core.query_engine import NLSQLTableQueryEngine
from llama_index.llms.openai import OpenAI
from app.services.llama_index_service import generate_embedding
llm = OpenAI(temperature=0.1, model="gpt-3.5-turbo")

# ✅ Create an SQL Query Engine (Structured Queries)
query_engine = NLSQLTableQueryEngine(
    sql_database=sql_database, tables=["users", "pantry"], llm=llm
)

# import logging
# import sys
# from llama_index.core import set_global_handler

# # # Enable debugging
# # logging.basicConfig(stream=sys.stdout, level=logging.DEBUG)
# # set_global_handler("simple")

query_str = """
SELECT ingredient_name, quantity, unit
FROM pantry
WHERE user_id = 'fdde9b7f-1442-4c08-af35-e8cbdc60de53'::UUID;
"""
query_str = """
SELECT ingredient_name, quantity, unit
FROM pantry
WHERE user_id = 'fdde9b7f-1442-4c08-af35-e8cbdc60de53'::UUID;
"""

# ✅ Run SQL directly using SQLDatabase
response = sql_database.run_sql(query_str)
print("Query Response:", response)
# Extract the actual result from the response
result_dict = response[1]  # The second element is the dictionary
pantry_data = result_dict["result"]  # Extract pantry items

# Format pantry items into a readable string
pantry_text = ", ".join([f"{row[0]} ({row[1]} {row[2]})" for row in pantry_data])

print("User's Pantry Inventory:", pantry_text)

from app.pinecone_client import pinecone_index
from app.openai_client import openai

# ✅ Generate embeddings for the pantry text
EMBEDDING_MODEL = "text-embedding-ada-002"  # Make sure this matches Pinecone indexing
embedding_response = generate_embedding(pantry_text)

# ✅ Query Pinecone for matching recipes
query_results = pinecone_index.query(
    vector=embedding_response,
    top_k=5,  # Get the top 5 most relevant recipes
    include_metadata=True  # Retrieve recipe metadata
)

# ✅ Extract and display matched recipes
print("\n🍽️ **Suggested Recipes:**\n")
for match in query_results["matches"]:
    recipe_name = match["metadata"].get("text", "Unknown Recipe")  # Recipe title
    score = match["score"]
    print(f"✅ {recipe_name} (Relevance Score: {score:.2f})")