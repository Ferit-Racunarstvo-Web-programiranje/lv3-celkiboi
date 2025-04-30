function renderTable(weatherData) {
    const weatherTable = document.querySelector("#weatherTable");
    weatherTable.innerHTML = `
        <tr>
            <th>Temperature (°C)</th>
            <th>Humidity (%)</th>
            <th>Wind Speed (km/h)</th>
            <th>Precipitation (%)</th>
            <th>Cloud Cover</th>
            <th>Atmospheric Pressure</th>
            <th>UV Index</th>
            <th>Season</th>
            <th>Visibility (km)</th>
            <th>Location</th>
            <th>Weather Type</th>
        </tr>
    `;

    for (const weatherDataLine of weatherData) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${weatherDataLine["Temperature"]}</td>
            <td>${weatherDataLine["Humidity"]}</td>
            <td>${weatherDataLine["Wind Speed"]}</td>
            <td>${weatherDataLine["Precipitation (%)"]}</td>
            <td>${weatherDataLine["Cloud Cover"]}</td>
            <td>${weatherDataLine["Atmospheric Pressure"]}</td>
            <td>${weatherDataLine["UV Index"]}</td>
            <td>${weatherDataLine["Season"]}</td>
            <td>${weatherDataLine["Visibility (km)"]}</td>
            <td>${weatherDataLine["Location"]}</td>
            <td>${weatherDataLine["Weather Type"]}</td>
            <td>
                <button class="add-to-list" onClick=addToList("${weatherDataLine["ID"]}") >Add to selected data list</button>
            </td>
        `
        weatherTable.append(row);
    }
}

function addToList(ID) {
    const indexInList = selectedWeatherList.findIndex(weatherDataLine => weatherDataLine["ID"] === ID);
    if (indexInList !== -1) {
        return;
    }

    var selectedWeatherDataLine;
    for(const weatherDataLine of weatherData) {
        if (weatherDataLine["ID"] === ID) {
            selectedWeatherDataLine = weatherDataLine;
            break;
        }
    }
    selectedWeatherList.push(selectedWeatherDataLine);
    renderSelectedWeather();
}

function renderSelectedWeather() {
    const selectedWeatherTable = document.querySelector("#weatherListTable");
    selectedWeatherTable.innerHTML = `
        <tr>
            <th>Temperature (°C)</th>
            <th>Humidity (%)</th>
            <th>Wind Speed (km/h)</th>
            <th>Precipitation (%)</th>
            <th>Cloud Cover</th>
            <th>Atmospheric Pressure</th>
            <th>UV Index</th>
            <th>Season</th>
            <th>Visibility (km)</th>
            <th>Location</th>
            <th>Weather Type</th>
        </tr>
    `;

    for (const weatherDataLine of selectedWeatherList) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${weatherDataLine["Temperature"]}</td>
            <td>${weatherDataLine["Humidity"]}</td>
            <td>${weatherDataLine["Wind Speed"]}</td>
            <td>${weatherDataLine["Precipitation (%)"]}</td>
            <td>${weatherDataLine["Cloud Cover"]}</td>
            <td>${weatherDataLine["Atmospheric Pressure"]}</td>
            <td>${weatherDataLine["UV Index"]}</td>
            <td>${weatherDataLine["Season"]}</td>
            <td>${weatherDataLine["Visibility (km)"]}</td>
            <td>${weatherDataLine["Location"]}</td>
            <td>${weatherDataLine["Weather Type"]}</td>
            <td>
                <button class="add-to-list" onClick=removeFromList("${weatherDataLine["ID"]}") >Remove</button>
            </td>
        `
        selectedWeatherTable.append(row);
    }
}

function removeFromList(ID) {
    const indexToRemove = selectedWeatherList.findIndex(weatherDataLine => weatherDataLine["ID"] === ID);
    
    if (indexToRemove !== -1) {
        selectedWeatherList.splice(indexToRemove, 1);
        renderSelectedWeather();
    }
}

var weatherData;

var selectedWeatherList = [];

async function fetchWeatherData() {
    var weatherData;

    await fetch('weather_Small.csv')
    .then(res => res.text())
    .then(csv => {
        const result = Papa.parse(csv, {
        header: true,
        skipEmptyLines: true
        });

        weatherData = result.data.map(weatherDataLine => ({
                "Atmospheric Pressure": Number(weatherDataLine["Atmospheric Pressure"]),
                "Cloud Cover": weatherDataLine["Cloud Cover"],
                "ID": weatherDataLine["ID"],
                "Location": weatherDataLine["Location"],
                "Precipitation (%)": Number(weatherDataLine["Precipitation (%)"]),
                "Season": weatherDataLine["Season"],
                "Temperature": Number(weatherDataLine["Temperature"]),
                "UV Index": Number(weatherDataLine["UV Index"]),
                "Visibility (km)": Number(weatherDataLine["Visibility (km)"]),
                "Weather Type": weatherDataLine["Weather Type"],
                "Wind Speed": Number(weatherDataLine["Wind Speed"]),
                "Humidity": Number(weatherDataLine["Humidity"])
            })
        );
    });

    return weatherData;
}

function applyFilters() {
    const selectedSeason = document.querySelector('input[name="season"]:checked').value;
    const weatherType = document.querySelector('input[name="weather"]:checked').value;
    const tempMin = Number(document.getElementById('tempMinFilter').value);
    const tempMax = Number(document.getElementById('tempMinFilter2').value);

    document.getElementById('tempMinDisplay').textContent = tempMin;
    document.getElementById('tempMaxDisplay').textContent = tempMax;

    const filteredData = weatherData.filter(dataLine => {
        if (selectedSeason !== 'all' && dataLine['Season'] !== selectedSeason) {
            return false;
        }

        if (weatherType !== 'all' && dataLine['Weather Type'] !== weatherType) {
            return false;
        }

        if (dataLine['Temperature'] < tempMin || dataLine['Temperature'] > tempMax) {
            return false;
        }

        return true;
    });

    renderTable(filteredData);
}

function setupEventListeners() {
    document.querySelectorAll('input[name="season"]').forEach(radio => {
        radio.addEventListener('change', applyFilters);
    });
    
    document.querySelectorAll('input[name="weather"]').forEach(radio => {
        radio.addEventListener('change', applyFilters);
    });
    
    document.getElementById('tempMinFilter').addEventListener('input', applyFilters);
    document.getElementById('tempMinFilter2').addEventListener('input', applyFilters);
    
    document.getElementById('resetFilters').addEventListener('click', () => {
        document.querySelector('input[name="season"][value="all"]').checked = true;
        
        document.querySelector('input[name="weather"][value="all"]').checked = true;
        
        document.getElementById('tempMinFilter').value = -20;
        document.getElementById('tempMinFilter2').value = 40;
        
        applyFilters();
    });
}

addEventListener("DOMContentLoaded", async () => {
    setupEventListeners();
    weatherData = await fetchWeatherData();
    weatherData = weatherData.slice(0, 100);
    renderTable(weatherData);
});