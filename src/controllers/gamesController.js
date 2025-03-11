const { ObjectId } = require("mongodb");
const dataService = require("../services/mongodb");
const config = require("../config/config");

const getGame = async (req, res) => {
  try {
    const query = { code: req.params.code };
    const response = await dataService.getDocumentByQuery("games", query);
    res.status(200).send(response);
    return;
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
    return;
  }
};
const getGames = async (req, res) => {
  try {
    const query = req.user.isAdmin ? undefined : { owner: req.user.id };
    const response = await dataService.getDocuments("games", query);
    res.status(200).send(response);
    return;
  } catch (error) {
    res.status(500).send(error);
    return;
  }
};

const createGame = async (req, res) => {
  try {
    const user = await dataService.getDocument("users", req.user.id);
    await dataService.updateDocumentsByQuery(
      "songs",
      req.body.songsPreferences.map((song) => {
        const { id, priority, disabled, round } = song;
        return {
          id,
          updateQuery: {
            $set: {
              [`preferences.${req.user.id}`]: { priority, disabled, round },
            },
          },
        };
      })
    );
    if (!user.gamesCredit && !req.body.game.testGame) {
      res.status(403).send("Нельзя");
      return;
    }

    const game = await dataService.createDocument(`games`, req.body.game);
    if(!game.testGame){
        await dataService.updateDocumentByQuery(
            `users`,
            { _id: new ObjectId(req.user.id) },
            { $inc: { gamesCredit: -1 } }        );
        await dataService.updateDocumentsByQuery(
            "songs",
            req.body.usedSongs.map((song) => {
              const { id, round } = song;
              
              return {
                id,
                updateQuery: {
                  $push: {
                    games: { code: game.code, round },
                  },
                },
              };
            })
          );
    }
    res.status(200).send(game);
    return;
  } catch (error) {
    console.log(error)
    res.status(500).send(error);
    return;
  }
};

const updateGame = async (req, res) => {
  try {
    if (req.body.results) {
      const game = await dataService.getDocument("games", req.body.id);
      const reset = req.body.results.rounds.some(
        (round, index) => round.playedSongs.length < game.results.rounds[index]?.playedSongs.length
      );
      const cantReset =
        !game.results.lastStart ||
        game.results.currentRoundIndex > 0 ||
        game.results.currentStep > 5;
      if (!game.testGame && reset && cantReset) {
        res.status(403).send("Нельзя");
        return;
      }
      const response = await dataService.updateDocument(`games`, req.body);
      res.status(200).send(response);
      return;
    }
    res.status(403).send("Нельзя");
    return;
  } catch (error) {
    res.status(500).send(error);
    return;
  }
};

const deleteGame = async (req, res) => {
  try {
    
    const gameId = req.params.gameId
    const game = await dataService.getDocument(`games`, gameId);
    if (!req.user.isAdmin && !game.testGame) {
        res.status(403).send("Нельзя");
        return;
      }
    const response = await dataService.deleteDocument(
      `games`,
      gameId
    );
    await dataService.deleteDocumentByQuery(
      `tickets`,
      {gameId}
    );
    if(!game.testGame){
        const songs = await dataService.getDocuments("songs");
        const updatedSongs = songs.filter(song => song.games.map(s => s.code).includes(game.code));
        
        await dataService.updateDocumentsByQuery(
            "songs",
            updatedSongs.map((song) => {
              const { id, games } = song;
              
              return {
                id,
                updateQuery: {
                  $set: {
                    games: games.filter(historyGame => historyGame.code !==game.code),
                  },
                },
              };
            })
          );
    }
    
    res.status(200).send(response);
    return;
  } catch (error) {
    res.status(500).send(error);
    return;
  }
};

module.exports = {
  getGame: getGame,
  getGames: getGames,
  createGame: createGame,
  updateGame: updateGame,
  deleteGame: deleteGame,
};
