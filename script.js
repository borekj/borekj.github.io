"use strict";

const MAP = L.map('map').setView([49.7, 16], 7)
const URL_OSM = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const OSM = L.tileLayer(URL_OSM)
MAP.addLayer(OSM)




