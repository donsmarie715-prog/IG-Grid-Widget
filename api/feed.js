// /api/feed.js
const { Client } = require("@notionhq/client");

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const databaseId = process.env.DATABASE_ID;

module.exports = async (req, res) => {
  try {
    if (!databaseId || !process.env.NOTION_TOKEN) {
      return res.status(400).json({ error: "Missing NOTION_TOKEN or DATABASE_ID" });
    }

    // Quick sanity: can we access this database?
    await notion.databases.retrieve({ database_id: databaseId });

    // Query (no filters for now)
    const resp = await notion.databases.query({
      database_id: databaseId,
      sorts: [{ property: "Post Date", direction: "ascending" }],
    });

    const items = resp.results.map((page) => {
      const p = page.properties;

      const title =
        p["Post Title"]?.title?.[0]?.plain_text ||
        p["Name"]?.title?.[0]?.plain_text ||
        "Untitled";

      const status = p["Status"]?.select?.name || "";

      // Prefer Scheduled Date if present, fallback to Post Date
      const date =
        p["Scheduled Date"]?.date?.start ||
        p["Post Date"]?.date?.start ||
        null;

      const files = p["Image"]?.files || [];
      const image = files[0]?.file?.url || files[0]?.external?.url || null;

      const caption = p["Caption"]?.rich_text?.[0]?.plain_text || "";
      const hashtags = p["Hashtags"]?.rich_text?.[0]?.plain_text || "";

      return { id: page.id, title, status, date, image, caption, hashtags };
    });

    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ items });
  } catch (e) {
    // Log the detailed Notion error to Vercel logs
    console.error("API /api/feed error:", e.body || e.message || e);

    // Return a safe error, with optional hint if ?debug=1
    const hint = req.query.debug ? (e.body || e.message || String(e)) : undefined;
    return res.status(500).json({ error: "Failed to fetch data", hint });
  }
};
