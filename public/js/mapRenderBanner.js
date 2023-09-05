fetch('/api/latest-banner-project')
.then(response => response.json())
.then(projects => {
    projects.forEach(project => {
        if (project.mapData) {
            const geoJSONData = JSON.parse(project.mapData);
            L.geoJSON(geoJSONData).addTo(map);
        }
    });
})
.catch(error => console.error('Error fetching map data:', error));
