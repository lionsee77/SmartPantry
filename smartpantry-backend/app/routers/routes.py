from fastapi import APIRouter, File, Form, HTTPException, Depends, UploadFile
from app.services.llama_index_service import get_user_pantry_service, get_user_recipes_service, get_user_preferences_service, generate_meal_plan_service, get_grocery_list_service, parse_receipt_service, store_user_meal_history

router = APIRouter()



# ✅ Endpoint 1: Get User Pantry Inventory
@router.get("/pantry/{user_id}")
def get_user_pantry(user_id: str):
    """Retrieve a user's pantry inventory"""
    try:
        return get_user_pantry_service(user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ✅ Endpoint 2: Get Suggested Recipes Based on Pantry
@router.get("/recipes/{user_id}")
def get_suggested_recipes(user_id: str):
    """Generate meal suggestions based on user's pantry"""
    try:
        return get_user_recipes_service(user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.get("/preferences/{user_id}")
def get_user_preferences(user_id: str):
    try:
        return get_user_preferences_service(user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    
@router.get("/meal_plans/{user_id}")
def get_user_meal_plan(user_id: str):
    try:
        # 1️⃣ Generate Meal Plan
        meal_plan = generate_meal_plan_service(user_id)

        # 2️⃣ Store in Supabase
        store_response = store_user_meal_history(user_id, meal_plan)

    except Exception as E:
        HTTPException(status_code=500)

    # 3️⃣ Return the stored meal plan
    return store_response
 
@router.get("/grocery_list/{user_id}")
def get_grocery_list(user_id: str):
    try:
        return get_grocery_list_service(user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/parse-receipt/")
async def parse_receipt(file: UploadFile = File(...), user_id: str = Form(...)):
    """Upload an image and parse the receipt."""
    result = await parse_receipt_service(file, user_id)

    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])

    return result

