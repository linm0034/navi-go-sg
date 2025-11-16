package ranking;

public class Facility {
    private final String name;
    private final String type;   // hawker/mrt/attraction/bus/money/wifi
    private final double latitude;
    private final double longitude;

    public Facility(String name, String type, double latitude, double longitude) {
        this.name = name;
        this.type = type;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    public String getName() { return name; }
    public String getType() { return type; }
    public double getLatitude() { return latitude; }
    public double getLongitude() { return longitude; }
}
