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
            totalLat += brewery.latitude;
            totalLng += brewery.longitude;
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
        })
    }
}

function getBreweryAPI(name) {
    const encodedURI = encodeURIComponent(name);
    let requestUrl = `https://api.openbrewerydb.org/v1/breweries?by_name=${encodedURI}`;

    fetch(requestUrl)
        .then(function(response) {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Response is not JSON');
            }

            return response.json();
        })
        .then(function(data) {
            barInfoEl.textContent = '';

            if (data.length === 0) {
                barInfoEl.textContent = '<p>No results found.</p>';
                return
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

                let address = '';
                if (data[i].street) {
                    address =  `${data[i].street}, `;
                }

                address += `${data[i].city}, ${getStateAbbreviation(data[i].state)}`;
                barAddress.textContent = address;
                
                const formatPhoneNumber = (phoneNumber) => {
                    if (!phoneNumber) return '';
                    const cleaned = phoneNumber.replace(/\D/g, '');
                    if (cleaned.length === 10) {
                        return `${cleaned.slice(0,3)}-${cleaned.slice(3,6)}-${cleaned.slice(6)}`;
                    }
                    return phoneNumber;
                };
                
                barPhone.innerHTML = `<a href="tel:${data[i].phone}">${formatPhoneNumber(data[i].phone)}</a>`;

                barWebsite.textContent = data[i].website_url;
                barWebsite.innerHTML = `<a href="${data[i].website_url}" target="_blank">${data[i].website_url}</a>`;

                cardEl.appendChild(barName);
                cardEl.appendChild(barAddress);
                cardEl.appendChild(barPhone);
                cardEl.appendChild(barWebsite);
                
                barInfoEl.appendChild(cardEl);

                if (data[i].longitude && data[i].latitude) {
                    addMarker(data[i].longitude, data[i].latitude, data[i].name, data[i].street, data[i].city, data[i].state, data[i].phone, data[i].website_url);
                }

                centerMapResults(data);
            }
        })
        .catch((error) => {
            console.error('Error fetching data:', error);
            barInfoEl.innerHTML = `<p>No results found. Error finding breweries: ${error.message}</p>`;
        });
}

function getCityAPI(city) {
    const encodedURI = encodeURIComponent(city);
    let requestUrl = `https://api.openbrewerydb.org/v1/breweries?by_city=${encodedURI}`;

    fetch(requestUrl)
        .then(function(response) {
            if (!response.ok) {
                throw new Error(`HTTP error status: ${response.status}`)
            }

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Response is not JSON');
            }

            return response.json();
        })
        .then(function(data) {
            barInfoEl.textContent = '';

            if (data.length === 0) {
                barInfoEl.textContent = '<p>No results found.</p>';
                return
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

                let address = '';
                if (data[i].street) {
                    address =  `${data[i].street}, `;
                }

                address += `${data[i].city}, ${getStateAbbreviation(data[i].state)}`;
                barAddress.textContent = address;
                
                const formatPhoneNumber = (phoneNumber) => {
                    if (!phoneNumber) return '';
                    const cleaned = phoneNumber.replace(/\D/g, '');
                    if (cleaned.length === 10) {
                        return `${cleaned.slice(0,3)}-${cleaned.slice(3,6)}-${cleaned.slice(6)}`;
                    }
                    return phoneNumber;
                };
                
                barPhone.innerHTML = `<a href="tel:${data[i].phone}">${formatPhoneNumber(data[i].phone)}</a>`;

                barWebsite.textContent = data[i].website_url;
                barWebsite.innerHTML = `<a href="${data[i].website_url}" target="_blank">${data[i].website_url}</a>`;

                cardEl.appendChild(barName);
                cardEl.appendChild(barAddress);
                cardEl.appendChild(barPhone);
                cardEl.appendChild(barWebsite);
                
                barInfoEl.appendChild(cardEl);

                if (data[i].longitude && data[i].latitude) {
                    addMarker(data[i].longitude, data[i].latitude, data[i].name, data[i].street, data[i].city, data[i].state, data[i].phone, data[i].website_url);
                }

                centerMapResults(data);
            }
        })
        .catch(function(error) {
            console.error('Error fetching data: ', error);
            barInfoEl.innerHTML = `<p>No results found. Error finding breweries: ${error.message}</p>`;
        })
}

function addMarker(lng, lat, name, street, city, state, phone, website) {

    const longitude = parseFloat(lng);
    const latitude = parseFloat(lat);

    if (!isNaN(longitude) && !isNaN(latitude)) {
        let address = '';
        if (street) {
            address =  `${street}, `;
        }
        address += `${city}, ${getStateAbbreviation(state)}`;

        let websiteLink = '';
        if (website) {
            websiteLink = `<a href="${website}" target="_blank">${website}</a>`;
        }

        let displayPhone = '';
        if (phone) {
            displayPhone = `<a href="tel:${phone}">${phone}</a>`;
        }
    }

    new mapboxgl.Marker()
        .setLngLat([lng, lat])
        .setPopup(new mapboxgl.Popup().setHTML(`
            <h3>${name}</h3>
            <p>${street}, ${city}, ${getStateAbbreviation(state)}</p>
            <p>${phone}</p>
            <a>${website}</a>
        `))
        .addTo(map);
}

function getName(e) {
    e.preventDefault();
    let info = searchName.value;
    getBreweryAPI(info);
}

function getCity(e) {
    e.preventDefault();
    let info = searchCity.value;
    getCityAPI(info);
}

searchButton.addEventListener('click', function(e) {
    e.preventDefault();
    let name = searchName.value.trim();
    let city = searchCity.value.trim();

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
        alert('Please enter a name or city to search.');
    }
});
