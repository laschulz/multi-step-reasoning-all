import {useRef, useState} from 'react';
import './App.css';
import SelectModelComponent from './components/SelectModel';
import HeaderComponent from './components/Header';
import SelectQuestionComponent from './components/SelectQuestion';
import OutputComponent from './components/Output';
import LoadingSpinner from './components/LoadingSpinner'

const backend = "http://127.0.0.1:8000/models"

function App() {
  const [showDiv, setShowDiv] = useState(false);
  const [model, setModel] = useState(''); //stores the selected model
  const [questions, setQuestions] = useState<string[]>([]); //stores the selected questions
  const [expectedAnswer, setExpectedAnswer] = useState<string[][]>([[]]);
  const [modelOutput, setModelOutput] = useState<string[][]>([[]]); //using this for the backend connection, maybe can simplify this later 
  const [isLoading, setIsLoading] = useState(false);
  const [bertScore, setBertScore] = useState<number[][]>([[]]);
  var counter = useRef<number>(0);
  const csvRows_dict = useRef<{[key: string]: any}>({});


//all handle functions (sorted alphabetically)

//handles the Download when Download button is clicked
const handleDownload = () => {
  //csvRows_dict.current = {}
  const finalRows = removeDuplicates();
  console.log("finalRows", finalRows);
  const csvContent = "data:text/csv;charset=utf-8," + ["Index", "Model", "Question", "generated Subquestion", "expected Subquestions", "True/False", "Error Type (if applicable)"].join(",") + "\r\n" + finalRows.map(row => row.join(",")).join("\r\n");
  const encodedUri = encodeURI(csvContent);
  var link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "results.csv");
  document.body.appendChild(link); // Required for FF
  link.click(); // This will download the data file named "results.csv".
}

//removes Duplicates in the csv File called in the handleDownload function
function removeDuplicates(){
  var finalRows = [];
  const sortedKeys = Object.keys(csvRows_dict.current).sort();
  for (const rowKey of sortedKeys){
    console.log(rowKey)
    var rowArray = csvRows_dict.current[rowKey];
    //Structure of rowArray: question_index, subquestion_index, true/false, error type, additional comments
    var q_index = rowArray[0];

    var q; //in general replace the commas because otherwise csv parsing gets messed up
    if (questions.length > 1){
      q = questions[parseInt(q_index)+1].replace(/,/g, ""); 
    }else{
      q = questions[parseInt(q_index)].replace(/,/g, ""); 
    } 
    var subquestion = rowArray[2].replace(/,/g, "");

    //Structure of output: unique index, model, input question, generated subquestion, true/false, error type, additional comments
    var row = [counter.current.toString(), model, q, subquestion,  ...rowArray.slice(3)];
    counter.current++;

    finalRows.push(row)
  }
  return finalRows;
}

//sets the model, used in the SelectModel Component
const handleModel = (modelValue: string) => {
  setModel(modelValue);
}
//sets the question, used in the SelectQuestion Component
const handleQuestion = (questionValue: string[], expectedAnswer: string[]) => {
  setQuestions(questionValue);
  var parsed_expectedAnswer = parser_expectedAnswer(expectedAnswer)
  setExpectedAnswer(parsed_expectedAnswer);
}

//parses the expected question correctly, used in handleQuestion function
//returns an array of array of questions
const parser_expectedAnswer = (expectedAnswer: string[]) => {
  if (expectedAnswer.length > 1){
    expectedAnswer = expectedAnswer.slice(1);
  }
  var parsed_expectedAnswer = Array(expectedAnswer.length);
  for (let i = 0; i < expectedAnswer.length; i++){
    var temp = expectedAnswer[i].split('\n');
    temp = temp.map(line => line.split('**')[0])
    if (temp[temp.length-1].includes('###')){ //to exclude the expected calculated answer and just keep the questions
      temp.pop()
    }
    parsed_expectedAnswer[i] = temp; 
  }
  return parsed_expectedAnswer;
}

//handles the Output Component, adds everything that is returned to csvRows (even if it's duplicated)
const handleOutput = (outputValue: string[][]) => {
  for (let i = 0; i < outputValue.length; i++){
    //Structure of rowArray: question_index, subquestion_index, true/false, error type, additional comments
    var current_row = outputValue[i];
    const question_index = current_row[0];
    const subquestion_index = current_row[1];
    csvRows_dict.current[`${question_index}-${subquestion_index}`] = current_row;
  }
}

