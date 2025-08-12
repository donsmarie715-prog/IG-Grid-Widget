# Instagram-style Notion Grid Widget

This tiny app reads a Notion database (via the Notion API) and renders an Instagram-like grid with a Refresh button.

## Quick Deploy (Vercel)

1) Create a Notion integration and share your database with it (Read access).  
2) Get your `Internal Integration Secret` (NOTION_TOKEN) and your database id (DATABASE_ID).  
3) Deploy this folder to Vercel. In **Project → Settings → Environment Variables**, add:
   - `NOTION_TOKEN` = your Notion integration secret
   - `DATABASE_ID` = your database id
4) Open your deployed URL. Use `?status=Approved&platform=Instagram` to prefilter if you like.
5) Embed the deployed URL in Notion using the `/embed` block.

## Notion database fields expected

- `Image` — Files & media (first file is used as the thumbnail)
- `Scheduled Date` — date (optional, used for sorting)
- `Status` — select (optional, used for filtering)
- `Platform` — multi-select (e.g., Instagram, TikTok)
- `Post Title` or `Name` — title (optional, used for alt text)

## Local dev (optional)
- `npm i`  
- `vercel dev`

