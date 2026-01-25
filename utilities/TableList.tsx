// File: TableList.tsx
// Author: Tony Jordan
// Purpose: UI utility for creating a table list view for the user to scroll through data.

import React, {Dispatch, SetStateAction} from 'react';
import {View, StyleSheet, Text, TouchableOpacity, Image, ScrollView} from 'react-native';

export type RowProps = {title: string, id: number, setId: Dispatch<SetStateAction<number>>, selectedId: number, tag?: number, tagTitle?: string, name?: string;};

const selectedSrc = require("../assets/opt_selected.png");
const nonSelectedSrc = require("../assets/opt.png");

// radio button changes are handled by set state action items in row props
const Row = ({title, id, setId, selectedId, tag, tagTitle, name}: RowProps) => {
  const isSelected = id === selectedId
  
  return (
  <TouchableOpacity style={styles.row} onPress={() => {
    setId(id);
  }}>
    <Image source={isSelected ? selectedSrc : nonSelectedSrc} style={{width: 40, height: 40, resizeMode: 'contain'}}/>
    <Text style={[styles.title,  {fontWeight: "bold", color: "#3f48cc", fontSize: 17}]}> {tag ? tagTitle : ""} </Text>
    <Text style={styles.title}>{name || id} | {title}</Text>
  </TouchableOpacity>
  )
};

// optional tag and name
// tags placed on table row for special rows
// names are optional replacements for row item id
type TableListProps = {
  data: RowProps[];
  setId: Dispatch<SetStateAction<number>>;
  selectedId: number;
  tagTitle?: string;
  name?: string;
}

const TableList = ({ data , setId, selectedId, tagTitle, name}: TableListProps) => {
    
    return (
        <ScrollView style={styles.container}>
            {data.map((item) => 
            <View key={item.id}>
                <Row 
                  title={item.title.replaceAll("[", "").replaceAll("]", "").replaceAll('"', "").replaceAll(",", ", ")} 
                  id={item.id} 
                  setId={setId} 
                  selectedId={selectedId}
                  tag={item.tag}
                  tagTitle={tagTitle ? tagTitle : ""}
                  name={item.name}
                  />
            </View>)}
        </ScrollView>
    )
}

const styles = StyleSheet.create({
  container: {
    marginTop: 0,
  },
  row: {
    width: "100%",
    backgroundColor: 'white',
    padding: 20,
    borderWidth: 1,
    borderStyle: "solid",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  title: {
    fontSize: 20,
    maxWidth: "40%",
  },
});


export default TableList;