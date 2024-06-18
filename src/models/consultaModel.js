const conectarBancoDeDados = require('../config/db');

async function agendarConsulta(consulta, pacienteId,paciente_pessoa_id, funcionarioId,funcionario_pessoa_id, especialidadeId) {
    console.log(consulta.data, consulta.hora, consulta.status, pacienteId,paciente_pessoa_id, funcionarioId,funcionario_pessoa_id, especialidadeId)
    const connection = await conectarBancoDeDados();
    try {
 
        const [result] = await connection.query(

            `INSERT INTO tbl_consulta (data, hora, status, paciente_id, paciente_pessoa_id, funcionario_id, funcionario_pessoa_id, especialidade_id) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [consulta.data, consulta.hora, consulta.status, pacienteId, paciente_pessoa_id, funcionarioId, funcionario_pessoa_id, especialidadeId]
        );

        return { result };
    } catch (error) {
        console.error(error);
        throw error;
    }
}
async function selPacPessId(pacienteId) {
    const connection = await conectarBancoDeDados();
    try {
        let [[{p}]]= await connection.query(`SELECT pessoa_id as p FROM tbl_paciente WHERE id = ?`, [pacienteId]) ;        
        return p;
    } catch (error) {
        console.error(error);
        throw error;
    }
}
async function selFuncPessId(funcionarioId) {
    const connection = await conectarBancoDeDados();
    try {
        let [[{f}]] = await connection.query(`SELECT pessoa_id as f FROM tbl_funcionario WHERE id = ?`, [funcionarioId]);      
        return f;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

async function selConsulta(funcionario_id) {
    const connection = await conectarBancoDeDados();

    try {
        const [results] = await connection.query(`
            SELECT c.data, c.hora, p.nome 
            FROM clinica.tbl_consulta c 
            INNER JOIN clinica.tbl_paciente pa ON c.paciente_id = pa.id AND c.paciente_pessoa_id = pa.pessoa_id 
            INNER JOIN clinica.tbl_pessoa p ON pa.pessoa_id = p.id 
            WHERE c.funcionario_id = ?;
        `, [funcionario_id]);
        return results;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

module.exports = { agendarConsulta, selPacPessId, selFuncPessId, selConsulta };
