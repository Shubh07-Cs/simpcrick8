"use client";
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import "./TwoPlayerMode.css";
import {
  scoreOptions,
  ballSpeedMap,
  wicketsLimit,
  ballsPerInningsTwoPlayer,
} from "../constants/gameConfig";

const initialPlayers = [
  { id: "p1", name: "Player One", color: "#2563eb" },
  { id: "p2", name: "Player Two", color: "#f97316" },
];

const deriveTempo = (state) => {
  if (state.innings === 0) {
    const progress = (ballsPerInningsTwoPlayer - state.ballsRemaining) / ballsPerInningsTwoPlayer;
    if (progress > 0.65) return "MEDIUM";
    return "SLOW";
  }

  if (state.target) {
    const runsNeeded = Math.max(0, state.target - state.scores[1]);
    const pressure = runsNeeded / Math.max(1, state.ballsRemaining);
    if (pressure >= 4) return "FAST";
    if (pressure >= 2) return "MEDIUM";
  }
  return "MEDIUM";
};

export default function TwoPlayerMode() {
  const [players, setPlayers] = useState(initialPlayers);
  const pointerFrameRef = useRef(null);
  const pointerTimerRef = useRef(0);

  const [matchState, setMatchState] = useState({
    innings: 0,
    ballsRemaining: ballsPerInningsTwoPlayer,
    scores: [0, 0],
    wickets: [0, 0],
    target: null,
    pointerPosition: 0,
    isPointerMoving: true,
    isAnimating: false,
    isGameOver: false,
    result: "",
    message: `${initialPlayers[0].name} batting`,
    lastPlay: "Tap the shot strip to start!",
    ballSpeed: "SLOW",
  });

  const { isGameOver, isPointerMoving, isAnimating, ballSpeed } = matchState;

  useEffect(() => {
    if (pointerFrameRef.current) cancelAnimationFrame(pointerFrameRef.current);
    if (isGameOver || !isPointerMoving || isAnimating) return;

    const tickDuration = ballSpeedMap[ballSpeed] ?? 165;
    pointerTimerRef.current = performance.now();

    const tick = (timestamp) => {
      if (timestamp - pointerTimerRef.current >= tickDuration) {
        setMatchState((prev) => ({
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
  }, [isGameOver, isPointerMoving, isAnimating, ballSpeed]);

  useEffect(() => {
    setMatchState((prev) => {
      if (prev.isGameOver) return prev;
      if (prev.innings === 0) {
        return { ...prev, message: `${players[0].name} batting` };
      }
      if (prev.target) {
        const runsRequired = Math.max(0, prev.target - prev.scores[1]);
        return { ...prev, message: `${players[1].name} need ${runsRequired} to win` };
      }
      return prev;
    });
  }, [players]);

  const handleNameChange = (index, value) => {
    setPlayers((prev) =>
      prev.map((player, idx) => (idx === index ? { ...player, name: value.slice(0, 18) } : player)),
    );
  };

  const resetMatch = () => {
    setMatchState({
      innings: 0,
      ballsRemaining: ballsPerInningsTwoPlayer,
      scores: [0, 0],
      wickets: [0, 0],
      target: null,
      pointerPosition: 0,
      isPointerMoving: true,
      isAnimating: false,
      isGameOver: false,
      result: "",
      message: `${players[0].name} batting`,
      lastPlay: "Fresh start! Tap to play.",
      ballSpeed: "SLOW",
    });
  };

  const handlePointerStop = () => {
    if (matchState.isGameOver || matchState.isAnimating || !matchState.isPointerMoving) return;

    const selectedOption = scoreOptions[matchState.pointerPosition];
    const selectedValue = selectedOption.value;
    const runsScored = selectedValue === "." ? 0 : selectedValue === "W" ? null : Number(selectedValue);
    const ballsLeft = Math.max(0, matchState.ballsRemaining - 1);

    setMatchState((prev) => ({
      ...prev,
      isAnimating: true,
      isPointerMoving: false,
    }));

    setTimeout(() => {
      setMatchState((prev) => {
        const updatedScores = [...prev.scores];
        const updatedWickets = [...prev.wickets];
        let innings = prev.innings;
        let ballsRemaining = ballsLeft;
        let target = prev.target;
        let isGameOverState = prev.isGameOver;
        let result = prev.result;
        let message = prev.message;
        let resumePointer = true;
        let lastPlayCopy = prev.lastPlay;

        if (selectedValue === "W") {
          updatedWickets[innings] += 1;
          lastPlayCopy = `${players[innings].name} is caught out!`;
        } else if (runsScored !== null) {
          updatedScores[innings] += runsScored;
          lastPlayCopy =
            runsScored === 0
              ? `${players[innings].name} defends solidly.`
              : `${players[innings].name} blasts ${runsScored}!`;
        }

        const inningsClosed =
          updatedWickets[innings] >= wicketsLimit || ballsRemaining === 0;

        if (innings === 0 && inningsClosed) {
          target = updatedScores[0] + 1;
          innings = 1;
          ballsRemaining = ballsPerInningsTwoPlayer;
          resumePointer = true;
          lastPlayCopy = `${players[0].name} sets ${updatedScores[0]} runs.`;
          message = `${players[1].name} need ${target - 1}`;
        } else if (innings === 1) {
          if (target && updatedScores[1] >= target) {
            isGameOverState = true;
            resumePointer = false;
            result = `${players[1].name} wins with ${ballsRemaining} balls spare!`;
          } else if (inningsClosed) {
            isGameOverState = true;
            resumePointer = false;
            if (target) {
              if (updatedScores[1] === target - 1) {
                result = "All square! Match tied.";
              } else if (updatedScores[1] > updatedScores[0]) {
                result = `${players[1].name} snatches victory!`;
              } else {
                result = `${players[0].name} defends the target!`;
              }
            }
          } else if (target) {
            const runsNeeded = Math.max(0, target - updatedScores[1]);
            message = `${players[1].name} need ${runsNeeded} from ${ballsRemaining}`;
          }
        } else if (!inningsClosed) {
          message = `${players[innings].name} in charge`;
        }

        const nextTempo = deriveTempo({
          innings,
          ballsRemaining,
          scores: updatedScores,
          target,
        });

        return {
          ...prev,
          scores: updatedScores,
          wickets: updatedWickets,
          innings,
          ballsRemaining,
          target,
          isPointerMoving: resumePointer && !isGameOverState,
          isAnimating: false,
          isGameOver: isGameOverState,
          result,
          message,
          lastPlay: lastPlayCopy,
          ballSpeed: nextTempo,
        };
      });
    }, 180);
  };

  const runsNeededSecond =
    matchState.target && matchState.innings === 1
      ? Math.max(0, matchState.target - matchState.scores[1])
      : null;

  return (
    <div className="two-player-shell">
      <div className="tp-header">
        <Link to="/">
          <button className="tp-home">🏠 Home</button>
        </Link>
        <h1>Dual Wicket Arena</h1>
        <button className="tp-reset" onClick={resetMatch}>
          🔁 Reset Duel
        </button>
      </div>

      <div className="tp-name-editor">
        {players.map((player, index) => (
          <label key={player.id}>
            Player {index + 1}
            <input
              value={player.name}
              onChange={(event) => handleNameChange(index, event.target.value)}
            />
          </label>
        ))}
      </div>

      <div className="tp-scoreboard">
        {players.map((player, index) => (
          <motion.div
            key={player.id}
            className={`tp-score-card ${matchState.innings === index ? "active" : ""}`}
            style={{ borderColor: player.color }}
            layout
          >
            <div className="tp-score-card__title">
              <span className="dot" style={{ backgroundColor: player.color }} />
              {player.name}
            </div>
            <div className="tp-score-card__score">
              {matchState.scores[index]} / {matchState.wickets[index]}
            </div>
            <div className="tp-score-card__meta">
              Wickets left: {Math.max(0, wicketsLimit - matchState.wickets[index])}
            </div>
            {index === 1 && matchState.target && (
              <div className="tp-score-card__meta">
                Need {Math.max(0, matchState.target - matchState.scores[1])} more
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <motion.div layout className="tp-status-card">
        <p>{matchState.message}</p>
        <span>{matchState.lastPlay}</span>
        <div className="tp-balls">
          Balls left: <strong>{matchState.ballsRemaining}</strong>
        </div>
        <div className="tp-pace">
          Tempo: <strong>{matchState.ballSpeed}</strong>
        </div>
      </motion.div>

      <div className="tp-field">
        <div className="tp-pitch">
          <motion.div
            className="tp-batter"
            style={{ backgroundColor: players[matchState.innings].color }}
            animate={{ scale: matchState.isAnimating ? 1.08 : 1 }}
            transition={{ type: "spring", stiffness: 160, damping: 10 }}
          />
          <AnimatePresence>
            {matchState.isAnimating && (
              <motion.div
                className="tp-ball-flight"
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
              >
                <motion.div
                  className="tp-ball-value"
                  style={{ backgroundColor: scoreOptions[matchState.pointerPosition].color }}
                  animate={{ scale: [1, 1.25, 1] }}
                  transition={{ duration: 0.45 }}
                >
                  {scoreOptions[matchState.pointerPosition].value}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          <motion.div
            className="tp-bowler"
            style={{ backgroundColor: players[(matchState.innings + 1) % 2].color }}
            animate={{ y: matchState.isAnimating ? -6 : 0 }}
            transition={{ duration: 0.18, repeat: matchState.isAnimating ? Infinity : 0, repeatType: "mirror" }}
          />
        </div>
        <AnimatePresence>
          {matchState.isGameOver && (
            <motion.div
              className="tp-result-banner"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              {matchState.result}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="tp-strip" onClick={handlePointerStop}>
        <div
          className="tp-strip-pointer"
          style={{
            left: `${(matchState.pointerPosition * 100) / scoreOptions.length}%`,
            width: `${100 / scoreOptions.length}%`,
          }}
        />
        <div className="tp-strip-grid">
          {scoreOptions.map((option, index) => (
            <div key={`${option.value}-${index}`} className={`tp-strip-cell ${option.color}`}>
              <span>{option.value}</span>
              <small>{option.label}</small>
            </div>
          ))}
        </div>
      </div>

      {matchState.isGameOver && (
        <div className="tp-actions">
          <button onClick={resetMatch}>Play Again</button>
          <Link to="/arcade">
            <button className="ghost">Solo Arcade</button>
          </Link>
        </div>
      )}

      {runsNeededSecond !== null && !matchState.isGameOver && (
        <div className="tp-need-note">
          {players[1].name} need <strong>{runsNeededSecond}</strong> from{" "}
          <strong>{matchState.ballsRemaining}</strong> balls
        </div>
      )}
    </div>
  );
}

