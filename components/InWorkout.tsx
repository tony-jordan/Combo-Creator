// File: WorkoutExecution.tsx
// Author: Tony Jordan
// Purpose: UI for active workout for user to participate

import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Animated } from 'react-native';
import { RootStackParamList } from '../utilities/StackNavigation';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { getDBConnection } from '../utilities/DefaultInfo';
import LinearGradient from 'react-native-linear-gradient';

var combos: string[][];
var favIndex: number[];
var count = 0;
// function for setting value of combos for workout summary
export function grabCombos(c: string[][], f: number[], co: number) {
  combos = c;
  favIndex = f;
  count = co;
}

type NavigationProp = StackNavigationProp<RootStackParamList, 'WorkoutCustomization'>;

const InWorkout = () => {
    const nav = useNavigation<NavigationProp>();
    const route = useRoute<RouteProp<RootStackParamList, "WorkoutExecution">>();



    return (
        <LinearGradient colors={['black', '#04007D']} style={styles.screen}>
            <LinearGradient colors={['#04007D', 'red']} style={styles.head}>
                <View style={{alignItems: 'center', justifyContent: 'center'}}>
                    <Text style={[styles.headText, {textAlign: 'center', paddingStart: '1%', paddingEnd: '1%', color: 'white'}]}>Combo Creator</Text>
                </View>
            </LinearGradient>
            <View style={[styles.bodyMain]}>

            </View>

            <View style={[styles.controls]}>
                <LinearGradient colors={['red', '#04007D']} style={{flexDirection: 'row', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center',
                borderTopLeftRadius: 30, borderTopRightRadius: 30,}}>
                    <TouchableOpacity style={styles.touch} onPress={() => {
                        
                    }}>
                        <LinearGradient colors={['gold', 'black']} style={[styles.controlButton, {backgroundColor: "gold"}]}>
                            <Text style={{color: "white", fontSize: 18, fontWeight: "bold"}}>Favorite</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.touch} onPress={() => {
                        nav.reset({
                            index: 0,
                            routes: [{ name: "Home" as never }]
                        })
                    }}>
                        <LinearGradient colors={['red', '#390842']} style={[styles.controlButton, {backgroundColor: "red"}]}>
                            <Text style={{color: "white", fontSize: 18, fontWeight: "bold"}}>Pause</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </LinearGradient>
            </View>
        </LinearGradient>
    )
}

const styles = StyleSheet.create({
  screen: {
    flex: 6,
  },
  head: {
    flex: .3,
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  rope: {
    width: '100%', 
    height: '2.5%', 
    backgroundColor: 'red',
    borderColor: 'black',
    borderWidth: 3,
    borderStyle: 'solid',
  },
  week: {
    width: '95%',
    flexDirection: 'row',
    borderColor: 'red',
    backgroundColor: 'black',
    borderWidth: 1,
    borderStyle: 'solid',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    borderRadius: 10,
    padding: '1%',
    marginBottom: '10%',
  },
  day: {
    width: `${((1/7) * 100) - 2}%`,
    backgroundColor: 'black',
  },
  touch: {
    marginStart: '2%',
    marginEnd: '2%',
    width: '40%',
  },
  tutorialInfo: {
    backgroundColor: 'white',
    borderColor: 'black',
    borderStyle: 'solid',
    borderWidth: 2,
    borderRadius: 10,
  },
  headText: {
    color: 'red',
    fontWeight: 'bold',
    fontSize: 30,
    textAlign: 'center',
  },
   dateText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
    textAlign: 'center',
  },
  bodyMain: {
    flex: 3,
    justifyContent: 'space-between',
    alignItems: "center",
  },
  controls: {
    height: '10%',
  },
  controlButton: {
    justifyContent: "center",
    alignItems: 'center',
    padding: '3%',
    borderStyle: "solid", 
    borderWidth: 2, 
    borderColor: 'black', 
    borderRadius: 30,
    width: '100%',
  },
  homeButtonText: {
    color: "white",
    fontWeight: 'bold',
    fontSize: 20,
  }
});

export default InWorkout;