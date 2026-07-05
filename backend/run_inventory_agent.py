import time
import sys
from app.services.inventory_agent import InventoryOrchestrator
from app.config import logger
import logging

def main():
    # Set logger to DEBUG so we can see all polling output
    logger.setLevel(logging.DEBUG)
    
    print("Starting Supply Chain Procurement Orchestrator Agent...")
    print("Polling inventory_data.csv every 5 seconds. Press Ctrl+C to stop.\n")
    
    agent = InventoryOrchestrator("inventory_data.csv")
    
    try:
        while True:
            report = agent.poll_once()
            import json
            print(json.dumps(report, indent=4))
            time.sleep(5)
    except KeyboardInterrupt:
        print("\nStopping Agent. Goodbye!")
        sys.exit(0)

if __name__ == "__main__":
    main()
