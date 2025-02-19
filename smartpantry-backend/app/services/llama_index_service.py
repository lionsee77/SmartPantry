
import datetime
from typing import Dict, List
from app.supabase_client import sql_database, supabase
from app.openai_client import openai
from app.pinecone_client import pinecone_index
from app.config import llm
from llama_index.core.llms import ChatMessage
from pydantic import BaseModel


def get_user_preferences_service(user_id: str):
    query=f"""
        SELECT *
        FROM user_preferences
        WHERE user_id = '{user_id}'::UUID;    
    """

    response = sql_database.run_sql(query)
    result_dict = response[1]  # Extract dictionary response
    preference_data = result_dict["result"]  # Pantry items
    return preference_data[0]

def get_user_recipes_service(user_id: str):
    """Generate meal suggestions based on user's pantry"""

    # Retrieve Pantry Data
    pantry_response = get_user_pantry_service(user_id)
    if "pantry" not in pantry_response or not pantry_response["pantry"]:
        return {"user_id": user_id, "suggested_recipes": []}

    # Convert pantry data into text format
    pantry_text = ", ".join([f"{item['ingredient']} ({item['quantity']} {item['unit']})" for item in pantry_response["pantry"]])

    # Generate pantry embedding
    embedding_response = generate_embedding(pantry_text)

    # Query Pinecone for similar recipes
    query_results = pinecone_index.query(
        vector=embedding_response,
        top_k=9,  # Get top 5 matching recipes
        include_metadata=True
    )

    # ✅ Retrieve user allergies
    user_allergies = get_user_preferences_service(user_id)[1]  # List of allergic ingredients

    # ✅ Filter out recipes containing allergens
    filtered_recipes = []
    for match in query_results["matches"]:
        recipe_metadata = match["metadata"]
        recipe_name = recipe_metadata.get("name", "Unknown Recipe")
        ingredients = recipe_metadata.get("ingredients", [])  # Ingredients list from metadata
        instructions = recipe_metadata.get("instructions")
        image_url = recipe_metadata.get("image_url")

        # Check if any allergy is present in the recipe's ingredients
        if not any(allergen.lower() in [ingredient.lower() for ingredient in ingredients] for allergen in user_allergies):
            filtered_recipes.append({"recipe_name": recipe_name, "score": match["score"], "ingredients": ingredients, "instructions": instructions, "image_url": image_url})

    # ✅ Return the top 5 filtered recipes
    return {"user_id": user_id, "suggested_recipes": filtered_recipes[:9]}

def get_user_pantry_service(user_id: str):
    """Fetch pantry inventory from Supabase for a given user"""
    query = f"""
    SELECT ingredient_name, quantity, unit
    FROM pantry
    WHERE user_id = '{user_id}'::UUID;
    """

    response = sql_database.run_sql(query)
    result_dict = response[1]  # Extract dictionary response
    pantry_data = result_dict["result"]  # Pantry items

    # Format pantry items into a structured list
    pantry_items = [{"ingredient": row[0], "quantity": row[1], "unit": row[2]} for row in pantry_data]

    return {"user_id": user_id, "pantry": pantry_items}

def generate_embedding(text: str):
    """Generate a text embedding using OpenAI's text-embedding-ada-002 model."""
    response = openai.embeddings.create(
        input=text,
        model="text-embedding-ada-002"
    )
    return response.data[0].embedding


# ✅ Define structured JSON format
class MealPlanDay(BaseModel):
    """A structured meal plan for a single day."""
    day: int
    meals: Dict[str, str]  # Keys: "breakfast", "lunch", "dinner"

class MealPlan(BaseModel):
    """A structured 7-day meal plan."""
    user_id: str
    days: List[MealPlanDay]

