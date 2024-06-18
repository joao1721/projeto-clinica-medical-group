const EspecialidadeModel = require('../models/EspecialidadeModel');

const EspecialidadeController = {
    renderCadastrarEsp: (req, res) => {
        try {
            res.render('pages/CadastrarEspecialidade');
        } catch (error) {
            console.log(error);
            let error_message = "Erro ao renderizar a página de cadastro de especialidade.";
            res.render('pages/pag_erro', { message: error_message });
        }
    },

    cadastrarEsp: async (req, res) => {
        try {
            const { desc_especialidade } = req.body;

            if (!desc_especialidade) {
                return res.json({ message: 'Descrição da especialidade não fornecida.' });
            }

            const result = await EspecialidadeModel.cadastrarEspecialidade(desc_especialidade);
            res.json(result);
        } catch (error) {
            console.error(error);
            res.json({ error: error.message });
        }
    },

   
};

module.exports = EspecialidadeController;
