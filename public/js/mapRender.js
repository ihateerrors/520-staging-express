fetch('/api/projects')
    .then(response => response.json())
    .then(projects => {
        projects.forEach(project => {
            if (project.mapData) {
                L.geoJSON(project.mapData).addTo(map);  // Removed the JSON.parse call here
            }
        });
    })
    .catch(error => console.error('Error fetching map data:', error));
