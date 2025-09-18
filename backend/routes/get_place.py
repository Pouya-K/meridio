from flask import jsonify
from . import api
from models import Place

@api.get("/places/<place_id>")
def get_place(place_id):
    place = Place.query.filter_by(place_id=place_id).first()

    if not place:
        return {"error": "place id not found"}, 404
    
    return jsonify({
        "place_id": place.place_id,
        "place_name": place.place_name,
        "place_address": place.place_address,
        "visited": place.visited,
        "price": place.price,
        "taste": place.taste,
        "ambiance": place.ambiance,
    })