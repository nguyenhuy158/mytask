import os
import re

import requests

API_URL = "http://localhost:8000/tasks"

SKIP_DIRECTORIES = {
    "node_modules",
    ".venv",
    ".git",
    "__pycache__",
    "dist",
    "build",
}

SUPPORTED_EXTENSIONS = (".py", ".js", ".ts", ".tsx", ".go", ".rs", ".sql", ".md")

MARKER_PATTERN = re.compile(
    r"(?:#|//|--|/\*)\s*"
    r"(TODO|FIXME|XXX|HACK)\b"
    r"(?:\(([^)]+)\))?"
    r"\s*:?\s*"
    r"(.*?)"
    r"(?:\s*\*/)?\s*$",
    re.IGNORECASE,
)


def scan_todos(directory):
    todos = []
    for root, _dirs, files in os.walk(directory):
        if any(skipped in root.split(os.sep) for skipped in SKIP_DIRECTORIES):
            continue

        for file_name in files:
            if not file_name.endswith(SUPPORTED_EXTENSIONS):
                continue

            path = os.path.join(root, file_name)
            try:
                with open(path, encoding="utf-8") as source:
                    for line_number, line in enumerate(source, 1):
                        match = MARKER_PATTERN.search(line)
                        if not match:
                            continue

                        marker = match.group(1).upper()
                        assignee = match.group(2)
                        body = match.group(3).strip() if match.group(3) else ""

                        name = f"{marker}: {body}" if body else marker
                        description_parts = [
                            f"Found in {file_name} at line {line_number}"
                        ]
                        if assignee:
                            description_parts.append(f"Assigned to {assignee.strip()}")

                        todos.append(
                            {
                                "name": name,
                                "description": " | ".join(description_parts),
                                "task_type": "code_todo",
                                "priority": 3,
                            }
                        )
            except OSError as error:
                print(f"Error reading {path}: {error}")
    return todos


def sync_to_backend(todos):
    try:
        existing_tasks = requests.get(API_URL).json()
        existing_names = {task["name"] for task in existing_tasks}
    except Exception:
        existing_names = set()

    for todo in todos:
        if todo["name"] not in existing_names:
            try:
                response = requests.post(API_URL, json=todo)
                if response.status_code == 200:
                    print(f"Created task: {todo['name']}")
            except Exception as error:
                print(f"Failed to create task {todo['name']}: {error}")


if __name__ == "__main__":
    workspace_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
    print(f"Scanning workspace: {workspace_root}")
    found_todos = scan_todos(workspace_root)
    print(f"Found {len(found_todos)} TODOs. Syncing...")
    sync_to_backend(found_todos)
