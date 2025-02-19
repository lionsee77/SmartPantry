# ✅ Step 1: Use an official Python runtime as a base image
FROM python:3.11

# ✅ Step 2: Set the working directory inside the container
WORKDIR /app

# ✅ Step 3: Copy project files into the container
COPY . /app

# ✅ Step 4: Install dependencies
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# ✅ Step 5: Expose the application port (FastAPI default is 8000)
EXPOSE 8000

# ✅ Step 6: Run FastAPI app with Uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]