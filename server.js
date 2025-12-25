import express from 'express';
import mysql from 'mysql2';
import 'dotenv/config';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const ALGORITHM = 'aes-256-gcm';

function encrypt(text) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(ALGORITHM, ENCRYPTION_KEY);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
}

function decrypt(encryptedData) {
    const parts = encryptedData.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];
    const decipher = crypto.createDecipher(ALGORITHM, ENCRYPTION_KEY);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}










const app = express();
const PORT = process.env.PORT || 3000;

// Middleware de segurança
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // máximo 100 requests por IP
    message: 'Muitas tentativas, tente novamente em 15 minutos.'
});
app.use(limiter);

// Rate limiting específico para login
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5, // máximo 5 tentativas de login por IP
    message: 'Muitas tentativas de login, tente novamente em 15 minutos.'
});

const SECRET_KEY = process.env.SECRET_KEY || process.env.JWT_SECRET;
const TOKEN_EXPIRATION = process.env.TOKEN_EXPIRATION || '150d';

// middleware para permitir o uso de JSON
app.use(express.json());

// CORS - Permitir requisições do app mobile
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// configuração da conexão com o banco de dados
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
});

db.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados: ' + err.stack);
    } else {
        console.log('Conectado ao banco de dados RDS');
    }
});

// função para gerar um token JWT
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, SECRET_KEY, { expiresIn: TOKEN_EXPIRATION });
};

// middleware para verificar tokens JWT
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Pegando o token do cabeçalho Authorization

    if (!token) return res.status(401).json({ message: 'Token não fornecido.' });

    try {
        const decoded = jwt.verify(token, SECRET_KEY); // Verifica a validade do token
        req.userId = decoded.id; // Adiciona o ID do usuário ao request
        next();
    } catch (err) {
        return res.status(403).json({ message: 'Token inválido ou expirado.' });
    }
};








// endpoint para registro de usuários
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Por favor, preencha todos os campos.' });
    }

    try {
        // verificar se o usuário já existe
        const [userexists] = await db.promise().query(
            'SELECT * FROM users WHERE username = ? OR email = ?',
            [username, email]
        );

        if (userexists.length > 0) {
            return res.status(409).json({ message: 'Usuário já existe' });
        }

        // criar hash da senha
        const hashedPassword = await bcrypt.hash(password, 10);

        // inserir o usuário no banco de dados
        const [insertResult] = await db
            .promise()
            .query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [
                username,
                email,
                hashedPassword,
            ]);
            console.log('Usuário criado com sucesso. (1)');

        const token = generateToken(insertResult.insertId);
        res.status(201).json({ message: 'Usuário criado com sucesso.', token });

    } catch (err) {
        console.error('Erro ao cadastrar o usuário: ' + err);
        return res.status(500).json({ message: 'Erro ao cadastrar o usuário.' });
    }
});






//endpoint de login
app.post('/login', loginLimiter, async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Por favor, preencha todos os campos.' });
    }

    try {
        //verificar se o usuário existe
        const [user] = await db.promise().query('select * from users where email = ?', [ email ])

        if (user.length === 0) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        //verificar se a senha está correta
        const passMatch = bcrypt.compare(password, user[0].password);

        if (!passMatch) {
            return res.status(401).json({ message: 'Senha incorreta.' });
        }

        //gerar token JWT para o usuário
        const token = generateToken(user[0].user_id);


        //pegar o username para passar pra o front-end
        const [username] = await db.promise().query('select username from users where email = ?', [ email ]);
        const [user_id] = await db.promise().query('select user_id from users where email = ?', [ email ]);

        return res.status(200).json({ message: 'Login realizado com sucesso.', token, username: username[0].username, user_id: user_id[0].user_id });

    }catch(error){
        console.error(`Erro ao fazer Login: ${error}`);
        return res.status(500).json({ message: 'Erro ao fazer login.' });
    }
});












const hashData = (data, saltRounds) => {
    return bcrypt.hash(data, saltRounds);
}

const compareHash = (data, hash) => {
    return bcrypt.compare(data, hash);
}

















