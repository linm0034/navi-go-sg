package com.example.mybackend.controller;

import java.io.File;
import java.io.IOException;
import java.util.List;

import org.springframework.core.io.ClassPathResource;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.mybackend.model.Rewards;
import com.example.mybackend.model.RewardsDB;
import com.example.mybackend.model.User;
import com.example.mybackend.service.RewardsManager;

import jakarta.servlet.http.HttpSession;

// Allow requests from any origin
@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/rewards")
public class RewardsController {
    
    private RewardsDB rewardsDB;
    private RewardsManager rewardsManager;

    public RewardsController() throws IOException {
        // Read the rewards CSV from the file system rather than the classpath.
        File rewardsCsv = new File("data/rewards.csv");
        this.rewardsDB = new RewardsDB(rewardsCsv.getAbsolutePath());
        this.rewardsManager = new RewardsManager(rewardsDB);
    }

    @GetMapping("/show")
    public List<Rewards> showRewards() {
        return rewardsDB.getRewardList();
    }

    @PostMapping("/redeem")
    public String redeem(@RequestParam int rewardId, HttpSession session) {
        User user = (User)session.getAttribute("user");
        if (user == null) {
            return "You must be logged in to redeem rewards!";
        }
        
        if (this.rewardsManager.redeemReward(user, rewardsDB.getReward(rewardId))) {
            return "Reward successfully redeemed";
        } else { return "Unable to redeem reward"; }

    }



}
