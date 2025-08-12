// /api/feed.js
const { Client } = require("@notionhq/client");

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const databaseId = process.env.DATABASE_ID;

// Helpers that don't depend on exact property names
function pickTitle(props) {
  // Prefer a property that is of type "title"
  for (const key in props) {
    const p = props[key];
    if (p?.type === "title" && Array.isArray(p.title) && p.title.length) {
      return p.title[0].plain_text;
    }
  }
  // Fallbacks by common names
  return (
    props?.["Post Title"]?.title?.[0]?.plain_text ||
    props?.["Name"]?.title?.[0]?.plain_text ||
    "Untitled"
  );
}

function pickDate(props) {
  // Prefer "Scheduled Date", fallback to "Post Date", otherwise any date prop
  const tryKeys = ["Scheduled Date", "Post Date"];
  for (const k of tryKeys) {
    const d = props?.[k];
    if (d?.type === "date" && d.date?.start) return d.date.start;
  }
  for (const key in props) {
    const p = props[key];
    if (p?.type === "date" && p.date?.start) return p.date.start;
  }
  return null;
}

function pickStatus(props) {
  // Any select named "Status" or first select we can find
  if (props?.["Status"]?.type === "select") {
    return props["Status"].select?.name || "";
  }
  for (const key in props) {
    const p = props[key];
    if (p?.type === "select") return p.select?.name || "";
  }
  return "";
}

function pickImageUrl(props) {
  // Prefer a property named "Image" of type files
  const imgProp = props?.["Image"];
  if (imgProp?.type === "files" && Array.isArray(imgProp.files) && imgProp.files.length) {
    const f = imgProp.files[0];
    return f.file?.url || f.external?.url || null;
  }
  // Otherwise, look for the first files-type property in the page
  for (const key in props) {
    const p = props[key];
    if (p?.type === "files" && Array.isArray(p.files) && p.files.length) {
      const f = p.files[0];
      return f.file?.url || f.external?.url || null;
    }
  }
  return null;
}

module.exports = async (req, res) => {
  try {
    if (!databaseId || !process.env.NOTION_TOKEN) {
      return res.status(400).json({ error: "Missing NOTION_TOKEN or DATABASE_ID" });
    }

    // Keep the query simple: no fragile filters/sorts
    const resp = await notion.databases.query({ database_id: databaseId });

    const items = resp.results.map((page) => {
      const p = page.properties;
      return {
        id: page.id,
        title: pickTitle(p),
        date: pickDate(p),
        status: pickStatus(p),
        image: pickImageUrl(p),
      };
    });

    // Helpful while debugging
    // console.log(JSON.stringify(items, null, 2));

    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
    return res.status(200).json({ items });
  } catch (err) {
    console.error("API error:", err);
    return res.status(500).json({ error: "Failed to fetch data" });
  }
};
