"""
AI Asset Studio Orchestrator
Orchestrates the workflow for generating 3D assets using AI
"""

import logging
import json
import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import asyncio
import uuid
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(title="AI Asset Studio Orchestrator", version="1.0.0")

# Workflow states
WORKFLOW_STATES = [
    "CREATED",
    "GENERATING_IMAGE",
    "WAITING_APPROVAL",
    "GENERATING_3D",
    "OPTIMIZING",
    "COMPLETED",
    "FAILED"
]

# Pydantic models for requests and responses
class AssetGenerationRequest(BaseModel):
    prompt: str
    iterations: Optional[int] = 1
    style: Optional[str] = "default"
    resolution: Optional[str] = "1024x1024"

class AssetMetadata(BaseModel):
    prompt: str
    created_at: datetime
    updated_at: datetime
    iterations: Optional[int] = 1
    style: Optional[str] = "default"
    resolution: Optional[str] = "1024x1024"
    model_format: Optional[str] = "glb"
    file_size: Optional[int] = None

class AssetGenerationResponse(BaseModel):
    image_url: str
    model_url: str
    metadata: AssetMetadata
    status: str  # 'pending', 'completed', 'failed'

class WorkflowStep(BaseModel):
    step: str
    status: str  # 'pending', 'completed', 'failed'
    started_at: datetime
    completed_at: Optional[datetime] = None

class WorkflowState(BaseModel):
    workflow_id: str
    status: str  # One of WORKFLOW_STATES
    current_step: Optional[str] = None
    steps: List[WorkflowStep] = []
    created_at: datetime
    updated_at: datetime
    result: Optional[AssetGenerationResponse] = None
    error_message: Optional[str] = None

# In-memory storage for workflows (in production, this would be a database)
workflows_storage = {}

# Directory for persistence
PERSISTENCE_DIR = "workflows"
os.makedirs(PERSISTENCE_DIR, exist_ok=True)

def save_workflow_to_disk(workflow: WorkflowState):
    """Save workflow state to disk"""
    try:
        file_path = os.path.join(PERSISTENCE_DIR, f"{workflow.workflow_id}.json")
        with open(file_path, 'w') as f:
            json.dump(workflow.dict(), f, default=str)
        logger.info(f"Workflow {workflow.workflow_id} saved to disk")
    except Exception as e:
        logger.error(f"Failed to save workflow {workflow.workflow_id}: {str(e)}")

def load_workflow_from_disk(workflow_id: str) -> Optional[WorkflowState]:
    """Load workflow state from disk"""
    try:
        file_path = os.path.join(PERSISTENCE_DIR, f"{workflow_id}.json")
        if os.path.exists(file_path):
            with open(file_path, 'r') as f:
                data = json.load(f)
                return WorkflowState(**data)
        return None
    except Exception as e:
        logger.error(f"Failed to load workflow {workflow_id}: {str(e)}")
        return None

