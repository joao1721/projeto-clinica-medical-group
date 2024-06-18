const EspecialidadeModel = require('../models/EspecialidadeModel');
const PessoaModel = require('../models/PessoaModel');
const ConsultaModel = require('../models/consultaModel');

const ConsultaController = {
    renderAgendarConsulta: async (req, res) => {
        try {
            const especialidades = await EspecialidadeModel.obterEspecialidades();
            res.render('pages/Agendamento', { especialidades }); 
        } catch (error) {
            console.log(error);
            let error_message = "Erro ao renderizar a página de agendamento de consulta.";
            res.render('pages/pag_erro', { message: error_message });
        }
    },
    
    getMedicosPorEspecialidade: async (req, res) => {
        try {
            const { especialidadeId } = req.params;
            const medicos = await PessoaModel.obterMedicosPorEspecialidade(especialidadeId);
            res.json(medicos);
        } catch (error) {
            console.error(error);
            res.json({ error: 'Erro ao obter médicos por especialidade.' });
        }
    },

    agendarConsulta: async (req, res) => {
        try {
            res.json({ message: 'Consulta agendada com sucesso!' });
        } catch (error) {
            console.error(error);
            res.json({ error: 'Erro ao agendar consulta.' });
        }
    },

    trazerConsultas: async (req, res) => {
        try {
            const { funcionario_id } = req.params;
            const consultas = await ConsultaModel.selConsulta(funcionario_id);
            res.json(consultas);
        } catch (error) {
            console.error(error);
            res.json({ error: 'Erro ao resgatar consultas.' });
        }
    },

    consultasPorMedico: async (req, res) => {
        try {
            const { medico_id } = req.params;
            const consultas = await ConsultaModel.selConsulta(medico_id);
            res.render('pages/consultasCadastradas', { consultas });
        } catch (error) {
            console.error(error);
            res.send('Erro ao obter consultas: ' + error.message);
        }
    },

    renderCadastrarProntuario: async (req, res) => {
        try {
            const { consulta_id } = req.query;
            res.render('pages/cadastrarProntuario', { consultaId: consulta_id });
        } catch (error) {
            console.error(error);
            res.send('Erro ao renderizar a página de prontuário: ' + error.message);
        }
    }
};

module.exports = ConsultaController;