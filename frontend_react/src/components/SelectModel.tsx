import React, { Component } from 'react';
import Select from 'react-select';

const options= [
  {value: 'model1', label: 'FLAN-T5'},
  {value: 'model2', label: 'GPT-2'},
  {value: 'model3', label: 'Model3'}
]

const model1_text = "model 1 text ajskldfjsdkflsjf"
const model2_text = "model 2 text ajskldfjsdkflsjf"
const model3_text = "model 3 text ajskldfjsdkflsjf"

interface SelectModelComponentState {
  selectedOption: {value: string, label: string} | null;
  message: string;
}

interface SelectModelComponentProps {
  selectModel: (modelValue: string) => void;
}

class SelectModelComponent extends Component<SelectModelComponentProps, SelectModelComponentState> {
  constructor(props: { selectModel: (modelValue: string) => void }) {
    super(props);

    this.state = {
      selectedOption: null,
      message: '',
    };

    this.handleSelectChange = this.handleSelectChange.bind(this);
  }

  handleSelectChange(selectedOption: {value: string, label: string} | null) {
    let message = '';
    if (selectedOption?.value === 'model1') {
      message = model1_text;
    } else if (selectedOption?.value === 'model2') {
      message = model2_text;
    } else if (selectedOption?.value === 'model3') {
      message = model3_text;
    } else {
      message = '';
    }
    this.setState({selectedOption, message});
    this.props.selectModel(selectedOption?.value || '')
  }

  render() {
    return (
      <div>
        <h2> 1. Select a model </h2>
        
        <Select 
          className='select'
          options={options} 
          value={this.state.selectedOption} 
          onChange={this.handleSelectChange}
          placeholder="--Please choose a model--"
        />
        
        {this.state.message && <div className='TextBox'><p>{this.state.message}</p></div>}
        
      </div>
    );
  }
}

export default SelectModelComponent;
