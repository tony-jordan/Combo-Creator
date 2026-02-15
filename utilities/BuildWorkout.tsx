// File: BuildWrkout.tsx
// Author: Tony Jordan
// Purpose: Utility for generating workout functionality

import React, { useEffect, useRef, useState, Dispatch, SetStateAction } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../utilities/StackNavigation';
import { StackNavigationProp } from '@react-navigation/stack';
import { getDBConnection, getStrikeSetByID } from './DefaultInfo';
import { usePauseableInterval, usePausableTimeout } from './WorkoutAnimation';
import { loadStrikeSounds, releaseStrikeSounds } from '../audiocontrol.js';
import Sound from 'react-native-sound';
import { WorkoutByStrikeSet, WorkoutByFavorite } from './WorkoutObject';
import { useKeepAwake, deactivateKeepAwake } from '@sayem314/react-native-keep-awake';
import { grabCombos } from '../components/WorkoutExecution';
import LinearGradient from 'react-native-linear-gradient';
import { updateChallenge } from './Challenges';
import Tts from 'react-native-tts';

type NavigationProp = StackNavigationProp<RootStackParamList, 'WorkoutExecution'>;

// function for formatting combo for user presentation during workout.
export function parseCombo(arr: string[]) {
    let result = '';
    for (let x = 0; x < arr.length; x++) {
        result += arr[x] + " "
    }
    return result;
}


