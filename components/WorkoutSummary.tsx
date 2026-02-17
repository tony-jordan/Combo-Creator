// File: WorkoutSummary.tsx
// Author: Tony Jordan
// Purpose: Give users summary of workout, and display all combos for user to like if they were not able to

import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, TouchableWithoutFeedback, Dimensions} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import { RootStackParamList } from '../utilities/StackNavigation';
import { useRoute, RouteProp } from '@react-navigation/native';
import { addToFavorites, getDBConnection, createReport, getFavoriteCombos } from '../utilities/DefaultInfo';
import { sortCounts } from '../utilities/SortData';
import LinearGradient from 'react-native-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';;
import { runOnJS, scheduleOnRN } from 'react-native-worklets';
import { getChallengeValues, guidedWorkoutChallenges, medalImages, metrics, updateChallenge } from '../utilities/Challenges';

export type info = {name: string, count: number};

const WorkoutSummary = () => {

  const SCREEN_WIDTH = Dimensions.get('screen').width;
  const SCREEN_HEIGHT = Dimensions.get('screen').height;
  const BAR_WIDTH = SCREEN_WIDTH * .25

  const [strikeNumbers, setStrikeNumbers] = useState<info[]>([]);
  const [allStrikes, setAllStrikes] = useState<string[][]>([]);
  const [date, setDate] = useState<string>(new Date().toString());
  const [loadingText, setLoadingText] = useState<string>("Adding Favorites")

  const nav = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, "WorkoutSummary">>();
  const time = route.params.time;
  const [fav, setFav] = useState(route.params.favorited);
  const data = route.params.combos;
  const bf = route.params.bf;

  const [progressMenu, setProgressMenu] = useState<boolean>(true)
  const [singeAnimation, setSingeAnimation] = useState<boolean>(true);

  const [updated, setUpdated] = useState<boolean>(false);

  const width = useSharedValue(0);
  
    const loadingBarStyle = useAnimatedStyle(() => {
      return { 
        width: width.value
      }
    })

    const onLoadingBarEnd = () => {
      setLoadingText("Creating new report")
      setTimeout(() => {
        nav.reset({
          index: 0,
          routes: [{ name: "Home" as never }]
        })
      }, 500)
    }

    const onLoadingBarHalf = () => {
      setLoadingText("Creating new report")
    }
  
    const loadBar = () => {
      // scale all elements to create the appearance of an approach
      'worklet';
      width.value = withTiming(150, { duration: 750 }, () => {
        scheduleOnRN(onLoadingBarHalf);
        'worklet';
        width.value = withTiming(300, { duration: 1500 }, () => {
          scheduleOnRN(onLoadingBarEnd);
        })
      });
    }

  const [challengeValues, setChallengeValues] = useState<metrics[]>([])
  //const [progressAnimations, setProgressAnimations] = useState<any>([]);
  useEffect(() => {
    const grabChallengeInfo = async () => {
      const db = await getDBConnection();
      setChallengeValues(await getChallengeValues(db, guidedWorkoutChallenges))
    }
    grabChallengeInfo();

  }, [])

  const progressAnimations = route.params.startMetrics.map((item, index) => {
      const bwidth = useSharedValue((BAR_WIDTH * (item.value / item.threshold)));
      const animation = useAnimatedStyle(() => {
          return {
              // moves to be made
              width: bwidth.value
          }
      })
      return {name: item.name, width: bwidth, animation: animation}
  })

  useEffect(() => {
    if (progressAnimations.length == challengeValues.length) {
      setSingeAnimation(true);
      for (let x = 0; x < progressAnimations.length; x++) {
        updateAnimation(x);
      }
    }
  }, [challengeValues])

  function startImageAnimation() {
  let index = 0;
  return setInterval(() => {
    setProgressImage(progressImgs[index]);
    index = Math.floor(Math.random() * ((progressImgs.length - 1) - 1))
    if (index >= progressImgs.length) index = 0;
  }, 50);
}

const onSingeEnd = React.useCallback(() => {
    setSingeAnimation(false);
  }, []);


  function updateAnimation(index: number) {
    let multiplier = challengeValues[index].value / challengeValues[index].threshold
    if (challengeValues[index].value / challengeValues[index].threshold >= 1)
      multiplier = 1;
    const p_animation = startImageAnimation();
    'worklet';
    // start all progress animations
    progressAnimations[index].width.value = withTiming((SCREEN_WIDTH * .25) * multiplier, { duration: 3000, easing: Easing.inOut(Easing.ease) }, (finished) => {
      if (finished) {
        clearInterval(p_animation);
        scheduleOnRN(onSingeEnd)
      }
    });
  }
  

  useEffect(() => {
    const fetchData = async () => {
      const db = await getDBConnection();
      const reports = (await getFavoriteCombos(db));
      setAllStrikes(reports);

      if (reports.length > 0) {
        // format reports
        const output: info[] = [];
        for (let x = 0; x < reports.length; x++) {
          for (let y = 0; y < reports[x].length; y++) {
            const index = output.findIndex(item => item.name === reports[x][y])
            if (index != -1) {
               output[index].count++;
            }
            else {
              output.push({name: reports[x][y], count: 1});
            }
          }
        }
        sortCounts(output);
        setStrikeNumbers(output);
        await createReport(db, JSON.stringify(output), date);
      }
    }
    if (updated) {
      fetchData();
      loadBar();
    }
  }, [updated])

  useEffect(() => {
  }, [fav])

  // consolidate data into readable combos
  let combos = [];
  for (let x = 0; x < data.length; x++) {
    let str = "";
    for (let y = 0; y < data[x].length; y++) {
        if (y != data[x].length - 1)
            str += (data[x][y] + ", ");
        else
            str += data[x][y];
    }
    combos.push(str);
  }
  // intialize colors and button text and store in react hooks
  const colorsInit = fav.map((item) => {
    switch(item) {
        case 0:
            return "gold"
        case 1:
            return "#3f48cc"
        case 2:
            return "#8d0d0dff"
    }
  });
  const [colors, setColors] = useState(colorsInit);

  const btnTextInit = fav.map((item) => {
    switch(item) {
        case 0:
            return "Favorite"
        case 1:
            return "Super Favorite"
        case 2:
            return "Cancel Favorite"
    }
  });
  const [btnText, setBtnText] = useState(btnTextInit);

  let startMetrics = route.params.startMetrics;

  const progressImgs = [
    require('../assets/Animations/progress/progress-1.png'),
    require('../assets/Animations/progress/progress-2.png'),
    require('../assets/Animations/progress/progress-3.png'),
    require('../assets/Animations/progress/progress-4.png')
  ]
  const [progressImage, setProgressImage] = useState(progressImgs[0])

    return (
        <LinearGradient colors={['black', '#04007D']} style={styles.screen} >
          {startMetrics != challengeValues && progressMenu &&
            <LinearGradient colors={['black', '#04007D']} style={{width: '95%', height: '100%', alignSelf: 'center', position: 'absolute', zIndex: 999,
              justifyContent: 'center', flexWrap: 'wrap'
            }}>
              <ScrollView contentContainerStyle={{alignItems: 'center'}}>
                <Text style={[styles.headText, {fontSize: 18, padding: 1}]}>Challenge Progress</Text>
                <View style={{flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center'}}>
                  {challengeValues.map((item, index) => (
                    <View key={index} style={{width: startMetrics.find(val => val.name == item.name) && startMetrics[startMetrics.findIndex(val => val.name == item.name)].value != item.value ? '25%' : 0}}>
                      {startMetrics.find(val => val.name == item.name) && startMetrics[startMetrics.findIndex(val => val.name == item.name)].value != item.value && 
                        <View style={{alignItems: 'center', borderColor: 'white', borderWidth: 3, borderRadius: 10, width: '100%', justifyContent: 'space-evenly', height: SCREEN_HEIGHT / 3}}>
                          <Image style={{height: SCREEN_HEIGHT * .07, width: SCREEN_HEIGHT * .1, resizeMode: 'contain'}} source={item.tier != undefined ? item.tier == 0 ? require('../assets/locked.png') : medalImages[medalImages.findIndex(m => m.name == JSON.parse(item.name)[0])].items[item.tier] || require('../assets/locked.png') : item.threshold > item.value ? require('../assets/locked.png') : medalImages[medalImages.findIndex(m => m.name == item.name)].items[0] || require('../assets/locked.png')}/>
                          <Text style={[styles.itemText, {textAlign: 'center', height: '30%'}]}>{item.tier != undefined ? item.tier == 0 ? '???' : JSON.parse(item.name)[item.tier] : item.value < item.threshold ? '???' : item.name}</Text>
                          <Text style={[styles.headText, {fontSize: 18, padding: 1}]}>+{item.value - startMetrics[startMetrics.findIndex(val => val.name == item.name)].value}</Text>
                          <View style={{width: SCREEN_WIDTH * .2, backgroundColor: 'white', height: SCREEN_HEIGHT * .01, borderWidth: 1, borderColor: 'black'}}>
                            <Animated.View style={[progressAnimations[index].animation, {backgroundColor: 'red', height: '100%', position: 'absolute', alignItems: 'flex-end'}]}>
                              <Image source={progressImage} style={{height: '100%', width: BAR_WIDTH * .02, resizeMode: 'stretch', opacity: singeAnimation ? 1 : 0}}/>
                            </Animated.View>
                          </View>
                        </View>
                      }
                     </View>
                  ))}
                </View>
              </ScrollView>
              <View style={{width: SCREEN_WIDTH * .9, alignItems: 'center', alignSelf: 'center'}}>
                 <TouchableOpacity style={{width: '100%'}} onPress={() => {
                  setProgressMenu(false);
                 }}>
                  <LinearGradient colors={['red', '#390842']} style={[styles.controlButton, {backgroundColor: "red"}]}>
                    <Text style={{color: "white", fontSize: 30, fontWeight: "bold", padding: '1%'}}>Exit</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          }
          <LinearGradient colors={['#04007D', 'red']} style={styles.head}>
            <View style={{alignItems: 'center', justifyContent: 'center'}}>
              <Text style={[styles.headText, {textAlign: 'center', paddingStart: '1%', paddingEnd: '1%', color: 'white'}]}>Combo Creator</Text>
            </View>
          </LinearGradient>
    
          <View style={styles.bodyMain}>
            <Text style={{fontWeight: 'bold', padding: '1%', fontSize: 20, color: 'white'}}>Workout Summary</Text>
            <View style={[styles.row, {borderBottomColor: 'transparent'}]}>
                <Text style={styles.itemText}>Time Elapsed: </Text>
                <Text style={[styles.itemText, {color: 'red'}]}>{time}</Text>
            </View>
            <View style={[styles.row, {justifyContent: bf ? 'center' : 'space-between', paddingBottom: '3%', borderTopColor: "transparent", 
              flexDirection: bf ? 'column' : 'row', alignItems: 'center'}]}>
                <Text style={styles.itemText}>Combos</Text>
                <Text style={[styles.itemText, {display: bf ? 'none': 'flex'}]}>Favorited</Text>
            </View>
            <ScrollView style={{width: '100%'}}>
                {combos.map((item, index) => (
                  <View key={index}>
                    <View style={[styles.row, {alignItems: 'center', flexDirection: bf ? 'column' : 'row'}]}>
                        <Text style={[styles.itemText, {maxWidth: '50%', textAlign: bf ? 'center' : 'left'}]}>{combos[index]}</Text>
                        <TouchableOpacity style={{display: bf ? "none" : 'flex', width: '50%'}} onPress={() => {
                            let temp = [...fav];
                            let btemp = [...btnText];
                            let ctemp = [...colors];
                            temp[index] += 1;
                            if (temp[index] == 3) {
                                temp[index] = 0;
                                btemp[index] = "Favorite";
                                ctemp[index] = "gold";
                            }
                            else if (temp[index] == 2) {
                                btemp[index] = "Cancel Favorite";
                                ctemp[index] = "#8d0d0dff"
                            }
                            else if (temp[index] == 1) {
                                btemp[index] = "Super Favorite"
                                ctemp[index] = "#3f48cc"
                            }
                            setFav(temp);
                            setBtnText(btemp);
                            setColors(ctemp);
                        }}>
                            <LinearGradient colors={[colors[index] as string, 'black']} style={[styles.favbtn, {backgroundColor: colors[index]}]}>
                                <Text style = {[styles.homeButtonText, {fontSize: 24}]}>{btnText[index]}</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                    <View style={{display: route.params.count == index ? 'flex' : 'none', width: '100%', alignItems: 'center', backgroundColor: 'red', borderStyle: 'solid', 
                      borderWidth: 1, borderColor: 'black'
                    }}>
                        <Text style={{color: 'white', textAlign: 'center', fontWeight: 'bold'}}>Workout Ended Here</Text>
                    </View>
                  </View>
                ))}
            </ScrollView>
          </View>
          
          <View style={styles.controls}>
            <LinearGradient colors={['red', '#04007D']} style={{flexDirection: 'row', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center',
            borderTopLeftRadius: 30, borderTopRightRadius: 30}}>
            <TouchableOpacity onPress={() => {
              const addFavorites = async () => {
                let reportAdded = false;
                const db = await getDBConnection();
                // iterate through all combos and add if favorited
                for (let x = 0; x < data.length; x++) {
                  if (fav[x] > 0) {
                     await updateChallenge(db, "A Journey's Beginning", 1);
                    await addToFavorites(db, JSON.stringify(data[x]), fav[x] == 2 ? 1 : 0);
                    reportAdded = true;
                  }
                }
                if (reportAdded)
                  setUpdated(reportAdded);
                else
                  nav.reset({
                  index: 0,
                  routes: [{ name: "Home" as never }]
                  })
              }
              if (!bf) {
                addFavorites()
              }
              else {
                nav.reset({
                  index: 0,
                  routes: [{ name: "Home" as never }]
                })
              }

            }}>
              <LinearGradient colors={['red', '#390842']} style={[styles.controlButton, {backgroundColor: "red"}]}>
                <Text style={{color: "white", fontSize: 30, fontWeight: "bold", padding: '1%'}}>Exit</Text>
              </LinearGradient>
            </TouchableOpacity>
            </LinearGradient>
          </View>
          {updated && 
          <LinearGradient colors={['red', '#04007D']} style={{position: 'absolute', borderRadius: 10, borderColor: 'black', borderWidth: 2, width: '95%', height: '25%',
            alignSelf: 'center', marginTop: '50%'
          }}>
            <Text style={{color: "white", fontSize: 30, fontWeight: "bold", padding: '5%', textAlign: 'center'}}>{loadingText}</Text>
            <View style={[styles.loadingBar, {alignSelf: 'center'}]}>
              <Animated.View style={[loadingBarStyle, styles.loadingBar, {width: 0, backgroundColor: 'blue'}]}></Animated.View>
            </View>
          </LinearGradient>
          }
        </LinearGradient>
      );
}

const styles = StyleSheet.create({
  screen: {
    flex: 6,
  },
  head: {
    flex: .3,
    justifyContent: 'flex-start',
    backgroundColor: "red",
  },
  headText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 30,
    paddingStart: 10,
    paddingTop: 20,
  },
  loadingBar: {
    width: 300,
    backgroundColor: 'gray',
    height: 10,
    borderWidth: 1
  },
  bodyMain: {
    flex: 3,
    borderColor: "black",
    justifyContent: 'center',
    alignItems: "center",
    padding: '1%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: "100%",
    borderColor: 'white',
    borderWidth: 1,
    borderStyle: 'solid',
    padding: '1%',
  },
  rowItem: {
    maxWidth: '50%',
  },
  controls: {
    height: '10%',
  },
  controlButton: {
    justifyContent: "center",
    alignItems: 'center',
    padding: '3%',
    borderStyle: "solid", 
    borderWidth: 3, 
    borderColor: 'black', 
    borderRadius: 30,
  },
  viewButton: {
    padding: "5%",
    borderStyle: "solid",
    borderWidth: 3,
    borderColor: 'black',
    borderRadius: 40,
    justifyContent: "space-around",
    alignItems: 'center'

  },
  viewButtonText: {
    color: "white",
    fontWeight: 'bold',
    fontSize: 18,
  },
  favbtn: {
    margin: '1%',
    width: '100%',
    borderStyle: "solid",
    borderWidth: 3,
    borderColor: 'black',
    borderRadius: 40,
    justifyContent: "center",
    alignItems: 'center'
  },
  homeButtonText: {
    color: "white",
    fontWeight: 'bold',
    fontSize: 40,
  },
  itemText: {
    fontWeight: 'bold',
    color: 'white',
  }
});

export default WorkoutSummary;