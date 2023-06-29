import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import TextareaAutosize from '@mui/base/TextareaAutosize';
import './Select.css';
import correct from '../correct_symbol.png';
import wrong from '../wrong_symbol.png';

const error_classes = [
  { value: 'incomplete_question', label: 'Incomplete Question Generation / Syntax Error' },
  { value: 'information_given', label: 'Irrelevant Question Generation: Asking for already provided information' },
  { value: 'unnecessary_question', label: 'Irrelevant Question Generation: Doesn\'t relate to the expected answer' }, 
  { value: 'incorrect_specificity_overemphasis', label: 'Incorrect Specificity Emphasis: Over-Emphasis' },
  { value: 'incorrect_specificity_underemphasis', label: 'Incorrect Specificity Emphasis: Under-Emphasis' },
  { value: 'wrong_order', label: 'Incorrect Ordering of Questions' }, 
  { value: 'missing_calculation', label: 'Missing Calculation Step' }, 
  { value: 'question_missing', label: 'Missing Relevant Question' },
  { value: 'other_error', label: 'Another Error (please specify)' },
];

type OutputComponentProp = {
  outputResult: (outputValue: string[], key: [number, number], subquestion: string, errorText: string) => void,
  key: string, 
  question_index: number, 
  subquestion_index: number,
  subquestion: string,
  expectedAnswer: string[],
  question_asked: string,
  bert_score: number
}