def generate_meal_plan_service(user_id: str):
    # Get Data
    preferences = get_user_preferences_service(user_id)
    recipes = get_user_recipes_service(user_id)

    if "error" in recipes:
        return recipes  # No pantry data

    # Structure Input for LLM
    input_data = {
        "diet": preferences[3],
        "effort_level": preferences[6],
        "dislikes": preferences[2],
        "favorite_cuisines": preferences[4],
        "preferred_meal_types": preferences[5],
        "recipes": recipes
    }

    json_format = """
{
    "user_id": "USER_ID_PLACEHOLDER",
    "days": [
        {
            "day": 1,
            "meals": {
                "breakfast": {
                    "name": "Meal Name",
                    "ingredients": ["Ingredient 1", "Ingredient 2"],
                    "instructions": "Step 1. Do this. Step 2. Do that.",
                    "image_url": "https://example.com/breakfast.jpg"
                },
                "lunch": {
                    "name": "Meal Name",
                    "ingredients": ["Ingredient 1", "Ingredient 2"],
                    "instructions": "Step 1. Do this. Step 2. Do that.",
                    "image_url": "https://example.com/lunch.jpg"
                },
                "dinner": {
                    "name": "Meal Name",
                    "ingredients": ["Ingredient 1", "Ingredient 2"],
                    "instructions": "Step 1. Do this. Step 2. Do that.",
                    "image_url": "https://example.com/dinner.jpg"
                }
            }
        },
        {
            "day": 2,
            "meals": {
                "breakfast": {
                    "name": "Meal Name",
                    "ingredients": ["Ingredient 1", "Ingredient 2"],
                    "instructions": "Step 1. Do this. Step 2. Do that.",
                    "image_url": "https://example.com/breakfast.jpg"
                },
                "lunch": {
                    "name": "Meal Name",
                    "ingredients": ["Ingredient 1", "Ingredient 2"],
                    "instructions": "Step 1. Do this. Step 2. Do that.",
                    "image_url": "https://example.com/lunch.jpg"
                },
                "dinner": {
                    "name": "Meal Name",
                    "ingredients": ["Ingredient 1", "Ingredient 2"],
                    "instructions": "Step 1. Do this. Step 2. Do that.",
                    "image_url": "https://example.com/dinner.jpg"
                }
            }
        },
        {
            "day": 3,
            "meals": {
                "breakfast": {
                    "name": "Meal Name",
                    "ingredients": ["Ingredient 1", "Ingredient 2"],
                    "instructions": "Step 1. Do this. Step 2. Do that.",
                    "image_url": "https://example.com/breakfast.jpg"
                },
                "lunch": {
                    "name": "Meal Name",
                    "ingredients": ["Ingredient 1", "Ingredient 2"],
                    "instructions": "Step 1. Do this. Step 2. Do that.",
                    "image_url": "https://example.com/lunch.jpg"
                },
                "dinner": {
                    "name": "Meal Name",
                    "ingredients": ["Ingredient 1", "Ingredient 2"],
                    "instructions": "Step 1. Do this. Step 2. Do that.",
                    "image_url": "https://example.com/dinner.jpg"
                }
            }
        }
    ]
}

"""
    content = f"""
            User Preferences:
            - Diet: {input_data["diet"]}
            - Effort Level: {input_data["effort_level"]}
            - Dislikes: {", ".join(input_data["dislikes"])}
            - Preferred Meal Types: {", ".join(input_data["preferred_meal_types"])}

            Suggested Recipes:
            {recipes}
            
            Ensure the output is **valid JSON**, and the meal names should align with the provided **Suggested Recipes**.
            """    

    # Construct Chat Messages for LLM
    messages = [
        ChatMessage(
            role="system",
            content="You are a nutritionist generating meal plans in the exact JSON format provided."
        ),
        ChatMessage(
            role="user",
            content=content + json_format
        )
    ]

    # Use OpenAI to Generate Meal Plan
    meal_plan_response = llm.chat(messages)
    if (is_valid_json(meal_plan_response.message.content)):
        print("Output: " + meal_plan_response.message.content)
        return meal_plan_response.message.content
    return "Error"

