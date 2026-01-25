// File: StatusReport.tsx
// Author: Tony Jordan
// Purpose: Component for displaying user generated reports, and UI elements for navigation when generating new reports.

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../utilities/StackNavigation';
import {useNavigation} from '@react-navigation/native';
import { getDBConnection, getReports } from '../utilities/DefaultInfo';
import LinearGradient from 'react-native-linear-gradient';
import LineGraph from '../utilities/LineGraph';
import BarGraph from '../utilities/BarGraph';

// raw report type is for pulling data for report over time
export type RawReport = {id: number, data: string, date: string};
export type info = {name: string, count: number};

type NavigationProp = StackNavigationProp<RootStackParamList, 'StatusReport'>;

const StatusReport = () => {
    const nav = useNavigation<NavigationProp>();

    const [formattedReports, setFormatedReports] = useState<info[]>();
    const [reports, setReports] = useState<RawReport[]>();
    const [recentReportId, setRecentReportId] = useState<number>();
    const [date, setDate] = useState<string>('');

     // format favorites for use in table list
      useEffect(() => {
        const fetchData = async () => {
          const db = await getDBConnection();
          const pulledReports = (await getReports(db));

          // sort through each date in pulled reports
          for (let x = 0; x < pulledReports.length; x++) {
            for (let y = x; y < pulledReports.length; y++) {
              // if x is earlier than y, swap positions
              if (new Date(pulledReports[x].date) < new Date(pulledReports[y].date)) {
                let temp = pulledReports[x];
                pulledReports[x] = pulledReports[y];
                pulledReports[y] = temp;
              }
            }
          }

          setReports(pulledReports);
          setDate(pulledReports[0].date);
          // pull most recent report and set up data for graph
          let info = JSON.parse(pulledReports[0].data);
          let id = pulledReports[0].id;
          setFormatedReports(info);
          setRecentReportId(id);
        };
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
            <ScrollView contentContainerStyle={{flexGrow: 1}}>
              <Text style={[styles.headText, {marginTop: Dimensions.get('window').height * .075}]}>Current Strike Data</Text>
              <View style={styles.graphContainer}>
                {formattedReports && <BarGraph data={formattedReports} reportId={recentReportId} date={date}/>}
                {!formattedReports && <Text style={[styles.headText, {fontSize: 18}]}>Not enough strike data to generate report</Text>}
              </View>
              <Text style={[styles.headText, {marginTop: Dimensions.get('window').height * .075}]}>Saved Strikes Over Time</Text>
              <View style={[styles.graphContainer, {height: (!reports || reports.length < 2) ? Dimensions.get('window').height * .5 : 'auto', justifyContent:'flex-start'}]}>
                {reports && reports.length > 1 && <LineGraph data={reports as RawReport[]}/>}
                {(!reports || reports.length < 2) && <Text style={[styles.headText, {fontSize: 18, paddingTop: '50%'}]}>Not enough strike data to generate report</Text>}
              </View>
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
                <LinearGradient colors={['red', '#390842']} style={[styles.controlButton, {backgroundColor: "red"}]}>
                  <Text style={{color: "white", fontSize: 30, fontWeight: "bold"}}>Go Back</Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </LinearGradient>
    )
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
  bodyMain: {
    flex: 1,
    borderColor: "black",
    alignItems: "center",
    justifyContent: 'space-between',
  },
  bodyText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 20,
    marginHorizontal: "3%",
    marginBottom: "1%",
  },
  graphContainer: {
    backgroundColor: 'black',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'white',
    height: Dimensions.get('window').height * .5,
    width: '95%',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'stretch',
    alignSelf: 'center',
  },
  headText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 30,
    paddingStart: 10,
    paddingTop: 20,
    textAlign: 'center'
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
    fontSize: 24,
  },
  homeButtonText: {
    color: "white",
    fontWeight: 'bold',
    fontSize: 30,
  },
  loading: {
    position: 'absolute',
    width: '95%',
    height: '50%',
    alignItems: 'center',
    zIndex: 999, 
    backgroundColor: 'white',
    borderRadius: 10,
    borderStyle: 'solid',
    borderColor: 'black',
    borderWidth: 1,
    marginTop: '25%',
    justifyContent: 'center',
  },

});

export default StatusReport;