// File: WorkoutCustomization.tsx
// Author: Tony Jordan
// Purpose: Component allowing users to customize workout parameters.

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getDBConnection, getStrikeSets, getStrikeSetByID, getFavoriteCombos } from '../utilities/DefaultInfo';
import { RootStackParamList } from '../utilities/StackNavigation';
import { StackNavigationProp } from '@react-navigation/stack';
import { useRoute, RouteProp } from '@react-navigation/native';
import { CustomDropdown } from '../utilities/Dropdown';
import SliderInput from "../utilities/SliderInput";
import { validateInputs } from "../utilities/Validations"
import LinearGradient from 'react-native-linear-gradient';

type NavigationProp = StackNavigationProp<RootStackParamList, 'WorkoutCustomization'>;

export type inputs = {
  comboCount: string,
  throwCount: string,
  strikesPerCombo: string,
  timePerStrike: string,
}

const WorkoutCustomization = () => {

  // Arbitrary max and min numbers. Most people using app don't need two full seconds between strikes, and 
  // most people can't throw several strikes at a pace of 300ms
  // Can be adjusted in future versions.
  const MAX_STRIKE_SPEED = 2000;
  const MIN_STRIKE_SPEED = 500

  const [defaultStrikeSets, setDefaultStrikeSets] = useState<any[]>([]);

      const [messageText, setMessageText] = useState<string>("This is the workout customization screen. Listed above is your selected strike set.")
      const [margin, setMargin] = useState<number>(-5);

    useEffect(() => {}, [margin])
  
    // Fetch strike sets on component mount
    useEffect(() => {
      const fetchData = async () => {
        const db = await getDBConnection();
        const sets = await getStrikeSets(db);
        setDefaultStrikeSets(sets);
      };
      fetchData();
    }, []);

  // Declare react hooks for input validation
  const [comboCount, setComboCount] = useState('');
  const [throwCount, setThrowCount] = useState('');
  const [strikesPerCombo, setStrikePerCombo] = useState('');
  // get average strike speed for use in slider input
  const temp = (MIN_STRIKE_SPEED + MAX_STRIKE_SPEED)/2 as unknown
  const [timePerStrike, setTimePerStrike] = useState(temp as string);

  const [comboCountValid, setComboCountValid] = useState(true);
  const [throwCountValid, setThrowCountValid] = useState(true);
  const [strikesPerComboValid, setStrikePerComboValid] = useState(true);
  const [timePerStrikeValid, setTimePerStrikeValid] = useState(true);

  const nav = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, "WorkoutCustomization">>();
  const [strikeSetId, setStrikeSetId] = useState(route.params.strikeSetId);
  const [strikes, setStrikes] = useState<string[] | string[][]>([]);
  const [strikesActive, setStrikesActive] = useState<boolean[]>([]);
  const [comboString, setComboString] = useState<string[]>([]);
  const [tpi, setTPI] = useState<string>("3000");
  const [tpc, setTPC] = useState<string>("5000");
  const [tts, setTTS] = useState<boolean>(false);

  const [adv, setAdv] = useState<boolean>(false);

  const userInputs: inputs = {
    comboCount: comboCount,
    throwCount: throwCount,
    strikesPerCombo: strikesPerCombo,
    timePerStrike: timePerStrike,
  }

    useEffect(() => {
      // get strike info from database
      const fetchData = async () => {
        const db = await getDBConnection();
        // if strike set is -999 (favorite workout) fetch favorite combo data
        if (strikeSetId == "-999") {
          let favs = await getFavoriteCombos(db);
          // iterate through favs
          let result = [];
          for (let x = 0; x < favs.length; x++) {
            let str = "";
            for (let y = 0; y < favs[x].length; y++) {
              if (y < favs[x].length - 1) {
                str += favs[x][y] + ", "
              }
              else {
                str += favs[x][y]
              }
            }
            result.push(str);
          }
          setStrikes(favs);
          setComboString(result);
        }
        else {
          const set = await getStrikeSetByID(db, strikeSetId);
          setStrikes(JSON.parse(set.strikes));
          setComboString(JSON.parse(set.strikes));
        }
      }
      fetchData();
    }, [strikeSetId])

    useEffect(() => {
      let temp = new Array(strikes.length).fill(true);
      setStrikesActive(temp);
    }, [strikes])

    const options = [ require("../assets/opt.png"), require("../assets/opt_selected.png")];
    const audio = [require('../assets/no-audio.png'), require('../assets/audio.png'),]

    return (
        <LinearGradient colors={['black', '#04007D']} style={styles.screen}>
          <LinearGradient colors={['#04007D', 'red']} style={styles.head}>
            <View style={{alignItems: 'center', justifyContent: 'center'}}>
              <Text style={[styles.headText, {textAlign: 'center', paddingStart: '1%', paddingEnd: '1%', color: 'white'}]}>Combo Creator</Text>
            </View>
          </LinearGradient>
            <View style={styles.bodyMain}>
              {/* Advanced settings menu */}
              <LinearGradient colors={['black', '#04007D']} style={[styles.adv, {display: adv ? 'flex' : 'none', marginBottom: '50%'}]}>
                <Text style={[styles.bodyText, {textAlign: 'center', fontSize: 20}]}>Pause between Combos</Text>
                <SliderInput min={1000} max={10000} setTime={setTPC} step={50} start={parseInt(tpc)}/>
                <Text style={[styles.bodyText, {textAlign: 'center', fontSize: 20}]}>Pause when repeating Combos</Text>
                <SliderInput min={1000} max={10000} setTime={setTPI} step={50} start={parseInt(tpi)}/>
                <Text style={[styles.bodyText, {textAlign: 'center', marginBottom: '1%', fontSize: 20}]}>Adjust which strikes appear in your workout</Text>
                <View style={{flexDirection: 'row', width: '100%', marginTop: '5%', marginBottom: '1%', alignItems: 'center'}}>
                  <TouchableOpacity onPress={() => {
                    setStrikesActive(new Array(strikes.length).fill(true))
                  }}>
                    <View>
                      <Image style={{height: 35, width: 35, marginStart: '1%', resizeMode: 'contain'}} source={strikesActive.includes(false) ? options[0] : options[1]}/>
                    </View>
                  </TouchableOpacity>
                  <Text style={{fontWeight: 'bold', padding: '1%', color: 'white'}}>Select all</Text>
                </View>
                <ScrollView style={{borderStyle: 'solid', borderColor: 'white', borderWidth: 1}}>
                  {strikes.map((item, index) => (
                    <View key={index} style={styles.row}>
                      <TouchableOpacity onPress={() => {
                        let temp = [...strikesActive];
                        if (temp[index]) {
                          temp[index] = false;
                        }
                        else {
                          temp[index] = true
                        }
                        setStrikesActive(temp);
                      }}>
                        <View>
                          <Image style={{height: 35, width: 35, marginStart: '10%', resizeMode: 'contain'}} source={strikesActive[index] ? options[1] : options[0]}/>
                        </View>
                      </TouchableOpacity>
                      <Text style={{width: '65%', margin: '5%', fontWeight: 'bold', color: 'white'}}>{comboString[index]}</Text>
                    </View>
                ))}
                <View style={{paddingBottom: '10%'}}></View>
                </ScrollView>
              </LinearGradient>
            <ScrollView style={{width: '100%'}} contentContainerStyle={[{zIndex: 101, paddingBottom: '5%', alignItems: 'center'}]}>
              <View style={{display: route.params.strikeSetId === "-999" ? "none" : "flex", width: '100%', 
                alignItems: 'center'}}>
                  <Text style={styles.bodyText}>Strike Set</Text>
                  <CustomDropdown dataSet={defaultStrikeSets} defaultValue={route.params.strikeSetId} setSelectedId={setStrikeSetId}/>
              </View>
              <View style={{flexDirection: 'row', justifyContent: 'space-evenly', width: '100%', alignItems: 'center'}}>
                  <Text style={[styles.bodyText, {textAlign: 'center'}]}>Voice Output</Text>
                    <TouchableOpacity style={{justifyContent: 'center', alignItems: 'center'}} onPress={() => 
                      setTTS(!tts)
                    }>
                      <View style={{alignSelf: 'center', borderWidth: 1, borderColor: tts ? '#0ed145' : 'red', padding: 5, borderRadius: 5, backgroundColor: '#04007D'}}>
                        <Image source={tts ? audio[1] : audio[0]} style={{resizeMode: 'contain', height: 35, width: 35}}/>
                      </View>
                    </TouchableOpacity>
                </View>
                <Text style={styles.bodyText}>Total Number of Combos</Text>
                <TextInput style={[styles.input, {borderColor: comboCountValid ? 'black' : 'red'}]} placeholder="Ex. 45" 
                keyboardType="numeric" value={comboCount} onChangeText={(text) => {
                    const numericOnly = text.replace(/[^0-9]/g, '');
                    setComboCount(numericOnly);
                }}/>
                <Text style={styles.bodyText}>Combo Throw Count</Text>
                <TextInput style={[styles.input, {borderColor: throwCountValid ? 'black' : 'red'}]} placeholder="Ex. 5" 
                keyboardType="numeric" value={throwCount} onChangeText={(text) => {
                    const numericOnly = text.replace(/[^0-9]/g, '');
                    setThrowCount(numericOnly);
                }}/>
                <View style={{display: route.params.strikeSetId === "-999" ? "none" : "flex"}}>
                  <Text style={styles.bodyText}>Max Strikes (Min: 3 Max: 25)</Text>
                  <TextInput style={[styles.input, {borderColor: strikesPerComboValid ? 'black' : 'red'}]} placeholder="Ex. 3"
                   keyboardType="numeric" value={strikesPerCombo} onChangeText={(text) => {
                    const numericOnly = text.replace(/[^0-9]/g, '');
                    setStrikePerCombo(numericOnly);
                  }}/>
                </View>
                <TouchableOpacity onPress={() => 
                    setAdv(true)
                }>
                    <LinearGradient colors={['red', '#04007D']} style={[styles.controlButton, {marginTop: '5%', paddingTop: '5%', paddingBottom: '5%'}]}>
                        <Text style = {[styles.homeButtonText, {fontSize: 20}]}>Advanced Settings</Text>
                    </LinearGradient>
                </TouchableOpacity>
                <Text style={styles.bodyText}>Time Between Strikes</Text>
                <View style={{width: '100%'}}>
                  <SliderInput min={MIN_STRIKE_SPEED} max={MAX_STRIKE_SPEED} setTime={setTimePerStrike} step={50} />
                </View>
            </ScrollView>
            </View>
            <View style={[styles.controls]}>
              <LinearGradient colors={['red', '#04007D']} style={{flexDirection: 'row', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center',
              borderTopLeftRadius: 30, borderTopRightRadius: 30,}}>
                <TouchableOpacity style={styles.touch} onPress={() => {
                    if (adv) {
                      setAdv(false);
                    }
                    else {
                      // if nothing is selected, throw error
                      if (!strikesActive.includes(true)) {
                        Alert.alert("Input Error", "Cannot start workout with zero selected strikes. Please navigate to advanced settings and ensure you have strikes selected.");
                      }
                      else {
                        if (validateInputs(route.params.strikeSetId, userInputs, setComboCountValid, setThrowCountValid, setStrikePerComboValid, setTimePerStrikeValid)) {
                          // remove items from strikes that user is not including
                          let result = []
                          for (let x = 0; x < strikes.length; x++) {
                            if (strikesActive[x]) {
                              result.push(strikes[x]);
                            }
                          }
                          nav.reset({
                              index: 0,
                              routes: [{ name: "WorkoutExecution", params: {strikeSetId: strikeSetId, comboCount: parseInt(comboCount), throwCount: parseInt(throwCount), 
                                strikesPerCombo: parseInt(strikesPerCombo), timePerStrike: parseInt(timePerStrike), pbc: parseInt(tpc), pwrc: parseInt(tpi), strikes: result, tts: tts ? tts : undefined} }]
                          })
                        }
                      }
                    }
                }}>
                <LinearGradient colors={['#0ed145', '#03290D']} style={[styles.controlButton, {backgroundColor: "#0ed145"}]}>
                  <Text style={{color: "white", fontSize: 18, fontWeight: "bold"}}>{adv ? 'Save' : 'Start'}</Text>
                </LinearGradient>
              </TouchableOpacity>
              {!adv && 
                <TouchableOpacity style={styles.touch} onPress={() => {
                  if (adv) {
                    setAdv(false);
                  }
                  else {
                    nav.reset({
                      index: 0,
                      routes: [{ name: "Home" as never }]
                    })
                  }
                }}>
                <LinearGradient colors={['red', '#390842']} style={[styles.controlButton, {backgroundColor: "red"}]}>
                  <Text style={{color: "white", fontSize: 18, fontWeight: "bold"}}>Go Back</Text>
                </LinearGradient>
              </TouchableOpacity>
              }
            </LinearGradient>
          </View>
        </LinearGradient>
      );
}

const styles = StyleSheet.create({
  screen: {
    height: '100%',
    width: '100%',
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
  adv: {
    position: 'absolute',
    width: '95%',
    height: '100%',
    zIndex: 999,
    backgroundColor: 'white',
    borderStyle: 'solid',
    borderColor: 'gray',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    width: '100%',
    borderWidth: 1,
    borderColor: 'white',
    borderStyle: 'solid',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  touch: {
    marginStart: '2%',
    marginEnd: '2%',
    width: '40%',
  },
  bodyMain: {
    flex: 3,
    borderColor: "black",
    justifyContent: 'flex-start',
    alignItems: "center",
    zIndex: 101,
    width: '100%',
  },
  bodyText: {
    fontSize: 22,
    color: 'white',
    fontWeight: 'bold',
    marginTop: 25,
  },
   controls: {
    flex: .35,
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
  homeButton: {
    padding: 5,
    borderStyle: "solid",
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 10,
    marginTop: 20,
    marginEnd: 10,
  },
  homeButtonText: {
    color: "white",
    fontWeight: 'bold',
    fontSize: 30,
  },
  input: {
    borderWidth: 1,
    padding: 10,
    width: 300,
    backgroundColor: "#F5F5F5",
  }
});

export default WorkoutCustomization;