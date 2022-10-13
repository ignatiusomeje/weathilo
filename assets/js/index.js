const hide = document.querySelector('.weather-content-wrap') 
const load = document.querySelector('.load') 
load.style.display = 'unset'
hide.style.display = 'none'
function getUserLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log(position.coords);

        getTemperatureByLocation(
          position.coords.latitude,
          position.coords.longitude
        );
      },
      (error) => {
        console.log(error);
        getUserIPAddress();
      }
    );
  } else {
    console.error("Geolocation is not supported by this browser");
    getUserIPAddress();
  }
}

getUserLocation();

function getTemperatureByLocation(latitude, longitude) {
  const appId = "bb16e18b8368d84b47250889d317c00a";
  const url = "https://api.openweathermap.org/data/2.5/weather";

  axios({
    method: "get",
    url,
    params: {
      lat: latitude,
      lon: longitude,
      appid: appId,
      units: "metric", // get value in deg celsius
    },
  })
    .then((value) => {
      console.log(value);
      displayTemperature(value.data);
    })
    .catch((error) => console.error(error));
}

function getUserIPAddress() {
  axios({
    url: "https://ipinfo.io",
    method: "get",
    params: {
      token: "81df32b5ba818d", // get your token from ipinfo.io site,
    },
  })
    .then((value) => {
      console.log(value);
      const location = value.data.loc;

      const latAndLong = location.split(",");
      getTemperatureByLocation(latAndLong[0], latAndLong[1]);
    })
    .catch((error) => console.log(error));
}

function displayTemperature(tempDetails) {
  hide.style.display = 'unset';
  load.style.display = 'none'
  const weatherimage = document.querySelector(".weather-image i");
  const city = document.querySelector(".city-name");
  const country = document.querySelector(".country");
  const desc = document.querySelector(".description");
  const temperature = document.querySelector(".temp-data");

  let tempDescription = tempDetails.weather[0].description;
  const weatherIcon = tempDetails.weather[0].icon;
  const isDay = weatherIcon.includes("d"); //returns a boolean true if letter 'd' is contained in the icon name

  city.textContent = `${tempDetails.name},`;
  country.textContent = tempDetails.sys.country;
  desc.textContent = tempDescription;
  desc.style.textTransform = 'capitilize'
  temperature.textContent = Math.round(tempDetails.main.temp);

  switch (tempDescription) {
    case "clear sky":
      if (isDay) {
        weatherimage.classList.add("wi-day-sunny");
      } else {
        weatherimage.classList.add("wi-night-clear");
      }
      break;
    case "few clouds":
      if (isDay) {
        weatherimage.classList.add("wi-day-cloudy");
      } else {
        weatherimage.classList.add("wi-night-alt-cloudy");
      }
      break;
    case "scattered clouds":
      weatherimage.classList.add("wi-cloud");
      break;
    case "broken clouds":
    case "overcast clouds":
      weatherimage.classList.add("wi-cloudy");
      break;
    case "light rain":
    case "very heavy rain":
    case "extreme rain":
    case "moderate rain":
      if (isDay) {
        weatherimage.classList.add("wi-day-showers");
      } else {
        weatherimage.classList.add("wi-night-alt-showers");
      }
      break;
    case "shower rain":
      weatherimage.classList.add("wi-showers");
      break;
    case "thunderstorm":
    case "heavy thunderstorm":
      if (isDay) {
        weatherimage.classList.add("wi-day-lightning");
      } else {
        weatherimage.classList.add("wi-night-alt-lightning");
      }
      break;
    case "thunderstorm with light rain":
    case "thunderstorm with rain":
    case "thunderstorm with heavy rain":
      weatherimage.classList.add("wi-storm-showers");
    default:
      break;
  }
}

function convertCelsuisToFahrenheit() {
  let initialDegreeCelsius = "";
  document
    .querySelector(".description-wrap-2 .temp-unit")
    .addEventListener("click", (event) => {
      const tempData = document.querySelector(".temp-data");
      const degCelsiusInt = parseInt(tempData.textContent);

      event.target.classList.toggle("temp-convert");
      if (event.target.classList.contains("temp-convert")) {
        event.target.textContent = "F";
        const fahrenheitresult = Math.round((degCelsiusInt * 9) / 5 + 32);
        initialDegreeCelsius = tempData.textContent;
        tempData.textContent = fahrenheitresult;
      } else {
        event.target.textContent = "C";
        tempData.textContent = initialDegreeCelsius;
      }
    });
}
convertCelsuisToFahrenheit();
