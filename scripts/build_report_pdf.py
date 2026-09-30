"""Build reports/Drishti3D_Research_Report.pdf from the Markdown research report.

Usage (from the repo root):
    python scripts/build_report_pdf.py

Needs: Python `markdown` package and Google Chrome (or Microsoft Edge) for headless print-to-PDF.
"""
import html
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

import markdown

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "reports" / "Single pass drone 3D reconstruction.md"
OUT = ROOT / "reports" / "Drishti3D_Research_Report.pdf"
REPO_URL = "https://github.com/vikranthsai310/sih2026-2"

BROWSERS = [
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    "google-chrome", "chromium", "chromium-browser", "microsoft-edge",
]

CSS = """
@page { size: A4; margin: 20mm 18mm 18mm 18mm;
  @bottom-left  { content: "Drishti3D · Research report · SIH 2026 PS 26158"; font: 8.5pt Cambria, Georgia, serif; color: #6D747B; }
  @bottom-right { content: counter(page) " / " counter(pages); font: 8.5pt Cambria, Georgia, serif; color: #6D747B; } }
@page :first { margin: 0; @bottom-left { content: none; } @bottom-right { content: none; } }
* { box-sizing: border-box; }
body { font-family: Cambria, Georgia, "Times New Roman", serif; font-size: 10.6pt; line-height: 1.5; color: #1A1A1A; margin: 0; }
a { color: #1F4E9A; text-decoration: none; border-bottom: 0.5pt solid #9DB3D8; }
.cover { height: 297mm; padding: 34mm 22mm 20mm; background: #1F3863; color: #fff; page-break-after: always; position: relative; }
.cover .kicker { color: #EFC264; font-size: 12pt; letter-spacing: .12em; text-transform: uppercase; font-weight: bold; }
.cover h1 { font-size: 30pt; line-height: 1.15; margin: 10mm 0 6mm; color: #fff; border: 0; }
.cover .sub { font-size: 14pt; color: #DDE5F2; max-width: 150mm; }
.cover .meta { margin-top: 16mm; font-size: 11pt; line-height: 1.9; color: #fff; }
.cover .meta b { color: #EFC264; display: inline-block; min-width: 38mm; }
.cover .toc { margin-top: 14mm; background: rgba(255,255,255,.07); border: 1pt solid rgba(239,194,100,.5); border-radius: 3mm; padding: 6mm 8mm; }
.cover .toc h2 { color: #EFC264; font-size: 11pt; letter-spacing: .1em; margin: 0 0 3mm; border: 0; padding: 0; }
.cover .toc ol { margin: 0; padding-left: 5mm; }
.cover .toc li { margin: 1.2mm 0; font-size: 10.5pt; }
.cover .toc a { color: #fff; border-bottom: 0.5pt solid rgba(255,255,255,.35); }
.cover .foot { position: absolute; bottom: 16mm; left: 22mm; right: 22mm; font-size: 9pt; color: #AFC0DA; border-top: 0.75pt solid rgba(255,255,255,.3); padding-top: 3mm; }
.cover .foot a { color: #EFC264; border-bottom-color: rgba(239,194,100,.5); }
main { padding: 0; }
h1 { font-size: 20pt; color: #1F3863; margin: 0 0 5mm; line-height: 1.2; }
h2 { font-size: 14.5pt; color: #1F3863; margin: 8mm 0 3mm; padding-bottom: 1.5mm; border-bottom: 1pt solid #C8D5EA; page-break-after: avoid; }
h3 { font-size: 12pt; color: #2E5F8A; margin: 5mm 0 2mm; page-break-after: avoid; }
p { margin: 0 0 3mm; text-align: justify; hyphens: auto; }
ul, ol { margin: 0 0 3mm; padding-left: 6mm; }
li { margin: 0.8mm 0; }
strong { color: #111; }
table { width: 100%; border-collapse: collapse; margin: 3mm 0 5mm; font-size: 9pt; line-height: 1.35; page-break-inside: auto; }
thead { display: table-header-group; }
tr { page-break-inside: avoid; }
th { background: #1F3863; color: #fff; text-align: left; padding: 2mm 2.2mm; font-weight: bold; }
td { padding: 1.8mm 2.2mm; border-bottom: 0.5pt solid #D5DDE8; vertical-align: top; }
tbody tr:nth-child(even) td { background: #F3F6FA; }
td a, th a { word-break: break-word; }
blockquote { margin: 3mm 0; padding: 2mm 4mm; border-left: 0; background: #FCF6E7; }
.lead { font-size: 11.2pt; background: #F3F6FA; padding: 4mm 5mm; border-radius: 2mm; }
"""


def find_browser():
    for b in BROWSERS:
        p = shutil.which(b) or (b if Path(b).exists() else None)
        if p:
            return p
    sys.exit("No Chrome/Edge found for headless PDF printing.")


def main():
    md_text = SRC.read_text(encoding="utf-8")
    md = markdown.Markdown(extensions=["tables", "toc", "sane_lists"], extension_configs={"toc": {"permalink": False}})
    body = md.convert(md_text)
    # first paragraph after the H1 is the summary: give it a lead style
    body = re.sub(r"(</h1>\s*)<p>", r"\1<p class=\"lead\">", body, count=1)
    # every external link opens as a proper hyperlink in the PDF
    body = body.replace('<a href="http', '<a target="_blank" href="http')
    title = re.search(r"<h1[^>]*>(.*?)</h1>", body).group(1)
    toc_items = "".join(
        f'<li><a href="#{t["id"]}">{t["name"]}</a></li>' for t in md.toc_tokens[0]["children"]
    ) if md.toc_tokens else ""
    cover = f"""
<section class="cover">
  <div class="kicker">Smart India Hackathon 2026 · PS 26158 · NTRO</div>
  <h1>Single-Pass Drone Video to Accurate 3D Models</h1>
  <div class="sub">Research report — who has solved what, how, with what accuracy, and what remains open. Key finding: <i>{title}</i>.</div>
  <div class="meta">
    <div><b>Project</b> Drishti3D</div>
    <div><b>Team</b> Taraket</div>
    <div><b>Problem statement</b> 26158 · Single-Pass Drone Video to Accurate 3D Model Generation System</div>
    <div><b>Date</b> 30 September 2026</div>
  </div>
  <div class="toc"><h2>CONTENTS</h2><ol>{toc_items}</ol></div>
  <div class="foot">Every number carries its source link. Full notes, bibliography and design docs:
    <a href="{REPO_URL}">{html.escape(REPO_URL)}</a></div>
</section>"""
    doc = f"""<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>Drishti3D — Research report (SIH 2026 PS 26158)</title><style>{CSS}</style></head>
<body>{cover}<main>{body}</main></body></html>"""
    with tempfile.TemporaryDirectory() as td:
        html_path = Path(td) / "report.html"
        html_path.write_text(doc, encoding="utf-8")
        OUT.parent.mkdir(parents=True, exist_ok=True)
        subprocess.run([find_browser(), "--headless=new", "--disable-gpu", "--no-pdf-header-footer",
                        f"--print-to-pdf={OUT}", html_path.as_uri()], check=True,
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print(f"wrote {OUT.relative_to(ROOT)} ({OUT.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
