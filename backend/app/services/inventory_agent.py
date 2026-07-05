import csv
import logging
from typing import Dict, Any, List

from agno.agent import Agent
from agno.models.groq import Groq

from app.config import logger, settings

class InventoryOrchestrator:
    def __init__(self, data_file: str = "inventory_data.csv"):
        self.data_file = data_file
        self.alerted_items = {}  # Tracks items that have already been alerted
        # Initialize the Agno Agent using the Groq model
        # Note: Depending on the agno version, it might be `id` or `model` or just default.
        model_kwargs = {"id": settings.groq_model}
        if settings.groq_api_key:
            model_kwargs["api_key"] = settings.groq_api_key
            
        self.agent = Agent(
            model=Groq(**model_kwargs),
            description="You are a Supply Chain Procurement AI. Be concise and professional.",
            markdown=True
        )

    def read_inventory(self) -> List[Dict[str, Any]]:
        inventory = []
        try:
            with open(self.data_file, mode='r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    inventory.append({
                        "zone_name": row["Zone Name"],
                        "item_name": row["Item Name"],
                        "current_stock": int(row["Current Stock"]),
                        "max_stock": int(row["Max Stock"]),
                    })
        except Exception as e:
            logger.error("Error reading inventory file: %s", e)
        return inventory

    def categorize_stock(self, current: int, maximum: int) -> str:
        if maximum == 0:
            return "Low"
        ratio = current / maximum
        if ratio >= 0.7:
            return "Sufficient"
        elif ratio >= 0.3:
            return "Medium"
        else:
            return "Low"

    def trigger_procurement_llm(self, item_name: str, zone_name: str, current: int, maximum: int) -> str:
        prompt = f"""
You are the Supply Chain Procurement Orchestrator Agent for a health network.
Inventory is critically low for an item. Please generate a detailed procurement request report.

Details:
- Item: {item_name}
- Zone: {zone_name}
- Current Stock: {current}
- Max Capacity: {maximum}

Generate a concise, professional procurement alert detailing the urgency, estimated refill needed, and immediate actions to be taken by the supply chain team.
"""
        logger.info("Triggering Agno LLM Agent for procurement of %s at %s", item_name, zone_name)
        
        try:
            response = self.agent.run(prompt)
            return response.content
        except Exception as e:
            logger.error("Failed to call Agno LLM for procurement: %s", e)
            return "Error generating procurement report due to API failure."

    def poll_once(self) -> Dict[str, Any]:
        """Runs one cycle of the orchestrator and returns a comprehensive report."""
        logger.info("Running API-driven poll of inventory data...")
        inventory = self.read_inventory()
        
        results = []
        for item in inventory:
            status = self.categorize_stock(item["current_stock"], item["max_stock"])
            item_key = f"{item['zone_name']}_{item['item_name']}"
            
            item_data = {
                "zone_name": item["zone_name"],
                "item_name": item["item_name"],
                "current_stock": item["current_stock"],
                "max_stock": item["max_stock"],
                "status": status,
                "ai_insight": None
            }
            
            if status == "Low":
                if self.alerted_items.get(item_key) != "Low":
                    logger.warning(f"Low stock detected for {item['item_name']} in {item['zone_name']}")
                    report = self.trigger_procurement_llm(
                        item["item_name"], item["zone_name"], item["current_stock"], item["max_stock"]
                    )
                    item_data["ai_insight"] = report
                    self.alerted_items[item_key] = "Low"
                else:
                    item_data["ai_insight"] = "Alert previously generated. Awaiting restock."
            elif status == "Sufficient":
                if self.alerted_items.get(item_key) == "Low":
                    restored_msg = f"Data restored and sufficient for {item['item_name']} in {item['zone_name']}."
                    logger.info(restored_msg)
                    item_data["ai_insight"] = restored_msg
                    self.alerted_items[item_key] = "Sufficient"
            
            results.append(item_data)
            
        return {"inventory_status": results}
