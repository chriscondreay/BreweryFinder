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

function getBreweryAPI(name) {
    let requestUrl = `https://api.openbrewerydb.org/breweries?by_name=${name}`;

    fetch(requestUrl)
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            console.log(data);
            barInfoEl.textContent = '';
            
            for (let i = 0; i < data.length; i++) {
                let cardEl = document.createElement('div');
                cardEl.classList.add('card');
                
                let barName = document.createElement('span');
                barName.classList.add('bar-name');
                let barAddress = document.createElement('span');
                let barPhone = document.createElement('span');
                let barWebsite = document.createElement('span');

                barName.textContent = data[i].name;
                barAddress.textContent = `${data[i].street}, ${data[i].city}, ${getStateAbbreviation(data[i].state)}`;
                
                // Format phone number with dashes
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
            }
        });
}

function getCityAPI(city) {
    let requestUrl = `https://api.openbrewerydb.org/breweries?by_city=${city}`;

    fetch(requestUrl)
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            console.log(data);
            barInfoEl.textContent = '';
            
            for (let i = 0; i < data.length; i++) {
                let cardEl = document.createElement('div');
                cardEl.classList.add('card');
                
                let barName = document.createElement('span');
                barName.classList.add('bar-name');
                let barAddress = document.createElement('span');
                let barPhone = document.createElement('span');
                let barWebsite = document.createElement('span');

                // let saveButton = document.createElement('button');
                // let saveButtonSpan = document.createElement('span');
                // saveButtonSpan.classList.add('save-btn');
                // saveButtonSpan.textContent = 'Save';
                // saveButton.appendChild(saveButtonSpan);

                barName.textContent = data[i].name;
                barAddress.textContent = `${data[i].street}, ${data[i].city}, ${getStateAbbreviation(data[i].state)}`;
                
                // Format phone number with dashes
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
                // cardEl.appendChild(saveButton);
                
                barInfoEl.appendChild(cardEl);

                if (data[i].longitude && data[i].latitude) {
                    addMarker(data[i].longitude, data[i].latitude, data[i].name, data[i].street, data[i].city, data[i].state, data[i].phone, data[i].website_url);
                }
            }
        });
}

function addMarker(lng, lat, name, street, city, state, phone, website) {
    new mapboxgl.Marker()
        .setLngLat([lng, lat])
        .setPopup(new mapboxgl.Popup().setHTML(`
            <h3>${name}</h3>
            <p>${street}, ${city}, ${getStateAbbreviation(state)}</p>
            <p>${phone}</p>
            <a>${website}</a>
        `)) // add popup
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
