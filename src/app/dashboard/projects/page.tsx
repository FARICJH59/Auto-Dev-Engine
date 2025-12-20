'use client';

import { useState } from 'react';
import { Project, SimulationRequest, DeploymentRequest, SDKGenerationRequest } from "@/types";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);

  const handleSimulation = async (request: SimulationRequest) => {
    // Simulation logic here
    console.log('Running simulation:', request);
  };

  const handleDeployment = async (request: DeploymentRequest) => {
    // Deployment logic here
    console.log('Deploying project:', request);
  };

  const handleSDKGeneration = async (request: SDKGenerationRequest) => {
    // SDK generation logic here
    console.log('Generating SDK:', request);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Projects Dashboard</h1>
      
      <div className="grid gap-4">
        {projects.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No projects found. Create your first project to get started.
          </div>
        ) : (
          projects.map((project) => (
            <div key={project.id} className="border rounded-lg p-4 shadow-sm">
              <h2 className="text-xl font-semibold">{project.name}</h2>
              <p className="text-gray-600">{project.description}</p>
              <div className="mt-2">
                <span className={`inline-block px-2 py-1 text-xs rounded ${
                  project.status === 'completed' ? 'bg-green-100 text-green-800' :
                  project.status === 'running' ? 'bg-blue-100 text-blue-800' :
                  project.status === 'failed' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {project.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
