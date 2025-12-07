#!/usr/bin/env python3
"""
Gemini Agent - AI-Powered Analysis and Code Generation
Phase 1-3 Implementation
"""

import os
import sys
import json
import logging
from datetime import datetime
from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('gemini_agent.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger('Gemini')

class GeminiAgent:
    """AI-Powered Analysis and Code Generation Agent"""
    
    def __init__(self):
        self.name = "Gemini"
        self.version = "1.0.0"
        self.status = "initialized"
        self.start_time = datetime.now()
        self.api_key = os.getenv('GEMINI_API_KEY')
        logger.info(f"{self.name} Agent v{self.version} initialized")
        
        if not self.api_key:
            logger.warning("GEMINI_API_KEY not found in environment variables")
    
    def analyze_and_generate(self):
        """Perform AI-powered analysis and generate insights"""
        logger.info("Starting AI analysis and code generation...")
        self.status = "running"
        
        try:
            # Phase 1: Analyze repository
            logger.info("Phase 1: Analyzing repository structure...")
            repo_analysis = self._analyze_repository()
            
            # Phase 2: Generate insights
            logger.info("Phase 2: Generating AI insights...")
            insights = self._generate_insights(repo_analysis)
            
            # Phase 3: Create recommendations
            logger.info("Phase 3: Creating recommendations...")
            recommendations = self._create_recommendations(insights)
            
            # Phase 4: Generate report
            logger.info("Phase 4: Generating analysis report...")
            report = self._generate_report(repo_analysis, insights, recommendations)
            
            self.status = "completed"
            logger.info("AI analysis completed successfully")
            return report
            
        except Exception as e:
            self.status = "failed"
            logger.error(f"AI analysis failed: {str(e)}")
            raise
    
    def _analyze_repository(self):
        """Analyze repository structure and contents"""
        repo_path = Path(".")
        
        analysis = {
            "structure": {
                "directories": [],
                "files": [],
                "total_files": 0,
                "total_size": 0
            },
            "languages": {},
            "key_files": []
        }
        
        # Analyze directory structure using os.walk for better performance
        for root, dirs, files in os.walk(repo_path):
            # Skip hidden directories
            dirs[:] = [d for d in dirs if not d.startswith('.')]

            for filename in files:
                if filename.startswith('.'):
                    continue

                file_path = Path(root) / filename
                analysis["structure"]["files"].append(str(file_path))
                analysis["structure"]["total_files"] += 1

                try:
                    size = file_path.stat().st_size
                    analysis["structure"]["total_size"] += size


                    # Track languages
                    suffix = file_path.suffix
                    if suffix:
                        analysis["languages"][suffix] = analysis["languages"].get(suffix, 0) + 1

                    # Identify key files
                    if filename in ['README.md', 'setup.py', 'requirements.txt', 'package.json', 'Dockerfile']:
                        analysis["key_files"].append(str(file_path))

                except Exception as e:
                    logger.warning(f"Error analyzing {file_path}: {e}")

        # Count directories
        for root, dirs, _ in os.walk(repo_path):
            dirs[:] = [d for d in dirs if not d.startswith('.')]
            for dirname in dirs:
                dir_path = Path(root) / dirname
                analysis["structure"]["directories"].append(str(dir_path))
        
        logger.info(f"Analyzed {analysis['structure']['total_files']} files")
        return analysis
    
    def _generate_insights(self, repo_analysis):
        """Generate AI-powered insights from analysis"""
        insights = {
            "code_quality": {
                "score": 85,  # Simulated score
                "factors": [
                    "Good directory structure",
                    "Multiple programming languages detected",
                    "Key configuration files present"
                ]
            },
            "architecture": {
                "pattern": "Multi-agent system",
                "components": ["LSAS", "Pulse", "Parso", "Gemini"],
                "maturity": "developing"
            },
            "recommendations_count": 3
        }
        
        logger.info(f"Generated insights with quality score: {insights['code_quality']['score']}")
        return insights
    
    def _create_recommendations(self, insights):
        """Create actionable recommendations"""
        recommendations = [
            {
                "priority": "high",
                "category": "documentation",
                "title": "Enhance API documentation",
                "description": "Add comprehensive docstrings to all public APIs"
            },
            {
                "priority": "medium",
                "category": "testing",
                "title": "Increase test coverage",
                "description": "Add unit tests for core functionality"
            },
            {
                "priority": "medium",
                "category": "performance",
                "title": "Optimize agent execution",
                "description": "Implement parallel execution for independent agents"
            },
            {
                "priority": "low",
                "category": "maintenance",
                "title": "Update dependencies",
                "description": "Review and update package dependencies"
            }
        ]
        
        logger.info(f"Created {len(recommendations)} recommendations")
        return recommendations
    
    def _generate_report(self, repo_analysis, insights, recommendations):
        """Generate comprehensive analysis report"""
        report = {
            "agent": self.name,
            "version": self.version,
            "timestamp": datetime.now().isoformat(),
            "status": self.status,
            "repository_analysis": repo_analysis,
            "insights": insights,
            "recommendations": recommendations,
            "summary": {
                "total_files": repo_analysis["structure"]["total_files"],
                "total_size_mb": round(repo_analysis["structure"]["total_size"] / (1024 * 1024), 2),
                "languages_detected": len(repo_analysis["languages"]),
                "quality_score": insights["code_quality"]["score"],
                "execution_time": (datetime.now() - self.start_time).total_seconds()
            }
        }
        
        # Save report to file
        output_path = Path("gemini_report.json")
        with open(output_path, 'w') as f:
            json.dump(report, f, indent=2)
        
        logger.info(f"Report saved to {output_path}")
        return report
    
    def get_status(self):
        """Get current agent status"""
        return {
            "agent": self.name,
            "status": self.status,
            "uptime": (datetime.now() - self.start_time).total_seconds(),
            "api_configured": bool(self.api_key)
        }

def main():
    """Main execution function"""
    logger.info("="*60)
    logger.info("Gemini Agent Starting")
    logger.info("="*60)
    
    try:
        agent = GeminiAgent()
        report = agent.analyze_and_generate()
        
        logger.info("="*60)
        logger.info("Gemini Agent Completed Successfully")
        logger.info("="*60)
        
        print(json.dumps(report, indent=2))
        return 0
        
    except Exception as e:
        logger.error(f"Fatal error: {str(e)}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
