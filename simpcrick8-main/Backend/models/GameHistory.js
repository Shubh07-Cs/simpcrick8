const mongoose = require("mongoose"); // Helps interact with MongoDB

const gameHistorySchema = new mongoose.Schema({
    playerName: {  
        // type: String,
        required: true,
        unique: true,  
    },
    myTeam: {
        type: String,
        required: true
    },
    opponentTeam: {
        type: String,
        required: true
    },
    targetScore: {
        type: Number,
        required: true
    },
    currentScore: {
        type: Number,
        required: true
    },
    ballsRemaining: {
        type: Number,
        required: true
    },
});

const GameHistory = mongoose.model("GameHistory", gameHistorySchema);

module.exports = GameHistory;
