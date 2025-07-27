// Importar o serviço de autenticação
import { authService } from '../../services/authService.js';

// Toggle password visibility
const togglePassword = document.getElementById('togglePassword');
const passwordField = document.getElementById('senha');

togglePassword.addEventListener('click', function () {
    const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordField.setAttribute('type', type);

    // Change icon based on password visibility
    if (type === 'text') {
        this.classList.remove('fa-eye');
        this.classList.add('fa-eye-slash');
    } else {
        this.classList.remove('fa-eye-slash');
        this.classList.add('fa-eye');
    }
});

// Form submission handler
const cadastroForm = document.getElementById('cadastroForm');

cadastroForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    // Simple validation
    if (!nome || !email || !senha) {
        alert('Por favor, preencha todos os campos.');
        return;
    }

    // Name validation (at least 2 parts)
    const nameParts = nome.trim().split(' ');
    if (nameParts.length < 2) {
        alert('Por favor, insira nome e sobrenome.');
        return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Por favor, insira um email válido.');
        return;
    }

    // Password validation (minimum 6 characters)
    if (senha.length < 6) {
        alert('A senha deve ter pelo menos 6 caracteres.');
        return;
    }

    // Register process using authService
    authService.register(nome, email, senha)
        .then(data => {
            if (data.message && data.message.includes('sucesso')) {
                alert('Cadastro realizado com sucesso! Faça login para continuar.');
                window.location.href = '../login/login.html';
            } else if (data.token) {
                // Salva o token e dados do usuário
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                // Redireciona para a página inicial ou login
                alert('Cadastro realizado com sucesso!');
                window.location.href = '../login/login.html';
            } else {
                alert(data.message || 'Erro ao fazer cadastro');
            }
        })
        .catch(error => {
            console.error('Erro:', error);
            alert('Erro ao conectar com o servidor');
        });
});

// Input focus effects
const inputs = document.querySelectorAll('input');

inputs.forEach(input => {
    input.addEventListener('focus', function () {
        this.parentElement.style.transform = 'scale(1.02)';
        this.parentElement.style.transition = 'transform 0.2s ease';
    });

    input.addEventListener('blur', function () {
        this.parentElement.style.transform = 'scale(1)';
    });
});

// Link click handlers
document.querySelector('.forgot-password').addEventListener('click', function (e) {
    e.preventDefault();
    alert('Funcionalidade "Esqueceu a senha?" ainda não implementada.');
});

document.querySelector('.login-link').addEventListener('click', function (e) {
    e.preventDefault();
    window.location.href = '../login/login.html';
});