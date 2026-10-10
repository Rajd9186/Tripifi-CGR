
#!/usr/bin/env python3
"""
Tripifi CGR - Complete Repository Snapshot
------------------------------------------
Creates:
  1. Timestamped ZIP snapshot
  2. SHA-256 file manifest (CSV)
  3. Excluded files report (CSV)
  4. Git status, latest commit, remotes, and diffs
  5. Snapshot metadata

Python 3.9+
No third-party dependencies.
"""

import argparse
import csv
import hashlib
import json
import os
import subprocess
import sys
import zipfile

from datetime import datetime, timezone
from pathlib import Path


EXCLUDED_DIRS = {
    "node_modules",
    ".next",
    ".turbo",
    ".vercel",
    "coverage",
    "dist",
    "build",
    "__pycache__",
    ".pytest_cache",
    ".mypy_cache",
    ".ruff_cache",
    ".venv",
    "venv",
    "env",
    "vendor",
}

EXCLUDED_FILES = {
    ".DS_Store",
    "Thumbs.db",
}

SECRET_NAMES = {
    ".env",
    ".env.local",
    ".env.development",
    ".env.production",
    ".env.test",
    "credentials.json",
    "service-account.json",
    "id_rsa",
    "id_ed25519",
}

SECRET_EXTENSIONS = {
    ".pem",
    ".p12",
    ".pfx",
    ".key",
}

SAFE_ENV_TEMPLATES = {
    ".env.example",
    ".env.sample",
    ".env.template",
}

TEMP_SUFFIXES = {
    ".pyc",
    ".pyo",
    ".tmp",
    ".log",
    ".tsbuildinfo",
}


def sha256_file(path: Path) -> str:
    """Calculate SHA-256 without loading the entire file into memory."""
    digest = hashlib.sha256()

    with path.open("rb") as file:
        for chunk in iter(lambda: file.read(1024 * 1024), b""):
            digest.update(chunk)

    return digest.hexdigest()


def run_git(repo: Path, *args: str) -> str:
    """Run a Git command safely and return its output."""
    try:
        result = subprocess.run(
            ["git", "-C", str(repo), *args],
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            timeout=30,
            check=False,
        )

        if result.returncode != 0:
            return (
                f"Git command failed: {result.stderr.strip()}\n"
                f"Exit code: {result.returncode}\n"
            )

        return result.stdout

    except FileNotFoundError:
        return "Git is not installed or not available on PATH.\n"
    except subprocess.TimeoutExpired:
        return "Git command timed out.\n"


def is_git_repository(repo: Path) -> bool:
    """Check whether the folder belongs to a Git working tree."""
    result = subprocess.run(
        ["git", "-C", str(repo), "rev-parse", "--show-toplevel"],
        capture_output=True,
        text=True,
        check=False,
    )
    return result.returncode == 0


