// File: Tutorial.tsx
// Author: Tony Jordan
// Purpose: Menu for presenting tutorial data to users.

import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { RootStackParamList } from '../utilities/StackNavigation';
import { useRoute, RouteProp } from '@react-navigation/native';



/* inputs for emulator and BYOD development */
// adb shell input keyevent 82 
// adb reverse tcp:8089 tcp:8089
// npx react-native start --reset-cache --port=8089
// npx react-native run-android
// npm run release
// npm run full-release


const Tutorial = () => {

  const nav = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, "Tutorial">>();

  const workoutImages = [
    require('../assets/tutorial/workout-home.png'),
    require('../assets/tutorial/workout-type.png'),
    require('../assets/tutorial/workout-ss.png'),
    require('../assets/tutorial/workout-customization.png'),
    require('../assets/tutorial/workout-customization-adv.png'),
    require('../assets/tutorial/workout-start.png'),
    require('../assets/tutorial/workout-execution.png'),
    require('../assets/tutorial/workout-execution-paused.png'),
    require('../assets/tutorial/workout-execution-fav.png'),
    require('../assets/tutorial/workout-execution-superfav.png'),
    require('../assets/tutorial/workout-execution-cancel-fav.png'),
    require('../assets/tutorial/workout-summary.png'),
    require('../assets/tutorial/workout-timed-customization.png'),
    require('../assets/tutorial/workout-timed-adv.png'),
    require('../assets/tutorial/workout-timed-enablecombos.png'),
    require('../assets/tutorial/workout-timed-enablecombos-customization.png'),
    require('../assets/tutorial/workout-timed-warning.png'),
    require('../assets/tutorial/workout-timed-execution.png'),
    require('../assets/tutorial/workout-timed-execution-rest.png'),
  ]

  const favImages = [
    require('../assets/tutorial/fav-home.png'),
    require('../assets/tutorial/fav-favorites.png'),
    require('../assets/tutorial/fav-customization.png'),
  ]

  const ssImages = [
    require('../assets/tutorial/ss-home.png'),
    require('../assets/tutorial/ss-strikesets.png'),
    require('../assets/tutorial/ss-customization-locked.png'),
    require('../assets/tutorial/ss-customization.png'),
  ]

  const statImages = [
    require('../assets/tutorial/stats-home.png'),
    require('../assets/tutorial/stats-bar.png'),
    require('../assets/tutorial/stats-line.png'),
  ]

    return (
        <LinearGradient colors={['black', '#04007D']} style={styles.screen}>
          <LinearGradient colors={['#04007D', 'red']} style={styles.head}>
            <View style={{alignItems: 'center', justifyContent: 'center'}}>
              <Text style={[styles.headText, {textAlign: 'center', paddingStart: '1%', paddingEnd: '1%', color: 'white'}]}>Combo Creator</Text>
            </View>
          </LinearGradient>
    
          <View style={styles.bodyMain}>
            <ScrollView style={{width: '100%'}}>
              {route.params.selectedTutorial[0] && 
                workoutImages.map((item, index) => (
                    <Image source={item} key={index} style={{marginBottom: '1%', resizeMode: 'contain', width: Dimensions.get('window').height * .5, height: Dimensions.get('window').height * .5}}/>
                ))
              }
              {route.params.selectedTutorial[1] && 
                favImages.map((item, index) => (
                    <Image source={item} key={index} style={{marginBottom: '1%', resizeMode: 'contain', width: Dimensions.get('window').height * .5, height: Dimensions.get('window').height * .5}}/>
                ))
              }
              {route.params.selectedTutorial[2] && 
                ssImages.map((item, index) => (
                    <Image source={item} key={index} style={{marginBottom: '1%', resizeMode: 'contain', width: Dimensions.get('window').height * .5, height: Dimensions.get('window').height * .5}}/>
                ))
              }
              {route.params.selectedTutorial[3] && 
                statImages.map((item, index) => (
                    <Image source={item} key={index} style={{marginBottom: '1%', resizeMode: 'contain', width: Dimensions.get('window').height * .5, height: Dimensions.get('window').height * .5}}/>
                ))
              }
            </ScrollView>
          </View>
    
          <View style={[styles.controls]}>
            <LinearGradient colors={['red', '#04007D']} style={{flexDirection: 'row', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center',
            borderTopLeftRadius: 30, borderTopRightRadius: 30,}}>
              <TouchableOpacity onPress={() => {
                nav.reset({
                  index: 0,
                  routes: [{ name: "HelpMenu" as never }]
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

export default Tutorial;