// API key for OpenWeatherMap
const apiKey = ""; 
        
// DOM elements
const cityInput = document.getElementById("city-input");
const searchButton = document.getElementById("search-button");
const weatherContainer = document.getElementById("weather-container");

// Event listeners
searchButton.addEventListener("click", searchWeather);
cityInput.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        searchWeather();
    }
});

// Function to search weather data
function searchWeather() {
    const city = cityInput.value.trim();
    
    if (city === "") {
        showError("Please enter a city name");
        return;
    }
    
    showLoading();
    fetchWeatherData(city);
}

// Function to fetch weather data
async function fetchWeatherData(city) {
    try {
        // Fetch current weather
        const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
        const currentWeatherResponse = await fetch(currentWeatherUrl);
        
        if (!currentWeatherResponse.ok) {
            throw new Error("City not found or API error");
        }
        
        const currentWeatherData = await currentWeatherResponse.json();
        
        // Fetch 5-day forecast
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;
        const forecastResponse = await fetch(forecastUrl);
        
        if (!forecastResponse.ok) {
            throw new Error("Error fetching forecast data");
        }
        
        const forecastData = await forecastResponse.json();
        
        // Display the data
        displayWeatherData(currentWeatherData, forecastData);
        
    } catch (error) {
        showError(error.message);
    }
}

// Function to display weather data
function displayWeatherData(currentData, forecastData) {
    // Format current date
    const currentDate = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = currentDate.toLocaleDateString("en-US", options);
    
    // Extract current weather info
    const cityName = currentData.name;
    const country = currentData.sys.country;
    const temperature = Math.round(currentData.main.temp);
    const feelsLike = Math.round(currentData.main.feels_like);
    const weatherDescription = currentData.weather[0].description;
    const weatherIcon = currentData.weather[0].icon;
    const humidity = currentData.main.humidity;
    const windSpeed = currentData.wind.speed;
    const pressure = currentData.main.pressure;
    const visibility = (currentData.visibility / 1000).toFixed(1);
    
    // Create HTML for current weather
    let html = `
        <div class="current-weather weather-card">
            <h2>${cityName}, ${country}</h2>
            <p>${formattedDate}</p>
            <div class="weather-info">
                <img src="https://openweathermap.org/img/wn/${weatherIcon}@2x.png" alt="${weatherDescription}" class="weather-icon">
                <div class="temperature">${temperature}°C</div>
                <p>${weatherDescription.charAt(0).toUpperCase() + weatherDescription.slice(1)}</p>
                <p>Feels like: ${feelsLike}°C</p>
            </div>
            <div class="details">
                <div class="detail-item">
                    <span class="detail-label">Humidity</span>
                    <span class="detail-value">${humidity}%</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Wind Speed</span>
                    <span class="detail-value">${windSpeed} m/s</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Pressure</span>
                    <span class="detail-value">${pressure} hPa</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Visibility</span>
                    <span class="detail-value">${visibility} km</span>
                </div>
            </div>
        </div>
        <h2 class="forecast-title">5-Day Forecast</h2>
    `;
    
    // Process forecast data - get one forecast per day
    const forecastMap = new Map();
    
    forecastData.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const day = date.toLocaleDateString('en-US', { weekday: 'long' });
        
        // Only take the noon forecast (around 12:00) for each day
        const hour = date.getHours();
        
        if (hour >= 11 && hour <= 13) {
            if (!forecastMap.has(day)) {
                forecastMap.set(day, item);
            }
        }
    });
    
    // Convert map to array and take only 5 days
    const forecastList = Array.from(forecastMap.values()).slice(0, 5);
    
    // Generate forecast HTML
    forecastList.forEach(forecast => {
        const date = new Date(forecast.dt * 1000);
        const day = date.toLocaleDateString('en-US', { weekday: 'long' });
        const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const temp = Math.round(forecast.main.temp);
        const description = forecast.weather[0].description;
        const icon = forecast.weather[0].icon;
        
        html += `
            <div class="weather-card forecast-card">
                <div class="forecast-date">${day}, ${formattedDate}</div>
                <img src="https://openweathermap.org/img/wn/${icon}.png" alt="${description}">
                <div class="forecast-temp">${temp}°C</div>
                <div>${description.charAt(0).toUpperCase() + description.slice(1)}</div>
            </div>
        `;
    });
    
    weatherContainer.innerHTML = html;
}

// Function to show error message
function showError(message) {
    weatherContainer.innerHTML = `
        <div class="error-message">
            <p>${message}</p>
        </div>
    `;
}

// Function to show loading spinner
function showLoading() {
    weatherContainer.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>Loading weather data...</p>
        </div>
    `;
}