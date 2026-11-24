# Viral Outlier Radar

A browsable page of viral outlier posts from TikTok and Instagram, found by Treg scans. An outlier is a post that does far better than its own account usually does.

Open it: https://gabmiren.github.io/Viral-Content-Scraping/

## What's on the page
- Current scan: prop firm and trading niche, posts from the last 48 hours only (22 to 24 Nov 2026). Anything older has been removed.
- **TikTok** and **Instagram** are ranked separately, because the two platforms reward different things. **Both** shows them together.
- **TikTok** and **Instagram**: the same list split by platform.
- **★ Saved**: ideas you starred. Saved in your browser.

Filter by account size (under 50k, or big accounts at 10x+) and by the topic search that found each post. Tips: press `/` to search, tap the caption box to copy it, **Details** shows this post against the account's usual post, ✓ marks an idea as made, and "Hide used" clears those out.

## How the score works
- TikTok: post views divided by the median views of the account's latest ~20 videos.
- Instagram: likes divided by the median likes of the latest 12 posts (hashtag results give no views).
- Accounts under 50k followers need 3x or more. Bigger accounts need 10x or more.
- TikTok: the top 24 small-account posts plus the 6 biggest big-account outliers.
- Instagram: only 14 posts cleared the strict rule, so the list is topped up with big-account posts at 3x or more (tagged "Big account 3x+").
- "What it is" lines are written from captions, not from watching the videos.

## Updating after a scan
1. Replace `data/top30.csv` (same columns) and edit `data/meta.json`.
2. Run `python3 scripts/build_data.py` to rebuild `data.js`.
3. Commit and push. GitHub Pages updates in about a minute.
