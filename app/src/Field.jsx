import React from 'react';
import {TextInput} from 'react-native';
import { Sky } from './Constants';


const Field = props => {
  return (
    <TextInput
      {...props}
      style={{borderRadius: 100, color: Sky, paddingHorizontal: 10, width: '50%',
      backgroundColor: 'rgb(220,220, 220)', marginVertical: 10}} placeholderTextColor={Sky}>
    </TextInput>
  );
};

export default Field;