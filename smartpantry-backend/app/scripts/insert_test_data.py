from app.supabase_client import supabase
import uuid
from app.config import SUPABASE_URL, SUPABASE_KEY

# Generate a test user ID
test_user_id = str(uuid.uuid4())

# 1️⃣ Insert Test User
user_data = {
    "user_id": test_user_id,
    "username": "test_user",
    "email": "test_user@example.com"
}

response = supabase.table("users").insert(user_data).execute()
print("User Insert Response:", response)

# 2️⃣ Insert Pantry Items for the User
pantry_items = [
    {
        "user_id": test_user_id,
        "ingredient_name": "Chicken Breast",
        "quantity": 2,
        "unit": "pieces",
        "expiry_date": "2025-02-20",
        "storage_location": "freezer"
    },
    {
        "user_id": test_user_id,
        "ingredient_name": "Lettuce",
        "quantity": 1,
        "unit": "head",
        "expiry_date": "2025-02-15",
        "storage_location": "fridge"
    },
    {
        "user_id": test_user_id,
        "ingredient_name": "Olive Oil",
        "quantity": 500,
        "unit": "ml",
        "expiry_date": "2026-01-01",
        "storage_location": "pantry"
    },
    {
        "user_id": test_user_id,
        "ingredient_name": "Garlic",
        "quantity": 3,
        "unit": "cloves",
        "expiry_date": "2025-02-25",
        "storage_location": "pantry"
    },
]

response = supabase.table("pantry").insert(pantry_items).execute()
print("Pantry Insert Response:", response)