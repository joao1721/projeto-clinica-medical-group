const express = require("express");
const router = express.Router();

const PessoaController = require("../controllers/PessoaController");
const EspecialidadeController = require("../controllers/EspecialidadeController");
const ConsultaController = require("../controllers/consultaController"); 
const ProntuarioController = require("../controllers/ProntuarioController");

router.get('/', PessoaController.index); 
router.get('/cadastroPessoa', PessoaController.cadastro); 
router.post('/pessoa', PessoaController.adicionarPessoa); 

router.get('/buscarEspecialidades', PessoaController.buscarEspecialidades);

router.post('/pessoaLogin', PessoaController.adicionarLogin); 
router.get('/login', PessoaController.exibirLogin);
router.post('/login', PessoaController.login); 

router.post('/associarEspecialidade', PessoaController.associarEspecialidade); 


// ROTA PRONTUARIO
router.get('/cadastrarProntuario', ProntuarioController.renderCadastrarProntuario)
router.post('/cadastrarProntuario', ProntuarioController.addProntuario)

// ROTA AGENDAMENTO
router.get('/Agendamento', ConsultaController.renderAgendarConsulta);
router.post('/agendarConsulta', ConsultaController.agendarConsulta);

// ROTA ESPECIALIDADE
router.get('/cadastrarEspecialidade', EspecialidadeController.renderCadastrarEsp);
router.post('/cadastrarEspecialidade', EspecialidadeController.cadastrarEsp);

// ROTA DE RESGATAR CONSULTA
router.get('/resgatarConsultas/:funcionario_id', ConsultaController.trazerConsultas);

// ROTA PARA CONSULTAS CADASTRADAS COM ID DO MÉDICO
router.get('/consultasCadastradas/:medico_id', ConsultaController.consultasPorMedico);

// ROTA PARA VALIDAR CPF NO AGENDAMENTO 
router.post('/verificarcpf', PessoaController.verificarCPFCadastrado);

module.exports = router;
