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
        const query =
            req.params.userId === config.adminId
                ? undefined
                : { owner: req.params.userId };
        console.log(query);
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
        const response = Array.isArray(req.body)
            ? await dataService.createDocuments(`games`, req.body)
            : await dataService.createDocument(`games`, req.body);
        res.status(200).send(response);
        return;
    } catch (error) {
        res.status(500).send(error);
        return;
    }
};

const updateGame = async (req, res) => {
    try {
        if (req.body.ticketsCount) {
            const response = await dataService.updateDocument(`games`, { id: req.body.id, ticketsCount: req.body.ticketsCount });
            res.status(200).send(response);
            return;
        } else if (req.body.results) {
            const game = await dataService.getDocument('games', req.body.id);
            const reset = req.body.results.rounds.length === 0 ||  req.body.results.rounds.some((round, index) => round.step < game.results.rounds[index]?.step);
            const cantReset = !game.results.lastStart ||
                game.results.rounds.length === 0 ||
                game.results.rounds[0].step > 5;
            console.log('cantReset',cantReset)
            if (reset && cantReset) {
                res.status(403).send("Нельзя")
                return;
            }
            const response = await dataService.updateDocument(`games`, req.body);
            res.status(200).send(response);
            return;
        }
        res.status(403).send("Нельзя")
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
};
