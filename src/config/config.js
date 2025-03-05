const dotenv = require('dotenv');
dotenv.config();

module.exports = {
    port: process.env.PORT,
    mongodbConnectionString: process.env.MONGODB_CONNECTION_STRING ?? '',
    jwtSecret: process.env.JWT_SECRET ?? '',
    adminId: process.env.ADMIN_ID ?? '',
    frontURL: process.env.FRONT_URL ?? "*",
}