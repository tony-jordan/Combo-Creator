// File: Home.tsx
// Author: Tony Jordan
// Purpose: Home component in UI. First destination of users when opening the app.

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, useWindowDimensions, Alert, Dimensions, ScrollView } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getDBConnection, getRecentWorkouts, DataSet, getStrikeSets, getFavorites, getChallenges } from '../utilities/DefaultInfo';
import LinearGradient from 'react-native-linear-gradient';
import { getLast7Days } from '../utilities/DateUtility';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, useAnimatedProps, Easing } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import SwipeSnapSelector from '../utilities/SnapCarousel';
import { scheduleOnRN } from 'react-native-worklets';
import { RootStackParamList } from '../utilities/StackNavigation';
import { StackNavigationProp } from '@react-navigation/stack';
import { HomeDropdown } from '../utilities/HomeDropdown';
import { setHighestStrikeCount, updateChallenge, medalImages } from '../utilities/Challenges';


/* inputs for emulator and BYOD development */
// adb shell input keyevent 82 
// adb reverse tcp:8089 tcp:8089
// npx react-native start --reset-cache --port=8089
// npx react-native run-android
// npm run release
// npm run full-release

type NavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const theme = ['#04007D', 'red']

const menuFont = Dimensions.get('window').width / 34.28571425;

const Home = () => {
  const [workouts, setWorkouts] = useState<string[]>([]);
  const [counts, setCounts] = useState<number[]>([]);
  const [animationActive, setAnimationActive] = useState<boolean>(false);

  // for workout execution 
  const [selectedStrikeSet, setStrikeSet] = useState<string>("0")
  const [byStrikeSet, setByStrikeSet] = useState<boolean>(false);
  const [selectingWorkout, setSelectingWorkout] = useState<boolean>(false);
  const [selectingType, setSelectingType] = useState<boolean>(false);

  // for favorite/strike set editing
  const [favoritesDropdown, setFavoritesDropdown] = useState<boolean>(false);
  const [selectedFavorite, setSelectedFavorite] = useState<string>('not set');
  const [favNavigation, setFavNavigation] = useState<boolean>(false)

  const [strikeSetsDropdown, setStrikeSetsDropdown] = useState<boolean>(false);
  const [ddSelectedStrikeSet, ddSetSelectedStrikeSet] = useState<string>('not set');
  const [strikeSetNavigation, setStrikeSetNavigation] = useState<boolean>(false)

  // data sets for drop down menus
  const [favorites, setFavorites] = useState<any[]>([]);
  const [ogFavorites, setOGFavorites] = useState<any[]>([]);
  const [strikeSets, setStrikeSets] = useState<any[]>([]);
  const [ogStrikeSets, setOGStrikeSets] = useState<any[]>([]);

  const [strikeAnimation, setStrikeAnimation] = useState<boolean[]>([true, false, false]);

  useEffect(() => {
    if (strikeSetNavigation) {
      if (ddSelectedStrikeSet != 'not set') {
        nav.navigate('StrikeSetsCustomization', {set: {id: strikeSets[parseInt(ddSelectedStrikeSet)].id, strikes: strikeSets[parseInt(ddSelectedStrikeSet)].strikes,
           name: strikeSets[parseInt(ddSelectedStrikeSet)].name, locked: strikeSets[parseInt(ddSelectedStrikeSet)].locked == 1 ? true : false}})
      }
      else 
        nav.navigate('StrikeSetsCustomization', {set: {id: 'not set', strikes: [], name: 'Custom Strike set', locked: false}})
    }
  }, [strikeSetNavigation])

  useEffect(() => {
    if (favNavigation) {
      if (selectedFavorite == 'not set') {
        nav.navigate('FavoritesOverview', {favorite: {id: 'not set', strikes: [], name: null, super: 0}})
      }
      else {
        nav.navigate('FavoritesOverview', {favorite: {id: favorites[parseInt(selectedFavorite)].id, strikes: favorites[parseInt(selectedFavorite)].strikes,
        name: favorites[parseInt(selectedFavorite)].name, super: favorites[parseInt(selectedFavorite)].super_favorite == 1 ? true : false
      }})
      }
    }
  }, [favNavigation])

  // medal auto scroll animation

  const medalImgs = [require('../assets/medals/locked.png'),require('../assets/medals/bronze.png'), require('../assets/medals/silver.png'), require('../assets/medals/gold.png'), require('../assets/medals/master.png')]

  const medalScrollRef = useRef<ScrollView>(null);
  const isUserScrolling = useRef(false);
  const scrollX = useRef(0);
  useEffect(() => {
    const containerWidth = challenges.length * 130

    const interval = setInterval(() => {
      if (isUserScrolling.current) return;
      scrollX.current += width / 3; // ~ medal width + margin
      if (scrollX.current > containerWidth) {
        scrollX.current = 0;
      }
      medalScrollRef.current?.scrollTo({
       x: scrollX.current,
        animated: true,
      });
    }, 5000);

  return () => clearInterval(interval);
}, []);

  // animation values
  const { width } = useWindowDimensions();
  const WigglePath = Animated.createAnimatedComponent(Path);
  const wiggle = useSharedValue(0);

  const wiggleProps = useAnimatedProps(() => {
    const controlY = wiggle.value;
    const yOffset = 10; 
    const d = `M0,${yOffset} C ${width * .25},${yOffset + controlY} ${width * .75},${yOffset + controlY} ${width},${yOffset}`;
    return { d }
  })

  const [timer, setTimer] = useState<number>(180);
  const [timeString, setTimeString] = useState<string>(`03:00`);
  const [rounds, setRounds] = useState<number>(1);

  useEffect(() => {
  return () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };
}, []);

