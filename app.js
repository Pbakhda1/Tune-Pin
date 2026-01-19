let map;
let searchBox;
let editor;
let currentLatLng = null;
let markers = [];

const STORAGE_KEY = "tunepin_pins";

function initMap() {
  editor = document.getElementById("editor");

  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 34.0489, lng: -111.0937 },
    zoom: 6,
  });

  const input = document.getElementById("searchBox");
  searchBox = new google.maps.places.SearchBox(input);
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

  map.addListener("click", (e) => {
    currentLatLng = e.latLng;
    openEditor();
  });

  searchBox.addListener("places_changed", () => {
    const places = searchBox.getPlaces();
    if (!places.length) return;
    const place = places[0];
    map.panTo(place.geometry.location);
    map.setZoom(14);
    currentLatLng = place.geometry.location;
    openEditor();
    document.getElementById("titleInput").value = place.name || "";
  });

  document.getElementById("dropPinBtn").onclick = () => {
    currentLatLng = map.getCenter();
    openEditor();
  };

  document.getElementById("closeEditorBtn").onclick = closeEditor;
  document.getElementById("savePinBtn").onclick = savePin;
  document.getElementById("resetPinsBtn").onclick = resetPins;

  loadPins();
}

function openEditor() {
  editor.style.display = "block";
}

function closeEditor() {
  editor.style.display = "none";
  clearEditor();
}

function clearEditor() {
  ["titleInput","songInput","instagramInput","facebookInput","xInput"]
    .forEach(id => document.getElementById(id).value = "");
}

function savePin() {
  if (!currentLatLng) return;

  const pin = {
    lat: currentLatLng.lat(),
    lng: currentLatLng.lng(),
    title: titleInput.value,
    song: songInput.value,
    ig: instagramInput.value,
    fb: facebookInput.value,
    x: xInput.value,
  };

  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  saved.push(pin);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));

  addMarker(pin);
  closeEditor();
}

function addMarker(pin) {
  const marker = new google.maps.Marker({
    position: { lat: pin.lat, lng: pin.lng },
    map,
    title: pin.title || "Tune Pin",
  });

  const html = `
    <strong>${pin.title || "Tune Pin"}</strong><br>
    ${pin.song ? `<a href="${pin.song}" target="_blank">🎵 Song</a><br>` : ""}
    ${pin.ig ? `<a href="${pin.ig}" target="_blank">Instagram</a><br>` : ""}
    ${pin.fb ? `<a href="${pin.fb}" target="_blank">Facebook</a><br>` : ""}
    ${pin.x ? `<a href="${pin.x}" target="_blank">X</a>` : ""}
  `;

  const info = new google.maps.InfoWindow({ content: html });
  marker.addListener("click", () => info.open(map, marker));

  markers.push(marker);
}

function loadPins() {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  saved.forEach(addMarker);
}

function resetPins() {
  if (!confirm("Clear all pins?")) return;
  localStorage.removeItem(STORAGE_KEY);
  markers.forEach(m => m.setMap(null));
  markers = [];
}
