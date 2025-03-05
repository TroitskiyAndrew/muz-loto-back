const { ObjectId } = require("mongodb/lib/bson");
const dataService = require("../services/mongodb");

const getTickets = async (req, res) => {
  try {
    const [gameId, roundIndex] = req.params.gameId.split('-');
    const response = await dataService.getDocumentByQuery("tickets", {gameId});
    if(!response){
      res.status(404).send('К этой игре нет билетов');
    }
    const result = (response?.tickets || []).map(ticket => ({
      ...ticket,
      rounds: [ticket.rounds[roundIndex]]
    }))
    res.status(200).send(result);
    return;
  } catch (error) {
    res.status(500).send(error);
    return;
  }
};

const createTickets = async (req, res) => {
  try {
    const response = await dataService.createDocument(`tickets`, req.body);
    res.status(200).send(response?.tickets || []);
    return;
  } catch (error) {
    res.status(500).send(error);
    return;
  }
};

const updateTickets = async (req, res) => {
  try {
    const query = {gameId: req.params.gameId}
    const response = dataService.updateDocuments(`tickets`,query,  req.body);
    res.status(200).send(response?.tickets || []);
    return;
  } catch (error) {
    res.status(500).send(error);
    return;
  }
};

module.exports = {
  getTickets: getTickets,
  createTickets: createTickets,
  updateTickets: updateTickets,
};
