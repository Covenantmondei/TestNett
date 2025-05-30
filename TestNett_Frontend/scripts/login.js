document.addEventListener('DOMContentLoaded', function() {
    // Password toggle functionality
    const togglePassword = document.querySelector('.toggle-password');
    const passwordInput = document.getElementById('login-password');
    
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.classList.toggle('fa-eye-slash');
        });
    }

    // Form submission handling
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const loginBtn = document.getElementById('login-btn');
            const spinner = loginBtn.querySelector('.spinner');
            const btnText = loginBtn.querySelector('.btn-text');
            const username = document.getElementById('login-username').value.trim();
            const password = document.getElementById('login-password').value.trim();
            const rememberMe = document.getElementById('remember-me').checked;

            // Validate inputs
            if (!username || !password) {
                showError('Please fill in all fields');
                return;
            }

            // Show loading state
            btnText.textContent = 'Logging in...';
            spinner.classList.remove('hidden');
            loginBtn.disabled = true;

            try {
                // Prepare form data
                const formData = {
                    username,
                    password,
                    remember_me: rememberMe
                };

                // Get CSRF token from meta tag
                const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

                // Send login request
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrfToken
                    },
                    body: JSON.stringify(formData)
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Login failed');
                }

                // Login successful - redirect or handle response
                if (data.redirect) {
                    window.location.href = data.redirect;
                } else {
                    window.location.href = '/dashboard'; // Default redirect
                }

            } catch (error) {
                // Hide loading state
                btnText.textContent = 'Log In';
                spinner.classList.add('hidden');
                loginBtn.disabled = false;
                
                // Show error message
                showError(error.message || 'An error occurred during login');
            }
        });
    }

    // Error display function
    function showError(message) {
        // You can implement a more sophisticated error display
        // This is a simple version that matches your signup page style
        alert(message); // Replace with your preferred error display method
    }

    // Google Auth handling (shared with signup)
    window.handleCredentialResponse = async function(response) {
        console.log('Google auth response', response);
        
        const loginBtn = document.getElementById('login-btn');
        const spinner = loginBtn.querySelector('.spinner');
        const btnText = loginBtn.querySelector('.btn-text');
        
        // Show loading state
        btnText.textContent = 'Authenticating...';
        spinner.classList.remove('hidden');
        loginBtn.disabled = true;

        try {
            // Get CSRF token from meta tag
            const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

            // Send Google credential to your backend
            const authResponse = await fetch('/api/google-auth', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken
                },
                body: JSON.stringify({ credential: response.credential })
            });

            const data = await authResponse.json();

            if (!authResponse.ok) {
                throw new Error(data.message || 'Google authentication failed');
            }

            // Authentication successful - redirect
            if (data.redirect) {
                window.location.href = data.redirect;
            } else {
                window.location.href = '/dashboard'; // Default redirect
            }

        } catch (error) {
            // Hide loading state
            btnText.textContent = 'Log In';
            spinner.classList.add('hidden');
            loginBtn.disabled = false;
            
            // Show error message
            showError(error.message || 'Google authentication failed');
        }
    };
});