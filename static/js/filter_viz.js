const url = 'https://earthquake.usgs.gov/fdsnws/event/1/query.geojson?starttime=1975-01-01%2000:00:00&maxlatitude=50&minlatitude=24.6&maxlongitude=-65&minlongitude=-125&minmagnitude=4.5&orderby=time';

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
        color: 'rgba(155, 76, 3, 0.5)', // Transparent red color
        line: {color: 'white', width: 2} // White border
      }
    };

    const topEarthquakesLayout = {
      title: {
        text: 'Top 20 Earthquakes by Magnitude' +
          '<br>' + 
          '<span style="font-size: 12px;">*click on any bar to see the earthquake on map</span>',
        font: {
          color: '#40E0D0',
          size:20,
          family:'Arial, sans-serif'}  // Light turquoise title color
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
        '<span style="font-size: 12px;">*click on any year in the legend to see only the trend for that year</span>',
        font: { 
          color: '#40E0D0',
          size: 20,
          family:'Arial, sans-serif' } // Title color
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

        // Helper functions
        function getMagnitudeColor(magnitude) {
            return magnitude >= 7 ? 'orange' : magnitude >= 5 ? 'darkblue' : 'lightblue';
        }

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

      // Update top 20 earthquakes bar chart based on filter selection
      /*
      const topEarthquakes = filteredData
        .map(feature => ({
          place: feature.properties.place,
          magnitude: feature.properties.mag,
          time: new Date(feature.properties.time).toLocaleString()
        }))
        .sort((a, b) => b.magnitude - a.magnitude)
        .slice(0, 20);

        const updatedBarChart = {
          x: topEarthquakes.map(eq => eq.place),
          y: topEarthquakes.map(eq => eq.magnitude),
          type: 'bar',
          name: 'Top 20 Earthquakes',
          marker: {
            color: 'rgba(255, 0, 0, 0.5)',
            line: { color: 'white', width: 2 }
          }
        };

        Plotly.react('chart-magnitude', [updatedBarChart], topEarthquakesLayout);
        */
       
        // Update earthquake trends by year graph based on filter selection
        const updatedEarthquakesByYearMonth = {};
        filteredData.forEach(feature => {
          const time = new Date(feature.properties.time);
          const year = time.getFullYear();
          const month = time.getMonth();

          if (!updatedEarthquakesByYearMonth[year]) {
            updatedEarthquakesByYearMonth[year] = Array(12).fill(0);
          }

          updatedEarthquakesByYearMonth[year][month]++;
        });

        const updatedTraces = Object.keys(updatedEarthquakesByYearMonth).map(year => ({
          x: months,
          y: updatedEarthquakesByYearMonth[year],
          type: 'scatter',
          mode: 'lines+markers',
          name: year,
          line: { shape: 'linear', width: 3 },
          marker: { size: 6 }
        }));

        Plotly.react('chart-time', updatedTraces, layout);

      
    }
     // Process data for the pie chart (by magnitude range or country)
     const magnitudeRanges = {
      '<5': 0,
      '5-6': 0,
      '6-7': 0,
      '>=7': 0
    };
    const countries = {};
    data.features.forEach(feature => {
      const magnitude = feature.properties.mag;
      const place = feature.properties.place;
      // Categorize by magnitude range
      if (magnitude < 5) magnitudeRanges['<5']++;
      else if (magnitude >= 5 && magnitude < 6) magnitudeRanges['5-6']++;
      else if (magnitude >= 6 && magnitude < 7) magnitudeRanges['6-7']++;
      else if (magnitude >= 7) magnitudeRanges['>=7']++;
      // Categorize by country (assumes country is the last part of the "place" string)
      const country = place.split(', ').pop();
      countries[country] = (countries[country] || 0) + 1;
    });
    // Choose the data for the pie chart (magnitude range in this case)
    const labels = Object.keys(magnitudeRanges);
    const values = Object.values(magnitudeRanges);
    // Create the pie chart
    const ctx = document.getElementById('chart-pie').getContext('2d');
    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Earthquakes by Magnitude Range',
            data: values,
            backgroundColor: [
              'rgba(30, 144, 255, 0.5)', // Dodger Blue with 75% opacity
              'rgba(70, 130, 180, 0.5)', // Steel Blue with 75% opacity
              'rgba(0, 0, 255, 0.5)',     // Blue with 75% opacity
              'rgba(135, 206, 235, 0.5)'  // Sky Blue with 75% opacity
            ],
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'right',   // Position the legend vertically on the left
            labels: {
              color: '#40E0D0', // Light turquoise color for legend text
              font: {
                size: 16,
              family:'Arial'           // Legend text size
            }
          }
          },
          title: {
            display: true,
            text: 'Proportion of Earthquakes by Magnitude Range',
            color: '#40E0D0',     // Light turquoise color for title
            font: {
              size: 20,
              family:'Arial, sans-serif'           
              }
          },
          tooltip: {
            callbacks: {
              label: function (tooltipItem) {
                const dataset = tooltipItem.chart.data.datasets[0];
                const value = dataset.data[tooltipItem.dataIndex];
                const total = dataset.data.reduce((sum, val) => sum + val, 0);
                const percentage = ((value / total) * 100).toFixed(2);
                return `${tooltipItem.label}: ${value} (${percentage}%)`;
              }
            }
          },
          datalabels: {
            color: '#ffffff', // Label color
            font: {
              size: 14
            },
            formatter: (value, ctx) => {
              const total = ctx.chart.data.datasets[0].data.reduce((sum, val) => sum + val, 0);
              const percentage = ((value / total) * 100).toFixed(2) + '%';
              // Set a threshold for hiding labels, e.g., hide labels for slices < 5
              if (value < 50) {
                return null;  // Return null to hide the label for small slices
              }
          
              return percentage; // Show percentage for slices above the threshold
            },
            anchor: 'middle',
            align: 'center',   
            offset: 5,
            clip:true,
            padding: 5,
            rotation: function (context) {
              const value = context.dataset.data[context.dataIndex];
              if (value < 100) {
                return -90;  // Rotate small slices by 90 degrees
              }
              return 0;  // Keep larger slices upright
            },
            // Avoid overlap by adjusting label positioning for small slices
            overlap: function (context) {
              const value = context.dataset.data[context.dataIndex];
              return value < 100 ? false : true;  // Only allow overlap for larger slices
            }
          }
        }
        },
        responsive: true, // Ensures the chart is responsive
        aspectRatio: 1, // Ensures the chart remains circula
        plugins: [ChartDataLabels]
    });

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
            color: 'cyan', // Highlight color
            radius: 10,      // Larger radius
            fillOpacity: 0.8
          });
  
          // Optionally, bind a popup to the marker
          selectedEarthquake.marker.openPopup();
        }
    });
  })
  .catch(error => console.error('Error fetching earthquake data:', error));