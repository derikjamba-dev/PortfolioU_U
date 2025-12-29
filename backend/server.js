// server.js
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares - CORS configurado para desenvolvimento
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    
    // Responder OPTIONS requests
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

const allowedOrigins = [
    'https://jocular-travesseiro-cffd1e.netlify.app/',
    'http://localhost:3000',
];

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Log de requisições para debug
app.use((req, res, next) => {
    console.log(`📥 ${req.method} ${req.url} - Origin: ${req.headers.origin || 'N/A'}`);
    next();
});

// Configuração do transportador de email
const transporter = nodemailer.createTransport({
    service: 'gmail', // ou outro serviço (outlook, yahoo, etc)
    auth: {
        user: process.env.EMAIL_USER, // seu email
        pass: process.env.EMAIL_PASS  // sua senha de app
    }
});

// Verificar conexão com servidor de email
transporter.verify((error, success) => {
    if (error) {
        console.error('❌ Erro na configuração do email:', error);
    } else {
        console.log('✅ Servidor pronto para enviar emails');
    }
});

// Rota de teste
app.get('/', (req, res) => {
    res.json({ 
        message: 'Backend da Agência DRK está funcionando!',
        status: 'online'
    });
});

// Rota para enviar email
app.post('/api/enviar-email', async (req, res) => {
    const { nome, email, telefone, mensagem } = req.body;

    // Validação básica
    if (!nome || !email || !mensagem) {
        return res.status(400).json({ 
            success: false,
            message: 'Por favor, preencha todos os campos obrigatórios.' 
        });
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ 
            success: false,
            message: 'Por favor, forneça um email válido.' 
        });
    }

    // Configuração do email para você (receber)
    const mailOptionsToYou = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER, // seu email para receber as mensagens
        subject: `📧 Nova mensagem de ${nome} - Site Agência DRK`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(45deg, #00ff88, #00b8ff); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .header h1 { color: white; margin: 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .info-box { background: white; padding: 15px; margin: 10px 0; border-left: 4px solid #00ff88; }
                    .label { font-weight: bold; color: #00b8ff; }
                    .message-box { background: white; padding: 20px; margin: 20px 0; border-radius: 5px; border: 1px solid #ddd; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Nova Mensagem do Site</h1>
                    </div>
                    <div class="content">
                        <div class="info-box">
                            <p><span class="label">Nome:</span> ${nome}</p>
                        </div>
                        <div class="info-box">
                            <p><span class="label">Email:</span> ${email}</p>
                        </div>
                        ${telefone ? `
                        <div class="info-box">
                            <p><span class="label">Telefone:</span> ${telefone}</p>
                        </div>
                        ` : ''}
                        <div class="message-box">
                            <p class="label">Mensagem:</p>
                            <p>${mensagem.replace(/\n/g, '<br>')}</p>
                        </div>
                        <p style="color: #666; font-size: 12px; margin-top: 30px;">
                            Esta mensagem foi enviada através do formulário de contato do site da Agência DRK.
                        </p>
                    </div>
                </div>
            </body>
            </html>
        `,
        replyTo: email
    };

    // Configuração do email de confirmação para o cliente
    const mailOptionsToClient = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: '✅ Mensagem recebida - Agência DRK',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(45deg, #00ff88, #00b8ff); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .header h1 { color: white; margin: 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .message { background: white; padding: 20px; margin: 20px 0; border-radius: 5px; }
                    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Mensagem Recebida!</h1>
                    </div>
                    <div class="content">
                        <p>Olá <strong>${nome}</strong>,</p>
                        <p>Obrigado por entrar em contato com a Agência DRK!</p>
                        <p>Recebi sua mensagem e entrarei em contato em breve.</p>
                        
                        <div class="message">
                            <p><strong>Resumo da sua mensagem:</strong></p>
                            <p>${mensagem.replace(/\n/g, '<br>')}</p>
                        </div>

                        <p>Atenciosamente,<br>
                        <strong>Derik Jamba</strong><br>
                        Agência DRK</p>

                        <div class="footer">
                            <p>Este é um email automático, por favor não responda.</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    try {
        // Enviar email para você
        await transporter.sendMail(mailOptionsToYou);
        
        // Enviar email de confirmação para o cliente
        await transporter.sendMail(mailOptionsToClient);

        res.status(200).json({ 
            success: true,
            message: 'Mensagem enviada com sucesso! Entrarei em contato em breve.' 
        });

    } catch (error) {
        console.error('❌ Erro ao enviar email:', error);
        res.status(500).json({ 
            success: false,
            message: 'Erro ao enviar mensagem. Por favor, tente novamente mais tarde.' 
        });
    }
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📧 Endpoints disponíveis:`);
    console.log(`   GET  http://localhost:${PORT}/`);
    console.log(`   POST http://localhost:${PORT}/api/enviar-email`);
});