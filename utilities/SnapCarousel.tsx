// File: SnapCarousel.tsx
// Author: Tony Jordan
// Purpose: UI utility for carousel flatlist

import React, { useRef, useState, useEffect, Dispatch, SetStateAction } from 'react';
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { getDBConnection, getStrikeSets, getFavorites, DataSet } from '../utilities/DefaultInfo';
import LinearGradient from 'react-native-linear-gradient';


const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.7;
const SPACING = 20;
let clickInitiated = false;

type caroselProps = {
  setStrikeSet: Dispatch<SetStateAction<string>>
}

const SwipeSnapSelector = ( {setStrikeSet}: caroselProps ) => {
  const width = Dimensions.get('window').width;
  const fav: DataSet = {id: -999, name: "Create workout using your favorited combos", strikes:"", locked: 1}
  const defaultFavorite: DataSet[] = [fav];
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [defaultStrikeSets, setDefaultStrikeSets] = useState<DataSet[]>(defaultFavorite);
  const flatListRef = useRef<FlatList<DataSet>>(null);

  // Fetch strike sets on component mount
  useEffect(() => {
    const fetchData = async () => {
      const db = await getDBConnection();
      // add "favorite" option to default list of strike sets
      let set: DataSet = defaultStrikeSets[0];
      const sets = await getStrikeSets(db);
      // check to see if there are any favorites in user database, and ensure tutorial is not active
      const favs = await getFavorites(db);
      if (favs.length != 0) {
        // add favorite entry to pulled database info
        sets.unshift(set as { id: any; name: any; strikes: any; locked: any });
      }
      
      setDefaultStrikeSets(sets);
      if (sets.length > 0) {
        setSelectedId(sets[0].id);
        setStrikeSet(sets[0].id.toString());
      }
    };
    fetchData();
  }, []);
  // select centered option on scroll end
  const onScrollEnd = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / (CARD_WIDTH + SPACING));
    const selected = defaultStrikeSets[index];
    if (selected && !clickInitiated) {
      setSelectedId(selected.id);
      setStrikeSet(selected.id.toString());
    }
    clickInitiated = false;
  };
  // special card for favorite combo workout option
  function favoriteIndicator() {
    return(
      <View style={{borderStyle: "solid", borderWidth: 2, borderColor: "black", borderRadius: 5, backgroundColor: "#3f48cc", marginTop: "5%"}}>
        <Image source={require("../assets/favorited.png")} style={{width: width/3,  height: width/3, resizeMode: 'contain', margin: "7%"}}/>
      </View>
    )
  }

  function getGByName(name: string) {
    switch (name) {
      case 'Developer Set':
        return images[0];
      case 'Boxing':
        return images[1];
      case 'Karate':
        return images[2];
      case 'Muay Thai':
        return images[3];
    }
  }
  const images = [require('../assets/devset.png'), require('../assets/boxing.png'), require('../assets/karate.png'), require('../assets/muaythai.png')];

  return (
    <View style={styles.container}>
      <Text style={styles.homeButtonText}>Select a strike set</Text>
      <FlatList
        ref={flatListRef}
        data={defaultStrikeSets}
        horizontal
        keyExtractor={(item) => item.id.toString()}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: (SCREEN_WIDTH - CARD_WIDTH) / 2,
        }}
        snapToInterval={CARD_WIDTH + SPACING}
        snapToAlignment="start"
        decelerationRate="fast"
        onMomentumScrollEnd={onScrollEnd}
        renderItem={({ item }) => {
          const isSelected = item.id === selectedId;
          return (
            <TouchableOpacity
              onPress={() => {
                const index = defaultStrikeSets.findIndex((opt) => opt.id === item.id);
                setSelectedId(item.id);
                setStrikeSet(item.id.toString());
                clickInitiated = true;
                flatListRef.current?.scrollToIndex({
                  index,
                  animated: true,
                  viewPosition: 0.5,
                });
              }}
              activeOpacity={0.8}
            >
              <LinearGradient colors={['white', 'black']} style={[styles.card, isSelected && styles.cardSelected]}>
                {/* Set up custom images for default strike sets */}
                <Text style={styles.cardText}>{item.name}</Text>
                {(item.id <= 3 && item.id >= 0) ? <Image source={getGByName(item.name)} style={{width: CARD_WIDTH /2,  height: CARD_WIDTH/2, resizeMode: 'contain', margin: "7%"}}/> : null}
                {item.id === -999 ? favoriteIndicator() : null}
              </LinearGradient>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: '30%',
    zIndex: 999,
  },
  card: {
    width: CARD_WIDTH,
    height: '75%',
    marginRight: SPACING,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    zIndex: 999,
  },
  cardSelected: {
    borderColor: 'red',
    borderStyle: 'solid',
    borderWidth: 2,
    zIndex: 999,
  },
  cardText: {
    fontSize: 26,
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'center',
    zIndex: 999,
  },
  homeButtonText: {
    color: "white",
    fontWeight: 'bold',
    fontSize: 20,
    textAlign: 'center',
  },
});

export default SwipeSnapSelector;