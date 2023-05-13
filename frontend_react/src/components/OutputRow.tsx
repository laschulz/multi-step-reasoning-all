import React, { useState } from 'react';
import Select from 'react-select';
import TextareaAutosize from '@mui/base/TextareaAutosize';
import './Select.css';
import correct from '../correct_symbol.png';
import wrong from '../wrong_symbol.png';

const error_classes = [
  { value: 'wrong_order', label: 'Wrong order' }, //what should the right order be (maybe just provide the numbers?)
  { value: 'wrong_question', label: 'Wrong question asked' },  //provide the question that should have been asked and instead
  { value: 'unnecessary_question', label: 'Question asked is unnecessary' }, 
  { value: 'question_missing', label: 'Question missing' },
  { value: 'incomplete_question', label: 'Question is incomplete' },
  { value: 'other_error', label: 'Another Error (please specify)' },
];

type OutputComponentProp = {
  outputResult: (outputValue: string[], key: string, question_index: string, subquestion: string) => void,
  question_index: number, 
  subquestion_index: number
  backendResponse: string,
  expectedAnswer: string, //not doing anything so far with this
  question_asked: string
}

function OutputRowComponent(props: OutputComponentProp) {
  const [selectedOption, setSelectedOption] = useState(null); //stores the selected option in case the output is wrong
  const [transCorrect, setTransCorrect] = useState(1); //defines the opacity of the correct symbol
  const [transWrong, setTransWrong] = useState(1); //defines the opacity of the wrong symbol
  const [specifyError, setSpecifyError] = useState(false); //needed for the case, when the user wants to define a new error class

  const handleWrongClick = () => {
    setTransCorrect(transCorrect === 1 ? transCorrect ^ 1: 0); 
    setTransWrong(1); //wrong symbol has full opacity
    props.outputResult(["false", ""], (props.subquestion_index-1).toString(), (props.question_index-1).toString(), props.backendResponse);
  };

  const handleCorrectClick = () => {
    setTransWrong(transWrong === 1 ? transWrong ^ 1: 0); 
    setTransCorrect(1); //correct symbol has full opacity
    props.outputResult(["true", ""], (props.subquestion_index-1).toString(), (props.question_index-1).toString(), props.backendResponse);
  };

  const handleSelectChange = (selectedOption: any) => {
    setSelectedOption(selectedOption);
    setSpecifyError(true)
    /*if (selectedOption.value === 'other_error'){
      setSpecifyError(true);
    } else {
      setSpecifyError(false);
    }*/
    props.outputResult(["false", selectedOption.label], (props.subquestion_index-1).toString(), (props.question_index-1).toString(), props.backendResponse) //returning the output to the parent
  };

  return (
    <div>
      <div className="TextBox">
        <div style={{ fontWeight: 'bold' }}>
            {'Answer to question ' + props.question_index + ':'}<br/>
        </div>
        <div style={{whiteSpace: "pre-line"}}>
          {props.question_asked}<br/><br/>
          {props.backendResponse + "?"}
        </div>
      </div>
      <div className="CorrectWrong">
        <div className="symbols">
            <img src={correct} alt="Correct Symbol" style={{width: '50px', opacity: transCorrect === 1 ? 1 : 0.5}} onClick={handleCorrectClick} />
            <img src={wrong} alt="Wrong Symbol" style={{width: '50px', opacity: transWrong === 1 ? 1 : 0.5}} onClick={handleWrongClick} />
        </div>
        {transCorrect===0 && (
          <Select className="select" options={error_classes} value={selectedOption} onChange={handleSelectChange} />
        )}
        {specifyError && <SpecifyErrorText />}
      </div>
    </div>
  );
}

export default OutputRowComponent;

//if the user wants to specify a new error class
class SpecifyErrorText extends React.Component<{}, { error: string, text: string}> {
  constructor(props: {}) {
    super(props);
    this.state = { error: '' , text: "Submit"};
  }

  handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log(this.state.error);
    this.setState({text: "Submitted"})
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
              placeholder="Please specify the error"
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