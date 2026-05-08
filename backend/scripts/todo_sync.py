import os
import re

import requests

API_URL = "http://localhost:8000/tasks"


def scan_todos(directory):
    todos = []
    # Simplified regex for TODO comments
    pattern = re.compile(r"(?:#|//|--)\s*TODO:\s*(.*)", re.IGNORECASE)

    for root, _dirs, files in os.walk(directory):
        if any(
            d in root
            for d in ["node_modules", ".venv", ".git", "__pycache__", "dist", "build"]
        ):
            continue

        for file in files:
            if file.endswith(
                (".py", ".js", ".ts", ".tsx", ".go", ".rs", ".sql", ".md")
            ):
                path = os.path.join(root, file)
                try:
                    with open(path, encoding="utf-8") as f:
                        for i, line in enumerate(f, 1):
                            match = pattern.search(line)
                            if match:
                                todos.append(
                                    {
                                        "name": f"TODO: {match.group(1).strip()}",
                                        "description": f"Found in {file} at line {i}",
                                        "task_type": "code_todo",
                                        "priority": 3,
                                    }
                                )
                except Exception as e:
                    print(f"Error reading {path}: {e}")
    return todos


def sync_to_backend(todos):
    # Get existing tasks to avoid duplicates
    try:
        existing_tasks = requests.get(API_URL).json()
        existing_names = {t["name"] for t in existing_tasks}
    except Exception:
        existing_names = set()

    for todo in todos:
        if todo["name"] not in existing_names:
            try:
                res = requests.post(API_URL, json=todo)
                if res.status_code == 200:
                    print(f"Created task: {todo['name']}")
            except Exception as e:
                print(f"Failed to create task {todo['name']}: {e}")


if __name__ == "__main__":
    workspace_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
    print(f"Scanning workspace: {workspace_root}")
    found_todos = scan_todos(workspace_root)
    print(f"Found {len(found_todos)} TODOs. Syncing...")
    sync_to_backend(found_todos)
