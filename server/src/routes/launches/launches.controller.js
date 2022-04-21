const {
  getAllLaunches,
  scheduleNewLaunch,
  existsLaunchWithId,
  abortLaunchById,
} = require("../../models/launches.model");
const { getPagination } = require("../../services/query");

exports.httpGetAllLaunches = async (req, res) => {
  const { limit, skip } = getPagination(req.query);
  const launches = await getAllLaunches(limit, skip);
  return res.status(200).json(launches);
};

exports.httpAddNewLaunch = async (req, res) => {
  const launch = req.body;

  if (!launch.mission || !launch.rocket || !launch.target || !launch.launchDate)
    return res.status(400).json({
      error: "Missing required launch property",
    });

  launch.launchDate = new Date(launch.launchDate);

  if (isNaN(launch.launchDate))
    return res.status(400).json({
      error: "Invalid launch date",
    });

  scheduleNewLaunch(launch);
  return res.status(201).json(launch);
};

exports.httpAbortLaunch = async (req, res) => {
  const launchId = Number(req.params.id);

  const existsLaunch = await existsLaunchWithId(launchId);

  if (!existsLaunch) {
    return res.status(404).json({
      error: "Launch not found",
    });
  }

  const aborted = abortLaunchById(launchId);
  if (!aborted) {
    return res.status(400).json({
      error: "Launch not aborted",
    });
  }
  return res.status(200).json({ ok: true });
};