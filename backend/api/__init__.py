from flask import Flask
from flask_cors import CORS
from .auth import auth_bp
from .movies import movies_bp
from .series import series_bp
from .test import test_bp
from .recommendation import recommendation_bp
from .comments import comments_bp

def create_app():
    app = Flask(__name__)
    CORS(app)

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(movies_bp, url_prefix='/api/movies')
    app.register_blueprint(series_bp, url_prefix='/api/series')
    app.register_blueprint(test_bp, url_prefix='/test')
    app.register_blueprint(recommendation_bp, url_prefix='/api/recommendation')
    app.register_blueprint(comments_bp, url_prefix='/api/comments')

    @app.route('/', methods=['GET'])
    def home():
        return "Welcome to the Movie API!"

    return app
