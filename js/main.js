const BROKER_URL = 'http://api.thingtia.cloud/data/myProvider1'
const IDENTITY_KEY = 'c61a6bfe99345f8912c455c9f80f04221fdfb9f094619063518481404564ae77'
const NEIGHBOUR_DISTANCE_THRESHOLD = 100;

function distance(lat1, long1, lat2, long2) {
  lat1 = lat1*(Math.PI)*(1.0/180.0)
  lat2 = lat2*(Math.PI)*(1.0/180.0)
  long1 = long1*(Math.PI)*(1.0/180.0)
  long2 = long2*(Math.PI)*(1.0/180.0)
  varlat = lat2 - lat1
  varlong = long2 - long1
  b = Math.sin(varlong/2)
  d = Math.sin(varlat/2)
  a = d*d+Math.cos(lat1)*Math.cos(lat2)*b*b
  c = 2*Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return 6378137*c
}

function valueRoutes(sensors, rutes) {
  let lux = []
  for(let i = 0; i < rutes.length; i++){
    let amountlux = 0
    let numberlux = 0
    for(let j = 0; j < rutes[i].length; j++) {
      const currentlat = rutes[i][j].lat()
      const currentlong = rutes[i][j].lng()
      let closest = NEIGHBOUR_DISTANCE_THRESHOLD
      let closestval = 0
      for(let k = 0; k< sensors.length; k++) {
        const auxlat = sensors[k].lat
        const auxlong = sensors[k].lng
        const auxval = sensors[k].value
        const distancia = distance(currentlat, currentlong, auxlat, auxlong)
        if(distancia < NEIGHBOUR_DISTANCE_THRESHOLD && distancia < closest) {
          closest = distancia
          closestval = auxval
        }
      }
      if(closest < NEIGHBOUR_DISTANCE_THRESHOLD){
        numberlux++
        amountlux += closestval
      }
    }
    if (numberlux > 0) lux.push(amountlux/numberlux)
    else lux.push(0)
      
  }
  return lux;
}


function displayRoute() {
  directionsService.route({
    origin: new google.maps.LatLng(41.377118, 2.171646),
    destination: new google.maps.LatLng(41.385321, 2.173234),
    travelMode: 'WALKING',
    provideRouteAlternatives: true,
  }, function(response, status) {
    if (status === 'OK') {
      directionsDisplay.setDirections(response);
    } else {
      window.alert('Directions request failed due to ' + status);
    }
  });
}

function displaySensors() {
  if (!heatmap) {
    heatmap = new HeatmapOverlay(map, {
      radius: 0.001,
      maxOpacity: 0.5, 
      scaleRadius: true,
      useLocalExtrema: true
    })
  }
  
  heatmap.setData({
    max: 8,
    data: sensorData
  })
}

function parseSensorData(resp) {
    return JSON.parse(resp)
}

function genData() {
  const from = {
    lat: 41.392101,
    lon: 2.130498
  }
  const to = {
    lat: 41.359744,
    lon: 2.171751
  }
  const n = 500
  let res = []
  for (i = 0; i < n; ++i) {
    res.push({
      lat: Math.random() * (to.lat - from.lat) + from.lat,
      lng: Math.random() * (to.lon - from.lon) + from.lon,
      value: Math.random()
    })
  }
  return res
}

function getSensorData() {
  $.when(getSensorLocationRequest(), getSensorValueRequest()).done(function (sloc, sval) {
    if (sloc[1] === 'success' && sval[1] === 'success') {
      console.log('locations: ', sloc[0].providers[0].sensors)
      console.log('values: ', sloc[1].sensors)
    } else {
      console.log('Some sensor data couldn\'t be fetched')
      console.log(sloc, sval)
    }
  })
}


function getSensorLocationRequest() {
  return $.ajax({
    dataType: "json",
    url: 'http://api.thingtia.cloud/catalog/',
    type: 'GET',
    beforeSend: function(xhr) {
        xhr.setRequestHeader('IDENTITY_KEY', IDENTITY_KEY)
      }
  })
}

function getSensorValueRequest() {
  return $.ajax({
    dataType: "json",
    url: 'http://api.thingtia.cloud/data/myProvider1',
    type: 'GET',
    beforeSend: function(xhr) {
        xhr.setRequestHeader('IDENTITY_KEY', IDENTITY_KEY)
      }
  })
}

function display() {
  sensorData = genData()
  displaySensors()
  displayRoute()
}

function recomputeBestRoute() {
  if (directionsDisplay && directionsDisplay.getDirections()) {
    const routes_points = directionsDisplay.getDirections()
      .routes.map(function (r) {
        return r.overview_path
      })
      console.log(routes_points)
    const valuation = valueRoutes(sensorData, routes_points)
    console.log(valuation)  
  }
}

display()