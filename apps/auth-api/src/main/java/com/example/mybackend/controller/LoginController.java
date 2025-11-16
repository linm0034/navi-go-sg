package com.example.mybackend.controller;

import java.io.File;
import java.io.IOException;

import org.springframework.core.io.ClassPathResource;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.mybackend.model.RewardsDB;
import com.example.mybackend.model.User;
import com.example.mybackend.model.UserDB;
import com.example.mybackend.service.LoginManager;

import jakarta.servlet.http.HttpSession;

// Allow requests from any origin
@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/auth/login")
public class LoginController {
    private UserDB userDB;
    private LoginManager loginManager;

    public LoginController() throws IOException {
        // In a runnable JAR, classpath resources are not available as regular files.
        // Instead, read the CSVs from the "data" directory which is copied into
        // the container at build time. If running locally, these paths resolve relative
        // to the working directory.
        File usersCsv = new File("data/users.csv");
        File rewardsCsv = new File("data/rewards.csv");
        File userRewardsCsv = new File("data/userRewards.csv");
        RewardsDB rewardsDB = new RewardsDB(rewardsCsv.getAbsolutePath());
        this.userDB = new UserDB(usersCsv.getAbsolutePath(), userRewardsCsv.getAbsolutePath(), rewardsDB);
        this.loginManager = new LoginManager(userDB);
    }

    @PostMapping
    public String login(@RequestBody User loginDto, HttpSession session) {
        String username = loginDto.getUsername();
        String password = loginDto.getPassword();
        if (loginManager.login(username, password)) {
            User user = userDB.findUser(username);
            session.setAttribute("user", user);
            return "login successful";
        }
        return "Incorrect Username of Password";
    }

    @GetMapping("/test")
    public String test() {
        return "Login endpoint is working";
    }

}
