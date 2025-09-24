from flask import Flask, jsonify
from flask_cors import CORS
from flask_migrate import Migrate
from models import database
from config import Config
from routes import places, visited, ratings, get_place, get_visited  # noqa: F401

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app, resources={r"/api/*": {"origins": ["http://localhost:3000"]}})

    database.init_app(app)
    Migrate(app, database)

    from routes import api  # blueprint
    app.register_blueprint(api)

    @app.get("/health")
    def health():
        return jsonify({"status": "ok"})

    return app

app = create_app()

if __name__ == "__main__":
    app.run(debug = True, port = 5001)