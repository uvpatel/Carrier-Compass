// script.js - Career Compass Frontend JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Mobile Menu Toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
        });
    }

    // Signup Form Validation
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const fullName = document.getElementById('fullName').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();
            const confirmPassword = document.getElementById('confirmPassword').value.trim();
            const terms = document.getElementById('terms').checked;
            let valid = true;
            const errors = {};

            if (!fullName) {
                errors.fullName = 'Full Name is required.';
                valid = false;
            }
            if (!email) {
                errors.email = 'Email is required.';
                valid = false;
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                errors.email = 'Please enter a valid email.';
                valid = false;
            }
            if (!password) {
                errors.password = 'Password is required.';
                valid = false;
            } else if (password.length < 6) {
                errors.password = 'Password must be at least 6 characters.';
                valid = false;
            }
            if (password !== confirmPassword) {
                errors.confirmPassword = 'Passwords do not match.';
                valid = false;
            }
            if (!terms) {
                errors.terms = 'You must agree to the Terms of Service.';
                valid = false;
            }

            // Clear previous errors
            document.querySelectorAll('.error-message').forEach(el => el.remove());

            // Display new errors
            for (const [field, message] of Object.entries(errors)) {
                const input = document.getElementById(field);
                const errorDiv = document.createElement('div');
                errorDiv.className = 'error-message';
                errorDiv.textContent = message;
                input.parentElement.appendChild(errorDiv);
            }

            if (valid) {
                console.log('Signup Data:', { fullName, email, password, terms });
                alert('Signup successful! Redirecting to login...');
                window.location.href = 'login.html';
            }
        });
    }

    // Login Form Validation
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();
            let valid = true;
            const errors = {};

            if (!email) {
                errors.email = 'Email is required.';
                valid = false;
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                errors.email = 'Please enter a valid email.';
                valid = false;
            }
            if (!password) {
                errors.password = 'Password is required.';
                valid = false;
            }

            // Clear previous errors
            document.querySelectorAll('.error-message').forEach(el => el.remove());

            // Display new errors
            for (const [field, message] of Object.entries(errors)) {
                const input = document.getElementById(field);
                const errorDiv = document.createElement('div');
                errorDiv.className = 'error-message';
                errorDiv.textContent = message;
                input.parentElement.appendChild(errorDiv);
            }

            if (valid) {
                console.log('Login Data:', { email, password });
                localStorage.setItem('isLoggedIn', 'true');
                alert('Login successful! Redirecting to home...');
                window.location.href = 'index.html';
            }
        });
    }

    // Navigation Auth State
    const authLink = document.getElementById('authLink');
    if (authLink) {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        if (isLoggedIn) {
            authLink.textContent = 'Logout';
            authLink.href = '#';
            authLink.addEventListener('click', () => {
                localStorage.removeItem('isLoggedIn');
                window.location.href = 'index.html';
            });
        } else {
            authLink.textContent = 'Sign Up';
            authLink.href = 'signup.html';
        }
    }

    // Skills Assessment Category Switching
    const categories = document.querySelectorAll('.category');
    categories.forEach(category => {
        category.addEventListener('click', function() {
            categories.forEach(cat => cat.classList.remove('active'));
            this.classList.add('active');
            document.querySelectorAll('.skills-group').forEach(group => group.classList.remove('active'));
            const categoryId = this.getAttribute('data-category');
            document.getElementById(`${categoryId}-skills`).classList.add('active');
        });
    });

    // Star Rating System
    const stars = document.querySelectorAll('.star');
    stars.forEach(star => {
        star.addEventListener('click', function() {
            const value = this.getAttribute('data-value');
            const rating = this.parentElement;
            rating.querySelectorAll('.star').forEach(s => s.classList.remove('active'));
            for (let s of rating.querySelectorAll('.star')) {
                if (parseInt(s.getAttribute('data-value')) <= parseInt(value)) {
                    s.classList.add('active');
                }
            }
            rating.setAttribute('data-rating', value);
        });
    });

    // Get Results Button
    const getResultsBtn = document.getElementById('getResults');
    if (getResultsBtn) {
        getResultsBtn.addEventListener('click', function() {
            const skills = {};
            document.querySelectorAll('.rating').forEach(rating => {
                const skill = rating.getAttribute('data-skill');
                const value = rating.getAttribute('data-rating') || '0';
                skills[skill] = parseInt(value);
            });
            processSkills(skills);
            showChatbot();
        });
    }

    // Process skills and generate career recommendations
    function processSkills(skills) {
        const categories = {
            technical: ['programming', 'data-analysis', 'web-development', 'security', 'cloud'],
            soft: ['communication', 'leadership', 'problem-solving', 'teamwork', 'adaptability'],
            industry: ['healthcare', 'finance', 'technology', 'marketing', 'education']
        };
        const technicalScore = calculateCategoryScore(skills, categories.technical);
        const softScore = calculateCategoryScore(skills, categories.soft);
        const topIndustry = getTopIndustry(skills, categories.industry);
        const recommendations = generateRecommendations(technicalScore, softScore, topIndustry);
        displayRecommendations(recommendations);
    }

    // Get the top industry preference
    function getTopIndustry(skills, industrySkills) {
        return industrySkills.reduce((top, skill) => {
            return (skills[skill] > skills[top] || !top) ? skill : top;
        }, '');
    }

    // Calculate average score for a category of skills
    function calculateCategoryScore(skills, category) {
        const total = category.reduce((acc, skill) => acc + (skills[skill] || 0), 0);
        return category.length > 0 ? total / category.length : 0;
    }

    // Generate career recommendations based on skills
    function generateRecommendations(technicalScore, softScore, topIndustry) {
        const recommendations = [];
        if (technicalScore >= 4) {
            recommendations.push(...getTechnicalRecommendations(topIndustry, true));
        } else if (technicalScore >= 3) {
            recommendations.push(...getTechnicalRecommendations(topIndustry, false));
        }
        if (softScore >= 4) {
            recommendations.push(...getSoftRecommendations(topIndustry, true));
        } else if (softScore >= 3) {
            recommendations.push(...getSoftRecommendations(topIndustry, false));
        }
        if (recommendations.length === 0) {
            recommendations.push('Career Development Coach', 'Administrative Coordinator', 'Customer Service Representative', 'Operations Assistant');
        }
        return recommendations;
    }

    // Get technical recommendations based on industry
    function getTechnicalRecommendations(industry, isHigh) {
        const highRecommendations = {
            healthcare: ['Healthcare IT Specialist', 'Medical Data Analyst'],
            finance: ['Financial Systems Analyst', 'Blockchain Developer'],
            technology: ['Software Engineer', 'DevOps Engineer'],
            marketing: ['Marketing Technology Specialist', 'Digital Marketing Analyst'],
            education: ['Educational Technology Specialist', 'E-Learning Developer']
        };
        const lowRecommendations = {
            healthcare: ['Health Informatics Specialist', 'Medical Technology Coordinator'],
            finance: ['Financial Technology Consultant', 'Data Analyst'],
            technology: ['IT Project Manager', 'QA Specialist'],
            marketing: ['Digital Marketing Manager', 'SEO Specialist'],
            education: ['Instructional Designer', 'Educational Content Developer']
        };
        return isHigh ? highRecommendations[industry] || [] : lowRecommendations[industry] || [];
    }

    // Get soft recommendations based on industry
    function getSoftRecommendations(industry, isHigh) {
        const highRecommendations = {
            healthcare: ['Healthcare Administrator', 'Patient Advocate'],
            finance: ['Financial Advisor', 'Investment Relationship Manager'],
            technology: ['Technology Consultant', 'IT Team Lead'],
            marketing: ['Brand Manager', 'Public Relations Specialist'],
            education: ['Education Administrator', 'Corporate Trainer']
        };
        const lowRecommendations = {
            healthcare: ['Health Services Coordinator', 'Medical Office Manager'],
            finance: ['Account Manager', 'Client Services Representative'],
            technology: ['Technical Product Manager', 'Customer Success Manager'],
            marketing: ['Marketing Coordinator', 'Communications Specialist'],
            education: ['Academic Advisor', 'Program Coordinator']
        };
        return isHigh ? highRecommendations[industry] || [] : lowRecommendations[industry] || [];
    }

    // Display recommendations in chatbot
    function displayRecommendations(recommendations) {
        const chatMessages = document.querySelector('.chat-messages');
        if (chatMessages) {
            const message = document.createElement('div');
            message.className = 'message bot-message';
            const messageContent = `<p>Based on your skills assessment, here are some career paths that might be a good fit for you:</p>
            <ul style="margin-top: 10px; margin-left: 20px;">
                ${recommendations.map(rec => `<li style="margin-bottom: 5px;">${rec}</li>`).join('')}
            </ul>
            <p style="margin-top: 10px;">Would you like more information about any of these careers? Or resume tips for these roles?</p>`;
            message.innerHTML = messageContent;
            chatMessages.appendChild(message);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }

    // Chatbot Toggle
    const chatbot = document.querySelector('.chatbot');
    const chatbotHeader = document.querySelector('.chatbot-header');
    const chatbotToggle = document.querySelector('.chatbot-toggle');

    if (chatbotHeader && chatbot && chatbotToggle) {
        chatbotHeader.addEventListener('click', function() {
            chatbot.classList.toggle('active');
            chatbotToggle.innerHTML = chatbot.classList.contains('active') ? 
                '<i class="fas fa-chevron-down"></i>' : 
                '<i class="fas fa-chevron-up"></i>';
        });
    }

    // Show chatbot function
    function showChatbot() {
        if (chatbot) {
            chatbot.classList.add('active');
            chatbotToggle.innerHTML = '<i class="fas fa-chevron-down"></i>';
        }
    }

    // Send Message in Chatbot
    const sendMessageBtn = document.getElementById('sendMessage');
    const userMessageInput = document.getElementById('userMessage');

    if (sendMessageBtn && userMessageInput) {
        sendMessageBtn.addEventListener('click', sendUserMessage);
        userMessageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendUserMessage();
            }
        });
    }

    // Send user message and get AI response
    function sendUserMessage() {
        const message = userMessageInput.value.trim();
        if (message) {
            addMessageToChat(message, 'user');
            userMessageInput.value = '';
            setTimeout(() => processAIResponse(message), 1000);
        }
    }

    // Add message to chat
    function addMessageToChat(message, sender) {
        const chatMessages = document.querySelector('.chat-messages');
        if (chatMessages) {
            const messageElement = document.createElement('div');
            messageElement.className = `message ${sender}-message`;
            messageElement.textContent = message;
            chatMessages.appendChild(messageElement);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }

    // Process and generate AI response
    function processAIResponse(userMessage) {
        const lowerMessage = userMessage.toLowerCase();
        let response = '';
        const responses = {
            resume: 'To improve your resume, focus on quantifiable achievements rather than just listing job duties. Use action verbs, and tailor your resume for each job application by matching keywords from the job description.',
            interview: 'For interview preparation, research the company thoroughly, prepare stories that demonstrate your skills, and practice the STAR method (Situation, Task, Action, Result) for answering behavioral questions.',
            networking: 'To build your professional network, attend industry events, join relevant LinkedIn groups, and don\'t hesitate to reach out to people for informational interviews. Follow up to maintain relationships.',
            skill: 'To develop in-demand skills, consider online courses from platforms like Coursera, edX, or LinkedIn Learning. Look for skills that frequently appear in job postings for your target role.',
            thank: 'You\'re welcome! I\'m happy to help. Is there anything else you\'d like to know?'
        };
        for (const key in responses) {
            if (lowerMessage.includes(key)) {
                response = responses[key];
                break;
            }
        }
        if (!response) {
            response = 'I\'m here to help with your career questions. Ask me about resume tips, interview preparation, networking strategies, or specific careers you\'re interested in.';
        }
        addMessageToChat(response, 'bot');
    }
});

