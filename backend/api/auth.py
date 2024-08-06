from flask import Blueprint, request, jsonify
from werkzeug.security import check_password_hash, generate_password_hash
from werkzeug.utils import secure_filename
import psycopg2
import os
import time

auth_bp = Blueprint('auth', __name__)

UPLOAD_FOLDER = os.path.join(os.getcwd(), 'uploads', 'profile_images')
# UPLOAD_FOLDER = os.path.abspath(os.path.join(os.getcwd(), '..', 'uploads'))

def get_db_connection():
    conn = psycopg2.connect(
        host="localhost",
        database="cinemate",
        user="postgres",
        password="root"
    )
    return conn

# Allowed file extensions for uploads
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@auth_bp.route('/signin', methods=['POST'])
def signin():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('SELECT id, password, salt FROM users WHERE email = %s', (email,))
    user = cur.fetchone()
    cur.close()
    conn.close()

    if user:
        hashed_password = user[1]
        salt = user[2]
        salted_password = password + salt
        if check_password_hash(hashed_password, salted_password):
            return jsonify({'success': True, "userId": user[0]})
    
    return jsonify({'success': False}), 401

@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'success': False, 'message': 'Email and password are required'}), 400

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('SELECT * FROM users WHERE email = %s', (email,))
    user = cur.fetchone()

    if user:
        cur.close()
        conn.close()
        return jsonify({'success': False, 'message': 'User already exists'}), 409

    salt = os.urandom(16).hex()
    salted_password = password + salt
    hashed_password = generate_password_hash(salted_password)

    cur.execute('INSERT INTO users (email, password, salt) VALUES (%s, %s, %s)', (email, hashed_password, salt))
    conn.commit()
    cur.close()
    conn.close()

    return jsonify({'success': True})

@auth_bp.route('/getUserInfo', methods=['POST'])
def getUserInfo():
    print("User info endpoint hit")
    data = request.get_json()
    userId = data.get('userId')

    if not userId:
        return jsonify({'success': False, 'message': 'userId is required'}), 400
    
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('SELECT id, username, email, gender, birthday, language, description, profileimguri FROM users WHERE id = %s', (userId,))
    user = cur.fetchone()
    cur.close()
    conn.close()

    if user:
        user_info = {
            'userId': user[0],
            'username': user[1],
            'email': user[2],
            'gender': user[3],
            'birthday': user[4],
            'language': user[5],
            'description': user[6],
            'profileimguri': user[7]
        }
        print("User info:")
        print(user_info)
        return jsonify({'success': True, 'message': user_info}), 200

    return jsonify({'success': False, 'message': 'User not found.'}), 401

@auth_bp.route('/updateUserInfo', methods=['POST'])
def updateUserInfo():
    print("Update user info endpoint hit")
    data = request.get_json()
    userId = data.get('userId')
    username = data.get('username')
    email = data.get('email')
    gender = data.get('gender')
    birthday = data.get('birthday')
    language = data.get('language')
    description = data.get('description')
    profileimguri = data.get('profileimguri')
    print("User data: ", data)

    if not userId:
        return jsonify({'success': False, 'message': 'userId is required'}), 400

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('''
        UPDATE users 
        SET username = %s, email = %s, gender = %s, birthday = %s, language = %s, description = %s, profileimguri = %s 
        WHERE id = %s
    ''', (username, email, gender, birthday, language, description, profileimguri, userId))
    conn.commit()
    cur.close()
    conn.close()

    return jsonify({'success': True, 'message': 'User information updated successfully'}), 200

@auth_bp.route('/uploadProfileImage', methods=['POST'])
def upload_profile_image():
    if 'profileImage' not in request.files:
        print("No file part")
        return jsonify({'success': False, 'message': 'No file part'}), 400

    file = request.files['profileImage']

    if file.filename == '':
        print("No selected file")
        return jsonify({'success': False, 'message': 'No selected file'}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        userId = request.form.get('userId')
        if not userId:
            print("User ID is required")
            return jsonify({'success': False, 'message': 'User ID is required'}), 400

        # Make filename unique by appending user ID and timestamp
        unique_filename = f"{userId}_{int(time.time())}_{filename}"
        file_path = os.path.join(UPLOAD_FOLDER, unique_filename)
        file.save(file_path)

        # Update the database with the new profile image filename
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('''
            UPDATE users 
            SET profileimguri = %s 
            WHERE id = %s
        ''', (unique_filename, userId))
        conn.commit()
        cur.close()
        conn.close()

        print("image url: ", unique_filename)
        return jsonify({'success': True, 'imageUrl': unique_filename}), 200

    print("File type not allowed")
    return jsonify({'success': False, 'message': 'File type not allowed'}), 400
