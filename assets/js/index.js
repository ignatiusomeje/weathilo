// const hide = document.querySelector(".weather-content-wrap");
const load = document.querySelector(".load");
const citySearch = document.getElementById("citySearch");
const search = document.getElementById("search");
const close = document.getElementById("close");
const open = document.getElementById("open");
const modal = document.getElementById("modal");

import { GoogleGenerativeAI } from "@google/generative-ai";

// makes the loader to be visible while the other part of the page not visible
load.style.display = "flex";

search.addEventListener("submit", function (e) {
  e.preventDefault();
  const searchValue = new FormData(e.target);
  if (searchValue.get("citySearch").trim() !== "") {
    load.style.display = "flex";
    getTemperatureBySearch(searchValue.get("citySearch"));
    search.reset();
  }
});

close.addEventListener("click", (e) => {
  console;
  modal.classList.toggle("show");
});

open.addEventListener("click", (e) => {
  console.log("i opened");
  modal.classList.toggle("show");
});

const key = "AIzaSyBdxwyyXdCpoI9daqZ-XseggBR0_tH2ceo";
const genAI = new GoogleGenerativeAI(key);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-pro",
  temperature: 1,
  topK: 1,
  topP: 1,
});

function getUserLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        getTemperatureByLocation(
          position.coords.latitude,
          position.coords.longitude
        );
      },
      (error) => {
        getUserIPAddress();
      }
    );
  } else {
    console.error(
      "Geolocation is not supported by this browser, we will use your IP to get your location"
    );
    getUserIPAddress();
  }
}

getUserLocation();

