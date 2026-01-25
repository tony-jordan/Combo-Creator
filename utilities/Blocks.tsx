// File: Blocks.tsx
// Author: Tony Jordan
// Purpose: Creates UI for users to create, edit and delete blocks containing strikes.

import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, Dimensions, Pressable, InteractionManager } from 'react-native';
import React, { useState, useRef, useEffect } from "react";
import DraggableFlatList from 'react-native-draggable-flatlist';


export default function buildText(strikes: string[], getActive: boolean[], setActive: React.Dispatch<React.SetStateAction<boolean[]>>, setSelectedStrike: React.Dispatch<React.SetStateAction<string>>, setStrikes: React.Dispatch<React.SetStateAction<string[]>>) {

  const [data, setData] = useState<{key: string, label: string}[]>([]);
  const [selectedStrikeItem, setSelectedStrikeItem] = useState<StrikeItem>();
  const [deleteMode, setDeleteMode] = useState<boolean>(false);
  const [pendingFocusKey, setPendingFocusKey] = useState<string | null>(null);
  
  type StrikeItem = {key: string, label: string}
  const listRef = useRef<React.ComponentRef<typeof DraggableFlatList<StrikeItem>>>(null);

  const inputRefs = useRef<Record<string, TextInput | null>>({});

  const width = Dimensions.get('window').width

  useEffect(() => {
    listRef.current?.scrollToEnd({ animated: true });
  }, [data.length]);

  useEffect(() => {
    const temp = strikes.map((item, index) => {
      return {key: index.toString(), label: item}; 
    })
    setData(temp);

  }, [strikes])

  useEffect(() => {
    if (!pendingFocusKey) return;

    const ref = inputRefs.current[pendingFocusKey];
    if (ref) {
      ref.focus();
    }

    setPendingFocusKey(null);
  }, [pendingFocusKey, getActive, data]);

      return (
        <View style={{ alignItems: 'center'}}>
          <View>
            <Text style={[styles.headText, {textAlign: 'center'}]}>Strikes</Text>
            <View style={[styles.strikesArea]}>
              {<DraggableFlatList<{key: string, label: string}> style={{padding: '2%'}} ref={listRef} data={data} keyExtractor={(item) => item.key} onDragEnd={({ data }) => {
                if (selectedStrikeItem) {
                  let temp = new Array(data.length).fill(false);
                  let index = data.indexOf(selectedStrikeItem);
                  temp[index] = true;
                  setActive(temp);
                }
                setData(data);
                
                let temp = [];
                for (let x = 0; x < data.length; x++) {
                  temp.push(data[x].label);
                }
                setStrikes(temp);
              }} horizontal={true}
              renderItem={({ item, drag, isActive}) => {

                const handlePress = () => {
                  // Focus the TextInput when item is tapped
                  const index = data.indexOf(item);

                  // set active state
                  const temp = new Array(data.length).fill(false);
                  temp[index] = true;
                  setActive(temp);

                   // Focus input and select all text
                  const ref = inputRefs.current[item.key];

                  if (ref) {
                    ref.focus();
                    requestAnimationFrame(() => {
                      ref.setNativeProps({ selection: { start: 0, end: item.label.length } });
                    });
                  }
                };

                return (
                <Pressable onLongPress={() => {
                  drag();
                  setSelectedStrikeItem(item);
                  let temp = new Array(data.length).fill(false);
                  let index = data.indexOf(item);
                  temp[index] = true;
                  setActive(temp);
                }} 
                style={[ styles.item, { backgroundColor: !isActive ? "#ddd" : '#0ed145', 
                borderColor: (getActive[data.indexOf(item)]) ? '#0ed145' : 'black'}]} 
                onPress={handlePress}>
                    <TouchableOpacity style={{display: deleteMode ? 'flex' : 'none', padding: '5%'}} onPress={() => {
                      // remove strike from data and strikes
                      let temp = [];
                      let index = data.findIndex((k) => k.key === item.key);
                      for (let x = 0; x < data.length; x++) {
                        if (x != index) {
                          temp.push(data[x]);
                        }
                      }
                      setData(temp);
                      temp = [];
                      for (let x = 0; x < strikes.length; x++) {
                        if (x != index) {
                          temp.push(strikes[x]);
                        }
                      }
                      setStrikes(temp);
                    }}>
                      <Image source={require("../assets/delete.png")} style={{width: 25,  height: 25, resizeMode: 'contain'}}/>
                    </TouchableOpacity>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      <TextInput pointerEvents={'none'} selectTextOnFocus={true} editable={getActive[data.indexOf(item)]} ref={(ref) => {inputRefs.current[item.key] = ref}} style={{fontSize: 12, color: isActive ? 'white' : 'black', textAlign: 'center'}} defaultValue={item.label} maxLength={13} onPress={handlePress} onEndEditing={(e) => {
                        var t = [...strikes];
                        t[data.indexOf(item)] = e.nativeEvent.text;
                        setStrikes(t);
                    }}/>
                    <Image source={require("../assets/menu.png")} style={{width: 12.5,  height: 12.5, resizeMode: 'contain', margin: 5}}/>
                    </View>
                </Pressable>
                )
            }}>
            </DraggableFlatList>}
          </View>
        </View>
        <View style={{flexDirection: 'row', justifyContent: 'space-between', width: '95%'}}>
          <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center', marginBottom: '5%', marginHorizontal: 10}}onPress= {() => {
              setDeleteMode(!deleteMode);
          }}>
            <Text style={styles.viewButtonText}>Show deletion </Text>
            <Image source={deleteMode ? require("../assets/opt_selected.png") : require("../assets/opt.png")} style={{width: 30, height: 30, resizeMode: 'contain'}}/>
          </TouchableOpacity>
          <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center', marginBottom: '5%', marginHorizontal: 10}} onPress= {() => {
              // add additional empty strike when add button clicked
              let temp = ["new strike"]
              const stagedArray = strikes.concat(temp);
              setStrikes(stagedArray);
              let selected = Array(stagedArray.length).fill(false)
              selected[selected.length - 1] = true;
              setActive(selected)
              setSelectedStrike("");
          }}>
            <Text style={styles.viewButtonText}>Add Strike </Text>
            <Image source={require("../assets/add.png")} style={{width: 30, height: 30, resizeMode: 'contain'}}/>
          </TouchableOpacity>
        </View>
        </View>
      );
    } 


  const styles = StyleSheet.create({
    screen: {
      flex: 6,
    },
    head: {
      flex: .12,
      justifyContent: 'space-between',
      flexDirection: "row",
      backgroundColor: "red",
    },
    item: {
      borderRadius: 8,
      borderColor: 'black',
      borderWidth: 2,
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: 10,
      maxWidth: 172,
      minWidth: 60,
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
      backgroundColor: "white",
    },
    controls: {
      flex: 0,
      height: "15%",
      flexDirection: "row",
      backgroundColor: "white",
      alignItems: 'center',
      justifyContent: 'space-between',
      borderStyle: "solid",
      borderWidth: 3,
      borderColor: "grey",
    },
    controlButton: {
      paddingStart: "3%",
      paddingEnd: "3%",
      paddingTop: "3%",
      paddingBottom: "3%",
      borderStyle: "solid",
      borderWidth: 3,
      borderColor: 'black',
      borderRadius: 40,
      justifyContent: "center",
      alignItems: 'center'
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
      borderStyle: 'solid',
      borderWidth: 3,
      borderColor: 'black',
      borderRadius: 10,
      position: 'absolute',
      alignItems: 'center',
      marginTop: '5%',
      padding: 20,
      backgroundColor: 'white',
      width: "100%",
      height: "100%"
    },
    input: {
      borderWidth: 0,
      padding: 0,
      margin: 0,
    },
    strikesArea: {
      alignItems: "center",
      flexDirection: "row",
      marginTop: "1%",
      backgroundColor: '#2B2B2B',
      borderColor: 'white',
      borderWidth: 2,
      flexWrap: 'wrap',
      borderRadius: 10,
      paddingVertical: 10,
      marginBottom: '1%',
      width: '95%',
      justifyContent: 'flex-start',
    },
    strikeBlock: {
      padding: "3%",
      borderStyle: "solid",
      borderWidth: 2,
      borderColor: "black",
      alignItems: "center",
      margin: ".5%",
      backgroundColor: '#F5F5F5'
    },
    strikeControl: {
      borderStyle: "solid",
      borderWidth: 1,
      borderColor: "black",
    }
  });
