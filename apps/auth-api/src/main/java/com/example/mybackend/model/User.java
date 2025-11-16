package com.example.mybackend.model;

import java.util.ArrayList;

public class User {
    private int userId;
    private int rewardPoints;
    private String username;
    private String password;
    private String profileInfo;
    private String preferences;
    private ArrayList<Rewards> rewards;
    static int numberOfUsers;

    public User() {}

    public User(String user_name, String password) {
        this.username = user_name;
        this.password = password;
        this.userId = this.numberOfUsers + 1;
        this.numberOfUsers += 1;
        this.rewardPoints = 0;
        rewards = new ArrayList<>();
    }
    
    public User(String user_name, String password, int num) {
        this.username = user_name;
        this.password = password;
        this.userId = this.numberOfUsers + 1;
        this.numberOfUsers += 1;
        this.rewardPoints = num;
        rewards = new ArrayList<>();
    }

    public void changeUsername(String newUsername) {
        this.username = newUsername;
    }

    public void addRewardPoints(int val) {
        this.rewardPoints += val;
    }

    public void addRewards(Rewards reward) {
        rewards.add(reward);
        this.rewardPoints -= reward.getNumOfPoints();
    }

    public void printRewards() {
        if (rewards.isEmpty()) {
            return;
        }
        for (int i = 0; i < rewards.size(); i++) {
            System.out.println(rewards.get(i));
        }
    }

    public String getUsername() { return this.username; }
    public String getPassword() { return this.password; }
    public int getRewardPoints() { return this.rewardPoints; }
    public int getUserID() { return this.userId; }

    @Override
    public String toString() {
        return this.username + ", " + this.password;
    }


}
