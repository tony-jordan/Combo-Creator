// File: StrikeSetsCustomization.tsx
// Author: Tony Jordan
// Purpose: Component for editing, creating and deleting strike set data.

import React, {useEffect, useState} from 'react';
import { ScrollView, View, Text, TextInput, StyleSheet, Image, TouchableOpacity } from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {updateStrikeSet, createStrikeSet, deleteStrikeSet, DataSet, getDBConnection, getStrikeSets} from '../utilities/DefaultInfo';
import { CustomDropdown } from '../utilities/Dropdown';
import { Alert } from 'react-native';
import { validateStrikes, validSSUpdate } from '../utilities/Validations';
import buildText from '../utilities/Blocks';
import LinearGradient from 'react-native-linear-gradient';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../utilities/StackNavigation';
import { updateChallenge } from '../utilities/Challenges';

const StrikeSetsCustomization = () => {
  const nav = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, "StrikeSetsCustomization">>();

  
  const [data, setData] = useState<DataSet[]>([]);
  const [templateStrikeSetId, setTemplateStrikeSetId] = useState<string>("not set");
  const [strikes, setStrikes] = useState<string[]>([]);
  const [mutateSet, setMutateSet] = useState<boolean>(false);
  const [selectedStrikes, setSelectedStrikes] = useState<boolean[]>([])
  const [selectedStrike, setSelectedStrike] = useState<string>("");
  const [name, setName] = useState<string>("Custom Strike Set");
  const [initDelete, setInitDelete] = useState<boolean>(false);
  const [updated, setUpdated] = useState<boolean>(false);
  const [locked, setLocked] = useState<boolean>(route.params.set.locked);

  // use effect to format pulled data
  useEffect(() => {
    if (route.params.set.strikes.length != 0) {
        setTemplateStrikeSetId(route.params.set.id);
        // set to different value by value vs. by ref
        setStrikes(JSON.parse(route.params.set.strikes));

        const selectedArray = Array(strikes.length).fill(false);
        setSelectedStrikes(selectedArray);

        setName(route.params.set.name);
    }
  }, [])


    return (
        <LinearGradient colors={['black', '#04007D']} style={styles.screen}>
          <LinearGradient colors={['#04007D', 'red']} style={styles.head}>
            <View style={{alignItems: 'center', justifyContent: 'center'}}>
              <Text style={[styles.headText, {textAlign: 'center', paddingStart: '1%', paddingEnd: '1%', color: 'white'}]}>Combo Creator</Text>
            </View>
          </LinearGradient>
    
          <View style={styles.bodyMain}>
            {initDelete && 
            <LinearGradient colors={["red", "black"]} style={[styles.selectedView, {height: '75%', zIndex: 999, alignItems: "center", top: '12.5%', borderRadius: 10, position: 'absolute'}]}>
              <Image source={require("../assets/delete.png")} style={{width: "20%",  height: "20%", resizeMode: 'contain'}}/>
              <Text style={[styles.headText, {color: "red", textAlign: 'center'}]}>This is an irreversable deletion, are you sure you want to proceed?</Text>
              <TouchableOpacity onPress={() => {
                setInitDelete(false);
              }}>
                <LinearGradient colors={['#0ed145', '#03290D']} style={[styles.controlButton, {backgroundColor: "#0ed145", margin: "10%"}]}>
                  <Text style={{color: "white", fontSize: 24, fontWeight: "bold"}}>Do NOT Delete</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => {
                (async () => {
                  const db = await getDBConnection();
                  await deleteStrikeSet(db, parseInt(templateStrikeSetId));
                })()
                nav.reset({
                  index: 0,
                  routes: [{ name: "Home" as never }]
                })
              }}>
                <LinearGradient colors={['red', '#390842']} style={[styles.controlButton, {backgroundColor: "red", margin: "10%"}]}>
                  <Text style={{color: "white", fontSize: 24, fontWeight: "bold"}}>Delete Forever</Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
            }
            <ScrollView contentContainerStyle={[styles.selectedView]}>
              <Text style={[styles.homeButtonText, { color: 'white', textDecorationLine: locked ? 'line-through' : 'none'}]}>Strike Set Name</Text>
              <TextInput style={[styles.input, {marginBottom: "2%", textDecorationLine: locked ? 'line-through' : 'none', backgroundColor: locked ? '#2B2B2B' : 'white',
                color: locked ? 'red' : 'black'
              }]} 
              editable={!locked} maxLength={30} placeholder="Custom StrikeSet" value={name} onChangeText={(text) => {
                  setName(text);
              }}/>
                <View style={{width: '100%', alignItems: 'center'}}>
                  {locked && 
                    <View style={{position: 'absolute', height: '100%', width: '100%', backgroundColor: 'black', opacity: .5, zIndex: 999}}></View>
                  }
                  {buildText(strikes, selectedStrikes, setSelectedStrikes, setSelectedStrike, setStrikes)}
                </View>
              <TouchableOpacity style={{justifyContent: "center", alignItems: "center", borderRadius: 10, margin: '1%' }} onPress={() => {
                setLocked(!locked);
              }}>
                  <View style={{borderColor: 'white', borderWidth: 1, borderStyle: 'solid', borderRadius: 10, backgroundColor: locked ? 'red' : 'transparent',
                    justifyContent: 'center', alignItems: 'center'
                  }}>
                    <Text style={{color: "white", fontSize: 20, fontWeight: 'bold', textAlign: 'center'}}>{locked ? 'Unlock\nSet' : 'Lock\nSet'}</Text>
                    <Image source={locked ? require("../assets/locked.png") : require("../assets/not_locked.png")} style={{width: 40,  height: 40, resizeMode: 'contain', marginHorizontal: "5%"}}/>
                  </View>
              </TouchableOpacity>
              {templateStrikeSetId != 'not set' && 
                <TouchableOpacity style={{justifyContent: "center", alignItems: "center", borderRadius: 10 }} disabled={locked} onPress={() => {
                  setInitDelete(true);
                }}>
                <LinearGradient colors={['red', 'black']} style={{justifyContent: "center", alignItems: "center", borderWidth: 2, borderColor: "black", 
                borderStyle: "solid", margin: "10%", padding: "7%", borderRadius: 10 }}>
                  <Text style={{color: "white", fontSize: 20, padding: "1%", fontWeight: 'bold', textDecorationLine: locked ? 'line-through' : 'none'}}>Delete Strike Set</Text>
                </LinearGradient>
              </TouchableOpacity>
              }
            </ScrollView>
          </View>
    
          <View style={[styles.controls]}>
            <LinearGradient colors={['red', '#04007D']} style={{flexDirection: 'row', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center',
            borderTopLeftRadius: 30, borderTopRightRadius: 30,}}>
              <TouchableOpacity onPress={() => {
                  if (validSSUpdate(strikes, name)) {
                    (async () => {
                      const db = await getDBConnection();
                      if (templateStrikeSetId == 'not set') {
                        await createStrikeSet(db, JSON.stringify(strikes), name, locked ? 1 : 0);
                        await updateChallenge(db, "You know what you like", 1);
                      }
                      else {
                        await updateStrikeSet(db, parseInt(templateStrikeSetId), name, JSON.stringify(strikes), locked ? 1 : 0);
                    }
                    })()

                    nav.reset({
                      index: 0,
                      routes: [{ name: "Home" as never }]
                    })
                  }
              }}>
                <LinearGradient colors={['#0ed145', '#03290D']} style={[styles.controlButton, {backgroundColor: "#0ed145"}]}>
                  <Text style={{color: "white", fontSize: 18, fontWeight: "bold"}}>Save Changes</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => {
                nav.reset({
                  index: 0,
                  routes: [{ name: "Home" as never }]
                })
              }}>
                <LinearGradient colors={['red', '#390842']} style={[styles.controlButton, {backgroundColor: "red"}]}>
                  <Text style={{color: "white", fontSize: 18, fontWeight: "bold"}}>Discard Changes</Text>
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
    height: '10%',
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
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
  headText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 30,
    paddingStart: 10,
    paddingTop: 20,
  },
  bodyMain: {
    flex: 1,
    alignItems: "center",
    color: "white",
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
  homeButtonText: {
    color: "white",
    fontWeight: 'bold',
    fontSize: 30,
  },
  selectedView: {
    zIndex: 998,
    alignItems: 'center',
    marginTop: '5%',
    padding: 20,
    width: "100%",
    height: "100%"
  },
  input: {
    borderWidth: 1,
    padding: 10,
    marginBottom: 2,
    width: 300,
    borderColor: 'white',
    color: 'black',
    backgroundColor: 'white'
  },
  strikesArea: {
    alignItems: "center",
    flexDirection: "row",
    marginTop: "1%",
    flexWrap: "wrap",
  },
  strikeBlock: {
    padding: "3%",
    borderStyle: "solid",
    borderWidth: 2,
    borderColor: "black",
    alignItems: "center",
    margin: ".5%",
  },
  strikeControl: {
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "black",
  }
});

export default StrikeSetsCustomization;