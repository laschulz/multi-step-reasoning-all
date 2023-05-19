import Select from 'react-select';
import './Select.css';
import TextareaAutosize from '@mui/base/TextareaAutosize';
import { Component, useState } from 'react';
import Papa from 'papaparse';

const options= [
    {value: 'question1', label: 'Example Question: Tina\'s Salary'},
    {value: 'question2', label: 'Example Question: Cars in Parking Lot'},
    {value: 'write_own', label: 'Write your own question'},
    {value: 'csv', label: 'Upload .csv File'},
  ]

const question1_text = "Tina makes $18.00 an hour. If she works more than 8 hours per shift, she is eligible for overtime, which is paid by your hourly wage + 1/2 your hourly wage. If she works 10 hours every day for 5 days, how much money does she make?";
const question2_text = "If there are 3 cars in the parking lot and 2 more cars arrive, how many cars are in the parking lot?";
const question3_text = "this is the text for question 3";
 
// input is a predefined example question
function ExampleQuestion (props: any) {
  return(
    <div className='TextBox'>
      <p>{
        props.question === 'question1' ? question1_text : 
        props.question === 'question2' ? question2_text : 
        props.question === 'question3' ? question3_text : "ERROR"
      }</p>
    </div>
  );
}

// input is a user-inputed CSV file
type InputCSVComponentProp = {
  questionAnswer: (q: string[], a: string[]) => void,
}
function InputCSV(props: InputCSVComponentProp){
  const [fileName, setFileName] = useState('');
  const handleOnSubmitCSV = (event: any) => {
    const uploadedFile = event.target.files[0];
    setFileName(uploadedFile.name);
    Papa.parse(uploadedFile, {
      header: false,
      skipEmptyLines: true,
      complete: function (results: any) {
        const question_array = results.data.map(function(q: any, ) {return q[0];});
        const expectedAnswer_array = results.data.map(function(q:any, ) {return q[1];}); //use this to autocorrect
        props.questionAnswer(question_array, expectedAnswer_array);
      },
    });
  }
  
  return(
    <div>
      <div className={'TextBox'}>
        {"Please submit a file that fulfills the following requirements for the model to work properly: "}<br/>
        {"1. The first row is a header row."}<br/>
        {"2. The first column is for the questions."}<br/>
        {"3. The second column is for the expected answers. This information is optional. The expected answers should be formated such that the expected subquestion is before its calculation."}<br/><br/>
        {"Do not upload csv Files that exceed 100 rows as this might exceed the possible server load."}
      </div>
    
      <div style={{textAlign: 'center'}}>
        <label htmlFor='file-upload' className='custom-file-upload'>
          {fileName ? fileName + " uploaded" : 'Upload CSV'}
        </label>
        <input
          id='file-upload'
          type="file"
          accept=".csv"
          onChange={handleOnSubmitCSV}
          style={{display: 'none'}}
        />
      </div>
    </div>
    
  );
}

// input is a typed question by user input
class OwnQuestion extends Component<{ questionAnswer: (q: string[], a: string[]) => void }, {question: string, text: string}> {
  constructor(props: { questionAnswer: (q: string[]) => void }) {
    super(props);
    this.state = { question: '' ,text: "Submit"};
  }

  handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    this.props.questionAnswer([this.state.question], []);
    this.setState({text: "Submitted"})
  }

  handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    this.setState({ question: event.target.value});
    
  };

  render() {
    return (
      <div className="InputTextBox">
        <form onSubmit={this.handleSubmit} style={{textAlign: 'center'}}>
          <TextareaAutosize 
              className='textarea'
              placeholder="Write your own multi-step reasoning question..."
              value={this.state.question}
              onChange={this.handleInputChange}
              minRows={3} 
              style={{width:'100%', textAlign: 'left'}}
              onResize={undefined}
              onResizeCapture={undefined} />
          <button id="submit_button" type="submit">{this.state.text}</button>
        </form>
      </div> 
    );
  }
}

// this is the component that displays the correct thing depending on what the user selected
type SelectQuestionComponentProp = {
  questionAnswer: (questionValue: string[], expectedAnswer: string[]) => void
}

//TODO: we might not need label here
function SelectQuestionComponent(props: SelectQuestionComponentProp) {
  const [selectedOption, setSelectedOption] = useState<{value: string, label: string} | null>(null);
  const [component, setComponent] = useState<JSX.Element | null>(null);

const handleSelectChange = (selectedOption: {value: string, label: string} | null) => {
  setSelectedOption(selectedOption);

  if (selectedOption?.value === 'question1') {
    setComponent(<ExampleQuestion question = 'question1' />);
    props.questionAnswer([question1_text], []);
  } else if (selectedOption?.value === 'question2') {
    setComponent(<ExampleQuestion question = 'question2' />);
    props.questionAnswer([question2_text], []);
  } else if (selectedOption?.value === 'question3') {
    setComponent(<ExampleQuestion question = 'question3' />);
    props.questionAnswer([question3_text], []);
  } else if (selectedOption?.value === 'write_own') {
    setComponent(<OwnQuestion questionAnswer={updateQuestionState}/>);
  } else if (selectedOption?.value === 'csv') {
    setComponent(<InputCSV questionAnswer={updateQuestionState}/>);
  }
};

const updateQuestionState = (q: string[], a: string[]) => {
  props.questionAnswer(q, a);
};

return (
  <div>
    <h2> 2. Select your question </h2>

    <Select
      className='select'
      options={options}
      value={selectedOption}
      onChange={handleSelectChange}
      placeholder="--Please choose your question--"
    />

    {component}

  </div>
);

}
export default SelectQuestionComponent;