//Endpoint para receber os commits de notas
app.post('/api/addnote', async (req, res) => {
    const { user_id, note_key, note_value} = req.body;

    const data_type = "note"

    if (!user_id) {
        return res.status(400).json({ message: 'user_id é obrigatório.' });
    }

    if (!note_key || !note_value) {
        return res.status(400).json({ message: 'Por favor, preencha todos os campos.' });
    }

    try {
        // Converter user_id para número
        const userIdNum = parseInt(user_id, 10);
        if (isNaN(userIdNum)) {
            console.error(`Erro: user_id inválido - ${user_id}`);
            return res.status(400).json({ message: 'user_id inválido.' });
        }

        // Verificar se o user_id existe na tabela users
        const [userCheck] = await db.promise().query(
            'SELECT user_id FROM users WHERE user_id = ?',
            [userIdNum]
        );

        if (userCheck.length === 0) {
            console.error(`Erro: user_id ${userIdNum} não encontrado na tabela users`);
            return res.status(404).json({ message: 'Usuário não encontrado. Por favor, faça login novamente.' });
        }

        const hashedNoteTitle = encrypt(note_key);
        const hashedNoteValue = encrypt(note_value);

        console.log(`Inserindo nota para user_id: ${userIdNum}`);
        //inserir as informações no banco de dados
        const [insertData] = await db.promise().query(
            'INSERT INTO user_data (user_id, note_key, note_value, data_type) VALUES (?, ?, ?, ?)',
             [userIdNum, hashedNoteTitle, hashedNoteValue, data_type]);
            
            console.log('Dados inseridos com sucesso.');
            return res.status(201).json({ message: 'Informações inseridas com sucesso.' });

    }catch(error){
        console.error(`Erro ao inserir as informações no banco de dados:`, error);
        
        // Tratamento específico para erro de foreign key
        if (error.code === 'ER_NO_REFERENCED_ROW_2' || error.code === '1452') {
            return res.status(404).json({ message: 'Usuário não encontrado. Por favor, faça login novamente.' });
        }
        
        return res.status(500).json({ message: 'Erro ao inserir os dados.' });
    }
})

//endpoint para receber os commits de informação de cartão de crédito
app.post('/api/addkeycard', async (req, res) => {
    const { user_id, keycard_title, keycard_number, keycard_data, keycard_name, security_code} = req.body;
    
    const data_type = "keycard"

    if (!keycard_title || !keycard_number || !keycard_name || !security_code) {
        return res.status(400).json({ message: 'Por favor, preencha todos os campos.' });
    }

    try {

        const hashedCardTitle = encrypt(keycard_title);
        const hashedCardNumber = encrypt(keycard_number);
        const hashedCardData = encrypt(keycard_data);
        const hashedCardName = encrypt(keycard_name);
        const hashedSecurityCode = encrypt(security_code);

        //inserir as informações no banco de dados
        const [insertData] = await db.promise().query(
            'INSERT INTO user_data (user_id, keycard_title, keycard_number, keycard_data, keycard_name, security_code, data_type) VALUES (?, ?, ?, ?, ?, ?, ?)',
             [user_id, hashedCardTitle, hashedCardNumber, hashedCardData, hashedCardName, hashedSecurityCode, data_type]);
            
             console.log('Dados inseridos com sucesso.');
            return res.status(201).json({ message: 'Informações inseridas com sucesso.' });

    }catch(error){
        console.error(`Erro ao inserir as informações no banco de dados: ${error}`);
        return res.status(500).json({ message: 'Erro ao inserir os dados.' });
    }
})

//endpoint para receber commits dos emails
app.post('/api/addemaildata', async (req, res) => {
    const { user_id, email_title, email } = req.body;

    const data_type = "email"

    if (!email_title || !email) {
        return res.status(400).json({ message: 'Por favor, preencha todos os campos.' });
    }

    try {

        const hashedEmailTitle = encrypt(email_title);
        const hashedEmail = encrypt(email);

        //inserir as informações no banco de dados
        const [insertData] = await db.promise().query(
            'INSERT INTO user_data (user_id, email_title, email, data_type) VALUES (?, ?, ?, ?)',
             [user_id, hashedEmailTitle, hashedEmail, data_type]);
            
             console.log('Dados inseridos com sucesso.');
            return res.status(201).json({ message: 'Informações inseridas com sucesso.' });

    }catch(error){
        console.error(`Erro ao inserir as informações no banco de dados: ${error}`);
        return res.status(500).json({ message: 'Erro ao inserir os dados.' });
    }
})

//endpoint para receber commits das senhas
app.post('/api/addpassword', async (req, res) => {
    const { user_id, pass_title, password_key } = req.body;

    const data_type = "password"

    if (!pass_title || !password_key) {
        return res.status(400).json({ message: 'Por favor, preencha todos os campos.' });
    }

    try {

        const hashedPassTitle = encrypt(pass_title);
        const hashedPassKey = encrypt(password_key);

        //inserir as informações no banco de dados
        const [insertData] = await db.promise().query(
            'INSERT INTO user_data (user_id, pass_title, password_key, data_type) VALUES (?, ?, ?, ?)',
             [user_id, hashedPassTitle, hashedPassKey, data_type]);
            
             console.log('Dados inseridos com sucesso.');
            return res.status(201).json({ message: 'Informações inseridas com sucesso.' });

    }catch(error){
        console.error(`Erro ao inserir as informações no banco de dados: ${error}`);
        return res.status(500).json({ message: 'Erro ao inserir os dados.' });
    }
})

































