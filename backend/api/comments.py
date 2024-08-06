from flask import Blueprint, request, jsonify
import psycopg2

comments_bp = Blueprint('comments', __name__)

def get_db_connection():
    conn = psycopg2.connect(
        host="localhost",
        database="cinemate",
        user="postgres",
        password="root"
    )
    return conn

@comments_bp.route('/addComment', methods=['POST'])
def add_comment():
    data = request.get_json()
    user_id = data.get('userId')
    movie_id = data.get('movieId')
    series_id = data.get('seriesId')
    comment = data.get('comment')

    if not user_id or not comment or (not movie_id and not series_id):
        print("userId, comment, and either movieId or seriesId are required")
        return jsonify({'success': False, 'message': 'userId, comment, and either movieId or seriesId are required'}), 400

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('INSERT INTO comments (user_id, movie_id, series_id, comment) VALUES (%s, %s, %s, %s) RETURNING id', (user_id, movie_id, series_id, comment))
    comment_id = cur.fetchone()[0]
    
    cur.execute('SELECT * FROM comments WHERE id = %s', (comment_id,))
    newcomment = cur.fetchone()
    newcomment_data = {
        'id': newcomment[0],
        'user_id': newcomment[1],
        'movie_id': newcomment[2],
        'series_id': newcomment[3],
        'comment': newcomment[4],
        'created_at': newcomment[5]
    }

    conn.commit()
    cur.close()
    conn.close()

    return jsonify({'success': True, 'comment': newcomment_data}), 200

@comments_bp.route('/getComments', methods=['POST'])
def get_comments():
    data = request.get_json()
    movie_id = data.get('movie_id')
    series_id = data.get('series_id')

    if not movie_id and not series_id:
        print("movie_id or series_id is required")
        return jsonify({'success': False, 'message': 'movie_id or series_id is required'}), 400

    conn = get_db_connection()
    cur = conn.cursor()
    if movie_id:
        cur.execute('SELECT * FROM comments WHERE movie_id = %s ORDER BY created_at DESC', (movie_id,))
    else:
        cur.execute('SELECT * FROM comments WHERE series_id = %s ORDER BY created_at DESC', (series_id,))
    comments = cur.fetchall()

    comments_list = []
    for comment in comments:
        user_id = comment[1]
        # Ottieni lo username associato all'utente
        cur.execute('SELECT username FROM users WHERE id = %s', (user_id,))
        username_result = cur.fetchone()
        username = username_result[0] if username_result else user_id

        comments_list.append({
            'id': comment[0],
            'user_id': comment[1],
            'movie_id': comment[2],
            'series_id': comment[3],
            'comment': comment[4],
            'created_at': comment[5],
            'username': username  # Aggiungi lo username al dizionario del commento
        })

    cur.close()
    conn.close()

    return jsonify({'success': True, 'comments_list': comments_list}), 200

@comments_bp.route('/addReply', methods=['POST'])
def add_reply():
    data = request.get_json()
    user_id = data.get('userId')
    comment_id = data.get('commentId')
    reply = data.get('reply')

    if not user_id or not comment_id or not reply:
        print("userId, commentId, and reply are required")
        return jsonify({'success': False, 'message': 'userId, commentId, and reply are required'}), 400

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('INSERT INTO replies (comment_id, user_id, reply) VALUES (%s, %s, %s) RETURNING id', (comment_id, user_id, reply))
    reply_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()

    return jsonify({'success': True, 'replyId': reply_id}), 200

@comments_bp.route('/getReplies', methods=['POST'])
def get_replies():
    data = request.get_json()
    comment_id = data.get('comment_id')

    if not comment_id:
        print("comment_id is required")
        return jsonify({'success': False, 'message': 'comment_id is required'}), 400

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('SELECT * FROM replies WHERE comment_id = %s ORDER BY created_at DESC', (comment_id,))
    replies = cur.fetchall()

    replies_list = []
    for reply in replies:
        user_id = reply[2]
        # Ottieni lo username associato all'utente
        cur.execute('SELECT username FROM users WHERE id = %s', (user_id,))
        username_result = cur.fetchone()
        username = username_result[0] if username_result else user_id

        replies_list.append({
            'id': reply[0],
            'comment_id': reply[1],
            'user_id': reply[2],
            'reply': reply[3],
            'created_at': reply[4],
            'username': username  # Aggiungi lo username al dizionario della risposta
        })

    cur.close()
    conn.close()

    return jsonify({'success': True, 'replies_list': replies_list}), 200

@comments_bp.route('/getUsernameFromId', methods=['POST'])
def getUsernameFromId():
    data = request.get_json()
    user_id = data.get('userId')

    if not user_id:
        print("userId is required")
        return jsonify({'success': False, 'message': 'userId is required'}), 400
    
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('SELECT username FROM users WHERE id = %s', (user_id,))
    username = cur.fetchone()
    cur.close()
    conn.close()

    if username is None:
        return jsonify({'success': True, 'username': user_id}), 200
    else:
        return jsonify({'success': True, 'username': username}), 200