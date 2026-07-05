import asyncio
import sys
import json
from app.services.inventory_agent import InventoryOrchestrator
from app.config import logger
import logging

def main():
    logger.setLevel(logging.INFO)
    print("Testing Inventory Orchestrator with Agno...")
    
    agent = InventoryOrchestrator("inventory_data.csv")
    
    print("Polling once...")
    try:
        report = agent.poll_once()
        print("\n=== RAW REPORT ===")
        print(json.dumps(report, indent=4))
    except Exception as e:
        print(f"Error during poll: {e}")

if __name__ == "__main__":
    main()
