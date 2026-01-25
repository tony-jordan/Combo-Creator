// File: BarGraph.tsx
// Author: Tony Jordan
// Purpose: Formats supplied data to create a bar graph to present data back to user.

import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { deleteReport, getDBConnection } from './DefaultInfo';
import {useNavigation} from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../utilities/StackNavigation';
import Svg, { Text as SvgText, G } from 'react-native-svg';
import generateRandomColor from './colorRandomizer';

type NavigationProp = StackNavigationProp<RootStackParamList, 'StatusReport'>;

// type for imported data mapping
type info = {
  name: string, 
  count: number
}
// type for setting up bar graph
type BarGraphProps = {
  data: info[],
  reportId?: number,
  date: string,
};


const BarGraph: React.FC<BarGraphProps> = ({ data, reportId, date }) => {

  const [colors, setColors] = useState<string[]>([])
  const [upperBound, setUpperBound] = useState<number>(0);
  const [totalStrikes, setTotalStrikes] = useState<number>(0);
  const strikeCount = data.length;

  const nav = useNavigation<NavigationProp>();

  const LABEL_SPACING = 50;
  const SVG_HEIGHT = 500;

  useEffect(() => {
     // find upper bound on data counts
    let x = 0;
    let totalStrikes = 0;
    // set colors
    let c: string[] = []
    data.forEach((value, index) => {
      setTotalStrikes(totalStrikes += value.count);
      if (value.count > x) {
        x = value.count;
      }
      const color = generateRandomColor();
      c.push(color);
    })
    setColors(c);
    setUpperBound(x);
  }, [data])

  // perform all calculations and physically represent graph
  function setupGraph(data: info[]) {
    return(
        <ScrollView horizontal={true} contentContainerStyle={{flexDirection: 'column', paddingEnd: '50%', paddingBottom: '20%'}}>
          <View style={[styles.graph, {paddingEnd: '200%'}]}>
            {data.map((item, index) => (
              <View key={index} style={{alignItems: 'center', flexDirection: 'column-reverse'}}>
                <View style={[styles.bar, {height: `${((item.count / upperBound) * 100) * .85}%`, backgroundColor: colors[index]}]}/>
                <Text style={{color: colors[index], fontSize: 14, padding: "1%", fontWeight: 'bold'}}>{item.count}</Text>
                <Text style={{color: colors[index], fontSize: 14, padding: "1%", fontWeight: 'bold'}}>{Math.round((item.count / totalStrikes) * 100)}%</Text>
              </View>
            ))}
          </View>
          <View style={{alignItems: 'flex-start', height: 1000}}>
            <Svg width={strikeCount * LABEL_SPACING} height={SVG_HEIGHT}>
              {data.map((label, i) => {
                const x = i * LABEL_SPACING + LABEL_SPACING / 2;
                const y = 0;

                return (
                  <G key={label.name} transform={`translate(${x}, ${y}) rotate(45)`}>
                    <SvgText fill={colors[i]} fontSize={12} fontWeight={'bold'} textAnchor="start" alignmentBaseline="hanging">
                      {label.name}
                      <Text style={{paddingBottom: '10%'}}> </Text>
                    </SvgText>
                  </G>
                );
              })}
            </Svg>
          </View>
        </ScrollView>
    )
  }

  return (
    <View style={styles.container}>
        <View style={styles.graphView}>
          <Text style={styles.strikeText}>{date}</Text>
          {setupGraph(data)}
        </View>
    </View>
  );
};

export default BarGraph;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    marginVertical: '10%',
  },
  graphView: {
    alignItems: 'center',
    backgroundColor: 'black',
    padding: '2%',
    height: '100%',
    width: '100%',
    flexDirection: 'column',
    borderRadius: 10,
  },
  statView: {
    height: '50%',
    width: '100%',
  },
  graph: {
    borderStyle: 'solid',
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderColor: 'gray',
    backgroundColor: 'black',
    paddingTop: '5%',
    flexDirection: 'row',
    alignItems: 'flex-end',
    flexWrap: 'nowrap',
  },
  bar: {
    width: 20,
    marginHorizontal: 15,
  },
  stats: {
    flexDirection: 'column',
    padding: '15%',
    justifyContent: 'center',
  },
  statText: {
    color: 'red',
    fontWeight: 'bold',
  },
  row: {
    flexDirection: "row",
    justifyContent: 'space-between',
  },
  strikeText: {
    padding: "1%",
    fontSize: 12,
    color: 'white',
    fontStyle: 'italic',
    fontWeight: 'bold',
  },
  controlButton: {
    padding: "3%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: 'red',
    justifyContent: "center",
    alignItems: 'center',
    backgroundColor: 'black',
    color: "black",
    maxWidth: '75%'
  },
  homeButtonText: {
    color: "red",
    fontSize: 24,
  }
  
});