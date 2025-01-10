const url = 'https://earthquake.usgs.gov/fdsnws/event/1/query.geojson?starttime=1975-01-01%2000:00:00&endtime=2025-01-10%2023:59:59&maxlatitude=50&minlatitude=24.6&maxlongitude=-65&minlongitude=-125&minmagnitude=4.5&orderby=time';

fetch(url)
  .then(response => response.json())
  .then(data => {
    // Initialize Leaflet map
    const map = L.map('map').setView([37.7749, -122.4194], 5);  // Set initial map position
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Variables to store earthquake information for charts
    const magnitudes = [];
    const times = [];
    const latitudes = [];
    const longitudes = [];
    const topEarthquakes = [];
    const earthquakesPerMonth = {};
    
    // Loop through each earthquake event in the fetched data
    data.features.forEach(feature => {
      const coords = feature.geometry.coordinates;
      const magnitude = feature.properties.mag;
      const place = feature.properties.place;
      const time = new Date(feature.properties.time);
      const timeStr = time.toLocaleString();
      const monthYear = `${time.getMonth() + 1}-${time.getFullYear()}`;

      // Add marker to map
      L.circleMarker([coords[1], coords[0]], {
        color: getMagnitudeColor(magnitude),
        radius: getMagnitudeSize(magnitude),
        fillOpacity: 0.6
      })
      .bindPopup(`<strong>${place}</strong><br>Magnitude: ${magnitude}<br>Time: ${timeStr}`)
      .addTo(map);

      // Collect data for plotting
      magnitudes.push(magnitude);
      times.push(timeStr);
      latitudes.push(coords[1]);
      longitudes.push(coords[0]);

      // Collect top earthquakes by magnitude
      topEarthquakes.push({ place, magnitude, time: timeStr });

      // Track number of earthquakes per month
      earthquakesPerMonth[monthYear] = (earthquakesPerMonth[monthYear] || 0) + 1;
    });

    // Sort and get top 20 earthquakes by magnitude
    topEarthquakes.sort((a, b) => b.magnitude - a.magnitude);
    const top20Earthquakes = topEarthquakes.slice(0, 20);

    // Plot magnitude chart over time
    const magnitudeTrace = {
      x: times,
      y: magnitudes,
      type: 'scatter',
      mode: 'lines+markers',
      name: 'Earthquake Magnitude Over Time',
      line: {color: 'blue'}
    };

    const magnitudeLayout = {
      title: 'Earthquake Magnitudes Over Time',
      xaxis: {title: 'Time'},
      yaxis: {title: 'Magnitude'},
      height: 400,
    };

    const magnitudeData = [magnitudeTrace];
    Plotly.newPlot('chart-time', magnitudeData, magnitudeLayout);

    // Plot Top 20 Earthquakes by Magnitude (Bar Chart)
    const topEarthquakesTrace = {
      x: top20Earthquakes.map(eq => eq.place),
      y: top20Earthquakes.map(eq => eq.magnitude),
      type: 'bar',
      name: 'Top 20 Earthquakes',
      marker: {color: 'red'}
    };

    const topEarthquakesLayout = {
      title: 'Top 20 Earthquakes by Magnitude',
      xaxis: {title: 'Place'},
      yaxis: {title: 'Magnitude'},
      height: 400,
    };

    const topEarthquakesData = [topEarthquakesTrace];
    Plotly.newPlot('chart-magnitude', topEarthquakesData, topEarthquakesLayout);

    // Plot number of earthquakes per month (Bar Chart)
    const months = Object.keys(earthquakesPerMonth);
    const earthquakeCount = Object.values(earthquakesPerMonth);

    const monthTrace = {
      x: months,
      y: earthquakeCount,
      type: 'bar',
      name: 'Earthquakes Per Month',
      marker: {color: 'green'}
    };

    const monthLayout = {
      title: 'Number of Earthquakes Per Month',
      xaxis: {title: 'Month-Year'},
      yaxis: {title: 'Number of Earthquakes'},
      height: 400,
    };

    const monthData = [monthTrace];
    Plotly.newPlot('chart-time', monthData, monthLayout);

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