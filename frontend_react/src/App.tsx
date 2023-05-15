import {useState } from 'react';
import './App.css';
import SelectModelComponent from './components/SelectModel';
import HeaderComponent from './components/Header';
import SelectQuestionComponent from './components/SelectQuestion';
import OutputComponent from './components/Output';
import LoadingSpinner from './components/LoadingSpinner'

const backend = "http://127.0.0.1:8000/models"

let csvRows: string[][] = [];

function App() {
  const [showDiv, setShowDiv] = useState(false);
  const [model, setModel] = useState(''); //stores the selected model
  const [questions, setQuestions] = useState<string[]>([]); //stores the selected questions
  const [expectedAnswer, setExpectedAnswer] = useState<string[]>([]);
  const [backendStuff, setbackendStuff] = useState({ //using this for the backend connection, maybe can simplify this later
    output: [[]]
});
  const [isLoading, setIsLoading] = useState(false);

//all handle functions (sorted alphabetically)
const handleDownload = () => {
  const csvContent = "data:text/csv;charset=utf-8," + ["Index", "Model", "Question", "generated Subquestion", "True/False", "Error Type (if applicable)"].join(",") + "\r\n" + csvRows.map(row => row.join(",")).join("\r\n");
  const encodedUri = encodeURI(csvContent);
  var link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "results.csv");
  document.body.appendChild(link); // Required for FF
  link.click(); // This will download the data file named "results.csv".
}
const handleModel = (modelValue: string) => {
  setModel(modelValue);
}
const handleQuestion = (questionValue: string[], expectedAnswer: string[]) => {
  setQuestions(questionValue);
  setExpectedAnswer(expectedAnswer);
}
const handleOutput = (outputValue: string[][]) => {
  csvRows = [];
  var counter = 0;
  for (let i = 0; i < outputValue.length; i++) {
    if (i<outputValue.length-1){
      if (outputValue[i][0] === outputValue[i+1][0] && outputValue[i][1] === outputValue[i+1][1]){
        continue;
      }
    }
    var rowArray = outputValue[i];
    console.log("rowArray is: " + rowArray);

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
    var row = [counter.toString(), model, q, subquestion, ...rowArray.slice(3)];
    counter++;

    console.log("row is: "+ i);
    csvRows.push(row)
  }
}
const handleRefresh = () => {
  window.location.reload(); //TODO: might have to work on that to make it smarter
};

//communicate with API
const handleRunModel = () => {
  setIsLoading(true);
  fetch(backend, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json' //might has to be adjusted
  },
  body: JSON.stringify({
    model: model,
    questions: questions
  })
})
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();})
  .then(data => {
    setIsLoading(false);
    console.log("data.output is: " + data.output);
    setbackendStuff({
      output: splitOutput(data.output)
    });
    console.log(typeof(backendStuff))
  })
  .catch(error => {console.error(error); throw error});
    
  setShowDiv(true);
};

function splitOutput (arr: string[]){
  var o = Array(arr.length);
  for (let i=0; i < arr.length; i++){
    if (o[i] === ''){
      o[i] = ["empty"] //maybe not needed
    }else{
      o[i] = arr[i].split('?');
    }
  }
  return o;
}

  return (
    <div className='wrapper'>
      <HeaderComponent/>
      <header className="App-header"> Multi-step Reasoning Interface </header>
      <div className='App'>
          <div style={{textAlign: 'right'}}>
            <button id="download-log">Download all Interactions</button><br/>
            <button id="reset" onClick={handleRefresh}>Reset</button>
          </div>

          <SelectModelComponent selectModel={handleModel}/><br/>
          
          <SelectQuestionComponent questionAnswer={handleQuestion}/><br/>

          <h2>3. Run Model</h2>
          <div className='TextBox'><p>{"Please note that the first run of a model can take longer as the model has to be loaded first. If you don\'t receive an answer, click \"Run Model\" again."}</p></div>
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
                numberQuestions={questions.length > 1 ? questions.length-1 : questions.length} 
                backendResponse={questions.length > 1 ? backendStuff.output.slice(1) : backendStuff.output} 
                expectedAnswer={questions.length > 1 ? expectedAnswer.slice(1): expectedAnswer} 
                questions_asked={questions.length > 1 ? questions.slice(1) : questions}
              /><br/>

              <h2>5. Download as .csv File</h2>
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