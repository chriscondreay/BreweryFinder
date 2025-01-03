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
                
                let barName = document.createElement('h3');
                let barAddress = document.createElement('p');
                let barCity = document.createElement('p');
                let barPhone = document.createElement('p');
                let barWebsite = document.createElement('a');
                let saveButton = document.createElement('button');

                barName.textContent = data[i].name;
                barAddress.textContent = `${data[i].street}, ${data[i].city}, ${getStateAbbreviation(data[i].state)}`;
                barPhone.innerHTML = `<a href="tel:${data[i].phone}">${data[i].phone + '-'}</a>`;

                barWebsite.textContent = data[i].website_url;
                barWebsite.href = data[i].website_url;
                barWebsite.target = '_blank';

                saveButton.textContent = 'Save';

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
                
                let barName = document.createElement('h3');
                let barAddress = document.createElement('p');
                let barPhone = document.createElement('p');
                let barWebsite = document.createElement('a');
                let saveButton = document.createElement('button');

                barName.textContent = data[i].name;
                barAddress.textContent = `${data[i].street}, ${data[i].city}, ${getStateAbbreviation(data[i].state)}`;
                barPhone.innerHTML = `<a href="tel:${data[i].phone}">${data[i].phone}</a>`;

                barWebsite.textContent = data[i].website_url;
                barWebsite.href = data[i].website_url;
                barWebsite.target = '_blank';

                saveButton.textContent = 'Save';

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
    } else if (name) {
        getBreweryAPI(name);
    } else if (city) {
        getCityAPI(city);
    } else {
        alert('Please enter a name or city to search.');
    }
});
