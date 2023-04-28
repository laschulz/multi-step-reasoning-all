import {useState } from 'react';
import './App.css';
import SelectModelComponent from './components/SelectModel';
import HeaderComponent from './components/Header';
import SelectQuestionComponent from './components/SelectQuestion';
import OutputComponent from './components/Output';

const backend = "http://127.0.0.1:8000/models"

let csvRows: string[][] = [];

function App() {
  const [showDiv, setShowDiv] = useState(false);
  const [model, setModel] = useState(''); //stores the selected model
  const [questions, setQuestions] = useState<string[]>([]); //stores the selected questions
  const [expectedAnswer, setExpectedAnswer] = useState<string[]>([]);
  const [backendStuff, setbackendStuff] = useState({ //using this for the backend connection, maybe can simplify this later
    output: []
});

//all handle functions (sorted alphabetically)
const handleDownload = () => {
  const csvContent = "data:text/csv;charset=utf-8," + ["Index", "Question", "True/False", "Error Type (if applicable)"].join(",") + "\r\n" + csvRows.map(row => row.join(",")).join("\r\n");
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
  for (let i = 0; i < outputValue.length; i++) {
    if (i<outputValue.length-1){
      if (outputValue[i][0] === outputValue[i+1][0]){
        continue;
      }
    }
    const rowArray = outputValue[i];
    const index = rowArray[0]
    const row = [index, questions[parseInt(index)], ...rowArray.slice(1)];
    console.log("row is: "+ i);
    csvRows.push(row)
  }
}
const handleRefresh = () => {
  window.location.reload(); //TODO: might have to work on that to make it smarter
};

//communicate with API
const handleRunModel = () => {
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
    console.log(data);
    console.log(typeof(data.output))
    console.log("data.output is: " + data.output);
    setbackendStuff({
      output: data.output[0].translation_text
    });
  })
  .catch(error => {console.error(error); throw error});
    
  setShowDiv(true);
};

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
        <div className='center'>
          <button disabled={!model || !questions} onClick={handleRunModel}>Run Model</button>
        </div><br/>

        {showDiv ? (
          <div>
            <OutputComponent outputResult={handleOutput} numberQuestions={questions.length} backendResponse={backendStuff.output} expectedAnswer={expectedAnswer}/><br/>

            <h2>5. Download as .csv File</h2>
            <div className='center'>
              <button onClick={handleDownload}>Download</button>
            </div>
          </div>
        ) : null}

        
      </div>
    </div>
  );
}

export default App;