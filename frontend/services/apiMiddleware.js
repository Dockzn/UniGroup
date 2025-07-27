
function checkTokenAndRedirect() {
    const token = localStorage.getItem('token');
    if (!token) {
        console.error('API: Token não encontrado, redirecionando para login');
        window.location.replace('/pages/login/login.html');
        throw new Error('Não autorizado - Token não encontrado');
    }
    return token;
}

export function secureApi(apiFunction) {
    return async function(...args) {
        const token = checkTokenAndRedirect();
        try {
            const result = await apiFunction(...args);
            return result;
        } catch (error) {
            if (error.status === 401) {
                console.error('API: Token inválido, redirecionando para login');
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.replace('/pages/login/login.html');
                throw new Error('Sessão expirada. Por favor, faça login novamente.');
            }
            throw error;
        }
    };
}
