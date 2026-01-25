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


const HelpMenu = () => {

  const nav = useNavigation();

    return (
        <LinearGradient colors={['black', '#04007D']} style={styles.screen}>
          <LinearGradient colors={['#04007D', 'red']} style={styles.head}>
            <View style={{alignItems: 'center', justifyContent: 'center'}}>
              <Text style={[styles.headText, {textAlign: 'center', paddingStart: '1%', paddingEnd: '1%', color: 'white'}]}>Combo Creator</Text>
            </View>
          </LinearGradient>
    
          <View style={styles.bodyMain}>
            <ScrollView style={{width: '100%'}}>
              <Text style={{fontSize: 18, textAlign: 'center', fontWeight: 'bold', color: 'white', marginTop: '15%'}}>Starting a workout</Text>  
              <TouchableOpacity style={styles.touch} onPress={() => {
                (nav.navigate as any)('Tutorial' as never, {selectedTutorial: [true, false, false, false]} as never );
              }}>
                <LinearGradient colors={['red', '#04007D']} style={styles.controlButton}>
                  <Image style={{width: 50, height: 50, resizeMode: 'contain'}} source={require('../assets/boxing.png')}/>
                </LinearGradient>
              </TouchableOpacity>
              <Text style={{fontSize: 18, textAlign: 'center', fontWeight: 'bold', color: 'white', marginTop: '15%'}}>Favorites</Text> 
              <TouchableOpacity style={styles.touch} onPress={() => {
                (nav.navigate as any)('Tutorial' as never, {selectedTutorial: [false, true, false, false]} as never );
              }}>
                <LinearGradient colors={['red', '#04007D']} style={styles.controlButton}>
                  <Image style={{width: 50, height: 50, resizeMode: 'contain'}} source={require('../assets/favorites.png')}/>
                </LinearGradient>
              </TouchableOpacity>

              <Text style={{fontSize: 18, textAlign: 'center', fontWeight: 'bold', color: 'white', marginTop: '15%'}}>Strike Sets</Text>  
              <TouchableOpacity style={styles.touch} onPress={() => {
                (nav.navigate as any)('Tutorial' as never, {selectedTutorial: [false, false, true, false]} as never );
              }}>  
                <LinearGradient colors={['red', '#04007D']} style={styles.controlButton}>
                  <Image style={{width: 50, height: 50, resizeMode: 'contain'}} source={require('../assets/strikesets.png')}/>
                </LinearGradient>
              </TouchableOpacity>
              <Text style={{fontSize: 18, textAlign: 'center', fontWeight: 'bold', color: 'white', marginTop: '15%'}}>Statistics</Text>  
              <TouchableOpacity style={styles.touch} onPress={() => {
                (nav.navigate as any)('Tutorial' as never, {selectedTutorial: [false, false, false, true]} as never );
              }}>  
                <LinearGradient colors={['red', '#04007D']} style={styles.controlButton}>
                  <Image style={{width: 50, height: 50, resizeMode: 'contain'}} source={require('../assets/statistics.png')}/>
                </LinearGradient>
              </TouchableOpacity>
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
  }

});

export default HelpMenu;