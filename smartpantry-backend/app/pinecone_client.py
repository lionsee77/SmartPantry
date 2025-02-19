from pinecone import Pinecone, ServerlessSpec
from app.config import PINECONE_API_KEY, INDEX_HOST
from llama_index.vector_stores.pinecone import PineconeVectorStore
from llama_index.core import StorageContext, VectorStoreIndex
from app.data.test_recipes import documents

pc = Pinecone(api_key=PINECONE_API_KEY)

# Define the index name
index_name = "recipe-index"

# Define index specification using ServerlessSpec
index_spec = {
    "dimension": 1536,  # Keep dimension at the top level
    "metric": "cosine",
    "spec": ServerlessSpec(
        cloud="aws",  # Choose "aws" or "gcp"
        region="us-east-1"  # Replace with your Pinecone region
    )
}

# Check if the index already exists
if index_name not in [index["name"] for index in pc.list_indexes()]:
    pc.create_index(name=index_name, **index_spec)  # Unpack index_spec dictionary
    print(f"Created index: {index_name}")
else:
    print(f"Index {index_name} already exists.")

pinecone_index = pc.Index("recipe-index")
vector_store = PineconeVectorStore(pinecone_index=pinecone_index)
storage_context = StorageContext.from_defaults(vector_store=vector_store)

# # Adding dummy recipe data
# if vector_store._pinecone_index.describe_index_stats().total_vector_count == 0:
#     print("Index is empty. Adding documents...")
#     index = VectorStoreIndex.from_documents(documents, storage_context=storage_context)
# else:
#     print("Index already contains vectors. Skipping document insertion.")

