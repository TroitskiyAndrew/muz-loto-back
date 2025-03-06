const { ObjectId } = require('mongodb');
const dataService = require('../services/mongodb');
const config = require('../config/config');

const getGame = async (req, res) => {
    try {
        const query =  {code: req.params.code};
        const response = await dataService.getDocumentByQuery('games', query);
        res.status(200).send(response);
        return
    } catch (error) {
        console.log(error)
        res.status(500).send(error);
        return
    }
}
const getGames = async (req, res) => {
    try {
        const query = req.user.id === config.adminId ? undefined : {_id: new ObjectId(req.user.id)};
        const response = await dataService.getDocuments('games', query);
        res.status(200).send(response);
        return
    } catch (error) {
        res.status(500).send(error);
        return
    }
}

const createGame = async (req, res) => {
    try {
        const response = Array.isArray(req.body) ? 
            await dataService.createDocuments(`games`, req.body) : 
            await dataService.createDocument(`games`, req.body);
        res.status(200).send(response);
        return
    } catch (error) {
        res.status(500).send(error);
        return
    }
}

const updateGame = async (req, res) => {
    try {
        const response = await dataService.updateDocument(`games`, req.body); 
        res.status(200).send(response);
        return
    } catch (error) {
        res.status(500).send(error);
        return
    }
}

module.exports = {
    getGame: getGame,
    getGames: getGames,
    createGame: createGame,
    updateGame: updateGame,
}