import React, { useState } from "react";
import { Image, TouchableOpacity } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import { LoginScreen } from "./screens/Login";
import MainScreen from "./screens/Main";
import i18n from "./languages/langStrings";
import * as Commons from "./utils/Commons";
import { NewVisitScreen } from "./screens/NewVisit";
import { NewCustomerPotentialScreen } from "./screens/NewCustomerPotential";
import { NewCustomerVisitScreen } from "./screens/NewCustomerVisit";
import { MyVisitsScreen } from "./screens/MyVisits";

const { Navigator, Screen } = createStackNavigator();

const AppNavigator = () => (
  <NavigationContainer>
    <Navigator initialRouteName="Login">
      <Screen
        options={{
          headerShown: false,
        }}
        name="Login"
        component={LoginScreen}
      ></Screen>
      <Screen
        options={{
          headerShown: false,
        }}
        name="Main"
        component={MainScreen}
      ></Screen>
      <Screen
        options={{ title: i18n.t("newVisit") }}
        name="NewVisit"
        component={NewVisitScreen}
      ></Screen>
      <Screen
        options={{ title: i18n.t("myVisits") }}
        name="MyVisits"
        component={MyVisitsScreen}
      ></Screen>
      <Screen
        options={{ title: i18n.t("newCustomerVisit") }}
        name="NewCustomerVisit"
        component={NewCustomerVisitScreen}
      ></Screen>
      <Screen
        options={{ title: i18n.t("newCustomerPotential") }}
        name="NewCustomerPotential"
        component={NewCustomerPotentialScreen}
      ></Screen>
    </Navigator>
  </NavigationContainer>
);

export default AppNavigator;
