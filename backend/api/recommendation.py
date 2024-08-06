from flask import Blueprint, request, jsonify
import psycopg2
import requests
import json
from decimal import Decimal

recommendation_bp = Blueprint('recommendation', __name__)

def get_db_connection():
    conn = psycopg2.connect(
        host="localhost",
        database="cinemate",
        user="postgres",
        password="root"
    )
    return conn

OMDB_API_KEY = '7ab2a2fd'
OMDB_API_URL = 'http://www.omdbapi.com/'

@recommendation_bp.route('/getUserTopGenres', methods=['POST'])
def get_user_top_genres():
    data = request.get_json()
    user_id = data.get('userId')

    if not user_id:
        print("userId is required")
        return jsonify({'success': False, 'message': 'userId is required'}), 400

    conn = get_db_connection()
    cur = conn.cursor()

    query = """
        SELECT g.id, COUNT(*) as count
        FROM (
            SELECT movie_id AS id FROM movielikes WHERE user_id = %s
            UNION ALL
            SELECT movie_id AS id FROM movievisuals WHERE user_id = %s
            UNION ALL
            SELECT serie_id AS id FROM serielikes WHERE user_id = %s
            UNION ALL
            SELECT serie_id AS id FROM serievisuals WHERE user_id = %s
        ) AS user_interactions
        JOIN movie_genres mg ON user_interactions.id = mg.movie_id
        JOIN genres g ON mg.genre_id = g.id
        GROUP BY g.id
        ORDER BY count DESC
        LIMIT 3;
        """
    cur.execute(query, (user_id, user_id, user_id, user_id))
    top_genres = cur.fetchall()
    cur.close()
    conn.close()

    top3_userGenres = [genre[0] for genre in top_genres]

    return jsonify({'success': True, 'userTopGenres': top3_userGenres}), 200

