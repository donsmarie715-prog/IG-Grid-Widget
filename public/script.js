<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Instagram Grid</title>
<style>
  :root {
    color-scheme: light dark;
  }
  * {
    box-sizing: border-box;
  }
  body {
    margin: 0;
    font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
    background: #fff;
    color: #111;
  }
  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border-bottom: 1px solid #eee;
    position: sticky;
    top: 0;
    background: #fff;
    z-index: 10;
  }
  header h1 {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
  }
  .btn {
    border: 1px solid #ccc;
    background: #fff;
    border-radius: 8px;
    padding: 6px 12px;
    font-weight: 600;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
  }
  #grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 2px; /* Small Instagram-like gap */
    padding: 2px;
  }
  .card {
    position: relative;
    background: #fff;
    overflow: hidden;
    aspect-ratio: 1 / 1; /* Square like Instagram */
  }
  .media {
    width: 100%;
    height: 100%;
  }
  .media img {
    width: 100%;
    height: 100%;
    object-fit: cover; /* Fill the square like Instagram */
    display: block;
  }
  .skeleton {
    background: #eee;
    aspect-ratio: 1 / 1;
    animation: pulse 1.5s infinite ease-in-out;
  }
  @keyframes pulse {
    0% { background-color: #eee; }
    50% { background-color: #ddd; }
    100% { background-color: #eee; }
  }
</style>
</head>
<body>
  <header>
    <h1>Instagram Grid Widget</h1>
    <button id="refresh" class="btn">🔄 Refresh</button>
  </header>
  <main>
    <div id="grid"></div>
  </main>

<script src="script.js"></script>
</body>
</html>
