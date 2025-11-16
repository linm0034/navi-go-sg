package ranking;

import java.util.List;
import java.util.Scanner;

public class RankingUI {

    private final RankingController controller = new RankingController(new RankingDAO());

    public void run() {
        Scanner sc = new Scanner(System.in);
        while (true) {
            System.out.println("\n === Singapore Hotel Ranking ===");
            System.out.println("1. Overall Score");
            System.out.println("2. By Filter (choose category)");
            System.out.println("3. Price (Low to High)");
            System.out.println("4. Price (High to Low)");
            System.out.println("0. Exit");
            System.out.print("Enter your choice: ");

            String choice = sc.nextLine().trim();
            switch (choice) {
                case "1" -> showRanking("overall", null);
                case "2" -> {
                    String filter = chooseFilter(sc);
                    showRanking("filter", filter);
                }
                case "3" -> showRanking("price_low", null);
                case "4" -> showRanking("price_high", null);
                case "0" -> {
                    System.out.println("Exiting system...");
                    return;
                }
                default -> System.out.println("Invalid choice, please try again.");
            }
        }
    }

    /** 让用户选择过滤器 */
    private String chooseFilter(Scanner sc) {
        System.out.println("\n Choose filter category:");
        System.out.println("1. Hawker Centres");
        System.out.println("2. MRT Stations");
        System.out.println("3. Bus Stops");
        System.out.println("4. Money Changers");
        System.out.println("5. Tourist Attractions");
        System.out.println("6. Wireless Hotspots");
        System.out.print("Enter your choice (1–6): ");

        return switch (sc.nextLine().trim()) {
            case "1" -> "hawker";
            case "2" -> "mrt";
            case "3" -> "bus";
            case "4" -> "money";
            case "5" -> "attraction";
            case "6" -> "wifi";
            default -> {
                System.out.println("Invalid input. Defaulting to MRT.");
                yield "mrt";
            }
        };
    }

    /** 输出酒店排名 */
    private void showRanking(String sortType, String filter) {
        System.out.println("\n=================================================");
        System.out.printf("Generating ranking: %s%n",
                sortType.equals("filter") ? filter.toUpperCase() : sortType.toUpperCase());

        List<Hotel> hotels = controller.getRanking(sortType, filter);
        if (hotels == null || hotels.isEmpty()) {
            System.out.println("No hotel data available.");
            return;
        }

        System.out.println("\nTop 10 Hotels:");
        int limit = Math.min(10, hotels.size());
        for (int i = 0; i < limit; i++) {
            Hotel h = hotels.get(i);
            if (sortType.equals("filter"))
                System.out.printf("%2d. %-40s | %s: %.2f%n",
                        i + 1, h.getName(), filter, h.getScoreByFilter(filter));
            else
                System.out.printf("%2d. %-40s | Overall: %.2f%n",
                        i + 1, h.getName(), h.getOverallScore());
        }

        System.out.println("=================================================\n");
    }
}
