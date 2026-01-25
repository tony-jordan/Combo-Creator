// File: Dropdown.tsx
// Author: Tony Jordan
// Purpose: Utility for cresating a drop down menu for UI.

import React, { useState, useRef, useEffect } from 'react';
import { TextInput, View, Text, TouchableOpacity, StyleSheet, Modal, TouchableWithoutFeedback, ScrollView, Dimensions, LayoutChangeEvent, Image} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import searchFavorites, { searchStrikeSets } from './Search';

type dropDownProps = {
  dataSet: any[],
  setSelectedId: React.Dispatch<React.SetStateAction<string>>,
  isOpen: boolean,
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>,
  left: boolean,
  setInitiateNavigate: React.Dispatch<React.SetStateAction<boolean>>,
  setList: React.Dispatch<React.SetStateAction<any[]>>,
  ogStrikes: any[],
}

export const HomeDropdown = ({dataSet, setSelectedId, isOpen, left, setIsOpen, setInitiateNavigate, setList, ogStrikes}: dropDownProps) => {
  const [buttonLayout, setButtonLayout] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  const buttonRef = useRef<View | null>(null);

  const handleSelect = (value: number) => {
    const v = String(value);
    const index = dataSet.findIndex(item => item.id === value)
    if (setSelectedId) 
      setSelectedId(index.toString());
    setIsOpen(false);

    setIsOpen(false);
    setInitiateNavigate(true);
  };

  const onButtonLayout = (event: LayoutChangeEvent) => {
    const { x, y, width, height } = event.nativeEvent.layout;
    // Save local coordinates so we can measure dropdown placement in modal
    buttonRef.current?.measure((fx, fy, w, h, px, py) => {
      setButtonLayout({ x: px, y: py, width: w, height: h });
    });
  };

  useEffect(() => {
    setIsOpen(isOpen);
  }, [isOpen])

  const screenHeight = Dimensions.get('window').height;
  const dropdownHeight = screenHeight * 0.5;

  return (
    <>
      {/* Dropdown Trigger */}
      <View
        ref={buttonRef}
        onLayout={onButtonLayout}
        collapsable={false}
        style={[styles.container]}
      >
      </View>

      {/* Floating dropdown menu in modal */}
      <Modal
        transparent
        visible={isOpen}
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        {/* Click outside to close */}
        <TouchableWithoutFeedback onPress={() => setIsOpen(false)}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>

        {/* Dropdown content anchored to button */}
        {buttonLayout && (
          <LinearGradient colors={['#04007D', 'red']}
            style={[
              styles.dropdownContainer,
              {
                top: screenHeight - (screenHeight * .1 + dropdownHeight),
                left: left ? 0 : buttonLayout.x * 2,
                width: buttonLayout.width,
                height: dropdownHeight,
                backgroundColor: 'black',
                borderColor: 'black',
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
                  <Text style={[styles.optionText, {color: 'white', marginEnd: '5%', maxWidth: '75%'}]}>{option.name ? option.name : 'Combo: ' + option.id}</Text>
                  {left && option.super_favorite == 1 && <Image style={{width: 20, height: 20, resizeMode: 'contain', marginEnd: '5%'}} source={require('../assets/favorited.png')}/>}
                  {!left && option.locked == 1 && <Image style={{width: 18, height: 18, resizeMode: 'contain', marginEnd: '5%'}} source={require('../assets/locked.png')}/>}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TextInput style={[styles.input, {borderColor: 'black'}]} placeholder={left ? "Search Favorites" : 'Search Strike Sets'} onChangeText={(text) => {
                if (left)
                  searchFavorites(text, setList, ogStrikes);
                else {
                  searchStrikeSets(text, setList, ogStrikes);
                }
            }}/>
            <TouchableOpacity
                  style={styles.option}
                  onPress={() => {
                    setSelectedId('not set');
                    setIsOpen(false);
                    setInitiateNavigate(true);
                  }}
                >   
                  <Image style={{width: 20, height: 20, resizeMode: 'contain', marginEnd: '5%'}} source={require('../assets/add.png')}/>
                  <Text style={[styles.optionText, {color: 'white'}]}>{left ? 'Create new combo' : 'Create new strike set'}</Text>
            </TouchableOpacity>
          </LinearGradient>
        )}
      </Modal>
    </>
  );
}


const styles = StyleSheet.create({
  container: {
    margin: 20,
    width: '50%',
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
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomColor: 'black',
    borderBottomWidth: 1,
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    width: '100%',
    backgroundColor: 'white',
  },

});