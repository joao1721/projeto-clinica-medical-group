const conectarBancoDeDados = require('../config/db');

async function buscarDetalhesConsulta(consulta_id) {
    const connection = await conectarBancoDeDados();

    try {
        await connection.beginTransaction();
        
        const [results] = await connection.query(
            'SELECT paciente_id, paciente_pessoa_id, funcionario_id, funcionario_pessoa_id, especialidade_id FROM tbl_consulta WHERE id = ?',
            [consulta_id]
        );
        await connection.commit();
        return results[0];
    } catch (error) {
        console.error('Erro ao buscar detalhes da consulta:', error);
        throw error;
    } 
}

async function cadastrarProntuario(prontuario) {
    const connection = await conectarBancoDeDados();

    try {
        await connection.beginTransaction();
        const [result] = await connection.query(
            `INSERT INTO tbl_prontuario (diagnostico, medicacao, consulta_id, consulta_paciente_id, consulta_paciente_pessoa_id, consulta_funcionario_id, consulta_funcionario_pessoa_id, consulta_especialidade_id) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                prontuario.diagnostico,
                prontuario.medicacao,
                prontuario.consulta_id,
                prontuario.consulta_paciente_id,
                prontuario.consulta_paciente_pessoa_id,
                prontuario.consulta_funcionario_id,
                prontuario.consulta_funcionario_pessoa_id,
                prontuario.consulta_especialidade_id
            ]
        );
        await connection.commit();
        return { id: result.insertId, ...prontuario };
    } catch (error) {
        console.error('Erro ao cadastrar prontuário:', error);
        throw error;
    } 
}

module.exports = { buscarDetalhesConsulta, cadastrarProntuario };