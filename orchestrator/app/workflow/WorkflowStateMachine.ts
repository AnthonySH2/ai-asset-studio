import { AssetGenerationRequest, AssetGenerationResult } from '../../shared/interfaces/IAIProvider';

/**
 * Enum representing the states of a workflow
 */
export enum WorkflowState {
  CREATED,
  GENERATING_IMAGE,
  WAITING_APPROVAL,
  GENERATING_3D,
  OPTIMIZING,
  COMPLETED,
  FAILED
}

/**
 * Interface for workflow state transitions
 */
export interface WorkflowTransition {
  from: WorkflowState;
  to: WorkflowState;
  condition?: () => boolean;
}

/**
 * Class representing a workflow state machine
 */
export class WorkflowStateMachine {
  private currentState: WorkflowState = WorkflowState.CREATED;
  private workflowId: string;
  
  constructor(workflowId: string) {
    this.workflowId = workflowId;
  }
  
  /**
   * Get the current state of the workflow
   * @returns The current workflow state
   */
  getCurrentState(): WorkflowState {
    return this.currentState;
  }
  
  /**
   * Get the current state as a string
   * @returns The name of the current state
   */
  getCurrentStateName(): string {
    return WorkflowState[this.currentState];
  }
  
  /**
   * Transition the workflow to a new state
   * @param newState The new state to transition to
   * @returns True if the transition was successful, false otherwise
   */
  transitionTo(newState: WorkflowState): boolean {
    // Define valid transitions
    const validTransitions: WorkflowTransition[] = [
      { from: WorkflowState.CREATED, to: WorkflowState.GENERATING_IMAGE },
      { from: WorkflowState.CREATED, to: WorkflowState.GENERATING_3D },
      { from: WorkflowState.GENERATING_IMAGE, to: WorkflowState.WAITING_APPROVAL },
      { from: WorkflowState.WAITING_APPROVAL, to: WorkflowState.OPTIMIZING },
      { from: WorkflowState.WAITING_APPROVAL, to: WorkflowState.COMPLETED },
      { from: WorkflowState.GENERATING_3D, to: WorkflowState.OPTIMIZING },
      { from: WorkflowState.OPTIMIZING, to: WorkflowState.COMPLETED },
      { from: WorkflowState.OPTIMIZING, to: WorkflowState.FAILED },
      { from: WorkflowState.GENERATING_IMAGE, to: WorkflowState.FAILED },
      { from: WorkflowState.GENERATING_3D, to: WorkflowState.FAILED },
      { from: WorkflowState.WAITING_APPROVAL, to: WorkflowState.FAILED },
    ];
    
    // Check if the transition is valid
    const isValidTransition = validTransitions.some(transition => 
      transition.from === this.currentState && transition.to === newState
    );
    
    if (isValidTransition) {
      console.log(`Workflow ${this.workflowId}: Transitioning from ${WorkflowState[this.currentState]} to ${WorkflowState[newState]}`);
      this.currentState = newState;
      return true;
    } else {
      console.warn(`Workflow ${this.workflowId}: Invalid transition from ${WorkflowState[this.currentState]} to ${WorkflowState[newState]}`);
      return false;
    }
  }
  
  /**
   * Check if the workflow is in a completed state
   * @returns True if the workflow is completed, false otherwise
   */
  isCompleted(): boolean {
    return this.currentState === WorkflowState.COMPLETED;
  }
  
  /**
   * Check if the workflow has failed
   * @returns True if the workflow has failed, false otherwise
   */
  hasFailed(): boolean {
    return this.currentState === WorkflowState.FAILED;
  }
  
  /**
   * Reset the workflow to the initial state
   */
  reset(): void {
    this.currentState = WorkflowState.CREATED;
  }
  
  /**
   * Get the workflow ID
   * @returns The workflow ID
   */
  getWorkflowId(): string {
    return this.workflowId;
  }
}