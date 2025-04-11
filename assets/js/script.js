let searchButton = document.getElementById('search-btn');
let barInfoEl = document.querySelector('.bar-info');
let searchName = document.getElementById('search-name');
let searchCity = document.getElementById('search-city');

function getStateAbbreviation(state) {
    const states = {
        'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR', 'California': 'CA',
        'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE', 'Florida': 'FL', 'Georgia': 'GA',
        'Hawaii': 'HI', 'Idaho': 'ID', 'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA',
        'Kansas': 'KS', 'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
        'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS', 'Missouri': 'MO',
        'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ',
        'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH',
        'Oklahoma': 'OK', 'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
        'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT', 'Vermont': 'VT',
        'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV', 'Wisconsin': 'WI', 'Wyoming': 'WY'
    };
    return states[state] || state;
}

function centerMapResults(data) {
    if (data.length === 0) return;

    let totalLat = 0;
    let totalLng = 0;
    let validCoords = 0;

    data.forEach(brewery => {
        if (brewery.latitude && brewery.longitude) {
            totalLat += parseFloat(brewery.latitude);
            totalLng += parseFloat(brewery.longitude);
            validCoords++;
        }
    });
    
    if (validCoords > 0) {
        const centerLat = totalLat / validCoords;
        const centerLng = totalLng / validCoords;

        map.flyTo({
            center: [centerLng, centerLat],
            zoom: 9,
            essential: true,
            duration: 2000
        });
    }
}

function getBreweryAPI(name) {
    // Encode the search parameter to handle spaces and special characters
    let encodedName = encodeURIComponent(name);
    let requestUrl = `https://api.openbrewerydb.org/v1/breweries?by_name=${encodedName}`;
    
    barInfoEl.innerHTML = '<p>Loading results...</p>';
    barInfoEl.classList.remove('hidden');

    fetch(requestUrl)
        .then(function(response) {
            // First check if the response is ok
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            // Check the content type to ensure we're getting JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Response is not JSON');
            }
            
            return response.json();
        })
        .then(function(data) {
            console.log(data);
            barInfoEl.textContent = '';
            
            if (data.length === 0) {
                barInfoEl.innerHTML = '<p>No breweries found with that name. Please try another search.</p>';
                return;
            }
            
            for (let i = 0; i < data.length; i++) {
                let cardEl = document.createElement('div');
                cardEl.classList.add('card');
                
                let barName = document.createElement('span');
                barName.classList.add('bar-name');
                let barAddress = document.createElement('span');
                let barPhone = document.createElement('span');
                let barWebsite = document.createElement('span');

                barName.textContent = data[i].name;
                
                // Check if street exists before adding it
                let address = '';
                if (data[i].street) {
                    address = `${data[i].street}, `;
                }
                address += `${data[i].city}, ${getStateAbbreviation(data[i].state)}`;
                barAddress.textContent = address;
                
                // Format phone number with dashes
                const formatPhoneNumber = (phoneNumber) => {
                    if (!phoneNumber) return '';
                    const cleaned = phoneNumber.replace(/\D/g, '');
                    if (cleaned.length === 10) {
                        return `${cleaned.slice(0,3)}-${cleaned.slice(3,6)}-${cleaned.slice(6)}`;
                    }
                    return phoneNumber;
                };
                
                if (data[i].phone) {
                    barPhone.innerHTML = `<a href="tel:${data[i].phone}">${formatPhoneNumber(data[i].phone)}</a>`;
                } else {
                    barPhone.textContent = 'No phone available';
                }

                if (data[i].website_url) {
                    barWebsite.innerHTML = `<a href="${data[i].website_url}" target="_blank">${data[i].website_url}</a>`;
                } else {
                    barWebsite.textContent = 'No website available';
                }

                cardEl.appendChild(barName);
                cardEl.appendChild(barAddress);
                cardEl.appendChild(barPhone);
                cardEl.appendChild(barWebsite);
                
                barInfoEl.appendChild(cardEl);

                if (data[i].longitude && data[i].latitude) {
                    addMarker(data[i].longitude, data[i].latitude, data[i].name, data[i].street, data[i].city, data[i].state, data[i].phone, data[i].website_url);
                }
            }
            
            centerMapResults(data);
        })
        .catch(function(error) {
            console.error('Error fetching data:', error);
            barInfoEl.innerHTML = `<p>Error finding breweries: ${error.message}. Please try again.</p>`;
        });
}

