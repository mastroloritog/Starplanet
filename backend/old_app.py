from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2
from werkzeug.security import check_password_hash, generate_password_hash
import os

app = Flask(__name__)
CORS(app)

def get_db_connection():
    conn = psycopg2.connect(
        host="localhost",
        database="cinemate",
        user="postgres",
        password="root"
    )
    return conn

@app.route('/', methods=['GET'])
def home():
    return "Welcome to the Movie API!"

@app.route('/api/test', methods=['GET'])
def test():
    return "Test successful."

@app.route('/api/fetchTest', methods=['GET'])
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

@app.route('/api/signin', methods=['POST'])
def signin():
    print("Signin endpoint hit")
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    print(f"Data received: email={email}, password={password}")

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
            print("User info:")
            print(user)
            return jsonify({'success': True, "userId": user[0]})
    
    return jsonify({'success': False}), 401

@app.route('/api/signup', methods=['POST'])
def signup():
    print("Signup endpoint hit")
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    print(f"Data received: email={email}, password={password}")

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

@app.route('/api/getUserInfo', methods=['POST'])
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

@app.route('/api/updateUserInfo', methods=['POST'])
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


#########################################################################################################################


@app.route('/api/top100movies', methods=['GET'])
def get_movies():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('''
        SELECT m.rank, m.title, m.description, m.image, m.big_image, array_agg(g.name) as genres, m.thumbnail, m.rating, m.id, m.year, m.imdbid, m.imdb_link
        FROM movies m
        JOIN movie_genres mg ON m.id = mg.movie_id
        JOIN genres g ON mg.genre_id = g.id
        GROUP BY m.id
        ORDER BY m.rank;
    ''')
    movies = cur.fetchall()
    cur.close()
    conn.close()

    movie_list = []
    for movie in movies:
        movie_list.append({
            'rank': movie[0],
            'title': movie[1],
            'description': movie[2],
            'image': movie[3],
            'big_image': movie[4],
            'genre': movie[5],
            'thumbnail': movie[6],
            'rating': movie[7],
            'id': movie[8],
            'year': movie[9],
            'imdbid': movie[10],
            'imdb_link': movie[11]
        })

    return jsonify(movie_list)

@app.route('/api/top100series', methods=['GET'])
def get_series():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('''
        SELECT s.rank, s.title, s.description, s.image, s.big_image, array_agg(g.name) as genres, s.thumbnail, s.rating, s.id, s.year, s.imdbid, s.imdb_link
        FROM series s
        JOIN series_genres sg ON s.id = sg.series_id
        JOIN genres g ON sg.genre_id = g.id
        GROUP BY s.id
        ORDER BY s.rank;
    ''')
    series = cur.fetchall()
    cur.close()
    conn.close()

    series_list = []
    for item in series:
        series_list.append({
            'rank': item[0],
            'title': item[1],
            'description': item[2],
            'image': item[3],
            'big_image': item[4],
            'genre': item[5],
            'thumbnail': item[6],
            'rating': item[7],
            'id': item[8],
            'year': item[9],
            'imdbid': item[10],
            'imdb_link': item[11]
        })

    return jsonify(series_list)

@app.route('/api/likeMovie', methods=['POST'])
def likeMovie():
    data = request.get_json()
    user_id = data.get('userId')
    movie_id = data.get('movieId')

    if not user_id or not movie_id:
        return jsonify({'success': False, 'message': 'userId and movieId are required'}), 400

    conn = get_db_connection()
    cur = conn.cursor()

    # Check if the like already exists
    cur.execute('SELECT * FROM movieLikes WHERE user_id = %s AND movie_id = %s', (user_id, movie_id))
    like = cur.fetchone()

    if like:
        # If like exists, remove it (unlike)
        cur.execute('DELETE FROM movieLikes WHERE user_id = %s AND movie_id = %s', (user_id, movie_id))
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({'success': True, 'message': 'Like removed'}), 200
    else:
        # If like does not exist, add it
        cur.execute('INSERT INTO movieLikes (user_id, movie_id) VALUES (%s, %s)', (user_id, movie_id))
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({'success': True, 'message': 'Like added'}), 200
    
@app.route('/api/setMovieViewed', methods=['POST'])
def setMovieViewed():
    data = request.get_json()
    user_id = data.get('userId')
    movie_id = data.get('movieId')

    if not user_id or not movie_id:
        return jsonify({'success': False, 'message': 'userId and movieId are required'}), 400

    conn = get_db_connection()
    cur = conn.cursor()

    # Check if the like already exists
    cur.execute('SELECT * FROM movieVisuals WHERE user_id = %s AND movie_id = %s', (user_id, movie_id))
    like = cur.fetchone()

    if like:
        # If like exists, remove it (unlike)
        cur.execute('DELETE FROM movieVisuals WHERE user_id = %s AND movie_id = %s', (user_id, movie_id))
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({'success': True, 'message': 'Visual removed'}), 200
    else:
        # If like does not exist, add it
        cur.execute('INSERT INTO movieVisuals (user_id, movie_id) VALUES (%s, %s)', (user_id, movie_id))
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({'success': True, 'message': 'Visual added'}), 200

@app.route('/api/getLikedMovies', methods=['POST'])
def getLikedMovies():
    data = request.get_json()
    user_id = data.get('userId')

    if not user_id:
        return jsonify({'success': False, 'message': 'userId is required'}), 400

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('SELECT movie_id FROM movieLikes WHERE user_id = %s', (user_id,))
    likes = cur.fetchall()
    cur.close()
    conn.close()

    liked_movies = [like[0] for like in likes]

    return jsonify({'success': True, 'likedMovies': liked_movies}), 200

