const express = require("express");
const expressLayouts = require('express-ejs-layouts');
const path = require('path');
const connection = require('./src/config/db');

const app = express();
const port = 5500;

const bodyParser = require('body-parser');
const Rotas = require("./src/routes/index");


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 


app.use(expressLayouts);
app.set('layout', path.join(__dirname, 'src', 'views', 'layouts', 'main')); 
app.set('view engine', 'ejs');
app.set('views', './src/views');


app.use(express.static(path.join(__dirname, 'public')));


app.use(express.json());


app.use('/', Rotas);

app.listen(port, async () => {
    try {
        await connection(); 
        console.log(`Servidor respondendo na porta ${port}`);
    } catch (error) {
        console.error('Erro ao iniciar o servidor:', error.message);
    }
});
