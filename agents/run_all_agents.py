#!/usr/bin/env python3
"""
Multi-Agent Orchestrator
Executes all agents in parallel with logging and status tracking
"""

import sys
import json
import logging
from datetime import datetime
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed
import subprocess

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('orchestrator.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger('Orchestrator')

class AgentOrchestrator:
    """Orchestrates execution of all agents"""
    
    def __init__(self):
        self.agents = [
            {"name": "LSAS", "path": "lsas/lsas_agent.py"},
            {"name": "Pulse", "path": "pulse/pulse_agent.py"},
            {"name": "Parso", "path": "parso/parso_agent.py"},
            {"name": "Gemini", "path": "gemini/gemini_agent.py"}
        ]
        self.start_time = datetime.now()
        self.results = {}
    
    def run_agent(self, agent):
        """Run a single agent"""
        logger.info(f"Starting {agent['name']} agent...")
        
        try:
            # Run the agent script
            result = subprocess.run(
                [sys.executable, agent['path']],
                cwd=Path(__file__).parent,
                capture_output=True,
                text=True,
                timeout=300  # 5 minute timeout
            )
            
            agent_result = {
                "name": agent['name'],
                "status": "success" if result.returncode == 0 else "failed",
                "return_code": result.returncode,
                "stdout": result.stdout,
                "stderr": result.stderr,
                "timestamp": datetime.now().isoformat()
            }
            
            if result.returncode == 0:
                logger.info(f"✓ {agent['name']} completed successfully")
            else:
                logger.error(f"✗ {agent['name']} failed with code {result.returncode}")
                
            return agent_result
            
        except subprocess.TimeoutExpired:
            logger.error(f"✗ {agent['name']} timed out")
            return {
                "name": agent['name'],
                "status": "timeout",
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"✗ {agent['name']} error: {str(e)}")
            return {
                "name": agent['name'],
                "status": "error",
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
    
    def run_parallel(self):
        """Run all agents in parallel"""
        logger.info("="*60)
        logger.info("Starting Multi-Agent Orchestration")
        logger.info(f"Agents to run: {', '.join(a['name'] for a in self.agents)}")
        logger.info("="*60)
        
        # Execute agents in parallel
        with ThreadPoolExecutor(max_workers=len(self.agents)) as executor:
            # Submit all agents
            future_to_agent = {
                executor.submit(self.run_agent, agent): agent 
                for agent in self.agents
            }
            
            # Collect results as they complete
            for future in as_completed(future_to_agent):
                agent = future_to_agent[future]
                try:
                    result = future.result()
                    self.results[agent['name']] = result
                except Exception as e:
                    logger.error(f"Exception running {agent['name']}: {str(e)}")
                    self.results[agent['name']] = {
                        "name": agent['name'],
                        "status": "exception",
                        "error": str(e)
                    }
        
        return self.generate_report()
    
    def generate_report(self):
        """Generate orchestration report"""
        execution_time = (datetime.now() - self.start_time).total_seconds()
        
        summary = {
            "total_agents": len(self.agents),
            "successful": sum(1 for r in self.results.values() if r.get('status') == 'success'),
            "failed": sum(1 for r in self.results.values() if r.get('status') in ['failed', 'error', 'timeout']),
            "execution_time": execution_time
        }
        
        report = {
            "orchestrator": "Multi-Agent System",
            "timestamp": datetime.now().isoformat(),
            "summary": summary,
            "agent_results": self.results
        }
        
        # Save report
        output_path = Path("orchestration_report.json")
        with open(output_path, 'w') as f:
            json.dump(report, f, indent=2)
        
        logger.info("="*60)
        logger.info("Orchestration Complete")
        logger.info(f"Successful: {summary['successful']}/{summary['total_agents']}")
        logger.info(f"Failed: {summary['failed']}/{summary['total_agents']}")
        logger.info(f"Execution time: {execution_time:.2f}s")
        logger.info(f"Report saved to: {output_path}")
        logger.info("="*60)
        
        return report

def main():
    """Main execution"""
    try:
        orchestrator = AgentOrchestrator()
        report = orchestrator.run_parallel()
        
        # Exit with error if any agent failed
        if report['summary']['failed'] > 0:
            failed_agents = [name for name, result in report['agent_results'].items()
                           if result.get('status') in ['failed', 'error', 'timeout']]
            logger.error(f"Failed agents: {', '.join(failed_agents)}")
            return 1
        return 0
        
    except Exception as e:
        logger.error(f"Fatal orchestration error: {str(e)}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
