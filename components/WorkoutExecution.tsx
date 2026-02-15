// File: WorkoutExecution.tsx
// Author: Tony Jordan
// Purpose: UI for active workout for user to participate

import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Animated } from 'react-native';
import { RootStackParamList } from '../utilities/StackNavigation';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import BuildWorkout from '../utilities/BuildWorkout';
import { getDBConnection, addRecentWorkout } from '../utilities/DefaultInfo';
import LinearGradient from 'react-native-linear-gradient';
import { updateChallenge, setHighestStrikeCount, getChallengeValues, guidedWorkoutChallenges, metrics } from '../utilities/Challenges';

var combos: string[][];
var favIndex: number[];
var count = 0;
// function for setting value of combos for workout summary
export function grabCombos(c: string[][], f: number[], co: number) {
  combos = c;
  favIndex = f;
  count = co;
}

const WorkoutExecution = () => {

  type NavigationProp = StackNavigationProp<RootStackParamList, 'WorkoutCustomization'>;

  const nav = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, "WorkoutExecution">>();

  const [paused, setPaused] = useState(false);
  const [pauseBtnText, setPauseBtnText] = useState("Pause");
  const [favorited, setFavorited] = useState(false);
  const [currentCombo, setCurrentCombo] = useState<string[]>([]);
  const [favoriteBtnText, setFavoriteBtnText] = useState("Favorite");
  const [superFavorited, setSuperFavorited] = useState(false);
  const [favBtnColor, setFavBtnColor] = useState("gold");

  const [timeSeconds, setTimeSeconds] = useState("00")
  const [timeMinutes, setTimeMinutes] = useState("000")
  const [workoutActive, setWorkoutActive] = useState<boolean>(true);

  const [startMetrics, setStartMetrics] = useState<metrics[]>([{name:"", value: 1}]);
 

  const glowAnim = useRef(new Animated.Value(0)).current;  

 // use effect for getting challenge values at the start of the workout
  useEffect(() => {
    const fetchData = async () => {
      const db = await getDBConnection();
      setStartMetrics(await getChallengeValues(db, guidedWorkoutChallenges))
    }
    fetchData();
  }, [])

  // use effect for ending workout and navigating to summary page
  useEffect(() => {
    if (!workoutActive) {
      // add workout to recent workouts
      const fetchData = async () => {
        const db = await getDBConnection();
        await addRecentWorkout(db, new Date().toDateString(), timeMinutes + ':' + timeSeconds);
        await updateChallenge(db, "Insane Worker", parseInt(timeMinutes)/60 + parseInt(timeSeconds)/60/60);
        await updateChallenge(db, "Hyperbolic Time Chamber", parseInt(timeMinutes)/60 + parseInt(timeSeconds)/60/60);
        await setHighestStrikeCount(db);
        await updateChallenge(db, "Unorthodox Combo Enjoyer", 1);
      }
      fetchData();
      // if strike set id = -999 workout is by favorite rather than strike set
      nav.replace('WorkoutSummary', { time: timeMinutes + ":" + timeSeconds, combos: combos, favorited: favIndex, bf: route.params.strikeSetId == "-999" ? true : false, count: count, startMetrics: startMetrics});
    }
  }, [workoutActive])

  useEffect(() => {
    if (favorited && !superFavorited) {
      // animation for 'super favorite' button
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 800,
            useNativeDriver: false,
          }),
        ])
      ).start();
    } else {
      glowAnim.stopAnimation();
      glowAnim.setValue(0);
    }
  }, [favorited, superFavorited]);

  const secondsRef = useRef(0);
  const minutesRef = useRef(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    interval = setInterval(() => {
      secondsRef.current += 1;
      if (secondsRef.current >= 60) {
        secondsRef.current = 0;
        minutesRef.current += 1;
      }

      // Update display string every 1 second
      const formattedSeconds = secondsRef.current < 10 ? `0${secondsRef.current}` : `${secondsRef.current}`;
      const formattedMinutes = minutesRef.current < 10 ? `00${minutesRef.current}` : 
      minutesRef.current < 100 ? `0${minutesRef.current}` : `${minutesRef.current}`;

      setTimeSeconds(formattedSeconds);
      setTimeMinutes(formattedMinutes);
    }, 1000);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

    return (
        <LinearGradient colors={['black', '#04007D']} style={styles.screen}>
          <LinearGradient colors={['#04007D', 'red']} style={styles.head}>
              <View style={{alignItems: 'center', justifyContent: 'center'}}>
                <Text style={[styles.headText, {textAlign: 'center', paddingStart: '1%', paddingEnd: '1%', color: 'white'}]}>Combo Creator</Text>
              </View>
            </LinearGradient>

            <View style={styles.bodyMain}>
                <Text style={[styles.bodyText, {color: "red"}]}>{timeMinutes + ":" + timeSeconds}</Text>
                <BuildWorkout 
                  strikeSetId={route.params.strikeSetId} 
                  comboCount={route.params.comboCount} 
                  throwCount={route.params.throwCount} 
                  strikesPerCombo={route.params.strikesPerCombo} 
                  timePerStrike={route.params.timePerStrike} 
                  paused={paused}
                  currentCombo={currentCombo}
                  setCurrentCombo={setCurrentCombo}
                  setFavorited={setFavorited}
                  superFavorited={superFavorited}
                  setSuperFavorited={setSuperFavorited}
                  favorited={favorited}
                  setFavoriteBtnColor={setFavBtnColor}
                  setFavoriteBtnText={setFavoriteBtnText}
                  setWorkoutActive={setWorkoutActive}
                  pbc={route.params.pbc}
                  pwrc={route.params.pwrc}
                  strikes={route.params.strikes}
                  setPaused={setPaused}
                  tts={route.params.tts}/>
            </View>

            <LinearGradient colors={['red', '#04007D']} style={[styles.controls, {flexDirection: 'row', alignItems: 'center', 
            justifyContent: route.params.strikeSetId == '-999' ? 'center' : 'space-evenly', width: '100%'}]}>
                <TouchableOpacity onPress={() => {
                    if (favorited) {
                      setSuperFavorited(true);
                      setFavoriteBtnText("Cancel Favorite");
                      setFavBtnColor("#8d0d0dff")
                    }
                    else {
                      setFavorited(true);
                      setFavoriteBtnText("Super Favorite!");
                      setFavBtnColor("#3f48cc");
                    }
                    if (superFavorited) {
                      setSuperFavorited(false);
                      setFavorited(false);
                      setFavoriteBtnText("Favorite!")
                      setFavBtnColor("gold");
                    }
                  }} style={[styles.touch, {display: route.params.strikeSetId === "-999" ? "none": "flex"}]}>
                  <Animated.View
                    style={[
                      {
                        alignItems: 'center',
                        width: '100%',
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: glowAnim,
                        shadowRadius: glowAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 20],
                        }),
                        // Android fallback (glow tint)
                        transform: [
                        {
                          scale: glowAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [1, 1.05],
                          }),
                        },
                        ],
                      },
                    ]}>
                      <LinearGradient colors={[favBtnColor, 'black']} style={[styles.controlButton, {backgroundColor: favorited ? 'blue' : 'gold'}]}>
                        <Text style={[styles.homeButtonText]}>{favoriteBtnText}</Text>
                      </LinearGradient>
                  </Animated.View>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.touch]} onPress={() => {
                  if (paused) {
                    setPaused(false);
                    setPauseBtnText("Pause");
                  }
                  else {
                    setPaused(true);
                    setPauseBtnText("Resume");
                  }
                  }}>
                    <LinearGradient colors={paused ? ['green', 'black'] : ['red', 'black']} style={[styles.controlButton, {backgroundColor: paused ? 'green' : 'red'}]}>
                        <Text style={styles.homeButtonText}>{pauseBtnText}</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </LinearGradient>
        </LinearGradient>
      );
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
  headText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 30,
    paddingStart: 10,
    paddingTop: 20,
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
  bodyMain: {
    flex: 3,
    borderColor: "black",
    justifyContent: 'flex-start',
    alignItems: "center",
    zIndex: 100,
  },
  bodyText: {
    fontSize: 22,
    color: 'black',
    fontWeight: 'bold',
  },
  touch: {
    alignItems: 'center',
    width: '45%',
  },
  controls: {
    height: '10%',
    justifyContent: 'space-evenly',
    width: '100%',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  controlButton: {
    justifyContent: "center",
    alignItems: 'center',
    borderStyle: "solid", 
    borderWidth: 2, 
    borderColor: 'black', 
    borderRadius: 30,
    width: '85%',
    paddingVertical: '1%',
  },
  homeButton: {
    padding: 5,
    borderStyle: "solid",
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 10,
    marginTop: 20,
    marginEnd: 10,
    width: '100%',
  },
  homeButtonText: {
    color: "white",
    fontWeight: 'bold',
    fontSize: 20,
  },
  pauseView: {
    borderStyle: "solid",
    borderWidth: 2,
    borderColor: 'black',
    borderRadius: 10,
  }
});

export default WorkoutExecution;