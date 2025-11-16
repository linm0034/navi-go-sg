package ranking;

import java.util.Comparator;
import java.util.List;

public class RankingController {
    private final RankingDAO dao;

    public RankingController(RankingDAO dao) {
        this.dao = dao;
    }

    public List<Hotel> getRanking(String sortType, String filter) {
        List<Hotel> hotels = dao.fetchHotels();
        dao.calculateProximityScores(hotels);

        Comparator<Hotel> c;

        switch (sortType) {
            case "filter":
                c = Comparator.comparingDouble(h -> h.getScoreByFilter(filter));
                break;

            case "price_low":
                c = Comparator.comparingDouble(Hotel::getPrice);
                break;

            case "price_high":
                c = Comparator.comparingDouble(Hotel::getPrice).reversed();
                break;

            case "overall":
            default:
                c = Comparator.comparingDouble(Hotel::getOverallScore);
                break;
        }

        hotels.sort(c.reversed()); // 高分在前

        return hotels;
    }
}
