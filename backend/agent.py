import os
from dotenv import load_dotenv
from tavily import TavilyClient

load_dotenv()

tavily_key = os.getenv("TAVILY_API_KEY")
tavily = TavilyClient(api_key=tavily_key)


def save_report(report: str, filename: str = "report.txt") -> None:
    os.makedirs("reports", exist_ok=True)
    with open(os.path.join("reports", filename), "w", encoding="utf-8") as file:
        file.write(report)


def run_agent(query: str) -> dict:
    if not tavily_key:
        return {"error": "TAVILY_API_KEY is missing in the .env file."}

    try:
        search_results = tavily.search(
            query=query,
            max_results=5,
            search_depth="advanced"
        )

        results = search_results.get("results", [])

        if not results:
            return {
                "query": query,
                "overview": "No results found.",
                "findings": [],
                "conclusion": "No relevant web sources were returned for this topic."
            }

        findings = []

        for result in results:
            title = result.get("title", "No title")
            content = result.get("content", "No content available")
            url = result.get("url", "No URL available")

            short_content = content[:300] + "..." if len(content) > 300 else content

            findings.append({
                "title": title,
                "summary": short_content,
                "url": url
            })

        response_data = {
            "query": query,
            "overview": f"{len(findings)} relevant sources were found for this topic.",
            "findings": findings,
            "conclusion": "This report is generated directly from live Tavily web search results."
        }

        report_lines = []
        report_lines.append("=" * 60)
        report_lines.append("WEB RESEARCH REPORT")
        report_lines.append("=" * 60)
        report_lines.append(f"TOPIC: {query}")
        report_lines.append("")
        report_lines.append("OVERVIEW")
        report_lines.append("-" * 60)
        report_lines.append(response_data["overview"])
        report_lines.append("")
        report_lines.append("KEY FINDINGS")
        report_lines.append("-" * 60)

        for index, item in enumerate(findings, start=1):
            report_lines.append(f"{index}. {item['title']}")
            report_lines.append(f"   Summary: {item['summary']}")
            report_lines.append(f"   Source: {item['url']}")
            report_lines.append("")

        report_lines.append("CONCLUSION")
        report_lines.append("-" * 60)
        report_lines.append(response_data["conclusion"])

        final_report = "\n".join(report_lines)
        save_report(final_report)

        return response_data

    except Exception as error:
        return {"error": str(error)}