const intervalRef = useRef<NodeJS.Timeout | null>(null);
const shouldRunRef = useRef(true);

var d: NodeJS.Timeout;

const startStrikeAnimation = () => {
  if (intervalRef.current) return; // prevent duplicate intervals

  shouldRunRef.current = true;

  d = setInterval(() => {
    setTimer((prev) => {
      let minutes = Math.floor(prev / 60).toString();
      let seconds = (prev % 60).toString();

      if (minutes.length == 1) {
        if (seconds.length == 1) {
          setTimeString(`0${minutes}:0${seconds}`)
        }
        else {
          setTimeString(`0${minutes}:${seconds}`)
        }
      }
      else {
        if (seconds.length == 1) {
          setTimeString(`${minutes}:0${seconds}`)
        }
        else {
          setTimeString(`${minutes}:${seconds}`)
        }
      }
      if (prev - 1 < 0) {
        setRounds((p) => {
          if (p == 12)
            return 1
          else
            return p + 1
        })
        return 180;
      }
      else
        return (prev - 1);
    });

  }, 1000)

  intervalRef.current = setInterval(() => {
    if (!shouldRunRef.current) {
      clearInterval(intervalRef.current!);
      clearInterval(d);
      intervalRef.current = null;
      return;
    }

    setStrikeAnimation((prev) => {
      const currentIndex = prev.findIndex(Boolean);
      const nextIndex = (currentIndex + 1) % prev.length;

      return prev.map((_, i) => i === nextIndex);
    });
  }, 750);
};

