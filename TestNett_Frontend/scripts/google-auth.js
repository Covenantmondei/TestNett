// Function to get CSRF token from cookie
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function handleCredentialResponse(response) {
    console.log('Google Sign In response received:', response);
    
    // Get the ID token from the response
    const idToken = response.credential;

    // Get CSRF token
    const csrftoken = getCookie('csrftoken');

    // Send the token to your backend
    fetch('http://localhost:8000/testnett/google/login/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken,
            'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
            id_token: idToken,
            access_token: idToken // Keeping for backward compatibility
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })    .then(data => {
        console.log('Server response:', data);
        if (data.access) {
            // Store tokens
            localStorage.setItem('access_token', data.access);
            if (data.refresh) {
                localStorage.setItem('refresh_token', data.refresh);
            }
            
            // Store user info if available
            if (data.user) {
                localStorage.setItem('user', JSON.stringify(data.user));
            }
            
            // Redirect to success page
            window.location.href = '../html/success.html';
        } else {
            console.error('Authentication failed:', data);
            alert('Authentication failed. Please try again.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred during authentication. Please try again.');
    });
}

// Function to sign out
function signOut() {
    google.accounts.id.disableAutoSelect();
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/TestNett_Frontend/html/index.html';
}