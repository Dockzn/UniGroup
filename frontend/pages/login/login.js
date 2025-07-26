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

        // Form submission handler
        const loginForm = document.getElementById('loginForm');
        
        loginForm.addEventListener('submit', function(e) {
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
            
            // Login process
            fetch('https://unigroup.onrender.com/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            })
            .then(response => response.json())
            .then(data => {
                if (data.token) {
                    // Salva o token e dados do usuário
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    // Redireciona para a página inicial
                    window.location.href = '../inicio/inicio.html';
                } else {
                    alert(data.message || 'Erro ao fazer login');
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