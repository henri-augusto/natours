/* eslint-disable */
const locations = JSON.parse(document.getElementById('map').dataset.locations);

const map = new mapboxgl.Map({
  scrollZoom: false,
  animate: false,
  container: 'map',
  style: 'mapbox://styles/henriv-augusto/cllflzk6n01nb01qlejendwvz',
  accessToken:
    'pk.eyJ1IjoiaGVucml2LWF1Z3VzdG8iLCJhIjoiY2xsZmx4b2c3MDI4ODNlbnprMThtdGs1MiJ9.E7LiJb1dVqKBogE830UVXw',
  //   center: [-123.1121, 49.2569],
  //   zoom: 12,
  //   interactive: false,
});

const bounds = new mapboxgl.LngLatBounds();

locations.forEach((loc) => {
  // Cria o marcador
  const el = document.createElement('div');
  el.className = 'marker';

  // Adiciona o marcador
  new mapboxgl.Marker({
    element: el,
    anchor: 'bottom',
  })
    .setLngLat(loc.coordinates)
    .addTo(map);

  // Adcionando popup
  new mapboxgl.Popup({ offset: 30, focusAfterOpen: false })
    .setHTML(`<p>Day ${loc.day}: ${loc.description}</>`)
    .setLngLat(loc.coordinates)
    .addTo(map);

  // Extend mapa bound para incluir a localização atual
  bounds.extend(loc.coordinates);
});

map.fitBounds(bounds, {
  padding: { top: 200, bottom: 150, left: 200, right: 200 },
});
