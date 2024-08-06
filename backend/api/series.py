from flask import Blueprint, request, jsonify
import psycopg2

series_bp = Blueprint('series', __name__)

def get_db_connection():
    conn = psycopg2.connect(
        host="localhost",
        database="cinemate",
        user="postgres",
        password="root"
    )
    return conn

@series_bp.route('/top100series', methods=['GET'])
def get_series():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('''
        SELECT s.title, s.description, s.image, s.big_image, array_agg(g.name) as genres, s.thumbnail, s.rating, s.id, s.year, s.imdbid, s.imdb_link
        FROM series s
        JOIN series_genres sg ON s.id = sg.series_id
        JOIN genres g ON sg.genre_id = g.id
        WHERE s.id < 101
        GROUP BY s.id
        ORDER BY s.rating DESC
        LIMIT 100;
    ''')
    series = cur.fetchall()
    cur.close()
    conn.close()

    series_list = []
    for item in series:
        series_list.append({
            'title': item[0],
            'description': item[1],
            'image': item[2],
            'big_image': item[3],
            'genre': item[4],
            'thumbnail': item[5],
            'rating': item[6],
            'id': item[7],
            'year': item[8],
            'imdbid': item[9],
            'imdb_link': item[10]
        })

    return jsonify(series_list)

@series_bp.route('/likeSerie', methods=['POST'])
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

@series_bp.route('/setSerieViewed', methods=['POST'])
def setSerieViewed():
    data = request.get_json()
    user_id = data.get('userId')
    serie_id = data.get('serieId')

    if not user_id or not serie_id:
        print("userId and serieId are required")
        return jsonify({'success': False, 'message': 'userId and serieId are required'}), 400

    conn = get_db_connection()
    cur = conn.cursor()

    # Check if the like already exists
    cur.execute('SELECT * FROM serieVisuals WHERE user_id = %s AND serie_id = %s', (user_id, serie_id))
    like = cur.fetchone()

    if like:
        # If like exists, remove it (unlike)
        cur.execute('DELETE FROM serieVisuals WHERE user_id = %s AND serie_id = %s', (user_id, serie_id))
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({'success': True, 'message': 'Visual removed'}), 200
    else:
        # If like does not exist, add it
        cur.execute('INSERT INTO serieVisuals (user_id, serie_id) VALUES (%s, %s)', (user_id, serie_id))
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({'success': True, 'message': 'Visual added'}), 200
    
@series_bp.route('/getLikedSeries', methods=['POST'])
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

@series_bp.route('/getViewedSeries', methods=['POST'])
def getViewedSeries():
    data = request.get_json()
    user_id = data.get('userId')

    if not user_id:
        return jsonify({'success': False, 'message': 'userId is required'}), 400

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('SELECT serie_id FROM serieVisuals WHERE user_id = %s', (user_id,))
    visuals = cur.fetchall()
    cur.close()
    conn.close()

    viewed_series = [visual[0] for visual in visuals]

    return jsonify({'success': True, 'viewedSeries': viewed_series}), 200

@series_bp.route('/getViewedSeriesInfo', methods=['POST'])
def getViewedSeriesInfo():
    data = request.get_json()
    user_id = data.get('userId')

    if not user_id:
        return jsonify({'success': False, 'message': 'userId is required'}), 400

    conn = get_db_connection()
    cur = conn.cursor()

    # Query to get detailed information about viewed series
    cur.execute('''
        SELECT s.title, s.description, s.image, s.big_image, array_agg(g.name) as genres, 
               s.thumbnail, s.rating, s.id, s.year, s.imdbid, s.imdb_link
        FROM serieVisuals sv
        JOIN series s ON sv.serie_id = s.id
        JOIN series_genres sg ON s.id = sg.series_id
        JOIN genres g ON sg.genre_id = g.id
        WHERE sv.user_id = %s
        GROUP BY s.id
        ORDER BY s.rating DESC;
    ''', (user_id,))

    viewed_series = cur.fetchall()
    cur.close()
    conn.close()

    viewed_series_list = []
    for serie in viewed_series:
        viewed_series_list.append({
            'title': serie[0],
            'description': serie[1],
            'image': serie[2],
            'big_image': serie[3],
            'genre': serie[4],
            'thumbnail': serie[5],
            'rating': serie[6],
            'id': serie[7],
            'year': serie[8],
            'imdbid': serie[9],
            'imdb_link': serie[10]
        })

    print("viewedSeries: ", viewed_series_list);
    return jsonify({'success': True, 'viewedSeries': viewed_series_list}), 200

@series_bp.route('/countLikesSerie', methods=['POST'])
def countLikesSerie():
    data = request.get_json()
    serie_id = data.get('serieId')

    if not serie_id:
        print('serieId is required')
        return jsonify({'success': False, 'message': 'serieId is required'}), 400

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('SELECT COUNT(*) FROM serieLikes WHERE serie_id = %s', (serie_id,))
    count = cur.fetchone()[0]
    cur.close()
    conn.close()

    return jsonify({'success': True, 'likeCount': count}), 200

@series_bp.route('/countVisualsSerie', methods=['POST'])
def countVisualsSerie():
    data = request.get_json()
    serie_id = data.get('serieId')

    if not serie_id:
        print('serieId is required')
        return jsonify({'success': False, 'message': 'serieId is required'}), 400

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('SELECT COUNT(*) FROM serieVisuals WHERE serie_id = %s', (serie_id,))
    count = cur.fetchone()[0]
    cur.close()
    conn.close()

    return jsonify({'success': True, 'visualsCount': count}), 200