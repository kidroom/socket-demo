import app from "./app";

const port = parseInt(process.env.PORT || "5000", 10);

app.listen(port, () => {
  console.log(`後端伺服器運行在 http://localhost:${port}`);
});
