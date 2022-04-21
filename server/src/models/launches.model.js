const axios = require("axios");
const Launches = require("./launches.mongo");
const Planets = require("./planets.mongo");

const DEFAULT_FLIGHT_NUMBER = 100;

const SPACEX_API_URL = "https://api.spacexdata.com/v4/launches/query";

const populateLaunches = async () => {
  const response = await axios.post(SPACEX_API_URL, {
    query: {},
    options: {
      pagination: false,
      populate: [
        {
          path: "rocket",
          select: {
            name: 1,
          },
        },
        {
          path: "payloads",
          select: {
            customers: 1,
          },
        },
      ],
    },
  });

  if (response.status !== 200) {
    console.log("Problem downloading launch data");
    throw new Error("Launch data download failed");
  }
  const { docs: launchDocs } = response.data;

  for (let launchDoc of launchDocs) {
    const customers = launchDoc["payloads"].flatMap(
      (payload) => payload["customers"]
    );
    const launch = {
      flightNumber: launchDoc["flight_number"],
      mission: launchDoc["name"],
      rocket: launchDoc["rocket"]["name"],
      customers,
      launchDate: launchDoc["date_local"],
      upcoming: launchDoc["upcoming"],
      success: launchDoc["success"],
    };
    saveLaunch(launch);
  }
};

const loadLaunchesData = async () => {
  const firstLaunch = await Launches.findOne({
    flightNumber: 1,
    rocket: "Falcon 1",
    mission: "FalconSat",
  });

  if (firstLaunch) {
    console.log("Launch exists");
    return;
  }
  populateLaunches();
};

const existsLaunchWithId = async (launchId) => {
  return await Launches.findOne({ flightNumber: launchId });
};

const getLatestFlightNumber = async () => {
  const latestLaunch = await Launches.findOne().sort("-flightNumber");

  if (!latestLaunch) {
    return DEFAULT_FLIGHT_NUMBER;
  }

  return latestLaunch.flightNumber;
};

const getAllLaunches = async (limit, skip) => {
  return await Launches.find({}, { _id: 0, __v: 0 })
    .limit(limit)
    .skip(skip)
    .sort({ flightNumber: 1 });
};

async function saveLaunch(launch) {
  await Launches.findOneAndUpdate(
    {
      flightNumber: launch.flightNumber,
    },
    launch,
    {
      upsert: true,
    }
  );
}

const scheduleNewLaunch = async (launch) => {
  const planet = await Planets.findOne({ keplerName: launch.target });

  if (!planet) {
    throw new Error("No matching planet found");
  }
  const latestFlightNumber = (await getLatestFlightNumber()) + 1;
  const newLaunch = {
    ...launch,
    success: true,
    upcoming: true,
    flightNumber: latestFlightNumber,
    customers: ["ZTM", "NASA"],
  };

  saveLaunch(newLaunch);
};

const abortLaunchById = async (launchId) => {
  const aborted = await Launches.updateOne(
    { flightNumber: launchId },
    {
      success: false,
      upcoming: false,
    }
  );

  return aborted.modifiedCount === 1;
};

module.exports = {
  loadLaunchesData,
  existsLaunchWithId,
  getAllLaunches,
  scheduleNewLaunch,
  abortLaunchById,
};
