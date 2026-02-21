// File: WorkoutExecution.tsx
// Author: Tony Jordan
// Purpose: UI for active workout for user to participate

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Animated } from 'react-native';
import { RootStackParamList } from '../utilities/StackNavigation';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { getDBConnection, addRecentWorkout } from '../utilities/DefaultInfo';
import LinearGradient from 'react-native-linear-gradient';
import { useKeepAwake, deactivateKeepAwake } from '@sayem314/react-native-keep-awake';
import Sound from 'react-native-sound';
import { loadBellSounds, releaseBellSounds } from '../audiocontrol';
import { updateChallenge } from '../utilities/Challenges';

const TimedWorkoutExecution = () => {
  useKeepAwake();

  type NavigationProp = StackNavigationProp<RootStackParamList, 'TimedWorkoutCustomization'>;

  const nav = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, "TimedWorkoutExecution">>();

  const [paused, setPaused] = useState(false);
  const [pauseBtnText, setPauseBtnText] = useState("Pause")

  const [workoutActive, setWorkoutActive] = useState<boolean>(true);
  const [timeRemainingMs, setTimeRemainingMs] = useState<number>(0);
  const [timeRemainingString, setTimeRemainingString] = useState<string>('03:00');
  const prevTimeString = useRef<string>("");

const workMinutes = parseInt((route.params.workTime).slice(0, 2));
const workSeconds = parseInt((route.params.workTime).slice(3));
const restMinutes = parseInt((route.params.restTime).slice(0, 2));
const restSeconds = parseInt((route.params.restTime).slice(3));

const workMs = (workMinutes * 60 + workSeconds) * 1000;
const restMs = (restMinutes * 60 + restSeconds) * 1000;

const rounds = useRef<number>(route.params.rounds);
const startTime = useRef(0);
const elapsed = useRef(0);
const rafId = useRef<number | null>(null);
const durationMs = useRef(0);
const inRest = useRef<boolean>(false);
const currentSoundIndex = useRef<number>(0);
const bellSounds = useRef<Sound[]>([]);
// total number of bell sounds == rounds * 2 - 1 (last rest round does not take place hence -1)

useEffect(() => {
    const fetchData = async () => {
      const sounds = await loadBellSounds((route.params.rounds * 2) - 1)
      sounds[currentSoundIndex.current].play()
      currentSoundIndex.current += 1;
      bellSounds.current = sounds;
      start(workMs);
    }
    fetchData();
}, [])

useEffect(() => {
    let secondsTotal = timeRemainingMs / 1000
    let minutesRemaining = (Math.floor(secondsTotal / 60)).toString();
    let secondsRemaining = (Math.floor(secondsTotal % 60)).toString();

    const newString = `${minutesRemaining.toString().padStart(2,'0')}:${secondsRemaining.toString().padStart(2,'0')}`;

    if (newString !== prevTimeString.current) {
        prevTimeString.current = newString;
        setTimeRemainingString(newString);
    }
    

}, [timeRemainingMs])

const loop = () => {
  const now = performance.now();
  const totalElapsed = elapsed.current + (now - startTime.current);
  
  const remainingMs = Math.max(0, durationMs.current - totalElapsed);

  setTimeRemainingMs(remainingMs);

  if (remainingMs === 0) {
    if (!inRest.current) {
        let temp = rounds.current;
        temp -= 1;
        if (temp != 0) {
            rounds.current = temp;
            inRest.current = true;
            if (bellSounds) {
              bellSounds.current[currentSoundIndex.current].play();
              currentSoundIndex.current += 1
            }
            start(restMs);
        }
        else {
            deactivateKeepAwake();
            setWorkoutActive(false);
        }
    }
    else {
        inRest.current = false;
        if (bellSounds) {
          bellSounds.current[currentSoundIndex.current].play();
          currentSoundIndex.current += 1
        }
        start(workMs);
    }
    
    return;
  }

  rafId.current = requestAnimationFrame(loop);
};

const start = (ms: number) => {
  const fetchData = async () => {
    if (!inRest.current) {
      const db = await getDBConnection();
      await updateChallenge(db, "More like Mike", 1);
      await updateChallenge(db, "Float like a butterfly", 1);
    }
  }
  fetchData();
  elapsed.current = 0;
  durationMs.current = ms;
  startTime.current = performance.now();
  rafId.current = requestAnimationFrame(loop);
};

const pause = () => {
  if (!rafId.current) return;
    cancelAnimationFrame(rafId.current);
  rafId.current = null;
  elapsed.current += performance.now() - startTime.current;
};

const resume = () => {
  if (rafId.current) return; // already running
    startTime.current = performance.now();
  rafId.current = requestAnimationFrame(loop);
};


  // use effect for ending workout and navigating to summary page
  useEffect(() => {
    if (!workoutActive) {
      releaseBellSounds(bellSounds);
        // convert all time to miliseconds to get the elapsed time for the workout
      let totalMs = 0;
      // add total number of completed rounds to milisecond total
      totalMs += (workMinutes * (route.params.rounds - rounds.current) * 60000) + (workSeconds * (route.params.rounds - rounds.current) * 1000) +
        (restMinutes * (route.params.rounds - rounds.current) * 60000) + (restSeconds * (route.params.rounds - rounds.current) * 1000)
      // get remaining time in current round
      let remainingMs = (parseInt(timeRemainingString.slice(0, 2)) * 60000) + (parseInt(timeRemainingString.slice(3)) * 1000)
      // if in rest, add elapsed time from rest, if not in rest, add elapsed time from work
      if (inRest.current) {
        // elapsed time = set time in miliseconds for a rest - remainingMs
        let restMs = (restMinutes * 60000) + (restSeconds * 1000);
        totalMs += restMs - remainingMs;
      }
      else {
        // elapsed time = set time in miliseconds for work - remainingMs
        let workMs = (workMinutes * 60000) + (workSeconds * 1000);
        totalMs += workMs - remainingMs;
      }
      let totalSeconds = totalMs / 1000;
      let mins = Math.floor(totalSeconds / 60).toString();
      let secs = Math.floor(totalSeconds % 60).toString();
      while(mins.length < 3) {
        mins = '0' + mins
      }
      while(secs.length < 2) {
        secs = '0' + secs
      }
      const fetchData = async () => {
        const db = await getDBConnection();
        await addRecentWorkout(db, new Date().toDateString(), mins + ':' + secs);
        await updateChallenge(db, "Hyperbolic Time Chamber", totalSeconds/3600);
        await updateChallenge(db, "Insane Worker", totalSeconds/3600);
        await updateChallenge(db, "Honorary Boxer", 1);
      }
      fetchData();
      // if strike set id = -999 workout is by favorite rather than strike set
      nav.reset({
            index: 0,
            routes: [{ name: "Home" as never }]
        })
    }
  }, [workoutActive])

    return (
        <LinearGradient colors={['black', '#04007D']} style={styles.screen}>
          <LinearGradient colors={['#04007D', 'red']} style={styles.head}>
            <View style={{alignItems: 'center', justifyContent: 'center'}}>
                <Text style={[styles.headText, {textAlign: 'center', paddingStart: '1%', paddingEnd: '1%', color: 'white'}]}>Combo Creator</Text>
            </View>
           </LinearGradient>

            <View style={styles.bodyMain}>
                { paused && 
                    <LinearGradient colors={['red', '#04007D']} style={[styles.pauseView]}>
                        <Text style={[styles.homeButtonText, { color: 'white' }]}>Workout is paused...</Text>
                        {route.params.favorites && route.params.favorites.length > (route.params.rounds - rounds.current) && 
                            <View style={{alignItems: 'center', margin: '5%'}}>
                                <Text style={[styles.homeButtonText, { fontSize: 22}]}>Current Combo:</Text>
                                <Text style={[styles.homeButtonText, { textAlign: 'center', fontSize: 18, maxWidth: '95%'}]}>{route.params.favorites[route.params.rounds - rounds.current].label}</Text>
                            </View>
                        }
                                <TouchableOpacity style={{margin: '1%', marginTop: !route.params.favorites || route.params.favorites.length <= (route.params.rounds - rounds.current) ? '10%' : '1%'}} onPress={() => {
                                    setWorkoutActive(false);
                                }}>
                                    <LinearGradient colors={['red', 'black']} style={[styles.controlButton, { backgroundColor: 'red', paddingVertical: '10%', paddingHorizontal: '5%'}]}>
                                        <Text style={styles.homeButtonText}>End Workout?</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </LinearGradient>
                            }
                <View style={{alignItems: "center", height: '25%'}}>
                    <Text style={[styles.bodyText]}>{'Rounds: ' + (route.params.rounds - rounds.current + 1) + "/" + route.params.rounds}</Text>
                    <Text style={[styles.bodyText, {color: inRest.current ? "white" : "red"}]}>{inRest.current ? 'Resting' : "Working"}</Text>
                </View>
                <View style={{alignItems: "center", height: '33%'}}>
                    {route.params.favorites && route.params.favorites[route.params.rounds - rounds.current] && 
                        <Text style={[styles.bodyText, {maxWidth: '85%', fontSize: 24, marginBottom: '5%'}]}>{route.params.favorites[route.params.rounds - rounds.current].label}</Text>
                    }
                    <Text style={[styles.bodyText, {color: inRest.current ? "white" : "red", fontSize: 72}]}>{timeRemainingString}</Text>
                </View>
            </View>

            <LinearGradient colors={['red', '#04007D']} style={[styles.controls, {flexDirection: 'row', alignItems: 'center', 
            justifyContent: 'center', width: '100%'}]}>
                <TouchableOpacity style={[styles.touch]} onPress={() => {
                  if (paused) {
                    resume();
                    setPaused(false);
                    setPauseBtnText("Pause");
                  }
                  else {
                    pause();
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
    alignItems: "center",
    zIndex: 100,
  },
  bodyText: {
    fontSize: 32,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
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
    position: 'absolute',
    zIndex: 999,
    alignItems: 'center',
    width: '75%',
    height: '35%',
    marginTop: '50%',
    padding: '5%',
  }
});

export default TimedWorkoutExecution;