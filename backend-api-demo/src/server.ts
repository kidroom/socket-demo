import app from "./app";
import dotenv from "dotenv";

const config = dotenv.config();
// const config = dotenv.config({ path: "./backend-api-demo/.env" });
const port = parseInt(process.env.PORT || "5000", 10);

app.listen(port, () => {
  console.log(`後端伺服器運行在 http://localhost:${port}`);
});
