package chatbot;

import java.util.HashMap;
import java.util.Map;
import java.util.Scanner;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class Translation {

    private final TranslationService service;

    @Autowired
    public Translation(TranslationService service) {
        this.service = service;
    }

    private static final Map<String, String> LANGUAGE_NAME_TO_CODE = createLangMap();

    private static Map<String, String> createLangMap() {
        Map<String, String> m = new HashMap<>();
        m.put("malay", "ms");
        m.put("bahasa melayu", "ms");
        m.put("malaysian", "ms");
        m.put("english", "en");
        m.put("eng", "en");
        m.put("chinese", "zh");
        m.put("mandarin", "zh");
        m.put("tamil", "ta");
        m.put("french", "fr");
        m.put("spanish", "es");
        m.put("arabic", "ar");
        m.put("german", "de");
        m.put("japanese", "ja");
        return m;
    }

    /** -----------------------------
     * Helper methods (restored) - Made package-private for access by new API method
     * ----------------------------- */
    static String extractTargetCode(String text) {
        if (text == null) return null;
        String trimmed = text.trim();
        Pattern p = Pattern.compile("(?i)\\b(?:to|into)\\s+([a-zA-Z ]+)$");
        Matcher m = p.matcher(trimmed);
        if (m.find()) {
            String name = m.group(1).trim().toLowerCase();
            if (LANGUAGE_NAME_TO_CODE.containsKey(name)) return LANGUAGE_NAME_TO_CODE.get(name);
            if (name.matches("^[a-z]{2,3}$")) return name;
        }
        p = Pattern.compile("(?i)->\\s*([a-zA-Z ]+)$");
        m = p.matcher(trimmed);
        if (m.find()) {
            String name = m.group(1).trim().toLowerCase();
            if (LANGUAGE_NAME_TO_CODE.containsKey(name)) return LANGUAGE_NAME_TO_CODE.get(name);
            if (name.matches("^[a-z]{2,3}$")) return name;
        }
        return null;
    }

    static String extractSourceCode(String text) {
        if (text == null) return null;
        String trimmed = text.trim();
        Pattern p = Pattern.compile("(?i)\\bfrom\\s+([a-zA-Z ]+)$");
        Matcher m = p.matcher(trimmed);
        if (m.find()) {
            String name = m.group(1).trim().toLowerCase();
            if (LANGUAGE_NAME_TO_CODE.containsKey(name)) return LANGUAGE_NAME_TO_CODE.get(name);
            if (name.matches("^[a-z]{2,3}$")) return name;
        }
        p = Pattern.compile("(?i)from\\s+([a-zA-Z ]+)\\s+to\\s+[a-zA-Z ]+$");
        m = p.matcher(trimmed);
        if (m.find()) {
            String name = m.group(1).trim().toLowerCase();
            if (LANGUAGE_NAME_TO_CODE.containsKey(name)) return LANGUAGE_NAME_TO_CODE.get(name);
            if (name.matches("^[a-z]{2,3}$")) return name;
        }
        return null;
    }

    static String stripTargetPhrase(String text) {
        if (text == null) return null;
        String t = text.replaceAll("(?i)\\b(?:to|into)\\s+[a-zA-Z ]+$", "")
                      .replaceAll("(?i)->\\s*[a-zA-Z ]+$", "")
                      .trim();
        return t;
    }

    static String resolveLanguageCode(String input) {
        if (input == null) return null;
        String s = input.trim().toLowerCase();
        if (s.isEmpty()) return null;
        if (s.matches("^[a-z]{2,3}$")) return s;
        if (LANGUAGE_NAME_TO_CODE.containsKey(s)) return LANGUAGE_NAME_TO_CODE.get(s);
        if (s.endsWith("s") && LANGUAGE_NAME_TO_CODE.containsKey(s.substring(0, s.length() - 1))) {
            return LANGUAGE_NAME_TO_CODE.get(s.substring(0, s.length() - 1));
        }
        return null;
    }
    
    // Kept this for console use only
    private static void printLanguageSuggestions() {
        System.out.print("Known languages: ");
        boolean first = true;
        for (String name : LANGUAGE_NAME_TO_CODE.keySet()) {
            if (!first) System.out.print(", ");
            System.out.print(name);
            first = false;
        }
        System.out.println();
    }

    /** -----------------------------
     * Main handle() logic (Kept for console compatibility)
     * ----------------------------- */
    public void handle(Scanner scanner, Map<String, String> memory) {
        // ... (Existing console logic remains here)
        System.out.println("Chatbot: Welcome to the Translator module!");
        System.out.println("1) Translate text");
        System.out.println("2) Return to main menu");
        System.out.println("3) Exit");

        String choice = scanner.nextLine().trim().toLowerCase();
        memory.put("translatorChoice", choice);

        switch (choice) {
            case "1":
            case "translate":
                System.out.print("Enter text to translate: ");
                String input = scanner.nextLine();
                String target = extractTargetCode(input);
                String text = input;

                if (target != null) {
                    text = stripTargetPhrase(input);

                    if (service.isMyMemory()) {
                        String source = extractSourceCode(input);
                        if (source == null) {
                            System.out.print("Enter source language (e.g., english): ");
                            String srcInput = scanner.nextLine();
                            source = resolveLanguageCode(srcInput);
                        }

                        try {
                            String translated = service.translate(text, source, target);
                            System.out.println("Chatbot: " + translated);
                        } catch (Exception e) {
                            System.out.println("Chatbot: Translation failed — " + e.getMessage());
                        }
                        break;
                    }
                }

                // fallback prompt (kept same)
                System.out.print("Enter source language (e.g., english or en): ");
                String sourceInput = scanner.nextLine().trim();
                String source = resolveLanguageCode(sourceInput);
                if (source == null) {
                    System.out.println("Chatbot: Unknown source language '" + sourceInput + "'.");
                    printLanguageSuggestions();
                    return;
                }

                System.out.print("Enter target language (e.g., malay or ms): ");
                String targetInput = scanner.nextLine().trim();
                target = resolveLanguageCode(targetInput);
                if (target == null) {
                    System.out.println("Chatbot: Unknown target language '" + targetInput + "'.");
                    printLanguageSuggestions();
                    return;
                }

                if (text == null || text.isBlank()) {
                    System.out.print("Enter text to translate: ");
                    text = scanner.nextLine();
                }

                try {
                    String translated = service.translate(text, source, target);
                    System.out.println("Chatbot: " + translated);
                } catch (Exception e) {
                    System.out.println("Chatbot: Translation failed — " + e.getMessage());
                }
                break;

            case "2":
                System.out.println("Chatbot: Returning to main menu...");
                return;

            case "3":
                System.out.println("Chatbot: Goodbye!");
                System.exit(0);
                break;

            default:
                System.out.println("Chatbot: Sorry, please select 1–3.");
        }
    }

    // --- NEW REST API METHOD ---
    /**
     * Handles translation requests directly from the REST API.
     * @param query The user's input message (e.g., "translate hello to malay").
     * @return The translation result or an error message.
     */
    public String getTranslationReply(String query) {
        try {
            // 1. Try to extract target language from phrase (e.g., "to malay")
            String target = extractTargetCode(query);
            if (target == null) {
                return "Please specify the target language. Try: 'translate [text] to [language]'";
            }

            // 2. Try to extract source language (e.g., "from english")
            String source = extractSourceCode(query);
            if (source == null) {
                // Default to English if source is not specified. This is a common pattern for chatbots.
                source = "en"; 
            }
            
            // 3. Extract the text to be translated by removing language phrases
            String text = stripTargetPhrase(query);
            text = text.replaceAll("(?i)\\b(?:translate|translation)\\b", "").trim();

            if (text.isBlank()) {
                 return "Please provide the text you want to translate.";
            }

            // 4. Perform translation
            String translated = service.translate(text, source, target);
            return "Translation (" + resolveLanguageCode(source) + " -> " + resolveLanguageCode(target) + "): " + translated;

        } catch (UnsupportedOperationException e) {
            String msg = e.getMessage() == null ? "" : e.getMessage();
            String up = msg.toUpperCase();
            if (up.contains("INVALID TARGET") || up.contains("INVALID TARGET LANGUAGE") || up.contains("LANGPAIR") || up.contains("INVALID TARGET LANG")) {
                return "Language not supported";
            }
            return "Error: " + msg;
        } catch (IllegalArgumentException e) {
            String msg = e.getMessage() == null ? "" : e.getMessage();
            String up = msg.toUpperCase();
            if (up.contains("INVALID TARGET") || up.contains("INVALID TARGET LANGUAGE") || up.contains("LANGPAIR") || up.contains("INVALID TARGET LANG")) {
                return "Language not supported";
            }
            return "Error with languages: " + msg;
        } catch (Exception e) {
            // Catch API failures (network, HTTP errors)
            return "Translation failed due to a system error. Please check API keys. Error: " + e.getMessage();
        }
    }
}