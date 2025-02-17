# Smart Pantry Buddy

**A meal-planning AI that retrieves pantry inventory and user preferences to generate personalized, health-conscious meal plans using Retrieval-Augmented Generation (RAG) with LlamaIndex and Vector Search.**

---

## 1. Overview

This project integrates **LlamaIndex** to enhance structured and unstructured data retrieval for meal planning.

---

## 2. Tech Stack

### Frontend
- React Native (TypeScript) – Mobile Development  

### Backend
- FastAPI (Python) – API Development  
- LlamaIndex – Structured & Unstructured Data Querying  
- Supabase (PostgreSQL) – Structured Data Storage  
- Pinecone – Vector Search  

### AI Components
- OpenAI GPT-3.5-Turbo – Meal Plan Personalization  
- HuggingFace Transformers – Receipt Scanning  

---

## 3. System Architecture

The system consists of three core layers:

### 1. Data Layer (Storage & Retrieval)
- Supabase (PostgreSQL) – Stores user preferences, pantry data, and meal history.  
- Pinecone (Vector DB) – Stores recipe embeddings for similarity search.  
- MealDB API – Fetches nutrition and grocery data.  

### 2. AI Processing Layer (LlamaIndex + RAG)
- HF Donut Model (Extracts ingredients from receipts).  
- LlamaIndex Query Engine (Queries SQL, Vector DB, and APIs).  
- LLM-Based Personalization (Adjusts meals to dietary needs and allergies).  

### 3. Application Layer (Frontend & API)
- Mobile Interface (React Native) – User Interaction  
- Backend (FastAPI) – Handles API Requests  

---

## 4. Data Storage and Indexing

LlamaIndex efficiently indexes both structured and unstructured data.

| Source Type       | Storage            | Indexed With        |
|------------------|------------------|---------------------|
| User Inventory   | PostgreSQL (Supabase) | SQL Index (LlamaIndex) |
| User Preferences | PostgreSQL (Supabase) | SQL Index (LlamaIndex) |
| Meal History     | PostgreSQL (Supabase) | SQL Index (LlamaIndex) |
| Recipes         | Pinecone               | Vector Index (LlamaIndex) |

---

## 5. LlamaIndex Query Pipeline

LlamaIndex dynamically merges **SQL, Vector, and API** queries for meal planning.

### Step 1: Preprocessing & Storage
1. HF Donut Model scans receipt data
   - Extracted data is stored in Supabase (PostgreSQL).  

2. Recipe Vector Storage  
   - LLM converts recipes into embeddings & stores them in Pinecone.  

### Step 2: Query Processing

1. Retrieve Pantry Data (SQL Query via LlamaIndex)

2. Retrieve Similar Recipes (Vector Search via LlamaIndex)

3. Retrieve Additional Data (External API via LlamaIndex)

4. Pass Retrieved Data to LLM for Personalization
	•	User Preferences
	•	Allergies
	•	Nutritional Data
	•	Cooking Effort Level

6. API Endpoints

Endpoint	Description
POST /parse-receipt	HF Donut model scans grocery receipts and updates pantry
GET /pantry/{user_id}	Retrieve current pantry items
GET /meal-plan/{user_id}	Generate a meal plan using LlamaIndex (SQL + Vector + API)
GET /preferences/{user_id} Get user dietary preferences
GET /recipes/{user_id}	Retrieve relevant recipes from vector DB
GET /grocery_list/{user_id} Retrieve grocery list for missing ingredients

7. Frontend Architecture
	•	React Native + TypeScript – Mobile UI

UI Features
	•	Ingredient Scanner (Upload receipt)
	•	Real-time Pantry Updates
	•	Personalized Meal Plan Generator
	•	Grocery List Suggestions

8. Deployment Instructions

Prerequisites
	•	Docker
	•	Python 3.10+
	•	Node.js

Running Locally

1. Clone the Repository

git clone https://github.com/lionsee77/SmartPantry.git
cd SmartPantry

2. Set Up Backend

cd smartpantry-backend
pip install -r requirements.txt
uvicorn app.main:app --reload

3. Run Frontend

