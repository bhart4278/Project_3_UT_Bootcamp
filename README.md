# Project_3_UT_Bootcamp

**Group 4 Members: Oana Wright, Brian Hart, Rogelio Cardenas, Adam Butcher**

## Project Overview and How to Use the Dashboard

**Project Description**
  - This project is a dynamic web-based application designed to visualize earthquake data using a map and filtering options. If consists of collecting, processing, and visualizing earthquake data from the USGS (United States Geological Survey) GeoJSON service. The dataset includes earthquakes with a magnitude of 4.5 or higher occurring in the Conterminous U.S. region between January 1, 1975, and present day (live updates). The data was fetched, processed, and visualized using Python, JavaScript, and popular visualization libraries. Instructions on how to use the dashboard can be found in each visualizations corresponding sub-section below.


**Data Processing Worklflow**

- Fetching and Processing Data with Python:

  - The data was fetched from the URL and processed using the pandas library.

  - A DataFrame was created to organize the data for easier manipulation and analysis.

  - The processed DataFrame was saved as a JSON file for further use and reference.

- Visualization with JavaScript:

  - The JSON file was integrated into a JavaScript application for visualization purposes.

  - Using libraries such as Leaflet.js, Plotly.js, and D3.js, the earthquake data was represented through interactive maps and charts.

### Visualizations

**1. Interactive Map with Leaflet.js**

<img width="734" alt="Screenshot 2025-01-20 at 2 22 12 PM" src="https://github.com/user-attachments/assets/d055b961-e551-4225-92c9-60e8bb98c5e4" />

  - Overview: An interactive map was built to display earthquake locations.

  - Features:

    - Markers represent earthquake events, color-coded by magnitude (light blue for mild, dark blue for moderate, orange for severe).
    - You can zoom in and out on the map to get a closer look.

    - Each marker can be clicked on and includes a popup displaying the earthquake's magnitude, location, and time.

    - The map is styled using the CartoDB Dark base layer and restricted to the Conterminous U.S. bounds.
   
**2. Top 20 Earthquakes Bar Chart**

![Screenshot 2025-01-20 at 2 24 53 PM](https://github.com/user-attachments/assets/daaa8e50-c963-457b-abc8-30f3c8cec0cb)

- Overview: A bar chart visualizes the top 20 earthquakes by magnitude.

- Features:

  - Earthquakes are sorted by magnitude, with the highest magnitudes shown first.

  - Hovering over a bar displays detailed earthquake information.

  - Clicking on a bar zooms the map to the respective earthquake location.

**3. Monthly Trends Line CHart**

![Screenshot 2025-01-20 at 2 24 40 PM](https://github.com/user-attachments/assets/cfd7ef99-ff5f-4262-ad8d-adab0d911364)

- Overview: A line chart displays earthquake trends over time, grouped by year and month.

- Features:

  - Each line represents the number of earthquakes occurring in a specific year.

  - A dynamic legend allows toggling visibility for specific years.

  - The chart is color-coded and interactive, providing insights into seasonal trends and annual changes.

**4. Magnitude Distribution Pie Chart**

![Screenshot 2025-01-20 at 2 24 14 PM](https://github.com/user-attachments/assets/e0fc0023-5e04-44d9-8c6d-148ead560c87)

- Overview: A pie chart that displays the distribution of Earthquakes grouped by magnitude ranges.

- Features:

  - Earthquakes are distributed into ranges (|<5|, |5-6|, |6-7|, & |>=7|). A healthy majority of earthquakes fall under 5 in magnitude.
 
  - Hovering over a section displays how many earthquakes are in that magnitude range.
 
  - A legend noting the magnitude ranges.

### Additional Features

**FIlters**

  - A dropdown filter enables users to view earthquakes for a specific year.

  - A slider allows filtering earthquakes by minimum magnitude.

**Dynamic Map Interaction**

  - Clicking on a bar in the Top 20 Earthquakes chart pans and zooms the map to the corresponding earthquake's location.
  - Earthquake markers are dynamically updated based on the selected filters.

### Technolgy Stack

**Data Processing:**

  - Python

  - Pandas

**Frontend and Visualization:**

  - JavaScript

  - Leaflet.js (Map visualization)

  - Plotly.js (Charts)

  - D3.js (Data manipulation)

  - Chart.js (Pie Chart)





## Ethical Considerations

- In the development of this earthquake visualization project, several ethical considerations were made to ensure the responsible use and presentation of data. The project primarily focuses on providing accurate and transparent earthquake data sourced directly from the United States Geological Survey (USGS), a trusted authority in seismic activity monitoring. The data is presented in a clear, accessible format that allows users to explore important geophysical information without distortion.

  Efforts were made to include informative legends and interactive features, helping users interpret the data in context. Furthermore, the map design was intended to prioritize usability, ensuring it could be easily navigated by diverse audiences, including those with limited technical knowledge. Additionally, the project respects privacy by using publicly available data, and no personal or sensitive information is collected or shared. Lastly, the project aims to educate users about seismic risks and promote awareness about earthquake preparedness, fostering responsible civic engagement in understanding natural disasters.

## References

### Data Sources



The data was retrieved using the following GeoJSON URL: https://earthquake.usgs.gov/fdsnws/event/1/query.geojson?starttime=1975-01-01%2000:00:00&endtime=2025-01-10%2023:59:59&maxlatitude=50&minlatitude=24.6&maxlongitude=-65&minlongitude=-125&minmagnitude=4.5&orderby=time

This dataset contains:

  - Magnitude of the earthquakes.

  - Geographic coordinates (latitude and longitude).

  - Place and time of occurrence.

  - Other metadata related to each earthquake event.
