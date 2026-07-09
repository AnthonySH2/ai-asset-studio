# AI Asset Studio Dockerfile

# Base image
FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Copy requirements first (for better caching)
COPY orchestrator/requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY orchestrator/ ./orchestrator/
COPY model-manager/ ./model-manager/

# Expose ports
EXPOSE 8000
EXPOSE 8001

# Command to run the application
CMD ["python", "orchestrator/main.py"]