function getCityAPI(city) {
    // Encode the search parameter to handle spaces and special characters
    let encodedCity = encodeURIComponent(city);
    let requestUrl = `https://api.openbrewerydb.org/v1/breweries?by_city=${encodedCity}`;
    
    barInfoEl.innerHTML = '<p>Loading results...</p>';
    barInfoEl.classList.remove('hidden');

    fetch(requestUrl)
        .then(function(response) {
            // First check if the response is ok
            if (!response.ok) {
                throw new Error(`HTTP error status: ${response.status}`);
            }
            
            // Check the content type to ensure we're getting JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Response is not JSON');
            }
            
            return response.json();
        })
        .then(function(data) {
            console.log(data);
            barInfoEl.textContent = '';
            
            if (data.length === 0) {
                barInfoEl.innerHTML = '<p>No breweries found in that city. Please try another search.</p>';
                return;
            }
            
            for (let i = 0; i < data.length; i++) {
                let cardEl = document.createElement('div');
                cardEl.classList.add('card');
                
                let barName = document.createElement('span');
                barName.classList.add('bar-name');
                let barAddress = document.createElement('span');
                let barPhone = document.createElement('span');
                let barWebsite = document.createElement('span');

                barName.textContent = data[i].name;
                
                // Check if street exists before adding it
                let address = '';
                if (data[i].street) {
                    address = `${data[i].street}, `;
                }
                address += `${data[i].city}, ${getStateAbbreviation(data[i].state)}`;
                barAddress.textContent = address;
                
                // Format phone number with dashes
                const formatPhoneNumber = (phoneNumber) => {
                    if (!phoneNumber) return '';
                    const cleaned = phoneNumber.replace(/\D/g, '');
                    if (cleaned.length === 10) {
                        return `${cleaned.slice(0,3)}-${cleaned.slice(3,6)}-${cleaned.slice(6)}`;
                    }
                    return phoneNumber;
                };
                
                if (data[i].phone) {
                    barPhone.innerHTML = `<a href="tel:${data[i].phone}">${formatPhoneNumber(data[i].phone)}</a>`;
                } else {
                    barPhone.textContent = 'No phone available';
                }

                if (data[i].website_url) {
                    barWebsite.innerHTML = `<a href="${data[i].website_url}" target="_blank">${data[i].website_url}</a>`;
                } else {
                    barWebsite.textContent = 'No website available';
                }

                cardEl.appendChild(barName);
                cardEl.appendChild(barAddress);
                cardEl.appendChild(barPhone);
                cardEl.appendChild(barWebsite);
                
                barInfoEl.appendChild(cardEl);

                if (data[i].longitude && data[i].latitude) {
                    addMarker(data[i].longitude, data[i].latitude, data[i].name, data[i].street, data[i].city, data[i].state, data[i].phone, data[i].website_url);
                }
            }
            
            centerMapResults(data);
        })
        .catch(function(error) {
            console.error('Error fetching data: ', error);
            barInfoEl.innerHTML = `<p>Error finding breweries: ${error.message}. Please try again.</p>`;
        });
}

function addMarker(lng, lat, name, street, city, state, phone, website) {
    // Ensure coordinates are numeric
    const longitude = parseFloat(lng);
    const latitude = parseFloat(lat);
    
    // Only add marker if coordinates are valid numbers
    if (!isNaN(longitude) && !isNaN(latitude)) {
        // Create address string, checking if street exists
        let address = '';
        if (street) {
            address = `${street}, `;
        }
        address += `${city}, ${getStateAbbreviation(state)}`;
        
        // Format website as a link if it exists
        let websiteHtml = '';
        if (website) {
            websiteHtml = `<a href="${website}" target="_blank">${website}</a>`;
        }
        
        // Format phone if it exists
        let phoneDisplay = '';
        if (phone) {
            phoneDisplay = `<p>${phone}</p>`;
        }
        
        new mapboxgl.Marker()
            .setLngLat([longitude, latitude])
            .setPopup(new mapboxgl.Popup().setHTML(`
                <h3>${name}</h3>
                <p>${address}</p>
                ${phoneDisplay}
                ${websiteHtml}
            `))
            .addTo(map);
    }
}

function getName(e) {
    e.preventDefault();
    let info = searchName.value.trim();
    if (info) {
        getBreweryAPI(info);
    } else {
        alert('Please enter a brewery name to search.');
    }
}

function getCity(e) {
    e.preventDefault();
    let info = searchCity.value.trim();
    if (info) {
        getCityAPI(info);
    } else {
        alert('Please enter a city to search.');
    }
}

// Update the event listener to handle the map properly
searchButton.addEventListener('click', function(e) {
    e.preventDefault();
    
    // Clear previous markers from the map
    const markers = document.querySelectorAll('.mapboxgl-marker');
    markers.forEach(marker => marker.remove());
    
    // Get search values
    let name = searchName.value.trim();
    let city = searchCity.value.trim();

    // Update map display
    document.getElementById('map').style.width = '100%';
    document.getElementById('map').style.height = '400px';
    
    // Force a resize event on the map to ensure it renders correctly
    setTimeout(() => {
        map.resize();
    }, 100);

    if (name && city) {
        getBreweryAPI(name);
        getCityAPI(city);
        searchName.value = '';
        searchCity.value = '';
    } else if (name) {
        getBreweryAPI(name);
        searchName.value = '';
    } else if (city) {
        getCityAPI(city);
        searchCity.value = '';
    } else {
        alert('Please enter a brewery name or city to search.');
    }
});

// Initialize the bar info element to be visible when results are available
barInfoEl.classList.add('hidden');
