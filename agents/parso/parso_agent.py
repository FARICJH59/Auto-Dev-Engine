#!/usr/bin/env python3
"""
Parso Agent - Parser and Syntax Optimization
Phase 1-3 Implementation
"""

import os
import sys
import json
import logging
from datetime import datetime
from pathlib import Path
import ast

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('parso_agent.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger('Parso')

class ParsoAgent:
    """Parser and Syntax Optimization Agent"""
    
    def __init__(self):
        self.name = "Parso"
        self.version = "1.0.0"
        self.status = "initialized"
        self.start_time = datetime.now()
        logger.info(f"{self.name} Agent v{self.version} initialized")
    
    def parse_and_optimize(self):
        """Parse code and optimize syntax"""
        logger.info("Starting parsing and optimization...")
        self.status = "running"
        
        try:
            # Phase 1: Discover files
            logger.info("Phase 1: Discovering files...")
            files = self._discover_files()
            
            # Phase 2: Parse syntax
            logger.info("Phase 2: Parsing syntax...")
            parse_results = self._parse_files(files)
            
            # Phase 3: Generate report
            logger.info("Phase 3: Generating optimization report...")
            report = self._generate_report(files, parse_results)
            
            self.status = "completed"
            logger.info("Parsing and optimization completed successfully")
            return report
            
        except Exception as e:
            self.status = "failed"
            logger.error(f"Parsing failed: {str(e)}")
            raise
    
    def _discover_files(self):
        """Discover Python files for parsing"""
        repo_path = Path(".")
        python_files = list(repo_path.rglob("*.py"))
        
        # Filter out virtual environments and build directories
        filtered_files = [
            f for f in python_files 
            if not any(part.startswith('.') or part in ['venv', 'env', '__pycache__', 'build', 'dist'] 
                      for part in f.parts)
        ]
        
        logger.info(f"Discovered {len(filtered_files)} Python files")
        return filtered_files
    
    def _parse_files(self, files):
        """Parse Python files and check syntax"""
        results = {
            "total_files": len(files),
            "parsed_successfully": 0,
            "syntax_errors": 0,
            "files": []
        }
        
        for file_path in files:
            file_result = {
                "path": str(file_path),
                "status": "success",
                "errors": []
            }
            
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Parse the file
                tree = ast.parse(content, filename=str(file_path))
                
                # Analyze AST
                file_result["lines"] = len(content.splitlines())
                file_result["functions"] = sum(1 for node in ast.walk(tree) if isinstance(node, ast.FunctionDef))
                file_result["classes"] = sum(1 for node in ast.walk(tree) if isinstance(node, ast.ClassDef))
                
                results["parsed_successfully"] += 1
                logger.info(f"✓ Parsed: {file_path}")
                
            except SyntaxError as e:
                file_result["status"] = "syntax_error"
                file_result["errors"].append({
                    "type": "SyntaxError",
                    "message": str(e),
                    "line": e.lineno
                })
                results["syntax_errors"] += 1
                logger.warning(f"✗ Syntax error in {file_path}: {e}")
                
            except Exception as e:
                file_result["status"] = "error"
                file_result["errors"].append({
                    "type": type(e).__name__,
                    "message": str(e)
                })
                logger.warning(f"✗ Error parsing {file_path}: {e}")
            
            results["files"].append(file_result)
        
        return results
    
    def _generate_report(self, files, parse_results):
        """Generate parsing report"""
        report = {
            "agent": self.name,
            "version": self.version,
            "timestamp": datetime.now().isoformat(),
            "status": self.status,
            "parse_results": parse_results,
            "summary": {
                "total_files": parse_results["total_files"],
                "success_rate": f"{(parse_results['parsed_successfully'] / parse_results['total_files'] * 100):.1f}%" if parse_results['total_files'] > 0 else "0%",
                "execution_time": (datetime.now() - self.start_time).total_seconds()
            }
        }
        
        # Save report to file
        output_path = Path("parso_report.json")
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
    logger.info("Parso Agent Starting")
    logger.info("="*60)
    
    try:
        agent = ParsoAgent()
        report = agent.parse_and_optimize()
        
        logger.info("="*60)
        logger.info("Parso Agent Completed Successfully")
        logger.info("="*60)
        
        print(json.dumps(report, indent=2))
        return 0
        
    except Exception as e:
        logger.error(f"Fatal error: {str(e)}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
