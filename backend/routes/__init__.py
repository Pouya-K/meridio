from flask import Blueprint

# create a Blueprint that all your route files will use
api = Blueprint("api", __name__, url_prefix="/api")
