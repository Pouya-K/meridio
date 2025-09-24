from flask import request, jsonify
from . import api
from models import database, Place

@api.get("/places/getVisited")
def getVisited():
    places = Place.query.filter_by(visited = True).all()
    return jsonify([p.to_dict() for p in places]), 200