export function BuildWorkout(props: {
    comboCount: number;
    throwCount: number;
    timePerStrike: number;
    paused: boolean;
    currentCombo: string[];
    setCurrentCombo: Dispatch<SetStateAction<string[]>>;
    strikeSetId: string;
    setWorkoutActive: Dispatch<SetStateAction<boolean>>;
    strikesPerCombo?: number;
    setFavorited?: Dispatch<SetStateAction<boolean>>;
    superFavorited?: boolean;
    setSuperFavorited?: Dispatch<SetStateAction<boolean>>;
    favorited?: boolean;
    setFavoriteBtnSize?: Dispatch<SetStateAction<number>>;
    setFavoriteBtnColor?: Dispatch<SetStateAction<string>>;
    setFavoriteBtnText?: Dispatch<SetStateAction<string>>;
    pbc?: number;
    pwrc?: number;
    strikes: any;
    executionTutorialComplete?: boolean;
    tutorialComplete?: boolean;
    setPaused: Dispatch<SetStateAction<boolean>>;
    tts?: boolean;
}) {
    useKeepAwake();
    const { comboCount, throwCount, timePerStrike, paused, currentCombo, setCurrentCombo,  
     strikeSetId, strikesPerCombo, setFavorited, superFavorited, setSuperFavorited, favorited, setFavoriteBtnColor, 
     setFavoriteBtnText, setWorkoutActive, pbc, pwrc, strikes, executionTutorialComplete, tutorialComplete, setPaused, tts} = props;
    const workoutRef = useRef<WorkoutByStrikeSet | null>(null);
    const [isWorkoutReady, setIsWorkoutReady] = useState(false);
    const [combos, setCombos] = useState<string[][]>([]);
    const [activeStates, setActiveStates] = useState<boolean[]>([]);
    const [comboCountText, setComboCountText] = useState(`Combo Count: 1/${comboCount}`);
    const [comboThrowsText, setComboThrowsText] = useState(`Combo Throws: 1/${throwCount}`);
    const [currentComboIndexX, setCurrentComboIndexX] = useState(0);
    const [currentComboIndexY, setCurrentComboIndexY] = useState(0);
    const [phase, setPhase] = useState<'interval' | 'midTimeout' | 'restTimeout'>('interval');
    const [timeoutKey, setTimeoutKey] = useState(0);
    const [activeRound, setActiveRound] = useState(1);
    const [roundChange, setRoundChange] = useState<boolean>(false);
    const [comboDone, setComboDone] = useState(false);
    const [readyToStart, setReadyToStart] = useState(false);
    const favoritedRef = useRef(favorited);
    const superRef = useRef(superFavorited)
    const [strikeSounds, setStrikeSounds] = useState<Sound[]>([]);
    const [favIndex, setfavIndex] = useState<number[]>([]);
    const [wait, setWait] = useState<string>("");
    const [waiting, setWaiting] = useState<boolean>(false);
    const [completedCount, setCompletedCount] = useState<number>(0);

    // React hooks used for tutorial
    const [segmentComplete, setSegmentComplete] = useState<boolean>(true);
    const [cc, setCC] = useState<boolean>(true);
    const [ct, setCT] = useState<boolean>(true);
    const [s, setS] = useState<boolean>(true);

    // if workout execution part of tutorial is complete, start this segment's tutorial
    useEffect(() => {
        if (executionTutorialComplete && !tutorialComplete) {
            setSegmentComplete(false);
            setCC(false);
        }
    }, [executionTutorialComplete])

    useEffect(() => {
    const updateChallengesForCombo = async () => {
    if (!currentCombo || currentCombo.length === 0) return;

    const db = await getDBConnection();
    const temp = [...currentCombo];

    updateChallenge(db, 'I fear not the man who has practiced 1000 strikes', temp.length)

    let checks = {
      jab : 0,
      cross : 0,
      hook : 0,
      uppercut : 0,
      overhand : 0,
      superman : 0,
      roundkick : 0,
      knee : 0,
      doublepunch : 0,
      ridgehand : 0,
      palmstrike : 0,
      snapkick : 0,
      heelkick : 0,
      teep : 0,
      elbow : 0,
      spinning : 0,
      check : 0,
      block : 0,
      weave : 0,
    }
    temp.map(async (strike) => {
        // skip fake or feint strikes
        if (strike.includes('fake') || strike.includes('feint')) return;

        if (!strike.includes('weave') && !strike.includes('dodge') && !strike.includes('block') && !strike.includes('check')) {
          // Basic strikes
          if (strike.includes('jab')) {
            checks.jab++;
          }

          if (strike.includes('cross')) {
            checks.cross++
          }

          if (strike.includes('hook')) {
            checks.hook++;
          }

          // Uppercuts
          if (/.*upper[- ]?cut$/i.test(strike)) {
            checks.uppercut++;
          }

          // Overhand
          if (/.*over[- ]?hand$/i.test(strike)) {
            checks.overhand++;
          }

          // Superman
          if (/.*super[- ]?man$/i.test(strike)) {
            checks.superman++;
          }

          // Roundhouse or switch kicks
          if (/.*(round[- ]?(kick|house)|switch[- ]?kick)$/i.test(strike)) {
            checks.roundkick++;
          }

          // Knees
          if (/.*knee$/i.test(strike)) {
            checks.knee++;
          }

          // Double punch
          if (/.*double[- ]?punch$/i.test(strike)) {
            checks.doublepunch++;
          }

          // Ridge hand
          if (/.*ridge[- ]?hand$/i.test(strike)) {
            checks.ridgehand++;
          }

          // Palm strike
          if (/.*palm[- ]?strike$/i.test(strike)) {
            checks.palmstrike++;
          }

          // Snap kick
          if (/.*snap[- ]?kick$/i.test(strike)) {
            checks.snapkick++;
          }

          // Heel kick
          if (/.*heel[- ]?kick$/i.test(strike)) {
            checks.heelkick++;
          }

          // Teep
          if (/.*teep$/i.test(strike)) {
            checks.teep++;
          }

          // Elbows
          if (/.*elbow$/i.test(strike)) {
            checks.elbow++;
          }

          // Spinning strikes
          if (/spinning/i.test(strike)) {
            checks.spinning++;
          }

        }
        else {
          // Checks
          if (/check/i.test(strike)) {
            checks.check++;
          }

          // Blocks
          if (/block/i.test(strike)) {
            checks.block++;
          }

          // Weaves
          if (/weave/i.test(strike)) {
            checks.weave++;
          }
        }
      })
      
    if (checks.jab > 0) {
      updateChallenge(db, JSON.stringify(['Jabbing Apprentice', 'Intermediate Jabber', 'Master Jabber', 'God-Tier Jabber']), checks.jab);
    }
    if (checks.cross > 0) {
      updateChallenge(db, JSON.stringify(['Cross Trainee','Cross Examiner','Crossing Menace','THE Crosser']), checks.cross);
    }
    if (checks.hook > 0) {
      updateChallenge(db, JSON.stringify(['Newbie Hooker', 'Certified Hooker', 'Captain Hooks','Hooked on Destruction']), checks.hook);
    }
    if (checks.uppercut > 0) {
     updateChallenge(db, JSON.stringify(['Uppercut Rookie','Chin Checker','Send Them to Orbit','Peek-a-boo-er']), checks.uppercut);
    }
    if (checks.overhand > 0) {
      updateChallenge(db, JSON.stringify(['Overhand Intern','Overhand Enthusiast','Meteor Fist Overhand',"You're gonna kill someone kid"]), checks.overhand);
    }
    if (checks.ridgehand > 0) {
        updateChallenge(db, JSON.stringify(['Amateur Ridger','Ridge Curious','Sideways Violence','Chop Supreme']), checks.ridgehand);
    }
    if (checks.superman > 0) {
        updateChallenge(db, JSON.stringify(['Sidekick','Anti-hero','Bona-fide Superhero','Super-DUPER man']), checks.superman);
        updateChallenge(db, 'Banshee Crusher', checks.superman);
    }
    if (checks.palmstrike > 0) {
      updateChallenge(db, JSON.stringify(['Open-Handed Apprentice','Respectful Violence','High-Five of Doom','Palm of Judgment']), checks.palmstrike);
    }
    if (checks.snapkick > 0) {
      updateChallenge(db, JSON.stringify(['Basic Snapper','Whiplash Enthusiast','Blink-and-You-Missed-It','Oof ouch my chin']), checks.snapkick);
    }
    if (checks.heelkick > 0) {
      updateChallenge(db, JSON.stringify(['Heel Turn','Backstabber','Eyes-in-the-Back-Kicker','No Look. All Damage.']), checks.heelkick);
    }
    if (checks.teep > 0) {
      updateChallenge(db, JSON.stringify(['Sleeper Teeper','Season for Teepin','Personal Space Enjoyer','Teepzilla']),checks.teep);
    }
    if (checks.elbow > 0) {
      updateChallenge(db, JSON.stringify(['Elbow Rookie','Close-Range Negotiator','Sharp Conversations','Built Different (and Dangerous)']),checks.elbow);
    }
    if (checks.spinning > 0) {
      updateChallenge(db, 'Tatsumaki', checks.spinning);
    }
    if (checks.knee > 0) {
      updateChallenge(db, JSON.stringify(['Beg-knee-ner','Clinch Goblin','Sir Knees-a-lot','Rib Breaker']), checks.knee);
      // prevent duplicate updates by adding all strikes from challenge
      updateChallenge(db, 'Nut Buster', checks.knee + checks.doublepunch);
    }
    if (checks.doublepunch > 0) {
      updateChallenge(db, JSON.stringify(['Two-Piece Starter',"Can't guard em both",'A PAIR of knuckle sandwiches','Kung Fu Panda']), checks.doublepunch);
      // if there are no knees, run the nut buster challenge check
      if (checks.knee == 0)
        updateChallenge(db, 'Nut Buster', checks.doublepunch);
    }
    if (checks.roundkick > 0) {
      updateChallenge(db, JSON.stringify(['Roundhouse Recruit','Bruised Shin Haver','Honorary Thai','Femur Obliterator']), checks.roundkick);
      // prevent duplicate updates by adding all strikes from challenge
      updateChallenge(db, 'Legs of Steel', checks.roundkick + checks.check);
    }
    if (checks.check > 0) {
      // if there are no round kicks, run the legs of steel challenge check
      if (checks.roundkick == 0)
        updateChallenge(db, 'Legs of Steel', checks.check);
      // prevent duplicate updates by adding all strikes from challenge
      updateChallenge(db, 'Ultra Instinct', checks.check + checks.block + checks.weave);
    }
    if (checks.block > 0) {
      if (checks.check == 0)
        updateChallenge(db, 'Ultra Instinct', checks.block + checks.weave);
    }
    if (checks.weave > 0) {
      if (checks.check == 0 && checks.block == 0)
        updateChallenge(db, 'Ultra Instinct', checks.weave);
    }
  };

  // Call the async updater
  updateChallengesForCombo();
}, [roundChange]);

    const nav = useNavigation<NavigationProp>();

    
    // Initialize workout once
    if (!workoutRef.current) {
        if (strikeSetId === "-999") {
            workoutRef.current = new WorkoutByFavorite (
            comboCount,
            throwCount,
            timePerStrike);
        }
        else {
            workoutRef.current = new WorkoutByStrikeSet (
                comboCount,
                throwCount,
                timePerStrike,
                strikesPerCombo,
                strikeSetId,
            );
        }
    }

    // refs for favorites
    useEffect(() => {
        favoritedRef.current = favorited;
    }, [favorited]);

    useEffect(() => {
        superRef.current = superFavorited;
    }, [superFavorited])

    useEffect(() => {
    }, [wait])

    const workout = workoutRef.current;

    // Fetch strike data
    useEffect(() => {
        const fetchData = async () => {
            // if this is configured to be favorite workout data pull is unnecessary
            const db = await getDBConnection();
            // grab values of all challenge data for workout summary stat animation

            if (strikeSetId != "-999") {
                const set = await getStrikeSetByID(db, workout.getStrikeSetId());
                workout.strikes = JSON.parse(set.strikes);
            }

            const builtCombos = await workout.setUpWorkout(strikes);

            setCombos(builtCombos);
            let temp: number[] = new Array(builtCombos.length).fill(0)
            setfavIndex(temp);
            setIsWorkoutReady(true);
            // if text to speech is not initialized, set up default strike sounds.
            if (tts == false || tts == undefined) {
              const loadedSounds = await loadStrikeSounds(builtCombos[0].length);
              setStrikeSounds(loadedSounds);
            }
            // update states once use effect finishes to prevent UI issues
            setTimeout(() => {
                if (setFavorited)
                setFavorited(false);
                if (setSuperFavorited)
                setSuperFavorited(false);
                setCurrentCombo(builtCombos[0]);
            }, 100);
        };
        //en-us-x-sfg-local
        Tts.setDefaultVoice('en-us-x-iom-local')
        let v = Tts.voices();
        console.log(v);
        if (timePerStrike >= 1250)
          Tts.setDefaultRate(0.5);
        else {
          // ranges for default rate are between .5 and .99
          // ranges for timePerStrike is between 500 & 1250 (upper limit is actually 2000, but tps past 1250 will treat as the same)
          // do some fancy math to figure out how quickly the voice needs to play
          const rate = .99 - (((timePerStrike - 500)/(750)) * .49)
          Tts.setDefaultRate(rate);
        }
        fetchData();
    }, []);

    // ensure all necessary data is present and populated before starting workout
    // (this can potentially be deleted, as it was added because of sound issues that were
    // found to be caused by utilization of an android emulator)
    useEffect(() => {
        if (combos.length > 0 && isWorkoutReady) {
            setReadyToStart(true);
        }
    }, [isWorkoutReady]);

    // Set active combo states when combos are ready
    useEffect(() => {
        if (combos.length > 0 && isWorkoutReady) {
            workout.initiateComboActiveStrike(combos[currentComboIndexX], setActiveStates);
        }
    }, [combos, isWorkoutReady]);


    useEffect(() => {
      if (tts) {
        if (activeStates.includes(true)) {
          Tts.speak(currentCombo[activeStates.findIndex((item) => item == true)]);
        }
      }
    }, [activeStates])

    // call use pauseable interval for creating a pauseable workout interface for the user.
    usePauseableInterval(
        !readyToStart || paused || phase !== 'interval',
        timePerStrike,
        activeStates,
        setActiveStates,
        setCurrentComboIndexY,
        throwCount,
        () => {
            // Between combos
            setActiveRound(prev => {
                setComboThrowsText(`ComboThrows: ${prev + 1}/${throwCount}`);
                setRoundChange(!roundChange);
                return prev + 1;
            });
            setPhase('midTimeout');
            setTimeoutKey(k => k + 1);
        },
        () => {
            // All throws of current combo done
            setCurrentComboIndexX(prev => {
                const nextIndex = prev + 1;
                if (tts!) {
                  setCompletedCount(nextIndex)
                  releaseStrikeSounds(strikeSounds);
                }
                if (nextIndex >= combos.length) {
                    setTimeout(() => setComboDone(true), 0);
                    return prev;
                }
                workout.initiateComboActiveStrike(combos[nextIndex], setActiveStates);
                setComboCountText(`ComboCount: ${nextIndex + 1}/${comboCount}`);
                setComboThrowsText(`ComboThrows: 1/${throwCount}`);
                setCurrentComboIndexY(NaN);
                if (activeRound == throwCount)
                  setRoundChange(!roundChange);
                setActiveRound(1);

                (async () => {
                    if (favoritedRef.current) {
                        let temp = favIndex;
                        temp[currentComboIndexX] = superRef.current ? 2 : 1
                        setfavIndex(temp);
                    }
                    if (!tts) {
                      const loadedSounds = await loadStrikeSounds(combos[nextIndex].length);
                      setStrikeSounds(loadedSounds);
                    }
                })();
                // reset super favorite nodes when moving on to next combo
                setTimeout(() => {
                    
                    setCurrentCombo(combos[nextIndex])
                    if (setSuperFavorited)
                    setSuperFavorited(false);
                    if (setFavorited)
                    setFavorited(false)
                    if (setFavoriteBtnColor)
                    setFavoriteBtnColor('gold');
                    if (setFavoriteBtnText)
                    setFavoriteBtnText("Favorite!");
                }, 0);
                return nextIndex;
            });
            setPhase('restTimeout');
            setTimeoutKey(k => k + 1);
        },
        strikeSounds,
    );

    useEffect(() => {
        if (comboDone) {
            // add last combo to favorites before ending workout, navigating to workout customization
            if (favoritedRef.current) {
                (async () => {
                    try {
                        let temp = favIndex;
                        temp[currentComboIndexX] = superRef.current ? 2 : 1
                        setfavIndex(temp);
                    } catch (error) {
                        console.error("Failed to add to favorites:", error);
                    }
                })();
            }
            // set workout active to false to initiate navigation to workout summary
            grabCombos(combos, favIndex, completedCount)
            setRoundChange(!roundChange);
            setWorkoutActive(false);
            deactivateKeepAwake();
        }
    }, [comboDone]);

    // Mid 3s timeout
    usePausableTimeout(paused || phase !== 'midTimeout', pwrc ? pwrc : 3000, () => {
        setWait("");
        setPhase('interval')
        }, timeoutKey, setWait, setWaiting);

    // Rest 5s timeout
    usePausableTimeout(
        paused || phase !== 'restTimeout', pbc ? pbc : 5000,
        () => {
            setPhase('interval');
            setCurrentComboIndexY(0);
            setTimeoutKey(k => k + 1);
            setWait("");
        },
        timeoutKey, setWait, setWaiting);

    // Wait until workout and combos are ready
    if (!isWorkoutReady || combos.length === 0 || !combos[currentComboIndexX]) {
        return (
            <View style={styles.workoutBody}>
                <Text style={styles.bodyText}>Loading workout...</Text>
            </View>
        );
    }

    return (
        <View style={styles.bodyMain}>
            { paused && 
                <LinearGradient colors={['red', '#04007D']} style={[styles.pauseView]}>
                <Text style={[styles.homeButtonText, { color: 'white' }]}>Workout is paused...</Text>
                <Text style={[styles.homeButtonText, { fontSize: 22}]}>Current Combo:</Text>
                <Text style={[styles.homeButtonText, { fontSize: 15, textAlign: 'center' }]}>{parseCombo(combos[currentComboIndexX])}</Text>
                <TouchableOpacity onPress={() => {
                    if (favoritedRef.current) {
                        (async () => {
                            try {
                                let temp = favIndex;
                                temp[currentComboIndexX] = superRef.current ? 2 : 1
                                setfavIndex(temp);
                            } catch (error) {
                                console.error("Failed to add to favorites:", error);
                            }
                        })();
                    }
                    deactivateKeepAwake();
                    grabCombos(combos, favIndex, completedCount);
                    setWorkoutActive(false);
                }}>
                    <LinearGradient colors={['red', 'black']} style={[styles.controlButton, { backgroundColor: 'red' }]}>
                        <Text style={styles.homeButtonText}>End Workout?</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </LinearGradient>
            }
            
            <View style={styles.workoutBody}>
                <Text style={[styles.bodyText, {zIndex: cc ? 1 : 105}]}>{comboCountText}</Text>
                <Text style={[styles.bodyText, { marginBottom: '15%', zIndex: ct ? 1 : 105 }]}>{comboThrowsText}</Text>
                {/* If workout is from strike set, get numbers from strikes, if not, only display combo strike names */}
                <View style={{ zIndex: s ? 1 : 105}}>
                    {strikeSetId != "-999" ? workout.buildText(
                    workout.getComboNumsByAlpha(combos[currentComboIndexX]),
                    activeStates) : null}
                    {workout.buildText(combos[currentComboIndexX], activeStates)}
                </View>

                <Text style={[styles.bodyText, { fontSize: 40, marginTop: '15%', color: 'red', 
                    display: wait == "" ? 'flex' : 'none', zIndex: s ? 1 : 105 }]}>
                    {combos[currentComboIndexX][currentComboIndexY]}
                </Text>
                <Text style={[styles.bodyText, { fontSize: 32, marginTop: '15%', color: 'red' }]}>
                    {wait}
                </Text>
            </View>
        </View>
    );
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
        color: 'white',
        fontWeight: 'bold',
        margin: 10,
        textAlign: 'center',
    },
    pauseView: {
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

export default BuildWorkout;
