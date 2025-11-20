import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ChooseCountry.css";

const countries = [
  { name: "India", color: "blue", teamName: "India" },
  { name: "Pakistan", color: "green", teamName: "Pakistan" },
  { name: "Australia", color: "yellow", teamName: "Australia" },
  { name: "England", color: "skyblue", teamName: "England" },
  { name: "New Zealand", color: "black", teamName: "New Zealand" },
  { name: "West Indies", color: "maroon", teamName: "West Indies" },
  { name: "South Africa", color: "darkgreen", teamName: "South Africa" },
  { name: "Sri Lanka", color: "royalblue", teamName: "Sri Lanka" },
];

export default function ChooseCountry() {
  const [selectedCountry, setSelectedCountry] = useState(null);
  const navigate = useNavigate();

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    localStorage.setItem("selectedCountry", JSON.stringify(country));
  };

  const handlePlayClick = () => {
    if (selectedCountry) {
      navigate("/arcade");
    }
  };

  return (
    <div className="choose-country-container">
      {/* Animated Cricket Ball Background Element */}
      <div className="cricket-ball"></div>

      <h1 className="title">Choose Your Cricket Nation</h1>
      <div className="country-slider-container">
        <div className="country-slider">
          {countries.map((country) => (
            <div
              key={country.name}
              className={`country-option ${country.color} ${selectedCountry === country ? "selected" : ""}`}
              onClick={() => handleCountrySelect(country)}
            >
              {country.name}
            </div>
          ))}
        </div>
      </div>
      <button
        className={`play-button ${selectedCountry ? "active" : ""}`}
        onClick={handlePlayClick}
        disabled={!selectedCountry}
      >
        Play Now
      </button>
    </div>
  );
}