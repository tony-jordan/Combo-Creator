// File: Dropdown.tsx
// Author: Tony Jordan
// Purpose: Utility for cresating a drop down menu for UI.

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
  ScrollView,
  Dimensions,
  LayoutChangeEvent,
} from 'react-native';
import { DataSet } from './DefaultInfo';

type dropDownProps = {
  dataSet: DataSet[],
  defaultValue: string,
  setSelectedId?: React.Dispatch<React.SetStateAction<string>>,
  placeholder?: string,
  extraStyle?: boolean
}

export const CustomDropdown = ({dataSet, defaultValue, setSelectedId, placeholder, extraStyle}: dropDownProps) => {
  const [selectedValue, setSelectedValue] = useState(defaultValue);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [buttonLayout, setButtonLayout] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  const buttonRef = useRef<View | null>(null);

  const handleSelect = (value: number) => {
    const v = String(value);
    setSelectedValue(v);
    if (setSelectedId) setSelectedId(v);
    setIsDropdownOpen(false);
  };

  const onButtonLayout = (event: LayoutChangeEvent) => {
    const { x, y, width, height } = event.nativeEvent.layout;
    // Save local coordinates so we can measure dropdown placement in modal
    buttonRef.current?.measure((fx, fy, w, h, px, py) => {
      setButtonLayout({ x: px, y: py, width: w, height: h });
    });
  };

  const openDropdown = () => {
    setIsDropdownOpen(true) 
    console.log('Dropdown opened')};
  const selectedLabel = dataSet.find(opt => opt.id == parseInt(selectedValue))?.name;

  const screenHeight = Dimensions.get('window').height;
  const dropdownHeight = screenHeight * 0.4;
  const shouldFlipUp = buttonLayout && buttonLayout.y + dropdownHeight + (buttonLayout.height ?? 0) > screenHeight;

  return (
    <>
      {/* Dropdown Trigger */}
      <View
        ref={buttonRef}
        onLayout={onButtonLayout}
        collapsable={false}
        style={styles.container}
      >
        <TouchableOpacity style={[styles.dropdownButton, 
          {backgroundColor: extraStyle ? 'black' : '#f0f0f0', borderColor: extraStyle ? 'red' : '#ccc'}]} onPress={openDropdown}>
          <Text style={[styles.dropdownButtonText, {color: extraStyle ? 'red' : '#333'}]}>
            {selectedLabel ?? placeholder ?? 'Select an option'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Floating dropdown menu in modal */}
      <Modal
        transparent
        visible={isDropdownOpen}
        animationType="fade"
        onRequestClose={() => setIsDropdownOpen(false)}
      >
        {/* Click outside to close */}
        <TouchableWithoutFeedback onPress={() => setIsDropdownOpen(false)}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>

        {/* Dropdown content anchored to button */}
        {buttonLayout && (
          <View
            style={[
              styles.dropdownContainer,
              {
                top: shouldFlipUp
                  ? buttonLayout.y - dropdownHeight - 8
                  : buttonLayout.y + buttonLayout.height + 4,
                left: buttonLayout.x,
                width: buttonLayout.width,
                maxHeight: dropdownHeight,
                backgroundColor: extraStyle ? 'black' : '#fff',
                borderColor: extraStyle ? 'red' : '#ccc',

              },
            ]}
          >
            <ScrollView style={styles.dropdownList} nestedScrollEnabled>
              {dataSet.map(option => (
                <TouchableOpacity
                  key={option.id}
                  style={styles.option}
                  onPress={() => handleSelect(option.id)}
                >
                  <Text style={[styles.optionText, {color: extraStyle ? 'red' : '#333'}]}>{option.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </Modal>
    </>
  );
}


const styles = StyleSheet.create({
  container: {
    margin: 20,
    width: '75%',
  },
  dropdownButton: {
    padding: '5%',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  dropdownButtonText: {
    fontSize: 16,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  dropdownContainer: {
    position: 'absolute',
    borderRadius: 6,
    borderWidth: 1,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  dropdownList: {
    width: '100%',
  },
  option: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
});