# Fa chiamata api al link 1 per fetchare i film con titolo simile a una certa stringa e ottiene una lista
# Se un movie o una serie non è nel mio db lo i
@recommendation_bp.route('/search', methods=['GET'])
def search_movies_and_series():
    query = request.args.get('query')
    if not query:
        return jsonify({'error': 'Query parameter is required'}), 400

    omdb_search_url = f'https://www.omdbapi.com/?apikey={OMDB_API_KEY}&s={query}'
    response = requests.get(omdb_search_url)
    search_results = response.json().get('Search', [])

    final_results = []
    conn = get_db_connection()
    cur = conn.cursor()

    def decimal_to_float(value):
        if isinstance(value, Decimal):
            return float(value)
        return value

    print("API fetch one completed.")
    count = 1
    for item in search_results:
        print("Loading Item ", count)
        count = count + 1
        imdb_id = item['imdbID']
        
        # Check in the movies table
        cur.execute('SELECT * FROM movies WHERE imdbid = %s', (imdb_id,))
        movie = cur.fetchone()

        # Check in the series table if not found in movies
        if not movie:
            cur.execute('SELECT * FROM series WHERE imdbid = %s', (imdb_id,))
            series = cur.fetchone()
        else:
            series = None

        if movie:
            # il campo "rank" ha valore solo se il film è tra i primi 100 (si potrebbe eliminare)
            cur.execute('SELECT g.name FROM genres g JOIN movie_genres mg ON g.id = mg.genre_id WHERE mg.movie_id = %s', (movie[0],))
            genres = [genre[0] for genre in cur.fetchall()]
            final_results.append({
                'id': movie[0],
                'title': movie[1],
                'year': decimal_to_float(movie[8]),
                'imdbid': movie[7],
                'type': 'movie',
                'image': movie[3],
                'description': movie[2],
                'rating': decimal_to_float(movie[6]),
                'genre': genres,
                'big_image': movie[4],
                'thumbnail': movie[5],
                'imdb_link': movie[9]
            })
        elif series:
            cur.execute('SELECT g.name FROM genres g JOIN series_genres sg ON g.id = sg.genre_id WHERE sg.series_id = %s', (series[0],))
            genres = [genre[0] for genre in cur.fetchall()]
            final_results.append({
                'id': series[0],
                'title': series[1],
                'year': decimal_to_float(series[7]),
                'imdbid': series[8],
                'type': 'series',
                'image': series[3],
                'description': series[2],
                'rating': decimal_to_float(series[6]),
                'genre': genres,
                'big_image': series[4],
                'thumbnail': series[5],
                'imdb_link': series[9]
            })
        else:
            omdb_detail_url = f'https://www.omdbapi.com/?apikey={OMDB_API_KEY}&i={imdb_id}'
            detail_response = requests.get(omdb_detail_url)
            detail_data = detail_response.json()

            year_str = detail_data['Year']
            year = ''.join(filter(str.isdigit, year_str))
            if year:
                year = int(year)
            else:
                year = None

            genres = detail_data['Genre'].split(', ')
            media_id = None

            # Ottieni il rating e controlla se è 'N/A'
            imdb_rating = detail_data['imdbRating']
            if imdb_rating == 'N/A':
                # Se il rating è 'N/A', impostalo a None
                imdb_rating = None
            else:
                # Altrimenti, convertilo in float
                imdb_rating = float(imdb_rating)

            if detail_data['Type'] == 'movie':
                cur.execute(
                    'INSERT INTO movies (title, description, image, big_image, thumbnail, rating, imdbid, year, imdb_link) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id',
                    (detail_data['Title'], detail_data['Plot'], detail_data['Poster'], "", "", imdb_rating, detail_data['imdbID'], year, f'https://www.imdb.com/title/{detail_data["imdbID"]}')
                )
                media_id = cur.fetchone()[0]
                conn.commit()

                for genre_name in genres:
                    cur.execute('SELECT id FROM genres WHERE name = %s', (genre_name,))
                    genre_id = cur.fetchone()
                    if not genre_id:
                        cur.execute('INSERT INTO genres (name) VALUES (%s) RETURNING id', (genre_name,))
                        genre_id = cur.fetchone()[0]
                    else:
                        genre_id = genre_id[0]
                    
                    cur.execute('INSERT INTO movie_genres (movie_id, genre_id) VALUES (%s, %s)', (media_id, genre_id))
                conn.commit()
            elif detail_data['Type'] == 'series':
                cur.execute(
                    'INSERT INTO series (title, description, image, big_image, thumbnail, rating, imdbid, year, imdb_link) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id',
                    (detail_data['Title'], detail_data['Plot'], detail_data['Poster'], "", "", imdb_rating, detail_data['imdbID'], year, f'https://www.imdb.com/title/{detail_data["imdbID"]}')
                )
                media_id = cur.fetchone()[0]
                conn.commit()

                for genre_name in genres:
                    cur.execute('SELECT id FROM genres WHERE name = %s', (genre_name,))
                    genre_id = cur.fetchone()
                    if not genre_id:
                        cur.execute('INSERT INTO genres (name) VALUES (%s) RETURNING id', (genre_name,))
                        genre_id = cur.fetchone()[0]
                    else:
                        genre_id = genre_id[0]
                    
                    cur.execute('INSERT INTO series_genres (series_id, genre_id) VALUES (%s, %s)', (media_id, genre_id))
                conn.commit()
            else:
                # Nel caso ci siano altri Type (ad esempio "game")
                continue

            final_results.append({
                'id': media_id,
                'title': detail_data['Title'],
                'year': year_str,
                'imdbid': detail_data['imdbID'],
                'type': detail_data['Type'],
                'image': detail_data['Poster'],
                'description': detail_data['Plot'],
                'rating': imdb_rating,
                'genre': genres,
                'big_image': None,
                'thumbnail': None,
                'imdb_link': f'https://www.imdb.com/title/{detail_data["imdbID"]}'
            })

    cur.close()
    conn.close()

    print(json.dumps(final_results, indent=2))
    return jsonify(final_results), 200


@recommendation_bp.route('/search', methods=['POST'])
def search_users():
    data = request.get_json()
    query = data.get('query', '')

    if not query:
        return jsonify({'success': False, 'message': 'Query parameter is required'}), 400

    conn = get_db_connection()
    cur = conn.cursor()

    # Use ILIKE for case-insensitive search
    cur.execute("""
        SELECT id, username, email, profileimguri
        FROM users
        WHERE username ILIKE %s OR email ILIKE %s
    """, (f'%{query}%', f'%{query}%'))
    
    users = cur.fetchall()
    cur.close()
    conn.close()

    user_list = [{'userId': user[0], 'username': user[1], 'email': user[2], 'profileimguri': user[3]} for user in users]

    return jsonify({'success': True, 'users': user_list}), 200







# @recommendation_bp.route('/search', methods=['GET'])
# def search_movies_and_series():
#     query = request.args.get('query')
#     if not query:
#         return jsonify({'error': 'Query parameter is required'}), 400

