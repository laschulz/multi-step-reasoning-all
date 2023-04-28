import argparse
import os
import requests
import json

from flask import Flask, request
from flask import jsonify
from flask_cors import CORS

from dummy_server.router.routes import add_routes
from ..modules.inference import infer_t5


API_URL = "https://api-inference.huggingface.co/models/t5-small"
API_TOKEN = "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"
headers = {"Authorization": f"Bearer " + API_TOKEN}

def create_app():
    app = Flask(__name__)  # static_url_path, static_folder, template_folder...
    CORS(app, resources={r"/*": {"origins": "*"}})
    add_routes(app)

    @app.route('/version')
    def version():
        return f"Job ID: {os.environ['JOB_ID']}\nCommit ID: {os.environ['COMMIT_ID']}"

    @app.route('/models', methods=['POST', 'GET'])
    def models():
        model_options = { #probably won't need this
            'Model1': 'model1_backend',
            'Model2': 'model2_backend',
            'Model3': 'model3_backend'
        }
        requestedModel = request.json['model']
        requestedQuestion = request.json['questions']

        #dummy stuff for the moment, connect to hugging face here later
        output = ['this is a working dummy_string']
        if (requestedModel=='model1'):
            output = infer_t5(requestedQuestion) 
        elif (requestedModel=='model2'):
            output = ['requested model: Model2 ']
        elif (requestedModel=='model3'):
            output = ['requested model: Model3 ']
        #end of dummy stuff

        return jsonify({'output': output})
    
    def models2():
        model_options = { #probably won't need this
            'Model1': 'model1_backend',
            'Model2': 'model2_backend',
            'Model3': 'model3_backend'
        }
        requestedModel = request.json['model']
        requestedQuestion = request.json['question']
        print(requestedQuestion)

        #dummy stuff for the moment, connect to hugging face here later
        output = ['this is a working dummy_string']
        if (requestedModel=='model1'):
            output = infer_t5(requestedQuestion) 
        elif (requestedModel=='model2'):
            output = ['requested model: Model2 ']
        elif (requestedModel=='model3'):
            output = ['requested model: Model3 ']
        #end of dummy stuff

        return jsonify({'output': output})
    
    return app


def start_server():
    parser = argparse.ArgumentParser()

    # API flag
    parser.add_argument(
        "--host",
        default="127.0.0.1",
        help="The host to run the server",
    )
    parser.add_argument(
        "--port",
        default=8000,
        help="The port to run the server",
    )
    parser.add_argument(
        "--debug",
        action="store_true",
        help="Run Flask in debug mode",
    )

    args = parser.parse_args()

    server_app = create_app()

    server_app.run(debug=args.debug, host=args.host, port=args.port)


if __name__ == "__main__":
    start_server()
