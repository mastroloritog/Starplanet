# from flask import Flask, send_from_directory
# from api import create_app
# import os

# app = create_app()

# # Define the directory where uploaded images will be stored
# UPLOAD_FOLDER = os.path.join(os.getcwd(), 'uploads', 'profile_images')
# app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# # Ensure the upload directory exists
# if not os.path.exists(UPLOAD_FOLDER):
#     os.makedirs(UPLOAD_FOLDER)

# # Serve profile images
# @app.route('/uploads/profile_images/<filename>')
# def uploaded_file(filename):
#     return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# if __name__ == '__main__':
#     app.run(debug=True)

from flask import Flask, send_from_directory
from api import create_app
import os

app = create_app()

# Define the directory where uploaded images will be stored
UPLOAD_FOLDER = os.path.join(os.getcwd(), 'uploads', 'profile_images')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Ensure the upload directory exists
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# Serve profile images
@app.route('/uploads/profile_images/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# Serve React app
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(os.path.join('../public', path)):
        return send_from_directory('../public', path)
    else:
        return send_from_directory('../public', 'index.html')

if __name__ == '__main__':
    app.run(debug=True)
