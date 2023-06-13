import React, { Component } from 'react';
import Select from 'react-select';

const options= [
  {value: 'Flan-T5', label: 'Flan-T5'},
  {value: 'Flan-T5-local', label: 'Flan-T5 (local)'},
  {value: 'model3', label: 'GPT-2'},
  {value: 'gpt3', label: 'GPT-3'}
] 

const flan_t5_text = 
"Flan-T5 has been fine-tuned on the questions of GSM8K training dataset and is based on the T5 model. \n T5 is a cutting-edge language model developed by Google's AI research team that reframes all NLP tasks into a unified text-to-text format, allowing for easy adaptation to new tasks without the need for task-specific modifications to the model architecture. \n With 774 million parameters, T5-Large is one of the largest and most powerful language models available today, trained on a massive amount of text data using unsupervised pre-training and denoising auto-encoding techniques. The model has achieved state-of-the-art performance on a wide range of NLP benchmarks, including language translation, summarization, and question answering. \n Overall, T5-Large represents a major advancement in natural language processing and has shown promise in a variety of applications, making it a powerful tool for researchers and practitioners working in the field of NLP."
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
    if (selectedOption?.value === 'Flan-T5') {
      message = flan_t5_text;
    } else if (selectedOption?.value === 'Flan-T5-local') {
      message = flan_t5_text;
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
        
        {this.state.message && (
          <div className='TextBox'>
            {this.state.message.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}<br /></p>
            ))}
          </div>)
        }
      </div>
    );
  }
}

export default SelectModelComponent;
