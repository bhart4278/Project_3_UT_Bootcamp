const url = 'https://earthquake.usgs.gov/fdsnws/event/1/query.geojson?starttime=1975-01-01%2000:00:00&endtime=2025-01-10%2023:59:59&maxlatitude=50&minlatitude=24.6&maxlongitude=-65&minlongitude=-125&minmagnitude=4.5&orderby=time';

    fetch(url)
      .then(response => response.json())
      .then(data => {
        // Initialize Leaflet map, setting bounds to Conterminous U.S.
        const map = L.map('map').setView([37.7749, -122.4194], 5);  // Set initial map position

        // Restrict the map to the bounds of the Conterminous U.S.
        const usBounds = [
          [24.396308, -125.0], // SW corner (latitude, longitude)
          [49.384358, -66.93457] // NE corner (latitude, longitude)
        ];
        map.setMaxBounds(usBounds);

        // Add CartoDB Positron tile layer for a clean map style
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CartoDB</a>',
          maxZoom: 19
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
          name: 'Magnitude Over Time',  // Legend label
          line: {color: 'blue'}
        };

        const magnitudeLayout = {
          title: 'Earthquake Magnitudes Over Time',
          xaxis: {title: 'Time'},
          yaxis: {title: 'Magnitude'},
          height: 400,
          showlegend: true, // Enable legend
        };

        const magnitudeData = [magnitudeTrace];
        Plotly.newPlot('chart-time', magnitudeData, magnitudeLayout);

        // Plot Top 20 Earthquakes by Magnitude (Bar Chart)
        const topEarthquakesTrace = {
          x: top20Earthquakes.map(eq => eq.place),
          y: top20Earthquakes.map(eq => eq.magnitude),
          type: 'bar',
          name: 'Top 20 Earthquakes',  // Legend label
          marker: {color: 'red'}
        };

        const topEarthquakesLayout = {
          title: 'Top 20 Earthquakes by Magnitude',
          xaxis: {title: 'Place'},
          yaxis: {title: 'Magnitude'},
          height: 400,
          showlegend: true, // Enable legend
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
          name: 'Earthquakes Per Month',  // Legend label
          marker: {color: 'green'}
        };

        const monthLayout = {
          title: 'Number of Earthquakes Per Month',
          xaxis: {title: 'Month-Year'},
          yaxis: {title: 'Number of Earthquakes'},
          height: 400,
          showlegend: true, // Enable legend
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