// Replace the signup, login, and chat-related functions in script.js

// Signup Form Validation
const signupForm = document.getElementById('signupForm');
if (signupForm) {
    signupForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const formData = new FormData(signupForm);

        try {
            const response = await fetch('/signup', {
                method: 'POST',
                body: formData
            });
            const result = await response.json();

            document.querySelectorAll('.error-message').forEach(el => el.remove());
            if (!result.success) {
                for (const [field, message] of Object.entries(result.errors)) {
                    const input = document.getElementById(field);
                    const errorDiv = document.createElement('div');
                    errorDiv.className = 'error-message';
                    errorDiv.textContent = message;
                    input.parentElement.appendChild(errorDiv);
                }
            } else {
                window.location.href = result.redirect;
            }
        } catch (error) {
            console.error('Signup error:', error);
        }
    });
}

// Login Form Validation
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const formData = new FormData(loginForm);

        try {
            const response = await fetch('/login', {
                method: 'POST',
                body: formData
            });
            const result = await response.json();

            document.querySelectorAll('.error-message').forEach(el => el.remove());
            if (!result.success) {
                for (const [field, message] of Object.entries(result.errors)) {
                    const input = document.getElementById(field);
                    const errorDiv = document.createElement('div');
                    errorDiv.className = 'error-message';
                    errorDiv.textContent = message;
                    input.parentElement.appendChild(errorDiv);
                }
            } else {
                window.location.href = result.redirect;
            }
        } catch (error) {
            console.error('Login error:', error);
        }
    });
}

