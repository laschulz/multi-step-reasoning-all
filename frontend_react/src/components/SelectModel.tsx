import React, { Component } from 'react';
import Select from 'react-select';

const options= [
  {value: 'model1', label: 'FLAN-T5'},
  {value: 'T5-large', label: 'T5-large (local)'},
  {value: 'model3', label: 'GPT-2'},
  {value: 'gpt3', label: 'GPT-3'}
]

const model1_text = "T5-Large is a cutting-edge language model developed by Google's AI research team that reframes all NLP tasks into a unified text-to-text format, allowing for easy adaptation to new tasks without the need for task-specific modifications to the model architecture. \n With 774 million parameters, T5-Large is one of the largest and most powerful language models available today, trained on a massive amount of text data using unsupervised pre-training and denoising auto-encoding techniques. The model has achieved state-of-the-art performance on a wide range of NLP benchmarks, including language translation, summarization, and question answering. \n Overall, T5-Large represents a major advancement in natural language processing and has shown promise in a variety of applications, making it a powerful tool for researchers and practitioners working in the field of NLP."
const model2_text = "T5-Large is a cutting-edge language model developed by Google's AI research team that reframes all NLP tasks into a unified text-to-text format, allowing for easy adaptation to new tasks without the need for task-specific modifications to the model architecture. \n With 774 million parameters, T5-Large is one of the largest and most powerful language models available today, trained on a massive amount of text data using unsupervised pre-training and denoising auto-encoding techniques. The model has achieved state-of-the-art performance on a wide range of NLP benchmarks, including language translation, summarization, and question answering. \n Overall, T5-Large represents a major advancement in natural language processing and has shown promise in a variety of applications, making it a powerful tool for researchers and practitioners working in the field of NLP."
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
    } else if (selectedOption?.value === 'T5-large') {
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
