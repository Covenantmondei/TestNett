// Configuration variables
const config = {
    googleClientId: '944658252910-08frdqcj44g9olvldgvd6po0584vh3ub.apps.googleusercontent.com',  // Default value from env
    apiBaseUrl: 'http://localhost:8000'
};

// Initialize Google Sign-In
function initializeGoogleSignIn() {
    const gsiScript = document.createElement('script');
    gsiScript.src = 'https://accounts.google.com/gsi/client';
    gsiScript.async = true;
    gsiScript.defer = true;
    gsiScript.onload = () => {
        console.log('Google Sign-In script loaded');
    };
    document.head.appendChild(gsiScript);
}

window.addEventListener('load', () => {
    // Initialize Google Sign-In configuration
    const gButtons = document.querySelectorAll('#g_id_onload');
    gButtons.forEach(button => {
        button.setAttribute('data-client_id', config.googleClientId);
    });
    
    // Load Google Sign-In script
    initializeGoogleSignIn();
});
