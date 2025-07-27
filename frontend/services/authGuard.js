import { authService } from './authService.js';

const publicPages = [
    '/login/login.html',
    '/cadastro/cadastro.html',
    '/index.html',
    '/'
];

const authPages = [
    '/login/login.html',
    '/cadastro/cadastro.html'
];

function isPublicPage(path) {
    return publicPages.some(publicPath => path.includes(publicPath));
}

function isAuthPage(path) {
    return authPages.some(authPath => path.includes(authPath));
}


/**
 * Verifica a autenticação do usuário e aplica regras de redirecionamento
 * @returns {boolean} true se o usuário pode acessar a página atual
 */
function checkAuth() {
    const currentPath = window.location.pathname;
    const isAuthenticated = authService.isAuthenticated();
    const currentUser = authService.getCurrentUser();

    console.log('Verificando autenticação:', currentPath, isAuthenticated ? `Usuário: ${currentUser?.name}` : 'Não autenticado');

    // Verificação para páginas protegidas - redirecionar para login se não autenticado
    if (!isPublicPage(currentPath) && !isAuthenticated) {
        console.error('BLOQUEADO: Acesso não autorizado a página protegida');
        // Usar window.location.replace para evitar histórico de navegação
        window.location.replace('/pages/login/login.html');
        throw new Error('Acesso não autorizado');
    }

    // Verificação para páginas de autenticação - redirecionar para início se já autenticado
    if (isAuthPage(currentPath) && isAuthenticated) {
        console.log('Redirecionando: usuário já autenticado em página de login/cadastro');
        window.location.replace('/pages/inicio/inicio.html');
        return false;
    }

    return true;
}

export { checkAuth };
