import OutputRowComponent from './OutputRow';
import './Header.css';
import { useState } from 'react';

type OutputComponentProp = {
  outputResult: (outputValue: string[][]) => void,
  numberQuestions: number, 
  backendResponse: string[][],
  expectedAnswer: string[],
  questions_asked: string[]
}

function OutputComponent(props: OutputComponentProp){
  
  const [outputResult, setOutputResult] = useState<string[][]>([]);

  const handleRowOutput = (outputValue: string[], key: string, question_index: string, subquestion: string) => {
    var updatedOutput = [...outputResult, [key].concat(question_index, subquestion, outputValue)];
    
    //have to sort because it happens sometimes that the questions are unsorted
    updatedOutput.sort((a, b) => parseInt(a[0]) - parseInt(b[0])); 
    props.outputResult(updatedOutput);
    setOutputResult(updatedOutput);
    console.log("outputResult: " + outputResult);
  }

  const rows = [];  
  for (let i = 0; i < props.numberQuestions; i++) {
    if (typeof(props.backendResponse[i]) !== 'undefined') { // doesn't really fix the issue
      for (let j = 0; j < props.backendResponse[i].length; j++){
        if (props.backendResponse[i][j] === ""){
          continue;
        }
        rows.push(
          <OutputRowComponent 
            outputResult={handleRowOutput} 
            key={i} 
            question_index={i+1} 
            subquestion_index={j+1}
            backendResponse={props.backendResponse[i][j]}
            expectedAnswer={props.expectedAnswer.length-i > 0 ? props.expectedAnswer[i] : ""}
            question_asked={props.questions_asked[i]}
          />);
      }
    }   
  }

  return (
    <div>
      <h2>4. Output</h2> 
      {rows}
    </div>
  );
}
export default OutputComponent;