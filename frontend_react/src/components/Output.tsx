import OutputRowComponent from './OutputRow';
import './Header.css';
import { useRef} from 'react';

type OutputComponentProp = {
  outputResult: (outputValue: string[][]) => void,
  numberQuestions: number, 
  backendResponse: string[][],
  expectedAnswer: string[][],
  questions_asked: string[],
  bert_score: number[][]
}

function OutputComponent(props: OutputComponentProp){
  
  const outputResult= useRef<string[][]>([]);

  const handleRowOutput = (outputValue: string[], key: [number, number], subquestion: string, errorText: string) => {
    var updatedOutput = [...outputResult.current, [key[0].toString()].concat(key[1].toString(), subquestion, props.expectedAnswer[key[0]].map((string) => string.replace(/,/g, "")).join(" "), outputValue, errorText)];
    
    //have to sort because it happens sometimes that the questions are unsorted
    //PROBABLY CAN REMOVE IT HERE
    updatedOutput.sort((a, b) => {
      if (parseInt(a[0]) === parseInt(b[0])) {
        return parseInt(a[1]) - parseInt(b[1]);
      }
      return parseInt(a[0]) - parseInt(b[0]);
    });
    props.outputResult(updatedOutput);
    outputResult.current = updatedOutput;
  }

  const rows = [];  
  for (let i = 0; i < props.numberQuestions; i++) {
    if (typeof(props.backendResponse[i]) !== 'undefined') { 
      for (let j = 0; j < props.backendResponse[i].length; j++){
        if ((props.backendResponse[i][j] === "") || (props.backendResponse[i][j] === "nothing" )){
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
            bert_score={props.bert_score[i][j]}
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