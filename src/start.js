const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const config = require('./config/config');
const songsController = require('./controllers/songsController');
const usersController = require('./controllers/usersController');
const gamesController = require('./controllers/gamesController');
const ticketsController = require('./controllers/ticketsController');


const app = express();
const server = http.createServer(app);
const io = new Server(server, {cors: { origin: config.frontURL, credentials: true}});

const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if(req.originalUrl.startsWith('/socket.io')){
        return;
    }

    if (!token) {
        console.log('ahtung')
        return res.status(401).json({ error: "Токен отсутствует" });
    }

    try {
        const decoded = jwt.verify(token, config.jwtSecret);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ error: "Неверный или просроченный токен" });
    }
};


app.use(express.json());
app.use(cors({ origin: config.frontURL, credentials: true}));

app.get('/gameByCode/:code', gamesController.getGame); 
app.post('/auth', usersController.auth);  
app.post('/users', usersController.createUser);  
app.get('/tickets/:gameId', ticketsController.getTickets);  
app.put('/games', gamesController.updateGame);  

io.on('connection', (socket) => {
    console.log('Клиент подключен:', socket.id);
    
    socket.on('messageToBack', (data) => {
        io.emit('messageToClient', data);
    });
    socket.on('disconnect', () => {
        console.log('Клиент отключился:', socket.id);
    });
});

app.use(verifyToken); 

app.get('/users', usersController.getUser);  

app.get('/songs', songsController.getSongs);    
app.post('/songs', songsController.createSong);  
app.delete('/songs/:songId', songsController.deleteSong); 

app.get('/games', gamesController.getGames);  
app.post('/games', gamesController.createGame);  
app.delete('/games/:gameId', gamesController.deleteGame);  
app.put('/tickets/:gameId', ticketsController.addTickets);  
app.post('/tickets/:gameId', ticketsController.createTickets);  




server.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
});
