const { ObjectId } = require("mongodb/lib/bson");
const dataService = require("../services/mongodb");

const getTickets = async (req, res) => {
  try {
    const response = await dataService.getDocumentByQuery("tickets", {gameId: req.params.gameId});
    res.status(200).send(response?.tickets || []);
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
    const response = dataService.updateDocument(`tickets`, req.body);
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
