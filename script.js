$(document).ready(function () {
  // Initializing variables and selecting elements
  let currentDate = dayjs().format("DD/MM/YY");
  let todaySelection = $("#today");
  let searchButton = $("#search-button");
  let forecastSection = $("#forecast");
  let inputSection = $(".input-group");
  let cityHistoryList = $("#history");
  let cityNamesList = [];
  let deleteBtn = $("<button>");

  initiate();

  // Initializing the app

  function initiate() {
    // Load stored cities from local storage

    let storedCity = JSON.parse(localStorage.getItem("History"));

    if (storedCity) {
      cityNamesList = storedCity;
    }

    deleteBtn.addClass("btn btn-block btn-danger delete-btn").text("Clear");

    inputSection.append(deleteBtn);

    renderCityButtons();
  }

  // Function to handle city search

  function findCity(event) {
    event.preventDefault();
    let city = $("#search-input").val();
    let apiKey = "0ed58c658d00ae18f106a86b10fb1f7d";
    let queryUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}`;

    todaySelection.empty();
    forecastSection.empty();

    // Fetch call to retrieve weather data
    fetch(queryUrl)
      .then((response) => response.json())
      .then((response) => {
        renderForecast(response);
        renderFutureForecast(response);

        // Handle city validation and history storage

        if (city === "") {
          alert("Please enter a city name");
        } else if (cityNamesList.includes(city)) {
          alert("Please enter a new city name");
        } else {
          cityNamesList.push(city);
          localStorage.setItem("History", JSON.stringify(cityNamesList));
          renderCityButtons();
        }
      });
  }

  //Main city forecast

  function renderForecast(response) {
    let currentForecast = response.list[0];
    //creating main forecast UI elements

    let todayCard = $("<div>").attr(
      "class",
      "card text-white shadow bg-secondary"
    );
    let todayCardBody = $("<div>").attr(
      "class",
      "card-body rounded-bottom bg-light"
    );
    let todayCardHeader = $("<div>").attr("class", "card-header");
    let rowDiv = $("<div>").attr("class", "row");
    let iconDiv = $("<div>").attr(
      "class",
      "col-2 border-secondary border-right"
    );
    let contentDiv = $("<div>").attr("class", "text-dark col-10");

    //main forecast information

    //heading

    let cityHeading = $("<h4>").attr("class", "font-weight-bold");
    cityHeading.text(`${response.city.name}  (${currentDate})`);
    //temp conversion

    let kelvinToCelsius = currentForecast.main.temp - 273.15;
    let celcius = Math.round(kelvinToCelsius * 10) / 10;
    //temp

    let todayTemp = $("<p>");
    todayTemp.text(`Temp: ${celcius}°C`);
    //weather icon

    let icon = $("<img>");
    let fcIcon = currentForecast.weather[0].icon;
    icon.attr({
      src: `http://openweathermap.org/img/wn/${fcIcon}@2x.png`,
      alt: `${currentForecast.weather[0].description}`,
      class: "mx-auto d-block",
    });
    // cityHeading.append(icon);

    //wind

    let todayWind = $("<p>");
    todayWind.text(`Wind: ${currentForecast.wind.speed} KPH`);
    //humidity

    let todayHumi = $("<p>");
    todayHumi.text(`Humidity: ${currentForecast.main.humidity}%`);

    //append elements

    todaySelection.append(todayCard);
    todayCard.append(todayCardHeader, todayCardBody);
    todayCardHeader.append(cityHeading);
    todayCardBody.append(rowDiv);
    rowDiv.append(iconDiv, contentDiv);
    contentDiv.append(todayTemp, todayWind, todayHumi);
    iconDiv.append(icon);
  }

  //5-Day forecast

  function forecastDate(day) {
    //create a forecast date to compare against

    let forecastDate = dayjs().add(day, "day").format("YYYY-MM-DD");
    return `${forecastDate} 12:00:00`;
  }

  function renderFutureForecast(response) {
    let forecastHeading = $("<h4>").attr("class", "font-weight-bold");
    forecastHeading.text("5-Day Forecast:");
    let forecastDeck = $("<div>").attr("class", "card-deck");
    forecastSection.append(forecastHeading, forecastDeck);

    let forecastList = response.list;
    let dayFlag = 1;

    for (let i = 1; i < forecastList.length; i++) {
      if (forecastDate(dayFlag) === forecastList[i].dt_txt) {
        //if true, create the 5 day forcast using the forecast list

        fillFutureForecastCard(forecastList[i]);
        //increment the day by 1

        dayFlag++;
      }
    }
  }

  function fillFutureForecastCard(obj) {
    let forecastDeck = $(".card-deck");
    let forecastCard = $("<div>").attr(
      "class",
      "bg-secondary text-white shadow card"
    );
    let forecastCardBody = $("<div>").attr("class", "card-body");

    //temp conversion
    let kelvinToCelsius = obj.main.temp - 273.15;
    let celcius = Math.round(kelvinToCelsius * 10) / 10;

    //forecast heading
    let cardHeader = $("<div>").attr("class", "card-header bg-light");
    let futureDate = $("<h5>").attr(
      "class",
      "text-center text-dark font-weight-bold"
    );
    futureDate.text(dayjs(obj.dt_txt).format("DD/MM/YY"));
    //weather icon

    let icon = $("<img>");
    let fcIcon = obj.weather[0].icon;
    icon.attr({
      src: `http://openweathermap.org/img/wn/${fcIcon}@2x.png`,
      alt: `${obj.weather[0].description}`,
      class: "mx-auto d-block",
    });
    //temp

    let futureTemp = $("<p>");
    futureTemp.text(`Temp: ${celcius}°C`);
    //wind

    let futureWind = $("<p>");
    futureWind.text(`Wind: ${obj.wind.speed}KPH`);
    //humidity

    let futureHumi = $("<p>");
    futureHumi.text(`Humidity: ${obj.main.humidity}%`);

    forecastDeck.append(forecastCard);
    forecastCard.append(cardHeader, forecastCardBody);
    cardHeader.append(icon, futureDate);
    forecastCardBody.append(futureTemp, futureWind, futureHumi);
  }

  function renderCityButtons() {
    //empty ul to make sure that buttons do not duplicate

    cityHistoryList.empty();

    //create a button for every item in array

    for (i = 0; i < cityNamesList.length; i++) {
      let cityButton = $("<div>");
      cityButton.addClass("history-tab");
      cityButton.attr("data-city", cityNamesList[i]);
      cityButton.text(cityNamesList[i]);
      cityHistoryList.append(cityButton);
    }
  }

  //Function to clear localStorage

  function clearHistory() {
    localStorage.removeItem("History");
  }

  //Retrieve past searches when city button is pressed

  function getPastForcast(event) {
    event.preventDefault();
    let city = $(event.target).attr("data-city");

    let apiKey = "0ed58c658d00ae18f106a86b10fb1f7d";
    let queryUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}${apiKey}`;

    todaySelection.empty();
    forecastSection.empty();
    // Fetch call to retrieve weather data
    fetch(queryUrl)
      .then((response) => response.json())
      .then((response) => {
        renderForecast(response);
        renderFutureForecast(response);
      })
      .catch((error) => {
        console.error("Error fetching weather data:", error);
      });
  }

  // Event listeners

  searchButton.on("click", findCity);
  cityHistoryList.on("click", ".city-btn", getPastForcast);
  inputSection.on("click", ".delete-btn", clearHistory);
});