import json

def is_valid_json(data):
    """Check if the given data is a valid JSON string or Python dict."""
    if isinstance(data, dict):
        return True  # Already a valid JSON object
    try:
        json.loads(data)  # Try parsing the string
        return True
    except json.JSONDecodeError:
        return False

from collections import Counter

def get_grocery_list_service(user_id: str):
    """Match recipes with user inventory and determine missing ingredients."""
    
    # Step 1: Retrieve user pantry
    user_inventory = get_user_pantry_service(user_id)["pantry"]
    user_ingredients = {item["ingredient"].lower() for item in user_inventory}  # Normalize ingredient names

    # Step 2: Get top-K recipes from Pinecone
    recipes = get_user_recipes_service(user_id)["suggested_recipes"]

    # Step 3: Compare user inventory with recipe ingredients
    fully_makable_recipes = []
    recipes_with_missing_ingredients = []
    missing_ingredients_counter = Counter()

    for recipe in recipes:
        recipe_name = recipe["recipe_name"]
        recipe_ingredients = {ingredient.lower() for ingredient in recipe["ingredients"]}  # Normalize names
        
        # Find missing ingredients
        missing_ingredients = recipe_ingredients - user_ingredients

        if not missing_ingredients:
            fully_makable_recipes.append(recipe_name)  # ✅ User can fully make this recipe
        else:
            recipes_with_missing_ingredients.append({
                "recipe_name": recipe_name,
                "missing_ingredients": list(missing_ingredients)  # Convert set to list
            })
            
            # Count how many times each ingredient is missing
            missing_ingredients_counter.update(missing_ingredients)

    # Step 4: Generate consolidated grocery list
    grocery_list = sorted(
        [{"ingredient": ingredient, "count": count} for ingredient, count in missing_ingredients_counter.items()],
        key=lambda x: x["count"],
        reverse=True  # Sort by most frequently missing ingredient
    )

    # Step 5: Return structured result
    return {
        "user_id": user_id,
        "fully_makable_recipes": fully_makable_recipes,
        "recipes_with_missing_ingredients": recipes_with_missing_ingredients,
        "consolidated_grocery_list": grocery_list
    }

def get_pantry_ingredients(user_id):
    """Extracts available ingredient names from the user's pantry."""
    pantry_response = get_user_pantry_service(user_id)

    if "pantry" not in pantry_response:
        return set()  # Return empty set if no pantry data

    return {item["ingredient"].lower() for item in pantry_response["pantry"]}

def get_recipe_ingredients(user_id):
    """Extracts recipe ingredient lists for comparison."""
    recipes_response = get_user_recipes_service(user_id)

    if "suggested_recipes" not in recipes_response:
        return []  # Return empty list if no recipes found

    return [
        {"recipe_name": recipe["recipe_name"], "ingredients": set(map(str.lower, recipe["ingredients"]))}
        for recipe in recipes_response["suggested_recipes"]
    ]

def compare_pantry_and_recipes(user_id):
    """Compares user's pantry with suggested recipes and returns matching & missing ingredients."""
    pantry_ingredients = get_pantry_ingredients(user_id)  # Pantry as set
    recipes = get_recipe_ingredients(user_id)  # List of recipes with ingredients

    recipe_comparisons = []

    for recipe in recipes:
        available = recipe["ingredients"] & pantry_ingredients  # ✅ Ingredients user has
        missing = recipe["ingredients"] - pantry_ingredients  # ❌ Ingredients user lacks

        recipe_comparisons.append({
            "recipe_name": recipe["recipe_name"],
            "available_ingredients": list(available),
            "missing_ingredients": list(missing),
            "can_make": len(missing) == 0  # ✅ Fully makeable if nothing is missing
        })

    return recipe_comparisons

import httpx
from fastapi import UploadFile
import aiofiles

