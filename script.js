// Selecionar elementos
const btnMenu = document.getElementById('btn-menu');
const menuMobile = document.getElementById('menu-mobile');
const overlay = document.getElementById('overlay');
const btnFechar = document.querySelector('.btn-fechar');
const menuLinks = document.querySelectorAll('.menu-link');

// Abrir menu mobile
btnMenu.addEventListener('click', () => {
    menuMobile.style.right = "0";
    overlay.style.display = "block";
    document.body.style.overflow = "hidden"; // Previne scroll do body
});

// Fechar menu mobile pelo botão X
btnFechar.addEventListener('click', () => {
    menuMobile.style.right = "-100%";
    overlay.style.display = "none";
    document.body.style.overflow = "auto"; // Restaura scroll do body
});

// Fechar menu mobile clicando no overlay
overlay.addEventListener('click', () => {
    menuMobile.style.right = "-100%";
    overlay.style.display = "none";
    document.body.style.overflow = "auto";
});

// Fechar menu mobile ao clicar em qualquer link
menuLinks.forEach(link => {
    link.addEventListener('click', () => {
        menuMobile.style.right = "-100%";
        overlay.style.display = "none";
        document.body.style.overflow = "auto";
    });
});

// Fechar menu ao pressionar ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        menuMobile.style.right = "-100%";
        overlay.style.display = "none";
        document.body.style.overflow = "auto";
    }
});

// URL do backend - IMPORTANTE: Certifique-se que o backend está rodando!
const API_URL = 'https://portfoliobackend-socb.onrender.com/api/enviar-email';

// Verificar se o backend está acessível
async function verificarBackend() {
    try {
        const response = await fetch('http://localhost:3000/');
        if (response.ok) {
            console.log('✅ Backend conectado com sucesso!');
            return true;
        } else {
            console.error('❌ Backend retornou erro:', response.status);
            return false;
        }
    } catch (error) {
        console.error('❌ Não foi possível conectar ao backend:', error.message);
        return false;
    }
}

// Verificar conexão ao carregar a página
window.addEventListener('load', () => {
    verificarBackend();
});

// Função para mostrar mensagens de feedback
function mostrarMensagem(texto, tipo) {
    // Remover mensagem anterior se existir
    const mensagemAnterior = document.querySelector('.mensagem-feedback');
    if (mensagemAnterior) {
        mensagemAnterior.remove();
    }

    // Criar elemento de mensagem
    const mensagem = document.createElement('div');
    mensagem.className = `mensagem-feedback ${tipo}`;
    mensagem.innerHTML = `
        <i class="bi bi-${tipo === 'sucesso' ? 'check-circle-fill' : 'exclamation-circle-fill'}"></i>
        <span>${texto}</span>
    `;

    // Adicionar ao formulário
    const form = document.querySelector('.formulario form');
    if (form) {
        form.appendChild(mensagem);

        // Remover após 5 segundos
        setTimeout(() => {
            mensagem.style.animation = 'slideOut 0.3s ease-out forwards';
            setTimeout(() => mensagem.remove(), 300);
        }, 5000);
    }
}

// Processar envio do formulário
const form = document.querySelector('.formulario form');

if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Obter valores dos campos
        const nome = form.querySelector('input[type="text"]').value.trim();
        const email = form.querySelector('input[type="email"]').value.trim();
        const telefone = form.querySelector('input[type="tel"]').value.trim();
        const mensagem = form.querySelector('textarea').value.trim();

        // Validação básica
        if (!nome || !email || !mensagem) {
            mostrarMensagem('Por favor, preencha todos os campos obrigatórios.', 'erro');
            return;
        }

        // Validação de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            mostrarMensagem('Por favor, forneça um email válido.', 'erro');
            return;
        }

        // Obter botão de enviar
        const btnEnviar = form.querySelector('.btn-enviar input[type="submit"]');
        const textoOriginal = btnEnviar.value;

        // Desabilitar botão durante envio
        btnEnviar.value = 'ENVIANDO...';
        btnEnviar.disabled = true;
        btnEnviar.style.opacity = '0.6';
        btnEnviar.style.cursor = 'not-allowed';

        try {
            // Verificar se o backend está acessível primeiro
            console.log('🔍 Verificando conexão com o backend...');
            const backendOk = await verificarBackend();
            
            if (!backendOk) {
                throw new Error('Backend não está acessível. Certifique-se que o servidor está rodando em http://localhost:3000');
            }

            console.log('📤 Enviando dados para o backend...');

            // Enviar dados para o backend
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nome: nome,
                    email: email,
                    telefone: telefone,
                    mensagem: mensagem
                })
            });

            console.log('📥 Resposta recebida:', response.status);

            // Processar resposta
            const data = await response.json();
            console.log('📊 Dados da resposta:', data);

            if (response.ok && data.success) {
                // Sucesso
                mostrarMensagem(data.message || 'Mensagem enviada com sucesso!', 'sucesso');
                form.reset(); // Limpar formulário
            } else {
                // Erro do servidor
                mostrarMensagem(data.message || 'Erro ao enviar mensagem.', 'erro');
            }

        } catch (error) {
            console.error('❌ Erro ao enviar:', error);
            
            // Mensagem de erro mais específica
            let mensagemErro = 'Erro ao conectar com o servidor. ';
            
            if (error.message.includes('Failed to fetch') || error.message.includes('Backend não está acessível')) {
                mensagemErro = '⚠️ Servidor offline. Certifique-se que o backend está rodando com o comando: node server.js';
            } else if (error.message.includes('NetworkError')) {
                mensagemErro += 'Verifique sua conexão com a internet.';
            } else {
                mensagemErro += error.message;
            }
            
            mostrarMensagem(mensagemErro, 'erro');

        } finally {
            // Reabilitar botão
            btnEnviar.value = textoOriginal;
            btnEnviar.disabled = false;
            btnEnviar.style.opacity = '1';
            btnEnviar.style.cursor = 'pointer';
        }
    });
}

// Animação de scroll suave para links âncora
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        
        // Ignorar links vazios
        if (href === '#' || href === '#!') {
            return;
        }

        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

console.log('✅ Script carregado com sucesso!');