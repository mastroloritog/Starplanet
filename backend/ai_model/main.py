import pandas as pd
from sqlalchemy import create_engine

# Connessione al database
engine = create_engine('postgresql://postgres:root@localhost:5432/cinemate')

# Query per estrarre i dati
movies = pd.read_sql('SELECT * FROM movies', engine)
series = pd.read_sql('SELECT * FROM series', engine)
movielikes = pd.read_sql('SELECT * FROM movielikes', engine)
serielikes = pd.read_sql('SELECT * FROM serielikes', engine)
movievisuals = pd.read_sql('SELECT * FROM movievisuals', engine)
serievisuals = pd.read_sql('SELECT * FROM serievisuals', engine)

print("OK")