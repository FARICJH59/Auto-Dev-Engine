// Type definitions for the Auto-Dev-Engine application

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: ExecutionStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type ExecutionStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface SimulationRequest {
  projectId: string;
  parameters: Record<string, any>;
}

export interface DeploymentRequest {
  projectId: string;
  environment: 'development' | 'staging' | 'production';
  config: Record<string, any>;
}

export interface SDKGenerationRequest {
  projectId: string;
  language: 'typescript' | 'python' | 'java' | 'go';
  outputPath: string;
}
