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
@RequestMapping("/api/auth/register")
public class RegisterController {

    private UserDB userDB;
    private LoginManager loginManager;

    public RegisterController() throws IOException {
        // Load CSVs from the "data" directory. When running inside a fat-jar, resources
        // packaged in the JAR cannot be read as files, so copy them into the container.
        File usersCsv = new File("data/users.csv");
        File rewardsCsv = new File("data/rewards.csv");
        File userRewardsCsv = new File("data/userRewards.csv");
        RewardsDB rewardsDB = new RewardsDB(rewardsCsv.getAbsolutePath());
        this.userDB = new UserDB(usersCsv.getAbsolutePath(), userRewardsCsv.getAbsolutePath(), rewardsDB);
        this.loginManager = new LoginManager(userDB);
    }

    @PostMapping
    public String register(@RequestBody User loginDto, HttpSession session) {
        String username = loginDto.getUsername();
        String password = loginDto.getPassword();
        if (loginManager.register(username, password)) {
            return "Register successful";
        }
        return "Unable to register with your username";
    }

    @GetMapping("/test")
    public String test() {
        return "RegisterController works";
    }

}
