// File: FavoritesOverview.tsx
// Author: Tony Jordan
// Purpose: Component for viewing, updating and deleting user-saved favorite combos.

import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, Image, TouchableOpacity, TextInput, Alert } from 'react-native';
import {useNavigation} from '@react-navigation/native';
import { addFavoriteByScratch, getDBConnection} from '../utilities/DefaultInfo';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../utilities/StackNavigation';
import { useRoute, RouteProp } from '@react-navigation/native';
import { updateFavorite, deleteFavorite } from '../utilities/DefaultInfo';
import { validateStrikes } from '../utilities/Validations';
import buildText from '../utilities/Blocks';
import LinearGradient from 'react-native-linear-gradient';
import { updateChallenge } from '../utilities/Challenges';
type NavigationProp = StackNavigationProp<RootStackParamList, 'FavoritesOverview'>;

const FavoritesOverview = () => {
  const route = useRoute<RouteProp<RootStackParamList, "FavoritesOverview">>();

  const nav = useNavigation<NavigationProp>();
  const [strikes, setStrikes] = useState<string[]>([""]);
  const [selectedStrikes, setSelectedStrikes] = useState<boolean[]>([false]);
  const [selectedStrike, setSelectedStrike] = useState<string>("");
  const [superFavorited, setSuperFavorited] = useState<boolean>(false);
  const [updated, setUpdated] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [initDelete, setInitDelete] = useState<boolean>(false);;

  // use effect for configuring detailed favorite view data if user selects a favorite combo
  useEffect(() => {
      if (route.params.favorite.strikes.length != 0) {
        // set to different value by value vs. by ref
        setStrikes(JSON.parse(route.params.favorite.strikes));

        const selectedArray = Array(strikes.length).fill(false);
        setSelectedStrikes(selectedArray);

        // configure toggle on "super favorite radio button"
        setSuperFavorited(route.params.favorite.super);

        setName(route.params.favorite.name);
      }
  },[]) 
    return (
        <LinearGradient colors={['black', '#04007D']} style={styles.screen}>
          <LinearGradient colors={['#04007D', 'red']} style={styles.head}>
            <View style={{alignItems: 'center', justifyContent: 'center'}}>
              <Text style={[styles.headText, {textAlign: 'center', paddingStart: '1%', paddingEnd: '1%', color: 'white'}]}>Combo Creator</Text>
            </View>
          </LinearGradient>
          <View style={styles.bodyMain}>
            {initDelete && 
            <LinearGradient colors={["red", "black"]} style={[styles.selectedView, {height: '75%', zIndex: 999, alignItems: "center", top: '12.5%', borderRadius: 10}]}>
              <Image source={require("../assets/delete.png")} style={{width: "20%",  height: "20%", resizeMode: 'contain'}}/>
              <Text style={[styles.headText, {color: "white", textAlign: 'center'}]}>This is an irreversable deletion, are you sure you want to proceed?</Text>
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
                  await deleteFavorite(db, route.params.favorite.id);
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
              <View style={[styles.selectedView, {position: 'absolute'}]}>
                <ScrollView style={{height: "100%", padding: "1%"}}>
                <View style={{justifyContent: "center", alignItems: "center"}}>
                <Text style={[styles.homeButtonText]}>Favorite ID</Text>
                <Text style={[styles.input, {backgroundColor: "black", fontStyle: 'italic', color: 'white'}]}>{route.params.favorite.id.toString()}</Text>
                <Text style={[styles.homeButtonText]}>Name</Text>
                <TextInput style={styles.input} placeholder="Name not set (optional)" maxLength={30} value={name} onChangeText={(text) => {
                  setName(text);
                }}/>
                <View style={[styles.strikesArea, {flexDirection: "row", justifyContent: "space-between", padding: "5%"}]}>
                  <Text style={[styles.homeButtonText, { fontSize: 20, padding: "5%"}]}>Super Favorited</Text>
                  <TouchableOpacity style={{justifyContent: "center", alignItems: "center"}} onPress={() => {
                    const temp = superFavorited ? false : true;
                    setSuperFavorited(temp);
                  }}>
                    <View style={{borderStyle: "solid", borderWidth: 2, borderColor: "black", borderRadius: 5, backgroundColor: superFavorited ? "#3f48cc" : "white"}}>
                      <Image source={superFavorited ? require("../assets/favorited.png") : require("../assets/not_favorited.png")} style={{width: 35,  height: 35, resizeMode: 'contain', margin: "7%"}}/>
                    </View>
                  </TouchableOpacity>
                </View>
                {buildText(strikes, selectedStrikes, setSelectedStrikes, setSelectedStrike, setStrikes)}
                <TouchableOpacity style={{justifyContent: "center", alignItems: "center", display: route.params.favorite.id == ("not set" as unknown as number) ? "none" : 'flex', borderRadius: 10 }} onPress={() => {
                  setInitDelete(true);
                }}>
                  <LinearGradient colors={['red', 'black']} style={{justifyContent: "center", alignItems: "center", borderWidth: 2, borderColor: "black", 
                    borderStyle: "solid", margin: "10%", padding: "7%", borderRadius: 10 }}>
                    <Text style={{color: "white", fontSize: 20, padding: "1%", fontWeight: 'bold'}}>Delete Combo</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
              </ScrollView>
            </View>
          </View>
          <View style={[styles.controls]}>
            <LinearGradient colors={['red', '#04007D']} style={{flexDirection: 'row', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center',
            borderTopLeftRadius: 30, borderTopRightRadius: 30,}}>
            <TouchableOpacity onPress={() => {
                    // if creating favorite from scratch, add to database after input validation.
                    if (route.params.favorite.id == ("not set" as unknown as number)) {
                      if (validateStrikes(strikes)) {
                        (async () => {
                        try {
                          const db = await getDBConnection();
                          await addFavoriteByScratch(db, JSON.stringify(strikes), superFavorited ? 1 : 0, name);
                          await updateChallenge(db, "A Journey's Beginning", 1);
                          setUpdated(updated ? false : true)
                          setSelectedStrikes(Array(strikes.length).fill(false))
                        } catch (error) {
                          console.error("Failed to update favorite:", error);
                        }
                      })();
                      }
                      else {
                        Alert.alert("Input Error", "Cannot save favorite with 0 strikes");
                      }
                    }
                    else {
                      if (validateStrikes(strikes)) {
                        (async () => {
                          try {
                            const db = await getDBConnection();
                            await updateFavorite(db, JSON.stringify(strikes), superFavorited ? 1 : 0, route.params.favorite.id, name);
                            setUpdated(updated ? false : true)
                          } catch (error) {
                            console.error("Failed to update favorite:", error);
                          }
                        })();
                      }
                      else {
                        Alert.alert("Input Error", "Cannot save favorite with 0 strikes");
                      }
                   }
                   nav.reset({
                      index: 0,
                      routes: [{ name: "Home" as never }]
                    })
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
    borderColor: "black",
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

export default FavoritesOverview;