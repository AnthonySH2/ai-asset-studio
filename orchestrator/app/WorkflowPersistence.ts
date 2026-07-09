import fs from 'fs';
import path from 'path';
import { WorkflowStateMachine, WorkflowState } from './workflow/WorkflowStateMachine';

/**
 * Interface for workflow state persistence
 */
export interface WorkflowStateData {
  workflowId: string;
  currentState: WorkflowState;
  createdAt: Date;
  updatedAt: Date;
  // Add other workflow data as needed
}

/**
 * Class for managing workflow persistence
 */
export class WorkflowPersistence {
  private workflowBasePath: string;
  
  constructor(workflowBasePath: string = './workflows') {
    this.workflowBasePath = workflowBasePath;
    
    // Ensure workflow directory exists
    if (!fs.existsSync(workflowBasePath)) {
      fs.mkdirSync(workflowBasePath, { recursive: true });
    }
  }
  
  /**
   * Save the workflow state to disk
   * @param workflowId The ID of the workflow
   * @param stateData The state data to save
   */
  async saveWorkflowState(workflowId: string, stateData: WorkflowStateData): Promise<void> {
    const workflowDir = path.join(this.workflowBasePath, workflowId);
    
    // Ensure workflow directory exists
    if (!fs.existsSync(workflowDir)) {
      fs.mkdirSync(workflowDir, { recursive: true });
    }
    
    const stateFilePath = path.join(workflowDir, 'state.json');
    
    // Write the state data to file
    fs.writeFileSync(stateFilePath, JSON.stringify(stateData, null, 2));
  }
  
  /**
   * Load the workflow state from disk
   * @param workflowId The ID of the workflow
   * @returns The loaded workflow state data
   */
  async loadWorkflowState(workflowId: string): Promise<WorkflowStateData | null> {
    const stateFilePath = path.join(this.workflowBasePath, workflowId, 'state.json');
    
    if (!fs.existsSync(stateFilePath)) {
      return null;
    }
    
    try {
      const data = fs.readFileSync(stateFilePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error loading workflow state for ${workflowId}:`, error);
      return null;
    }
  }
  
  /**
   * Save an artifact file
   * @param workflowId The ID of the workflow
   * @param fileName The name of the file to save
   * @param fileData The data to save
   */
  async saveArtifact(workflowId: string, fileName: string, fileData: Buffer | string): Promise<void> {
    const workflowDir = path.join(this.workflowBasePath, workflowId);
    
    // Ensure workflow directory exists
    if (!fs.existsSync(workflowDir)) {
      fs.mkdirSync(workflowDir, { recursive: true });
    }
    
    const filePath = path.join(workflowDir, fileName);
    
    // Write the artifact data
    if (typeof fileData === 'string') {
      fs.writeFileSync(filePath, fileData);
    } else {
      fs.writeFileSync(filePath, fileData);
    }
  }
  
  /**
   * Get the base path of workflow persistence
   * @returns The base path
   */
  getBasePath(): string {
    return this.workflowBasePath;
  }
}