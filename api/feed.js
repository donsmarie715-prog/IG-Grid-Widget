import { Client } from "@notionhq/client";

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

export default async function handler(req, res) {
  try {
    const db = await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID,
      sorts: [
        {
          property: "Scheduled Date",
          direction: "descending",
        },
      ],
    });

    const items = db.results.map((page) => {
      const p = page.properties;

      // Safe date retrieval
      const scheduledDate =
        p["Scheduled Date"]?.date?.start ||
        p["Date"]?.date?.start ||
        null;

      return {
        id: page.id,
        title: p["Name"]?.title?.[0]?.plain_text || "",
        date: scheduledDate,
        image: p["Image"]?.files?.[0]?.file?.url || p["Image"]?.files?.[0]?.external?.url || "",
      };
    });

    res.status(200).json({ items });
  } catch (err) {
    console.error("Error fetching data from Notion:", err.body || err.message || err);
    res.status(500).json({ error: "Failed to fetch data" });
  }
}
