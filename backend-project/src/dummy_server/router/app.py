import argparse
import os
import requests
import json

from flask import Flask, request
from flask import jsonify
from flask_cors import CORS

from dummy_server.router.routes import add_routes
from ..modules.inference import infer_t5, infer_t5_local, gpt_2


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
        requestedModel = request.json['model']
        requestedQuestion = request.json['questions']

        output = ['']
        if (requestedModel=='model1'):
            output = infer_t5({"inputs": requestedQuestion, 
                            "options": {"wait_for_model": True}
                            })
            print(output)
        elif (requestedModel=='model2'):
            output = infer_t5_local(requestedQuestion)
            print(output)
        elif (requestedModel=='model3'):
            output = gpt_2({"inputs": requestedQuestion, 
                            "parameters": {"max_new_tokens": 100},
                            "options": {"wait_for_model": True}
                            })
        
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