// Navigation Auth State (replace localStorage logic)
const authLink = document.getElementById('authLink');
if (authLink) {
    fetch('/check_session')
        .then(response => response.json())
        .then(data => {
            if (data.isLoggedIn) {
                authLink.textContent = 'Logout';
                authLink.href = '/logout';
            } else {
                authLink.textContent = 'Sign Up';
                authLink.href = '/signup';
            }
        });
}

// Send user message and get AI response
async function sendUserMessage() {
    const message = userMessageInput.value.trim();
    const skills = document.getElementById('getResults') ? collectSkills() : null;

    if (message || skills) {
        if (message) {
            addMessageToChat(message, 'user');
        }
        userMessageInput.value = '';

        try {
            const response = await fetch('/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message, skills })
            });
            const result = await response.json();
            if (result.type === 'recommendation') {
                addRecommendationToChat(result.message);
            } else {
                addMessageToChat(result.message, 'bot');
            }
        } catch (error) {
            console.error('Chat error:', error);
        }
    }
}

function collectSkills() {
    const skills = {};
    document.querySelectorAll('.rating').forEach(rating => {
        const skill = rating.getAttribute('data-skill');
        const value = rating.getAttribute('data-rating') || '0';
        skills[skill] = parseInt(value);
    });
    return skills;
}

function addRecommendationToChat(message) {
    const chatMessages = document.querySelector('.chat-messages');
    if (chatMessages) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message bot-message';
        messageElement.innerHTML = `<p>${message}</p>`;
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

// Rest of the script.js remains unchanged