#     omdb_search_url = f'https://www.omdbapi.com/?apikey={OMDB_API_KEY}&s={query}'
#     response = requests.get(omdb_search_url)
#     search_results = response.json().get('Search', [])

#     final_results = []
#     conn = get_db_connection()
#     cur = conn.cursor()

#     def decimal_to_float(value):
#         if isinstance(value, Decimal):
#             return float(value)
#         return value

#     print("Step 1 ok")
#     count = 1
#     for item in search_results:
#         print("Item ", count)
#         count = count + 1
#         imdb_id = item['imdbID']
        
#         # Check in the movies table
#         cur.execute('SELECT * FROM movies WHERE imdbid = %s', (imdb_id,))
#         movie = cur.fetchone()

#         # Check in the series table if not found in movies
#         if not movie:
#             cur.execute('SELECT * FROM series WHERE imdbid = %s', (imdb_id,))
#             series = cur.fetchone()
#         else:
#             series = None

#         if movie:
#             final_results.append({
#                 'Title': movie[2],
#                 'Year': decimal_to_float(movie[10]),
#                 'imdbID': movie[9],
#                 'Type': 'movie',
#                 'Poster': movie[3]
#             })
#         elif series:
#             final_results.append({
#                 'Title': series[2],
#                 'Year': decimal_to_float(series[7]),
#                 'imdbID': series[5],
#                 'Type': 'series',
#                 'Poster': series[3]
#             })
#         else:
#             omdb_detail_url = f'https://www.omdbapi.com/?apikey={OMDB_API_KEY}&i={imdb_id}'
#             detail_response = requests.get(omdb_detail_url)
#             detail_data = detail_response.json()

#             # Extract numerical year part
#             year_str = detail_data['Year']
#             year = ''.join(filter(str.isdigit, year_str))
#             if year:
#                 year = int(year)
#             else:
#                 year = None

#             if detail_data['Type'] == 'movie':
#                 cur.execute(
#                     'INSERT INTO movies (title, year, imdbid, image, description, rating) VALUES (%s, %s, %s, %s, %s, %s) RETURNING id',
#                     (detail_data['Title'], year, detail_data['imdbID'], detail_data['Poster'], detail_data['Plot'], float(detail_data['imdbRating']))
#                 )
#                 movie_id = cur.fetchone()[0]
#                 conn.commit()
                
#                 # Insert movie genres
#                 genres = detail_data['Genre'].split(', ')
#                 for genre_name in genres:
#                     cur.execute('SELECT id FROM genres WHERE name = %s', (genre_name,))
#                     genre_id = cur.fetchone()
#                     if not genre_id:
#                         cur.execute('INSERT INTO genres (name) VALUES (%s) RETURNING id', (genre_name,))
#                         genre_id = cur.fetchone()[0]
#                     else:
#                         genre_id = genre_id[0]
                    
#                     cur.execute('INSERT INTO movie_genres (movie_id, genre_id) VALUES (%s, %s)', (movie_id, genre_id))
#                 conn.commit()
#             elif detail_data['Type'] == 'series':
#                 cur.execute(
#                     'INSERT INTO series (title, imdbid, image, description, rating, year) VALUES (%s, %s, %s, %s, %s, %s) RETURNING id',
#                     (detail_data['Title'], detail_data['imdbID'], detail_data['Poster'], detail_data['Plot'], float(detail_data['imdbRating']), year)
#                 )
#                 series_id = cur.fetchone()[0]
#                 conn.commit()

#                 # Insert series genres
#                 genres = detail_data['Genre'].split(', ')
#                 for genre_name in genres:
#                     cur.execute('SELECT id FROM genres WHERE name = %s', (genre_name,))
#                     genre_id = cur.fetchone()
#                     if not genre_id:
#                         cur.execute('INSERT INTO genres (name) VALUES (%s) RETURNING id', (genre_name,))
#                         genre_id = cur.fetchone()[0]
#                     else:
#                         genre_id = genre_id[0]
                    
#                     cur.execute('INSERT INTO series_genres (series_id, genre_id) VALUES (%s, %s)', (series_id, genre_id))
#                 conn.commit()

#             final_results.append({
#                 'Title': detail_data['Title'],
#                 'Year': year_str,  # Preserve the original string for display purposes
#                 'imdbID': detail_data['imdbID'],
#                 'Type': detail_data['Type'],
#                 'Poster': detail_data['Poster']
#             })

#     cur.close()
#     conn.close()

#     print(json.dumps(final_results, indent=2))
#     return jsonify(final_results), 200