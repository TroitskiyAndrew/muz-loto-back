const { ObjectId } = require("mongodb/lib/bson");
const dataService = require("../services/mongodb");

const cashedTickets = {};

function getTicketsFromCash(gameId){
  const cashedTicketsForGame = cashedTickets[gameId];
  const tickets = cashedTicketsForGame.splice(0, 3);
  const isMore = cashedTicketsForGame.length > 0;
  if(!isMore){
    delete cashedTickets[gameId];
  }
  return {isMore, tickets}

}

const getTickets = async (req, res) => {
  try {
    const gameId = req.params.gameId;
    if(cashedTickets[gameId]){
      res.status(200).send(getTicketsFromCash(gameId))
      return;
    }
    
    const response = await dataService.getDocumentByQuery("tickets", {gameId});
    if(!response){
      res.status(404).send('К этой игре нет билетов');
    }
    cashedTickets[gameId] = response.tickets || [];
    res.status(200).send(getTicketsFromCash(gameId));
    return;
  } catch (error) {
    res.status(500).send(error);
    return;
  }
};

const createTickets = async (req, res) => {
  try {
    const gameId = req.params.gameId;
    await dataService.updateDocumentByQuery('games', {_id: new ObjectId(gameId)}, { $inc: { ticketsCount: +req.body.length } })
    const response = await dataService.createDocument(`tickets`, {gameId, tickets: req.body});
    res.status(200).send(response?.tickets || []);
    return;
  } catch (error) {
    console.log(error)
    res.status(500).send(error);
    return;
  }
};

const addTickets = async (req, res) => {
  try {
    const gameId = req.params.gameId;
    await dataService.updateDocumentByQuery('games', {_id: new ObjectId(gameId)}, { $inc: { ticketsCount: +req.body.length } })
    const query = {gameId};
    const update =  { $push: { tickets: { $each: req.body } } };
    await dataService.updateDocumentByQuery(`tickets`, query, update);    
    res.status(200).send(req.body);
    return;
  } catch (error) {
    res.status(500).send(error);
    return;
  }
};

module.exports = {
  getTickets: getTickets,
  createTickets: createTickets,
  addTickets: addTickets,
};
