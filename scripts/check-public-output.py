#!/usr/bin/env python3
"""Check the actual Pages artifact before uploading it."""

import base64
import hashlib
import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit


MATHJAX_URL = "https://cdn.jsdelivr.net/npm/mathjax@3.2.2/es5/tex-chtml.js"
MATHJAX_SRI = "sha384-AHAnt9ZhGeHIrydA1Kp1L7FN+2UosbF7RQg6C+9Is/a7kDpQ1684C2iH2VWil6r4"
SECRET_PATTERNS = (
    r"-----BEGIN (?:RSA |EC |OPENSSH |DSA |ENCRYPTED )?PRIVATE KEY-----",
    r"\bsb_secret_[A-Za-z0-9_-]{16,}\b",
    r"\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,})\b",
    r"\b(?:AKIA|ASIA)[A-Z0-9]{16}\b",
)


class PageCheck(HTMLParser):
    def __init__(self, root, path, errors):
        super().__init__()
        self.root, self.path, self.errors = root, path, errors
        self.policy = ""
        self.scripts = 0

    def fail(self, message):
        self.errors.append(f"{self.path.relative_to(self.root)}: {message}")

    def check_integrity(self, url, integrity):
        parsed = urlsplit(url)
        if parsed.scheme or parsed.netloc:
            if url != MATHJAX_URL or integrity != MATHJAX_SRI:
                self.fail("unapproved external asset or missing integrity hash")
            return
        asset = (self.root / unquote(parsed.path).lstrip("/") if url.startswith("/")
                 else self.path.parent / unquote(parsed.path)).resolve()
        if not asset.is_relative_to(self.root) or not asset.is_file():
            self.fail("asset is missing or outside the public directory")
            return
        algorithm, _, digest = integrity.partition("-")
        if algorithm not in {"sha256", "sha384", "sha512"}:
            self.fail("asset is missing a supported integrity hash")
        elif base64.b64encode(hashlib.new(algorithm, asset.read_bytes()).digest()).decode() != digest:
            self.fail("asset integrity hash does not match its bytes")

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if any(key.startswith("on") for key in attrs):
            self.fail("inline event handler")
        for name in ("src", "href", "action"):
            value = re.sub(r"[\x00-\x20]", "", attrs.get(name) or "").lower()
            if value.startswith(("http:", "javascript:", "vbscript:")):
                self.fail("insecure or executable URL")
        if tag == "meta" and attrs.get("http-equiv", "").lower() == "content-security-policy":
            self.policy = attrs.get("content", "")
        if tag == "script":
            self.scripts += 1
            if not self.policy:
                self.fail("script occurs before the content security policy")
            if not attrs.get("src"):
                self.fail("inline script")
            else:
                self.check_integrity(attrs["src"], attrs.get("integrity", ""))
                if attrs["src"] == MATHJAX_URL and attrs.get("crossorigin") != "anonymous":
                    self.fail("external script requires anonymous CORS for integrity checking")
        if tag == "link" and attrs.get("rel") == "stylesheet":
            self.check_integrity(attrs.get("href", ""), attrs.get("integrity", ""))

    def finish(self):
        if not self.scripts:
            return  # Static ownership-verification files have no executable content.
        directives = {parts[0]: parts[1:] for item in self.policy.split(";") if (parts := item.split())}
        for name in ("default-src", "base-uri", "object-src", "form-action", "connect-src", "frame-src"):
            if directives.get(name) != ["'none'"]:
                self.fail(f"{name} must deny access")
        if "'self'" not in directives.get("script-src", []):
            self.fail("missing script source restriction")
        if any(value in directives.get("script-src", []) for value in ("'unsafe-inline'", "'unsafe-eval'", "*")):
            self.fail("script policy permits inline, evaluated, or arbitrary remote code")


def check(root):
    errors = []
    pages = 0
    if not (root / "index.html").is_file():
        return ["No built homepage found"], pages
    for path in root.rglob("*"):
        relative = path.relative_to(root)
        if path.is_symlink():
            errors.append(f"{relative}: symlink in public output")
        if not path.is_file():
            continue
        if ("tracker" in relative.parts or "gym-tracker" in relative.parts
                or any(part.startswith(".") and part != ".nojekyll" for part in relative.parts)
                or path.suffix.lower() in {".sql", ".env", ".pem", ".key", ".jsx"}):
            errors.append(f"{relative}: excluded file in public output")
        if path.suffix.lower() not in {".html", ".js", ".css", ".json", ".xml", ".txt"}:
            continue
        text = path.read_text()
        if any(re.search(pattern, text) for pattern in SECRET_PATTERNS):
            errors.append(f"{relative}: possible credential, value redacted")
        if path.suffix.lower() == ".html":
            parser = PageCheck(root, path, errors)
            parser.feed(text)
            parser.finish()
            pages += 1
    return errors, pages


if __name__ == "__main__":
    root = Path(sys.argv[1] if len(sys.argv) > 1 else "public").resolve()
    errors, pages = check(root)
    if errors:
        print("Public output checks failed:\n" + "\n".join(errors))
        sys.exit(1)
    print(f"Public output checks passed for {pages} HTML files.")
