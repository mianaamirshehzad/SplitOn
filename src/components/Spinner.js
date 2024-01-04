import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';


const Spinner = ({animating}) => {
  return (
    <View>
      <ActivityIndicator
      animating = {animating}
      color={'green'}
      size={'large'}

       />
    </View>
  )
};

export default Spinner;