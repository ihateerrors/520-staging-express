   let map;
    let dateRange = { start: '2000-01-01', end: '2099-12-31' };
    let constructionType = ['All'];
    let markers = [];
    let popupDimensions = null;

    function handleFormSubmit(e) {
        e.preventDefault();
        const form = e.currentTarget;
        dateRange = { start: form.start.value, end: form.end.value };
    };

    function initializeMap() {
        map = L.map('map', {
            center: [ 47.643142, -122.305282 ],
            zoom: 14,
            layers: [
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    maxZoom: 15,
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                }),
            ],
        });
        
        calculatePopupSize();
        map.on('resize', calculatePopupSize);

        createPolyline();

        renderMarkers();
    }

    function calculatePopupSize() {
        const mapSize = map.getSize();
        popupDimensions = {
            width: Math.min(mapSize.x * 0.85, 700),
            height: Math.min(mapSize.y * 0.85, 1100)
        };
    }

    function createPolyline() {
        const latLngs = [
            [47.641919, -122.321738],
            [47.642378, -122.320261],
            [47.642436, -122.318853]
        ];
        const polyline = L.polyline(latLngs, { color: '#c9313b', opacity: .8, weight: 10 }).addTo(map);
    }
    function handleConstructionTypeChange(event) {
    constructionType = [event.target.value];
    renderMarkers();  // re-render the markers based on the new type
}
    function renderMarkers() {
        markers.forEach(marker => map.removeLayer(marker));

        data.forEach(point => {
            const startDate = new Date(point.startDate);
            const endDate = new Date(point.endDate);
            const type = point.type;

            if (
                startDate >= new Date(dateRange.start) &&
                endDate <= new Date(dateRange.end) &&
                (constructionType.includes(type) || constructionType.includes('All'))
            ) {
                const marker = L.marker(point.coordinates, {
                    icon: L.icon({
                        iconUrl: point.iconUrl,
                        iconSize: point.iconSize
                    })
                })
                .addTo(map)
                .bindPopup(point.message, {
                    maxWidth: popupDimensions.width,
                    maxHeight: popupDimensions.height,
                });
                markers.push(marker);
            }
        });
    }

    document.addEventListener("DOMContentLoaded", function() {
        initializeMap();
    });


