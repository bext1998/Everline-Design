#!/usr/bin/env python3
"""Regression tests for gate_check.py (stdlib unittest, no third-party deps).

Covers: alias cycle, missing alias, duplicate key, illegal added/renamed
filename, multi-commit push diff, and the all-green normal case. SVG and
UTF-8 checks are exercised for non-regression.
"""

import importlib.util
import json
import subprocess
import tempfile
import unittest
from pathlib import Path

SPEC = importlib.util.spec_from_file_location(
    "gate_check", Path(__file__).with_name("gate_check.py")
)
g = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(g)

GIT_ENV = ["-c", "user.email=test@example.com", "-c", "user.name=test"]


def write_tokens(root, obj):
    p = Path(root) / "tokens"
    p.mkdir(parents=True, exist_ok=True)
    (p / "everline-draft.tokens.json").write_text(
        json.dumps(obj), encoding="utf-8"
    )


def base_tokens(value="#111111"):
    return {
        "color": {
            "base": {"c1": {"$type": "color", "$value": value}},
            "semantic": {"s1": {"$type": "color", "$value": "{color.base.c1}"}},
        }
    }


class TokenChecks(unittest.TestCase):
    def run_tokens(self, obj_or_text):
        with tempfile.TemporaryDirectory() as d:
            if isinstance(obj_or_text, str):
                p = Path(d) / "tokens"
                p.mkdir()
                (p / "everline-draft.tokens.json").write_text(obj_or_text, encoding="utf-8")
            else:
                write_tokens(d, obj_or_text)
            rep = g.Reporter()
            g.check_tokens(Path(d) / "tokens" / "everline-draft.tokens.json", rep)
            return rep.failures

    def test_normal_resolving_aliases_pass(self):
        t = base_tokens()
        t["color"]["semantic"]["s2"] = {"$type": "color", "$value": "{color.semantic.s1}"}
        self.assertEqual(self.run_tokens(t), [])

    def test_missing_alias_fails(self):
        t = base_tokens()
        t["color"]["semantic"]["s1"]["$value"] = "{color.base.nope}"
        self.assertTrue(any("does not resolve" in f for f in self.run_tokens(t)))

    def test_transitively_missing_alias_fails(self):
        t = base_tokens()
        t["color"]["semantic"]["s1"]["$value"] = "{color.base.nope}"
        t["color"]["semantic"]["s2"] = {"$type": "color", "$value": "{color.semantic.s1}"}
        fails = self.run_tokens(t)
        self.assertTrue(any("does not resolve" in f for f in fails))

    def test_alias_cycle_reported_with_path(self):
        t = base_tokens()
        t["color"]["base"]["c1"]["$value"] = "{color.semantic.s1}"
        # s1 -> color.base.c1 -> color.semantic.s1 : cycle
        fails = self.run_tokens(t)
        cyc = [f for f in fails if "cycle" in f]
        self.assertTrue(cyc, f"expected cycle failure, got {fails}")
        # cycle path may start at either node depending on traversal order
        self.assertIn("color.semantic.s1 -> color.base.c1 -> color.semantic.s1",
                      cyc[0].replace("color.base.c1 -> color.semantic.s1 -> color.base.c1",
                                     "color.semantic.s1 -> color.base.c1 -> color.semantic.s1"))

    def test_self_cycle_reported(self):
        t = base_tokens()
        t["color"]["base"]["c1"]["$value"] = "{color.base.c1}"
        self.assertTrue(any("cycle" in f for f in self.run_tokens(t)))

    def test_duplicate_key_reported(self):
        text = '{"a": {"$value": 1}, "a": {"$value": 2}}'
        self.assertTrue(any("duplicate key: a" in f for f in self.run_tokens(text)))

    def test_parse_error_reported(self):
        self.assertTrue(any("parse error" in f.lower() for f in self.run_tokens("{oops")))


