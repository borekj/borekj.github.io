'use strict';

function myFunction() {
	var x = document.getElementById("myTopnav");
	if (x.className === "topnav") {
	  x.className += " responsive";
	} else {
	  x.className = "topnav";
	}
  }

const MAP = L.map('map').setView([49.6, 15.59711], 7);
const URL_OSM = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const URL_GMAPS = 'https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&scale=2';

const OSM = L.tileLayer(URL_OSM);
const GMAPS = L.tileLayer(URL_GMAPS, {subdomains: ['mt0', 'mt1', 'mt2', 'mt3']});

MAP.addLayer(OSM);

const BASE_LAYERS = {
	'OpenStreetMap': OSM,
	'Google Maps': GMAPS
};

const LAYERS = L.control.layers(BASE_LAYERS);

MAP.addControl(LAYERS);

const TT_URL = 'https://zelda.sci.muni.cz/geoserver/webovka/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=webovka%3Atete&maxFeatures=50&outputFormat=application%2Fjson';

function getColor(d) {
	if (d <= 3)
	  return "#fdbb84";
	if (d <= 10)
	  return "#fc8d59";
	if (d <= 15)
	  return "#ef6548";  
	if (d <= 20)
	  return "#d7301f";
	if (d <= 50)
	  return "#990000";
  }

function getSize(e) {
	if (e <= 13420)
	  return "5";
	if (e <= 17624)
	  return "8";
	if (e <= 19831)
	  return "12";  
	if (e <= 25090)
	  return "15";
	if (e <= 50000)
	  return "20";
  }

fetch(TT_URL)
	.then(response => response.json())
	.then(data => {
		const TT = L.geoJSON(data, {
            pointToLayer: function (feature, latlng) {
                return L.circleMarker(latlng, {
					radius: getSize(feature.properties.Npotints),
					fillColor: getColor(feature.properties.km),
					color: "black",
					weight: 1,
					opacity: 1,
					fillOpacity: 0.7
				});
            }
		});
		const TT_CLUSTER = L.markerClusterGroup({
			iconCreateFunction: function (cluster) {
				var TT_CLUSTER = cluster.getAllChildMarkers();
				var n = 0;
				for (var i = 0; i < TT_CLUSTER.length; i++) {
					n += TT_CLUSTER[i].feature.properties.Npotints;
				}
				var c = ' marker-cluster-';

				if (n < 100000) {
					c += 'small'
				}
				else if (n < 200000) {
					c += 'medium'
				}
				else {c += 'large'}
				console.log(c)
				var text = n + ' bodů'
				return new L.DivIcon({html: text, 
				className: 'marker-cluster' + c, iconSize: new L.Point(90, 40) });
			},
			
		});	
		TT_CLUSTER
			.addLayer(TT)
			.addTo(MAP)
			.bindPopup(MARKER => {
				var val = MARKER.feature.properties.name_short.substring(1,3)
				var loc = "./seznam_etap.html#etapa"+val; 
				var x = '<a href="' + loc + '">'+MARKER.feature.properties.name_short+'</a>, '+MARKER.feature.properties.Npotints + ' bodů'
				return x;
			});
		
		LAYERS.addOverlay(TT_CLUSTER, "Mapa etap");

		var legend = L.control({position: 'bottomright'});
		legend.onAdd = function (MAP) {
			var div = L.DomUtil.create('div', 'info legend'),
				grades = [0, 3, 10, 15, 20],
				labels = [],
				from, to;
			for (var i = 0; i < grades.length; i++) {
				from = grades[i];
				to = grades[i + 1];
				labels.push(
					'<i style="background:' + getColor(from + 1) + '"></i> ' +
					from + (to ? '&ndash;' + to : '+') + ' km');
				}
			div.innerHTML = labels.join('<br>');
			return div;
			}	
		legend.addTo(MAP);	
	});