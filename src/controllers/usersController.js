const dataService = require("../services/mongodb");
const jwt = require("jsonwebtoken");
const config = require("../config/config");

const getUser = async (req, res) => {
  try {
    const user = await dataService.getDocument("users", req.params.id);
    if (user) {
      const { hashedPassword, ...rest } = user;
      res.status(200).send(rest);
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
    const currentUser = await dataService.getDocumentByQuery("users", { email: req.body.email });
    if(currentUser){
        res.status(403).send('ТАкой юзер уже есть');
    }
    const user = await dataService.createDocument(`users`, req.body);
    
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
    const user = await dataService.getDocumentByQuery("users", { email });
    if (!user) {
      res.status(400).send("Нет такого юзера");
      return;
    }
    if (hashPass !== user.hashedPassword) {
        res.status(401).send("Неверный мпароль");
        return;
    }
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

module.exports = {
  getUser: getUser,
  createUser: createUser,
  auth: auth,
};
