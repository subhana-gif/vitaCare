import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import App from "./App";
import "./index.css";
import { TolgeeProvider, Tolgee, DevTools, FormatSimple } from "@tolgee/react";
import translationsRaw from "../translations.json"; // Import JSON

// Fix: Nest translations inside language keys
const translations = {
  en: Object.fromEntries(
    Object.entries(translationsRaw).map(([key, value]) => [key, value.en])
  ),
  fr: Object.fromEntries(
    Object.entries(translationsRaw).map(([key, value]) => [key, value.fr])
  ),
};

const tolgee = Tolgee()
  .use(DevTools())
  .use(FormatSimple())
  .init({
    availableLanguages: ["en", "fr"],
    defaultLanguage: localStorage.getItem("lang") || "en", // Get from storage
    fallbackLanguage: "en",
    staticData: translations, // Make sure translations are structured correctly
  });

const rootElement = document.getElementById("root");

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <TolgeeProvider tolgee={tolgee}>
      <Provider store={store}>
        <App />
      </Provider>
    </TolgeeProvider>
  );
} else {
  console.error("Root element not found");
}
