package ranking;

import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
// Map to root path since gateway will forward /api/ranking to this service
@CrossOrigin(origins = "*")
public class RankingRestController {
    private final RankingController controller;

    public RankingRestController() {
        this.controller = new RankingController(new RankingDAO());
    }

    @GetMapping
    public List<Hotel> getRanking(
            @RequestParam(defaultValue = "overall") String sortType,
            @RequestParam(required = false) String filter
    ) {
        return controller.getRanking(sortType, filter);
    }
}
