require("dotenv").config();//integrated env file with process
require("./config/dbConfig.js");//conneciting mongoose to MongoDB Atlas Database

const PORT = process.env.PORT || 7042;

const express = require("express");
const morgan = require("morgan");
const cors = require("cors");//helps in connecting frontend to backend
const GameHistory = require("./models/GameHistory.js");


const app = express();//we created a server using express

app.use(morgan("dev"));

/*Connecting Backend to Frontend*/
const allowedOrigins = [
    "http://localhost:5173",   // Local frontend for testing
    "https://simpcrick8.onrender.com" // Deployed frontend
  ];

app.use(
    cors({
        origin: allowedOrigins ,
        credentials: true,
    
    })
);//it will only allow frontend to to talk with my backend

app.use(express.json());

app.use((req, res, next) => {
    console.log("=>Request Received -->", req.url);
    next();
});

app.get("/", (req, res) => {
    res.send("Server is working fine... ");
})

// app.get("/check-name/:playerName", async (req, res) => {
//     try {
//         const { playerName } = req.params;
//         const existingPlayer = await GameHistory.findOne({ playerName });

//         if (existingPlayer) {
//             return res.status(400).json({ success: false, message: "Name already taken!" });
//         }

//         res.status(200).json({ success: true, message: "Name is available!" });
//     } catch (error) {
//         res.status(500).json({ success: false, message: "Error checking name", error });
//     }
// });

// app.get("/game-history/:playerName", async (req, res) => {
//     try {
//         const { playerName } = req.params;
//         const lastGames = await GameHistory.find({ playerName }).sort({ _id: -1 }).limit(5);
        
//         res.status(200).json({ success: true, games: lastGames });
//     } catch (error) {
//         res.status(500).json({ success: false, message: "Error fetching game history", error });
//     }
// });



app.get("/game-history/last-three", async (req, res) => {
    try {
        const lastGames = await GameHistory.find().sort({ _id: -1 }).limit(5);
        res.status(200)
            .json({
                success: true,
                games: lastGames
            });
    } catch (error) {
        res.status(500)
            .json({
                success: false,
                message: "Error fetching game history",
                error
            });
    }
});

app.post("/game-history/save", async (req, res) => {
    try {
        console.log(req.body);
        const { myTeam, opponentTeam, targetScore, currentScore, ballsRemaining } = req.body;

        // Check if the name exists
        // const existingPlayer = await GameHistory.findOne({ playerName });
        // if (!existingPlayer) {
        //     return res.status(400).json({ success: false, message: "Invalid player name!" });
        // }

        const newGame = new GameHistory({  myTeam, opponentTeam, targetScore, currentScore, ballsRemaining });
        await newGame.save();

        res.status(201).json({ success: true, message: "Game history saved successfully!" });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: "Error saving game history", error });
    }
});



app.listen(PORT, () => {
    console.log(`---Server Started on PORT: ${PORT} ---`);
});
