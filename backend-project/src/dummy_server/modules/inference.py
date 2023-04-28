import json
import requests
from transformers import T5Tokenizer, T5ForConditionalGeneration

model_name = "t5-small"

API_URL = "https://api-inference.huggingface.co/models/" + model_name
API_TOKEN = "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"
headers = {"Authorization": f"Bearer {API_TOKEN}"}

tokenizer = T5Tokenizer.from_pretrained(model_name)
model = T5ForConditionalGeneration.from_pretrained(model_name)

def infer_t5(input):
    response = requests.post(API_URL, headers=headers, json=input, params={"wait_for_model": True})
    response_json = response.json()
    return response_json

def infer_t5_3(input_array):
    data = tokenizer([input for input in input_array], return_tensors="pt", padding=True)
    response = requests.post(API_URL, headers=headers, data=data, params={"wait_for_model": True})
    outputs = json.loads(response.content.decode("utf-8"))
    return outputs

def infer_t5_2(input_array): #this works but not with the server of hugging face

    inputs = tokenizer([input for input in input_array], return_tensors="pt", padding=True)

    output_sequence = model.generate(
        input_ids=inputs["input_ids"],
        attention_mask=inputs["attention_mask"],
        do_sample=False,  # disable sampling to test if batching affects output
    )

    return tokenizer.batch_decode(output_sequence, skip_special_tokens=True)