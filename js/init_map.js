let map
let sensorData
let heatmap

let directionsService
let directionsDisplay

function initMap() {
  const BCN_LOC = new google.maps.LatLng(41.390205, 2.154007)
  map = new google.maps.Map(document.getElementById('map'), {
    center: BCN_LOC,
    zoom: 15,
    zoomControl: true,
    zoomControlOptions: {
      position: google.maps.ControlPosition.RIGHT_CENTER
    },
    mapTypeControl: true,
    mapTypeControlOptions: {
        style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
        position: google.maps.ControlPosition.LEFT_BOTTOM
    },
    streetViewControl: true,
    streetViewControlOptions: {
      position: google.maps.ControlPosition.RIGHT_BOTTOM
    },
  });
  directionsService = new google.maps.DirectionsService()
  directionsDisplay = new google.maps.DirectionsRenderer({
    hideRouteList: false
  })
  directionsDisplay.setMap(map);
  
  // auto complete
  const originInput = document.getElementById('maps-origin')
  const originAuto = new google.maps.places.Autocomplete(originInput)
  originAuto.bindTo('bounds', map)
  
  const infoWindow = new google.maps.InfoWindow()
  const originMarker = new google.maps.Marker({
    map: map,
    anchorPoint: new google.maps.Point(0, -29)
  })
  
  originAuto.addListener('place_changed', function() {
    infoWindow.close()
    originMarker.setVisible(false)
    const place = originAuto.getPlace()
    if (!place.geometry) {
      alert("No details available for input " + place.name)
      return
    }
    // If the place has a geometry, then present it on a map.
    if (place.geometry.viewport) {
      map.fitBounds(place.geometry.viewport);
    } else {
      map.setCenter(place.geometry.location);
      map.setZoom(17);  // Why 17? Because it looks good.
    }
    originMarker.setIcon(/** @type {google.maps.Icon} */({
      url: place.icon,
      size: new google.maps.Size(71, 71),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(17, 34),
      scaledSize: new google.maps.Size(35, 35)
    }));
    originMarker.setPosition(place.geometry.location);
    originMarker.setVisible(true);
    
    let address = '';
    if (place.address_components) {
      address = [
        (place.address_components[0] && place.address_components[0].short_name || ''),
        (place.address_components[1] && place.address_components[1].short_name || ''),
        (place.address_components[2] && place.address_components[2].short_name || '')
      ].join(' ');
    }
    infoWindow.setContent('<div><strong>' + place.name + '</strong><br>' + address)
    infoWindow.open(map, originMarker)
  })
  
}