async function getTemperatureBySearch(location) {
  const appId = "bb16e18b8368d84b47250889d317c00a";
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${appId}&units=metric`;

  try {
    const weatherForecast = await axios({
      method: "get",
      url,
    });

    askAI(weatherForecast);
  } catch (error) {
    alert("error fetching data");
  }
}

async function askAI({ data }) {
  console.log(data);
  try {
    const format = JSON.stringify({
      recommendedCrops: [],
      weather: {
        temperature: "",
        humidity: "",
        season: "",
        floodProbability: "",
        wind: "",
        pressure: "",
        locationName: "",
        feels: "",
      },
    });

    // const prompt = `Give me a list of recommended crops for Orogbum based on current weather conditions. Include temperature, humidity, season, flood probability, wind speed, pressure, and feels-like temperature.${JSON.stringify(
    //   data
    // )}. Do not explain just reply in as a javascript object`;
    const prompt = `use this data to tell the current weather season and type of crop to plant together with the probability of flood happening: ${JSON.stringify(
      data
    )}. Do not explain just reply in this format but as object: ${format}.`;

    const result = await model.generateContent(prompt);

    const response = await result.response.text();
    if (response.includes("```json") || response.includes("```")) {
      const cleanedString = response
        .replace(/```json/g, "")
        .replace(/```/g, "");
      displayTemperature(JSON.parse(cleanedString), data);
      console.log(cleanedString, "here am i")
    } else {
      displayTemperature(response, data);
    }
    console.log(response, "see this here");
  } catch (error) {
    console.log(error, "this is the error");
    alert("Error Fetching Data");
  }
}

async function getTemperatureByLocation(latitude, longitude) {
  const appId = "bb16e18b8368d84b47250889d317c00a";
  const url = "https://api.openweathermap.org/data/2.5/weather";

  // AIzaSyBdxwyyXdCpoI9daqZ-XseggBR0_tH2ceo

  try {
    const weatherForecast = await axios({
      method: "get",
      url,
      params: {
        lat: latitude,
        lon: longitude,
        appid: appId,
        units: "metric", // get value in deg celsius
      },
    });

    askAI(weatherForecast);
  } catch (error) {
    console.log(error, "hey i am error");
    alert("Error Fetching Data");
  }
}

/* {
    "recommendedCrops": [
        "Rice",
        "Cassava",
        "Plantain"
    ],
    "weather": {
        "temperature": "25.09°C",
        "humidity": "94%",
        "season": "Rainy",
        "floodProbability": "High",
        "wind": "2.06 m/s",
        "pressure": "1008 hPa"
    }
} */

function getUserIPAddress() {
  axios({
    url: "https://ipinfo.io",
    method: "get",
    params: {
      token: "81df32b5ba818d", // get your token from ipinfo.io site,
    },
  })
    .then((value) => {
      const location = value.data.loc;
      const latAndLong = location.split(",");
      getTemperatureByLocation(latAndLong[0], latAndLong[1]);
    })
    .catch((error) => console.log(error));
}

function displayTemperature(tempDetails, data) {
  console.log(tempDetails, "hey, see me here");
  load.style.display = "none";

  const temperature = document.getElementById("temperature");
  const locationName = document.getElementById("locationName");
  const locationTemp = document.getElementById("locationTemp");
  const cropsListed = document.getElementById("cropsListed");
  const floodProbability = document.getElementById("floodProbability");
  const Season = document.getElementById("Season");
  const humidity = document.getElementById("humidity");
  const pressure = document.getElementById("pressure");
  const wind = document.getElementById("wind");
  const feel = document.getElementById("feel");

  locationName.textContent =
    tempDetails.weather.locationName + `, ${data.sys.country}`;
  locationTemp.textContent = tempDetails.weather.temperature;
  floodProbability.textContent = tempDetails.weather.floodProbability;
  Season.textContent = tempDetails.weather.season;
  humidity.textContent = tempDetails.weather.humidity;
  pressure.textContent = tempDetails.weather.pressure;
  wind.textContent = tempDetails.weather.wind;
  feel.textContent = tempDetails.weather.feels;
  cropsListed.textContent = "";

  tempDetails.recommendedCrops.length > 0
    ? tempDetails.recommendedCrops.map((crop) => {
        const span = document.createElement("span");
        span.setAttribute("class", "crop");
        span.textContent = crop;
        cropsListed.appendChild(span);
      })
    : (cropsListed.textContent = "No Crop to recommend");

  let tempDescription = data.weather[0].description;
  const weatherIcon = data.weather[0].icon;
  const isDay = weatherIcon.includes("d"); //returns a boolean true if letter 'd' is contained in the icon name

  switch (tempDescription) {
    case "clear sky":
      if (isDay) {
        temperature.classList.add("wi-day-sunny");
      } else {
        temperature.classList.add("wi-night-clear");
      }
      break;
    case "few clouds":
      if (isDay) {
        temperature.classList.add("wi-day-cloudy");
      } else {
        temperature.classList.add("wi-night-alt-cloudy");
      }
      break;
    case "scattered clouds":
      temperature.classList.add("wi-cloud");
      break;
    case "broken clouds":
    case "overcast clouds":
      temperature.classList.add("wi-cloudy");
      break;
    case "light rain":
    case "very heavy rain":
    case "extreme rain":
    case "moderate rain":
      if (isDay) {
        temperature.classList.add("wi-day-showers");
      } else {
        temperature.classList.add("wi-night-alt-showers");
      }
      break;
    case "shower rain":
      temperature.classList.add("wi-showers");
      break;
    case "thunderstorm":
    case "heavy thunderstorm":
      if (isDay) {
        temperature.classList.add("wi-day-lightning");
      } else {
        temperature.classList.add("wi-night-alt-lightning");
      }
      break;
    case "thunderstorm with light rain":
    case "thunderstorm with rain":
    case "thunderstorm with heavy rain":
      temperature.classList.add("wi-storm-showers");
    default:
      break;
  }
}

// function convertCelsuisToFahrenheit() {
//   let initialDegreeCelsius = "";
//   const temperature = document.getElementById("temperature")
//     .addEventListener("click", (event) => {
//       const temperature = document.getElementById("temperature")
//       const degCelsiusInt = parseInt(temperature.textContent);

//       event.target.classList.toggle("temp-convert");
//       if (event.target.classList.contains("temp-convert")) {
//         event.target.textContent = "F";
//         const fahrenheitresult = Math.round((degCelsiusInt * 9) / 5 + 32);
//         initialDegreeCelsius = temperature.textContent;
//         temperature.textContent = fahrenheitresult;
//       } else {
//         event.target.textContent = "C";
//         temperature.textContent = initialDegreeCelsius;
//       }
//     });
// }
// convertCelsuisToFahrenheit();
