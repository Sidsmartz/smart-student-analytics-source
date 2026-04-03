require("dotenv").config();
const app = require("./api/index.cjs");
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Dev server on http://localhost:" + PORT));