//endpoint para requisições de informações de notas
app.get('/api/getnotes', async (req, res) => {
    const { user_id } = req.query;


    try {
        // pegar as informações do usuário no banco de dados
        const [data] = await db.promise().query('SELECT data_id, note_key, note_value FROM user_data WHERE user_id = ? AND data_type = ?', [ user_id, "note" ]);
        console.log('data GetNotes: ', data);
        
        if (data.length === 0) {
            return res.status(404).json({ message: 'Nenhum dado encontrado.' });
        }
        
        const decryptedData = data.map(item => ({
            data_id: item.data_id,
            note_key: decrypt(item.note_key),
            note_value: decrypt(item.note_value)
        }));
        console.log(decryptedData);
        
        return res.status(200).json({ data: decryptedData });
        
    } catch (error) {
        console.error(`Erro ao pegar as informações do usuário GetNotes: ${error}`);
        console.log('user_id: ', user_id);
        return res.status(500).json({ message: 'Erro ao pegar as informações do usuário.' });
    }
});





//endpoint para requisições de informações de emails
app.get('/api/getemails', async (req, res) => {
    const { user_id } = req.query;
    
    try {
        //pegar as informações do usuário no banco de dados
        const [data] = await db.promise().query('SELECT data_id, email_title, email FROM user_data WHERE user_id = ? AND data_type = ?', [ user_id, "email" ]);
        console.log('data GetEmails: ', data);
        
        if (data.length === 0) {
            return res.status(404).json({ message: 'Nenhum dado encontrado.' });
        }
        
        const decryptedData = data.map(item => ({
            data_id: item.data_id,
            email_title: decrypt(item.email_title),
            email: decrypt(item.email)
        }));
        console.log(decryptedData);
        
        return res.status(200).json({ data: decryptedData });
        
    }catch(error){
        console.error(`Erro ao pegar as informações do usuário GetEmails: ${error}`);
        return res.status(500).json({ message: 'Erro ao pegar as informações do usuário.' });
    }
})




//endpoint para requisições de informações de cartões
app.get('/api/getkeycards', async (req, res) => {
    const { user_id } = req.query;
    
    try {
        //pegar as informações do usuário no banco de dados
        const [data] = await db.promise().query('SELECT data_id, keycard_title, keycard_number, keycard_data, security_code, keycard_name FROM user_data WHERE user_id = ? AND data_type = ?', [ user_id, "keycard" ]);
        console.log('data GetKeycards: ', data);
        
        if (data.length === 0) {
            return res.status(404).json({ message: 'Nenhum dado encontrado.' });
        }
        
        const decryptedData = data.map(item => ({
            data_id: item.data_id,
            keycard_title: decrypt(item.keycard_title),
            keycard_number: decrypt(item.keycard_number),
            keycard_data: decrypt(item.keycard_data),
            security_code: decrypt(item.security_code),
            keycard_name: decrypt(item.keycard_name)
        }));
        
        console.log(decryptedData);
        
        return res.status(200).json({ data: decryptedData });
        
    }catch(error){
        console.error(`Erro ao pegar as informações do usuário GetKeycards: ${error}`);
        return res.status(500).json({ message: 'Erro ao pegar as informações do usuário.' });
    }
})



//endpoint para requisições de informações de senhas
app.get('/api/getpasswords', async (req, res) => {
    const { user_id } = req.query;
    
    try {
        //pegar as informações do usuário no banco de dados
        const [data] = await db.promise().query('SELECT data_id, pass_title, password_key FROM user_data WHERE user_id = ? AND data_type = ?', [ user_id, "password" ]);
        console.log('data GetPasswords: ', data);
        
        if (data.length === 0) {
            return res.status(404).json({ message: 'Nenhum dado encontrado.' });
        }
        
        const decryptedData = data.map(item => ({
            data_id: item.data_id,
            pass_title: decrypt(item.pass_title),
            password_key: decrypt(item.password_key)
        }));
        
        console.log(decryptedData);
        return res.status(200).json({ data: decryptedData });

    }catch(error){
        console.error(`Erro ao pegar as informações do usuário GetPasswords: ${error}`);
        return res.status(500).json({ message: 'Erro ao pegar as informações do usuário.' });
    }
})











