// Para alternar entre ambiente local e remoto, mude  IS_LOCAL
const IS_LOCAL = false; // Definido como true para usar o servidor local
const API_URL = IS_LOCAL ? 'http://localhost:3000' : 'https://unigroup.onrender.com';

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

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/pages/login/login.html';
}


function isAuthenticated() {
    return localStorage.getItem('token') !== null;
}

function getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
}

function getCurrentUserId() {
    const user = getCurrentUser();
    return user ? user.id : null;
}

function updateCurrentUser(userData) {
    const currentUser = getCurrentUser();
    if (currentUser) {
        localStorage.setItem('user', JSON.stringify({
            ...currentUser,
            ...userData
        }));
    }
}

export const authService = {
    login,
    register,
    logout,
    isAuthenticated,
    getCurrentUser,
    getCurrentUserId,
    updateCurrentUser
};
