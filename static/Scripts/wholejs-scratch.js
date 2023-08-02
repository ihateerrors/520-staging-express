const constructionSites = [
    {
        "coordinates": [47.651151332237724, -122.24892667750544],
        "message": "Road closed due to construction from May 10 to May 20.",
        "iconUrl": "/Content/icons/orangeConeSm.png",
        "startDate": "2023-05-10",
        "endDate": "2023-05-20"
      },
      {
        "coordinates": [47.651151332237724, -122.24892667750544],
        "message": "Bridge work from May 15 to May 25.",
        "iconUrl": "bridge-icon.png",
        "startDate": "2023-05-15",
        "endDate": "2023-05-25"
      },

      {
        "coordinates": [47.651151332237724, -122.24892667750544],
        "message": "TEST work from May 7 to May 30 blah blah how does this format?.",
        "iconUrl": "bridge-icon.png",
        "startDate": "2023-05-07",
        "endDate": "2023-05-30"
      }
      // Add more construction sites here
    ];
  
  function createCustomIcon(iconUrl) {
    return L.icon({
        iconUrl: iconUrl,
        iconSize: [25, 41], // Size of the icon
        iconAnchor: [12, 41], // Point of the icon which will correspond to the marker's location
        popupAnchor: [0, -41] // Point from which the popup should open relative to the iconAnchor
      });
  }
  
  // Initialize the Leaflet map
  const map = L.map('map').setView([47.651151332237724, -122.24892667750544], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);
  
  // Loop through the data source and create markers with pop-up messages and custom icons
  constructionSites.forEach(site => {
    const customIcon = createCustomIcon(site.iconUrl);
    const marker = L.marker(site.coordinates, { icon: customIcon }).addTo(map);
  
    marker.bindPopup(site.message);
  });
  