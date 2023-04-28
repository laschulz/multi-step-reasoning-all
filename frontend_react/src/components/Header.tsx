import React from 'react';
import ethz_logo from '../ethz_logo_2.png';
import './Header.css'

class HeaderComponent extends React.Component<{}>{

  render() {
    return (
        <div className='FullWidth'> 
            <div className='BodyInside'>
                <img src={ethz_logo} alt="ETHZ Logo" style={{width: '175px'}}/>
                <h3>Language, Reasoning and Education Lab</h3>
            </div>
        </div>
    );
  }

}
export default HeaderComponent;
