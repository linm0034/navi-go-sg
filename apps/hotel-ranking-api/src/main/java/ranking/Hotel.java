package ranking;

import java.util.HashMap;
import java.util.Map;

public class Hotel {
    private final String name;
    private double overallScore;
    private double price;              // 如果没有价格数据，可后续再接
    private final double latitude;
    private final double longitude;
    private Map<String, Double> filterScores = new HashMap<>();

    public Hotel(String name, double overallScore, double price, double latitude, double longitude) {
        this.name = name;
        this.overallScore = overallScore;
        this.price = price;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    public String getName() { return name; }
    public double getOverallScore() { return overallScore; }
    public double getPrice() { return price; }
    public double getLatitude() { return latitude; }
    public double getLongitude() { return longitude; }
    public Map<String, Double> getFilterScores() { return filterScores; }

    public void setOverallScore(double overallScore) { this.overallScore = overallScore; }
    public void setPrice(double price) { this.price = price; }
    public void setFilterScore(String filter, double score) { filterScores.put(filter, score); }
    public double getScoreByFilter(String filter) { return filterScores.getOrDefault(filter, 0.0); }

    public String getInfo() {
        return String.format("%s | Overall: %.2f | Price: $%.0f", name, overallScore, price);
    }

    @Override public String toString() { return getInfo(); }
}
