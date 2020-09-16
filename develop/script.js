// console.log("Weather Dashboard");
// This is my API key.
var APIKey = "4463f873c6dc776fe6795da1c387ee8f";

// After searching for a city, current and future conditions for that city are displayed and that city is added to the search history.
var storedCity = []

// When viewing current weather conditions for that city:
// City name, date, icon representing weather conditions, temperature, humidity, wind will be displayed.
function srchCity() {
    var cityInput = $("#cityInput").val();
    console.log(cityInput);

// This is the URL needed to query the database.
var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + cityInput + "&appid=" + APIKey + "&unites=imperial";
//   AJAX call
$.ajax({
    url: queryURL,
    method: "GET"
}).then(function(response) {
    console.log(response);

    $(".city").html("City name: " + response.name  + " " + "(" + moment().format('l') + ")");
    $(".temp").html("Temperature: " + response.main.temp + " degrees F");
    $(".humidity").html("Humidity: " + response.main.humidity);
    $(".wind").html("Wind Speed: " + response.wind.speed + " miles/hour");
 });
//  get UV Index favorable(green), moderate(yellow), or severe(red)
var uvNdxURL = "https://api.openweathermap.org/data/2.5/uvi?appid=" + APIKey +"&lat=" + response.coord.lat + "&lon=" + response.coord.lon;
// Ajax call
$.ajax({
    url: uvNdxURL,
    method: "GET"
}).then(function(response) {
    var uvNdx = response.value;
    var uvColor;
    if (uvNdx <= 2) {
        uvColor = "green";
    }
    else if (uvNdx >= 3 ||  uvNdx <= 5) {
        uvColor = "yellow";
    }
    else if (uvNdx >= 6 ||  uvNdx <= 8) {
        uvColor = "red";
    }
    else {
        uvColor = "danger";
    }
    var uvDisplay = $("<p>").attr("class").text("UV Index: ");
    uvDisplay.append($("<p>".attr("class", "uvNdx").attr("style", ("background-color:" + uvColor)).text(uvNdx)));
    cardBody.append(uvDisplay);
});
    renderCityBtns()
    5-DayForecast(cityInput);

};