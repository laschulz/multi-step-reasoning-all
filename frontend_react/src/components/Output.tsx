import OutputRowComponent from './OutputRow';
import './Header.css';
import { useState } from 'react';

type OutputComponentProp = {
  outputResult: (outputValue: string[][]) => void,
  numberQuestions: number, 
  backendResponse: string[][],
  expectedAnswer: string[][],
  questions_asked: string[]
}

function OutputComponent(props: OutputComponentProp){
  
  const [outputResult, setOutputResult] = useState<string[][]>([]);

  const handleRowOutput = (outputValue: string[], key: [number, number], subquestion: string, errorText: string) => {
    var updatedOutput = [...outputResult, [key[0].toString()].concat(key[1].toString(), subquestion, outputValue, errorText)];
    
    //have to sort because it happens sometimes that the questions are unsorted
    updatedOutput.sort((a, b) => {
      if (parseInt(a[0]) === parseInt(b[0])) {
        return parseInt(a[1]) - parseInt(b[1]);
      }
      return parseInt(a[0]) - parseInt(b[0]);
    });
    props.outputResult(updatedOutput);
    setOutputResult(updatedOutput);
  }

  const rows = [];  
  for (let i = 0; i < props.numberQuestions; i++) {
    if (typeof(props.backendResponse[i]) !== 'undefined') { 
      for (let j = 0; j < props.backendResponse[i].length; j++){
        if (props.backendResponse[i][j] === ""){
          continue;
        }
        rows.push(
          <OutputRowComponent 
            outputResult={handleRowOutput} 
            key={`${i}-${j}`} 
            question_index={i+1} 
            subquestion_index={j+1}
            subquestion={props.backendResponse[i][j]}
            expectedAnswer={props.expectedAnswer.length-i > 0 ? props.expectedAnswer[i] : [""]}
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