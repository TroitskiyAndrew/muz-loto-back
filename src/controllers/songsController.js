const { ObjectId } = require("mongodb/lib/bson");
const dataService = require("../services/mongodb");

const getSongs = async (req, res) => {
  try {
    const response = await dataService.getDocuments("songs");
    res.status(200).send(response);
    return;
  } catch (error) {
    res.status(500).send(error);
    return;
  }
};

const createSong = async (req, res) => {
  try {
    const response = Array.isArray(req.body)
      ? await dataService.createDocuments(`songs`, req.body)
      : await dataService.createDocument(`songs`, req.body);
    res.status(200).send(response);
    return;
  } catch (error) {
    res.status(500).send(error);
    return;
  }
};

const updateSong = async (req, res) => {
  try {
    let responsePromise;
    if (req.body.gameCode) {
      const query = {
        _id: { $in: req.body.songIds.map((songId) => new ObjectId(songId)) },
      };
      const update = { $push: { games: req.body.gameCode } };
      responsePromise = dataService.updateDocuments(`songs`, query, update);
    } else {
      responsePromise = dataService.updateDocument(`songs`, req.body);
    }
    res.status(200).send(response);
    return;
  } catch (error) {
    res.status(500).send(error);
    return;
  }
};

const deleteSong = async (req, res) => {
  try {
    const response = await dataService.deleteDocument(`songs`, req.params.id);
    res.status(200).send(response);
    return;
  } catch (error) {
    res.status(500).send(error);
    return;
  }
};

module.exports = {
  getSongs: getSongs,
  createSong: createSong,
  updateSong: updateSong,
  deleteSong: deleteSong,
};
