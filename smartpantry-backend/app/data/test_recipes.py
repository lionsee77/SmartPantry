from llama_index.core.schema import Document

# Example test recipes with correct metadata
test_recipes = [
    Document(
        text="Grilled Chicken Salad: Ingredients - Chicken, Lettuce, Olive Oil, Lemon, Garlic. Instructions - Grill chicken, mix with lettuce and dressing.",
        metadata={"text": "Grilled Chicken Salad", "cuisine": "Mediterranean", "difficulty": "easy", "meal_type": "lunch"}
    ),
    Document(
        text="Spaghetti Carbonara: Ingredients - Spaghetti, Egg, Parmesan Cheese, Bacon, Black Pepper. Instructions - Cook spaghetti, mix with egg and cheese sauce.",
        metadata={"text": "Spaghetti Carbonara", "cuisine": "Italian", "difficulty": "medium", "meal_type": "dinner"}
    ),
    Document(
        text="Avocado Toast: Ingredients - Bread, Avocado, Salt, Pepper, Lemon. Instructions - Mash avocado, spread on toasted bread, season with salt and pepper.",
        metadata={"text": "Avocado Toast", "cuisine": "American", "difficulty": "easy", "meal_type": "breakfast"}
    )
]
documents = test_recipes