from flask import Blueprint, request, jsonify
from werkzeug.security import check_password_hash, generate_password_hash
import psycopg2
import os

test_bp = Blueprint('test', __name__)

def get_db_connection():
    conn = psycopg2.connect(
        host="localhost",
        database="cinemate",
        user="postgres",
        password="root"
    )
    return conn

@test_bp.route('/', methods=['GET'])
def home():
    return "Welcome to the Movie API!"

@test_bp.route('/api', methods=['GET'])
def test():
    return "Test successful."

@test_bp.route('/api/fetchTest', methods=['GET'])
def fetchTest():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('SELECT * FROM testTable;')
    testResult = cur.fetchall()

    if testResult:
        cur.close()
        conn.close()
        return jsonify({'success': True, 'message': testResult})
    else:
        return jsonify({'success': False}), 401