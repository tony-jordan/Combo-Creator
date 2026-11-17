// File: HelpMenu.tsx
// Author: Tony Jordan
// Purpose: Menu for getting help on app mechanics

import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';


/* inputs for emulator and BYOD development */
// adb shell input keyevent 82 
// adb reverse tcp:8089 tcp:8089
// npx react-native start --reset-cache --port=8089
// npx react-native run-android
// npm run release
// npm run full-release

import { useEffect, useState } from 'react';
import { getChallenges, getDBConnection } from '../utilities/DefaultInfo';
import { doProgressMath, medalImages } from '../utilities/Challenges';


const Challenges = () => {

const [challenges, setChallenges] = useState<any[]>([])
const locked = require('../assets/medals/locked.png');
    
  const nav = useNavigation();

  useEffect(() => {
        const fetchData = async () => {
        try {
            const db = await getDBConnection();
            let ch = []
            const dat = (await getChallenges(db));
            for (let x = 0; x < dat.rows.length; x++) {
                ch.push(dat.rows.item(x));
            }
            setChallenges(ch);
        }
        catch (e) {
            console.error('fetchData failed', e)
        }
      }
      fetchData();
      }, [])

    return (
        <LinearGradient colors={['black', '#04007D']} style={styles.screen}>
          <LinearGradient colors={['#04007D', 'red']} style={styles.head}>
            <View style={{alignItems: 'center', justifyContent: 'center'}}>
              <Text style={[styles.headText, {textAlign: 'center', paddingStart: '1%', paddingEnd: '1%', color: 'white'}]}>Combo Creator</Text>
            </View>
          </LinearGradient>
    
          <View style={styles.bodyMain}>
            <ScrollView style={{width: '100%'}}>
              {challenges.map((item, index) => (
                <View style={{borderWidth: 1, borderColor: 'gray'}} key={index}>
                <View style={styles.medalSection}>
                    <View>
                        {item.tier != undefined && item.thresholds.map((threshold: number, ind : number) => (
                            <View style={styles.medalRow} key={ind}>
                                <Image style={{resizeMode: 'contain', height: 50, width: 50}} source={item.tier >= ind + 1 ? medalImages.find(m => m.name === (JSON.parse(item.name)[0]))?.items[ind] : locked}/>
                                <Text style={{marginLeft: '1%', color: 'white', width: '70%'}}>{item.description.includes(']') ? JSON.parse(item.description)[ind] : ''}</Text>
                            </View>
                        ))}
                        {item.tier == undefined && item.thresholds.map((threshold: number, ind : number) => (
                            <View style={styles.medalRow} key={ind}>
                                <Image style={{resizeMode: 'contain', height: 50, width: 50}} source={item.achieved == 1 ? medalImages.find(m => m.name === (item.name))?.items[ind] : locked}/>
                                <Text style={{marginLeft: '1%', color: 'white', width: '70%'}}>{item.description}</Text>
                            </View>
                        ))}
                    </View>
                    <View>
                        <View style={{alignItems: 'center'}}>
                            <Text style={{color: 'white'}}>Progress</Text>
                            <View style={{height: item.thresholds.length == 1 ? 50 : 50 * (item.thresholds.length - 1), width: 10, borderWidth: 1, borderColor: 'gray'}}>
                                <View style={{height: item.achieved == 1 ? 50 : 50 * (item.thresholds.length - 1) * (doProgressMath(item) / 100) , width: 10, borderWidth: 1, backgroundColor: 'red'}}/>
                            </View>
                              {item.achieved == 0 && 
                                <Text style={{color: 'white'}}>{doProgressMath(item)}%</Text>
                              }
                              {item.achieved == 1 && 
                                <Text style={{color: 'white'}}>100%</Text>
                              }
                              <View style={{alignItems: 'center'}}>
                                <Text style={{color: 'white'}}>Total: </Text>
                                <Text style={{color: 'white'}}>{Math.floor(item.value * 100)/100}</Text>
                              </View>
                        </View>
                    </View>
                </View>
                {/**
                 * 
                 * <TouchableOpacity style={{width: '45%', alignSelf: 'flex-end'}} onPress={() => {

                  }}>
                    <LinearGradient colors={['gold', 'black']} style={[styles.controlButton, {borderColor: 'black', borderRadius: 30}]}>
                      <Text style={[styles.homeButtonText, {fontSize: 20}]}>Customization</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                 * 
                 */}
                </View>
              ))}
            </ScrollView>
          </View>
    
          <View style={[styles.controls]}>
            <LinearGradient colors={['red', '#04007D']} style={{flexDirection: 'row', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center',
            borderTopLeftRadius: 30, borderTopRightRadius: 30,}}>
              <TouchableOpacity onPress={() => {
                nav.reset({
                  index: 0,
                  routes: [{ name: "Home" as never }]
                })
              }}>
                <LinearGradient colors={['red', '#390842']} style={[styles.controlButton, {borderColor: 'black', borderRadius: 30}]}>
                  <Text style={{color: "white", fontSize: 30, fontWeight: "bold"}}>Go Back</Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </View>
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
  touch: {
    alignSelf: 'center',
    width: '75%',
    marginStart: '2%',
    marginEnd: '2%',
    borderColor: 'white',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '12.5%',
    borderRadius: 10,
  },
  bodyMain: {
    width: '100%',
    justifyContent: 'center',
    alignItems: "center",
    color: "white",
    flex: 3,
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
    borderColor: 'white', 
    borderRadius: 10,
  },
  homeButtonText: {
    color: "white",
    fontWeight: 'bold',
    fontSize: 30,
  },
  medalSection: {
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  medalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  }

});

export default Challenges;