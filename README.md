# Viral Content Scraping

A browsable board of viral outlier posts from TikTok and Instagram, found through Treg scans.

An outlier is a post that performs far above its own account's usual numbers. The board ranks them, lets you filter by platform, account size and topic, and opens each post in a side panel with the numbers and a link.

## Files

- `index.html`: the board. Open it in a browser or serve it with GitHub Pages.
- `top50.json`: the scan data behind the board.
- `src/template.html`: the page template.
- `build.py`: rebuilds `index.html` from the template and the data.

## Updating with a new scan

1. Replace `top50.json` with the new results (same fields).
2. Run `python3 build.py`.
3. Commit and push.

## Video previews

On GitHub Pages (Settings > Pages > deploy from `main`, root folder), the side panel plays each TikTok or Instagram post inline. When the page runs inside Claude, previews are off and the panel links to the post instead.

## Current scan

- Window: posts from 12 to 17 Nov 2026
- Score: views divided by the account's median views over its latest ~20 posts (Instagram uses likes over the latest 12)
- Rule: accounts under 50k followers at 3x or more; accounts over 50k at 10x or more
