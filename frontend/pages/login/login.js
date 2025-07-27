        // Toggle password visibility
        const togglePassword = document.getElementById('togglePassword');
        const passwordField = document.getElementById('password');
        
        togglePassword.addEventListener('click', function() {
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

        // Importar o serviço de autenticação
        import { authService } from '../../services/authService.js';
        
        // Form submission handler
        const loginForm = document.getElementById('loginForm');
        
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            // Simple validation
            if (!email || !password) {
                alert('Por favor, preencha todos os campos.');
                return;
            }
            
            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('Por favor, insira um email válido.');
                return;
            }
            
            try {
                // Login usando o serviço de autenticação
                await authService.login(email, password);
                // Redireciona para a página inicial após login bem-sucedido
                window.location.href = '../inicio/inicio.html';
            } catch (error) {
                console.error('Erro:', error);
                alert(error.message || 'Erro ao fazer login');
            }
        });

        // Input focus effects
        const inputs = document.querySelectorAll('input');
        
        inputs.forEach(input => {
            input.addEventListener('focus', function() {
                this.parentElement.style.transform = 'scale(1.02)';
                this.parentElement.style.transition = 'transform 0.2s ease';
            });
            
            input.addEventListener('blur', function() {
                this.parentElement.style.transform = 'scale(1)';
            });
        });

        // Link click handlers
        document.querySelector('.forgot-password').addEventListener('click', function(e) {
            e.preventDefault();
            alert('Funcionalidade "Esqueceu a senha?" ainda não implementada.');
        });

        document.querySelector('.signup-link').addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = '../cadastro/cadastro.html';
        });