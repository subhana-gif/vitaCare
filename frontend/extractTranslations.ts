import fs from "fs";
import path from "path";
import translate from "google-translate-api-x";

const DIRECTORY_TO_SCAN = path.join(process.cwd(), "src");
const TRANSLATION_REGEX = /<T\s+keyName=["']([^"']+)["']/g;
const TRANSLATION_FILE = path.join(process.cwd(), "translations.json");

// ✅ Load existing translations or initialize a new object
let translations: Record<string, { en: string; fr: string }> = {};
if (fs.existsSync(TRANSLATION_FILE)) {
  translations = JSON.parse(fs.readFileSync(TRANSLATION_FILE, "utf-8"));
} else {
  fs.writeFileSync(TRANSLATION_FILE, JSON.stringify({}, null, 2));
}

// ✅ Scan project files to extract translation keys
const scanDirectory = (directory: string) => {
  const files = fs.readdirSync(directory);
  files.forEach((file) => {
    const fullPath = path.join(directory, file);
    if (fs.statSync(fullPath).isDirectory()) {
      scanDirectory(fullPath);
    } else if (file.endsWith(".tsx") || file.endsWith(".ts")) {
      extractTranslations(fullPath);
    }
  });
};

// ✅ Extract translation keys from files
const extractTranslations = (filePath: string) => {
  const content = fs.readFileSync(filePath, "utf-8");
  let match: RegExpExecArray | null;

  while ((match = TRANSLATION_REGEX.exec(content)) !== null) {
    const key = match[1];
    if (!(key in translations)) {
      translations[key] = { 
        en: key, 
        fr: "", 
        ml: "", 
        ar: "" 
      };
    }
    }
};

// ✅ Translate text into multiple languages (English & French)
const translateText = async (text: string) => {
  try {
    const [frRes] = await Promise.all([
      translate(text, { to: "fr" }), // French translation
    ]);

    return {
      en: text,  // English remains the same
      fr: frRes.text, // French translation
    };
  } catch (error) {
    console.error(`❌ Error translating "${text}":`, error.message);
    return { en: text, fr: text }; // Default to original text in case of error
  }
};

// ✅ Process all translations
const processTranslations = async () => {
  console.log("🔍 Scanning project for translation keys...");
  scanDirectory(DIRECTORY_TO_SCAN);

  // ✅ Find keys that need translation
  const missingKeys = Object.keys(translations).filter((key) => translations[key].fr === "");

  if (missingKeys.length === 0) {
    console.log("✅ No new translations needed.");
    return;
  }

  console.log(`🌍 Translating ${missingKeys.length} keys...`);
  for (const key of missingKeys) {
    translations[key] = await translateText(key); // ✅ Store both English & French
  }

  // ✅ Save updated translations to file
  fs.writeFileSync(TRANSLATION_FILE, JSON.stringify(translations, null, 2));
  console.log(`✅ Translations updated: ${TRANSLATION_FILE}`);
};

// Run script
processTranslations();
