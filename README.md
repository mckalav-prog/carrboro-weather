# Carrboro Weather Dashboard

An interactive, live weather forecasting web application based on the visual design in `display.png`.

## Features

- **Pixel-Accurate Visual Design**: Replicates the layout, typography, pill-shaped heatmap bars, and brushed metal background from `display.png`.
- **Dual Operating Modes**:
  - **📸 Snapshot Mode**: Displays the exact values and colors extracted from `display.png`.
  - **☀️ Live Forecast Mode**: Connects directly to the Open-Meteo weather API for real-time Carrboro, NC weather and 5-day forecasts.
  - **⏱️ Hourly Forecast Views**: Toggle between 24-hour and 48-hour timelines.
- **Dynamic Heatmap Color Ramps**:
  - Temperature (°F / °C)
  - Humidity (%)
  - Precipitation Chance (%)
  - Daylight Hours
  - Cloud Cover (%)
- **Interactive Tooltip & Inspector**: Hover over any column to see all metrics for that time period with weather icons and descriptions.
- **Global City Search**: Search any city or town worldwide with geocoding autocomplete.
- **Unit Switching**: Seamlessly toggle between Fahrenheit (°F) and Celsius (°C).
- **Zero Heavy Dependencies**: Built with pure Python 3 standard library backend and vanilla modern ES6+/CSS3.

## Running the App

Run the launcher script:
```bash
/home/grospner/carrboro-weather/run.sh
```

Or manually:
```bash
python3 /home/grospner/carrboro-weather/server.py 8080
```
Then visit [http://localhost:8080](http://localhost:8080) in your browser.
