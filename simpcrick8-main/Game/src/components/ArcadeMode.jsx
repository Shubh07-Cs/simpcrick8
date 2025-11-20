"use client";
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { HelpCircle } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import "./ArcadeMode.css";
import {
  scoreOptions,
  ballSpeedMap,
  aiProfiles,
  getRandomItem,
  randomInRange,
} from "../constants/gameConfig";

const saveGameHistory = async (gameData) => {
  try {
    const response = await fetch("https://simpcrick8-backend.onrender.com/game-history/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(gameData),
    });

    const data = await response.json();
    if (!data.success) {
      console.error("Error saving game history:", data.message);
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

const countries = [
  { name: "India", color: "blue", teamName: "India" },
  { name: "Pakistan", color: "green", teamName: "Pakistan" },
  { name: "Australia", color: "yellow", teamName: "Australia" },
  { name: "England", color: "skyblue", teamName: "England" },
  { name: "New Zealand", color: "black", teamName: "New Zealand" },
  { name: "Sri Lanka", color: "royalblue", teamName: "Sri Lanka" },
];

const calculateNextBallSpeed = (runsNeeded, ballsLeft, profile) => {
  const rrr = ballsLeft <= 0 ? runsNeeded : runsNeeded / ballsLeft;

  // Default weights: [SLOW, MEDIUM, MEDIUM_FAST, FAST]
  let weights = [0.25, 0.25, 0.25, 0.25];

  // Adjust weights based on Run Rate Required (Pressure)
  if (rrr < 1.5) {
    // Low pressure: Mostly Slow/Medium
    weights = [0.4, 0.4, 0.15, 0.05];
  } else if (rrr < 3.0) {
    // Medium pressure: Mix of Medium/Medium-Fast
    weights = [0.15, 0.35, 0.35, 0.15];
  } else if (rrr < 4.5) {
    // High pressure: Mostly Medium-Fast/Fast
    weights = [0.05, 0.2, 0.4, 0.35];
  } else {
    // Extreme pressure: Mostly Fast
    weights = [0.0, 0.1, 0.3, 0.6];
  }

  // Adjust for AI Aggression (shift weights slightly towards faster speeds)
  if (profile.aggression > 0.7) {
    // Shift some weight from slower to faster
    weights[0] = Math.max(0, weights[0] - 0.1);
    weights[3] = Math.min(1, weights[3] + 0.1);
  }

  // Normalize weights to ensure they sum to 1 (approx)
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  const normalizedWeights = weights.map(w => w / totalWeight);

  // Select speed based on weights
  const random = Math.random();
  let cumulativeWeight = 0;
  const speeds = ["SLOW", "MEDIUM", "MEDIUM_FAST", "FAST"];

  for (let i = 0; i < speeds.length; i++) {
    cumulativeWeight += normalizedWeights[i];
    if (random < cumulativeWeight) {
      return speeds[i];
    }
  }

  return "MEDIUM"; // Fallback
};

export default function ArcadeGame() {
  const [myTeam, setMyTeam] = useState(null);
  const [opponentTeam, setOpponentTeam] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [difficulty, setDifficulty] = useState("CASUAL");
  const pointerFrameRef = useRef(null);
  const pointerTimerRef = useRef(0);

  const [gameState, setGameState] = useState({
    targetScore: 0,
    currentScore: 0,
    ballsRemaining: 0,
    matchNumber: 0,
    isGameOver: false,
    gameResult: "",
    ballSpeed: "MEDIUM",
    isAnimating: false,
    pointerPosition: 0,
    isPointerMoving: false,
    lastPlay: "Tap the strip to bat!",
  });

  useEffect(() => {
    const storedCountry = JSON.parse(localStorage.getItem("selectedCountry"));
    const primaryTeam = storedCountry ?? getRandomItem(countries);
    const opponentChoices = countries.filter((team) => team.name !== primaryTeam.name);

    setMyTeam(primaryTeam);
    setOpponentTeam(getRandomItem(opponentChoices));
    initializeGame();
  }, []);

  const { isGameOver, isAnimating, isPointerMoving, ballSpeed } = gameState;

  useEffect(() => {
    if (pointerFrameRef.current) cancelAnimationFrame(pointerFrameRef.current);
    if (isGameOver || isAnimating || !isPointerMoving) return;

    const speedTarget = ballSpeedMap[ballSpeed] ?? 165;
    pointerTimerRef.current = performance.now();

    const tick = (timestamp) => {
      if (timestamp - pointerTimerRef.current >= speedTarget) {
        setGameState((prev) => ({
          ...prev,
          pointerPosition: (prev.pointerPosition + 1) % scoreOptions.length,
        }));
        pointerTimerRef.current = timestamp;
      }
      pointerFrameRef.current = requestAnimationFrame(tick);
    };

    pointerFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (pointerFrameRef.current) cancelAnimationFrame(pointerFrameRef.current);
    };
  }, [isGameOver, isAnimating, isPointerMoving, ballSpeed]);

  const initializeGame = () => {
    const profileKey = getRandomItem(Object.keys(aiProfiles));
    const profile = aiProfiles[profileKey];
    const ballsRemaining = randomInRange(profile.minBalls, profile.maxBalls);
    const baseTarget = Math.ceil(ballsRemaining * 6 * profile.aggression);
    const calculatedTarget = Math.max(10, baseTarget + randomInRange(3, 12));
    // Cap target score so it's theoretically achievable (max 6 runs per ball)
    const targetScore = Math.min(ballsRemaining * 6, calculatedTarget);
    const initialSpeed = calculateNextBallSpeed(targetScore, ballsRemaining, profile);

    setDifficulty(profileKey);
    setShowPopup(false);
    setGameState((prev) => ({
      targetScore,
      ballsRemaining,
      currentScore: 0,
      matchNumber: prev.matchNumber + 1,
      isGameOver: false,
      gameResult: "",
      ballSpeed: initialSpeed,
      isAnimating: false,
      pointerPosition: 0,
      isPointerMoving: true,
      lastPlay: "New innings! Set the tone.",
    }));
  };

  const handlePointerStop = () => {
    if (gameState.isGameOver || gameState.isAnimating || !gameState.isPointerMoving) return;

    const activeProfile = aiProfiles[difficulty] ?? aiProfiles.CASUAL;
    const selectedOption = scoreOptions[gameState.pointerPosition];
    const selectedValue = selectedOption.value;
    const ballsLeft = Math.max(0, gameState.ballsRemaining - 1);

    setGameState((prev) => ({
      ...prev,
      isPointerMoving: false,
      isAnimating: true,
    }));

    if (selectedValue === "W") {
      setTimeout(() => {
        setGameState((prev) => ({
          ...prev,
          ballsRemaining: ballsLeft,
          isGameOver: true,
          gameResult: "Edge! Caught behind.",
          isAnimating: false,
          lastPlay: "You nicked it — wicket falls!",
          isPointerMoving: false,
        }));
        if (myTeam && opponentTeam) {
          saveGameHistory({
            myTeam: myTeam.teamName,
            opponentTeam: opponentTeam.teamName,
            targetScore: gameState.targetScore,
            currentScore: gameState.currentScore,
            ballsRemaining: ballsLeft,
          });
        }
      }, 180);
      return;
    }

    const runsScored = selectedValue === "." ? 0 : Number(selectedValue);
    const newScore = gameState.currentScore + runsScored;
    const runsNeeded = Math.max(0, gameState.targetScore - newScore);
    const didWin = newScore >= gameState.targetScore;
    const noTime = ballsLeft === 0;
    const newSpeed = calculateNextBallSpeed(runsNeeded, Math.max(1, ballsLeft), activeProfile);

    setTimeout(() => {
      setGameState((prev) => ({
        ...prev,
        currentScore: newScore,
        ballsRemaining: ballsLeft,
        isGameOver: didWin || noTime,
        gameResult: didWin
          ? "Victory! You chased it down."
          : noTime
            ? "Innings closed. Short of the mark."
            : "",
        isAnimating: false,
        ballSpeed: newSpeed,
        isPointerMoving: !(didWin || noTime),
        lastPlay:
          runsScored === 0
            ? "Dot ball — calm under pressure."
            : `${runsScored} run${runsScored > 1 ? "s" : ""}! Pure timing.`,
      }));

      if ((didWin || noTime) && myTeam && opponentTeam) {
        saveGameHistory({
          myTeam: myTeam.teamName,
          opponentTeam: opponentTeam.teamName,
          targetScore: gameState.targetScore,
          currentScore: newScore,
          ballsRemaining: ballsLeft,
        });
      }
    }, 180);
  };

  const runsNeeded = Math.max(0, gameState.targetScore - gameState.currentScore);
  const profileMeta = aiProfiles[difficulty];

  return (
    <div className="arcade-container">
      <div className="header">
        <Link to="/" className="home-link">
          <button className="home-button">🏠 Home</button>
        </Link>
        <h1 className="match-heading">
          {myTeam && opponentTeam ? `${myTeam.teamName} vs ${opponentTeam.teamName}` : "Loading Match..."}
        </h1>
      </div>

      <div className="field-layout">
        <motion.div layout className="field-sidebar score-panel">
          <div className="stat-card scoreboard">
            <span className="stat-label">{myTeam ? myTeam.teamName : "You"}</span>
            <strong className="stat-value">
              {gameState.currentScore}/{gameState.targetScore}
            </strong>
            <small className="stat-sub">{opponentTeam ? `vs ${opponentTeam.teamName}` : "Chasing set target"}</small>
          </div>
        </motion.div>

        <div className="cricket-field">
          <div className="pitch">
            <motion.div
              className="batsman"
              animate={{ scale: gameState.isAnimating ? 1.08 : 1 }}
              transition={{ type: "spring", stiffness: 120, damping: 8 }}
              style={{ backgroundColor: myTeam ? myTeam.color : "#000" }}
            />
            <div className="ball-centering-wrapper">
              <AnimatePresence>
                {gameState.isAnimating && (
                  <motion.div
                    className="ball-container"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                  >
                    <motion.div
                      className="score-display-animation"
                      style={{ backgroundColor: scoreOptions[gameState.pointerPosition].color }}
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 0.5 }}
                    >
                      {scoreOptions[gameState.pointerPosition].value}
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <motion.div
              className="bowler"
              animate={{ y: gameState.isAnimating ? -6 : 0 }}
              transition={{ duration: 0.2, repeat: gameState.isAnimating ? Infinity : 0, repeatType: "reverse" }}
              style={{ backgroundColor: opponentTeam ? opponentTeam.color : "#fff" }}
            />
            <AnimatePresence>
              {gameState.isGameOver && (
                <motion.div
                  className="game-message"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {gameState.gameResult}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <motion.div layout className="field-sidebar chase-panel">
          <div className="stat-card highlight">
            <span className="stat-label">Chase Status</span>
            <strong className="stat-value">{runsNeeded}</strong>
            <small className="stat-sub">needed off {gameState.ballsRemaining} balls</small>
          </div>
        </motion.div>
      </div>

      <motion.div layout className="last-play-card">
        <span className="last-play-label">Last ball</span>
        <p>{gameState.lastPlay}</p>
      </motion.div>

      <div className="speed-indicator">{gameState.ballSpeed}</div>
      <div className="adding-help">
        <div className="score-options-container" onClick={handlePointerStop}>
          <div
            className="pointer"
            style={{
              left: `${(gameState.pointerPosition * 100) / scoreOptions.length}%`,
              width: `${100 / scoreOptions.length}%`,
            }}
          />
          <div className="score-options">
            {scoreOptions.map((option, index) => (
              <div key={`${option.value}-${index}`} className={`score-button ${option.color}`}>
                <span className="score-value">{option.value}</span>
                <span className="score-label">{option.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="help-button-container">
          <AnimatePresence>
            {showPopup && (
              <motion.div
                className="popup"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
              >
                Tap anywhere on the glowing strip to stop the AI!
              </motion.div>
            )}
          </AnimatePresence>
          <button className="help-button" onClick={() => setShowPopup((prev) => !prev)}>
            <HelpCircle className="w-8 h-8" />
          </button>
        </div>
      </div>

      {gameState.isGameOver && (
        <div className="play-again-container">
          <motion.button whileTap={{ scale: 0.95 }} onClick={initializeGame} className="play-again-button">
            Play Again
          </motion.button>
        </div>
      )}
    </div>
  );
}

