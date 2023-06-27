import argparse
import os

from flask import Flask, request
from flask import jsonify
from flask_cors import CORS
from evaluate import load

from dummy_server.router.routes import add_routes
from ..modules.inference import infer_t5, infer_t5_local, gpt_2, gpt_3

import spacy
nlp = spacy.load("en_core_web_sm", disable=["tagger", "parser"])
import en_core_web_sm


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
        if (requestedModel=='Flan-T5'):
            output = infer_t5({"inputs": requestedQuestion, 
                            "options": {"wait_for_model": True}
                            })
        elif (requestedModel=='Flan-T5-local'):
            output = infer_t5_local(requestedQuestion)
        """""
        elif (requestedModel=='model3'):
            output = gpt_2({"inputs": requestedQuestion, 
                            "parameters": {"max_new_tokens": 100},
                            "options": {"wait_for_model": True}
                            })
        elif (requestedModel=='gpt3'):
            output = gpt_3(requestedQuestion)
        """
        return jsonify({'output': output})
    
    @app.route('/bert_score', methods=['POST', 'GET'])
    def bert_score(): #local right now
        bertscore = load("bertscore")
        index = request.json['index']
        predictions = request.json['predictions']
        references = request.json['references']
        results = bertscore.compute(predictions=predictions, references=references, lang="en")
        return jsonify({'score': results['f1'], 'index': index})
    
    @app.route('/spaCy', methods=['POST', 'GET'])
    def find_entity(): #local right now
        nlp = en_core_web_sm.load()
        prediction = request.json['prediction']
        reference = request.json['reference']
        print("hi")
        entities_pred = [(entity.text, entity.label_) for entity in nlp(prediction).ents]
        entities_ref = [(entity.text, entity.label_) for entity in nlp(reference).ents]
        response = True
        if len(entities_pred) == 0 or len(entities_ref) == 0:
            response = False
        elif len(entities_pred) != len(entities_ref):
            response = False
        else:
            for i in range(min(len(entities_pred), len(entities_ref))):
                if entities_pred[i][0] != entities_ref[i][0]: # Access the text attribute using index 0
                    response = False
                    break
        return jsonify({'response': response})

    @app.route('/classify_error', methods=['POST', 'GET'])
    def classify_error(): #local right now
        prompt = request.json['prompt']
        answer = gpt_3(prompt)
        print(prompt + answer)
        error = define_answer(answer.lower())
        return jsonify({'reply': error})

    def define_answer(gpt_response):
        if (("9" in gpt_response) or ("no error" in gpt_response) or ("question is correct" in gpt_response)):
            return  {"value": 'correct', "label": 'Correct' }
        elif (("1" in gpt_response) or ("incomplete question generation" in gpt_response) or ("syntax error" in gpt_response)):
            return { "value": 'incomplete_question', "label": 'Incomplete Question Generation / Syntax Error' }
        elif (("2" in gpt_response) or ("irrelevant question generation: asking for already provided information" in gpt_response) or ("asking for already provided information" in gpt_response) or ("irrelevant question generation - asking for already provided information" in gpt_response)):
            return { "value": 'information_given', "label": 'Irrelevant Question Generation: Asking for already provided information' }
        elif (("3" in gpt_response) or ("irrelevant question generation: doesn\’t relate to the expected answer" in gpt_response) or ("doesn\’t relate to the expected answer" in gpt_response) or ("irrelevant question generation - doesn\’t relate to the expected answer" in gpt_response) or ("expected answer" in gpt_response)):
            return { "value": 'unnecessary_question', "label": 'Irrelevant Question Generation: Doesn\'t relate to the expected answer' }
        elif (("4" in gpt_response) or ("incorrect specificity emphasis: over-emphasis" in gpt_response) or ("over-emphasis" in gpt_response)):
            return { "value": 'incorrect_specificity_overemphasis', "label": 'Incorrect Specificity Emphasis: Over-Emphasis' }
        elif (("5" in gpt_response) or ("incorrect specificity emphasis: under-emphasis" in gpt_response) or ("under-emphasis" in gpt_response)):
            return { "value": 'incorrect_specificity_underemphasis', "label": 'Incorrect Specificity Emphasis: Under-Emphasis' }
        elif (("6" in gpt_response) or ("incorrect ordering of questions" in gpt_response)):
            return { "value": 'wrong_order', "label": 'Incorrect Ordering of Questions' }
        elif (("7" in gpt_response) or ("missing relevant question" in gpt_response)):
            return { "value": 'question_missing', "label": 'Missing Relevant Question' }
        elif (("8" in gpt_response) or ("missing calculation step" in gpt_response)):
            return { "value": 'missing_calculation', "label": 'Missing Calculation Step' },
        else:
            return  {"value": 'correct', "label": 'Correct' }

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
