// /api/feed.js
const { Client } = require("@notionhq/client");

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const databaseId = process.env.DATABASE_ID;

module.exports = async (req, res) => {
  try {
    if (!databaseId || !process.env.NOTION_TOKEN) {
      return res
        .status(400)
        .json({ error: "Missing NOTION_TOKEN or DATABASE_ID" });
    }

    // Try a sort by Scheduled Date; if that fails, try Post Date; else no sort.
    let resp;
    try {
      resp = await notion.databases.query({
        database_id: databaseId,
        sorts: [{ property: "Scheduled Date", direction: "ascending" }],
      });
    } catch (e1) {
      try {
        resp = await notion.databases.query({
          database_id: databaseId,
          sorts: [{ property: "Post Date", direction: "ascending" }],
        });
      } catch (e2) {
        // fall back to no sort at all
        resp = await notion.databases.query({ database_id: databaseId });
      }
    }

    const items = resp.results.map((page) => {
      const p = page.properties || {};

      const title =
        p["Post Title"]?.title?.[0]?.plain_text ||
        p["Name"]?.title?.[0]?.plain_text ||
        "Untitled";

      // Prefer Scheduled Date, then Post Date, else null
      const date =
        p["Scheduled Date"]?.date?.start ||
        p["Post Date"]?.date?.start ||
        null;

      const files = p["Image"]?.files || [];
      const image =
        files[0]?.file?.url ||
        files[0]?.external?.url ||
        null;

      const status = p["Status"]?.select?.name || "";

      return { id: page.id, title, date, image, status };
    });

    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
    return res.status(200).json({ items });
  } catch (err) {
    console.error("API error:", err);
    return res.status(500).json({ error: "Failed to query Notion" });
  }
};
