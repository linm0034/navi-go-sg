package ranking;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.*;
import java.util.concurrent.ThreadLocalRandom;

public class RankingDAO {

    // === Resource file names (keep same as src/main/resources) ===
    private static final String F_HOTELS = "Hotels.geojson";
    private static final String F_HAWKER = "HawkerCentresGEOJSON.geojson";
    private static final String F_MRT    = "LTAMRTStationExitGEOJSON.geojson";
    private static final String F_ATTR   = "TouristAttractions.geojson";
    private static final String F_MONEY  = "LocationsofMoneyChangerGEOJSON.geojson";
    private static final String F_WIFI   = "WirelessHotSpotsGEOJSON.geojson";

    // Distance thresholds (km): beyond this returns score 0
    private static final Map<String, Double> MAX_KM = Map.of(
            "mrt", 1.5,
            "bus", 0.6,
            "hawker", 2.0,
            "attraction", 3.0,
            "money", 1.0,
            "wifi", 0.4
    );

    // Weights (sum ~= 1.0)
    private static final Map<String, Double> WEIGHTS = Map.of(
            "mrt", 0.25,
            "bus", 0.20,
            "hawker", 0.15,
            "attraction", 0.15,
            "money", 0.15,
            "wifi", 0.10
    );

    // === Price generation policy when dataset has no price ===
    // You can tweak this range as needed (inclusive low, exclusive high)
    private static final double PRICE_MIN = 90.0;   // e.g., SGD 90
    private static final double PRICE_MAX = 401.0;  // e.g., < 401 → up to SGD 400

    // Facility cache
    private final Map<String, List<Facility>> facilityMap = new HashMap<>();
    private boolean facilitiesLoaded = false;

    /** Load hotel list from local resource (GeoJSON). */
    public List<Hotel> fetchHotels() {
        String json = DataFetcher.readResource(F_HOTELS);
        if (json == null) return List.of();
        return parseHotelsFromGeoJSON(json);
    }

    /** Load all facilities (incl. LTA BusStops via API). */
    public void ensureFacilitiesLoaded() {
        if (facilitiesLoaded) return;

        facilityMap.put("hawker",     parseFacilitiesGeoJSON(DataFetcher.readResource(F_HAWKER), "hawker"));
        facilityMap.put("mrt",        parseFacilitiesGeoJSON(DataFetcher.readResource(F_MRT),    "mrt"));
        facilityMap.put("attraction", parseFacilitiesGeoJSON(DataFetcher.readResource(F_ATTR),   "attraction"));
        facilityMap.put("money",      parseFacilitiesGeoJSON(DataFetcher.readResource(F_MONEY),  "money"));
        facilityMap.put("wifi",       parseFacilitiesGeoJSON(DataFetcher.readResource(F_WIFI),   "wifi"));

        // LTA BusStops (may require key; if 401/404 it just returns empty)
        String busJson = DataFetcher.fetchLtaBusStops();
        facilityMap.put("bus", parseLtaBusStops(busJson, "bus"));

        facilitiesLoaded = true;
    }

    /** Calculate each hotel's per-filter scores and overall. */
    public void calculateProximityScores(List<Hotel> hotels) {
        ensureFacilitiesLoaded();
        for (Hotel h : hotels) {
            double weighted = 0.0;
            for (String cat : WEIGHTS.keySet()) {
                double sc = scoreByNearest(h, facilityMap.getOrDefault(cat, List.of()),
                        MAX_KM.getOrDefault(cat, 1.0));
                h.setFilterScore(cat, sc);
                weighted += sc * WEIGHTS.get(cat);
            }
            // If you have a base score, adjust here; currently overall = weighted facilities score.
            h.setOverallScore(weighted);
        }
    }

    // ===================== Parsing =====================

