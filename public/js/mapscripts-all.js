document.addEventListener("DOMContentLoaded", function() {
            
    const apiKey = 'AIzaSyCUt0Sdti_Aderhux8JNiFR-6ClvNIb7Gk';

    const map = L.map('map').setView([47.6407, -122.2971], 14);
    L.gridLayer.googleMutant({
        type: 'roadmap',
        maxZoom: 20,
        apiKey: apiKey
    }).addTo(map);

    const activityIcons = {
        "Full highway closure": "https://sr520construction.blob.core.windows.net/520-uploads/whitedash-onred.png",
        "Partial highway closure": "https://sr520construction.blob.core.windows.net/520-uploads/whitedash-onred.png",
        "Street and lane closure": "https://sr520construction.blob.core.windows.net/520-uploads/whitedash-onred.png",
        "Ramp closure": "https://sr520construction.blob.core.windows.net/520-uploads/whitedash-onred.png",
        "High-impact construction": "https://sr520construction.blob.core.windows.net/520-uploads/high_impact_construction.png",
        "Trail closure": "https://sr520construction.blob.core.windows.net/520-uploads/trail_closure.png",
        "Cameras": "https://sr520construction.blob.core.windows.net/520-uploads/icon_Camera.png"
    };

    const mapLayerGroup = L.layerGroup().addTo(map);
    const defaultColor = '#f4661a';
    const defaultWidth = 8;

    initCameraMarkers(map);
      fetchMapData();

    setupDateDefaults();
    setupCheckboxesBehavior();
    setupFormSubmission();

    function initCameraMarkers(map) {
      
       const mapCameras = {
            "Montlake Freeway Station": [47.6427395, -122.3039562],
            "Montlake Blvd": [47.6406178, -122.3058297],
            "Evergreen Point Lid": [47.6423737, -122.2412252],
            "84th Ave NE Lid": [47.6335835, -122.2102367],
            "92nd Ave NE Lid": [47.6298285, -122.2057622],
            "Bellevue Way Lid": [47.6182216, -122.2054495],
            "Yarrow Point Lid": [47.6475817, -122.2196779],
            "Hunts Point": [47.6450325, -122.2258702],
            "Medina Lid": [47.6270626, -122.2389892],
            "I-5/NE 45th St": [47.661095, -122.313153],
            "Montlake/520 Interchange": [47.6406806, -122.3037303],
            "SR 520/NE 148th St": [47.731715, -122.144903],
            "SR 520/Redmond Way": [47.673978, -122.121263]
        };
               
        const cameras = L.layerGroup();
        Object.entries(mapCameras).forEach(([name, coordinates]) => {
            const cameraIcon = L.icon({
                iconUrl: "https://sr520construction.blob.core.windows.net/520-uploads/icon_Camera.png",
                iconSize: [26, 26],
                popupAnchor: [0, -41]
            });
            const marker = L.marker(coordinates, { icon: cameraIcon }).addTo(cameras);
            marker.bindPopup();
        });
        cameras.addTo(map);
    }

    function fetchMapData(startDate = '', endDate = '', types = []) {
        mapLayerGroup.clearLayers();

        const apiUrl = `/api/projects?startDate=${startDate}&endDate=${endDate}&types=${types.join(",")}`;

        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                handleFetchedData(data);
            })
            .catch(error => {
                console.error('Error fetching map data:', error);
                alert('There was an error fetching map data. Please try again later.');
            });
    }

    function handleFetchedData(data) {
    if (data && data.length > 0) {
        data.forEach(project => {
            if (!project.mapData || !Array.isArray(project.mapData)) {
                console.warn(`Invalid mapData for project with ID ${project._id}`);
                return;
            }

            let geoJSONData = null;
            if (typeof project.mapData[1] === 'string') {
                try {
                    geoJSONData = JSON.parse(project.mapData[1]);
                } catch (e) {
                    console.warn(`Failed to parse GeoJSON for project with ID ${project._id}:`, e);
                    return;
                }
            }

            if (!geoJSONData) {
                console.warn(`GeoJSON data is missing or invalid for project with ID ${project._id}`);
                return;
            }

            const formattedStartDate = moment(project.startDate).format('MM/DD/YYYY');
            const formattedEndDate = moment(project.endDate).format('MM/DD/YYYY');
            const timingFeaturesHTML = project.timingFeatures.map(feature => `<img src="https://sr520construction.blob.core.windows.net/520-uploads/checked_mark.png" alt="Checked Mark" width="25" height="25">${feature}`).join(' ');
            const activityTypeHTML = project.activityType.map(type => `<img src="https://sr520construction.blob.core.windows.net/520-uploads/checked_mark.png" alt="Checked Mark" width="25" height="25">${type}`).join(' ');

    
            let iconURL = activityIcons[project.activityType[0]];
            if (!iconURL) {
                console.warn(`No icon found for activity type: ${project.activityType[0]}`);
                iconURL = "https://sr520construction.blob.core.windows.net/520-uploads/checked_mark.png";
            }

            const geoJSONLayer = L.geoJSON(geoJSONData, {
                style: {
                    color: defaultColor,
                    weight: defaultWidth
                },
                pointToLayer: (feature, latlng) => {
                    return L.marker(latlng, {
                        icon: L.icon({
                            iconUrl: iconURL,
                            iconSize: [26, 26],
                            popupAnchor: [0, -10]
                        })
                    });
                }
            }).bindPopup(`
                <strong>${project.title}</strong><br>
                Start: ${formattedStartDate}<br>
                End: ${formattedEndDate}<br>
                Timing Features: ${timingFeaturesHTML}<br>
                Activity Type: ${activityTypeHTML}
            `).addTo(mapLayerGroup);
        });
    }
}


    function setupDateDefaults() {
        var today = moment().format('YYYY-MM-DD');
        var twoWeeksLater = moment().add(14, 'days').format('YYYY-MM-DD');
        document.getElementById('start').setAttribute('value', today);
        document.getElementById('end').setAttribute('value', twoWeeksLater);
    }

    function setupCheckboxesBehavior() {
        const allCheckbox = document.getElementById('all');
        const otherCheckboxes = document.querySelectorAll("input[name='type']:not(#all)");

        otherCheckboxes.forEach(function(checkbox) {
            checkbox.addEventListener('change', function() {
                if (this.checked) {
                    allCheckbox.checked = false;
                } else {
                    const anyChecked = Array.from(otherCheckboxes).some(chk => chk.checked);
                    if (!anyChecked) {
                        allCheckbox.checked = true;
                    }
                }
            });
        });

        allCheckbox.addEventListener('change', function() {
            if (this.checked) {
                otherCheckboxes.forEach(chk => chk.checked = false);
            }
        });
    }

    function setupFormSubmission() {
        document.querySelector('form').addEventListener('submit', function(e) {
            e.preventDefault();

            const startDate = document.getElementById('start').value;
            const endDate = document.getElementById('end').value;
            const checkboxes = document.querySelectorAll('input[name="type"]:checked');
            let types = [];
            checkboxes.forEach(checkbox => {
                types.push(checkbox.value);
            });

            if (document.getElementById('all').checked) {
                types = [];
            }

            fetchMapData(startDate, endDate, types);
        });
    }

});