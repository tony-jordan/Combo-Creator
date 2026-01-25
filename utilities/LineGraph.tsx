// File: LineGraph.tsx
// Author: Tony Jordan
// Purpose: Formats supplied data to create a line graph to present data back to user.

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ScrollView, View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import Svg, { Polyline } from 'react-native-svg';
import { RawReport } from '../components/StatusReport';
import { DataSet } from './DefaultInfo';
import generateRandomColor from './colorRandomizer';

// type for line graph setup
type LineGraphProps = {
  data: RawReport[];
};

// type for formatting supplied data
type Data = {
    data: any[],
    title: string
}
// type for holding strike count data
type Entry = {
    name: string,
    counts: number[],
}

// line graph function
const LineGraph: React.FC<LineGraphProps> = ({ data }) => {
  // default value "All Strikes" for table list
  const [strikeOptions, setStrikeOptions] = useState<DataSet[]>([{id: 0, name: "All Strikes", strikes: ""}]);
  const [graphWidth, setGraphWidth] = useState(0);
  const [graphHeight, setGraphHeight] = useState(0);
  const hasMeasured = useRef(false);
  const [mappedStrikes, setMappedStrikes] = useState<Entry[]>([]);
  const [visibleStrike, setVisibleStrike] = useState<boolean[]>([]);
  const [yAxis, setYAxis] = useState<React.JSX.Element>();
  const [dates, setDates] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);

  const screenHeight = Dimensions.get('window').height;

  // Parse data and find min/max
  var parsedData = useMemo(
    () => 
      data.map((temp, index) => ({
        data: JSON.parse(temp.data),
        title: 'Report ' + temp.date,
      })),
    [data]
  );

  // sort parsedData
  // sort params by date
  let temp = parsedData;
  for (let x = 0; x < temp.length; x++) {
    let date1 = new Date(temp[x].title.replace("Report ", ""));
    for (let y = x; y < temp.length; y++) {
      let date2 = new Date(temp[y].title.replace("Report ", ""));
      // if date2 < date1, date2 comes after date1. Swap em
      if (date2 < date1) {
        let dateTemp = temp[y];
        temp[y] = temp[x];
        temp[x] = dateTemp
      }
    }
  }
  parsedData = temp;
  const reportNumber = data.length;

  const { upperBound, lowerBound } = useMemo(() => {
    let max = 0;
    let min = Infinity;

    parsedData.forEach((report) => {
      // set dates for use in data presentation
      let date = new Date(report.title.replace("Report ", ""))
      let dateTemp = dates;
      dateTemp.push((date.getMonth() + 1) + "/" + date.getDate());
      setDates(dateTemp);

      // get max and min counts for line graph setup
      report.data.forEach((point: any) => {
        if (point.count > max) max = point.count;
        if (point.count < min) min = point.count;
      });
    });
    return { upperBound: max, lowerBound: min };
  }, [parsedData]);

  useEffect(() => {
    // Y-axis labels
  const YAxis = (() => {
    if (graphHeight > 0) {
      const axis = [];
      let maxUnits = Math.floor(graphHeight / 16.3);
      // minimum distance between values is 16.3 units
      let validStep = false;
      // prevent overflow by having large steps for a higher number of favorite combos
      var step = 1;
      while (!validStep) {
        const temp = [];
        for(let x = 0; x < upperBound; x += step) {
          temp.push(x);
        }
        if (temp.length > maxUnits) {
          switch(step) {
            case 1:
            step = 2;
            break;
            case 2:
            step = 5;
            break;
            case 5:
            step = 10
            break;
            case 10:
            step = 25;
            break;
            case 25:
            step = 50;
            break;
            default:
            step += 50;
            break;
          }
        }
        else {
          validStep = true;
        }
      }
      // set up y axis with configured step data
      for (let i = 0; i <= upperBound; i += step) axis.push(i);
      return (
        <View style={styles.yAxis}>
          {axis.map((item) => (
            <Text key={item} style={styles.yValues}>
              {item}
            </Text>
          ))}
        </View>
      );
    }
    else {
      return(
        <View style={styles.yAxis}/>
      )
    }
  });
  setYAxis(YAxis);
  }, [graphHeight])
  

  // Only measure graph once
  const onLayout = (event: any) => {
    if (hasMeasured.current) return;
    const { width, height } = event.nativeEvent.layout;
    if (width && height) {
      setGraphWidth(width);
      setGraphHeight(height);
      hasMeasured.current = true;
    }
  };

  // Map data to scaled SVG points
  const getPolylinePoints = (reportData: Entry) => {
    return reportData.counts
      .map((point, index) => {
        const x = (index / (reportNumber - 1)) * graphWidth;
        const y = graphHeight - (point / upperBound) * graphHeight;
        return `${x},${y}`;
      })
      .join(' ');
  };

  const getLines = (reportData: Data[]) => {
    // get all strikes formatted as such where jab is the strike name, and the following array is its count over time:
    // ['jab', [1, 4, 2]]
    const output: Entry[] = []
    for (let x = 0; x < reportData.length; x++) {
        // iterate through data in reportData
        for(let y = 0; y < reportData[x].data.length; y++) {
            // see if strike has been added to output, and add if not
            const index = output.findIndex(item => item.name === reportData[x].data[y].name);
            if (index == -1) {
                // fill array with missing values (where number of strikes = 0)
                let temp = new Array(x).fill(0)
                temp.push(reportData[x].data[y].count)
                output.push({name: reportData[x].data[y].name, counts: temp})

                let anotherTemp = strikeOptions;
                anotherTemp.push({id: anotherTemp.length, name: reportData[x].data[y].name, strikes: ""})
                setStrikeOptions(anotherTemp);
            }
            else {
                output[index].counts.push(reportData[x].data[y].count)
            }
            
        }
        // iterate through output, if there are any strikes with fewer than x counts, append 0
        for (let z = 0; z < output.length; z++) {
            if (output[z].counts.length < x + 1) {
                output[z].counts.push(0);
            }
        }
    }
    setVisibleStrike(new Array(output.length).fill(true));
    return output;
  }
  // format strike data for entry in line graph
  useEffect(() => {
    // set colors based on mapped strikes
    let colorTemp = []
    let temp = getLines(parsedData)
    // iterate through data and sort based on last value in count
    for (let x = 0; x < temp.length; x++) {
      for (let y = x; y < temp.length; y++) {
        if (temp[x].counts[temp[x].counts.length - 1] < temp[y].counts[temp[y].counts.length - 1]) {
          let v = temp[x];
          temp[x] = temp[y];
          temp[y] = v;
        }
      }
    }
    setMappedStrikes(temp)
    for (let x = 0; x < temp.length; x++) {
      colorTemp.push(generateRandomColor());
    }
    setColors(colorTemp);
  }, [])

  // function for detailing whether button will show or hide all line graphs
  function showOrHide() {
    for (let x = 0; x < visibleStrike.length; x++) {
      if (!visibleStrike[x]) {
        return true;
      }
    }
    return false;
  }

  function displayData(times : string[]) {
    // icons for value changes in counts
    const icons = [
      require('../assets/up.png'),
      require('../assets/down.png'),
      require('../assets/same.png'),
    ];
    // format data to be count -> icon graphic -> count of next index
    let children = new Array(mappedStrikes.length).fill([]);
    for (let x = 0; x < mappedStrikes.length; x++) {
      let childTemp = [];
      for (let y = 0; y < mappedStrikes[x].counts.length; y++) {
        let count = mappedStrikes[x].counts[y];
        if (y == 0)
          childTemp.push(
          <View key={`count1-${x}-${y}`}>
            <Text style={styles.yValues}>{times[y]}</Text>
            <Text style={styles.statText}>{count}</Text>
          </View>
        );
        let plusMinus: number = 2
        let amount = "0"
        // add graphic to child nodes
        if (y < mappedStrikes[x].counts.length - 1) {
          if (count > mappedStrikes[x].counts[y + 1]) {
            plusMinus = 1;
            amount = "-" + (count - mappedStrikes[x].counts[y + 1])
          }
          else if (count < mappedStrikes[x].counts[y + 1]) {
            plusMinus = 0; 
            amount = "+" + (mappedStrikes[x].counts[y + 1] - count)
          }
        }
        if (y != mappedStrikes[x].counts.length - 1) {
          childTemp.push(
          <View key={`graphic-${x}-${y}`} style={{alignItems: 'center'}}>
            <Image style={styles.img} source={icons[plusMinus]} />
            <Text style={styles.statText}>{amount}</Text>
          </View>)
        // add elements separetely to prevent needing parent 
          childTemp.push(
          <View key={`count2-${x}-${y}`} style={{alignItems: 'center'}}>
            <Text style={styles.yValues}>{times[y + 1]}</Text>
            <Text style={styles.statText}>{mappedStrikes[x].counts[y + 1]}</Text>
          </View>);

        }
      }
      children[x] = childTemp;
    }
    return(
      <View style={{flexDirection: 'column', width: graphWidth, marginLeft: 'auto'}}>
        <View style={{flexDirection: 'row', width: '100%', justifyContent: 'space-between'}}>
            <Text style={[styles.yValues, {fontWeight: 'bold'}]}>{times[0]}</Text>
            <Text style={[styles.yValues, {fontWeight: 'bold'}]}>{times[times.length - 1]}</Text>
        </View>
        <View style={{width: '100%'}}>
          <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center', margin: '1%'}} onPress={() => {
            if (showOrHide()) {
              let temp = new Array(visibleStrike.length).fill(true);
              setVisibleStrike(temp);
            }
            else {
              let temp = new Array(visibleStrike.length).fill(false);
              setVisibleStrike(temp);
            }
          }}>
            <Text style={[styles.yValues, {fontWeight: 'bold', borderStyle: 'solid', borderWidth: 1, borderColor: 'red', padding: '1%'}]}>{showOrHide() ? "Show all" : "Hide all"}</Text>
          </TouchableOpacity>
          <View style={{flexDirection: 'row', width: '100%', alignSelf: 'flex-end', paddingTop: '1%', paddingBottom: '1%', flexWrap: 'wrap'}}>
          {mappedStrikes.map((entry, index) => (
              <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center', margin: '1%'}} key={index} onPress={() => {
                if (visibleStrike[index]) {
                  let temp: boolean[] = [];
                  temp = temp.concat(visibleStrike);
                  temp[index] = false;
                  setVisibleStrike(temp);
                }
                else {
                  let temp: boolean[] = [];
                  temp = temp.concat(visibleStrike);
                  temp[index] = true;
                  setVisibleStrike(temp);
                }
              }}>
                <Text style={[styles.yValues, {fontWeight: 'bold', textDecorationLine: !visibleStrike[index] ? 'line-through' : 'none',
                  color: !visibleStrike[index] ? 'gray' : 'red'
                }]}>{entry.name}</Text>
                <View style={{padding: 5, backgroundColor: colors[index], marginStart: '5%'}}></View>
              </TouchableOpacity>
            ))} 
          </View>
          {mappedStrikes.map((entry, index) => (
            <View style={{flexDirection: 'column', display: visibleStrike[index] ? 'flex': 'none', width: '100%', alignItems: 'center', paddingTop: '1%', paddingBottom: '1%', justifyContent: 'center'}} key={index}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={[styles.yValues, {fontWeight: 'bold'}]}>{entry.name}</Text>
                <View style={{padding: '1%', backgroundColor: colors[index], margin: '1%'}}></View>
              </View>
              <ScrollView contentContainerStyle={{justifyContent: 'space-between', flexGrow: 1, paddingEnd: '1%'}} horizontal={true} style={styles.row}>
                <View style={{justifyContent: 'space-between', flexDirection: 'row', width: '100%'}}>{children[index]}</View>
              </ScrollView>
            </View>
            ))}
        </View>
      </View>
    )
  }
  return (
    <View style={{width: '95%'}}>
    <View style={styles.container}>
      {yAxis}
      <View style={styles.graph} onLayout={onLayout}>
        {graphWidth > 0 && graphHeight > 0 && (
          <Svg width={graphWidth} height={graphHeight}>
            {mappedStrikes.map((strike, idx) => (
              <View style={{flexDirection: 'row', display: visibleStrike[idx] ? 'flex': 'none'}} key={idx}>
              <Polyline
                key={idx}
                points={getPolylinePoints(strike)}
                fill="none"
                stroke={colors[idx]}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              </View>
            ))}
          </Svg>
        )}
      </View>
    </View>
    <View style={{width: '100%'}}>
      {displayData(dates)}
    </View>
    </View>
  );
};

export default LineGraph;

const styles = StyleSheet.create({
  container: {
    padding: '5%',
    flexDirection: 'row',
    width: '100%',
  },
  statText: {
    textAlign: 'center',
    fontWeight: 'bold',
     color: 'white',
    fontSize: 15,
  },
  img: {
    height: 35,
    width: 35,
    resizeMode: 'contain',
  },
  dot: {
    borderRadius: 3,
    backgroundColor: 'red',
    width: 6,
    height: 6,
  },
  graph: {
    width: '100%',
    minHeight: Dimensions.get('window').height * .5,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: 'gray',
    backgroundColor: 'black',
  },
  yAxis: {
    justifyContent: 'space-between',
    flexDirection: 'column-reverse',
    minHeight: Dimensions.get('window').height * .5,
    paddingHorizontal: 4,
  },
  yValues: {
    color: 'red',
    fontSize: 12,
  },
  row: {
    backgroundColor: 'black',
    borderColor: 'red',
    borderStyle: "solid",
    borderWidth: 2,
    flexDirection: 'row',
    width: '100%',
  }
});