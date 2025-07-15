#!/usr/bin/env python3
"""CLI tool to upload an Excel file to the BakeMate import API."""
import argparse
import time
from pathlib import Path
import requests

DEFAULT_BASE_URL = "http://localhost:8000"


def parse_args():
    parser = argparse.ArgumentParser(description="Upload a workbook for import")
    parser.add_argument("--user", required=True, help="User email")
    parser.add_argument("--passwd", required=True, help="User password")
    parser.add_argument("--file", required=True, help="Path to Excel workbook")
    parser.add_argument(
        "--base-url",
        default=DEFAULT_BASE_URL,
        help=f"API base url (default: {DEFAULT_BASE_URL})",
    )
    return parser.parse_args()


def get_token(base_url: str, username: str, password: str) -> str:
    token_url = f"{base_url}/api/v1/auth/login/access-token"
    data = {"username": username, "password": password}
    headers = {"Content-Type": "application/x-www-form-urlencoded"}
    resp = requests.post(token_url, data=data, headers=headers, timeout=10)
    resp.raise_for_status()
    return resp.json()["access_token"]


def upload_file(base_url: str, token: str, file_path: Path) -> str:
    url = f"{base_url}/api/v1/imports/"
    with open(file_path, "rb") as f:
        files = {
            "file": (
                file_path.name,
                f,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            )
        }
        headers = {"Authorization": f"Bearer {token}"}
        resp = requests.post(url, files=files, headers=headers, timeout=30)
    resp.raise_for_status()
    return resp.json()["job_id"]


def wait_for_job(base_url: str, token: str, job_id: str) -> dict:
    url = f"{base_url}/api/v1/imports/{job_id}"
    headers = {"Authorization": f"Bearer {token}"}
    for _ in range(60):
        resp = requests.get(url, headers=headers, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        if data["status"] in {"completed", "failed"}:
            return data
        time.sleep(1)
    raise TimeoutError("Job did not finish in time")


def main() -> int:
    args = parse_args()
    file_path = Path(args.file)
    if not file_path.exists():
        print(f"File {file_path} not found")
        return 1

    try:
        token = get_token(args.base_url, args.user, args.passwd)
    except Exception as exc:
        print(f"Failed to obtain token: {exc}")
        return 1

    try:
        job_id = upload_file(args.base_url, token, file_path)
        print(f"Job {job_id} queued")
        result = wait_for_job(args.base_url, token, job_id)
    except Exception as exc:
        print(f"Import failed: {exc}")
        return 1

    print("Job finished with status", result["status"])
    if result.get("summary"):
        print("Summary:")
        print(result["summary"])
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
