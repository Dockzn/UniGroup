/**
 * Este script fornece proteção imediata contra acesso não autorizado.
 * Deve ser incluído como o primeiro script em cada página protegida.
 * Usa <script> padrão (não módulo) para garantir execução imediata antes de qualquer outro código.
 */
(function() {
    // Lista de páginas públicas que não requerem autenticação
    const publicPages = [
        '/login/login.html',
        '/cadastro/cadastro.html',
        '/index.html',
        '/'
    ];
    
    // Verifica se a página atual é pública
    function isPublicPage(path) {
        return publicPages.some(publicPath => path.includes(publicPath));
    }
    
    // Verifica se o usuário está autenticado
    function isAuthenticated() {
        return localStorage.getItem('token') !== null;
    }
    
    // Obter o caminho atual
    const currentPath = window.location.pathname;
    
    // Executar verificação imediatamente
    if (!isPublicPage(currentPath) && !isAuthenticated()) {
        console.error('[BLOQUEIO DE SEGURANÇA] Acesso não autorizado: redirecionando para login');
        
        // Bloquear completamente a renderização da página
        document.documentElement.innerHTML = '';
        document.body = document.createElement('body');
        
        // Mostrar mensagem de redirecionamento
        const msgElement = document.createElement('div');
        msgElement.innerText = 'Redirecionando para a página de login...';
        msgElement.style.fontFamily = 'Arial, sans-serif';
        msgElement.style.fontSize = '16px';
        msgElement.style.padding = '20px';
        msgElement.style.textAlign = 'center';
        msgElement.style.marginTop = '100px';
        document.body.appendChild(msgElement);
        
        // Redirecionar usando replace para evitar histórico de navegação
        window.location.replace('/pages/login/login.html');
    }
})();
