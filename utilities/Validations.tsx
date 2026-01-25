import { Alert } from "react-native";
import { inputs } from "../components/WorkoutCustomization";
import React, { Dispatch, SetStateAction } from "react"

// confirm there are no non-numeric characters in provided string
export default function hasNonNumeric(value: string): boolean {
  return /[^0-9]/.test(value);
}

// ensure strikes are not empty to prevent empty strikes from being saved to database
export function validateStrikes(strikes: string[]) {
  if (strikes.length == 0) {
    return false;
  }
  for (let strike in strikes) {
    if (strikes[strike] === "") {
      return false;
    }
  }
  return true;
}

// take in inputs and functions to change each input's border color to red if input is not valid
export function validateInputs(id: string, result : inputs, cc: Dispatch<SetStateAction<boolean>>, tc: Dispatch<SetStateAction<boolean>>, spc: Dispatch<SetStateAction<boolean>>, tps: Dispatch<SetStateAction<boolean>>) {
  let alerts = ""
  // convert data to number
  if (parseInt(result.comboCount) <= 0 || result.comboCount == "" || hasNonNumeric(result.comboCount)) {
    alerts += "Total number of combos cannot be less than 1\n";
    cc(false);
  }
  else {
    cc(true);
  }
  if (parseInt(result.throwCount) <= 0 || result.throwCount == "" || hasNonNumeric(result.throwCount)) {
    alerts += "Combo throw count must be at least 1\n";
    tc(false)
  }
  else {
    tc(true)
  }
  if (id != "-999") {
    if (parseInt(result.strikesPerCombo) < 3 || result.strikesPerCombo == "" || hasNonNumeric(result.strikesPerCombo) || parseInt(result.strikesPerCombo) > 25) {
      alerts += "Must have between 3 and 25 strikes per combo\n";
      spc(false)
    }
    else {
      spc(true);
    }
  }
  if (result.timePerStrike == "" || hasNonNumeric(result.timePerStrike)) {
    alerts += "Failed to properly get slide bar data\n";
    tps(false)
  }
  else {
    tps(true);
  }
  if (alerts.length > 0) {
    Alert.alert('Validation Error', alerts);
    return false;
  }
  else {
    return true;
  }
}

// strike set customization validation
export function validSSUpdate(strikes: string[], name: string) {
  // instantiate empty string message variable to display validation errors
  let message = "";
  if (!validateStrikes(strikes)) {
    message += "Cannot save empty strike\n";
  }
  if (name == "") {
    message += "Please provide a name for your strike set\n";
  }
  if (message == "") {
    return true;
  }
  else {
    Alert.alert('Input Error', message);
    return false;
  }
}