import requests
import time
from app.pinecone_client import pinecone_index
from app.services.llama_index_service import generate_embedding

# ✅ Constants
RECIPE_API_URL = "https://www.themealdb.com/api/json/v1/1/random.php"
NUM_RECIPES = 30  # Number of recipes to fetch

# ✅ Function to fetch a random recipe
def fetch_random_recipe():
    try:
        response = requests.get(RECIPE_API_URL)
        response.raise_for_status()  # Raise an error if API call fails
        data = response.json()
        if "meals" in data and data["meals"]:
            return data["meals"][0]  # Return the first meal
    except requests.RequestException as e:
        print(f"❌ Error fetching recipe: {e}")
        return None

# ✅ Function to transform recipe data for Pinecone
def transform_recipe(recipe):
    # Extract ingredients dynamically
    ingredients = [
        recipe.get(f"strIngredient{i}") for i in range(1, 21)
        if recipe.get(f"strIngredient{i}") and recipe.get(f"strIngredient{i}").strip()
    ]
    
    # Create a textual representation
    recipe_text = f"""
    Recipe: {recipe["strMeal"]}
    Category: {recipe["strCategory"]}
    Cuisine: {recipe["strArea"]}
    Ingredients: {", ".join(ingredients)}
    Instructions: {recipe["strInstructions"]}
    """
    
    return {
        "id": recipe["idMeal"],  # Unique ID
        "name": recipe["strMeal"],  # Recipe title
        "category": recipe["strCategory"],
        "cuisine": recipe["strArea"],
        "ingredients": ingredients,
        "instructions": recipe["strInstructions"],
        "image_url": recipe["strMealThumb"],
    }, recipe_text

# ✅ Function to upsert recipes into Pinecone
def upsert_recipes_to_pinecone(recipes):
    vectors = []
    
    for recipe in recipes:
        transformed_data, recipe_text = transform_recipe(recipe)
        print(transformed_data)
        embedding_vector = generate_embedding(recipe_text)  # Generate embedding

        vectors.append({
            "id": transformed_data["id"],
            "values": embedding_vector,
            "metadata": transformed_data  # Store metadata for filtering later
        })

    # ✅ Upsert to Pinecone
    if vectors:
        pinecone_index.upsert(vectors=vectors)
        print(f"✅ Successfully upserted {len(vectors)} recipes into Pinecone!")

# ✅ Main script to fetch & upsert recipes
if __name__ == "__main__":
    all_recipes = []

    for i in range(NUM_RECIPES):
        print(f"🍽️ Fetching recipe {i+1}/{NUM_RECIPES}...")
        recipe = fetch_random_recipe()
        if recipe:
            all_recipes.append(recipe)
        
        time.sleep(1)  # Avoid hitting API rate limits

    print(f"🔄 Transforming and upserting {len(all_recipes)} recipes into Pinecone...")
    upsert_recipes_to_pinecone(all_recipes)

    print("🎉 All recipes stored successfully!")