    /** Parse hotels: read name/coords; price from data if present; else random price. */
    private List<Hotel> parseHotelsFromGeoJSON(String geojson) {
        List<Hotel> hotels = new ArrayList<>();
        try {
            JSONObject root = new JSONObject(geojson);
            JSONArray features = root.getJSONArray("features");
            for (int i = 0; i < features.length(); i++) {
                JSONObject f = features.getJSONObject(i);
                JSONObject geom = f.getJSONObject("geometry");
                if (!"Point".equalsIgnoreCase(geom.optString("type"))) continue;

                JSONArray c = geom.getJSONArray("coordinates");
                double lon = c.getDouble(0);
                double lat = c.getDouble(1);

                JSONObject prop = f.optJSONObject("properties");
                String name = firstNonEmpty(prop, "NAME", "Name", "name", "Description",
                        "description", "Hotel_Name", "HOTEL_NAME", "TITLE", "title");
                if (name == null || name.isBlank()) name = "Hotel_" + (i + 1);

                // 1) Try to read price if dataset provides something like price/rate
                Double priceFromData = tryGetDouble(prop,
                        "price", "PRICE", "room_price", "room_rate", "RATE", "rate", "avg_rate");

                // 2) Fallback to random price if missing
                double price = (priceFromData != null)
                        ? priceFromData
                        : ThreadLocalRandom.current().nextInt((int) PRICE_MIN, (int) PRICE_MAX);


                hotels.add(new Hotel(name, 0.0, price, lat, lon));
            }
        } catch (Exception e) {
            System.err.println("❌ 解析 Hotels 失败: " + e.getMessage());
        }
        return hotels;
    }

    private List<Facility> parseFacilitiesGeoJSON(String geojson, String type) {
        if (geojson == null) return List.of();
        List<Facility> list = new ArrayList<>();
        try {
            JSONObject root = new JSONObject(geojson);
            JSONArray features = root.getJSONArray("features");
            for (int i = 0; i < features.length(); i++) {
                JSONObject f = features.getJSONObject(i);
                JSONObject geom = f.getJSONObject("geometry");
                if (!"Point".equalsIgnoreCase(geom.optString("type"))) continue;

                JSONArray c = geom.getJSONArray("coordinates");
                double lon = c.getDouble(0);
                double lat = c.getDouble(1);

                JSONObject prop = f.optJSONObject("properties");
                String name = firstNonEmpty(prop, "NAME", "Name", "name", "Description",
                        "description", "ADDRESS", "Address", "TITLE", "title");
                if (name == null || name.isBlank()) name = type + "_" + (i + 1);

                list.add(new Facility(name, type, lat, lon));
            }
        } catch (Exception e) {
            System.err.println("❌ 解析 " + type + " 失败: " + e.getMessage());
        }
        return list;
    }

    private List<Facility> parseLtaBusStops(String json, String type) {
        if (json == null) return List.of();
        List<Facility> list = new ArrayList<>();
        try {
            JSONObject root = new JSONObject(json);
            JSONArray value = root.getJSONArray("value");
            for (int i = 0; i < value.length(); i++) {
                JSONObject o = value.getJSONObject(i);
                double lat = o.optDouble("Latitude", Double.NaN);
                double lon = o.optDouble("Longitude", Double.NaN);
                if (Double.isNaN(lat) || Double.isNaN(lon)) continue;
                String name = o.optString("Description", "BusStop_" + (i + 1));
                list.add(new Facility(name, type, lat, lon));
            }
        } catch (Exception e) {
            System.err.println("❌ 解析 LTA BusStops 失败: " + e.getMessage());
        }
        return list;
    }

    // ===================== Scoring =====================

    private double scoreByNearest(Hotel h, List<Facility> facilities, double maxKm) {
        if (facilities == null || facilities.isEmpty()) return 0.0;
        double minKm = Double.POSITIVE_INFINITY;
        for (Facility f : facilities) {
            double d = haversineKm(h.getLatitude(), h.getLongitude(), f.getLatitude(), f.getLongitude());
            if (d < minKm) minKm = d;
        }
        if (Double.isInfinite(minKm) || minKm > maxKm) return 0.0;
        // Linear decay: 0km -> 10, maxKm -> 0
        double s = (maxKm - minKm) / maxKm * 10.0;
        return Math.max(0.0, Math.min(10.0, s));
    }

    private static double haversineKm(double lat1, double lon1, double lat2, double lon2) {
        final double R = 6371.0;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    private static String firstNonEmpty(JSONObject obj, String... keys) {
        if (obj == null) return null;
        for (String k : keys) {
            if (obj.has(k)) {
                String v = String.valueOf(obj.opt(k));
                if (v != null && !v.equals("null") && !v.isBlank()) return v;
            }
        }
        return null;
    }

    private static Double tryGetDouble(JSONObject obj, String... keys) {
        if (obj == null) return null;
        for (String k : keys) {
            if (obj.has(k)) {
                try {
                    return Double.valueOf(String.valueOf(obj.get(k)));
                } catch (Exception ignored) {
                }
            }
        }
        return null;
    }
}
