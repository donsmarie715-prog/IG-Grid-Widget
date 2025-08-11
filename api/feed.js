// /api/feed.js
const { Client } = require("@notionhq/client");

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const databaseId = process.env.DATABASE_ID;

module.exports = async (req, res) => {
  try {
    if (!databaseId || !process.env.NOTION_TOKEN) {
      return res.status(400).json({ error: "Missing NOTION_TOKEN or DATABASE_ID" });
    }

    // Try with sorts by "Post Date". If it fails (property renamed/missing), fallback to no sorts.
    let resp;
    try {
      resp = await notion.databases.query({
        database_id: databaseId,
        sorts: [{ property: "Post Date", direction: "ascending" }],
      });
    } catch (e) {
      console.warn("[feed] sort by 'Post Date' failed, retrying without sorts:", e?.message);
      resp = await notion.databases.query({ database_id: databaseId });
    }

    const items = resp.results.map((page) => {
      const p = page.properties;

      const title =
        p["Post Title"]?.title?.[0]?.plain_text ||
        p["Name"]?.title?.[0]?.plain_text ||
        "Untitled";

      const status = p["Status"]?.select?.name || "";

      // Prefer Scheduled Date if present, fallback to Post Date
      const scheduledDate = p["Scheduled Date"]?.date?.start || null;
      const postDate = p["Post Date"]?.date?.start || null;
      const date = scheduledDate || postDate;

      const files = p["Image"]?.files || [];
      const image = files[0]?.file?.url || files[0]?.external?.url || null;

      const caption = p["Caption"]?.rich_text?.[0]?.plain_text || "";
      const hashtags = p["Hashtags"]?.rich_text?.[0]?.plain_text || "";

      return { id: page.id, title, status, date, image, caption, hashtags };
    });

    // Optional client-side sort by date if you want guaranteed order:
    items.sort((a, b) => (a.date || "").localeCompare(b.date || ""));

    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
    return res.status(200).json({ items });
  } catch (e) {
    console.error("[feed] fatal:", e);
    return res.status(500).json({ error: "Failed to query Notion" });
  }
};
