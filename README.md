# Multi-Step Reasoning Evaluation Tool


## Project Description 
The Multi-Step Reasoning Evaluation Tool was created as part of the Bachelor's Thesis of Laura Schulz for the BSc Computer Science at ETH. It 
was developed to facilitate efficient error analysis. This online tool allows users to categorize and annotate errors on the fly. Additionally, it auto-evaluates the output of the model to assist the user or even replace a manual inspection. This tool will enable researchers to better understand the multi-step reasoning abilities of the LLMs and gather data to improve these models in the future. 

A detailed approach and the results can be found in the [Bachelor Thesis](./FINAL-Analysis_error_types_for_multi_step_reasoning_capabilities_of_LLMs.pdf)



### Datasets
GSM8K Dataset: https://github.com/openai/grade-school-math


- - -
## Folder Structure
Specify here the structure of you code and comment what the most important files contain

``` bash
├── README.md  
├── backend-project
│   ├── README.md
│   ├── setup.py   # main app
│   ├── pyproject.toml
│   ├── src
│   │   ├── dummy_server
│   │   │     ├── router
│   │   │     │    ├── routes.py
│   │   │     │    ├── app.py
│   │   │     │    └── __init__.py
│   │   │     └── resources
│   │   │         ├── scatter_data.py
│   │   │         └── __init__.py
│   │   └── __init__.py 
│   ├── data
│   │   ├── dataset_blobs.csv
│   │   ├── dataset_circles.csv
│   │   ├── dataset_moons.csv
│   │   └── generate_data.py    # script to create data
│   └── MANIFEST.in
├── react-frontend
│   ├── README.md
│   ├── package-lock.json
│   ├── package.json
│   ├── src
│   │   ├── App.css
│   │   ├── App.test.tsx
│   │   ├── App.tsx
│   │   ├── Visualization.tsx
│   │   ├── router
│   │   │   ├── resources
│   │   │   │   └── data.ts
│   │   │   └── apiClient.ts
│   │   ├── components
│   │   │   ├── utils.ts
│   │   │   ├── ScatterPlot.tsx
│   │   │   ├── DataChoice.tsx
│   │   │   └── ScatterPlot.css
│   │   ├── index.css
│   │   ├── index.tsx
│   │   ├── logo.svg
│   │   ├── react-app-env.d.ts
│   │   ├── reportWebVitals.ts
│   │   ├── setupTests.ts
│   │   └── types
│   │       ├── margin.ts
│   │       └── data.ts
│   ├── tsconfig.json
│   └── public
│        ├── robot.txt
│        ├── manifest.json
│        ├── logo512.png
│        ├── logo192.png
│        ├── index.html
│        └── favicon.ico
└── Dockerfile
```

## How to Run
To run the project you have to:
- clone the repository;
- open a new terminal instance;
- move to the folder where the project has been downloaded using the command ```cd```;
- open the folder called "dummy-fullstack-main";
To run the backend
- open the backend folder called "backend-project";
- create a virtual environment using the command ```conda create -n nameOfTheEnvironment```;
- activate the virtual environment run the command ```conda activate nameOfTheEnvironment```;
- install the requirements from the txt file using the command ```pip3 install -r requirements.txt```;
- start the backend with the command ```python3 setup.py run```;
To run the frontend
- open a new terminal instance and once again go to the folder called "dummy-fullstack-main"
- open the frontend folder called "react-frontend";
- start the front end by using the following two commands ```npm install```, ```npm start```;
If all the steps have been successfully executed a new browser window will open automatically.



