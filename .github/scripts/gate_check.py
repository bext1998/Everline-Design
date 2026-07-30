#!/usr/bin/env python3
"""Everline gate-keeping CI checks.

Mechanical enforcement of the AGENTS.md rules that do not require design
judgement:

1. tokens/everline-draft.tokens.json parses, has no duplicate keys, and every
   {alias} reference points at an existing token.
2. All tracked .svg files are well-formed XML.
3. Text assets (md/json/svg/html/css/js) decode as UTF-8.
4. Asset filenames under works/, exports/, tokens/, docs/, references/ follow
   the lowercase-hyphen convention. Only files ADDED or RENAMED in the current
   diff are linted (legacy names are grandfathered; pass the diff base via
   --base <ref>). Without --base the filename lint is skipped.

Exit code 0 = all checks passed, 1 = at least one violation.
"""

import argparse
import json
import re
import subprocess
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
TOKENS = ROOT / "tokens" / "everline-draft.tokens.json"
NAME_RE = re.compile(r"^[a-z0-9]+(-[a-z0-9]+)*(\.[a-z0-9]+)+$")
ALIAS_RE = re.compile(r"\{([^{}]+)\}")
LINT_DIRS = ("works/", "exports/", "tokens/", "docs/", "references/")
TEXT_EXTS = {".md", ".json", ".svg", ".html", ".css", ".js"}

failures = []


def fail(check: str, msg: str) -> None:
    failures.append(f"[{check}] {msg}")


def tracked_files():
    out = subprocess.run(
        ["git", "ls-files"], cwd=ROOT, capture_output=True, text=True, check=True
    )
    return [line for line in out.stdout.splitlines() if line]


def check_tokens() -> None:
    if not TOKENS.exists():
        fail("tokens", f"{TOKENS.relative_to(ROOT)} not found")
        return

    duplicates = []

    def no_dupes(pairs):
        seen = {}
        for k, v in pairs:
            if k in seen:
                duplicates.append(k)
            seen[k] = v
        return seen

    try:
        data = json.loads(TOKENS.read_text(encoding="utf-8"), object_pairs_hook=no_dupes)
    except Exception as e:  # noqa: BLE001 - report any parse failure
        fail("tokens", f"JSON parse error: {e}")
        return

    for k in duplicates:
        fail("tokens", f"duplicate key: {k}")

    paths = set()
    aliases = []

    def walk(node, prefix):
        if isinstance(node, dict):
            if "$value" in node:
                paths.add(prefix)
                if isinstance(node["$value"], str):
                    aliases.extend((m, prefix) for m in ALIAS_RE.findall(node["$value"]))
            for k, v in node.items():
                if not k.startswith("$"):
                    walk(v, f"{prefix}.{k}" if prefix else k)

    walk(data, "")
    for ref, origin in aliases:
        if ref not in paths:
            fail("tokens", f"alias {{{ref}}} used by '{origin}' does not resolve")


def check_svg(files):
    for f in files:
        if not f.endswith(".svg"):
            continue
        try:
            ET.parse(ROOT / f)
        except Exception as e:  # noqa: BLE001
            fail("svg", f"{f}: XML parse error: {e}")


def check_utf8(files):
    for f in files:
        if Path(f).suffix.lower() not in TEXT_EXTS:
            continue
        p = ROOT / f
        if not p.exists():
            continue
        try:
            p.read_text(encoding="utf-8")
        except UnicodeDecodeError as e:
            fail("utf-8", f"{f}: not valid UTF-8 ({e})")


def changed_added_files(base):
    out = subprocess.run(
        ["git", "diff", "--name-only", "--diff-filter=AR", base, "HEAD"],
        cwd=ROOT, capture_output=True, text=True, check=True,
    )
    return [line for line in out.stdout.splitlines() if line]


def check_filenames(files):
    for f in files:
        if not f.startswith(LINT_DIRS):
            continue
        name = Path(f).name
        if not NAME_RE.match(name):
            fail(
                "filename",
                f"{f}: asset names must be lowercase letters/digits/hyphens "
                f"(AGENTS.md asset naming rule)",
            )


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--base", help="git ref to diff against for filename lint")
    args = ap.parse_args()

    files = tracked_files()
    check_tokens()
    check_svg(files)
    check_utf8(files)
    if args.base:
        check_filenames(changed_added_files(args.base))

    if failures:
        print("Gate checks FAILED:")
        for f_ in failures:
            print(" -", f_)
        return 1
    print(f"Gate checks passed ({len(files)} tracked files scanned).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
