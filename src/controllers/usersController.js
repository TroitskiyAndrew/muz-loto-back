const dataService = require("../services/mongodb");
const jwt = require("jsonwebtoken");
const config = require("../config/config");
const { ObjectId } = require("mongodb");

const getUser = async (req, res) => {
  try {
    const user = await dataService.getDocument("users", req.user.id);
    if (user) {
      const { hashedPassword, ...rest } = user;
      res.status(200).send({...rest, isAdmin: user.id === config.adminId});
      return;
    }
    res.status(404).send(null);
    return;
  } catch (error) {
    res.status(500).send(error);
    return;
  }
};

const createUser = async (req, res) => {
  try {
    const email  = req.body.email.toLowerCase()
    const currentUser = await dataService.getDocumentByQuery("users", { email });
    if(currentUser){
        res.status(403).send('Такой юзер уже есть');
        return
    }
    const user = await dataService.createDocument(`users`, {...req.body, email, gamesCredit: 0});
    
    const token = jwt.sign({ id: user.id }, config.jwtSecret, {
      expiresIn: "24h",
    });
    const { hashedPassword, ...rest } = user;
    res.status(200).send({ user: rest, token });
    return;
  } catch (error) {
    res.status(500).send(error);
    return;
  }
};

const auth = async (req, res) => {
  try {
    const { email, hashedPassword: hashPass } = req.body;
    const user = await dataService.getDocumentByQuery("users", { email: email.toLowerCase() });
    if (!user) {
      res.status(400).send("Нет такого юзера");
      return;
    }
    if (hashPass !== user.hashedPassword) {
        res.status(401).send("Неверный мпароль");
        return;
    }
    const token = jwt.sign({ id: user.id, isAdmin: user.id === config.adminId}, config.jwtSecret, {
      expiresIn: "24h",
    });
    const { hashedPassword, ...rest } = user;
    res.status(200).send({ user: {...rest, isAdmin: user.id === config.adminId}, token });
    return;
  } catch (error) {
    res.status(500).send(error);
    return;
  }
};

module.exports = {
  getUser: getUser,
  createUser: createUser,
  auth: auth,
};
