from flask import Flask, request, jsonify, make_response
from pymongo import MongoClient
from bson import ObjectId
import jwt
from jwt.exceptions import ExpiredSignatureError
import datetime
from functools import wraps
import bcrypt
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
app.config["SECRET_KEY"] = "Coursework"

client = MongoClient("mongodb://127.0.0.1:27017")
db = client.userDB
users = db.userCollection
blacklist = db.blacklist


@app.route("/")
def index():
    return make_response(jsonify({'message': 'Welcome'}))


# authentication method with wrapper decorator
# tested
def jwt_required(func):
    @wraps(func)
    def jwt_required_wrapper(*args, **kwargs):
        token = None

        # check if token is present
        if 'x-access-token' in request.headers:
            token = request.headers['x-access-token']

        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        try:
            # try to decode current token
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        except ExpiredSignatureError:
            # token is no longer active, requires login
            return jsonify({'message': 'Token is invalid, login to re-issue new token'}), 401

        bl_token = blacklist.find_one({'token': token})  # check if token is already in blacklist database
        if bl_token is not None:
            return make_response(jsonify({'message': 'Token has been cancelled'}), 200)

        return func(*args, **kwargs)

    return jwt_required_wrapper


# tested, admin functions
def admin_required(func):
    @wraps(func)
    def admin_required_wrapper(*args, **kwargs):
        token = request.headers['x-access-token']
        data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])

        if data["admin"]:
            return func(*args, **kwargs)
        else:
            return make_response(jsonify({'message': 'Admin access required'}), 401)

    return admin_required_wrapper


# tested
# checks if object id is valid
def valid_id(func):
    @wraps(func)
    def valid_id_wrapper(*args, **kwargs):
        # copyright Joshua Glass
        data = None
        # reverse order for url standard
        for stringID in kwargs.__reversed__():
            if stringID == 'r_id':
                data = ObjectId.is_valid(str(kwargs['r_id']))
            else:
                if stringID == 'm_id':
                    data = ObjectId.is_valid(str(kwargs['m_id']))
                else:
                    pass

            if stringID == 'r_id':
                data = ObjectId.is_valid(str(kwargs['r_id']))
            else:
                if stringID == 'u_id':
                    data = ObjectId.is_valid(str(kwargs['u_id']))
                else:
                    pass

        if data:
            return func(*args, **kwargs)
        else:
            return make_response(jsonify({'error': 'Invalid Movie ID or Review ID'}), 404)

    return valid_id_wrapper


# tested
@app.route("/api/v1/login", methods=["GET"])
def login():
    auth = request.authorization

    if auth:
        # find user in database
        user = users.find_one({'username': auth.username})
        username = str(user['username'])
        user_id = str(user['_id'])

        if user is not None:
            # check user password
            if bcrypt.checkpw(bytes(auth.password, 'UTF-8'), user['password']):
                if username != 'admin':
                    # encrypt username with secret key using HS256 hash algorithm
                    # set expiry time to 30 min
                    token = jwt.encode(
                        {
                            'username': auth.username,
                            'admin': False,
                            'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=30)
                        },
                        app.config['SECRET_KEY'], algorithm="HS256"
                    )
                    return make_response(
                        jsonify({'message': 'User logged in', 'token': token, 'userID': user_id, 'admin': False}),
                        200)
                else:
                    # encrypt username with secret key using HS256 hash algorithm
                    # set expiry time to 30 min
                    token = jwt.encode(
                        {
                            'username': auth.username,
                            'admin': True,
                            'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=3000000)
                        },
                        app.config['SECRET_KEY'], algorithm="HS256"
                    )
                    return make_response(
                        jsonify({'message': 'Admin logged in', 'token': token, 'userID': user_id, 'admin': True}),
                        200)
            else:
                return make_response(jsonify({'message': 'Bad Password'}), 401)
        else:
            return make_response(jsonify({'message': 'Bad Username'}), 401)

    return make_response(jsonify({'message': 'Authentication required'}), 401)


# tested, log out
@app.route("/api/v1/logout", methods=["GET"])
@jwt_required
def logout():
    token = request.headers['x-access-token']
    blacklist.insert_one({'token': token})
    return make_response(jsonify({'message': 'Logout Successful, Goodbye'}), 200)


# tested, add new user
@app.route("/api/v1/users/register", methods=["POST"])
def add_new_user():
    if "email" in request.form and "username" in request.form and "password" in request.form:
        password = bytes(request.form["password"], 'utf-8')
        new_user = {
            "email": request.form["email"],
            "username": request.form["username"],
            "password": password,
            'admin': False
        }
        new_user['password'] = bcrypt.hashpw(new_user['password'], bcrypt.gensalt())
        new_user_id = users.insert_one(new_user)

        new_user_link = "http://127.0.0.1:5000/api/v1/users/" + str(new_user_id.inserted_id)
        return make_response(jsonify({'url': new_user_link}), 201)
    else:
        return make_response(jsonify({'error': 'Missing Form Data'}), 404)


# tested, gets single user account
@app.route("/api/v1/users/<string:u_id>", methods=["GET"])  # needs testing
@valid_id
def get_user_profile(u_id):
    data_to_return = []

    user = users.find_one({'_id': ObjectId(u_id)},
                          {'password': 0})

    # checks if user id exists
    if user is not None:
        user['_id'] = str(user['_id'])
        data_to_return.append(user)
        return make_response(jsonify(data_to_return), 200)
    else:
        return make_response(jsonify({'error': 'User does not exist'}), 404)


# tested
# edit user profile
@app.route("/api/v1/users/<string:u_id>", methods=["PUT"])  # needs testing
@jwt_required
@valid_id
def edit_user_details(u_id):
    if "password" in request.form:
        password = bytes(request.form["password"], 'utf-8')
        result = users.update_one(
            {'_id': ObjectId(u_id)},
            {'$set': {
                "password": bcrypt.hashpw(password, bcrypt.gensalt())
            }}
        )

        if result.matched_count == 1:
            edit_user_link = 'http://127.0.0.1:5000/api/v1/users/' + u_id
            return make_response(jsonify({'message': 'Password Updated', 'url': edit_user_link}), 201)
        else:
            return make_response(jsonify({'error': 'Invalid User ID'}), 404)
    else:
        return make_response(jsonify({"error": "Missing form data"}), 404)


# tested
# delete a user
@app.route("/api/v1/users/<string:u_id>", methods=["DELETE"])  # needs testing
@valid_id
def delete_user(u_id):
    result = users.delete_one({'_id': ObjectId(u_id)})
    if result.deleted_count == 1:
        return make_response(jsonify({'message': 'Account deleted'}), 200)
    else:
        return make_response(jsonify({"error": "Invalid user ID"}), 404)


if __name__ == "__main__":
    app.run(debug=True)