function OutputRowComponent(props: OutputComponentProp) {
  const [selectedOption, setSelectedOption] = useState(null); //stores the selected option in case the output is wrong
  const [transCorrect, setTransCorrect] = useState(1); //defines the opacity of the correct symbol
  const [transWrong, setTransWrong] = useState(1); //defines the opacity of the wrong symbol
  const [specifyError, setSpecifyError] = useState(false); //needed for the case, when the user wants to define a new error class
  const [alreadyRun, setAlreadyRun] = useState(false); //such that useEffect doesn't run everytime the row is loaded

  const expected_subquestion = (props.expectedAnswer.length > props.subquestion_index) ? props.expectedAnswer[props.subquestion_index] : props.expectedAnswer[props.expectedAnswer.length-1]
  
  // using the test results from the analysis of Laura's Bachelor Thesis
  useEffect(() => {
    if(alreadyRun === true){
      console.log("already run")
      return
    }
    if (props.expectedAnswer[0] !== ""){
      correctOrWrong()
    }
  }, []) // Empty array as the second argument means the effect runs only once    

  async function correctOrWrong() {
    const question_stripped = props.subquestion.trim();
    console.log("question_stripped", question_stripped)
    const expected_stripped = props.expectedAnswer[props.subquestion_index-1].trim();
    var error = {value: 'dummy', label: 'Dummy'}
    if(props.subquestion === "nothing"){
      error = { value: 'question_missing', label: 'Missing Relevant Question' }
    }
    else if (props.bert_score > 0.995){
      error = {value: 'correct', label: 'Correct' }
    } else if ((question_stripped.split(/\s+/).length < 5) || (expected_stripped.startsWith(question_stripped.slice(0, -1)))){
      error = { value: 'incomplete_question', label: 'Incomplete Question Generation / Syntax Error' }
    } else if (props.bert_score < 0.8925){
      error = await classify_error() // ask ChatGPT for error
    } else { //can't really say anything about the results
        if (props.bert_score > 0.9670) {
          const matching = await entities_matching();
          const generated_numbers = findNumbers(question_stripped);
          const expected_numbers = findNumbers(expected_stripped);
          if ((matching === true) && (generated_numbers === expected_numbers)){
            error = {"value": 'correct', "label": 'Correct' }
          }else {
            error = await classify_error()
            console.log(error)
          }
        }else {
          error = await classify_error()
        }
    }
    if (error.value === 'correct'){
      handleCorrectClick()
    }else{
      handleWrongClick()
      handleSelectChange(error)
    }
    setAlreadyRun(true)
  }

  function findNumbers(s: String) {
    const numbers = s.match(/\d+/g);
    return numbers;
  } 
  
async function entities_matching(){
  try {
    const response = await fetch("http://127.0.0.1:8000/spaCy", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      //check if it's not an empty array
      body: JSON.stringify({
        prediction: props.subquestion,
        reference: expected_subquestion
      })
    });

    if (!response.ok) {
      throw new Error('Request failed');
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error(error);
    return false;
  }
}

async function classify_error(): Promise<{ value: string; label: string; }>{
  const prompt = 'You are a highly intelligent question verifier bot and your job is to identify the differences, if there are any, in the 2 questions. You are provided with error classes. \n\n' + 
  
  'The questions are:\n' + 
  'Generated: ' + props.subquestion + 
  '\nExpected: ' + props.expectedAnswer + 

  '\n\nThe generated question is sub-question ' +  props.subquestion_index + ' of the generated sub-question stream.\n' +

  '\n\nYour options are:\n' + 
  '1. incomplete question generation / syntax error: the generated question is incomplete and does not form a grammatically correct sentence\n' +
  '2. irrelevant question generation: asking for already provided information\n' +
  '3. irrelevant question generation: doesn\’t relate to the expected answer\n' +
  '4. incorrect specificity emphasis: over-emphasis\n' +
  '5. incorrect specificity emphasis: under-emphasis\n' + 
  '6. incorrect ordering of questions: the generated question is not in the correct order relative to other questions or steps in the problem-solving process\n' +
  '7. missing calculation step\n' +
  '8. no error, question is correct\n\n' +
  
  'The questions are related to the following multi-step reasoning problem:\n' + props.question_asked + 
  
  '\nJust provide your answer without explanation' 

  try {
    const response = await fetch("http://127.0.0.1:8000/classify_error", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      //check if it's not an empty array
      body: JSON.stringify({
        prompt: prompt
      })
    });

    if (!response.ok) {
      throw new Error('Request failed');
    }
    const data = await response.json();
    return { value: data.reply.value, label: data.reply.label };
  } catch (error) {
    console.error(error);
    throw error
  }
}


  const handleWrongClick = () => {
    setTransCorrect(transCorrect === 1 ? transCorrect ^ 1: 0); 
    setTransWrong(1); //wrong symbol has full opacity
    props.outputResult(["false", ""], [(props.question_index-1), (props.subquestion_index-1)], props.subquestion, "");
  };

  const handleCorrectClick = () => {
    setTransWrong(transWrong === 1 ? transWrong ^ 1: 0); 
    setTransCorrect(1); //correct symbol has full opacity
    props.outputResult(["true", ""], [(props.question_index-1), (props.subquestion_index-1)], props.subquestion, "");
  };

  const handleSelectChange = (selectedOption: any) => {
    setSelectedOption(selectedOption);
    setSpecifyError(true)
    if (selectedOption.value === 'other_error'){
      setSpecifyError(true);
    } else {
      setSpecifyError(false);
    }
    props.outputResult(["false", selectedOption.label], [(props.question_index-1), (props.subquestion_index-1)], props.subquestion, "") 
  };

  const handleSpecificError = (error: string, selectedOption: any) => {
    props.outputResult(["false", selectedOption.label], [(props.question_index-1), (props.subquestion_index-1)], props.subquestion, error)
  }

  return (
    <div>
      <div className="TextBox">
        <div style={{ fontWeight: 'bold' }}>
            {'Answer to question ' + props.question_index + ':'}<br/>
        </div>
        <div style={{whiteSpace: "pre-line"}}>
          {props.question_asked}<br/><br/>
          {props.subquestion}
        </div>
      </div>
      {props.expectedAnswer[0] !== "" ?  (
        <div className="TextBox">
          <div style={{whiteSpace: "pre-line"}}>
            {'Expected answer:\n ' + props.expectedAnswer}
            {'\nBert score: ' + props.bert_score}
          </div>
        </div>
      ): null
      }
      
      <div className="CorrectWrong">
        <div className="symbols">
            <img src={correct} alt="Correct Symbol" style={{width: '50px', opacity: transCorrect === 1 ? 1 : 0.5}} onClick={handleCorrectClick} />
            <img src={wrong} alt="Wrong Symbol" style={{width: '50px', opacity: transWrong === 1 ? 1 : 0.5}} onClick={handleWrongClick} />
        </div>
        {transCorrect===0 && (
          <Select className="select" options={error_classes} value={selectedOption} onChange={handleSelectChange} />
        )}
        {specifyError && <SpecifyErrorText specificError={handleSpecificError} selectedoption={selectedOption}/>}
      </div>
    </div>
  );
}

export default OutputRowComponent;

//if the user wants to specify the error
type SpecifyErrorTextProps = {
  specificError: (error: string, selectedOption: any) => void;
  selectedoption: any;
}

class SpecifyErrorText extends React.Component<SpecifyErrorTextProps, {error: string, text: string}> {
  constructor(props: SpecifyErrorTextProps) {
    super(props);
    this.state = { error: '' , text: "Submit"};
  }

  handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    this.setState({text: "Submitted"});
    this.props.specificError(this.state.error, this.props.selectedoption);
  }

  handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    this.setState({ error: event.target.value });
  };

  render() {
    return (
      <div className="InputTextBox">
        <form onSubmit={this.handleSubmit} style={{textAlign: 'center'}}>
          <TextareaAutosize 
              className='textarea'
              placeholder="Please specify..."
              value={this.state.error}
              onChange={this.handleInputChange}
              minRows={3} 
              style={{width:'400px', marginLeft: '5px'}}
              onResize={undefined} onResizeCapture={undefined}/><br/>
          <button id="submit_button" type="submit">{this.state.text}</button>
        </form>
      </div>
    );
  }
}