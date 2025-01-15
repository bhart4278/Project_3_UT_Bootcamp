// Check if Leaflet is loaded
if (typeof L === 'undefined') {
  console.error("Leaflet library is not loaded.");
} else {
  const url = 'https://earthquake.usgs.gov/fdsnws/event/1/query.geojson?starttime=1975-01-01%2000:00:00&endtime=2025-01-10%2023:59:59&maxlatitude=50&minlatitude=24.6&maxlongitude=-65&minlongitude=-125&minmagnitude=4.5&orderby=time';

  // Fetch earthquake data
  fetch(url)
      .then(response => response.json())
      .then(data => {
          console.log("Earthquake data loaded");

          // Initialize Leaflet map, setting bounds to Conterminous U.S.
          const map = L.map('map').setView([37.7749, -122.4194], 5);  // Set initial map position

          // Restrict the map to the bounds of the Conterminous U.S.
          const usBounds = [
              [24.396308, -125.0], // SW corner (latitude, longitude)
              [49.384358, -66.93457] // NE corner (latitude, longitude)
          ];
          map.setMaxBounds(usBounds);

          // Add CartoDB Positron tile layer for a clean map style
          L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
              attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CartoDB</a>',
              maxZoom: 19
          }).addTo(map);

          // Depth colors for the legend
          const depthColors = ["lightgreen", "yellow", "gold", "orange", "darkorange", "red"];
          const depthCategories = ['-10 to 10', '10 to 30', '30 to 50', '50 to 70', '70 to 90', '90+'];

          // Create the legend for earthquake depths
          function createLegend() {
              let legend = L.control({ position: 'bottomright' });
              legend.onAdd = function () {
                  var div = L.DomUtil.create('div', 'info legend');
                  var labels = ["<div style='background-color: lightgray'><strong>Depth (km)</strong></div>"];

                  for (var i = 0; i < depthCategories.length; i++) {
                      labels.push(
                          '<li class="circle" style="background-color:' + depthColors[i] + '">' + depthCategories[i] + '</li>'
                      );
                  }

                  div.innerHTML = '<ul style="list-style-type:none; text-align: center; font-size: 14px;">' + labels.join('') + '</ul>';
                  return div;
              };
              legend.addTo(map); // Add the legend to the map
          }

          // Call createLegend() to display the legend
          createLegend();

          // Variables to store earthquake information for charts
          const markers = [];  // Store references to markers for later use

          // Loop through each earthquake event in the fetched data
          data.features.forEach(feature => {
              const coords = feature.geometry.coordinates;
              const magnitude = feature.properties.mag;
              const place = feature.properties.place;
              const time = new Date(feature.properties.time);
              const timeStr = time.toLocaleString();

              // Get depth and assign color based on depth
              const depth = coords[2];
              let color;
              if (depth <= 10) color = depthColors[0];
              else if (depth <= 30) color = depthColors[1];
              else if (depth <= 50) color = depthColors[2];
              else if (depth <= 70) color = depthColors[3];
              else if (depth <= 90) color = depthColors[4];
              else color = depthColors[5];

              // Add marker to map
              const marker = L.circleMarker([coords[1], coords[0]], {
                  color: color,
                  radius: getMagnitudeSize(magnitude),
                  fillOpacity: 0.6
              })
              .bindPopup(`<strong>${place}</strong><br>Magnitude: ${magnitude}<br>Time: ${timeStr}<br>Depth: ${depth} km`)
              .addTo(map);

              // Store marker in the array with associated earthquake data
              markers.push({ marker, place, magnitude, coords });
          });

          // Helper function to get size based on magnitude
          function getMagnitudeSize(magnitude) {
              return magnitude * 2;
          }

          // Dynamically populate the year filter dropdown
          const yearFilter = document.getElementById('year-filter');
          const years = new Set(data.features.map(feature => new Date(feature.properties.time).getFullYear()));

          years.forEach(year => {
              const option = document.createElement('option');
              option.value = year;
              option.textContent = year;
              yearFilter.appendChild(option);
          });

          // Select the magnitude slider and the span element where the magnitude value will be displayed
          const magnitudeSlider = document.getElementById('magnitude-filter');
          const magnitudeValue = document.getElementById('magnitude-value');

          // Event listener to update the displayed value whenever the slider is moved
          magnitudeSlider.addEventListener('input', function() {
              const selectedMagnitude = magnitudeSlider.value; // Get the current value of the slider
              magnitudeValue.textContent = selectedMagnitude;  // Update the text of the span element
          });

          // Function to filter data based on selected year and magnitude
          function filterData(selectedYear, selectedMagnitude) {
              const filteredData = data.features.filter(feature => {
                  const year = new Date(feature.properties.time).getFullYear();
                  const magnitude = feature.properties.mag;

                  return (selectedYear === 'all' || selectedYear == year) &&
                         (magnitude >= selectedMagnitude);
              });

              // Clear existing markers
              markers.forEach(({ marker }) => map.removeLayer(marker));
              markers.length = 0; // Reset markers array

              // Loop through filtered data and re-add markers and plots
              filteredData.forEach(feature => {
                  const coords = feature.geometry.coordinates;
                  const magnitude = feature.properties.mag;
                  const place = feature.properties.place;
                  const time = new Date(feature.properties.time);
                  const timeStr = time.toLocaleString();

                  // Add marker to map
                  const marker = L.circleMarker([coords[1], coords[0]], {
                      color: getMagnitudeColor(magnitude),
                      radius: getMagnitudeSize(magnitude),
                      fillOpacity: 0.6
                  })
                  .bindPopup(`<strong>${place}</strong><br>Magnitude: ${magnitude}<br>Time: ${timeStr}`)
                  .addTo(map);

                  markers.push({ marker, place, magnitude, coords });
              });
          }

          // Add event listeners for the filters
          document.getElementById('year-filter').addEventListener('change', (event) => {
              const selectedYear = event.target.value;
              const selectedMagnitude = document.getElementById('magnitude-filter').value;
              filterData(selectedYear, selectedMagnitude);
          });

          document.getElementById('magnitude-filter').addEventListener('change', (event) => {
              const selectedMagnitude = event.target.value;
              const selectedYear = document.getElementById('year-filter').value;
              filterData(selectedYear, selectedMagnitude);
          });

      })
      .catch(error => console.error('Error fetching earthquake data:', error));