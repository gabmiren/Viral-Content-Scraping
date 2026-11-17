"""Build index.html from src/template.html and top50.json.

Run after updating top50.json with a new scan:
    python3 build.py
"""
import json
from pathlib import Path

root = Path(__file__).parent
data = json.loads((root / "top50.json").read_text(encoding="utf-8"))
template = (root / "src" / "template.html").read_text(encoding="utf-8")
html = template.replace("/*__DATA__*/[]", json.dumps(data, ensure_ascii=False))
(root / "index.html").write_text(html, encoding="utf-8")
print(f"index.html built with {len(data)} posts")
