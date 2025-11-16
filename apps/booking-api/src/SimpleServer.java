import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;
import java.io.*;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.*;

public class SimpleServer {
    private static List<Map<String, Object>> bookings = new ArrayList<>();
    private static long nextId = 1;

    // Singapore attractions data
    private static final List<Map<String, Object>> ATTRACTIONS = Arrays.asList(
        Map.of("id", "MARINA_BAY", "name", "Marina Bay Sands", "type", "attraction", "location", "Marina Bay"),
        Map.of("id", "GARDENS", "name", "Gardens by the Bay", "type", "park", "location", "Marina Bay"),
        Map.of("id", "SENTOSA", "name", "Sentosa Island", "type", "beach", "location", "Sentosa"),
        Map.of("id", "JURONG_BIRD", "name", "Jurong Bird Park", "type", "zoo", "location", "Jurong"),
        Map.of("id", "ZOO", "name", "Singapore Zoo", "type", "zoo", "location", "Mandai"),
        Map.of("id", "ORCHARD_ROAD", "name", "Orchard Road Shopping", "type", "shopping", "location", "Orchard")
    );

    public static void main(String[] args) throws IOException {
        addSampleData();
        
        // Use the BOOKING_PORT environment variable if defined, otherwise default to 4015
        int port;
        try {
            port = Integer.parseInt(System.getenv().getOrDefault("BOOKING_PORT", "4015"));
        } catch (NumberFormatException e) {
            port = 4015;
        }
        HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);
        server.createContext("/api/bookings", new BookingsHandler());
        server.createContext("/api/attractions", new AttractionsHandler());
        server.setExecutor(null);
        server.start();
        System.out.println("Singapore Attractions Booking Server started on port " + port);
        System.out.println("API available at: http://localhost:" + port + "/api/bookings");
    }

    static class BookingsHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            setupCORS(exchange);
            if ("OPTIONS".equals(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            try {
                switch (exchange.getRequestMethod()) {
                    case "GET":
                        handleGetBookings(exchange);
                        break;
                    case "POST":
                        handlePostBooking(exchange);
                        break;
                    case "DELETE":
                        handleDeleteBooking(exchange);
                        break;
                    default:
                        exchange.sendResponseHeaders(405, -1);
                }
            } catch (Exception e) {
                e.printStackTrace();
                exchange.sendResponseHeaders(500, -1);
            }
        }

        private void handleGetBookings(HttpExchange exchange) throws IOException {
            String response = toJson(bookings);
            sendResponse(exchange, 200, response);
        }

        private void handlePostBooking(HttpExchange exchange) throws IOException {
            InputStream is = exchange.getRequestBody();
            String body = new String(is.readAllBytes(), StandardCharsets.UTF_8);
            
            Map<String, Object> booking = parseJson(body);
            booking.put("id", nextId++);
            booking.put("status", "CONFIRMED");
            booking.put("bookingDate", new Date().toString());
            
            // Ensure time field exists
            if (!booking.containsKey("time")) {
                booking.put("time", "10:00");
            }
            
            bookings.add(booking);
            
            String response = toJson(booking);
            sendResponse(exchange, 201, response);
        }

        private void handleDeleteBooking(HttpExchange exchange) throws IOException {
            String path = exchange.getRequestURI().getPath();
            String[] parts = path.split("/");
            long id = Long.parseLong(parts[parts.length - 1]);
            
            boolean removed = bookings.removeIf(booking -> 
                ((Number) booking.get("id")).longValue() == id);
            
            String response = "{\"success\":" + removed + "}";
            sendResponse(exchange, 200, response);
        }
    }

    static class AttractionsHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            setupCORS(exchange);
            if ("OPTIONS".equals(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            if ("GET".equals(exchange.getRequestMethod())) {
                String response = toJson(ATTRACTIONS);
                sendResponse(exchange, 200, response);
            } else {
                exchange.sendResponseHeaders(405, -1);
            }
        }
    }

    // Helper methods
    private static void setupCORS(HttpExchange exchange) {
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
        exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type");
    }

    private static void sendResponse(HttpExchange exchange, int statusCode, String response) throws IOException {
        exchange.getResponseHeaders().set("Content-Type", "application/json");
        exchange.sendResponseHeaders(statusCode, response.getBytes().length);
        OutputStream os = exchange.getResponseBody();
        os.write(response.getBytes());
        os.close();
    }

    private static Map<String, Object> parseJson(String json) {
        Map<String, Object> result = new HashMap<>();
        // Remove braces and split into key-value pairs
        json = json.trim();
        if (json.startsWith("{")) json = json.substring(1);
        if (json.endsWith("}")) json = json.substring(0, json.length() - 1);
        
        String[] pairs = json.split(",");
        
        for (String pair : pairs) {
            String[] keyValue = pair.split(":", 2); // Split into max 2 parts
            if (keyValue.length == 2) {
                String key = keyValue[0].trim().replace("\"", "");
                String value = keyValue[1].trim().replace("\"", "");
                
                // Remove any trailing characters
                if (value.endsWith("}")) {
                    value = value.substring(0, value.length() - 1);
                }
                
                if (value.matches("\\d+")) {
                    result.put(key, Integer.parseInt(value));
                } else {
                    result.put(key, value);
                }
            }
        }
        return result;
    }

    private static String toJson(Object obj) {
        if (obj instanceof List) {
            StringBuilder sb = new StringBuilder("[");
            List<?> list = (List<?>) obj;
            for (int i = 0; i < list.size(); i++) {
                if (i > 0) sb.append(",");
                sb.append(toJson(list.get(i)));
            }
            sb.append("]");
            return sb.toString();
        } else if (obj instanceof Map) {
            StringBuilder sb = new StringBuilder("{");
            Map<?, ?> map = (Map<?, ?>) obj;
            boolean first = true;
            for (Map.Entry<?, ?> entry : map.entrySet()) {
                if (!first) sb.append(",");
                sb.append("\"").append(entry.getKey()).append("\":");
                Object value = entry.getValue();
                if (value instanceof String) {
                    sb.append("\"").append(value).append("\"");
                } else {
                    sb.append(value);
                }
                first = false;
            }
            sb.append("}");
            return sb.toString();
        }
        return "null";
    }

    private static void addSampleData() {
        Map<String, Object> booking1 = new HashMap<>();
        booking1.put("id", nextId++);
        booking1.put("customerName", "John Doe");
        booking1.put("email", "john@email.com");
        booking1.put("attraction", "Marina Bay Sands");
        booking1.put("date", "2024-01-15");
        booking1.put("time", "14:00");
        booking1.put("visitors", 2);
        booking1.put("status", "CONFIRMED");
        booking1.put("bookingDate", "2024-01-10");
        bookings.add(booking1);

        Map<String, Object> booking2 = new HashMap<>();
        booking2.put("id", nextId++);
        booking2.put("customerName", "Jane Smith");
        booking2.put("email", "jane@email.com");
        booking2.put("attraction", "Gardens by the Bay");
        booking2.put("date", "2024-01-20");
        booking2.put("time", "10:00");
        booking2.put("visitors", 4);
        booking2.put("status", "CONFIRMED");
        booking2.put("bookingDate", "2024-01-12");
        bookings.add(booking2);
    }
}