const stopStrikeAnimation = () => {
  shouldRunRef.current = false;
};

  const onWiggleEnd = React.useCallback(() => {
    setSelectingWorkout(true);
    // set animation for strike UI 
    startStrikeAnimation();
  }, []);

  const startWiggle = () => {
    'worklet';
    wiggle.value = withTiming(15, { duration: 200, easing: Easing.inOut(Easing.ease) }, () => {
      'worklet';
      wiggle.value = withTiming(-7.5, { duration: 200, easing: Easing.inOut(Easing.ease) }, () => {
        'worklet';
        wiggle.value = withTiming(3.75, { duration: 200, easing: Easing.inOut(Easing.ease) }, () => {
          'worklet';
            wiggle.value = withTiming(0, { duration: 150, easing: Easing.inOut(Easing.ease) }, () => {
              scheduleOnRN(onWiggleEnd);
            })
        });
      });
    });
  };

  useEffect(() => {
    if (selectingWorkout)
      animateMenu();
  }, [selectingWorkout])


  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);

  const aApproachStyle = useAnimatedStyle(() => {
    return {
      transform: [
        // moves to be made
        { scale: scale.value },
        { translateY: translateY.value},
      ]
    }
  })

  const startApproach = () => {
    'worklet';
    // scale all elements to create the appearance of an approach
    translateY.value = withTiming(350, { duration: 300 }, () => {
      'worklet';
      // translate back down a bit after upward translation to create the appearance of a 'hop'
      translateY.value = withTiming(250, { duration: 200 })
    });
    scale.value = withTiming(1.3, { duration: 500}, () => {
      startWiggle();
    })
  }

  const reverseApproach = () => {
    'worklet';
    // scale all elements to create the appearance of an approach
    translateY.value = withTiming(350, { duration: 300 }, () => {
      'worklet';
      // translate back down a bit after upward translation to create the appearance of a 'hop'
      translateY.value = withTiming(0, { duration: 300 })
    });
    scale.value = withTiming(1, { duration: 600})
  }
  
  const opacity = useSharedValue(0);

  const aMenuStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    }
  })

  const animateMenu = () => {
    'worklet';
    // scale all elements to create the appearance of an approach
    opacity.value = withTiming(1, { duration: 300 });
  }

  const deAnimateMenu = () => {
    'worklet';
    // scale all elements to create the appearance of an approach
    opacity.value = withTiming(0, { duration: 100 });
  }

  const days = getLast7Days();

  var totalWorkouts = () => {
    var total = 0;
    for (let x = 0; x < counts.length; x++) {
      total += counts[x];
    }
    return total;
  }

  const [challenges, setChallenges] = useState<any[]>([])

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
      try {
      const db = await getDBConnection();

      // grab workout data
      let [result] = await getRecentWorkouts(db);
      // declare empty array to hold data
      let temp = new Array
      // iterate through workouts and place in corresponding array value
      for (let x = 0; x < days.length; x++) {
        // if date is the same in database, form array to prep for assignment via react hook
        let data = [];
        for (let y = 0; y < result.rows.length; y++) {
          if (result.rows.item(y).date == days[x]) {
            data.push(result.rows.item(y).time_spent);
          }
        }
        temp.push(data);
      }
      let c = new Array(temp.length).fill(0);
      let emptyDays = 0;
      // iterate through temp and find total time of each workout
      let payload : string[] = new Array(temp.length);
      for (let x = 0; x < temp.length; x++) {
        c[x] = temp[x].length;
        if (temp[x].length > 0) {
          let minutes = 0;
          let seconds = 0;
          for (let y = 0; y < temp[x].length; y++) {
            const splitTime = temp[x][y].split(':')
            minutes += parseInt(splitTime[0]);
            seconds += parseInt(splitTime[1]);
          }
          let totalTime = (60 * minutes) + seconds;
          let min = Math.floor(totalTime/60).toString();
          let sec = (totalTime % 60).toString();
          if (min.length < 3) {
            while (min.length < 3) {
              min = '0' + min;
            }
          }
          if (sec.length < 2) {
            while (sec.length < 2) {
              sec = '0' + sec;
            }
          }
          payload[x] = min + ':' + sec;
        }
        else {
          emptyDays++;
          payload[x] = '000:00';
        }
      }
      // check to see if challenge is completed before changing
      const [dayCheck] = await db.executeSql('SELECT achieved FROM challenges WHERE name = (?)', [JSON.stringify(['Your Single Step','A Double','A Turkey','A Quad','The Big V','Wind down a bit huh?','You should probably get some rest'])]);
      if (dayCheck.rows.item(0).achieved == 0) {
        let streakValue = 7 - emptyDays;
        if (streakValue == 7) {
          await db.executeSql(`UPDATE challenges SET value = (?), tier = (?), achieved = (?) WHERE name = (?)`, [7 - emptyDays, 7 - emptyDays, 1, JSON.stringify(['Your Single Step','A Double','A Turkey','A Quad','The Big V','Wind down a bit huh?','You should probably get some rest'])]);
        }
        else {
          await db.executeSql(`UPDATE challenges SET value = (?), tier = (?) WHERE name = (?)`, [7 - emptyDays, 7 - emptyDays, JSON.stringify(['Your Single Step','A Double','A Turkey','A Quad','The Big V','Wind down a bit huh?','You should probably get some rest'])]);
        }
        await updateChallenge(db, JSON.stringify(['Your Single Step','A Double','A Turkey','A Quad','The Big V','Wind down a bit huh?','You should probably get some rest']), 0)
      }
      if (c[c.length - 1] == 0) {
        await db.executeSql('UPDATE challenges SET value = (?) WHERE name = (?)', [0, 'Insane Worker']);
        await updateChallenge(db, 'Insane Worker', 0);
      }
      await setHighestStrikeCount(db);
      setWorkouts(payload);
      setCounts(c);
      // prevent challenge from increasing after earning
      const [s] = await db.executeSql("SELECT achieved FROM challenges WHERE name = (?)", ["A Journey's Beginning"]);

      // get strike set and favorite data
      const favs = await getFavorites(db);
      setFavorites(favs);
      setOGFavorites(favs);
      if (favs.length > 0 && s.rows.item(0) == 0) {
        await updateChallenge(db, "A Journey's Beginning", 1);
      }
      const ss = await getStrikeSets(db);
      // prevent challenge from increasing after earning
      const [f] = await db.executeSql("SELECT achieved FROM challenges WHERE name = (?)", ['You know what you like']);
      for (let x = 0; x < ss.length; x++) {
        if (ss[x].id > 3 && f.rows.item(0) == 0) {
          await updateChallenge(db, JSON.stringify(['You know what you like']), 1);
        }
      }
      setStrikeSets(ss);
      setOGStrikeSets(ss);
      let ch = []
      const dat = (await getChallenges(db));
      for (let x = 0; x < dat.rows.length; x++) {
        ch.push(dat.rows.item(x));
      }
      setChallenges(ch);
    }
    catch (e) {
      console.error(e)
    }
    }
    fetchData();
    }, [])
  )


  const nav = useNavigation<NavigationProp>();
    return (
        <LinearGradient colors={['black', theme[0]]} style={styles.screen}>
          <LinearGradient colors={[theme[0], theme[1]]} style={styles.head}>
            <View style={{alignItems: 'center', justifyContent: 'center'}}>
              <Text style={[styles.headText, {textAlign: 'center', paddingStart: '1%', paddingEnd: '1%', color: 'white'}]}>Combo Creator</Text>
            </View>
          </LinearGradient>
    
          <View style={[styles.bodyMain, {justifyContent: 'space-between', alignItems: 'center'}]}>
            {!animationActive && 
            <View style={{width: '100%', justifyContent: 'space-between', flexDirection: 'row', margin: '2%', maxHeight: '10%', paddingStart: totalWorkouts() > 0 ? 0 : '5%'}}>
              {totalWorkouts() > 0 && 
                <Image style={{width: 40, height: 40, resizeMode: 'contain'}} source={require('../assets/streak.png')}/>
              }
              {totalWorkouts() == 0 && 
                <Image style={{width: 40, height: 40, resizeMode: 'contain'}} source={require('../assets/no-streak.png')}/>
              }
              {totalWorkouts() > 1 && 
                <Text style={[styles.headText, {fontSize: 15, color: 'white', textAlign:'left', maxWidth: '75%'}]}>You've worked out {totalWorkouts()} times in the last 7 days! Good stuff!</Text>
              }
              {totalWorkouts() == 1 && 
                <Text style={[styles.headText, {fontSize: 15, color: 'white', textAlign:'left', maxWidth: '75%'}]}>You've worked out 1 time this week! Keep it up!</Text>
              }
              {totalWorkouts() < 1 && 
                <Text style={[styles.headText, {fontSize: 15, color: 'white', textAlign:'left', maxWidth: '75%'}]}>It's been awhile, get some workouts started!</Text>
              }
              <TouchableOpacity style={{borderColor: 'white', borderWidth: 2, borderRadius: 20, padding: '2%', alignItems: 'center'}} onPress={() => {
                nav.reset({
                  index: 0,
                  routes: [{ name: "Challenges" as never }]
                })
              }}>
                  <Image style={{resizeMode: 'contain', height: 20, width: 20, paddingVertical: '5%'}} source={require('../assets/menu.png')}/>
              </TouchableOpacity>
            </View>}
            {!animationActive && 
              <View style={{width: '100%', height: '30%', alignItems: 'center'}}>
                <View style={styles.week}>
                  {days.map((item, index) => (
                    <View key={index} style={[styles.day, {backgroundColor: index == days.length - 1 ? 'red' : 'black', borderRadius: 5}]}>
                      <Text style={styles.dateText}>{item.slice(4, 10)}</Text>
                      <Text style={[styles.dateText, {fontSize: 10, marginTop: 10}]}>Workouts</Text>
                      <Text style={[styles.dateText, {fontSize: 12 }]}>{counts[index] ? counts[index] : 0}</Text>
                      <Text style={[styles.dateText, {fontSize: 10, marginTop: 20}]}>Time Spent</Text>
                      <Text style={[styles.dateText, {fontSize: 12}]}>{workouts[index] ? workouts[index] : ''}</Text>
                    </View>
                  ))}
                </View>
                <View style={{height: Dimensions.get('window').height * .18, alignItems: 'center', zIndex: 999}}>
                  <Text style={[styles.dateText, {fontSize: 13}]}>Medals</Text>
                  <ScrollView ref={medalScrollRef} contentContainerStyle={{alignItems: 'center', height: '100%'}} horizontal={true} style={{flexDirection: 'row'}} onScroll={(e) => {
                    scrollX.current = e.nativeEvent.contentOffset.x;
                  }} onScrollBeginDrag={() => {isUserScrolling.current = true;}} onMomentumScrollEnd={() => {isUserScrolling.current = false;}}>
                    {challenges.map((item, index) => (
                      <View key={index} style={styles.medal}>
                        {item.tier != undefined && 
                          <Text style={[styles.dateText, {fontSize: 8.5}]}>{item.tier > 0 ? JSON.parse(item.name)[item.tier - 1] : '???'}</Text>
                        }
                        {item.tier == undefined && 
                          <Text style={[styles.dateText, {fontSize: 8}]}>{item.achieved > 0 ? item.name : '???'}</Text>
                        }
                        {item.tier != undefined && 
                        <View>
                          <View style={{position: 'absolute', width: 60, height: 7, borderRadius: 200, backgroundColor: '#474747', alignSelf: 'center', top: 50}}/>
                          <Image source={item.tier == 0 ? medalImgs[0] : medalImages.find(m => m.name === (JSON.parse(item.name)[0]))?.items[item.tier - 1]} style={{resizeMode: 'contain', width: 55, height: 55}} />
                        </View>
                        }
                        {item.tier == undefined && 
                          <View>
                            <View style={{position: 'absolute', width: 60, height: 7, borderRadius: 200, backgroundColor: '#474747', alignSelf: 'center', top: 50}}/>
                            <Image source={item.achieved == 1 ? medalImages.find(m => m.name === item.name)?.items[0] ? medalImages.find(m => m.name === item.name)?.items[0] : medalImgs[4] : medalImgs[0]} style={{resizeMode: 'contain', width: 55, height: 55}}/>
                          </View>
                        }
                        <View style={{width: '100%', alignItems: 'center'}}>
                          {item && item.tier != undefined && 
                            <Text style={[styles.dateText, {fontSize: 8}]}>{Math.floor((item.value / item.thresholds[item.tier]) * 1000)/10}%</Text>
                          }
                          {item && item.tier == undefined && 
                            <Text style={[styles.dateText, {fontSize: 8}]}>{Math.floor((item.value / item.thresholds[0]) * 1000)/10 > 100 ? '100' : Math.floor((item.value / item.thresholds[0]) * 1000)/10}%</Text>
                          }
                          <View style={{width: '95%', height: 5, backgroundColor: 'gray'}}>
                            <View style={{position: 'absolute', width: item.achieved ? '100%' : item.tier != undefined ? `${Math.floor((item.value / item.thresholds[item.tier]) * 100)}%` :  `${Math.floor((item.value / item.thresholds[0]) * 100)}%`, height: 5, backgroundColor: 'white'}}/>
                          </View>
                        </View>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              </View>
            }

            {selectingWorkout && 
              <Animated.View style={[ aMenuStyle, {position: 'absolute', height: '100%', width: '100%', alignItems: 'center', justifyContent: 'center',
              opacity: 0, zIndex: 999 }]}>
                {selectingType && 
                  <View style={{width: '100%', height: '75%', alignItems: 'center'}}>
                    <Text style={{fontSize: 32, textAlign: 'center', fontWeight: 'bold', color: 'white'}}>Guided Workout</Text>  
                <TouchableOpacity style={styles.workoutTouch} onPress={() => {
                      setByStrikeSet(true);
                      setSelectingType(false);
                    }}>
                    <LinearGradient colors={[theme[1], theme[0]]} style={[styles.typeButton, {borderWidth: 3}]}>
                      <View style={{borderColor: 'black', borderWidth: 1, alignItems: 'center', padding: '5%'}}>
                        <Text style={[styles.strikeText, {color: strikeAnimation[0] ? 'white' : 'black'}]}>jab 
                          <Text style={[styles.strikeText, {color: strikeAnimation[1] ? 'white' : 'black'}]}> cross </Text>
                          <Text style={[styles.strikeText, {color: strikeAnimation[2] ? 'white' : 'black'}]}>hook</Text>
                        </Text>
                      </View>
                    </LinearGradient>
                </TouchableOpacity>
                <Text style={{fontSize: 32, textAlign: 'center', fontWeight: 'bold', color: 'white', marginTop: '2%'}}>Timed workout</Text> 
                <TouchableOpacity style={styles.workoutTouch} onPress={() => {
                      nav.navigate('TimedWorkoutCustomization');
                    }}>
                    <LinearGradient colors={[theme[1], theme[0]]} style={[styles.typeButton, {borderWidth: 3}]}>
                      <View style={{borderColor: 'black', borderWidth: 1, alignItems: 'center', padding: '5%'}}>
                        <Text style={[styles.strikeText, {color: 'white'}]}>{`Round ${rounds}/12`}</Text>
                        <Text style={[styles.strikeText, {color: 'white'}]}>{timeString}</Text>
                      </View>
                    </LinearGradient>
                </TouchableOpacity>
                  </View>
                }
                {byStrikeSet && 
                  <View>
                  <SwipeSnapSelector setStrikeSet={setStrikeSet}/>
                </View>
                }
                <View style={{flexDirection: 'row', margin: '5%'}}>
                    <TouchableOpacity style={[styles.touch, {display: byStrikeSet ? 'flex' : 'none'}]} onPress={() => {
                      nav.navigate('WorkoutCustomization', {strikeSetId: selectedStrikeSet});
                    }}>
                    <LinearGradient colors={['#0ed145', '#03290D']} style={[styles.controlButton, {borderWidth: 3}]}>
                      <Text style={{fontSize: 32, textAlign: 'center', fontWeight: 'bold', color: 'white'}}>Select Set</Text>  
                    </LinearGradient>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.touch} onPress={() => {
                      if (!selectingType && byStrikeSet) {
                        setByStrikeSet(false);
                        setSelectingType(true);
                      }
                      else {
                        setByStrikeSet(false);
                        setSelectingType(false);
                        stopStrikeAnimation();
                        reverseApproach();
                        deAnimateMenu();
                        setSelectingWorkout(false);
                        setAnimationActive(false);
                      }
                    }}>
                      <LinearGradient colors={['red', '#390842']} style={[styles.controlButton, {borderWidth: 3}]}>
                        <Text style={{fontSize: 32, textAlign: 'center', fontWeight: 'bold', color: 'white'}}>Go back</Text>  
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                
              </Animated.View>
            }

            {/* Ring */}
            <Animated.View style={[aApproachStyle, {width: '100%', height: '65%', marginTop: '10%'}]}>
              <Svg width={'100%'} height={'15%'}>
                <WigglePath animatedProps={wiggleProps} stroke={theme[1]} strokeWidth={10} fill='none'/>
              </Svg>
              <Svg width={'100%'} height={'15%'}>
                <WigglePath animatedProps={wiggleProps} stroke={theme[1]} strokeWidth={10} fill='none'/>
              </Svg>
              <Svg width={'100%'} height={'15%'}>
                <WigglePath animatedProps={wiggleProps} stroke={theme[1]} strokeWidth={10} fill='none'/>
              </Svg>
              <View style={[styles.rope, {height: '50%', backgroundColor: 'white', alignItems: 'center', marginTop: '5%',
                justifyContent: 'center', borderLeftWidth: 0, borderRightWidth: 0}]}>
                <View style={{width: '100%', borderColor: 'red', borderRadius: 200, borderStyle: 'solid', borderWidth: 5, padding: '20%',
                alignItems: 'center', transform: [{perspective: 1000}, {rotateX: '70deg'}]}}>
                  <Image source={require('../assets/logo.png')} style={{height: 250, width: 250, resizeMode: 'contain'}}/>
                </View>
              </View>
              <LinearGradient colors={['#474747', 'black']} style={{width: '100%', height: '50%', alignItems: 'center'}}/>
            </Animated.View>
            <HomeDropdown dataSet={strikeSets} isOpen={strikeSetsDropdown} setIsOpen={setStrikeSetsDropdown} setSelectedId={ddSetSelectedStrikeSet} left={false} setList={setStrikeSets} ogStrikes={ogStrikeSets}
            setInitiateNavigate={setStrikeSetNavigation}/>
            <HomeDropdown dataSet={favorites} isOpen={favoritesDropdown} setIsOpen={setFavoritesDropdown} setSelectedId={setSelectedFavorite} left={true} setList={setFavorites} ogStrikes={ogFavorites}
            setInitiateNavigate={setFavNavigation}/>
          </View>
          <Animated.View style={[styles.controls, aApproachStyle]}>
            <LinearGradient colors={['red', '#04007D']} style={{flexDirection: 'row', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center',
            borderTopLeftRadius: 30, borderTopRightRadius: 30, borderColor: 'black', borderWidth: 2, backgroundColor: theme[1]}}>
            <TouchableOpacity style={styles.touch} onPress={() => 
                //nav.navigate('CustomizeMenu' as never)
                nav.reset({
                  index: 0,
                  routes: [{ name: "HelpMenu" as never }]
                })
              }>
              <Text style={{fontSize: menuFont, textAlign: 'center', fontWeight: 'bold'}}>Help?</Text>  
              <View style={styles.controlButton}>
                <Image style={{width: 40, height: 40, resizeMode: 'contain'}} source={require('../assets/help.png')}/>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.touch} onPress={() => {
              setFavoritesDropdown(true)
            }}>
                <Text style={{fontSize: menuFont, textAlign: 'center', fontWeight: 'bold'}}>Favorites</Text>  
              <View style={styles.controlButton}>
                <Image style={{width: 40, height: 40, resizeMode: 'contain'}} source={require('../assets/favorites.png')}/>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.touch, {zIndex: 1000}]} onPress={() => {
                if (strikeSets.length != 0) {
                  if (!animationActive) {
                    setSelectingType(true);
                    setAnimationActive(true);
                    startApproach();
                  }
                }
                else {
                  Alert.alert('Strike Set Error', 'No strike sets found, please create one, or restart the app to re-add the defaults');
                }
              }
            }>
              <View style={[styles.controlButton]}>
                <Image style={{width: 40, height: 40, resizeMode: 'contain'}} source={require('../assets/boxing.png')}/>
                <Text style={[styles.headText, {fontSize: 8, color: 'white', width: 40}]}>START!</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.touch} onPress={() => 
                setStrikeSetsDropdown(true)
              }>
              <Text style={{fontSize: menuFont, textAlign: 'center', fontWeight: 'bold'}}>Strike Sets</Text>  
              <View style={styles.controlButton}>
                <Image style={{width: 40, height: 40, resizeMode: 'contain'}} source={require('../assets/strikesets.png')}/>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.touch} onPress={() => 
                nav.navigate('StatusReport' as never)
              }>
                <Text style={{fontSize: menuFont, textAlign: 'center', fontWeight: 'bold'}}>Statistics</Text>  
              <View style={styles.controlButton}>
                <Image style={{width: 40, height: 40, resizeMode: 'contain'}} source={require('../assets/statistics.png')}/>
              </View>
            </TouchableOpacity>
          </LinearGradient>
          </Animated.View>
        </LinearGradient>
      );
}

const styles = StyleSheet.create({
  screen: {
    height: '100%',
  },
  head: {
    height: '10%',
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  medal: {
    width: (Dimensions.get('window').width / 3) - 20,
    height: '100%',
    borderColor: 'gray',
    borderWidth: 1,
    zIndex: 999,
    marginHorizontal: 10,
    borderRadius: 5,
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    height: '100%',
    marginBottom: '1%',
  },
  day: {
    width: `${((1/7) * 100) - 2}%`,
    backgroundColor: 'black',
  },
  touch: {
    marginStart: '2%',
    marginEnd: '2%',
  },
  workoutTouch: {
    width: '95%',
    height: '40%',
    alignItems: 'center'
  },
  strikeText: {
    fontSize: 30,
    fontWeight: 'bold',
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
    height: '80%',
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
  },
  typeButton: {
    justifyContent: "center",
    alignItems: 'center',
    padding: '3%',
    borderStyle: "solid", 
    borderWidth: 2, 
    borderColor: 'white', 
    width: '80%',
    height: '100%',
    borderRadius: 10,
  },
  homeButtonText: {
    color: "white",
    fontWeight: 'bold',
    fontSize: 20,
  }

});

export default Home;