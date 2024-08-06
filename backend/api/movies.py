from flask import Blueprint, request, jsonify
import psycopg2

movies_bp = Blueprint('movies', __name__)

def get_db_connection():
    conn = psycopg2.connect(
        host="localhost",
        database="cinemate",
        user="postgres",
        password="root"
    )
    return conn

# Old without loading scroll show
@movies_bp.route('/top100movies', methods=['GET'])
def get_movies():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('''
        SELECT m.title, m.description, m.image, m.big_image, array_agg(g.name) as genres, m.thumbnail, m.rating, m.id, m.year, m.imdbid, m.imdb_link
        FROM movies m
        JOIN movie_genres mg ON m.id = mg.movie_id
        JOIN genres g ON mg.genre_id = g.id
        WHERE m.id < 101
        GROUP BY m.id
        ORDER BY m.rating DESC
        LIMIT 100;
    ''')
    movies = cur.fetchall()
    cur.close()
    conn.close()

    movie_list = []
    for movie in movies:
        movie_list.append({
            'title': movie[0],
            'description': movie[1],
            'image': movie[2],
            'big_image': movie[3],
            'genre': movie[4],
            'thumbnail': movie[5],
            'rating': movie[6],
            'id': movie[7],
            'year': movie[8],
            'imdbid': movie[9],
            'imdb_link': movie[10]
        })

    return jsonify(movie_list)

# @movies_bp.route('/top100movies', methods=['GET'])
# def get_movies():
#     page = int(request.args.get('page', 1))
#     limit = int(request.args.get('limit', 6))
#     offset = (page - 1) * limit

#     conn = get_db_connection()
#     cur = conn.cursor()
#     cur.execute('''
#         SELECT m.title, m.description, m.image, m.big_image, array_agg(g.name) as genres, m.thumbnail, m.rating, m.id, m.year, m.imdbid, m.imdb_link
#         FROM movies m
#         JOIN movie_genres mg ON m.id = mg.movie_id
#         JOIN genres g ON mg.genre_id = g.id
#         WHERE m.id < 101
#         GROUP BY m.id
#         ORDER BY m.rating DESC
#         LIMIT %s OFFSET %s;
#     ''', (limit, offset))
#     movies = cur.fetchall()
#     cur.close()
#     conn.close()

#     movie_list = []
#     for movie in movies:
#         movie_list.append({
#             'title': movie[0],
#             'description': movie[1],
#             'image': movie[2],
#             'big_image': movie[3],
#             'genre': movie[4],
#             'thumbnail': movie[5],
#             'rating': movie[6],
#             'id': movie[7],
#             'year': movie[8],
#             'imdbid': movie[9],
#             'imdb_link': movie[10]
#         })

#     return jsonify(movie_list)


@movies_bp.route('/likeMovie', methods=['POST'])
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

@movies_bp.route('/setMovieViewed', methods=['POST'])
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
    
@movies_bp.route('/getLikedMovies', methods=['POST'])
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

    print("likedMovies: ", jsonify(liked_movies))
    return jsonify({'success': True, 'likedMovies': liked_movies}), 200

@movies_bp.route('/getViewedMovies', methods=['POST'])
def getViewedMovies():
    data = request.get_json()
    user_id = data.get('userId')

    if not user_id:
        return jsonify({'success': False, 'message': 'userId is required'}), 400

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('SELECT movie_id FROM movieVisuals WHERE user_id = %s', (user_id,))
    visuals = cur.fetchall()
    cur.close()
    conn.close()

    viewed_movies = [visual[0] for visual in visuals]

    return jsonify({'success': True, 'viewedMovies': viewed_movies}), 200

@movies_bp.route('/getViewedMoviesInfo', methods=['POST'])
def getViewedMoviesInfo():
    data = request.get_json()
    user_id = data.get('userId')

    if not user_id:
        return jsonify({'success': False, 'message': 'userId is required'}), 400

    conn = get_db_connection()
    cur = conn.cursor()

    # Query to get detailed information about viewed movies
    cur.execute('''
        SELECT m.title, m.description, m.image, m.big_image, array_agg(g.name) as genres, 
               m.thumbnail, m.rating, m.id, m.year, m.imdbid, m.imdb_link
        FROM movieVisuals mv
        JOIN movies m ON mv.movie_id = m.id
        JOIN movie_genres mg ON m.id = mg.movie_id
        JOIN genres g ON mg.genre_id = g.id
        WHERE mv.user_id = %s
        GROUP BY m.id
        ORDER BY m.rating DESC;
    ''', (user_id,))

    viewed_movies = cur.fetchall()
    cur.close()
    conn.close()

    viewed_movie_list = []
    for movie in viewed_movies:
        viewed_movie_list.append({
            'title': movie[0],
            'description': movie[1],
            'image': movie[2],
            'big_image': movie[3],
            'genre': movie[4],
            'thumbnail': movie[5],
            'rating': movie[6],
            'id': movie[7],
            'year': movie[8],
            'imdbid': movie[9],
            'imdb_link': movie[10]
        })

    print("viewedMovies: ", viewed_movie_list);
    return jsonify({'success': True, 'viewedMovies': viewed_movie_list}), 200

@movies_bp.route('/countLikesMovie', methods=['POST'])
def countLikesMovie():
    data = request.get_json()
    movie_id = data.get('movieId')

    if not movie_id:
        print('movieId is required')
        return jsonify({'success': False, 'message': 'movieId is required'}), 400

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('SELECT COUNT(*) FROM movieLikes WHERE movie_id = %s', (movie_id,))
    count = cur.fetchone()[0]
    cur.close()
    conn.close()

    return jsonify({'success': True, 'likeCount': count}), 200

@movies_bp.route('/countVisualsMovie', methods=['POST'])
def countVisualsMovie():
    data = request.get_json()
    movie_id = data.get('movieId')

    if not movie_id:
        print('movieId is required')
        return jsonify({'success': False, 'message': 'movieId is required'}), 400

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('SELECT COUNT(*) FROM movieVisuals WHERE movie_id = %s', (movie_id,))
    count = cur.fetchone()[0]
    cur.close()
    conn.close()

    return jsonify({'success': True, 'visualsCount': count}), 200