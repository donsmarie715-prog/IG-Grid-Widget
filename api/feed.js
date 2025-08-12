// /api/feed.js
const { Client } = require("@notionhq/client");

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const databaseId = process.env.DATABASE_ID;

module.exports = async (req, res) => {
  try {
    if (!databaseId || !process.env.NOTION_TOKEN) {
      return res.status(400).json({ error: "Missing NOTION_TOKEN or DATABASE_ID" });
    }

    // Try sorting by "Scheduled Date"; if that property doesn't exist, fall back to "Post Date".
    let resp;
    try {
      resp = await notion.databases.query({
        database_id: databaseId,
        sorts: [{ property: "Scheduled Date", direction: "ascending" }],
      });
    } catch (e) {
      // Fallback to the old property name
      resp = await notion.databases.query({
        database_id: databaseId,
        sorts: [{ property: "Post Date", direction: "ascending" }],
      });
    }

    const items = resp.results.map((page) => {
      const p = page.properties;

      const title =
        p["Post Title"]?.title?.[0]?.plain_text ||
        p["Name"]?.title?.[0]?.plain_text ||
        "Untitled";

      const status = p["Status"]?.select?.name || "";

      // Prefer Scheduled Date; fall back to Post Date
      const date =
        p["Scheduled Date"]?.date?.start ||
        p["Post Date"]?.date?.start ||
        null;

      // Image can be Notion file or external URL
      const files = p["Image"]?.files || [];
      const image = files[0]?.file?.url || files[0]?.external?.url || null;

      const caption = p["Caption"]?.rich_text?.[0]?.plain_text || "";
      const hashtags = p["Hashtags"]?.rich_text?.[0]?.plain_text || "";

      return { id: page.id, title, status, date, image, caption, hashtags };
    });

    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
    return res.status(200).json({ items });
  } catch (err) {
    console.error("[/api/feed] error:", err);
    return res.status(500).json({ error: "Failed to fetch data" });
  }
};