def write_csv(path: Path, fieldnames: list, rows: list) -> None:
    """Write a UTF-8 CSV report."""
    with path.open("w", newline="", encoding="utf-8-sig") as file:
        writer = csv.DictWriter(file, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


def main():
    parser = argparse.ArgumentParser(
        description="Create a ZIP snapshot of a software repository."
    )

    parser.add_argument(
        "--repo",
        default=".",
        help="Repository directory (default: current directory)",
    )

    parser.add_argument(
        "--output",
        default=None,
        help="Snapshot output directory (default: sibling folder)",
    )

    parser.add_argument(
        "--include-dependencies",
        action="store_true",
        help="Include node_modules and virtual environments",
    )

    parser.add_argument(
        "--include-secrets",
        action="store_true",
        help="Include likely secrets. Use only for secure local backups.",
    )

    parser.add_argument(
        "--include-git-diff",
        action="store_true",
        help="Include tracked staged and unstaged Git diffs in the archive",
    )

    args = parser.parse_args()

    repo = Path(args.repo).expanduser().resolve()

    if not repo.is_dir():
        parser.error(f"Repository directory does not exist: {repo}")

    if args.output:
        output_dir = Path(args.output).expanduser().resolve()
    else:
        output_dir = repo.parent / "TripifiCGR-Snapshots"

    # Refuse to create a snapshot inside the source repository.
    if output_dir == repo or repo in output_dir.parents:
        parser.error(
            "Output directory must be outside the repository to avoid "
            "including previous snapshots."
        )

    output_dir.mkdir(parents=True, exist_ok=True)

    timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    snapshot_name = f"{repo.name}_snapshot_{timestamp}"
    zip_path = output_dir / f"{snapshot_name}.zip"

    excluded_dirs = set(EXCLUDED_DIRS)

    if args.include_dependencies:
        excluded_dirs -= {
            "node_modules",
            ".venv",
            "venv",
            "env",
            "vendor",
        }

    included_files = []
    excluded_files = []

    print(f"\nRepository: {repo}")
    print(f"Output:     {output_dir}")
    print("Scanning files...\n")

    # os.walk allows excluded folders to be pruned before scanning them.
    for root, dirs, filenames in os.walk(
        repo, topdown=True, followlinks=False
    ):
        root_path = Path(root)

        # Prune ignored/generated directories and symlinks.
        remaining_dirs = []

        for directory in dirs:
            directory_path = root_path / directory
            relative = directory_path.relative_to(repo).as_posix()

            if directory in excluded_dirs:
                excluded_files.append({
                    "path": relative,
                    "reason": "Excluded directory",
                })
                continue

            if directory_path.is_symlink():
                excluded_files.append({
                    "path": relative,
                    "reason": "Directory symlink",
                })
                continue

            remaining_dirs.append(directory)

        dirs[:] = remaining_dirs

        for filename in filenames:
            path = root_path / filename
            relative = path.relative_to(repo).as_posix()

            if path.is_symlink():
                excluded_files.append({
                    "path": relative,
                    "reason": "File symlink",
                })
                continue

            if filename in EXCLUDED_FILES or path.suffix.lower() in TEMP_SUFFIXES:
                excluded_files.append({
                    "path": relative,
                    "reason": "Temporary/generated file",
                })
                continue

            is_secret = (
                filename in SECRET_NAMES
                or path.name.startswith(".env.")
                or path.suffix.lower() in SECRET_EXTENSIONS
            )

            if filename in SAFE_ENV_TEMPLATES:
                is_secret = False

            if is_secret and not args.include_secrets:
                excluded_files.append({
                    "path": relative,
                    "reason": "Potential secret",
                })
                continue

            included_files.append((path, relative))

    manifest_rows = []
    total_bytes = 0

    print(f"Files selected: {len(included_files)}")
    print(f"Items excluded: {len(excluded_files)}")
    print("Creating ZIP and calculating file hashes...\n")

    try:
        with zipfile.ZipFile(
            zip_path,
            mode="w",
            compression=zipfile.ZIP_DEFLATED,
            compresslevel=6,
            allowZip64=True,
        ) as archive:

            for index, (source, relative) in enumerate(
                included_files, start=1
            ):
                try:
                    digest = hashlib.sha256()
                    file_size = 0

                    # Stream files into the ZIP to avoid loading large
                    # source files into memory.
                    with source.open("rb") as input_file:
                        with archive.open(relative, "w") as output_file:
                            while True:
                                chunk = input_file.read(1024 * 1024)

                                if not chunk:
                                    break

                                output_file.write(chunk)
                                digest.update(chunk)
                                file_size += len(chunk)

                    manifest_rows.append({
                        "path": relative,
                        "size_bytes": file_size,
                        "sha256": digest.hexdigest(),
                    })

                    total_bytes += file_size

                except (OSError, zipfile.BadZipFile) as exc:
                    excluded_files.append({
                        "path": relative,
                        "reason": f"Read/archive error: {exc}",
                    })
                    print(f"WARNING: Could not archive {relative}: {exc}")

                if index % 100 == 0:
                    print(f"  Processed {index}/{len(included_files)} files")

            # Git reports
            if is_git_repository(repo):
                reports = {
                    "SNAPSHOT_GIT_STATUS.txt": [
                        "status", "--short", "--branch"
                    ],
                    "SNAPSHOT_GIT_COMMIT.txt": [
                        "log", "-1",
                        "--format=Commit: %H%nSubject: %s%n"
                        "Author: %an%nDate: %aI",
                    ],
                    "SNAPSHOT_GIT_REMOTES.txt": ["remote", "-v"],
                }

                for report_name, git_args in reports.items():
                    report_content = run_git(repo, *git_args)
                    archive.writestr(report_name, report_content)

                if args.include_git_diff:
                    archive.writestr(
                        "SNAPSHOT_GIT_DIFF.txt",
                        run_git(repo, "diff", "--binary"),
                    )
                    archive.writestr(
                        "SNAPSHOT_GIT_STAGED_DIFF.txt",
                        run_git(repo, "diff", "--cached", "--binary"),
                    )

            # Add a manifest covering archived source files.
            manifest_text = json.dumps(
                manifest_rows, indent=2, ensure_ascii=False
            )
            archive.writestr(
                "SNAPSHOT_MANIFEST.json",
                manifest_text,
            )

            # CSV is convenient for opening in Excel.
            import io

            csv_buffer = io.StringIO(newline="")
            writer = csv.DictWriter(
                csv_buffer,
                fieldnames=["path", "size_bytes", "sha256"],
            )
            writer.writeheader()
            writer.writerows(manifest_rows)

            archive.writestr(
                "SNAPSHOT_MANIFEST.csv",
                csv_buffer.getvalue().encode("utf-8-sig"),
            )

            excluded_buffer = io.StringIO(newline="")
            excluded_writer = csv.DictWriter(
                excluded_buffer,
                fieldnames=["path", "reason"],
            )
            excluded_writer.writeheader()
            excluded_writer.writerows(excluded_files)

            archive.writestr(
                "SNAPSHOT_EXCLUDED_FILES.csv",
                excluded_buffer.getvalue().encode("utf-8-sig"),
            )

            info = {
                "repository": repo.name,
                "source_path": str(repo),
                "created_at_utc": datetime.now(timezone.utc).isoformat(),
                "included_files": len(manifest_rows),
                "excluded_items": len(excluded_files),
                "uncompressed_bytes": total_bytes,
                "include_dependencies": args.include_dependencies,
                "include_secrets": args.include_secrets,
                "include_git_diff": args.include_git_diff,
                "git_history_included": False,
            }

            archive.writestr(
                "SNAPSHOT_INFO.json",
                json.dumps(info, indent=2),
            )

        # Validate ZIP structure.
        with zipfile.ZipFile(zip_path, "r") as archive:
            bad_entry = archive.testzip()

            if bad_entry:
                raise RuntimeError(
                    f"ZIP verification failed at entry: {bad_entry}"
                )

            entry_count = len(archive.namelist())

    except Exception:
        if zip_path.exists():
            zip_path.unlink()
        raise

    print("\n" + "=" * 55)
    print("SNAPSHOT CREATED SUCCESSFULLY")
    print("=" * 55)
    print(f"Archive:           {zip_path}")
    print(f"Files archived:    {len(manifest_rows)}")
    print(f"Items excluded:    {len(excluded_files)}")
    print(f"ZIP entries:       {entry_count}")
    print(f"Source size:       {total_bytes:,} bytes")
    print(f"ZIP size:          {zip_path.stat().st_size:,} bytes")
    print(f"Archive SHA-256:   {sha256_file(zip_path)}")
    print("\nReview the excluded-files report before sharing the ZIP.")
    print("Git history is not included; use git bundle for a full history backup.")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\nSnapshot cancelled.")
        sys.exit(130)
    except Exception as exc:
        print(f"\nERROR: {exc}", file=sys.stderr)
        sys.exit(1)