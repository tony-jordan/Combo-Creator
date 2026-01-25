// File: Dropdown.tsx
// Author: Tony Jordan
// Purpose: Utility for cresating a drop down menu for UI.

import React, { useState, useRef, Dispatch } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
  TouchableWithoutFeedback,
  ScrollView,
  Dimensions,
  LayoutChangeEvent,
} from 'react-native';
import { DataSet } from './DefaultInfo';

type timeSelectorProps = {
  setSeconds: React.Dispatch<React.SetStateAction<string>>,
  setMinutes: React.Dispatch<React.SetStateAction<string>>,
  seconds: string,
  minutes: string,
}

export const TimeSelection = ({setSeconds, seconds, setMinutes, minutes}: timeSelectorProps) => {
  

  return (
    <ScrollView>
        <View style={styles.container}>
            <View style={styles.control}>
                <Text style={styles.controlText}>Minutes</Text>
                <TouchableOpacity onPress={() => {
                    let temp = parseInt(minutes);
                    temp += 1;
                    if (temp <= 99) {
                        if (temp.toString().length == 1) {
                            setMinutes('0' + temp.toString());
                        }
                        else {
                            setMinutes(temp.toString());
                        }
                    }
                }}>
                    <View style={styles.imgContainer}>
                        <Image source={require("../assets/up.png")} style={styles.img}/>
                    </View>
                </TouchableOpacity>
                <Text style={styles.controlText}>{minutes}</Text>
                <TouchableOpacity onPress={() => {
                    let temp = parseInt(minutes);
                    temp -= 1;
                    if (temp >= 0) {
                        if (temp.toString().length == 1) {
                            setMinutes('0' + temp.toString());
                        }
                        else {
                            setMinutes(temp.toString());
                        }
                    }
                }}>
                    <View style={styles.imgContainer}>
                        <Image source={require("../assets/down.png")} style={styles.img}/>
                    </View>
                </TouchableOpacity>
            </View>
            <View style={styles.control}>
                <Text style={styles.controlText}>Seconds</Text>
                <TouchableOpacity onPress={() => {
                    let temp = parseInt(seconds);
                    let mTemp = parseInt(minutes);
                    temp += 1;
                    if (temp == 60) {
                       if (mTemp < 99) {
                            if (mTemp.toString().length == 1) {
                                setMinutes('0' + (mTemp + 1).toString())
                            }
                            else {
                                setMinutes((mTemp + 1).toString())
                            }
                            setSeconds('00')
                       }
                    }
                    else {
                        if (temp.toString().length == 1)
                            setSeconds('0' + temp.toString());
                        else
                            setSeconds(temp.toString());
                    }
                }}>
                    <View style={styles.imgContainer}>
                        <Image source={require("../assets/up.png")} style={styles.img}/>
                    </View>
                </TouchableOpacity>
                <Text style={styles.controlText}>{seconds}</Text>
                <TouchableOpacity onPress={() => {
                    let temp = parseInt(seconds);
                    let mTemp = parseInt(minutes);
                    temp -= 1;
                    if (temp == -1) {
                       if (mTemp > 0) {
                            if (mTemp.toString().length == 1) {
                                setMinutes('0' + (mTemp - 1).toString())
                            }
                            else {
                                setMinutes((mTemp - 1).toString())
                            }
                            setSeconds('59')
                       }
                    }
                    else {
                        if (temp.toString().length == 1)
                            setSeconds('0' + temp.toString());
                        else
                            setSeconds(temp.toString());
                    }
                }}>
                    <View style={styles.imgContainer}>
                        <Image source={require("../assets/down.png")} style={styles.img}/>
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    </ScrollView>
  );
}


const styles = StyleSheet.create({
    container: {
        margin: '1%',
        flexDirection: 'row',
    },
    control: {
        alignItems: 'center',
    },
    controlText: {
        color: 'white',
        fontSize: 24,
        padding: '2%',
    },
    img: {
        height: 30, 
        width: 60, 
        resizeMode: "stretch",
    },
    imgContainer: {
        borderWidth: 1,
        borderColor: 'white',
        borderRadius: 10,
        padding: '5%'
    }
});