//endpoint para deletar informações baseado no data_id
app.delete('/api/deletedata', async (req, res) => {
    const { data_id, user_id } = req.body;

    if (!data_id || !user_id) {
        return res.status(400).json({ message: 'Por favor, forneça o data_id e user_id.' });
    }

    try {
        // Verificar se o registro existe e pertence ao usuário
        const [dataExists] = await db.promise().query(
            'SELECT * FROM user_data WHERE data_id = ? AND user_id = ?',
            [data_id, user_id]
        );

        if (dataExists.length === 0) {
            return res.status(404).json({ message: 'Registro não encontrado ou não pertence a este usuário.' });
        }

        // Deletar o registro
        await db.promise().query(
            'DELETE FROM user_data WHERE data_id = ? AND user_id = ?',
            [data_id, user_id]
        );

        console.log(`Registro com data_id ${data_id} deletado com sucesso.`);
        return res.status(200).json({ message: 'Informação deletada com sucesso.' });

    } catch (error) {
        console.error(`Erro ao deletar a informação: ${error}`);
        return res.status(500).json({ message: 'Erro ao deletar a informação.' });
    }
});

// endpoint para editar informações baseado no data_id
app.put('/api/updatedata', async (req, res) => {
    const { data_id, user_id, data_type, ...updateData } = req.body;

    if (!data_id || !user_id || !data_type) {
        return res.status(400).json({ message: 'Por favor, forneça o data_id, user_id e data_type.' });
    }

    try {
        // Verificar se o registro existe e pertence ao usuário
        const [dataExists] = await db.promise().query(
            'SELECT * FROM user_data WHERE data_id = ? AND user_id = ? AND data_type = ?',
            [data_id, user_id, data_type]
        );

        if (dataExists.length === 0) {
            return res.status(404).json({ message: 'Registro não encontrado ou não pertence a este usuário.' });
        }

        // Preparar campos para atualização baseado no tipo
        let updateFields = [];
        let updateValues = [];

        if (data_type === 'note') {
            if (updateData.note_key) {
                const hashedNoteKey = encrypt(updateData.note_key);
                updateFields.push('note_key = ?');
                updateValues.push(hashedNoteKey);
            }
            if (updateData.note_value) {
                const hashedNoteValue = encrypt(updateData.note_value);
                updateFields.push('note_value = ?');
                updateValues.push(hashedNoteValue);
            }
        } else if (data_type === 'password') {
            if (updateData.pass_title) {
                const hashedPassTitle = encrypt(updateData.pass_title);
                updateFields.push('pass_title = ?');
                updateValues.push(hashedPassTitle);
            }
            if (updateData.password_key) {
                const hashedPassKey = encrypt(updateData.password_key);
                updateFields.push('password_key = ?');
                updateValues.push(hashedPassKey);
            }
        } else if (data_type === 'email') {
            if (updateData.email_title) {
                const hashedEmailTitle = encrypt(updateData.email_title);
                updateFields.push('email_title = ?');
                updateValues.push(hashedEmailTitle);
            }
            if (updateData.email) {
                const hashedEmail = encrypt(updateData.email);
                updateFields.push('email = ?');
                updateValues.push(hashedEmail);
            }
        } else if (data_type === 'keycard') {
            if (updateData.keycard_title) {
                const hashedCardTitle = encrypt(updateData.keycard_title);
                updateFields.push('keycard_title = ?');
                updateValues.push(hashedCardTitle);
            }
            if (updateData.keycard_name) {
                const hashedCardName = encrypt(updateData.keycard_name);
                updateFields.push('keycard_name = ?');
                updateValues.push(hashedCardName);
            }
            if (updateData.keycard_number) {
                const hashedCardNumber = encrypt(updateData.keycard_number);
                updateFields.push('keycard_number = ?');
                updateValues.push(hashedCardNumber);
            }
            if (updateData.keycard_data) {
                const hashedCardData = encrypt(updateData.keycard_data);
                updateFields.push('keycard_data = ?');
                updateValues.push(hashedCardData);
            }
            if (updateData.security_code) {
                const hashedSecurityCode = encrypt(updateData.security_code);
                updateFields.push('security_code = ?');
                updateValues.push(hashedSecurityCode);
            }
        }

        if (updateFields.length === 0) {
            return res.status(400).json({ message: 'Nenhum campo para atualizar foi fornecido.' });
        }

        // Adicionar data_id e user_id aos valores para a cláusula WHERE
        updateValues.push(data_id, user_id);

        // Atualizar o registro
        const updateQuery = `UPDATE user_data SET ${updateFields.join(', ')} WHERE data_id = ? AND user_id = ?`;
        await db.promise().query(updateQuery, updateValues);

        console.log(`Registro com data_id ${data_id} atualizado com sucesso.`);
        return res.status(200).json({ message: 'Informação atualizada com sucesso.' });

    } catch (error) {
        console.error(`Erro ao atualizar a informação: ${error}`);
        return res.status(500).json({ message: 'Erro ao atualizar a informação.' });
    }
});

// endpoint protegido para verificar o Token
app.get('/protected', authenticateToken, (req, res) => {
    res.status(200).json({ message: 'Acesso concedido.', userId: req.userId });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});



app.all('*', (req, res) => {
  res.json({
    method: req.method,
    path: req.path
  })
})




app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta: ${PORT}`);
    console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
});