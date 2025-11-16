package com.example.mybackend.model;

public class Rewards {
    private String description;
    private int numOfPoints;
    private boolean redeemable;
    private int rewardsID;
    private static int numOfRewards = 0;

    public Rewards(String desc, int num) {
        this.description = desc;
        this.numOfPoints = num;
        this.redeemable = true;
        this.rewardsID = numOfRewards + 1;
        this.numOfRewards+= 1;
    }

    public String getDescription() {
        return description;
    }

    public int getNumOfPoints() {
        return numOfPoints;
    }

    public boolean getRedeemable() {
        return redeemable;
    }

    public int getRewardID() { return this.rewardsID; }

    public void changeNumOfPoints(int point) {
        this.numOfPoints = point;
    }

    public void changeRedeemable(boolean t) {
        this.redeemable = t;
    }

    @Override
    public String toString() {
        return this.description + ", " + this.numOfPoints;
    }

    public Rewards copyRewards() {
        Rewards tempRewards = new Rewards(description, numOfPoints);
        return tempRewards;
    }
}
