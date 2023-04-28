import OutputRowComponent from './OutputRow';
import './Header.css';
import { useState } from 'react';

type OutputComponentProp = {
  outputResult: (outputValue: string[][]) => void,
  numberQuestions: number, 
  backendResponse: string[],
  expectedAnswer: string[]
}

function OutputComponent(props: OutputComponentProp){
  
  const [outputResult, setOutputResult] = useState<string[][]>([]);

  const handleRowOutput = (outputValue: string[], key: string) => {
    var updatedOutput = [...outputResult, [key].concat(outputValue)];
    updatedOutput.sort((a, b) => parseInt(a[0]) - parseInt(b[0]));
    props.outputResult(updatedOutput);
    setOutputResult(updatedOutput);
    console.log("outputResult: " + outputResult);
  }

  const rows = [];  
  for (let i = 0; i < props.numberQuestions; i++) {
      rows.push(
        <OutputRowComponent 
          outputResult={handleRowOutput} 
          key={i} 
          question_index={i+1} 
          backendResponse={props.backendResponse[i]} //because first entry is just an empty string (?)
          expectedAnswer={props.expectedAnswer.length-i > 0 ? props.expectedAnswer[i] : ""}
        />);
  }

  return (
    <div>
      <h2>4. Output</h2> 
      {rows}
    </div>
  );
}
export default OutputComponent;