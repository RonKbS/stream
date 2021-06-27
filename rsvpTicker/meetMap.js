

let meetupMap = L.map(
  'mapid', {
    zoomControl: false,
    dragging: false,
    doubleClickZoom: false,
    boxZoom: false,
    doubleClickZoom: false
}
).setView([23.56, 107.57], 2);


L.tileLayer('https://tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png', {
  attribution: "&copy; <a href='http://osm.org/copyright'>OpenStreetMap</a> contributors",
}).addTo(meetupMap);


meetupMap.createPane('choroplethPane');
meetupMap.getPane('choroplethPane').style.zIndex = 400;


let meetups = L.control({ position: "bottomright" });
meetups.onAdd = map => {
  let div_ = L.DomUtil.create('div');
  div_.id = "rsvp-detail"
  return div_
}
meetups.addTo(meetupMap);
