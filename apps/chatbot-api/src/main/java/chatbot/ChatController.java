package chatbot;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
// Map to root path since gateway will forward /api/chat and /api/chatbot to this service
// FIX: Allowing multiple common local development ports for team collaboration. 
// For production, this should be restricted to the specific frontend domain(s).
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:8081", "http://localhost:5173"})
public class ChatController {

    private final Recommendations recommendations;
    private final RoutePlanner routePlanner;
    private final Translation translation;

    // Simple in-memory session store for interactive flows (non-persistent)
    private final ConcurrentMap<String, RouteSession> sessions = new ConcurrentHashMap<>();

    private static class RouteSession {
        // states: awaiting_start, collecting_places, ask_optimize
        String state;
        String startPoint;
        List<String> places = new ArrayList<>();
    }

    public ChatController(Recommendations rec, RoutePlanner planner, Translation translation) {
        this.recommendations = rec;
        this.routePlanner = planner;
        this.translation = translation;
    }

    @PostMapping
    public Map<String, String> chat(@RequestBody Map<String, String> body) {
        String rawMessage = body.getOrDefault("message", "").trim();
        String message = rawMessage.toLowerCase();
        String sessionId = body.get("sessionId");

    Map<String, String> res = new HashMap<>();
    String reply = "";

        try {
            final String MENU = "I'm your Singapore tourism chatbot. Please select one of the following to proceed\n1) Recommendations\n2) Route planner\n3) Translation\n4) Exit";
            final String UNKNOWN_MENU = "Sorry, this may be outside of my capabilities, please select\n1) Recommendations\n2) Route planner\n3) Translation\n4) Exit";

            // If empty message (initial open), create a session and send the menu
            if (message.isBlank()) {
                // create a lightweight session for this chat
                String newId = UUID.randomUUID().toString();
                sessions.put(newId, new RouteSession());
                res.put("sessionId", newId);
                reply = MENU;
                res.put("reply", reply);
                return res;
            }

            // If a sessionId was provided, try to resume interactive route flow
            RouteSession rs = null;
            if (sessionId != null && !sessionId.isBlank()) {
                rs = sessions.get(sessionId);
            }

            // If there's an active route session, handle its state machine first
            if (rs != null && rs.state != null) {
                switch (rs.state) {
                    case "awaiting_start":
                        if (message.equals("0")) {
                            sessions.remove(sessionId);
                            reply = "Route planning cancelled.";
                        } else {
                            rs.startPoint = rawMessage.trim();
                            rs.state = "collecting_places";
                            reply = "Start point set to: " + rs.startPoint + "\nPlease add a place of interest (enter 0 when finished).";
                        }
                        res.put("sessionId", sessionId);
                        res.put("reply", reply);
                        return res;

                    case "collecting_places":
                        if (message.equals("0")) {
                            if (rs.places.isEmpty()) {
                                // nothing collected, cancel
                                sessions.remove(sessionId);
                                reply = "No places were provided. Route planning cancelled.";
                                res.put("sessionId", sessionId);
                                res.put("reply", reply);
                                return res;
                            }
                            rs.state = "ask_optimize";
                            reply = "You've added " + rs.places.size() + " places. Would you like to optimize your route? (yes/no)";
                            res.put("sessionId", sessionId);
                            res.put("reply", reply);
                            return res;
                        } else {
                            rs.places.add(rawMessage.trim());
                            reply = "Added: " + rawMessage.trim() + " — add another place or enter 0 when finished.";
                            res.put("sessionId", sessionId);
                            res.put("reply", reply);
                            return res;
                        }

                    case "ask_optimize":
                        if (message.startsWith("y")) {
                            // perform optimization using RoutePlanner
                            try {
                                List<String> optimized = routePlanner.optimizeRoute(rs.startPoint, rs.places, new java.util.Scanner(new java.io.StringReader("")), new HashMap<>());
                                StringBuilder sb = new StringBuilder();
                                if (optimized == null || optimized.isEmpty()) {
                                    sb.append("Optimization returned no results. Your original list:\n");
                                    for (int i = 0; i < rs.places.size(); i++) sb.append(i + 1).append(") ").append(rs.places.get(i)).append("\n");
                                } else {
                                    sb.append("Optimized route from ").append(rs.startPoint).append(":\n");
                                    for (int i = 0; i < optimized.size(); i++) sb.append(i + 1).append(") ").append(optimized.get(i)).append("\n");
                                }
                                reply = sb.toString().trim();
                            } catch (Exception e) {
                                reply = "Route optimization failed: " + e.getMessage();
                            }
                            // clear session after finishing
                            sessions.remove(sessionId);
                            res.put("sessionId", sessionId);
                            res.put("reply", reply);
                            return res;
                        } else {
                            // user chose not to optimize — just show original list and clear
                            StringBuilder sb = new StringBuilder();
                            sb.append("Route planned (no optimization):\nStart: ").append(rs.startPoint).append("\n");
                            for (int i = 0; i < rs.places.size(); i++) sb.append(i + 1).append(") ").append(rs.places.get(i)).append("\n");
                            reply = sb.toString().trim();
                            sessions.remove(sessionId);
                            res.put("sessionId", sessionId);
                            res.put("reply", reply);
                            return res;
                        }
                }
            }

            // No active route state — continue with normal routing below
            // normalize numeric menu choices (accept '2', '2)', '2.' etc.)
            java.util.function.Predicate<String> isChoice = (c) -> {
                String t = message.trim();
                if (t.equals(c)) return true;
                if (t.equals(c + ")") || t.equals(c + ".")) return true;
                if (t.startsWith("option ") && t.contains(c)) return true;
                return false;
            };

            // allow numeric selection from the menu
            if (isChoice.test("1") || message.equals("recommendations") || message.contains("recommend") || message.contains("food") || message.contains("hotel") || message.contains("tourist") || message.contains("accommod") || message.contains("accomod")) {
                System.out.println(">>> TRACE: Executing RECOMMENDATIONS block for message: " + message);
                reply = recommendations.getRecommendationReply(message);
            } else if (isChoice.test("2") || message.equals("route planner")) {
                // Start an interactive route planning session
                String newId = (sessionId != null && !sessionId.isBlank()) ? sessionId : UUID.randomUUID().toString();
                RouteSession newRs = new RouteSession();
                newRs.state = "awaiting_start";
                sessions.put(newId, newRs);
                res.put("sessionId", newId);
                reply = "Route planner: Please enter your starting point (Enter 0 to stop). Please note that a maximum of 23 waypoints can be used";
                res.put("reply", reply);
                return res;
            } else if (message.contains("plan route") || (message.contains("help") && message.contains("route"))) {
                // If user writes natural language asking for help to plan a route, start interactive session
                String newId = (sessionId != null && !sessionId.isBlank()) ? sessionId : UUID.randomUUID().toString();
                RouteSession newRs = new RouteSession();
                newRs.state = "awaiting_start";
                sessions.put(newId, newRs);
                res.put("sessionId", newId);
                reply = "Route planner: Please enter your starting point (Enter 0 to stop). Please note that a maximum of 23 waypoints can be used";
                res.put("reply", reply);
                return res;
            } else if (message.contains("route") || message.contains("plan") || message.contains("itinerary")) {
                // If user provided a detailed single-line route (e.g. 'route from A to B, C'), use the free-form parser
                try {
                    reply = routePlanner.getRouteReply(message);
                } catch (Exception e) {
                    System.err.println("Error in route planner: " + e.getMessage());
                    reply = "Sorry, an error occurred while planning the route. Please try a simpler request like: 'route from Marina Bay Sands to Sentosa, Gardens by the Bay'.";
                }
            } else if (message.equals("3") || message.equals("translation") || message.contains("translate") || message.contains("translation")) {
                System.out.println(">>> TRACE: Executing TRANSLATION block for message: " + message);
                reply = translation.getTranslationReply(message);
            } else if (isChoice.test("4") || message.contains("goodbye") || message.contains("bye") || message.contains("ok thanks goodbye") || message.contains("thanks goodbye")) {
                // Exit/Goodbye option — clear any session and say goodbye
                if (sessionId != null && !sessionId.isBlank()) {
                    sessions.remove(sessionId);
                }
                res.put("sessionId", "");
                reply = "Goodbye!";
            } else if (message.contains("hello") || message.contains("hi")) {
                // If user says hello after initial menu, re-send the menu to guide them
                reply = MENU;
            } else {
                // For anything we don't understand, send the standardized sorry+menu message
                reply = UNKNOWN_MENU;
            }
            
        } catch (Exception e) {
            // Log the full exception but return a user-friendly error
            System.err.println("Error processing chat message: " + e.getMessage());
            reply = "Sorry, an internal error occurred while processing your request. Please check the server logs.";
        }


        res.put("reply", reply);
        return res;
    }
}
