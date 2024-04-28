# Flappy Bird 

![Flappy Bird GIF](public/Assets/moving-bird.gif)

<img src="https://educationusa.state.gov/sites/default/files/styles/content_area_full_width/public/field_hei_logo/nyit-logo-pms.jpg?itok=6yOYbJdd" width="35px" />

This project is a recreation of the popular game [Flappy Bird](https://en.wikipedia.org/wiki/Flappy_Bird), created for CSCI 318. It includes implementations of [FSM's, and PDA's](https://www.geeksforgeeks.org/difference-between-pushdown-automata-and-finite-automata/).

Created by: Navraj Singh, Mahdi Tahiri, Risham Singh

## Live Demo

You can play the game [here](https://flappy-bird-irt4.onrender.com/) (hosted with Render.com)

## Installation & Set Up
1. Confirm you have Node.JS 
    ```sh
    node -v
    ```
(This should print the version of node you have. If you don't have node install it [here](https://nodejs.org/en/download))

2. Install Dependencies
    ```sh
    npm install
    ```

3. Run Server
    ```sh
    node app.js
    ```

4. Go to Web Browser of your choice, visit [localhost:3000](localhost:3000), and ensure you are still running the app in your terminal

5. Make sure you are connected to the internet for SQL Database Support

## Technologies Used
- Hosting Services
    - Cockroachlabs (CockroachDB)
    - Render.com
- Languages
    - JavaScript (Node.js and Client-Side)
    - HTML/CSS
    - SQL


## SQL Queries

Our project connects to CoachroachLab's SQL Server and sends queries to sync with the public leaderboard. 

SQL Queries Used
- INSERT INTO flappy_scores (NAME, SCORE) VALUES ('myName', 999);
- SELECT * FROM flappy_scores;
- DELETE FROM flappy_scores where name='name';

## Resources Used
### Assets
- [Flappy Bird Sprites](https://upload.wikimedia.org/wikipedia/en/thumb/0/0a/Flappy_Bird_icon.png/220px-Flappy_Bird_icon.png) - [Dong Nguyen](https://twitter.com/dongatory?lang=en).
- [Statue of Liberty Sprite](https://www.redbubble.com/i/sticker/Statue-of-Liberty-Pixel-Art-by-AIaesthetic/137782272.EJUG5) - [Alaesthetic](https://www.redbubble.com/people/aiaesthetic/shop).
- [Node.JS Boilerplate](https://github.com/nodejs/node) - [OpenJS Foundation](https://nodejs.org/en).