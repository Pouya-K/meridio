from flask import request, jsonify
from . import api
from models import database, Place

@api.post("/places")
def upsert_place():
    data = request.get_json() or {}
    place_id = data.get("place_id")
    name = data.get("place_name")
    address = data.get("place_address")

    if not place_id or not name:
        return {"error": "place_id and place_name are required"}, 400

    place = Place.query.filter_by(place_id=place_id).first()
    if not place:
        place = Place(place_id=place_id, place_name=name, place_address=address)
        database.session.add(place)
    else:
        place.place_name = name or place.place_name
        place.place_address = address or place.place_address

    database.session.commit()
    return jsonify({
        "id": place.id,
        "place_id": place.place_id,
        "place_name": place.place_name,
        "place_address": place.place_address,
        "visited": place.visited,
        "price": place.price, "taste": place.taste, "ambiance": place.ambiance
    })
