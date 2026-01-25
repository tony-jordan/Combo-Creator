// File: BuildWrkout.tsx
// Author: Tony Jordan
// Purpose: Utility for generating workout functionality

import React, { useEffect, useRef, useState, Dispatch, SetStateAction } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../utilities/StackNavigation';
import { StackNavigationProp } from '@react-navigation/stack';
import { getDBConnection, getStrikeSetByID, getTutorialStatus } from './DefaultInfo';
import { usePauseableInterval, usePausableTimeout } from './WorkoutAnimation';
import { loadStrikeSounds, releaseStrikeSounds } from '../audiocontrol.js';
import Sound from 'react-native-sound';
import { WorkoutByStrikeSet, WorkoutByFavorite } from './WorkoutObject';
import { useKeepAwake, deactivateKeepAwake } from '@sayem314/react-native-keep-awake';
import { grabCombos } from '../components/WorkoutExecution';

type NavigationProp = StackNavigationProp<RootStackParamList, 'WorkoutExecution'>;

// function for formatting combo for user presentation during workout.
export function parseCombo(arr: string[]) {
    let result = '';
    for (let x = 0; x < arr.length; x++) {
        result += arr[x] + " "
    }
    return result;
}


export function SetupWorkout() {
    useKeepAwake();
    

    return
}

const styles = StyleSheet.create({
    bodyMain: {
        flex: 6,
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    workoutBody: {
        width: '95%',
        alignItems: 'center',
        justifyContent: 'center',
    },
     tutorial: {
    height: '100%',
    width: '100%',
    zIndex: 99,
    position: 'absolute',
    backgroundColor: 'black',
    opacity: .5,
  },
  tutorialInfo: {
    backgroundColor: 'white',
    borderColor: 'black',
    borderStyle: 'solid',
    borderWidth: 2,
    borderRadius: 10,
  },
    bodyText: {
        fontSize: 22,
        color: 'black',
        fontWeight: 'bold',
        margin: 10,
        textAlign: 'center',
        backgroundColor: '#F5F5F5',
    },
    pauseView: {
        borderStyle: 'solid',
        borderWidth: 5,
        borderColor: 'black',
        borderRadius: 10,
        position: 'absolute',
        zIndex: 999,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: '5%',
        padding: 20,
        backgroundColor: 'white',
    },
    homeButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 22,
    },
    controlButton: {
        paddingTop: '10%',
        paddingBottom: '10%',
        paddingStart: '20%',
        paddingEnd: '20%',
        borderStyle: 'solid',
        borderWidth: 3,
        borderColor: 'black',
        borderRadius: 40,
        margin: 15,
        alignItems: 'center',
    },
});

export default SetupWorkout;
