from flask import Flask
from flask_cors import CORS
from routes.automate_routes import automate_bp
from routes.regex_routes import regex_bp
from routes.equations_routes import equations_bp

app = Flask(__name__)
CORS(app)

app.register_blueprint(automate_bp, url_prefix='/api/automate')
app.register_blueprint(regex_bp,    url_prefix='/api/regex')
app.register_blueprint(equations_bp,url_prefix='/api/equations')

if __name__ == '__main__':
    app.run(debug=True)
