const url = 'https://earthquake.usgs.gov/fdsnws/event/1/query.geojson?starttime=1975-01-01%2000:00:00&endtime=2025-01-10%2023:59:59&maxlatitude=50&minlatitude=24.6&maxlongitude=-65&minlongitude=-125&minmagnitude=4.5&orderby=time';

fetch(url)
  .then(response => response.json())
  .then(data => {
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
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#FF5733'], // Custom colors
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top'
          },
          title: {
            display: true,
            text: 'Proportion of Earthquakes by Magnitude Range'
          }
        }
      }
    });
  })
  .catch(error => console.error('Error fetching earthquake data:', error));