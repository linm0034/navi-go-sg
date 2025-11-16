package chatbot;

import java.util.HashMap;
import java.util.Map;
import java.util.Scanner;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ApplicationContext;

@SpringBootApplication(scanBasePackages = "chatbot")
public class Chatbotapp {

    public static void main(String[] args) {
        ApplicationContext ctx = SpringApplication.run(Chatbotapp.class, args);

        // Check if running in console mode
        boolean consoleMode = false;
        for (String arg : args) {
            if (arg.equalsIgnoreCase("--console")) {
                consoleMode = true;
                break;
            }
        }

        if (consoleMode) {
            runConsoleMode(ctx);
        } else {
            System.out.println("Web mode active — Chatbot REST API available at http://localhost:8080/api/chat,");
        }
    }

    private static void runConsoleMode(ApplicationContext ctx) {
        Recommendations recommendations = ctx.getBean(Recommendations.class);
        RoutePlanner routePlanner = ctx.getBean(RoutePlanner.class);
        Translation translator = ctx.getBean(Translation.class);

        Scanner sc = new Scanner(System.in);
        Map<String, String> memory = new HashMap<>();

        System.out.println("Chatbot: Hello! I am the Tourism App Chatbot (console mode)!");
        boolean running = true;

        while (running) {
            System.out.println("\nChatbot: Please select one of the following options:");
            System.out.println("1. Recommendations");
            System.out.println("2. Route planner");
            System.out.println("3. Translator");
            System.out.println("4. Exit");
            System.out.print("Your choice: ");

            String choice = sc.nextLine().trim().toLowerCase();
            memory.put("mainChoice", choice);

            if (choice.contains("recommend")) {
                if (choice.contains("food") || choice.contains("restaurant")) {
                    memory.put("recChoice", "2");
                    recommendations.handle(sc, memory);
                } else if (choice.contains("hotel") || choice.contains("stay")) {
                    memory.put("recChoice", "3");
                    recommendations.handle(sc, memory);
                } else if (choice.contains("place") || choice.contains("tourist") || choice.contains("location")) {
                    memory.put("recChoice", "1");
                    recommendations.handle(sc, memory);
                } else {
                    memory.put("recChoice", "0");
                    recommendations.handle(sc, memory);
                }
            } else if (choice.contains("route") || choice.contains("plan") || choice.contains("itinerary") || choice.contains("travel")) {
                routePlanner.handle(sc, memory);
            } else {
                switch (choice) {
                    case "1" -> recommendations.handle(sc, memory);
                    case "2" -> routePlanner.handle(sc, memory);
                    case "3" -> translator.handle(sc, memory);
                    case "4" -> {
                        System.out.println("Chatbot: Goodbye!");
                        running = false;
                    }
                    default -> System.out.println("Chatbot: I'm sorry, please try again.");
                }
            }
        }

        sc.close();
        System.exit(0);
    }
}