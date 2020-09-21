// console.log("Weather Dashboard");

(function ($) {
    "use strict";
    $(document).ready(function () {

        // GIVEN a weather dashboard with form inputs

        // WHEN I search for a city
        // THEN I am presented with current and future conditions for that city and that city is added to the search history
        // getCurrentWeatherInfo(query)
        // saveHistory(query) when city found
        // retrieveHistory(query) when city was previously found

        // WHEN I view current weather conditions for that city
        // THEN I am presented with the city name, the date, an icon representation of weather conditions, the temperature, the humidity, the wind speed, and the UV index
        // getCurrentWeatherInfo() => getCurrentUVInfo()

        // WHEN I view the UV index
        // THEN I am presented with a color that indicates whether the conditions are favorable, moderate, or severe
        // getCurrentWithUVAndForecast(query)
        // uvDecorator

        // WHEN I view future weather conditions for that city
        // THEN I am presented with a 5-day forecast that displays the date, an icon representation of weather conditions, the temperature, and the humidity
        // getCurrentWeatherWithForecast(query)

        // WHEN I click on a city in the search history
        // THEN I am again presented with current and future conditions for that city
        // getSearchHistory()
        // getCurrentAndForecast(query)

        // WHEN I open the weather dashboard
        // THEN I am presented with the last searched city forecast

        var appid = "96404ebac51d984e233fe3941651e4ab";
        var weatherKey = "weatherHistory";

        $("#srchButton").click(function (index, element) {
            var query = $("#cityInput").val().trim();
            OnSearch(query);
        });

        //for dynamically generated elements jquery needs to use .on('click', 'li', function () {})
        $("ul.cities").on("click", "li", function () {
            var query = $(this).html();
            OnSearch(query);
        });

        $("#cityInput").keypress(function (event) {
            if (event.which == 13) {

                var query = $("#cityInput").val().trim();
                OnSearch(query);
            }
        });

        function updateSearchHistory() {
            var cities = storageService.getHistory();

            $("ul.cities").empty();

            cities.reverse().forEach((city, index) => {
                $("ul.cities").append(`<li class="city-history list-group-item">${city.Name}</li>`);
            });

            // var lastCity = storageService.getLastCity();
        }

        function uviCalc(value) {
            var decorator = '';

            if (value >= 0 && value < 3) {
                //green
                decorator = 'bg-success';
            } else if (value >= 3 && value < 5) {
                //yellow
                decorator = 'bg-warning';
            } else if (value >= 5 && value < 7) {
                //orange
                decorator = 'bg-orange';
            } else if (value >= 7 && value < 11) {
                //red
                decorator = 'bg-danger';
            } else if (value >= 11) {
                //violet
                decorator = 'bg-violet';
            }

            return decorator;
        };

        function updateWeatherInfoView(weatherInfo) {
            var icon_href = `https://openweathermap.org/img/wn/${weatherInfo.current.weather[0].icon}@2x.png`;

            $("#icon").attr("src", icon_href)
            $("#city").html(weatherInfo.current.name);
            $("#date").html(moment().format('MM/DD/YYYY'));
            $("#temp").html(weatherInfo.forecast.current.temp);
            $("#humidity").html(weatherInfo.forecast.current.humidity);
            $("#windSpeed").html(weatherInfo.forecast.current.wind_speed);

            $("#uvIndex").html(weatherInfo.forecast.current.uvi);
            $("#uvIndex").removeClass('bg-success bg-warning bg-orange bg-danger bg-violet');
            var indexClass = uviCalc(weatherInfo.forecast.current.uvi);
            $("#uvIndex").addClass(indexClass);

            $(".forecast").html('');

            // Learned how .foreach()
            // for(var index = 0; index < weatherInfo.forecast.daily.length; index++)
            // { }

            weatherInfo.forecast.daily.forEach( (daily, index) => {
                //don't print the current day or any day after 5 days
                // if (index == 0 || index > 5)
                if (index > 4)
                    return;

                var html = htmlTemplate(moment().add('days', index + 1).format('MM/DD/YYYY'), daily.weather[0].icon, daily.weather[0].description, daily.temp.day, daily.humidity);

                $(".forecast").append(html);

            });
            //console.log('WeatherInfo: ', weatherInfo);
        }

        function htmlTemplate(date, icon, description, temp, humidity) {
            //`` allows me to accomplish javascript string interpolation
            var template = `
                <div class="card text-white bg-primary ml-4 mb-3" style="max-width: 12rem;">
                    <div class="card-body">
                        <h5 class="card-title">${date}</h5>
                        <p class="card-text"><img src="https://openweathermap.org/img/wn/${icon}@2x.png"></p>
                        <p class="card-text"><span>${description}</span></p>
                        <p class="card-text">Temp: <span>${temp}</span>&nbsp;&deg;F</p>
                        <p class="card-text">Humidity: <span>${humidity}</span>&nbsp;%</p>
                    </div>
                </div>
            `;

            return template;

        }

        //reset local storage
        //localStorage.setItem(weatherKey, null);
        
        function addCityToHistory(city) {
            var history = getHistory() ?? [];

            if (history.filter(e => e.Id == city.Id && e.Name == city.Name).length == 0) {

                //Add new city to object array
                history.push(city);

                //update local storage with new array
                localStorage.setItem(weatherKey, JSON.stringify(history));
            }
        }

        function getHistory() {
            var history = JSON.parse(localStorage.getItem(weatherKey));

            if (!history) {
                history = [];
            }

            return history;
        }

        function getLastCity() {
            var cities = getHistory();
            return cities[cities.length - 1];
        }

        var storageService = {
            saveToHistory: addCityToHistory,
            getHistory: getHistory,
            getLastCity: getLastCity
        }

        var weatherService = {
            getCurrentWeatherInfo: getCurrentWeatherInfo,
            getCurrentUVInfo: getCurrentUVInfo,
            get5DayWeatherForecast: get5DayWeatherForecast
        }

        function OnLoad() {
            /* load and display all cities queried */
            updateSearchHistory();

            /* load and display weather info for last city */
            var lastCity = storageService.getLastCity();

            if (lastCity) {
                $('.results').removeClass("d-none");
                OnSearch(lastCity.Name);
            }

        }

        function OnSearch(query) {
            if (!query) {
                alert('Please enter a valid city!');
                return;
            }

            getCurrentWeatherWithForecast(query);
        }

        function getCurrentWeatherWithForecast(query) {
            weatherService.getCurrentWeatherInfo(query, function (weatherResponse) {

                var weatherInfo = weatherResponse;

                if (weatherInfo.cod !== 200) {
                    alert(weatherInfo.messsage);
                    return;
                }

                weatherService.get5DayWeatherForecast(weatherInfo.coord.lat, weatherInfo.coord.lon, function (forecastResponse) {
                    var forecastInfo = forecastResponse;

                    var weather = {
                        current: weatherInfo,
                        forecast: forecastInfo
                    }

                    //save searched city
                    storageService.saveToHistory(
                        {
                            Id: weather.current.id,
                            Name: weather.current.name
                        }
                    );

                    //refresh search history view
                    updateSearchHistory();

                    //update weather information for matched city
                    updateWeatherInfoView(weather);

                    $('.results').removeClass("d-none");


                }, function (error) {
                    alert('Unable to get forecast information for: ', query);
                });
            }, function (error) {
                alert('Unable to get weather information for: ', query);
            });
        }

        function getCurrentWeatherInfo(query, success, error) {
            //api.openweathermap.org/data/2.5/weather?q={city name},{state code}&appid={your api key}

            var url = `https://api.openweathermap.org/data/2.5/weather?appid=${appid}&q=${query}`;

            return apiConnect(url, success, error);
        }

        function getCurrentUVInfo(lat, lon, success, error) {
            //api.openweathermap.org/data/2.5/uvi?lat=37.75&lon=-122.37

            var url = `https://api.openweathermap.org/data/2.5/uvi?appid=${appid}&lat=${lat}&lon=${lon}`;

            return apiConnect(url, success, error);
        }

        function get5DayWeatherForecast(lat, lon, success, error) {
            //api.openweathermap.org/data/2.5/onecall?appid=96404ebac51d984e233fe3941651e4ab&exclude=hourly,minutely&units=imperial&lat=33.75&lon=-84.39

            var url = `https://api.openweathermap.org/data/2.5/onecall?appid=${appid}&exclude=hourly,minutely&units=imperial&lat=${lat}&lon=${lon}`;

            return apiConnect(url, success, error);
        }

        function apiConnect(endpoint, successCallback, errorCallback) {
            $.ajax(
                {
                    dataType: "json",
                    url: endpoint,
                    type: "GET",
                    success: function (data) {
                        //console.log('Weather API connected {Success}-- Endpoint: ', endpoint, 'Response data:', data);

                        if (successCallback) {
                            successCallback(data);
                        }
                    },
                    error: function (error) {
                        //console.log('Weather API connected {Error}-- Endpoint: ', endpoint, 'Error:', error);

                        if (errorCallback) {
                            errorCallback(error);
                        }
                    }
                }
            );
        }

        OnLoad();

    });
})(window.jQuery);