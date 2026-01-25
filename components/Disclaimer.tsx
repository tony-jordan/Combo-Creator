// File: Disclaimer.tsx
// Author: Tony Jordan
// Purpose: Disclaimer informing user of medical notice as a result of using this app

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import {useNavigation} from '@react-navigation/native';
import SystemNavigationBar from "react-native-system-navigation-bar";
import { getLast7Days } from '../utilities/DateUtility';
import { getDBConnection, updateRecentWorkouts } from '../utilities/DefaultInfo';




const Disclaimer = () => {

  const nav = useNavigation();
  SystemNavigationBar.stickyImmersive();

  const opacity = useRef(new Animated.Value(0)).current;

  // ensure recent workouts 7 days and older are removed
  useEffect(() => {
    const fetchData = async () => {
      const db = await getDBConnection();
      const days = getLast7Days();
      await updateRecentWorkouts(db, days);
    }
    fetchData();
  }, [])

  useEffect(() => {
    Animated.sequence([
      // Fade in
      Animated.timing(opacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),

      // Pause
      Animated.delay(4000),

      // Fade out
      Animated.timing(opacity, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start(() => {
        nav.reset({
          index: 0,
          routes: [{ name: "Home" as never }]
        })
    });
  }, []);


    return (
        <View style={styles.screen}>
          <Animated.View style={[styles.disclaimer, { opacity }]}>
            <Text style={[styles.disclaimerText, {fontSize: 28}]}>Medical Disclaimer{'\n'}</Text>
            <Text style={styles.disclaimerText}>Combo Creator provides randomized striking combinations and workout tools intended for training and fitness purposes. {'\n\n'}It does not provide medical advice, diagnosis, or treatment. Physical activity, including striking exercises, carries a risk of injury. Users should only perform workouts that match their personal fitness level and physical abilities.
              {'\n\n'}Consult a physician or qualified health professional before beginning any new exercise program, especially if you have injuries, medical conditions, or concerns about your health. Stop using the app immediately if you feel pain, dizziness, shortness of breath, or discomfort during training.
              {'\n\n'}By using Combo Creator, you agree that you are participating at your own risk and are responsible for your own safety, technique, and training environment. The developer assumes no liability for injuries or issues that may occur while using the app.
            </Text>
          </Animated.View>
        </View>
      );
}

const styles = StyleSheet.create({
  screen: {
    flex: 6,
  },
  disclaimer: {
    position: 'absolute',
    minHeight: "100%",
    minWidth: '100%',
    backgroundColor: 'red',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
  disclaimerText: {
    fontSize: 16,
    maxWidth: "85%",
    color: 'white',
    textAlign: 'center',
    fontWeight: "bold"
  },
});

export default Disclaimer;