import React, { useEffect, useState, useRef } from 'react';
import Select from 'react-select';
import TextareaAutosize from '@mui/base/TextareaAutosize';
import './Select.css';
import correct from '../correct_symbol.png';
import wrong from '../wrong_symbol.png';

const error_classes = [
  { value: 'wrong_order', label: 'Wrong order' }, 
  { value: 'wrong_question', label: 'Wrong question' }, 
  { value: 'information_given', label: 'Wrong question: Asks for information already specified in the text' },
  { value: 'unnecessary_question', label: 'Wrong question: Doesn\'t relate to the main question' }, 
  { value: 'question_missing', label: 'Question missing' },
  { value: 'incomplete_question', label: 'Question is incomplete' },
  { value: 'other_error', label: 'Another Error (please specify)' },
];

const backend = "http://127.0.0.1:8000/bert_score"

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

  useEffect(() => {
    if (props.bert_score > 0.95){
      handleCorrectClick();
    } else {
      handleWrongClick();
    }
  }, []) // Empty array as the second argument means the effect runs only once    

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
    /*if (selectedOption.value === 'other_error'){
      setSpecifyError(true);
    } else {
      setSpecifyError(false);
    }*/
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
      {props.expectedAnswer[0] != "" ?  (
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