EXTERNAL_RECEIPT_API = "https://c8wgwo8w0c8swww08oo088kg.deploy.jensenhshoots.com/parse-receipt/"

async def parse_receipt_image(file: UploadFile):
    """Send the receipt image to the external API and return parsed data."""

    try:
        # Read the file contents
        content = await file.read()  # ✅ Ensure content is read before making request
        files = {"file": (file.filename, content, file.content_type)}

        # Send the request asynchronously
        async with httpx.AsyncClient(timeout=60) as client:  # ✅ Increase timeout
            response = await client.post(EXTERNAL_RECEIPT_API, files=files)

        # ✅ Ensure response is returned as JSON
        response.raise_for_status()  # Raises error if status is 4xx or 5xx
        return response.json()  # ✅ Extract and return JSON data

    except httpx.HTTPStatusError as e:
        return {"error": f"HTTP error: {e.response.status_code} - {e.response.text}"}
    except httpx.TimeoutException:
        return {"error": "Request to receipt parser API timed out"}
    except Exception as e:
        return {"error": f"Unexpected error: {str(e)}"}

    except Exception as e:
        return {"error": f"Unexpected error: {str(e)}"}
    
async def parse_receipt_service(file: UploadFile, user_id: str):
    """Parse receipt image and transform into pantry ingredient data."""

    # ✅ Step 1: Parse the Receipt Image
    result = await parse_receipt_image(file)  # Ensure this function correctly extracts receipt details
    if "error" in result:
        return {"error": result["error"]}
    
    receipt_data = result.get("receipt_data", {})  # ✅ Get "receipt_data" dictionary

    # ✅ Step 2: Extract relevant data
    store_name = receipt_data.get("store_name", "Unknown Store")  # ✅ Corrected
    items = receipt_data.get("line_items", [])  # ✅ Corrected

    if not user_id:
        return {"error": "User ID is required"}

    # ✅ Step 3: Transform receipt items into pantry ingredients
    pantry_items = []
    for item in items:
        item_name = item.get("item_name", "").strip()
        item_quantity = float(item.get("item_quantity", "1"))  # Default to 1 if missing

        if not item_name:
            continue  # Skip empty items

        pantry_items.append({
            "user_id": user_id,
            "ingredient_name": item_name,  # Store as ingredient
            "quantity": item_quantity,
            "unit": "unit",  # Default unit
            "expiry_date": None,  # No expiry data from receipt
            "storage_location": "Unknown",  # Default storage
            "created_at": "NOW()"  # Set current timestamp
        })

    # ✅ Step 4: Insert into Supabase
    if pantry_items:
        response = (
            supabase.table("pantry")
            .upsert(pantry_items, on_conflict="user_id,ingredient_name")
            .execute()
)
        if "error" in response:
            return {"error": response["error"]["message"]}

    # ✅ Step 5: Return structured response
    return {
        "message": "Receipt processed and pantry updated",
        "store_name": store_name,
        "pantry_items": pantry_items
    }
    
def store_user_meal_history(user_id: str, meal_plan: dict):
    """Store user's meal plan history in Supabase using Supabase client."""

    try:
        # response = (
        #     supabase.table("user_meal_history")
        #     .upsert({"user_id": user_id, "meal_plan": meal_plan})  # Convert to JSON
        #     .execute()
        # )
        # return {"status": "success"}
            # Structure data for Supabase
        data_to_upsert = {
            "user_id": user_id,
            "meal_plan": meal_plan,  # Supabase JSONB column
            "created_at": "NOW()"  # Track latest update timestamp
        }

        # Upsert into Supabase (Insert if new, Update if exists)
        response = (
            supabase.table("user_meal_history")
            .upsert([data_to_upsert], on_conflict=["user_id"])  # Conflict on `user_id`
            .execute()
        )
        return {"status": "success"}

    except Exception as e:
        return {"error": str(e)}