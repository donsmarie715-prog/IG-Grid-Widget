// Serverless API: /api/feed
import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const databaseId = process.env.DATABASE_ID;

export default async function handler(req, res) {
  try {
    if (!databaseId || !process.env.NOTION_TOKEN) {
      return res
        .status(400)
        .json({ error: "Missing NOTION_TOKEN or DATABASE_ID" });
    }

    const { status } = req.query;
    const filters = [];
    if (status) filters.push({ property: "Status", select: { equals: status } });

    const query = {
      database_id: databaseId,
      sorts: [{ property: "Post Date", direction: "ascending" }],
    };
    if (filters.length === 1) query.filter = filters[0];
    if (filters.length > 1) query.filter = { and: filters };

    const resp = await notion.databases.query(query);

    const items = resp.results.map((page) => {
      const p = page.properties;

      const title =
        p["Post Title"]?.title?.[0]?.plain_text ||
        p["Name"]?.title?.[0]?.plain_text ||
        "Untitled";

      const status = p["Status"]?.select?.name || "";

      // 1) NEW: Scheduled Date (preferred)
      const scheduledDate = p["Scheduled Date"]?.date?.start || null;
      // 2) Fallback so old data still shows something if you want
      const postDate = p["Post Date"]?.date?.start || null;
      const date = scheduledDate || postDate; // badge will show this

      const files = p["Image"]?.files || [];
      const image =
        files[0]?.file?.url || files[0]?.external?.url || null;

      const caption = p["Caption"]?.rich_text?.[0]?.plain_text || "";
      const hashtags = p["Hashtags"]?.rich_text?.[0]?.plain_text || "";

      return { id: page.id, title, status, date, image, caption, hashtags };
    });

    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
    return res.status(200).json({ items });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to query Notion" });
  }
}
