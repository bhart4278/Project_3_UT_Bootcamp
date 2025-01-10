// Fetch Earthquake data from USGS API
const url = 'https://earthquake.usgs.gov/fdsnws/event/1/query.geojson?starttime=1975-01-01%2000:00:00&endtime=2025-01-10%2023:59:59&maxlatitude=50&minlatitude=24.6&maxlongitude=-65&minlongitude=-125&minmagnitude=4.5&orderby=time';

fetch(url)
  .then(response => response.json())
  .then(data => {
    // Initialize Leaflet map
    const map = L.map('map').setView([37.7749, -122.4194], 5);  // Set initial map position

    // Add Tile Layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Variables to store earthquake information for chart
    const magnitudes = [];
    const times = [];
    const latitudes = [];
    const longitudes = [];

    // Loop through each earthquake event in the fetched data
    data.features.forEach(feature => {
      const coords = feature.geometry.coordinates;
      const magnitude = feature.properties.mag;
      const place = feature.properties.place;
      const time = new Date(feature.properties.time).toLocaleString();

      // Add marker to map
      L.circleMarker([coords[1], coords[0]], {
        color: getMagnitudeColor(magnitude),
        radius: getMagnitudeSize(magnitude),
        fillOpacity: 0.6
      })
      .bindPopup(`<strong>${place}</strong><br>Magnitude: ${magnitude}<br>Time: ${time}`)
      .addTo(map);

      // Collect data for plotting
      magnitudes.push(magnitude);
      times.push(time);
      latitudes.push(coords[1]);
      longitudes.push(coords[0]);
    });

    // Plot data in a chart
    const trace = {
      x: times,
      y: magnitudes,
      type: 'scatter',
      mode: 'lines+markers',
      name: 'Earthquake Magnitude Over Time',
      line: {color: 'blue'}
    };

    const layout = {
      title: 'Earthquake Magnitudes Over Time',
      xaxis: {title: 'Time'},
      yaxis: {title: 'Magnitude'},
      height: 400,
    };

    const dataForChart = [trace];
    Plotly.newPlot('chart', dataForChart, layout);

    // Function to get color based on magnitude
    function getMagnitudeColor(magnitude) {
      return magnitude >= 7 ? 'red' :
             magnitude >= 5 ? 'orange' :
             'green';
    }

    // Function to get size of circle marker based on magnitude
    function getMagnitudeSize(magnitude) {
      return magnitude * 2; // You can adjust the multiplier as needed
    }

  })
  .catch(error => console.error('Error fetching earthquake data:', error));