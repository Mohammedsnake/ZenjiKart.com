// DOM Elements
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const togglePassword = document.getElementById('toggle-password');
const toggleRegisterPassword = document.getElementById('toggle-register-password');
const registerPassword = document.getElementById('register-password');
const passwordStrength = document.querySelector('.password-strength');

// Toggle password visibility
if (togglePassword) {
    togglePassword.addEventListener('click', () => {
        const passwordInput = document.getElementById('login-password');
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        togglePassword.classList.toggle('fa-eye-slash');
    });
}

if (toggleRegisterPassword) {
    toggleRegisterPassword.addEventListener('click', () => {
        const type = registerPassword.getAttribute('type') === 'password' ? 'text' : 'password';
        registerPassword.setAttribute('type', type);
        toggleRegisterPassword.classList.toggle('fa-eye-slash');
    });
}

// Password strength indicator
if (registerPassword) {
    registerPassword.addEventListener('input', () => {
        const password = registerPassword.value;
        const strengthBars = document.querySelectorAll('.strength-bar');
        const strengthText = document.querySelector('.strength-text');
        
        // Reset
        strengthBars.forEach(bar => {
            bar.style.width = '0';
            bar.style.backgroundColor = '#eee';
        });
        strengthText.textContent = 'Password Strength: ';
        
        if (password.length === 0) return;
        
        // Calculate strength
        let strength = 0;
        
        // Length
        if (password.length >= 8) strength += 1;
        if (password.length >= 12) strength += 1;
        
        // Contains numbers
        if (/\d/.test(password)) strength += 1;
        
        // Contains special characters
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 1;
        
        // Contains uppercase and lowercase
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 1;
        
        // Update UI
        let strengthLevel = '';
        let color = '';
        
        if (strength <= 2) {
            strengthLevel = 'Weak';
            color = '#ff6161';
            strengthBars[0].style.width = '33%';
            strengthBars[0].style.backgroundColor = color;
        } else if (strength <= 4) {
            strengthLevel = 'Medium';
            color = '#ff9f00';
            strengthBars[0].style.width = '66%';
            strengthBars[1].style.width = '66%';
            strengthBars[0].style.backgroundColor = color;
            strengthBars[1].style.backgroundColor = color;
        } else {
            strengthLevel = 'Strong';
            color = '#388e3c';
            strengthBars.forEach(bar => {
                bar.style.width = '100%';
                bar.style.backgroundColor = color;
            });
        }
        
        strengthText.textContent += strengthLevel;
        strengthText.style.color = color;
    });
}

// Form validation and submission
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        const rememberMe = document.getElementById('remember-me').checked;
        
        // Simple validation
        if (!email || !password) {
            showNotification('Please fill in all fields');
            return;
        }
        
        // Simulate login (in a real app, you would make an API call here)
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => (u.email === email || u.phone === email) && u.password === password);
        
        if (user) {
            // Store user session
            localStorage.setItem('currentUser', JSON.stringify(user));
            
            if (rememberMe) {
                localStorage.setItem('rememberedEmail', email);
            } else {
                localStorage.removeItem('rememberedEmail');
            }
            
            showNotification('Login successful! Redirecting...');
            
            // Redirect to home page after a delay
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } else {
            showNotification('Invalid email/phone or password');
        }
    });
}

if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('register-name').value.trim();
        const email = document.getElementById('register-email').value.trim();
        const phone = document.getElementById('register-phone').value.trim();
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;
        const acceptTerms = document.getElementById('accept-terms').checked;
        
        // Validation
        if (!name || !email || !phone || !password || !confirmPassword) {
            showNotification('Please fill in all fields');
            return;
        }
        
        if (!/^\S+@\S+\.\S+$/.test(email)) {
            showNotification('Please enter a valid email address');
            return;
        }
        
        if (!/^[0-9]{10,15}$/.test(phone)) {
            showNotification('Please enter a valid phone number');
            return;
        }
        
        if (password.length < 8) {
            showNotification('Password must be at least 8 characters');
            return;
        }
        
        if (password !== confirmPassword) {
            showNotification('Passwords do not match');
            return;
        }
        
        if (!acceptTerms) {
            showNotification('Please accept the terms and conditions');
            return;
        }
        
        // Check if user already exists
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const userExists = users.some(u => u.email === email || u.phone === phone);
        
        if (userExists) {
            showNotification('User with this email or phone already exists');
            return;
        }
        
        // Create new user
        const newUser = {
            id: Date.now(),
            name,
            email,
            phone,
            password, // In a real app, you would hash the password
            createdAt: new Date().toISOString()
        };
        
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        // Automatically log in the new user
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        
        showNotification('Registration successful! Welcome to ZenjiKart.');
        
        // Redirect to home page after a delay
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    });
}

// Check for remembered email
document.addEventListener('DOMContentLoaded', () => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail && document.getElementById('login-email')) {
        document.getElementById('login-email').value = rememberedEmail;
        document.getElementById('remember-me').checked = true;
    }
});

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}