class FilenameLint(unittest.TestCase):
    def make_repo(self):
        d = tempfile.TemporaryDirectory()
        root = Path(d.name)
        subprocess.run(["git", "init", "-q"], cwd=root, check=True)
        subprocess.run(["git", *GIT_ENV, "commit", "-q", "--allow-empty", "-m", "init"], cwd=root, check=True)
        return d, root

    def commit_file(self, root, rel, content="x"):
        p = Path(root) / rel
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(content, encoding="utf-8")
        subprocess.run(["git", "add", rel], cwd=root, check=True)
        subprocess.run(["git", *GIT_ENV, "commit", "-q", "-m", f"add {rel}"], cwd=root, check=True)

    def test_illegal_added_filename_caught(self):
        d, root = self.make_repo()
        self.addCleanup(d.cleanup)
        subprocess.run(["git", "rev-parse", "HEAD"], cwd=root, check=True, capture_output=True)
        base = subprocess.run(["git", "rev-parse", "HEAD"], cwd=root, capture_output=True, text=True).stdout.strip()
        self.commit_file(root, "works/Bad Name.svg", "<svg/>")
        rep = g.Reporter()
        g.check_filenames(g.changed_added_files(root, base), rep)
        self.assertTrue(any("Bad Name.svg" in f for f in rep.failures))

    def test_multi_commit_push_diff_covers_all_added(self):
        """Bad file lands in an EARLIER commit of the push; a later commit only
        adds a legal file. Full-push base must catch it; HEAD~1 must miss it."""
        d, root = self.make_repo()
        self.addCleanup(d.cleanup)
        base = subprocess.run(["git", "rev-parse", "HEAD"], cwd=root, capture_output=True, text=True).stdout.strip()
        self.commit_file(root, "tokens/BAD.json", "{}")          # commit 1 (bad, earlier commit)
        self.commit_file(root, "works/good-one.svg", "<svg/>")   # commit 2 (good, latest commit)

        # full-push base (github.event.before): catches the bad file
        rep_push = g.Reporter()
        g.check_filenames(g.changed_added_files(root, base), rep_push)
        self.assertEqual(len(rep_push.failures), 1)
        self.assertIn("BAD.json", rep_push.failures[0])

        # HEAD~1 base (the old buggy behaviour): misses it -> proves the fix matters
        rep_head1 = g.Reporter()
        g.check_filenames(g.changed_added_files(root, "HEAD~1"), rep_head1)
        self.assertEqual(rep_head1.failures, [])

    def test_illegal_rename_target_caught(self):
        """Renaming a legal legacy file to an illegal name must be flagged
        (diff-filter=R covers renames)."""
        d, root = self.make_repo()
        self.addCleanup(d.cleanup)
        self.commit_file(root, "works/old-good.svg", "<svg/>")
        base = subprocess.run(["git", "rev-parse", "HEAD"], cwd=root, capture_output=True, text=True).stdout.strip()
        subprocess.run(["git", "mv", "works/old-good.svg", "works/Renamed Bad.svg"], cwd=root, check=True)
        subprocess.run(["git", *GIT_ENV, "commit", "-q", "-m", "rename"], cwd=root, check=True)
        rep = g.Reporter()
        g.check_filenames(g.changed_added_files(root, base), rep)
        self.assertEqual(len(rep.failures), 1)
        self.assertIn("Renamed Bad.svg", rep.failures[0])

    def test_legacy_files_not_flagged_when_unchanged(self):
        d, root = self.make_repo()
        self.addCleanup(d.cleanup)
        self.commit_file(root, "works/LegacyName.ai", "bin")  # pre-existing legacy
        base = subprocess.run(["git", "rev-parse", "HEAD"], cwd=root, capture_output=True, text=True).stdout.strip()
        self.commit_file(root, "works/new-good.svg", "<svg/>")
        rep = g.Reporter()
        g.check_filenames(g.changed_added_files(root, base), rep)
        self.assertEqual(rep.failures, [])


class NonRegression(unittest.TestCase):
    """SVG / UTF-8 checks still catch what they caught before the refactor."""

    def test_bad_svg_fails(self):
        with tempfile.TemporaryDirectory() as d:
            (Path(d) / "broken.svg").write_text("<svg><unclosed>", encoding="utf-8")
            rep = g.Reporter()
            g.check_svg(d, ["broken.svg"], rep)
            self.assertTrue(any("broken.svg" in f for f in rep.failures))

    def test_good_svg_passes(self):
        with tempfile.TemporaryDirectory() as d:
            (Path(d) / "ok.svg").write_text("<svg xmlns='http://www.w3.org/2000/svg'/>", encoding="utf-8")
            rep = g.Reporter()
            g.check_svg(d, ["ok.svg"], rep)
            self.assertEqual(rep.failures, [])

    def test_non_utf8_fails(self):
        with tempfile.TemporaryDirectory() as d:
            (Path(d) / "doc.md").write_bytes(b"\xff\xfe invalid")
            rep = g.Reporter()
            g.check_utf8(d, ["doc.md"], rep)
            self.assertTrue(any("doc.md" in f for f in rep.failures))

    def test_utf8_passes(self):
        with tempfile.TemporaryDirectory() as d:
            (Path(d) / "doc.md").write_text("中文 UTF-8", encoding="utf-8")
            rep = g.Reporter()
            g.check_utf8(d, ["doc.md"], rep)
            self.assertEqual(rep.failures, [])


if __name__ == "__main__":
    unittest.main()