@app.route('/api/getViewedMovies', methods=['POST'])
def getLikesMovie():
    data = request.get_json()
    user_id = data.get('userId')

    if not user_id:
        return jsonify({'success': False, 'message': 'userId is required'}), 400

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('SELECT movie_id FROM movieVisuals WHERE user_id = %s', (user_id,))
    likes = cur.fetchall()
    cur.close()
    conn.close()

    viewed_movies = [like[0] for like in likes]

    return jsonify({'success': True, 'viewedMovies': viewed_movies}), 200

@app.route('/api/likeSerie', methods=['POST'])
def likeSeries():
    data = request.get_json()
    user_id = data.get('userId')
    serie_id = data.get('serieId')

    if not user_id or not serie_id:
        return jsonify({'success': False, 'message': 'userId and serieId are required'}), 400

    conn = get_db_connection()
    cur = conn.cursor()

    # Check if the like already exists
    cur.execute('SELECT * FROM serieLikes WHERE user_id = %s AND serie_id = %s', (user_id, serie_id))
    like = cur.fetchone()

    if like:
        # If like exists, remove it (unlike)
        cur.execute('DELETE FROM serieLikes WHERE user_id = %s AND serie_id = %s', (user_id, serie_id))
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({'success': True, 'message': 'Like removed'}), 200
    else:
        # If like does not exist, add it
        cur.execute('INSERT INTO serieLikes (user_id, serie_id) VALUES (%s, %s)', (user_id, serie_id))
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({'success': True, 'message': 'Like added'}), 200

@app.route('/api/setSerieViewed', methods=['POST'])
def setSerieViewed():
    data = request.get_json()
    user_id = data.get('userId')
    movie_id = data.get('movieId')

    if not user_id or not movie_id:
        return jsonify({'success': False, 'message': 'userId and movieId are required'}), 400

    conn = get_db_connection()
    cur = conn.cursor()

    # Check if the like already exists
    cur.execute('SELECT * FROM serieVisuals WHERE user_id = %s AND movie_id = %s', (user_id, movie_id))
    like = cur.fetchone()

    if like:
        # If like exists, remove it (unlike)
        cur.execute('DELETE FROM serieVisuals WHERE user_id = %s AND movie_id = %s', (user_id, movie_id))
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({'success': True, 'message': 'Visual removed'}), 200
    else:
        # If like does not exist, add it
        cur.execute('INSERT INTO serieVisuals (user_id, movie_id) VALUES (%s, %s)', (user_id, movie_id))
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({'success': True, 'message': 'Visual added'}), 200

@app.route('/api/getLikedSeries', methods=['POST'])
def getLikedSeries():
    data = request.get_json()
    user_id = data.get('userId')

    if not user_id:
        return jsonify({'success': False, 'message': 'userId is required'}), 400

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('SELECT serie_id FROM serieLikes WHERE user_id = %s', (user_id,))
    likes = cur.fetchall()
    cur.close()
    conn.close()

    liked_series = [like[0] for like in likes]

    return jsonify({'success': True, 'likedSeries': liked_series}), 200

@app.route('/api/countLikesMovie', methods=['POST'])
def countLikesMovie():
    data = request.get_json()
    movie_id = data.get('movieId')

    if not movie_id:
        return jsonify({'success': False, 'message': 'movieId is required'}), 400

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('SELECT COUNT(*) FROM movieLikes WHERE movie_id = %s', (movie_id,))
    count = cur.fetchone()[0]
    cur.close()
    conn.close()

    return jsonify({'success': True, 'likeCount': count}), 200

@app.route('/api/countVisualsMovie', methods=['POST'])
def countVisualsMovie():
    data = request.get_json()
    movie_id = data.get('movieId')

    if not movie_id:
        return jsonify({'success': False, 'message': 'movieId is required'}), 400

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('SELECT COUNT(*) FROM movieVisuals WHERE movie_id = %s', (movie_id,))
    count = cur.fetchone()[0]
    cur.close()
    conn.close()

    return jsonify({'success': True, 'visualsCount': count}), 200

@app.route('/api/getViewedSeries', methods=['POST'])
def getViewedSeries():
    data = request.get_json()
    user_id = data.get('userId')

    if not user_id:
        return jsonify({'success': False, 'message': 'userId is required'}), 400

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('SELECT movie_id FROM serieVisuals WHERE user_id = %s', (user_id,))
    likes = cur.fetchall()
    cur.close()
    conn.close()

    viewed_series = [like[0] for like in likes]

    return jsonify({'success': True, 'viewedSeries': viewed_series}), 200

@app.route('/api/countLikesSeries', methods=['POST'])
def countLikesSeries():
    data = request.get_json()
    serie_id = data.get('serieId')

    if not serie_id:
        return jsonify({'success': False, 'message': 'serieId is required'}), 400

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('SELECT COUNT(*) FROM serieLikes WHERE serie_id = %s', (serie_id,))
    count = cur.fetchone()[0]
    cur.close()
    conn.close()

    return jsonify({'success': True, 'likeCount': count}), 200

@app.route('/api/countVisualsSerie', methods=['POST'])
def countVisualsSerie():
    data = request.get_json()
    serie_id = data.get('serieId')

    if not serie_id:
        return jsonify({'success': False, 'message': 'serieId is required'}), 400

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('SELECT COUNT(*) FROM serieVisuals WHERE movie_id = %s', (serie_id,))
    count = cur.fetchone()[0]
    cur.close()
    conn.close()

    return jsonify({'success': True, 'visualsCount': count}), 200


if __name__ == '__main__':
    print("Avvio Flask ...")
    app.run(debug=True)
