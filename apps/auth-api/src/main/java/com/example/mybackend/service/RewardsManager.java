package com.example.mybackend.service;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;

import com.example.mybackend.model.Rewards;
import com.example.mybackend.model.RewardsDB;
import com.example.mybackend.model.User;

public class RewardsManager {
    private RewardsDB rewardDB;

    public RewardsManager(RewardsDB rewardsDB) {
        this.rewardDB = rewardsDB;
    }

    public boolean redeemReward(User user, Rewards reward) {
        if (!checkPoints(user, reward)) { return false; }
        File file1 = new File("src/main/resources/data/userRewards.csv");
        File file2 = new File("src/main/resources/data/users.csv");
        user.addRewards(reward);
        int points = reward.getNumOfPoints();
        points = 0 - points;
        user.addRewardPoints(points);
        System.out.println("Reward succesfully redeemed! ");
        return true;
    }

    public boolean checkPoints(User user, Rewards reward) {
        if (user.getRewardPoints() < reward.getNumOfPoints()) {
            System.out.println("Insufficient points! ");
            return false;
        }
        return true;
    }

    public void addRewards(String desc, int points) {
        rewardDB.addReward(desc, points);
        writeDataLine("myapp/rewards/rewards.csv", desc, points);
    }

    public static void writeDataLine(String filename, String desc, int num) {
        try {
            FileWriter outputfile = new FileWriter(filename, true);
            String line = String.join(",", desc, Integer.toString(num));
            outputfile.write(line + "\n");
            outputfile.close();
        } 
        catch (IOException e) {
            e.printStackTrace();
        }
    }


}
