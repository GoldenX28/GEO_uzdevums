document.addEventListener('DOMContentLoaded', function () {
    // Log that the DOM is ready
    console.log('DOM is loaded');

    // Check if Proj4js is loaded properly
    console.log('Proj4js:', typeof proj4 !== 'undefined'); 

    // Define the LKS92 projection and the WGS84 projection (Leaflet uses WGS84 by default)
    const LKS92 = '+proj=tmerc +lat_0=0 +lon_0=24 +k=0.9996 +x_0=500000 +y_0=-6000000 +datum=WGS84 +units=m +no_defs';
    const WGS84 = '+proj=longlat +datum=WGS84 +no_defs';

    // 1. Create the map object and set initial view (Lat, Long, Zoom level)
    const map = L.map('map').setView([56.946, 24.105], 13); // Initial lat/lng and zoom level
    console.log('Map created with center:', [56.946, 24.105]);

    // 2. Set up the tile layer (you can change it to a different map style)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    console.log('TileLayer added');

    // 3. Fetch data from the JSON file
    fetch('data.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load data.json');
            }
            return response.json();
        })
        .then(data => {
            console.log('Data loaded:', data); // Log the data structure

            // Check if the data is an array
            if (Array.isArray(data)) {
                // 4. Loop through the data and create a marker for each resting place
                data.forEach(place => {
                    console.log('Original Coordinates:', place.geometry.coordinates);

                    const coords = proj4(LKS92, WGS84, place.geometry.coordinates);
                    console.log('Converted Coordinates:', coords);

                    if (coords && coords.length === 2) {
                        const marker = L.marker([coords[1], coords[0]]).addTo(map);
                        const popupContent = `
                            <b>${place.properties.PLACENAME}</b><br>
                            Type: ${place.properties.PLACESUBTY}<br>
                            Region Code: ${place.properties.REG_CODE}<br>
                            LVM District: ${place.properties.LVM_DISTRI}<br>
                            Block Key: ${place.properties.BLOCKKEY}
                        `;
                        marker.bindPopup(popupContent);
                    } else {
                        console.warn('Invalid coordinates:', coords);
                    }
                });
            } else {
                // If data is not an array, check its properties
                console.error('Data is not an array:', data);
                // Assuming data might have a "features" array, you can try accessing it like so:
                if (data.features) {
                    data.features.forEach(place => {
                        console.log('Original Coordinates:', place.geometry.coordinates);
                        const coords = proj4(LKS92, WGS84, place.geometry.coordinates);
                        console.log('Converted Coordinates:', coords);

                        if (coords && coords.length === 2) {
                            const marker = L.marker([coords[1], coords[0]]).addTo(map);
                            const popupContent = `
                                <b>${place.properties.PLACENAME}</b><br>
                                Type: ${place.properties.PLACESUBTY}<br>
                                Region Code: ${place.properties.REG_CODE}<br>
                                LVM District: ${place.properties.LVM_DISTRI}<br>
                                Block Key: ${place.properties.BLOCKKEY}
                            `;
                            marker.bindPopup(popupContent);
                        } else {
                            console.warn('Invalid coordinates:', coords);
                        }
                    });
                }
            }
        })
        .catch(error => {
            console.error('Error loading the data:', error);
            alert('Error loading data: ' + error.message);
        });

    // 6. Enable zoom controls (this is already part of Leaflet by default)
});

