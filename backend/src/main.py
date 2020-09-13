from .entities.entity import Session, engine, Base
from .entities.email import Email
from marshmallow import Schema, fields
from flask_cors import CORS
from flask import Flask, jsonify, request
from src.Mask import TaskThread
from werkzeug.utils import secure_filename
import os
import random

app = Flask(__name__)
CORS(app)

# if needed, generate database schema
Base.metadata.create_all(engine)

#disable this
@app.route('/newsletter')
def get_Emails():
    # fetching from the database
    session = Session()
    Email_objects = session.query(Email).all()

    # transforming into JSON-serializable objects
    schema = EmailSchema(many=True)
    Emails = schema.dump(Email_objects)

    # serializing as JSON
    session.close()
    return jsonify(Emails)


@app.route('/newsletter', methods=['POST'])
def add_Email():
    # mount Email object
    posted_Email = EmailSchema(only=['email'])\
        .load(request.get_json())

    e = Email(**posted_Email, created_by="HTTP post request")

    # persist Email
    session = Session()
    session.add(e)
    session.commit()

    # return created Email
    new_Email = EmailSchema().dump(e)
    session.close()
    return jsonify(new_Email), 201


class EmailSchema(Schema):
    id = fields.Number()
    email = fields.Str()
    created_at = fields.DateTime()
    updated_at = fields.DateTime()
    last_updated_by = fields.Str()
    
threads = {}

@app.route('/video', methods=['POST'])
def prepDemo():

    global threads
    
    random.seed()

    file = request.files['vid']
    filename, ext = os.path.splitext(secure_filename(file.filename))
    
    r = random.randint(0,1000000000)
    
    while(r in threads or os.path.exists(os.path.join('uploads', str(r) + ext)) or os.path.exists(os.path.join('uploads', str(r) + ".mp4"))):
        r = random.randint(0,1000000000)
    
    file.save(os.path.join('uploads', str(r) + ext))
    file.close()
        
    threads[r] = TaskThread(os.path.join('uploads', str(r) + ext), os.path.join('saves', str(r) + ".mp4"))
    threads[r].start()
    
    return str(r), 201
    
@app.route('/progress/<int:thread_id>')
def progress(thread_id):
    global threads

    return str(threads[thread_id].progress)
    
@app.route('/status/<int:thread_id>')
def status(thread_id):
    global threads

    return str(int(threads[thread_id].done))

app.run("localhost", "9999", debug=True)