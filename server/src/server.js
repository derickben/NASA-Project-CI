const http = require("http");
const app = require("./app");
require("dotenv").config();
const { mongoConnect } = require("./services/mongo");
const { loadPlanetsData } = require("./models/planets.model");
const { loadLaunchesData } = require("./models/launches.model");

const server = http.createServer(app);

const PORT = process.env.PORT || 8000;

const startServer = async () => {
  mongoConnect();
  await loadPlanetsData();
  loadLaunchesData();

  server.listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT}`);
  });
};

startServer();
