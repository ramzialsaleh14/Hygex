import { StatusBar } from "expo-status-bar";
import { Provider as PaperProvider } from "react-native-paper";
import AppNavigator from "./app/app.navigation";
import { theme } from "./App.style";
import * as Notifications from "expo-notifications";
import React, { useEffect } from "react";
import * as Strings from "./app/utils/Strings";
import * as Localization from "expo-localization";
import i18n from "i18n-js";
import * as Commons from "./app/utils/Commons";

export const getLanguage = async () => {
  const currentLang = await Commons.getFromAS("lang");
  if (currentLang == null || currentLang == "") {
    await Commons.saveToAS("lang", "ar");
  }
  if (currentLang == "en") { i18n.locale = "en"; await Commons.saveToAS("lang", "en"); };
  if (currentLang == "ar") { i18n.locale = "ar"; await Commons.saveToAS("lang", "ar"); };
  if (currentLang == "" || currentLang == null) i18n.locale = "ar";
  i18n.enableFallback = true;
};

const App = () => {
  getLanguage();
  return (
    <PaperProvider theme={theme}>
      <AppNavigator />
    </PaperProvider>
  );
};

export default App;
