"use client"

import { useState, useEffect } from "react"
import { Settings, HelpCircle } from "lucide-react"
import "./GameMenu.css"
import { Link } from "react-router-dom"

export default function GameMenu() {
  const [gameHistory, setGameHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false); // Added state for dropdown visibility
  // const [playerName, setPlayerName] = useState("");

  useEffect(() => {
    const fetchGameHistory = async () => {
      try {
        const response = await fetch("https://simpcrick8-backend.onrender.com/game-history/last-three")
        const data = await response.json()

        if (data.success) {
          setGameHistory(data.games)
        } else {
          console.error("Error fetching game history:", data.message)
        }
      } catch (error) {
        console.error("Error:", error)
      }
    }

    fetchGameHistory()
  }, [])

//   useEffect(() => {
//     const askForName = async () => {
//         let name = localStorage.getItem("playerName");

//         if (!name) {
//             while (true) {
//                 name = prompt("Enter your unique name:");
//                 if (!name) {
//                     alert("Name is required!");
//                     continue;
//                 }

//                 // Check if name is unique
//                 const response = await fetch(`https://simpcrick8-backend.onrender.com/check-name/${name}`);
//                 const data = await response.json();

//                 if (!data.success) {
//                     alert("This name is already taken. Choose another.");
//                 } else {
//                     localStorage.setItem("playerName", name);
//                     setPlayerName(name);
//                     alert(`Your name is set to: ${name}`);
//                     break;
//                 }
//             }
//         } else {
//             setPlayerName(name);
//         }
//     };

//     askForName();
// }, []);

  return (
    <div className="game-menu-container">
      {/* Main Content */}
      <div className="game-menu">
        {/* Logo with Animation */}
        <div className="logo-container">
          <img src="/images/Since 1990.png" alt="Simple Cricket" className="logo-image" />
        </div>

        {/* Game Modes Grid */}
        <div className="game-categories-container">
          <Link to="/country" className="game-category-link">
            <div className="game-category-card arcade-card">
              <div className="game-category-icon arcade-icon">
                <img src="/images/Arcade.jpeg" alt="Arcade" className="icon-image" />
              </div>
              <h2 className="game-category-title">ARCADE</h2>
              <p className="game-category-subtitle">Solo Challenge Mode</p>
            </div>
          </Link>

          <Link to="/2player" className="game-category-link">
            <div className="game-category-card two-player-card">
              <div className="game-category-icon two-player-icon">
                <img src="/images/2Player.jpeg" alt="2 Player" className="icon-image" />
              </div>
              <h2 className="game-category-title">2 PLAYER</h2>
              <p className="game-category-subtitle">Head-to-Head Action</p>
            </div>
          </Link>
        </div>

        {/* Settings & Help Buttons */}
        <div className="settings-container">
          <button className="settings-button">
            <Settings className="w-8 h-8" />
          </button>
         
        </div>
      </div>

      {/* History Button (NEW) */}
      <button className="history-button" onClick={() => setShowHistory(!showHistory)}>
  📜
</button>
      {showHistory && (
        <div className="game-history-dropdown">
          <h3 className="game-history-title">Last 5 Games</h3>
          {gameHistory.length === 0 ? (
            <p className="no-history">No games played yet.</p>
          ) : (
            <ul className="game-history-list">
              {gameHistory.map((game, index) => {
                const isWin = game.currentScore >= game.targetScore
                const resultClass = isWin ? "win-result" : "lose-result"
            
                return (
                  <li key={index} className="game-history-item">
                    <strong>{game.myTeam}</strong> vs <strong>{game.opponentTeam}</strong>
                    <br />
                    Score: {game.currentScore}/{game.targetScore}
                    <br />
                    Balls Remaining: {game.ballsRemaining}
                    <br />
                    Result: <b className={resultClass}>{isWin ? "Win 😀" : "Lose 😭"}</b>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    </div>

  )
}