//for the refresh button
//TODO: might have to work on that to make it smarter
const handleRefresh = () => {
  window.location.reload(); 
};

//communicate with API
async function handleRunModel(){
  setIsLoading(true);
  csvRows_dict.current = {}
  var split_output = await get_model_output();
  await compute_bert_score(split_output);
  setIsLoading(false);
  setShowDiv(true);
};

//get output from the model in backend
async function get_model_output(): Promise<string[][]> {
  try {
    const response = await fetch(backend, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        questions: questions
      })
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    counter.current = 0;
    const split_output = splitOutput(data.output);
    if (split_output.length > 1) {
      setModelOutput(split_output.slice(1));
      return split_output.slice(1);
    } else {
      setModelOutput(split_output);
      return split_output;
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function compute_bert_score(split_output: string[][]): Promise<void> {
  var bert_score = new Array(split_output.length).fill([]);
  for (let i = 0; i < split_output.length; i++) {
    if (expectedAnswer.length === 0 || expectedAnswer[i].length === 0){
      bert_score[i] = new Array(split_output[i].length).fill(0);
    }
    else {
      //making sure they have the same length
      var predictions = split_output[i];
      var references = expectedAnswer[i].slice(0, split_output[i].length);
      while (references.length < predictions.length){
        references.push(references[references.length-1])
      }
      //var predictions = split_output[i]
      //var references = expectedAnswer[i]
      try {
        const response = await fetch("http://127.0.0.1:8000/bert_score", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          //check if it's not an empty array
          body: JSON.stringify({ //making sure both arrays have the same length => so far, only comparing the same location, this doesn't cover all errors
            index: i,
            predictions: predictions, //ith-question, array
            references: references //ith-expectedAnswer, array 
          })
        });
  
        if (!response.ok) {
          throw new Error('Request failed');
        }
  
        const data = await response.json();
        const index = data.index;
        bert_score[index] = data.score;
      } catch (error) {
        console.error(error);
        // Handle the error state or display an error message to the user
      }
    }

  }
  setBertScore(bert_score);
}

//splits the output that is received from the backend by questions and returns an array of arrays of questions
function splitOutput (arr: string[]){
  var o = Array(arr.length);
  for (let i=0; i < arr.length; i++){
    o[i] = []
    const split_arr = arr[i].split('?');
    for (let entry in split_arr){
      const trimmed_entry = split_arr[entry].trim();
      if (trimmed_entry != ""){
        o[i].push(trimmed_entry + '?');
      }
    }
  }
  return o;
}

  return (
    <div className='wrapper'>
      <HeaderComponent/>
      <header className="App-header"> Multi-step Reasoning Evaluation Tool </header>
      <div className='App'>
          <div style={{textAlign: 'right'}}>
            <button id="reset" onClick={handleRefresh}>Reset</button>
          </div>

          <SelectModelComponent selectModel={handleModel}/><br/>
          
          <SelectQuestionComponent questionAnswer={handleQuestion}/><br/>

          <h2>3. Run Model</h2>
          <div className='TextBox'><p>{"Please note that the first run of a model can take longer as the model has to be loaded first. If you don't receive an answer, click \"Run Model\" again."}</p></div>
          <div className='center'>
            <button disabled={!model || !questions} onClick={handleRunModel}>Run Model</button>
          </div><br/>
          
        {isLoading ? <LoadingSpinner/> :
          (<div>
            {showDiv ? (
            <div>
              {/* have to do the distinction of the length of the questions array because if it's a csv file, the first row is always empty due to 
              the fact that it's the header row */}
              <OutputComponent 
                outputResult={handleOutput} 
                numberQuestions={questions.length > 1 ? questions.length-1 : questions.length} //replace this with modelOutput.length?
                backendResponse={modelOutput} 
                expectedAnswer={expectedAnswer} //it's already sliced correctly in the function parser_expectedAnswer
                questions_asked={questions.length > 1 ? questions.slice(1) : questions}
                bert_score = {bertScore}
              /><br/>

              <h2>5. Download results as CSV File</h2>
              <div className='center'>
                <button onClick={handleDownload}>Download</button>
              </div>
            </div>
          ) : null}
          </div>)}
        
      </div>
    </div>
  );
}

export default App;