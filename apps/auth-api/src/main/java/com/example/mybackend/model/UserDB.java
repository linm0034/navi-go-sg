package com.example.mybackend.model;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Scanner;


public class UserDB {
    private ArrayList<User> userDB;

    public UserDB(String userfilepath, String rewardfilepath, RewardsDB rewardsDB) {
        this.userDB = new ArrayList<>();
        try (Scanner scanner = new Scanner(new File(userfilepath))) {
            while (scanner.hasNextLine()) {
                userDB.add(getRow(scanner.nextLine()));
            }
        } catch (FileNotFoundException e) {
            System.out.print(e);
        }

        try (Scanner scanner = new Scanner(new File(rewardfilepath))) {
            int[] temp = new int[2];
            User tempUser;
            Rewards tempRewards;
            while (scanner.hasNextLine()) {
                temp = getRewardRow(scanner.nextLine());
                tempUser = findUserByID(temp[1]);
                tempRewards = rewardsDB.getReward(temp[0]);
                tempUser.addRewards(tempRewards);
            }
        } catch (FileNotFoundException e) {
            System.out.print(e);
        }
    }

    private User getRow(String line) {
        String[] values = line.split(",", 3);
        int x = Integer.parseInt(values[2].trim());
        User tempUser = new User(values[0].trim(), values[1].trim(), x);
        return tempUser;
    }

    private static int[] getRewardRow(String line) {
        int[] numbers = new int[2];
        String[] values = line.split(",", 2);
        numbers[1] = Integer.parseInt(values[0].trim());
        numbers[0] = Integer.parseInt(values[1].trim());
        return numbers;
    }

    public boolean userExists(String username) {
        for (int i = 0; i<userDB.size(); i++) {
            if (username.equals(userDB.get(i).getUsername())) {
                return true;
            }
        }
        return false;
    }

    public User findUser(String username) {
        for (int i = 0; i<userDB.size(); i++) {
            if (username.equals(userDB.get(i).getUsername())) {
                return userDB.get(i);
            }
        }
        return null;
    }

    public User findUserByID(int i) {
        for (User user: this.userDB) {
            if (user.getUserID() == i) {
                return user;
            }
        }
        return null;
    }

    public boolean saveUser(User user) {
        this.userDB.add(user);
        return true;
    }

    public void printDB() {
        for (int i = 0; i<userDB.size(); i++) {
            System.out.print(userDB.get(i));
            System.out.println("");
        }
    }

    public static void writeDataLine(String filename, User user) {
        try {
            FileWriter outputfile = new FileWriter(filename, true);
            String line = String.join(", ", user.getUsername(), user.getPassword(), Integer.toString(user.getRewardPoints()));
            outputfile.write(line + "\n");
            outputfile.close();
        } 
        catch (IOException e) {
            e.printStackTrace();
        }
    }
}
