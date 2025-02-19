from app.pinecone_client import index

query_engine = index.as_query_engine()
response = query_engine.query("Find a recipe with chicken and olive oil")
print(response)