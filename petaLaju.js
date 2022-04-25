var map = L.map('mapid').setView([-6.89848, 107.41204], 10);

var graycanvas =   L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
	maxZoom: 16
}).addTo(map);



var nama_kab;
function set_view(e){
    if (nama_kab == 'Bandung Barat') {
        map.setView([-6.89848, 107.41204], 10);
    } else if (nama_kab == 'Purwakarta'){
        map.setView([-6.60139, 107.44292], 10);
        // map.fitBounds(pwk_geojson.getBounds())
    }
}

var homeBtn = L.easyButton('<i class="bi bi-house-door-fill"></i>', set_view).addTo(map);

var bb_geojson = L.geoJSON("",{
    style: myStyle,
    onEachFeature: onEachFeature
}).addTo(map);

var pwk_geojson = L.geoJSON("",{
    style: myStyle,
    onEachFeature: onEachFeature
});


function highlightFeature(e) {
    var layer = e.target;
    
    layer.setStyle({
        weight: 5,
        color: 'white'
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }
    info.update(layer.feature.properties);
}

function resetHighlight(e) {
    bb_geojson.resetStyle(e.target);
    info.update();
}

function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
}

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
}

function getColor(d, kab = 'BANDUNG BARAT') {
    if (kab == 'BANDUNG BARAT') {
        return d > 66.4  ? '#CFE6CA' :
        d > 52.8 ? '#A4D29F' :
        d > 46.3  ? '#7AC27F' :
        d > 38.7  ? '#20AC4B' :
        '#0A5446';
    } else if (kab == 'PURWAKARTA'){
        return d > 44.7 ? '#CFE6CA' :
        d > 30.6 ? '#A4D29F' :
        d > 21.4 ? '#7AC27F' :
        d > 19.9 ? '#20AC4B' :
        '#0A5446';
    } 
}

function myStyle(feature) {
    return {
        fillColor: getColor(feature.properties.laju, feature.properties.nmkab),
        weight: 1,
        opacity: 1,
        color: 'white',
        fillOpacity: 0.7
    }
};

function fetchJSON(url) {
    return fetch(url)
    .then(function(response) {
        return response.json();
    });
};


fetchJSON('http://localhost:8000/LajuAlihFungsi/assets/bb_LajuAlihFungsi.geojson')
.then(function(data) { 
    bb_geojson.addData(data);
});

fetchJSON('assets/pwk_LajuAlihFungsi.geojson')
.then(function(data) { 
    pwk_geojson.addData(data);
});


var Petakab = {
    'Bandung Barat': bb_geojson,
    'Purwakarta': pwk_geojson
}


function toTitleCase(str) {
    return str.replace(
      /\w\S*/g,
      function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      }
    );
}

var info = L.control();

info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info'); 
    this.update();
    return this._div;
};

info.update = function (dat) {
    this._div.innerHTML = 
    '<h4>Laju Alih Fungsi Lahan</h4>' +  (dat ?
    '<b>Kab : ' + toTitleCase(dat.nmkab) + '</b><br/>' +
    '<b>Kec : ' + toTitleCase(dat.nmkec) + '</b><br/>' +
    dat.laju.toFixed(3) + ' %'
    : 'Hover over a district');
};

info.addTo(map);



var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info legend')
    this._color = ['#0A5446', '#20AC4B', '#7AC27F', '#A4D29F','#CFE6CA']
    grades = [0, 38.7, 46.3, 52.8, 66.4, 76.3]

    for (var i = 0; i < grades.length - 1; i++) {
        this._div.innerHTML +=
            '<i style="background:' + this._color[i] + '"></i> ' +
            grades[i] + ' &ndash; ' + grades[i + 1] + '<br>';
    }
    return this._div;
};

legend.addTo(map);

legend.update = function() {
    if (nama_kab == 'Bandung Barat') {
        grades = [0, 38.7, 46.3, 52.8, 66.4, 76.3]
    } else if (nama_kab == 'Purwakarta'){
        grades = [0, 19.8, 21.4, 30.6, 44.7, 63.4]
    }

    this._div.innerHTML = "";
    for (var i = 0; i < grades.length - 1; i++) {
        this._div.innerHTML +=
            '<i style="background:' + this._color[i] + '"></i> ' +
            grades[i] + ' &ndash; ' + grades[i + 1] + '<br>';
    }
    return this._div;
}



var control = new L.control.layers(Petakab, '', {position: 'topright'}).addTo(map);

map.on('baselayerchange', set_map);

function set_map(e){
    nama_kab = e.name;
    set_view();
    legend.update();
}