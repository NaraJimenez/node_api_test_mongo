const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { config } = require('dotenv');

config();

const bookRoutes = require('./routes/book.routes')

//Usamos express para los middlewares
const app = express();
app.use(bodyParser.json()); //Parseador de Bodies

//Conectamos la BBDD
mongoose.connect(process.env.MONGO_URL, { dbName: process.env.MONGO_DB_NAME })
const db = mongoose.connection;

//Middleware para pasar las rutas
app.use('/books', bookRoutes)

//Declaramos puerto
const port = process.env.PORT || 3000

//Escucha
app.listen(port, () => {
    console.log(`Servidor iniciado en el puerto ${port}`)
})