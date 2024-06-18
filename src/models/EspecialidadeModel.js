const conectarBancoDeDados = require('../config/db');

async function cadastrarEspecialidade(descEspecialidade) {
    const connection = await conectarBancoDeDados();
    try {
        const [result] = await connection.query(
            'INSERT INTO tbl_especialidade (desc_especialidade) VALUES (?)',
            [descEspecialidade]
        );
        return { id: result.insertId, desc_especialidade: descEspecialidade };
    } catch (error) {
        console.error(error);
        throw error;
    } 
    // finally {

    //     connection.end();
    // }
}



async function obterEspecialidades() {
    const connection = await conectarBancoDeDados();
    try {
    
        const [rows] = await connection.query('SELECT * FROM clinica.tbl_especialidade');

        return rows;
    } catch (error) {
        throw new Error('Erro ao obter especialidades: ' + error.message);
    } 
    // finally {
    //     connection.end();
    // }
}

module.exports = { cadastrarEspecialidade, obterEspecialidades };
