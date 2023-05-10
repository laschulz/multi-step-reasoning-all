import json
import requests
from transformers import T5Tokenizer, T5ForConditionalGeneration

API_URL = "https://api-inference.huggingface.co/models/"
API_TOKEN = "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" #might come from the backend
headers = {"Authorization": f"Bearer {API_TOKEN}"}

def infer_t5(input_array):
    response = requests.post(get_URL("laschulz/t5-large"), headers=headers, json=input_array)
    response_json = response.json()
    print(response_json)
    response_json2 = list(map(lambda o: o['generated_text'], response_json))
    return response_json2

#running T5 locally -> kinda shit
def infer_t5_local(input_array): 
    tokenizer = T5Tokenizer.from_pretrained("laschulz/t5-large")
    model = T5ForConditionalGeneration.from_pretrained("laschulz/t5-large")
    inputs = tokenizer([input for input in input_array], return_tensors="pt", padding=True)
    output_sequence = model.generate(
        input_ids=inputs["input_ids"],
        attention_mask=inputs["attention_mask"],
        do_sample=False,  # disable sampling to test if batching affects output
    )
    return tokenizer.batch_decode(output_sequence, skip_special_tokens=True)
#end 

def gpt_2(input_array):
    response = requests.post(get_URL("gpt2-large"), headers=headers, json=input_array)
    response_json = response.json()[0]
    print(response_json)
    response_json2 = list(map(lambda o: o['generated_text'], response_json))
    return response_json2

def get_URL(model_name):
    return API_URL + model_name