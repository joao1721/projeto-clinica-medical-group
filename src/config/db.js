const mysql2 = require("mysql2/promise");

let connection;

const conectarBancoDeDados = async () => {
    try {
        // if (global.connection && global.connection.state !== 'disconnected') {
        //     return connection;
        // }

        connection = await mysql2.createConnection({
            host: 'localhost',
            port: '3306',
            database: 'clinica',
            user: 'root',
            password: '1234',
            multipleStatements: true
        });

        console.log("Conectou no MySQL!");
        global.connection = connection
        return connection;
    } catch (error) {
        console.error("Erro ao conectar no MySQL:", error);
        throw error; 
    }
}

module.exports = conectarBancoDeDados;
