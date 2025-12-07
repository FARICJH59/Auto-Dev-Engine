#!/usr/bin/env python3
"""
Pulse Agent - Performance and Usage Logging System
Phase 1-3 Implementation
"""

import os
import sys
import json
import logging
import psutil
from datetime import datetime
from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('pulse_agent.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger('Pulse')

class PulseAgent:
    """Performance and Usage Logging System Agent"""
    
    def __init__(self):
        self.name = "Pulse"
        self.version = "1.0.0"
        self.status = "initialized"
        self.start_time = datetime.now()
        logger.info(f"{self.name} Agent v{self.version} initialized")
    
    def monitor_system(self):
        """Monitor system performance and resources"""
        logger.info("Starting system monitoring...")
        self.status = "running"
        
        try:
            # Phase 1: Collect system metrics
            logger.info("Phase 1: Collecting system metrics...")
            metrics = self._collect_metrics()
            
            # Phase 2: Analyze performance
            logger.info("Phase 2: Analyzing performance...")
            analysis = self._analyze_performance(metrics)
            
            # Phase 3: Generate report
            logger.info("Phase 3: Generating monitoring report...")
            report = self._generate_report(metrics, analysis)
            
            self.status = "completed"
            logger.info("Monitoring completed successfully")
            return report
            
        except Exception as e:
            self.status = "failed"
            logger.error(f"Monitoring failed: {str(e)}")
            raise
    
    def _collect_metrics(self):
        """Collect system performance metrics"""
        metrics = {
            "cpu": {
                "percent": psutil.cpu_percent(interval=1),
                "count": psutil.cpu_count(),
                "freq": psutil.cpu_freq()._asdict() if psutil.cpu_freq() else None
            },
            "memory": {
                "total": psutil.virtual_memory().total,
                "available": psutil.virtual_memory().available,
                "percent": psutil.virtual_memory().percent,
                "used": psutil.virtual_memory().used
            },
            "disk": {
                "total": psutil.disk_usage('/').total,
                "used": psutil.disk_usage('/').used,
                "free": psutil.disk_usage('/').free,
                "percent": psutil.disk_usage('/').percent
            }
        }
        
        logger.info(f"CPU Usage: {metrics['cpu']['percent']}%")
        logger.info(f"Memory Usage: {metrics['memory']['percent']}%")
        logger.info(f"Disk Usage: {metrics['disk']['percent']}%")
        
        return metrics
    
    def _analyze_performance(self, metrics):
        """Analyze performance metrics"""
        analysis = {
            "health_status": "healthy",
            "warnings": [],
            "recommendations": []
        }
        
        # Check CPU
        if metrics['cpu']['percent'] > 80:
            analysis['warnings'].append("High CPU usage detected")
            analysis['health_status'] = "warning"
        
        # Check Memory
        if metrics['memory']['percent'] > 80:
            analysis['warnings'].append("High memory usage detected")
            analysis['health_status'] = "warning"
        
        # Check Disk
        if metrics['disk']['percent'] > 80:
            analysis['warnings'].append("High disk usage detected")
            analysis['health_status'] = "warning"
        
        if not analysis['warnings']:
            analysis['recommendations'].append("System is performing optimally")
        
        return analysis
    
    def _generate_report(self, metrics, analysis):
        """Generate monitoring report"""
        report = {
            "agent": self.name,
            "version": self.version,
            "timestamp": datetime.now().isoformat(),
            "status": self.status,
            "metrics": metrics,
            "analysis": analysis,
            "summary": {
                "execution_time": (datetime.now() - self.start_time).total_seconds(),
                "health_status": analysis['health_status']
            }
        }
        
        # Save report to file
        output_path = Path("pulse_report.json")
        with open(output_path, 'w') as f:
            json.dump(report, f, indent=2)
        
        logger.info(f"Report saved to {output_path}")
        return report
    
    def get_status(self):
        """Get current agent status"""
        return {
            "agent": self.name,
            "status": self.status,
            "uptime": (datetime.now() - self.start_time).total_seconds()
        }

def main():
    """Main execution function"""
    logger.info("="*60)
    logger.info("Pulse Agent Starting")
    logger.info("="*60)
    
    try:
        agent = PulseAgent()
        report = agent.monitor_system()
        
        logger.info("="*60)
        logger.info("Pulse Agent Completed Successfully")
        logger.info("="*60)
        
        print(json.dumps(report, indent=2))
        return 0
        
    except Exception as e:
        logger.error(f"Fatal error: {str(e)}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
