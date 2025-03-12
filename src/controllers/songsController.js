const { ObjectId } = require("mongodb/lib/bson");
const dataService = require("../services/mongodb");

const getSongs = async (req, res) => {
  try {
    const response = await dataService.getDocuments("songs");
    const userGamesQuery = req.user.isAdmin ? undefined : {owner: req.user.id}
    const userGames = await dataService.getDocuments("games", userGamesQuery);
    const songsWithPreferencesAndUsage = response.filter(dataBaseSong => {
      return (req.user.isAdmin || ! dataBaseSong.owner) ? true : dataBaseSong.owner === req.user.id;
    }).map((dataBaseSong) => {
      const { preferences, games, ...song } = dataBaseSong;
      const history = (games || [])
        .filter((game) =>
          userGames.map((userGame) => userGame.code).includes(game.code)
        )
        .map((game) => ({
          ...game,
          lastStart: userGames.find((userGame) => userGame.code === game.code)?.results.lastStart || '',
        }));
      return { ...song, ...preferences[req.user.id], history };
    });

    res.status(200).send(songsWithPreferencesAndUsage);
    return;
  } catch (error) {
    console.log(error)
    res.status(500).send(error);
    return;
  }
};

const createSong = async (req, res) => {
  try {
    const song = req.body;
    if(!req.user.isAdmin){
      song.owner = req.user.id;
    }
    song.preferences = {};
    const response = await dataService.createDocument(`songs`, req.body);

    res.status(200).send(response);
    return;
  } catch (error) {
    res.status(500).send(error);
    return;
  }
};

const updateSong = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      res.status(401).send("Нельзя");
      return;
    }
    const response = await dataService.updateDocument(`songs`, req.body);
    res.status(200).send(response);
    return;
  } catch (error) {
    res.status(500).send(error);
    return;
  }
};

const deleteSong = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      res.status(401).send("Нельзя");
      return;
    }
    const response = await dataService.deleteDocument(
      `songs`,
      req.params.songId
    );
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


