from flask import request, jsonify
from . import api
from models import database, Place

def get_place(place_id):
    return Place.query.filter_by(place_id=place_id).first()

def parse_value(data):
    value = data.get("value")
    try:
        return int(value)
    except (TypeError, ValueError):
        return None

@api.post("/places/<place_id>/rate/price")
def rate_price(place_id):
    place = get_place(place_id)
    if not place:
        return {"error": "unknown place id"}, 404
    
    value = parse_value(request.get_json() or {})

    if value is None or not (0 <= value <= 5):
        return {"error": "rating must be an integer 0-5"}, 400
    
    place.set_price_rating(value)
    database.session.commit()
    return jsonify({"place_id": place.place_id, "price": place.price})

@api.post("/places/<place_id>/rate/taste")
def rate_taste(place_id):
    place = get_place(place_id)
    if not place:
        return {"error": "unknown place id"}, 404
    
    value = parse_value(request.get_json() or {})

    if value is None or not (0 <= value <= 5):
        return {"error": "rating must be an integer 0-5"}, 400
    
    place.set_taste_rating(value)
    database.session.commit()
    return jsonify({"place_id": place.place_id, "taste": place.taste})

@api.post("/places/<place_id>/rate/ambiance")
def rate_ambiance(place_id):
    place = get_place(place_id)
    if not place:
        return {"error": "unknown place id"}, 404
    
    value = parse_value(request.get_json() or {})

    if value is None or not (0 <= value <= 5):
        return {"error": "rating must be an integer 0-5"}, 400
    
    place.set_ambiance_rating(value)
    database.session.commit()
    return jsonify({"place_id": place.place_id, "ambiance": place.ambiance})