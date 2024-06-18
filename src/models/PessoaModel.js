const conectarBancoDeDados = require('../config/db');
const bcrypt = require('bcrypt');
let connection=null;
async function insertFuncionario(cliente, enderecos, telefones, funcionario, especialidades) {
    connection = await conectarBancoDeDados();
    try {
       await connection.beginTransaction();

        const endereco = enderecos[0];
        if (!endereco || !endereco.logradouro) {
            throw new Error('Endereço ou logradouro não fornecido para inserção de funcionário.');
        }

        const [resEnd] = await connection.query('INSERT INTO tbl_endereco (logradouro, bairro, estado, numero, complemento, cep) VALUES (?, ?, ?, ?, ?, ?)',
            [endereco.logradouro, endereco.bairro, endereco.estado, endereco.numero, endereco.complemento, endereco.cep]);
        const enderecoId = resEnd.insertId;

        const [resPessoa] = await connection.query('INSERT INTO tbl_pessoa (cpf, nome, data_nasc, genero, email, endereco_id) VALUES (?, ?, ?, ?, ?, ?)',
            [cliente.cpf, cliente.nome, cliente.data_nasc, cliente.genero, cliente.email, enderecoId]);
        const pessoaId = resPessoa.insertId;

        if (funcionario.data_admissao && funcionario.crm) {
            const [resFunc] = await connection.query('INSERT INTO tbl_funcionario (data_admissao, crm, pessoa_id, pessoa_endereco_id) VALUES (?, ?, ?, ?)',
                [funcionario.data_admissao, funcionario.crm, pessoaId, enderecoId]);
            console.log('Funcionário inserido com sucesso.');

          
            for (let especialidadeId of especialidades) {
            await connection.query(
                `INSERT INTO tbl_funcionario_has_tbl_especialidade 
                (funcionario_id, funcionario_pessoa_id, funcionario_pessoa_endereco_id, especialidade_id) 
                VALUES (?, ?, ?, ?)`,
                [resFunc.insertId, resPessoa.insertId,resEnd.insertId, especialidadeId]
            );
            }
        } else {
            console.log('Não foram fornecidos dados de funcionário. Inserindo como paciente padrão.');
        }

        for (let tel of telefones) {
            const [resTel] = await connection.query('INSERT INTO tbl_telefone (numero) VALUES (?)', [tel.numero]);
            const telefoneId = resTel.insertId;
            await connection.query('INSERT INTO tbl_pessoa_has_tbl_telefone (pessoa_id, telefone_id, pessoa_tbl_endereco_id) VALUES (?, ?, ?)',
                [pessoaId, telefoneId, enderecoId]);
        }

        await connection.commit();
        console.log('Transação de pessoa concluída com sucesso.');
        return pessoaId;
    } catch (error) {
        await connection.rollback();
        console.error('Erro ao adicionar pessoa:', error.message);
        throw error;
    }
}



async function insertPaciente(cliente, enderecos, telefones, connection) {
    connection = await conectarBancoDeDados();
    try {
        await connection.beginTransaction();

        const endereco = enderecos[0];

        
        if (!endereco || !endereco.logradouro) {
            throw new Error('Endereço ou logradouro não fornecido para inserção de paciente.');
        }

        const [resEnd] = await connection.query('INSERT INTO tbl_endereco (logradouro, bairro, estado, numero, complemento, cep) VALUES (?, ?, ?, ?, ?, ?)', 
            [endereco.logradouro, endereco.bairro, endereco.estado, endereco.numero, endereco.complemento, endereco.cep]);
        const enderecoId = resEnd.insertId;

        const [resPessoa] = await connection.query('INSERT INTO tbl_pessoa (cpf, nome, data_nasc, genero, email, endereco_id) VALUES (?, ?, ?, ?, ?, ?)', 
            [cliente.cpf, cliente.nome, cliente.data_nasc, cliente.genero, cliente.email, enderecoId]);
        const pessoaId = resPessoa.insertId; 

        const [resPac] = await connection.query('INSERT INTO tbl_paciente (pessoa_id) VALUES (?)', [pessoaId]);

        for (let tel of telefones) {
            const [resTel] = await connection.query('INSERT INTO tbl_telefone (numero) VALUES (?)', [tel.numero]);
            const telefoneId = resTel.insertId;
            await connection.query('INSERT INTO tbl_pessoa_has_tbl_telefone (pessoa_id, telefone_id, pessoa_tbl_endereco_id) VALUES (?, ?, ?)', 
                [pessoaId, telefoneId, enderecoId]);
        }

        await connection.commit();
        console.log('Transação concluída com sucesso.');

        return pessoaId; 
    } catch (error) {
        await connection.rollback();
        console.error('Erro ao adicionar pessoa:', error.message);
        throw error;
    }
}


async function insertLoginProfile(login, senha, pessoaId, perfil, connection) {
    connection = await conectarBancoDeDados();
    try {
        await connection.beginTransaction();

        const [resPessoa] = await connection.query('SELECT endereco_id FROM tbl_pessoa WHERE id = ?', [pessoaId]);

        if (resPessoa.length === 0) {
            throw new Error('Pessoa não encontrada.');
        }

        const hashedSenha = await bcrypt.hash(senha, 10);

        const enderecoId = resPessoa[0].endereco_id;
        const [resLogin] = await connection.query('INSERT INTO tbl_login (login, senha, pessoa_id, status, pessoa_endereco_id) VALUES (?, ?, ?, ?, ?)',
            [login, hashedSenha, pessoaId, 1, enderecoId]);

        for (let p of perfil) {
            await connection.query('INSERT INTO tbl_perfis (tipo, login_id, login_pessoa_id, login_pessoa_endereco_id) VALUES (?, ?, ?, ?)',
                [p.tipo, resLogin.insertId, pessoaId, enderecoId]);
        }

        await connection.commit();
        console.log('Transação de login e perfil concluída com sucesso.');
        return { message: 'Transação de login e perfil concluída com sucesso.' };
    } catch (error) {
        await connection.rollback();
        console.error('Erro ao adicionar login e perfil:', error);
        throw error;
    }
}

async function associarEspecialidadeFuncionario(funcionarioId, pessoaId, enderecoId, especialidades, connection) {
    try {
     
        const [funcionario] = await connection.query(
            'SELECT pessoa_id, pessoa_endereco_id FROM tbl_funcionario WHERE id = ?',
            [funcionarioId]
        );

        if (funcionario.length === 0) {
            throw new Error('Funcionário não encontrado');
        }

        const { pessoa_id, pessoa_endereco_id } = funcionario[0];

        
        for (let especialidadeId of especialidades) {
            await connection.query(
                `INSERT INTO tbl_funcionario_has_tbl_especialidade 
                (funcionario_id, funcionario_pessoa_id, funcionario_pessoa_endereco_id, especialidade_id) 
                VALUES (?, ?, ?, ?)`,
                [funcionarioId, pessoa_id, pessoa_endereco_id, especialidadeId]
            );
        }

        console.log('Especialidades associadas com sucesso.');
        return { message: 'Especialidades associadas com sucesso.' };
    } catch (error) {
        console.error('Erro ao associar especialidades:', error);
        throw error;
    }
}


module.exports = {insertFuncionario,insertLoginProfile,insertPaciente,associarEspecialidadeFuncionario}