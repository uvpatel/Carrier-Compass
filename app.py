from flask import Flask, render_template, request, jsonify, session, redirect, url_for
import joblib
import pandas as pd
import bcrypt
from dotenv import load_dotenv
import os

app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY', 'your-secret-key')

# Load model and encoder
model = joblib.load('models/career_model.pkl')
le = joblib.load('models/label_encoder.pkl')

# Simulated user database (replace with SQLite in production)
users = {}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        data = request.form
        full_name = data.get('fullName')
        email = data.get('email')
        password = data.get('password')
        confirm_password = data.get('confirmPassword')
        terms = data.get('terms') == 'on'

        errors = {}
        if not full_name:
            errors['fullName'] = 'Full Name is required.'
        if not email or not '@' in email:
            errors['email'] = 'Valid email is required.'
        if not password or len(password) < 6:
            errors['password'] = 'Password must be at least 6 characters.'
        if password != confirm_password:
            errors['confirmPassword'] = 'Passwords do not match.'
        if not terms:
            errors['terms'] = 'You must agree to the Terms of Service.'

        if errors:
            return jsonify({'success': False, 'errors': errors}), 400

        if email in users:
            return jsonify({'success': False, 'errors': {'email': 'Email already exists.'}}), 400

        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        users[email] = {'full_name': full_name, 'password': hashed_password}
        session['user'] = email
        return jsonify({'success': True, 'redirect': url_for('index')})

    return render_template('signup.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        data = request.form
        email = data.get('email')
        password = data.get('password')

        errors = {}
        if not email:
            errors['email'] = 'Email is required.'
        if not password:
            errors['password'] = 'Password is required.'

        if errors:
            return jsonify({'success': False, 'errors': errors}), 400

        user = users.get(email)
        if user and bcrypt.checkpw(password.encode('utf-8'), user['password']):
            session['user'] = email
            return jsonify({'success': True, 'redirect': url_for('index')})
        else:
            return jsonify({'success': False, 'errors': {'email': 'Invalid email or password.'}}), 400

    return render_template('login.html')

@app.route('/logout')
def logout():
    session.pop('user', None)
    return redirect(url_for('index'))

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    message = data.get('message')
    skills = data.get('skills')

    if skills:
        # Process skills for career recommendation
        technical_score = sum(skills.get(skill, 0) for skill in ['programming', 'data-analysis', 'web-development', 'security', 'cloud']) / 5
        soft_score = sum(skills.get(skill, 0) for skill in ['communication', 'leadership', 'problem-solving', 'teamwork', 'adaptability']) / 5
        industry = max([(skills.get(ind, 0), ind) for ind in ['healthcare', 'finance', 'technology', 'marketing', 'education']], default=(0, 'technology'))[1]

        # Prepare input for model
        input_data = pd.DataFrame({
            'technical_score': [technical_score],
            'soft_score': [soft_score],
            'industry_preference': [le.transform([industry])[0]]
        })

        # Predict career
        career = model.predict(input_data)[0]
        response = {
            'type': 'recommendation',
            'message': f"Based on your skills, I recommend: {career}. Would you like more details or resume tips for this role?"
        }
    else:
        # Simple rule-based responses for text queries
        responses = {
            'resume': 'Focus on quantifiable achievements, use action verbs, and tailor your resume to the job description.',
            'interview': 'Research the company, practice the STAR method, and prepare questions to ask the interviewer.',
            'networking': 'Attend industry events, join LinkedIn groups, and follow up with contacts regularly.',
            'skill': 'Take online courses on platforms like Coursera or edX to develop in-demand skills.'
        }
        response = {
            'type': 'text',
            'message': next((r for k, r in responses.items() if k in message.lower()), 'Ask about resume tips, interviews, or skills!')
        }

    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=True)