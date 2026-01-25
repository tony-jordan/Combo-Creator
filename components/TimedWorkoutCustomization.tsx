// File: WorkoutCustomization.tsx
// Author: Tony Jordan
// Purpose: Component allowing users to customize workout parameters.

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, Image, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getDBConnection, getFavoriteCombos, randomizeArray } from '../utilities/DefaultInfo';
import { RootStackParamList } from '../utilities/StackNavigation';
import { StackNavigationProp } from '@react-navigation/stack';
import { useRoute, RouteProp } from '@react-navigation/native';
import { CustomDropdown } from '../utilities/Dropdown';
import SliderInput from "../utilities/SliderInput";
import { validateInputs } from "../utilities/Validations"
import LinearGradient from 'react-native-linear-gradient';
import { TimeSelection } from '../utilities/TimeSelection';
import DraggableFlatList from 'react-native-draggable-flatlist';

type NavigationProp = StackNavigationProp<RootStackParamList, 'WorkoutCustomization'>;

const TimedWorkoutCustomization = () => {

  const height = Dimensions.get('window').height;

  const nav = useNavigation<NavigationProp>();
  // Declare react hooks for input validation
  const [rounds, setRounds] = useState<string>("12");
  const [workMinutes, setWorkMinutes] = useState<string>('03');
  const [workSeconds, setWorkSeconds] = useState<string>('00');
  const [restMinutes, setRestMinutes] = useState<string>('01');
  const [restSeconds, setRestSeconds] = useState<string>('00');

  type StrikeItem = {key: string, label: string}
  const listRef = useRef<React.ComponentRef<typeof DraggableFlatList<StrikeItem>>>(null);

  const [useFavorites, setUseFavorites] = useState<boolean>(false);
  const [unlockFavorites, setUnlockFavorites] = useState<boolean>(false);
  const [favorites, setFavorites] = useState<StrikeItem[]>([]);
  const [maxRounds, setMaxRounds] = useState<number>(0);
  const [reset, setReset] = useState<boolean>(false);

    useEffect(() => {
      // get strike info from database
      const result: StrikeItem[] = [];
      const fetchData = async () => {
        const db = await getDBConnection();
        const info = await getFavoriteCombos(db);
        for (let x = 0; x < info.length; x++) {
            let temp = (info[x])
            let str = "";
            for (let y = 0; y < temp.length; y++) {
                str += temp[y] + " "
            }
            result.push({key: x.toString(), label: str});
        }
        setMaxRounds(result.length);
        setFavorites(result);
      }
      fetchData();
    }, [reset])


    const options = [ require("../assets/opt.png"), require("../assets/opt_selected.png")];

    return (
        <LinearGradient colors={['black', '#04007D']} style={styles.screen}>
          <LinearGradient colors={['#04007D', 'red']} style={styles.head}>
            <View style={{alignItems: 'center', justifyContent: 'center'}}>
              <Text style={[styles.headText, {textAlign: 'center', paddingStart: '1%', paddingEnd: '1%', color: 'white'}]}>Combo Creator</Text>
            </View>
          </LinearGradient>
            <View style={styles.bodyMain}>

            { useFavorites && 
                <LinearGradient colors={['red', '#04007D']} style={styles.adv}>
                    { !unlockFavorites && 
                        <View style={{width: '110%', height: '100%', position: 'absolute', justifyContent: 'center', alignItems: 'center'}}>
                            <View style={{width: '100%', height: '100%', backgroundColor: 'black', opacity: .5, zIndex: 998, position: 'absolute', alignItems: 'center'}}/>
                            <TouchableOpacity style={{zIndex: 999}} onPress={() => {
                                setUnlockFavorites(true);
                            }}>
                                <LinearGradient colors={['#0ed145', '#03290D']} style={[styles.controlButton, {padding: '10%'}]}>
                                    <Text style={[styles.homeButtonText, {color: 'white'}]}>Enable Combos</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    }
                    <View style={{borderColor: 'black', borderWidth: 1, backgroundColor: '#2B2B2B', borderRadius: 10, width: '50%', height: Dimensions.get('window').height * 0.8,}}>
                        <DraggableFlatList<StrikeItem> ref={listRef} data={favorites} keyExtractor={(item) => item.key} onDragEnd={({ data }) => setFavorites(data)} 
                            renderItem={({ item, drag, isActive}) => {
                                return (
                                    <TouchableOpacity onLongPress={drag} style={[ styles.item, { backgroundColor: !isActive ? "#ddd" : '#0ed145'}]}>
                                        {favorites.findIndex((val) => val.key == item.key) == parseInt(rounds) && 
                                            <View style={{width: '100%', backgroundColor: 'red'}}>
                                                <Text style={[styles.homeButtonText, {fontSize: 12, textAlign: 'center'}]}> {rounds + " rounds"} {'\nCombos below this point will not be used'}</Text>
                                            </View>
                                        }
                                        <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%'}}>
                                            <Text style={{fontSize: 12, maxWidth: '80%', textDecorationLine: favorites.findIndex((val) => val.key == item.key) < parseInt(rounds) ? "none" : 'line-through'}}>{item.label}</Text>
                                            <TouchableOpacity onPress={() => {
                                                let result = [];
                                                for (let x = 0; x < favorites.length; x++) {
                                                    if (item != favorites[x]) {
                                                        result.push(favorites[x]);
                                                    }
                                                }
                                                setFavorites(result);
                                            }}>
                                                <Image style={{resizeMode: 'contain', width: 30, height: 30}}source={require('../assets/delete.png')}/>
                                            </TouchableOpacity>
                                        </View>
                                    </TouchableOpacity>
                                )
                            }} autoscrollThreshold={60} autoscrollSpeed={50} scrollEnabled={true} style={{height: height * .8}}/>
                    </View>
                    <View style={{alignItems: 'center', justifyContent: 'space-between', height: '100%'}}>
                        <Image source={require("../assets/up.png")} style={{resizeMode: 'contain', height: 30, width: 30}}/>
                        <Image source={require("../assets/down.png")} style={{resizeMode: 'contain', height: 30, width: 30}}/>
                    </View>
                    <View style={{width: '45%', height: '100%', justifyContent: 'space-between'}}>
                        <Text style={[styles.bodyText, {fontSize: 24}]}>Combos: {favorites.length}</Text>
                        <Text style={styles.bodyText}>Round Layout:</Text>
                        <ScrollView>
                            {favorites.map((item, index) => (
                                <View key={index}>
                                    {index < parseInt(rounds) && 
                                        <Text style={[styles.bodyText, {fontSize: 12, padding: 0, marginTop: 0}]}>{(index + 1).toString() + ". " + item.label}</Text>
                                    }
                                </View>
                            ))}
                        </ScrollView>
                        <TouchableOpacity onPress={() => {
                            setReset(!reset);
                        }}>
                            <LinearGradient colors={['#0ed145', '#03290D']} style={[styles.controlButton, {padding: '10%', width: '100%'}]}>
                                <Text style={[{color: 'white', fontWeight: 'bold'}]}>Reset Combos</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {
                            setFavorites(randomizeArray([...favorites]))
                        }}>
                            <LinearGradient colors={['blue', 'black']} style={[styles.controlButton, {padding: '10%', width: '100%'}]}>
                                <Text style={[{color: 'white', fontWeight: 'bold'}]}>Shuffle Combos</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {
                            setUnlockFavorites(false);
                        }}>
                            <LinearGradient colors={['red', 'black']} style={[styles.controlButton, {padding: '10%', width: '100%'}]}>
                                <Text style={[{color: 'white', fontWeight: 'bold'}]}>Disable Combos</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </LinearGradient>
            }
              
            <ScrollView contentContainerStyle={{alignItems: 'center'}} style={{width: '100%', zIndex: 101, paddingBottom: '5%'}}>
              
                <Text style={styles.bodyText}>Number of rounds</Text>
                <View style={{width: '100%'}}>
                  <SliderInput min={1} max={99} setTime={setRounds} step={1} type={"round(s)"} start={12}/>
                </View>
                <Text style={styles.bodyText}>Workout Time:</Text>
                <TimeSelection setMinutes={setWorkMinutes} minutes={workMinutes} setSeconds={setWorkSeconds} seconds={workSeconds}/>
                <Text style={styles.bodyText}>Rest Time:</Text>
                <TimeSelection setMinutes={setRestMinutes} minutes={restMinutes} setSeconds={setRestSeconds} seconds={restSeconds}/>
                {!useFavorites && 
                  <View style={{alignItems: 'center', padding: '7%'}}>
                    <TouchableOpacity style={{alignItems: 'center', flexDirection: 'row'}} onPress={() => {
                        setUseFavorites(true)
                    }}>
                        <LinearGradient colors={['red', '#04007D']} style={{padding: '5%', borderWidth: 2, borderColor: 'black', borderRadius: 10}}>
                            <Text style={[styles.bodyText, { fontSize: 18, marginTop: 0 }]}>Display Combos</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
                }
            </ScrollView>
            </View>
            <View style={[styles.controls]}>
              <LinearGradient colors={['red', '#04007D']} style={{flexDirection: 'row', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center',
              borderTopLeftRadius: 30, borderTopRightRadius: 30,}}>
                <TouchableOpacity style={styles.touch} onPress={() => {
                    if (useFavorites) {
                        setUseFavorites(false);
                    }
                    else {
                        // validate entries
                        let msg = ''
                        if (workMinutes == "00" && workSeconds == "00") {
                            msg += '[Error]Cannot have 0 total workout time\n';
                        }
                        if (restMinutes == "00" && restSeconds == "00") {
                            msg += '[Error]Cannot have 0 total rest time\n';
                        }
                        if (favorites.length < parseInt(rounds) && unlockFavorites) {
                            msg += `[Warning] You only have ${favorites.length} combos in use, but you've selected ${rounds} rounds. After round ${favorites.length},` +
                            ` no combos will be displayed.\n`
                        }
                        if (msg.length > 0) {
                            Alert.alert("Warnings and Errors", msg, [{text: "OK", onPress: () => {
                                if (!msg.includes('[Error]')) {
                                    nav.reset({
                                        index: 0,
                                        routes: [{ name: "TimedWorkoutExecution", params: {rounds: parseInt(rounds), workTime: `${workMinutes}:${workSeconds}`, restTime: `${restMinutes}:${restSeconds}`,favorites: favorites}}]
                                    })
                                }
                            }}])
                        }
                        else {
                          if (unlockFavorites) {
                            nav.reset({
                                index: 0,
                                routes: [{ name: "TimedWorkoutExecution", params: {rounds: parseInt(rounds), workTime: `${workMinutes}:${workSeconds}`, restTime: `${restMinutes}:${restSeconds}`,favorites: favorites}}]
                            })
                          }
                          else {
                            nav.reset({
                                index: 0,
                                routes: [{ name: "TimedWorkoutExecution", params: {rounds: parseInt(rounds), workTime: `${workMinutes}:${workSeconds}`, restTime: `${restMinutes}:${restSeconds}`} }]
                            })
                          }
                        }
                    }
                }}>
                <LinearGradient colors={['#0ed145', '#03290D']} style={[styles.controlButton, {backgroundColor: "#0ed145"}]}>
                  <Text style={{color: "white", fontSize: 18, fontWeight: "bold"}}>{useFavorites ? 'Save' : 'Start'}</Text>
                </LinearGradient>
              </TouchableOpacity>
              {!useFavorites && 
                <TouchableOpacity style={styles.touch} onPress={() => {
                    nav.reset({
                      index: 0,
                      routes: [{ name: "Home" as never }]
                    })
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
   item: {
      borderRadius: 8,
      borderColor: 'black',
      borderWidth: 3,
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      padding: '5%',
    },
  adv: {
    position: 'absolute',
    width: '100%',
    height: Dimensions.get('window').height * .8,
    zIndex: 999,
    borderStyle: 'solid',
    borderColor: 'white',
    borderRadius: 5,
    alignItems: 'center',
    alignSelf: 'center',
    flexDirection: 'row',
    paddingHorizontal: '2%',
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
    height: '10%',
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
    height: '80%',
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
    height: '10%'
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

export default TimedWorkoutCustomization;