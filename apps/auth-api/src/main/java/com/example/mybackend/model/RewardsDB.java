package com.example.mybackend.model;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;

public class RewardsDB {
    private ArrayList<Rewards> rewardDB;

    public RewardsDB(String filepath) {
        rewardDB = new ArrayList<>();
        try (Scanner scanner = new Scanner(new File(filepath))) {
            while (scanner.hasNextLine()) {
                rewardDB.add(getRow(scanner.nextLine()));
            }
        } catch (FileNotFoundException e) {
            System.out.print(e);
        }
    }

    public void printRewards() {
        int y = 1;
        for (int i = 0; i<rewardDB.size(); i++) {
            if (rewardDB.get(i).getRedeemable()) {
                String x = Integer.toString(rewardDB.get(i).getRewardID());
                System.out.println(x + ". " + rewardDB.get(i));
                y++;
            }
        }
    }

    public Rewards getReward(int j) {
        for (int i = 0; i < rewardDB.size(); i++) {
            if (rewardDB.get(i).getRewardID() == j) {
                return rewardDB.get(i);
            }
        }
        return null;
    }

    public void addReward(String desc, int num) {
        Rewards tempRewards = new Rewards(desc, num);
        rewardDB.add(tempRewards);
    }
    
    public void redeemReward(String filename, User user, Rewards reward) {
        try {
            FileWriter outputfile = new FileWriter(filename, true);
            String line = String.join(", ", Integer.toString(user.getUserID()), Integer.toString(reward.getRewardID()));
            outputfile.write(line + "\n");
            outputfile.close();
        } 
        catch (IOException e) {
            e.printStackTrace();
        }
    }

    
    private Rewards getRow(String line) {
        String[] values = line.split(",", 2);
        int val = Integer.parseInt(values[1].trim());
        Rewards tempRewards = new Rewards(values[0].trim(), val);
        return tempRewards;
    }

    public int size() {
        return rewardDB.size();
    }

    public Rewards get(int index) {
        return rewardDB.get(index);
    }

    public List<Rewards> getRewardList() { return this.rewardDB; }

}
