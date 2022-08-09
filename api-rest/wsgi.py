from asyncio.windows_events import NULL
from flask import Flask, request, jsonify, make_response
from flask_sqlalchemy import SQLAlchemy
from flask_restful import Api, Resource
from flask_marshmallow import Marshmallow

from flask_cors import CORS, cross_origin


app = Flask(__name__)
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///list.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
db.init_app(app)
api = Api()
ma = Marshmallow(app)


# sqlite tabe
class PB(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(50), unique=True)
    type = db.Column(db.String(50))    
    version = db.Column(db.String(50))
    status = db.Column(db.String(50))
    order = db.Column(db.Integer)


    def __repr__(self):
        return f'<users {self.id}>'





# rest api

class Features(Resource):
    def get(self, feature_id=0):        
        if not feature_id:
            list_response = []
            features = PB.query.order_by(PB.order).all()
            for feature in features:                
                list_response.append({ 
                'id': feature.id,
                'title': feature.title,
                'type': feature.type,
                'version': feature.version,
                'status': feature.status,
                'order': feature.order,
                })
            response = make_response(jsonify({ 
                'results': list_response,
            }))
            response.headers.add('Access-Control-Allow-Origin', 'http://127.0.0.1:5500')
            response.headers.add('Content-Type', 'application/json')
            return response

        feature = PB.query.filter_by(id=feature_id).first()
        response = {
            'id': feature.id,
            'title': feature.title,
            'type': feature.type,
            'version': feature.version,
            'status': feature.status,
            'order': feature.order,
        }
        return jsonify(response)

    @cross_origin()
    def put(self):
        parsedRequest = request.json['data']

        if 'orderedData' in parsedRequest.keys():
            req = parsedRequest['orderedData']
            for item in req:
                feature = PB.query.filter_by(id=item['id']).first()
                feature.order = item['order']
                db.session.commit()
            response = make_response(jsonify({ 
                'msg': 'ordered!',
            }))

        if 'toSprint' in parsedRequest.keys():
            req = parsedRequest['toSprint']
            feature = PB.query.filter_by(id=req['id']).first()
            featuresAfterCurrent = PB.query.filter_by(version='product backlog').all()
            for f in featuresAfterCurrent:
                if f.order > feature.order and f.id != req['id']:
                    print('FEATURE', f)
                    othFeature = PB.query.filter_by(id=f.id).first()
                    othFeature.order = f.order - 1
            feature.version = req['version']
            feature.order = NULL
            db.session.commit()
            response = make_response(jsonify({ 
                'msg': 'added to sprint!',
            }))

        if 'toProductBacklog' in parsedRequest.keys():
            req = parsedRequest['toProductBacklog']
            feature = PB.query.filter_by(id=req['id']).first()
            featuresAfterCurrent = PB.query.filter_by(version='product backlog').all()
            for f in featuresAfterCurrent:                
                othFeature = PB.query.filter_by(id=f.id).first()
                othFeature.order = f.order + 1
            feature.version = req['version']
            feature.order = 0
            db.session.commit()
            response = make_response(jsonify({ 
                'msg': 'removed from sprint!',
            }))

        response.headers.add('Access-Control-Allow-Methods', 'PUT')
        response.headers.add('Content-Type', 'application/json')
        return response
                         
      

    
api.add_resource(Features, '/features', '/features/<int:feature_id>')
api.init_app(app)




if __name__ == '__main__':
    app.run(debug=True, port=5000, host='127.0.0.1')
