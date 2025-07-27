// Serviço para gerenciar autenticação do usuário
// Para alternar entre ambiente local e remoto, mude a constante IS_LOCAL
const IS_LOCAL = true; // Mude para false para voltar ao servidor remoto
const API_URL = IS_LOCAL ? 'http://localhost:3000' : 'https://unigroup.onrender.com';

/**
 * Realiza o login do usuário
 * @param {string} email - Email do usuário
 * @param {string} password - Senha do usuário
 * @returns {Promise<object>} Dados do usuário e token
 */
async function login(email, password) {
    try {
        const response = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok && data.token) {
            // Salvar os dados do usuário no localStorage
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            return data;
        } else {
            throw new Error(data.message || 'Falha na autenticação');
        }
    } catch (error) {
        console.error('Erro no login:', error);
        throw error;
    }
}

/**
 * Realiza o registro de um novo usuário
 * @param {string} name - Nome do usuário
 * @param {string} email - Email do usuário
 * @param {string} password - Senha do usuário
 * @returns {Promise<object>} Resposta da API
 */
async function register(name, email, password) {
    try {
        const response = await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
        });
        
        return await response.json();
    } catch (error) {
        console.error('Erro no registro:', error);
        throw error;
    }
}

/**
 * Realiza o logout do usuário
 */
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/pages/login/login.html';
}

/**
 * Verifica se o usuário está autenticado
 * @returns {boolean} true se o usuário está autenticado
 */
function isAuthenticated() {
    return localStorage.getItem('token') !== null;
}

/**
 * Retorna os dados do usuário logado
 * @returns {object|null} Dados do usuário ou null se não estiver logado
 */
function getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
}

/**
 * Retorna o ID do usuário logado
 * @returns {string|null} ID do usuário ou null se não estiver logado
 */
function getCurrentUserId() {
    const user = getCurrentUser();
    return user ? user.id : null;
}

/**
 * Atualiza os dados do usuário no localStorage
 * @param {object} userData - Novos dados do usuário
 */
function updateCurrentUser(userData) {
    const currentUser = getCurrentUser();
    if (currentUser) {
        localStorage.setItem('user', JSON.stringify({
            ...currentUser,
            ...userData
        }));
    }
}

// Exporta as funções do serviço
export const authService = {
    login,
    register,
    logout,
    isAuthenticated,
    getCurrentUser,
    getCurrentUserId,
    updateCurrentUser
};
