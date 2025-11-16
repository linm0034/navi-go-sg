package chatbot;

import java.io.StringReader;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Scanner;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class RoutePlanner {

    private final GoogleGeocodingClient geoc;
    private final GoogleDirectionsClient gd;

    // ✅ Spring will automatically inject these services
    @Autowired
    public RoutePlanner(GoogleGeocodingClient geoc, GoogleDirectionsClient gd) {
        this.geoc = geoc;
        this.gd = gd;
    }

    /**
     * Console entry point — behaves exactly like before.
     */
    public void handle(Scanner scanner, Map<String, String> memory) {
        System.out.println("Chatbot: Let's plan your route!");
        System.out.print("Chatbot: Please enter your starting point: ");
        String startPoint = scanner.nextLine().trim();
        memory.put("startPoint", startPoint);

        ArrayList<String> placesOfInterest = new ArrayList<>();
        System.out.println("Chatbot: Please add places of interest one by one.");
        System.out.println("Chatbot: Type the place name, or enter '2' to stop planning.");

        while (true) {
            System.out.print("Chatbot: Add place: ");
            String place = scanner.nextLine().trim();
            if (place.equals("2") || place.equalsIgnoreCase("stop")) break;

            if (!place.isEmpty()) {
                placesOfInterest.add(place);
                System.out.println("Added: " + place);
            } else {
                System.out.println("Chatbot: Please enter a valid place name.");
            }
        }

        memory.put("placesCount", String.valueOf(placesOfInterest.size()));

        System.out.println("\nChatbot: Here's your current route plan");
        System.out.println("Chatbot: Start point: " + startPoint);
        for (int i = 0; i < placesOfInterest.size(); i++) {
            System.out.println("Chatbot: " + (i + 1) + ") " + placesOfInterest.get(i));
        }

        System.out.println("Chatbot: Would you like to optimize your route? (yes/no)");
        String optimizeChoice = scanner.nextLine().trim().toLowerCase();
        if (optimizeChoice.equals("yes") || optimizeChoice.equals("y")) {
            optimizeRoute(startPoint, placesOfInterest, scanner, memory);
        } else {
            System.out.println("Chatbot: Route planning completed without optimization.");
        }
    }

    /**
     * Core logic reused by both console and REST API
     */
    public List<String> optimizeRoute(String startPoint, List<String> places, Scanner scanner, Map<String, String> memory) {
        if (places == null || places.isEmpty()) {
            System.out.println("Chatbot: No places to optimize.");
            return List.of();
        }

        try {
            System.out.println("Chatbot: Optimizing your route as a round-trip (return to start)...");
            String startCoord = geoc.geocode(startPoint);
            if (startCoord == null) {
                System.out.println("Chatbot: Could not resolve starting point.");
                return List.of();
            }

            List<String> resolvedCoords = new ArrayList<>();
            for (String p : places) {
                String c = geoc.geocode(p);
                if (c != null && !c.isBlank()) resolvedCoords.add(c);
                else System.out.println("Chatbot: Skipped unresolved place: " + p);
            }

            if (resolvedCoords.isEmpty()) {
                System.out.println("Chatbot: No valid waypoints to optimize.");
                return List.of();
            }

            List<Integer> order = gd.getOptimizedWaypointOrder(startCoord, startCoord, resolvedCoords);
            List<String> optimized = new ArrayList<>();
            for (Integer idx : order) {
                if (idx >= 0 && idx < places.size()) optimized.add(places.get(idx));
            }

            System.out.println("\nChatbot: Optimized route:");
            System.out.println("Start point: " + startPoint + " (" + startCoord + ")");
            for (int i = 0; i < optimized.size(); i++) {
                System.out.println((i + 1) + ") " + optimized.get(i));
            }

            memory.put("placesOptimizedCount", String.valueOf(optimized.size()));
            return optimized;

        } catch (Exception e) {
            System.out.println("Chatbot: Optimization failed: " + e.getMessage());
            return List.of();
        }
    }

    /**
     * REST-friendly method: parse a free-form query and attempt to optimize a route.
     * Expected examples:
     *  - "route from Marina Bay Sands to Sentosa, Gardens by the Bay"
     *  - "plan route start: Marina Bay Sands; places: Sentosa, Gardens by the Bay"
     *  - "route: Sentosa, Gardens by the Bay (please include start point)"
     */
    public String getRouteReply(String query) {
        if (query == null || query.isBlank()) {
            return "Please provide a route request. Example: 'route from Marina Bay Sands to Sentosa, Gardens by the Bay'";
        }

        try {
            String raw = query.trim();
            String start = null;
            List<String> places = new ArrayList<>();

            // Pattern: from <start> to <places>
            Pattern p = Pattern.compile("(?i)from\\s+([^;,:]+?)\\s+(?:to|with|and|via)\\s+(.+)");
            Matcher m = p.matcher(raw);
            if (m.find()) {
                start = m.group(1).trim();
                places = splitPlaces(m.group(2));
            }

            // Pattern: start: <start>; places: <a,b,c>
            if (places.isEmpty()) {
                p = Pattern.compile("(?i)start\\s*(?:[:=])?\\s*([^;]+?)\\s*(?:;|$)");
                m = p.matcher(raw);
                if (m.find()) {
                    start = m.group(1).trim();
                }
                p = Pattern.compile("(?i)places\\s*(?:[:=])?\\s*(.+)");
                m = p.matcher(raw);
                if (m.find()) {
                    places = splitPlaces(m.group(1));
                }
            }

            // Pattern: route: a, b, c  (no explicit start)
            if (places.isEmpty()) {
                p = Pattern.compile("(?i)route\\s*[:\\-\\s]\\s*(.+)");
                m = p.matcher(raw);
                if (m.find()) {
                    places = splitPlaces(m.group(1));
                }
            }

            // If still missing places, try to extract comma-separated chunk after keywords
            if (places.isEmpty()) {
                // look for commas anywhere — assume they are places
                if (raw.contains(",")) {
                    places = splitPlaces(raw);
                }
            }

            if (places.isEmpty()) {
                return "I couldn't detect any places to include in the route. Please provide places as a comma-separated list. Example: 'route from Marina Bay Sands to Sentosa, Gardens by the Bay'";
            }

            if (start == null || start.isBlank()) {
                return "Please specify a starting point. Example: 'route from Marina Bay Sands to Sentosa, Gardens by the Bay'";
            }

            // Call existing optimize logic with a dummy scanner and memory map
            List<String> optimized = optimizeRoute(start, places, new Scanner(new StringReader("")), new java.util.HashMap<>());

            if (optimized == null || optimized.isEmpty()) {
                return "Route optimization did not produce any results. Make sure the place names are valid and try again.";
            }

            StringBuilder sb = new StringBuilder();
            sb.append("Optimized route from ").append(start).append(":\n");
            for (int i = 0; i < optimized.size(); i++) {
                sb.append(i + 1).append(") ").append(optimized.get(i)).append("\n");
            }
            return sb.toString().trim();

        } catch (Exception e) {
            return "Route planning failed: " + e.getMessage();
        }
    }

    private List<String> splitPlaces(String raw) {
        if (raw == null) return List.of();
        String cleaned = raw.replaceAll("\\(.*?\\)", "").trim(); // remove parenthetical hints
        String[] parts = cleaned.split("\\s*,\\s*|\\s+and\\s+|\\s*;\\s*");
        List<String> out = new ArrayList<>();
        for (String p : parts) {
            String t = p.trim();
            if (!t.isEmpty()) out.add(t);
        }
        return out;
    }
}