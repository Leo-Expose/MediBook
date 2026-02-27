const app = require("./app");
const { usingPostgres } = require("./db");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  const dbInfo = usingPostgres ? "PostgreSQL" : "SQLite";
  console.log(`Server running on http://localhost:${PORT} using ${dbInfo}`);
});
