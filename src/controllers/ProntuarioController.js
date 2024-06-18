const ProntuarioModel = require("../models/ProntuarioModel");

const ProntuarioController = {

    renderCadastrarProntuario: (req, res) => {
        try {
            res.render('pages/cadastrarProntuario')
        } catch (error) {
            console.log(error);
            let error_message = "Erro ao renderizar a página de Prontuário.";
            res.render('pages/pag_erro', { message: error_message });
        }
    },


    addProntuario: async (req, res) => {
        try {
            const { diagnostico, medicacao, consulta_id } = req.body;

            if (!diagnostico || !medicacao || !consulta_id) {
                return res.json({ message: 'Diagnóstico, medicação e ID da consulta são obrigatórios.' });
            }

            
            const detalhesConsulta = await ProntuarioModel.buscarDetalhesConsulta(consulta_id);

            if (!detalhesConsulta) {
                return res.json({ message: 'Consulta não encontrada.' });
            }

           
            const prontuario = {
                diagnostico,
                medicacao,
                consulta_id,
                consulta_paciente_id: detalhesConsulta.paciente_id,
                consulta_paciente_pessoa_id: detalhesConsulta.paciente_pessoa_id,
                consulta_funcionario_id: detalhesConsulta.funcionario_id,
                consulta_funcionario_pessoa_id: detalhesConsulta.funcionario_pessoa_id,
                consulta_especialidade_id: detalhesConsulta.especialidade_id
            };

            const result = await ProntuarioModel.cadastrarProntuario(prontuario);
            res.json(result);
        } catch (error) {
            console.error(error);
            res.json({ error: error.message });
        }
    }
};

module.exports = ProntuarioController;
