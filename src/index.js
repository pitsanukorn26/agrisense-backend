const http = require("http");

const PORT = process.env.PORT || 4000;

const requestHandler = (req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(
    JSON.stringify({
      status: "ok",
      message: "Backend placeholder. Replace with real API routes.",
      route: req.url,
    })
  );
};

http.createServer(requestHandler).listen(PORT, () => {
  console.log(`Backend server running at http://localhost:${PORT}`);
});
