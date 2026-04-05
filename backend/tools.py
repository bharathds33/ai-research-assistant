from tavily import TavilyClient
from config import TAVILY_API_KEY
import os

client = TavilyClient(api_key=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)

def search_tool(query: str):
    print("🔍 Searching...")
    result = client.search(query=query, max_results=5)
    return str(result)

def save_report_tool(content: str):
    print("💾 Saving report...")
    os.makedirs("reports", exist_ok=True)
    with open("reports/report.txt", "w", encoding="utf-8") as f:
        f.write(content)
    return "Report saved"