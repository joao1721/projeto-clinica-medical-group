// src/controllers/PessoaController.js
const Pessoa = require('../models/Pessoa');
const Endereco = require('../models/Endereco');
const Telefone = require('../models/Telefone');
const Funcionario = require('../models/Funcionario');
const {obterEspecialidades} = require('../models/EspecialidadeModel')
const { insertFuncionario, insertPaciente, insertLoginProfile, associarEspecialidadeFuncionario } = require('../models/PessoaModel');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const conectarBancoDeDados = require('../config/db');







async function adicionarPessoa(req, res) {
    const { cpf, nome, data_nasc, genero, email, endereco, telefone, funcionario, especialidades } = req.body;

    let connection;
    try {
        // connection = await conectarBancoDeDados();
        // await connection.beginTransaction();

        // Geração e inserção de perfil de login associado à pessoaId
        const senhaAleatoria = crypto.randomBytes(8).toString('hex');
        const senhaHash = await bcrypt.hash(senhaAleatoria, 10);
        
        let pessoaId;
        
        if (funcionario && funcionario[0].crm) {
            const objFuncionario = new Funcionario(funcionario[0]);
            pessoaId = await insertFuncionario({ cpf, nome, data_nasc, genero, email }, endereco, telefone, objFuncionario,especialidades); 
            await insertLoginProfile(email, senhaHash, pessoaId, [{ tipo: 'medico' }]);   
        
            // Verifica se foi inserido um funcionário e se existem especialidades para associar
            // if (objFuncionario.id && especialidades && especialidades.length > 0) {
            //     // Associa as especialidades ao funcionário
            //     await associarEspecialidadeFuncionario(objFuncionario.id, pessoaId, endereco.id, especialidades, connection);
            // }
        } else {
            pessoaId = await insertPaciente({ cpf, nome, data_nasc, genero, email }, endereco, telefone);
            await insertLoginProfile(email, senhaHash, pessoaId, [{ tipo: 'paciente' }]);
        }
        

        


        console.log('Transações concluídas com sucesso.');
        const especialid = await obterEspecialidades();   
        res.render('pages/cadastroPessoa',{especialidades:especialid,senhaGerada: senhaAleatoria }); 
    } catch (error) {
        if (connection) {
            await connection.rollback();
            await connection.end();
        }
        console.error('Erro ao adicionar pessoa:', error);
        // let error_message = verificaErro(error);
        res.render('pages/pag_erro', { message: error });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}




async function adicionarLogin(req, res) {
    const { pessoaId, login, senha, perfil } = req.body;
    let connection;

    try {
        connection = await conectarBancoDeDados();
        await connection.beginTransaction();

        const senhaHash = await bcrypt.hash(senha, 10);
        const result = await insertLoginProfile(login, senhaHash, pessoaId, perfil, connection);

        await connection.commit();
        await connection.end(); // Fechar a conexão após commit

        res.json(result);
    } catch (error) {
        console.error('Erro ao adicionar login:', error);
        if (connection) {
            try {
                await connection.rollback();
                await connection.end(); // Garantir que a conexão seja fechada em caso de erro
            } catch (rollbackError) {
                console.error('Erro ao fazer rollback:', rollbackError);
            }
        }
        res.json({ error: error.message });
    }
}


async function exibirLogin(req, res) {
    try {
        res.render('pages/login');
    } catch (error) {
        console.error('Erro ao exibir a página de login:', error);
        res.render('pages/pag_erro', { message: 'Erro ao exibir a página de login' });
    }
}

async function login(req, res) {
    try {
        const { email, senha } = req.body;
        console.log(email, senha)
        const connection = await conectarBancoDeDados();

        const [rows] = await connection.query('SELECT * FROM tbl_login WHERE login = ?', [email.trim()]);
        if (rows.length === 0) {
            return res.render('pages/login', { message: 'Email ou senha incorretos' });
        }

        const user = rows[0];
        // console.log(user.senha);
        // console.log(senha)
        // const isMatch = await bcrypt.compare(senha, user.senha);
        // console.log(typeof isMatch, isMatch)
        if (senha != user.senha) {
            return res.render('pages/login', { message: 'Email ou senha incorretos' });

        }

        // Se o login for bem-sucedido, renderiza uma mensagem de "logado com sucesso"
        res.render('pages/index', { message: 'Logado com sucesso!' });

     

    } catch (error) {
        console.error('Erro ao realizar login:', error);
        res.render('pages/login', { message: 'Erro ao realizar login' });
    }
}





async function index(req, res) {
    try {
        res.render('pages/index');
    } catch (error) {
        console.error('Erro ao exibir a página inicial:', error);
        // let error_message = verificaErro(error);
        res.render('pages/pag_erro', { message: error_message });
    }
}

async function cadastro(req, res) {
    try {
        const especialidades = await obterEspecialidades();
   
        res.render('pages/cadastroPessoa',{especialidades:especialidades}); // Passando especialidades para o template
    } catch (error) {
        console.error('Erro ao exibir a página de cadastro:', error);
        // let error_message = verificaErro(error);
        res.render('pages/pag_erro', { message: error});
    }
}

function verificaErro(error) {
    console.error("Erro detectado:", error.message);
    let error_message = "Falha na operação";
    if (error.errno === 1062) {
        error_message = "O CPF informado já está cadastrado";
    }
    return error_message;
}

async function associarEspecialidade(req, res) {
    try {
        const { funcionario_id, especialidade_ids } = req.body;

        if (!funcionario_id || !especialidade_ids || especialidade_ids.length === 0) {
            return res.json({ message: "Funcionário e Especialidades são obrigatórios" });
        }

        const result = await associarEspecialidadeFuncionario(funcionario_id, especialidade_ids);
        res.json(result);
    } catch (error) {
        console.error(error);
        res.json({ error: error.message });
    }
}

async function buscarEspecialidades(req, res) {
    let connection;
    try {

        const especialidades = await obterEspecialidades;
       
        res.json(especialidades);
    } catch (error) {
        console.error('Erro ao buscar especialidades:', error.message);
        res.status(500).json({ error: 'Erro ao buscar especialidades' });
    } 
    //     if (connection) {
    //         connection.end(); // Fechar a conexão apenas após concluir todas as operações
    //     }
    // }
}


async function verificarCPFCadastrado(req, res) {
    const { cpf } = req.body;

    try {
        const paciente = await verificarCPF(cpf);

        if (paciente) {
            res.json({ status: 'ok', message: 'CPF cadastrado' });
        } else {
            res.json({ status: 'error', message: 'CPF não cadastrado' });
        }
    } catch (error) {
        console.error('Erro ao verificar CPF:', error);
        res.status(500).json({ status: 'error', message: 'Erro ao verificar CPF' });
    }
}



module.exports = {
    adicionarPessoa,
    adicionarLogin,
    exibirLogin,
    login,
    index,
    cadastro,
    associarEspecialidade,
    buscarEspecialidades,
    verificarCPFCadastrado
};
