document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('resendVerificationForm');
    const messageDiv = document.getElementById('message');

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const submitButton = form.querySelector('button[type="submit"]');
        
        try {
            submitButton.disabled = true;
            submitButton.textContent = 'Sending...';
            
            const response = await fetch('http://localhost:8000/auth/resend-verification/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: email })
            });

            const data = await response.json();

            if (response.ok) {
                messageDiv.className = 'message success';
                messageDiv.textContent = data.message;
                form.reset();
            } else {
                messageDiv.className = 'message error';
                messageDiv.textContent = data.error || 'An error occurred. Please try again.';
            }
        } catch (error) {
            messageDiv.className = 'message error';
            messageDiv.textContent = 'Network error. Please check your connection and try again.';
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Resend Verification Email';
        }
    });
});
