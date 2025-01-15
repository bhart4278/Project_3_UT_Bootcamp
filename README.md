# Project_3_UT_Bootcamp

**Group 4 Members: Oana Wright, Brian Hart, Rogelio Cardenas, Adam Butcher**

## Project Overview

**Project Description**
  - This project focuses on collecting, processing, and visualizing earthquake data from the USGS (United States Geological Survey) GeoJSON service. The dataset includes earthquakes with a magnitude of 4.5 or higher occurring in the Conterminous U.S. region between January 1, 1975, and January 10, 2025. The data was fetched, processed, and visualized using Python, JavaScript, and popular visualization libraries.

**Data Source**

The data was retrieved using the following GeoJSON URL: https://earthquake.usgs.gov/fdsnws/event/1/query.geojson?starttime=1975-01-01%2000:00:00&endtime=2025-01-10%2023:59:59&maxlatitude=50&minlatitude=24.6&maxlongitude=-65&minlongitude=-125&minmagnitude=4.5&orderby=time

This dataset contains:

  - Magnitude of the earthquakes.

  - Geographic coordinates (latitude and longitude).

  - Place and time of occurrence.

  - Other metadata related to each earthquake event.

**Data Processing Worklflow**

- Fetching and Processing Data with Python:

  - The data was fetched from the URL and processed using the pandas library.

  - A DataFrame was created to organize the data for easier manipulation and analysis.

  - The processed DataFrame was saved as a JSON file for further use and reference.

- Visualization with JavaScript:

  - The JSON file was integrated into a JavaScript application for visualization purposes.

  - Using libraries such as Leaflet.js, Plotly.js, and D3.js, the earthquake data was represented through interactive maps and charts.

## How to Use the Dashboard

## Ethical Considerations

## References

### Data Soucres
