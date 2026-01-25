// File: SliderInput.tsx
// Author: Tony Jordan
// Purpose: Create an input control for user to set number value.

import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';

type SliderInputProps = {
  min: number;
  max: number;
  setTime: (value: string) => void;
  step: number;
  start?: number;
  type?: string;
};

const SliderInput: React.FC<SliderInputProps> = ({ min, max, setTime, step, start, type }) => {
  // slider value initially set to midpoint of min and max
  const [sliderValue, setSliderValue] = useState(start ? start : (min + max) / 2);

  // change slider value when interacted with
  const handleChange = (value: number) => {
    setSliderValue(value);
    setTime(value.toString());
  };

  return (
    <View style={styles.container}>
      <Text style={styles.valueText}>{sliderValue.toFixed(0)} {type ? type : 'ms'}</Text>
      <Slider
        style={styles.slider}
        minimumValue={min}
        maximumValue={max}
        step={step}
        value={sliderValue}
        onValueChange={handleChange}
        minimumTrackTintColor="#FF0000"
        maximumTrackTintColor="white"
        thumbTintColor="gray"
      />
    </View>
  );
};

export default SliderInput;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 20,
  },
  slider: {
    width: '80%',
    height: 40,
  },
  valueText: {
    fontSize: 18,
    marginBottom: 10,
    color: 'white',
  },
});