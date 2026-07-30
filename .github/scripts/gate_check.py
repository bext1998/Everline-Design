#!/usr/bin/env python3
"""Everline gate-keeping CI checks.

Mechanical enforcement of the AGENTS.md rules that do not require design
judgement:

1. tokens/everline-draft.tokens.json parses, has no duplicate keys, and every
   {alias} reference resolves — recursively — to a concrete value. Missing
   aliases and alias cycles are both reported (cycles include the full path).
2. All tracked .svg files are well-formed XML.
3. Text assets (md/json/svg/html/css/js) decode as UTF-8.
4. Asset filenames under works/, exports/, tokens/, docs/, references/ follow
   the lowercase-hyphen convention. Only files ADDED or RENAMED in the current
   diff are linted (legacy names are grandfathered; pass the diff base via
   --base <ref>). Without --base the filename lint is skipped.

Exit code 0 = all checks passed, 1 = at least one violation.
Standard library only; framework neutral.
"""

import argparse
import json
import re
import subprocess
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

NAME_RE = re.compile(r"^[a-z0-9]+(-[a-z0-9]+)*(\.[a-z0-9]+)+$")
ALIAS_RE = re.compile(r"\{([^{}]+)\}")
LINT_DIRS = ("works/", "exports/", "tokens/", "docs/", "references/")
TEXT_EXTS = {".md", ".json", ".svg", ".html", ".css", ".js"}


class Reporter:
    def __init__(self):
        self.failures = []

    def fail(self, check: str, msg: str) -> None:
        self.failures.append(f"[{check}] {msg}")


def tracked_files(root):
    out = subprocess.run(
        ["git", "ls-files"], cwd=root, capture_output=True, text=True, check=True
    )
    return [line for line in out.stdout.splitlines() if line]


def changed_added_files(root, base):
    out = subprocess.run(
        ["git", "diff", "--name-only", "--diff-filter=AR", base, "HEAD"],
        cwd=root, capture_output=True, text=True, check=True,
    )
    return [line for line in out.stdout.splitlines() if line]


def _collect_tokens(data, rep):
    """Flatten token tree; returns {path: raw $value}. Reports duplicates."""
    paths = {}

    def walk(node, prefix):
        if isinstance(node, dict):
            if "$value" in node:
                paths[prefix] = node["$value"]
            for k, v in node.items():
                if not k.startswith("$"):
                    walk(v, f"{prefix}.{k}" if prefix else k)

    walk(data, "")
    return paths


def check_tokens(tokens_path, rep) -> None:
    """Parse tokens file; report duplicates, missing aliases, alias cycles.

    Aliases are resolved recursively: an alias target that is itself an alias
    must also resolve, and cycles (a -> b -> a) are reported with their path.
    """
    if not tokens_path.exists():
        rep.fail("tokens", f"{tokens_path} not found")
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
        data = json.loads(tokens_path.read_text(encoding="utf-8"), object_pairs_hook=no_dupes)
    except Exception as e:  # noqa: BLE001 - report any parse failure
        rep.fail("tokens", f"JSON parse error: {e}")
        return

    for k in duplicates:
        rep.fail("tokens", f"duplicate key: {k}")

    paths = _collect_tokens(data, rep)

    def refs_of(path):
        v = paths.get(path)
        return ALIAS_RE.findall(v) if isinstance(v, str) else []

    # Iterative DFS per origin, tracking the current chain for cycle paths.
    for origin in sorted(paths):
        stack = [(origin, iter(refs_of(origin)), [origin])]
        visited_in_run = set()
        while stack:
            node, it, chain = stack[-1]
            advanced = False
            for ref in it:
                if ref not in paths:
                    rep.fail("tokens", f"alias {{{ref}}} used by '{node}' does not resolve")
                    continue
                if ref in chain:
                    cycle = " -> ".join(chain + [ref])
                    rep.fail("tokens", f"alias cycle detected: {cycle}")
                    continue
                if ref in visited_in_run:
                    continue
                visited_in_run.add(ref)
                stack.append((ref, iter(refs_of(ref)), chain + [ref]))
                advanced = True
                break
            if not advanced:
                stack.pop()


def check_svg(root, files, rep) -> None:
    for f in files:
        if not f.endswith(".svg"):
            continue
        try:
            ET.parse(Path(root) / f)
        except Exception as e:  # noqa: BLE001
            rep.fail("svg", f"{f}: XML parse error: {e}")


def check_utf8(root, files, rep) -> None:
    for f in files:
        if Path(f).suffix.lower() not in TEXT_EXTS:
            continue
        p = Path(root) / f
        if not p.exists():
            continue
        try:
            p.read_text(encoding="utf-8")
        except UnicodeDecodeError as e:
            rep.fail("utf-8", f"{f}: not valid UTF-8 ({e})")


def check_filenames(files, rep) -> None:
    for f in files:
        if not f.startswith(LINT_DIRS):
            continue
        name = Path(f).name
        if not NAME_RE.match(name):
            rep.fail(
                "filename",
                f"{f}: asset names must be lowercase letters/digits/hyphens "
                f"(AGENTS.md asset naming rule)",
            )


def run_checks(root, base=None):
    rep = Reporter()
    root = Path(root)
    check_tokens(root / "tokens" / "everline-draft.tokens.json", rep)
    files = tracked_files(root)
    check_svg(root, files, rep)
    check_utf8(root, files, rep)
    if base:
        check_filenames(changed_added_files(root, base), rep)
    return rep


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--base", help="git ref to diff against for filename lint")
    ap.add_argument("--root", default=str(Path(__file__).resolve().parents[2]))
    args = ap.parse_args()

    rep = run_checks(args.root, args.base)
    if rep.failures:
        print("Gate checks FAILED:")
        for f in rep.failures:
            print(" -", f)
        return 1
    print("Gate checks passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
