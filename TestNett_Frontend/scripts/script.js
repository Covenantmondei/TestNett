document.addEventListener('DOMContentLoaded', function() {
  // ============== DOM Elements ==============
  const formSteps = document.querySelectorAll('.form-step');
  const nextBtns = document.querySelectorAll('.next-btn');
  const backBtns = document.querySelectorAll('.back-btn');
  const progressSteps = document.querySelectorAll('.progress-step');
  const progressLine = document.getElementById('progress-line');
  const emailInput = document.getElementById('email');
  const emailError = document.getElementById('email-error');
  const passwordInput = document.getElementById('password');
  const confirmPasswordInput = document.getElementById('confirm-password');
  const passwordError = document.getElementById('password-error');
  const strengthBar = document.querySelector('.strength-bar');
  const strengthText = document.querySelector('.strength-text');
  const togglePasswordIcons = document.querySelectorAll('.toggle-password');
  const submitBtn = document.getElementById('submit-btn');
  const btnText = document.querySelector('.btn-text');
  const spinner = document.querySelector('.spinner');
  const emailBtn = document.querySelector('.email-btn');
  const step0 = document.getElementById('step-0');
  const step1 = document.getElementById('step-1');
  const termsCheckbox = document.getElementById('terms');

  // ============== State Variables ==============
  let currentStep = 0;

  // ============== Event Listeners ==============
  emailBtn.addEventListener('click', () => switchToEmailSignup());
  
  nextBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (validateCurrentStep()) goToStep(currentStep + 1);
    });
  });

  backBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      goToStep(currentStep - 1);
    });
  });

  emailInput.addEventListener('blur', validateEmail);
  passwordInput.addEventListener('input', updatePasswordStrength);
  passwordInput.addEventListener('blur', () => validatePassword(false));
  confirmPasswordInput.addEventListener('blur', validateConfirmPassword);
  termsCheckbox.addEventListener('change', toggleSubmitButton);

  togglePasswordIcons.forEach(icon => {
    icon.addEventListener('click', togglePasswordVisibility);
  });

  submitBtn.addEventListener('click', submitForm);

  // ============== Core Functions ==============
  function switchToEmailSignup() {
    step0.classList.remove('active');
    step1.classList.add('active');
    currentStep = 1;
    updateProgressBar();
  }

  function goToStep(step) {
    formSteps[currentStep].classList.remove('active');
    formSteps[step].classList.add('active');
    currentStep = step;
    updateProgressBar();
  }

  function updateProgressBar() {
    const progressPercent = (currentStep - 1) / (progressSteps.length - 1) * 100;
    progressLine.style.width = `${progressPercent}%`;

    progressSteps.forEach((step, index) => {
      if (index < currentStep - 1) {
        step.classList.add('completed');
        step.classList.remove('active');
      } else if (index === currentStep - 1) {
        step.classList.add('active');
        step.classList.remove('completed');
      } else {
        step.classList.remove('active', 'completed');
      }
    });
  }

  function validateCurrentStep() {
    switch (currentStep) {
      case 1: // Name step
        const firstName = document.getElementById('first-name').value.trim();
        const lastName = document.getElementById('last-name').value.trim();
        if (!firstName || !lastName) {
          alert('Please enter your full name');
          return false;
        }
        return true;

      case 2: // Email/Username step
        const username = document.getElementById('username').value.trim();
        if (!username) {
          alert('Please choose a username');
          return false;
        }
        return validateEmail();

      default:
        return true;
    }
  }

  function validateEmail() {
    const email = emailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      showError(emailInput, emailError, 'Please enter a valid email address');
      return false;
    }
    hideError(emailInput, emailError);
    return true;
  }

  function validatePassword(showError = true) {
    const password = passwordInput.value;
    if (password.length < 8) {
      if (showError) {
        showError(passwordInput, passwordError, 'Password must be at least 8 characters');
      }
      return false;
    }
    hideError(passwordInput, passwordError);
    return true;
  }

  function validateConfirmPassword() {
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (password !== confirmPassword) {
      showError(confirmPasswordInput, passwordError, 'Passwords do not match');
      return false;
    }
    return true;
  }

  function updatePasswordStrength() {
    const password = passwordInput.value;
    let strength = 0;

    if (password.length >= 8) strength += 1;
    if (/\d/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;

    const strengthLevels = [
      { width: '20%', color: '#e74c3c', text: 'Weak' },
      { width: '40%', color: '#e67e22', text: 'Fair' },
      { width: '65%', color: '#f1c40f', text: 'Good' },
      { width: '85%', color: '#2ecc71', text: 'Strong' },
      { width: '100%', color: '#27ae60', text: 'Excellent' }
    ];

    const { width, color, text } = strengthLevels[strength];
    strengthBar.style.width = width;
    strengthBar.style.backgroundColor = color;
    strengthText.textContent = text;
    strengthText.style.color = color;
  }

  function togglePasswordVisibility(e) {
    const input = e.target.closest('.toggle-password').previousElementSibling;
    const type = input.type === 'password' ? 'text' : 'password';
    input.type = type;
    e.target.classList.toggle('fa-eye-slash');
  }

  function toggleSubmitButton() {
    submitBtn.disabled = !termsCheckbox.checked;
  }
  async function submitForm(e) {
    e.preventDefault();

    // Final validation
    if (!validateEmail()) return;
    if (!validatePassword() || !validateConfirmPassword()) return;
    if (!termsCheckbox.checked) {
      alert('Please agree to the Terms of Service');
      return;
    }

    // Prepare form data
    const formData = {
      first_name: document.getElementById('first-name').value.trim(),
      last_name: document.getElementById('last-name').value.trim(),
      username: document.getElementById('username').value.trim(),
      email: emailInput.value.trim(),
      password: passwordInput.value,
      confirm_password: confirmPasswordInput.value
    };

    // Show loading state
    btnText.textContent = 'Signing Up...';
    spinner.classList.remove('hidden');
    submitBtn.disabled = true;

    try {
      const response = await fetch('http://localhost:8000/testnett/signup/', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (!response.ok) {
        // Handle different types of errors from your API
        if (data.error) {
          throw new Error(data.error);
        } else {
          throw new Error('Signup failed. Please try again.');
        }
      }      // Redirect to signup success page
      window.location.href = '../html/signup-success.html';
    } catch (error) {
      // Display specific error messages based on the API response
      if (error.message.includes('email')) {
        showError(emailInput, emailError, error.message);
      } else if (error.message.includes('username')) {
        showError(document.getElementById('username'), 
                 document.getElementById('email-error'), 
                 error.message);
      } else if (error.message.includes('password')) {
        showError(passwordInput, passwordError, error.message);
      } else {
        alert(error.message);
      }
    } finally {
      btnText.textContent = 'Sign Up';
      spinner.classList.add('hidden');
      submitBtn.disabled = false;
    }
  }

  // ============== Helper Functions ==============
  function showError(input, errorElement, message) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    errorElement.style.color = '#e74c3c';
    input.classList.add('error');
  }

  function hideError(input, errorElement) {
    errorElement.style.display = 'none';
    input.classList.remove('error');
  }

  // Initialize
  toggleSubmitButton();
});