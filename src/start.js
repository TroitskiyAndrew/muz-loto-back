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
const io = new Server(server, {cors: { origin: "*", credentials: true}});

const NOT_PROTECTED_ROUTES = ['/gameByCode', '/auth', '/new-user']
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if(req.originalUrl.startsWith('/socket.io')){
        return;
    }
    if(NOT_PROTECTED_ROUTES.some(route => req.originalUrl.startsWith(route))){
        return next();
    }

    if (!token) {
        return res.status(401).json({ error: "Токен отсутствует" });
    }

    try {
        const decoded = jwt.verify(token, config.jwtSecret);
        req.user = decoded; // Сохраняем данные пользователя в `req`
        next();
    } catch (err) {
        return res.status(403).json({ error: "Неверный или просроченный токен" });
    }
};


app.use(express.json());
app.use(cors({ origin: '*', credentials: true}));
app.get('/gameByCode/:code', gamesController.getGame); 
app.post('/auth', usersController.auth);  
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

app.get('/songs', songsController.getSongs);  
app.put('/songs', songsController.updateSong);  
app.post('/songs', songsController.createSong);  
app.delete('/songs/:id', songsController.deleteSong);  
app.get('/users/:id', usersController.getUser);  
app.put('/users/:id', usersController.updateUser);  
app.post('/new-user', usersController.createUser);  
app.get('/games', gamesController.getGames);  
app.put('/games', gamesController.updateGame);  
app.post('/games', gamesController.createGame);  
app.get('/tickets/:gameId', ticketsController.getTickets);  
app.put('/tickets/:gameId', ticketsController.updateTickets);  
app.post('/tickets', ticketsController.createTickets);  




server.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
});
