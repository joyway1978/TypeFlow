from __future__ import annotations

import os
import subprocess
import sys


def main() -> None:
    port = int(os.environ.get("PORT", "8000"))
    host = os.environ.get("HOST", "127.0.0.1")

    cmd = [
        "uv",
        "run",
        "uvicorn",
        "main:app",
        "--host",
        host,
        "--port",
        str(port),
        "--reload",
    ]

    try:
        subprocess.check_call(cmd, cwd=os.path.dirname(__file__))
    except FileNotFoundError:
        print("Error: 'uv' not found. Install uv or run uvicorn directly.")
        sys.exit(1)


if __name__ == "__main__":
    main()
