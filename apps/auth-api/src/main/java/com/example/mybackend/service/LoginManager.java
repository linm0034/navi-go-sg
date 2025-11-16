package com.example.mybackend.service;

import java.io.File;

import com.example.mybackend.model.User;
import com.example.mybackend.model.UserDB;

public class LoginManager {
    private UserDB userDB;

    public LoginManager(UserDB userDB) {
        this.userDB = userDB;
    }

    public boolean login(String username, String password) {
        User user = userDB.findUser(username);
        if (user != null && verifyPassword(password, user)) {
            return true;
        }
        return false;
    }

    public boolean register(String username, String password) {
        if (userDB.userExists(username) == true) { return false; }
        File file = new File("src/main/resources/data/users.csv");
        //try {
        //    file = new File("data/users.csv");
            //file = new ClassPathResource("data/users.csv").getFile();
        //} catch (IOException e) {
        //    System.out.println(e);
        //    return false;
        //}
        User temp = new User(username, password);
        UserDB.writeDataLine(file.getAbsolutePath(), temp);
        this.userDB.saveUser(temp);
        return true;
    }



    private boolean verifyPassword(String password, User user) {
        if (password.equals(user.getPassword())) {
            return true;
        }
        return false;
    }


}