def update_workflow_state(workflow_id: str, status: str, current_step: Optional[str] = None, 
                         error_message: Optional[str] = None):
    """Update workflow state and persist to disk"""
    workflow = load_workflow_from_disk(workflow_id)
    if not workflow:
        # If workflow doesn't exist, create a new one
        workflow = WorkflowState(
            workflow_id=workflow_id,
            status=status,
            current_step=current_step,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
    else:
        workflow.status = status
        workflow.updated_at = datetime.now()
        if current_step:
            workflow.current_step = current_step
            
    # Add step tracking if needed
    if current_step and not any(step.step == current_step for step in workflow.steps):
        workflow.steps.append(WorkflowStep(
            step=current_step,
            status="pending",
            started_at=datetime.now()
        ))
    
    if error_message:
        workflow.error_message = error_message
    
    # Save to storage and disk
    workflows_storage[workflow_id] = workflow
    save_workflow_to_disk(workflow)
    
    return workflow

# Create a new workflow
def create_new_workflow(request: AssetGenerationRequest) -> str:
    """Create a new workflow for asset generation"""
    workflow_id = str(uuid.uuid4())
    
    # Initialize workflow state
    workflow = WorkflowState(
        workflow_id=workflow_id,
        status="CREATED",
        current_step=None,
        created_at=datetime.now(),
        updated_at=datetime.now(),
        steps=[]
    )
    
    # Save to storage and disk
    workflows_storage[workflow_id] = workflow
    save_workflow_to_disk(workflow)
    
    logger.info(f"Created new workflow: {workflow_id}")
    return workflow_id

class JobStatus(BaseModel):
    job_id: str
    status: str  # 'queued', 'processing', 'completed', 'failed', 'cancelled'
    progress: float = 0.0
    message: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    result: Optional[AssetGenerationResponse] = None

# In-memory storage for jobs (in production, this would be a database)
jobs_storage = {}

@app.get("/")
async def root():
    return {"message": "AI Asset Studio Orchestrator is running"}

@app.post("/generate-assets")
async def generate_assets(request: AssetGenerationRequest):
    """Submit a new asset generation job"""
    # Create a new workflow
    workflow_id = create_new_workflow(request)
    
    # For now, we'll simulate the workflow execution in a separate task
    # In a real implementation, this would be handled by the actual workflow engine
    
    logger.info(f"Submitted new workflow: {workflow_id}")
    
    return {"workflow_id": workflow_id}

@app.get("/jobs/{job_id}")
async def get_job_status(job_id: str):
    """Get status of a specific job"""
    # Try to load from disk first (for persisted workflows)
    workflow = load_workflow_from_disk(job_id)
    if workflow:
        return workflow
    
    # If not found in disk, check memory storage
    if job_id not in jobs_storage:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return jobs_storage[job_id]

@app.get("/workflows/{workflow_id}")
async def get_workflow_status(workflow_id: str):
    """Get status of a specific workflow"""
    # Load workflow from disk
    workflow = load_workflow_from_disk(workflow_id)
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    return workflow

@app.post("/jobs/{job_id}/cancel")
async def cancel_job(job_id: str):
    """Cancel a running job"""
    if job_id not in jobs_storage:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Update job status to cancelled
    jobs_storage[job_id].status = "cancelled"
    jobs_storage[job_id].updated_at = datetime.now()
    
    logger.info(f"Cancelled job: {job_id}")
    
    return {"message": "Job cancelled successfully"}

@app.post("/jobs/{job_id}/pause")
async def pause_job(job_id: str):
    """Pause a running job"""
    if job_id not in jobs_storage:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Update job status to paused
    jobs_storage[job_id].status = "paused"
    jobs_storage[job_id].updated_at = datetime.now()
    
    logger.info(f"Paused job: {job_id}")
    
    return {"message": "Job paused successfully"}

@app.post("/jobs/{job_id}/resume")
async def resume_job(job_id: str):
    """Resume a paused job"""
    if job_id not in jobs_storage:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Update job status to processing
    jobs_storage[job_id].status = "processing"
    jobs_storage[job_id].updated_at = datetime.now()
    
    logger.info(f"Resumed job: {job_id}")
    
    return {"message": "Job resumed successfully"}

# Mock implementation of the workflow orchestration
async def mock_workflow_orchestration(job_id: str):
    """Mock implementation of the full workflow"""
    try:
        # Simulate workflow steps
        jobs_storage[job_id].status = "processing"
        jobs_storage[job_id].progress = 20.0
        jobs_storage[job_id].updated_at = datetime.now()
        
        # Image generation step
        await asyncio.sleep(1)
        jobs_storage[job_id].progress = 40.0
        jobs_storage[job_id].updated_at = datetime.now()
        
        # 3D model generation step
        await asyncio.sleep(1)
        jobs_storage[job_id].progress = 60.0
        jobs_storage[job_id].updated_at = datetime.now()
        
        # Model optimization step
        await asyncio.sleep(1)
        jobs_storage[job_id].progress = 80.0
        jobs_storage[job_id].updated_at = datetime.now()
        
        # Asset delivery step
        await asyncio.sleep(1)
        jobs_storage[job_id].status = "completed"
        jobs_storage[job_id].progress = 100.0
        jobs_storage[job_id].updated_at = datetime.now()
        
        # Create mock result
        mock_result = AssetGenerationResponse(
            image_url=f"https://example.com/images/mock-{job_id}.png",
            model_url=f"https://example.com/models/mock-{job_id}.glb",
            metadata=AssetMetadata(
                prompt="Mock prompt",
                created_at=datetime.now(),
                updated_at=datetime.now(),
                iterations=1,
                style="default",
                resolution="1024x1024",
                model_format="glb"
            ),
            status="completed"
        )
        
        jobs_storage[job_id].result = mock_result
        
    except Exception as e:
        logger.error(f"Error in workflow: {str(e)}")
        jobs_storage[job_id].status = "failed"
        jobs_storage[job_id].updated_at = datetime.now()
        raise

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)