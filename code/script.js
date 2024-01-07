const markersData = [
    { position: { lat: 28.6139, lng: 77.2090 }, title: 'New Delhi', Username: 'User1', HouseNo: '123', CameraInfo: 'Camera A' },
    { position: { lat: 19.0760, lng: 72.8777 }, title: 'Mumbai', Username: 'User2', HouseNo: '456', CameraInfo: 'Camera B' },
    { position: { lat: 12.9716, lng: 77.5946 }, title: 'Bengaluru', Username: 'User3', HouseNo: '789', CameraInfo: 'Camera C' },
    { position: { lat: 22.5726, lng: 88.3639 }, title: 'Kolkata', Username: 'User4', HouseNo: '101', CameraInfo: 'Camera D' }
];

// Function for smooth zoom
function smoothZoom(map, targetLocation, targetZoom) {
    const currentZoom = map.getZoom();
    const zoomStep = (targetZoom - currentZoom) / 15;

    const smoothZoomInterval = setInterval(() => {
        if (map.getZoom() < targetZoom) {
            map.setZoom(map.getZoom() + zoomStep);
        } else {
            clearInterval(smoothZoomInterval);
        }
    }, 200);

    const smoothPanInterval = setInterval(() => {
        const currentCenter = map.getCenter();
        const newLat = currentCenter.lat() + (targetLocation.lat - currentCenter.lat()) / 15;
        const newLng = currentCenter.lng() + (targetLocation.lng - currentCenter.lng()) / 15;
        map.panTo(new google.maps.LatLng(newLat, newLng));
    }, 200);

    setTimeout(() => {
        clearInterval(smoothZoomInterval);
        clearInterval(smoothPanInterval);
    }, 800 * 15);
}

let map; // Declare map variable in the global scope

function initMap() {
    const center = { lat: 20.5937, lng: 78.9629 };
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 5,
        center: center,
        mapTypeId: 'satellite'
    });

    document.getElementById('city').addEventListener('click', function () {
        let city = prompt('Please enter a city name:');
        if (city) {
            // Use OpenStreetMap Nominatim API for geocoding
            const apiUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${city}`;

            fetch(apiUrl)
                .then(response => response.json())
                .then(data => {
                    if (data.length > 0) {
                        const cityLocation = {
                            lat: parseFloat(data[0].lat),
                            lng: parseFloat(data[0].lon)
                        };

                        smoothZoom(map, cityLocation, 14);

                        map.setCenter(cityLocation);
                        //map.setZoom(14);
                    } else {
                        alert('City not found');
                    }
                })
                .catch(error => {
                    console.error('Error fetching data:', error);
                });
        }
    });



    // Add markers with info windows
    markersData.forEach(markerData => {
        addMarker(map, markerData);
    });
}

// Function to add a marker to the map
function addMarker(map, markerData) {
    const marker = new google.maps.Marker({
        position: markerData.position,
        map: map,
        title: markerData.title,
        icon: markerData.iconUrl || null
    });

    let isSatelliteView = true;

    document.getElementById('switchView').addEventListener('click', function () {
        if (isSatelliteView) {
            map.setMapTypeId('terrain');
            this.classList.remove('satellite');
            this.classList.add('terrain');
            isSatelliteView = false;
        } else {
            map.setMapTypeId('satellite');
            this.classList.remove('terrain');
            this.classList.add('satellite');
            isSatelliteView = true;
        }
    });

    const infoWindow = new google.maps.InfoWindow({
        content: `<div style = "text-align: center; color: black">
                    <strong>${markerData.title}</strong><br>
                    Username: ${markerData.Username}<br>
                    House No.: ${markerData.HouseNo}<br>
                    Camera Info: ${markerData.CameraInfo}<br>
                    <div><button style="background-color: red; color: white; margin-top: 10px;" onclick="alert('Calling now...'); window.location.href='tel:1234567890';">Call Now</button></div>
                    <div><button style="background-color: blue; color: white; margin-top: 10px; margin-left: 5px;" onclick="window.location.href='database.html';">Access Videos</button></div>
                </div>`
    });

    marker.addListener('click', () => {
        // Zoom in on the clicked marker with a slow transition
        const targetZoom = 20;
        const currentZoom = map.getZoom();
        const zoomStep = (targetZoom - currentZoom) / 15;

        // Calculate the new center for smooth zoom


        // Perform zoom steps
        const zoomInterval = setInterval(() => {
            if (map.getZoom() < targetZoom) {
                map.setZoom(map.getZoom() + zoomStep);
            } else {
                clearInterval(zoomInterval);
            }
        }, 200);
        // Center the map on the clicked marker
        map.panTo(marker.getPosition());

        // Open the info window
        infoWindow.open(map, marker);
    });
}

function handleFullscreenChange() {
    const fullscreenElement = document.fullscreenElement || document.mozFullScreenElement ||
        document.webkitFullscreenElement || document.msFullscreenElement;

    if (fullscreenElement) {
        // Adjust styling for full-screen mode
        document.getElementById('switchView').style.left = '20px';
        document.getElementById('city').style.left = '120px';
    } else {
        // Restore styling for normal mode
        document.getElementById('switchView').style.left = '10px';
        document.getElementById('city').style.left = '10px';
    }
}

// Attach full-screen change event listener
document.addEventListener('fullscreenchange', handleFullscreenChange);
document.addEventListener('mozfullscreenchange', handleFullscreenChange);
document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
document.addEventListener('msfullscreenchange', handleFullscreenChange);

setTimeout(function () {
    document.getElementById('loading-screen').style.display = 'none';
    document.getElementById('map').style.display = 'block';
}, 3000); 
