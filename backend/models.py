from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

database = SQLAlchemy()

class Place(database.Model):
    id = database.Column(database.Integer, primary_key = True) #Uses google places id as primary key to identify a place

    #creating columns in database for each place
    place_id = database.Column(database.String(200), unique = True, nullable = False)
    place_name = database.Column(database.String(120), nullable = False)
    place_address = database.Column(database.String(300))
    created_at = database.Column(database.DateTime, default = datetime.utcnow)

    visited = database.Column(database.Boolean, default = False)

    price = database.Column(database.Integer)
    taste = database.Column(database.Integer)
    ambiance = database.Column(database.Integer)

    def mark_visited(self):
        self.visited = True
    
    def set_price_rating(self, rating: int):
        self.price = rating
    
    def set_taste_rating(self, rating: int):
        self.taste = rating

    def set_ambiance_rating(self, rating: int):
        self.ambiance = rating
