package chatbot;

import java.util.Map;
import java.util.Scanner;

import org.springframework.stereotype.Component;

@Component
public class Recommendations {

    // --- CONSOLE INTERFACE METHOD (Kept for compatibility with Chatbotapp.main) ---
    public void handle(Scanner scanner, Map<String, String> memory) {
        String existingChoice = memory.get("recChoice");

        if (existingChoice != null && (existingChoice.equals("1") || existingChoice.equals("2") || existingChoice.equals("3"))) {
            processRecommendation(scanner, existingChoice, memory);
            return;
        }
        showRecommendationMenu(scanner, memory);
    }

    private void showRecommendationMenu(Scanner scanner, Map<String, String> memory) {
        while (true) {
            System.out.println("Chatbot: You have asked for recommendations. What type of recommendations are you looking for?");
            System.out.println("1) Famous tourist locations");
            System.out.println("2) Local food and restaurants");
            System.out.println("3) Hotels and accommodations");
            System.out.println("4) Return to previous menu");
            System.out.println("5) Exit");

            String recChoice = scanner.nextLine().trim().toLowerCase();
            memory.put("recChoice", recChoice);

            if (processRecommendation(scanner, recChoice, memory)) break;
        }
    }

    /** Returns true if the user wants to exit or go back. */
    private boolean processRecommendation(Scanner scanner, String choice, Map<String, String> memory) {
        // ... (existing console logic)
        switch (choice) {
            case "1" -> System.out.println("Chatbot: I recommend visiting Marina Bay Sands, Gardens by the Bay, and Sentosa Island!");
            case "2" -> System.out.println("Chatbot: Try Lau Pa Sat, Maxwell Hawker Centre, and Old Airport Road Food Centre!");
            case "3" -> System.out.println("Chatbot: Top hotels include Marina Bay Sands, Hotel Boss, and The Fullerton Hotel.");
            case "4" -> {
                System.out.println("Chatbot: Returning to previous menu...");
                // Note: Calling Chatbotapp.main here might cause issues in a web environment. 
                // We leave it as is to preserve original console behavior.
                Chatbotapp.main(new String[0]); 
                return true;
            }
            case "5" -> {
                System.out.println("Chatbot: Goodbye!");
                System.exit(0);
            }
            default -> {
                System.out.println("Chatbot: Sorry, I didn't understand that. Please select 1-5.");
                return false;
            }
        }
        return true;
    }

    // --- NEW REST API METHOD ---
    /**
     * Handles recommendation requests from the REST API.
     * @param query The user's input message (already lowercased).
     * @return The chatbot's reply.
     */
    public String getRecommendationReply(String query) {
        if (query.contains("food") || query.contains("restaurant")) {
            return "Try Lau Pa Sat, Maxwell Hawker Centre, and Old Airport Road Food Centre! They offer great local food.";
        }
        if (query.contains("hotel") || query.contains("stay") || query.contains("accommodation")) {
            return "Top hotels for Singapore include Marina Bay Sands, Hotel Boss, and The Fullerton Hotel.";
        }
        if (query.contains("place") || query.contains("tourist") || query.contains("location") || query.contains("sight")) {
            return "I recommend visiting Marina Bay Sands, Gardens by the Bay, and Sentosa Island!";
        }
        return "I can suggest famous tourist locations, local food, or accommodations. Which are you interested in?";
    }
}
