from flask import request, jsonify
from . import api
from models import database, Place

@api.post("/places/<place_id>/visit")
def mark_visied(place_id):
    place = Place.query.filter_by(place_id=place_id).first()
    if not place:
        return {"error": "place id does not exist"}, 404
    place.mark_visited()
    database.session.commit()
    return jsonify({"place_id": place.place_id, "visited": place.visited})