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
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
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
    const markers = [];  // Store references to markers for later use

    // Loop through each earthquake event in the fetched data
    data.features.forEach(feature => {
      const coords = feature.geometry.coordinates;
      const magnitude = feature.properties.mag;
      const place = feature.properties.place;
      const time = new Date(feature.properties.time);
      const timeStr = time.toLocaleString();
      const monthYear = `${time.getMonth() + 1}-${time.getFullYear()}`;

      // Add marker to map
      const marker = L.circleMarker([coords[1], coords[0]], {
        color: getMagnitudeColor(magnitude),
        radius: getMagnitudeSize(magnitude),
        fillOpacity: 0.6
      })
      .bindPopup(`<strong>${place}</strong><br>Magnitude: ${magnitude}<br>Time: ${timeStr}`)
      .addTo(map);

      // Store marker in the array with associated earthquake data
      markers.push({ marker, place, magnitude, coords });

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

    // Plot Top 20 Earthquakes by Magnitude (Bar Chart)
    const topEarthquakesTrace = {
      x: top20Earthquakes.map(eq => eq.place),
      y: top20Earthquakes.map(eq => eq.magnitude),
      type: 'bar',
      name: 'Top 20 Earthquakes',  // Legend label
      marker: {
        color: 'rgba(255, 0, 0, 0.5)', // Transparent red color
        line: {color: 'white', width: 2} // White border
      }
    };

    const topEarthquakesLayout = {
      title: {
        text: 'Top 20 Earthquakes by Magnitude' +
          '<br>' + 
          '<span style="font-size: 12px;">*click on any bar to see the earthquake on map</span>',
        font: {color: '#40E0D0'}  // Light turquoise title color
      },
      xaxis: {
        tickfont: { color: 'white' } // Change tick label color to white
      },
      yaxis: {
        title: {
          text: 'Magnitude',
          font: {color: '#40E0D0'}  // Light turquoise axis title color
        }
      },
      height: 400,
      plot_bgcolor: 'rgba(0, 0, 0, 0)', // Clear background
      paper_bgcolor: 'rgba(0, 0, 0, 0)', // Clear background
    };

    const topEarthquakesData = [topEarthquakesTrace];
    Plotly.newPlot('chart-magnitude', topEarthquakesData, topEarthquakesLayout);

    
        // Group earthquakes by year and month
const earthquakesByYearMonth = {};

// Loop through each earthquake to group by year and month
data.features.forEach(feature => {
  const time = new Date(feature.properties.time);
  const year = time.getFullYear();
  const month = time.getMonth(); // 0-based (Jan = 0, Feb = 1, ..., Dec = 11)

  if (!earthquakesByYearMonth[year]) {
    earthquakesByYearMonth[year] = Array(12).fill(0); // Initialize array for 12 months
  }
  
  earthquakesByYearMonth[year][month] += 1; // Increment earthquake count for that month
});

// Prepare data for plotting
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const traces = [];

Object.keys(earthquakesByYearMonth).forEach(year => {
  const yData = earthquakesByYearMonth[year]; // Earthquake counts for each month of the year

  traces.push({
    x: months,        // X-axis: months
    y: yData,         // Y-axis: number of earthquakes for that year
    type: 'scatter',  // Line chart
    mode: 'lines+markers',
    name: year,       // Name of the line (the year)
    line: {
      shape: 'linear',
      width: 3
    },
    marker: {
      size: 6
    },
    visible: true  // All lines are visible by default (can toggle in the legend)
  });
});

// Layout for the chart
const layout = {
  title: {
    text: 'Earthquake Trends by Year' +
    '<br>' + 
    '<span style="font-size: 12px;">*click on any year in the legend to see that year_s trend</span>',
    font: { color: '#40E0D0' } // Title color
  },
  xaxis: {
    title: {
      text: 'Month',
      font: { color: '#40E0D0' } // Axis title color
    },
    tickangle: 45, // Rotate tick labels for better readability
    tickfont: {
      color: 'white' // Tick mark label color
    }
  },
  yaxis: {
    title: {
      text: 'Number of Earthquakes',
      font: { color: '#40E0D0' } // Axis title color
    }
  },
  height: 400,
  plot_bgcolor: 'rgba(0, 0, 0, 0)', // Transparent background
  paper_bgcolor: 'rgba(0, 0, 0, 0)', // Transparent background
  showlegend: true, // Show legend
  legend: {
    font: { color: '#40E0D0' }, // Legend color
    itemclick: 'toggleothers' // Clicking a legend item will hide/show that trace
  }
};

// Plotting the chart with the traces
Plotly.newPlot('chart-time', traces, layout);



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

    // Add a listener for the click event on the bar chart
    document.getElementById('chart-magnitude').on('plotly_click', function(eventData) {
      const clickedPlace = eventData.points[0].x; // The 'place' of the clicked bar

      // Find the earthquake associated with the clicked bar
      const selectedEarthquake = markers.find(eq => eq.place === clickedPlace);

      if (selectedEarthquake) {
        // Zoom and pan to the selected earthquake's location
        map.setView([selectedEarthquake.coords[1], selectedEarthquake.coords[0]], 8);

        // Optionally, highlight the marker (you can add a special style to the selected marker)
        selectedEarthquake.marker.setStyle({
          color: 'yellow', // Highlight color
          radius: 10,      // Larger radius
          fillOpacity: 0.8
        });

        // Optionally, bind a popup to the marker
        selectedEarthquake.marker.openPopup();
      }
    });

  })
  .catch(error => console.error('Error fetching earthquake data:', error));
