// alert("Hello, this web app was built as a class project during a Web mapping course  at Louisiana State University. I Cannot garantee the accuracy of the data presented here. The project was build to practice web map making using leaflet.");
$( function() {
  $( "#dialog" ).dialog();
} );
//***********initialize the map*********************
var mymap = L.map('mapdiv', {
  zoomControl: false
}).setView([42.45234, -76.5033], 11)

//***********Controls********************************
// create the sidebar instance and add it to the map
var sidebar = L.control.sidebar('sidebar').addTo(mymap);

var ctlSearch = L.Control.openCageSearch({
  key: '7c9b02ee0f4040c49e96b1a5260da0e3',
  limit: 10,
  placeholder: "Type an address to seach",
  position: 'topright',
  errorMessage: 'Nothing found.',
  collapsed: false,
  expand: 'click'
}).addTo(mymap);

var zoomHome = L.Control.zoomHome({
  zoomControl: true,
  position: 'topleft'
}).addTo(mymap);

var ctlPan = L.control.pan().addTo(mymap);
var ctlMousePosition = L.control.mousePosition().addTo(mymap);
// var ctlSidebar = L.control.sidebar('side-bar').addTo(mymap);

var ctlScale = L.control.scale({
  maxWidth: 200,
  position: 'bottomleft',
  imperial: false,
}).addTo(mymap);

var ctlMeasure = L.control.polylineMeasure().addTo(mymap);




//************ Base maps and overlays******************
var lyrOSM = L.tileLayer.provider('OpenStreetMap.Mapnik', {
  attribution: false
});
var lyrTopo = L.tileLayer.provider('OpenTopoMap', {
  minZoom: 0,
  maxZoom: 18,
  attribution: false
});
var lyrImagery = L.tileLayer.provider('Esri.WorldImagery', {
  attribution: false
});
var lyrOutdoors = L.tileLayer.provider('Thunderforest.Outdoors', {
  attribution: false
});
var lyrCarto = L.tileLayer.provider('CartoDB.Positron', {
  attribution: false
}).addTo(mymap);

var miniMap = new L.Control.MiniMap(lyrTopo,{
  toggleDisplay:true
}).addTo(mymap);
// Basemap variables
var objBasemaps = {
  "Imagery": lyrImagery,
  "Open Street Maps": lyrOSM,
  "Outdoors": lyrOutdoors,
  "CartoDB": lyrCarto
};

//Fire Stattion layer
var fireStations = L.geoJSON.ajax('https://dl.dropboxusercontent.com/s/49blbir6w73sbjw/fireStations.geojson', {
  //return a marker
  pointToLayer: firestationMarkers
}).addTo(mymap);
//Zoom to fire stations
// fireStations.on('data:loaded', function() {
//   mymap.fitBounds(fireStations.getBounds())
// });

//Fire stations tooltip
function firestationMarkers(json, latlng) {
  var att = json.properties;
  return L.circleMarker(latlng, {
    radius: 10,
    color: 'deeppink'
  }).bindTooltip("<h6>Station: </h6>" + att.PLACENAME + "<h6>Phone: </h6>" + att.Phone);
};

var fireStationIcon = L.icon({
  iconUrl: 'src/plugins/images/fire-station-15.svg',
  iconRetinaUrl: 'src/plugins/images/fire-station-15.svg',
  iconSize: [24, 24]
});

//Flood zones layer
var floodzones = L.geoJSON.ajax('https://dl.dropboxusercontent.com/s/r201hdhdaa5s69f/floodZones.geojson', {
  style: styleFlood,
  onEachFeature: propcessFlood
}).addTo(mymap);

function styleFlood(json) {
  var att = json.properties;
  switch (att.ZONE) {
    case 'A':
      return {
        color: 'red', fillcolor: 'red',
          weight: 1,
          fillOpacity: 0.5
      }
      break;
    case 'AE':
      return {
        color: 'yellow', fillcolor: 'yellow',
          weight: 1,
          fillOpacity: 0.5
      }
      break;
    case 'X500':
      return {
        color: 'green', fillcolor: 'green',
          weight: 1,
          fillOpacity: 0.5
      }
      break;
  }
};

function propcessFlood(json, lyr) {
  var att = json.properties;
  lyr.bindTooltip("<h6>Flood Zone: </h6>" + att.ZONE + "<br>" + "<h6>Town: </h6>" +
    att.FULLNAME)
};

/////////////*********Building layer************///////////
var arbuildingsIDs = [];
var buildings = L.geoJSON.ajax('https://dl.dropboxusercontent.com/s/qb2zsihfbpot3gk/buildings.geojson', {
  color: '#999999',
  fillcolor: '#999999',
  weight: 0,
  fillOpacity: 0.8,
  onEachFeature: processBuildings
});
//autocomplete
// buildings.on('data:loaded',function(){
//   arbuildingsIDs.sort();
//   $("#txtFindProject").autocomplete({
//     source:arbuildingsIDs
//   });
// });
//
function processBuildings(json, lyr) {
  var att = json.properties;
  lyr.bindTooltip("<h6>Building tyoe: </h6>" + att.BTYPE);
  arbuildingsIDs.push(att.FID.toString());
};
//************SEARCH BOX***********************
var lyrSearch;
function returnBuildingByID(id) {
  var arLayers = buildings.getLayers();
  for (i = 0; i < arLayers.length - 1; i++) {
    var featureID = arLayers[i].feature.properties.FID;
    if (featureID == id) {
      return arLayers[i];
    }
  }
  return false;
}
//Event handler for the button click event
$("#btnFindProject").click(function() {
  var id = $("#txtFindProject").val();
  var lyr = returnBuildingByID(id);
  if (lyr) {
    if (lyrSearch) {
      lyrSearch.remove();
    }
    lyrSearch = L.geoJSON(lyr.toGeoJSON(), {
      style: {
        color: 'green',
        opacity: 1
      }
    }).addTo(mymap);
    //zoom to the feature
    // Get bounds of polygon
    var bounds = lyr.getBounds();
    // Get center of bounds
    var center = bounds.getCenter();
    mymap.fitBounds(bounds.pad(10));
    // Use center to put marker on map
    var marker = L.marker(center).addTo(mymap);
    var att = lyr.feature.properties;
    $("#divProjectData").html("<h6>Usage: </h6>" + att.BTYPE);
  } else {
    $("#divProjectError").html("***Building ID not found***");
  }
});


//////***********Parcel LAYER SEARCH******//////////
// var parcels = L.geoJSON.ajax('https://dl.dropboxusercontent.com/s/5ko88tng65uc7pg/parcels.geojson');
// var arParcelsIDs = []
// var parcels = L.geoJSON.ajax('data/parcels.geojson', {
//   color: '#999999',
//   fillcolor: '#999999',
//   weight: 0,
//   fillOpacity: 0.8,
//   onEachFeature: processParcels
// });
//
// function processParcels(json, lyr) {
//   var att = json.properties;
//   lyr.bindTooltip("<h6>Parcel's Occupation: </h6>" + att.DESCRIPTIO);
//   //Parcel search by key
//   var lyrParcelSearch;
//
//   function returnParcelByID(id) {
//     var arParcelLayers = parcels.getLayers();
//     for (i = 0; i < arParcelLayers.length - 1; i++) {
//       var featureID = arParcelLayers[i].feature.properties.PARCELKEY;
//       if (featureID == id) {
//         return arParcelLayers[i];
//       }
//     }
//     return false;
//   }
//   //Event handler for the button click event
//   $("#btnFindParcelProject").click(function() {
//     var id = $("#txtFindParcelProject").val();
//     var lyrParcel = returnParcelByID(id);
//     if (lyrParcel) {
//       if (lyrParcelSearch) {
//         lyrParcelSearch.remove();
//       }
//       lyrParcelSearch = L.geoJSON(lyrParcel.toGeoJSON(), {
//         style: {
//           color: 'blue',
//           opacity: 1
//         }
//       }).addTo(mymap);
//       //zoom to the feature
//       // Get bounds of polygon
//       var parcelBounds = lyrParcel.getBounds();
//       // Get center of bounds
//       var parcelCenter = parcelBounds.getCenter();
//       mymap.fitBounds(parcelBounds.pad(10));
//       // Use center to put marker on map
//       var parcelMarker = L.marker(parcelCenter).addTo(mymap);
//       var att = lyrParcel.feature.properties;
//       $("#divParcelProjectData").html("<h6>Occupied by: </h6>" + att.DESCRIPTIO);
//     } else {
//       $("#divParcelProjectError").html("***Parcel key not found***");
//     }
//   });

  /////////************School Districts layer**************////////
  var schooldistricts = L.geoJSON.ajax('https://dl.dropboxusercontent.com/s/nuhu3f5hjneugzt/schooldistricts.geojson', {
    style: styleSchooldistricts,
    onEachFeature: processSchooldistricts
  });

  function styleSchooldistricts(json) {
    var att = json.properties;
    switch (att.NAME) {
      case 'HOMER CENTRAL SCHOOL DISTRICT':
        return {
          color: '#a6cee3', fillcolor: '#a6cee3',
            weight: 1,
            fillOpacity: 0.3
        }
        break;
      case 'SOUTH SENECA CENTRAL SCHOOL DISTRICT':
        return {
          color: '#1f78b4', fillcolor: '#1f78b4',
            weight: 1,
            fillOpacity: 0.3
        }
        break;
      case 'GROTON CENTRAL SCHOOL DISTRICT':
        return {
          color: '#b2df8a', fillcolor: '#b2df8a',
            weight: 1,
            fillOpacity: 0.3
        }
        break;
      case 'MORAVIA CENTRAL SCHOOL DISTRICT':
        return {
          color: '#33a02c', fillcolor: '#33a02c',
            weight: 1,
            fillOpacity: 0.3
        }
        break;
      case 'LANSING CENTRAL SCHOOL DISTRICT':
        return {
          color: '#fb9a99', fillcolor: '#fb9a99',
            weight: 1,
            fillOpacity: 0.3
        }
        break;
      case 'TRUMANSBURG CENTRAL SCHOOL DISTRICT':
        return {
          color: '#e31a1c', fillcolor: '#e31a1c',
            weight: 1,
            fillOpacity: 0.3
        }
        break;
      case 'DRYDEN CENTRAL SCHOOL DISTRICT':
        return {
          color: '#fdbf6f', fillcolor: '#fdbf6f',
            weight: 1,
            fillOpacity: 0.3
        }
        break;
      case 'GEORGE JR REPUBLIC UNION FREE SCHOOL DISTRICT':
        return {
          color: '#ff7f00', fillcolor: '#ff7f00',
            weight: 1,
            fillOpacity: 0.3
        }
        break;
      case 'ITHACA CITY SCHOOL DISTRICT':
        return {
          color: '#cab2d6', fillcolor: '#cab2d6',
            weight: 1,
            fillOpacity: 0.3
        }
        break;
      case 'NEWFIELD CENTRAL SCHOOL DISTRICT':
        return {
          color: '#6a3d9a', fillcolor: '#6a3d9a',
            weight: 1,
            fillOpacity: 0.3
        }
        break;
      case 'CANDOR CENTRAL SCHOOL DISTRICT':
        return {
          color: '#ffff99', fillcolor: '#ffff99',
            weight: 1,
            fillOpacity: 0.3
        }
        break;
      case 'ODESSA-MONTOUR CENTRAL SCHOOL DISTRICT':
        return {
          color: '#b15928', fillcolor: '#b15928',
            weight: 1,
            fillOpacity: 0.3
        }
        break;
      case 'NEWARK VALLEY CENTRAL SCHOOL DISTRICT':
        return {
          color: 'cd4dcc', fillcolor: 'cd4dcc',
            weight: 1,
            fillOpacity: 0.3
        }
        break;
      case 'SPENCER-VAN ETTEN CENTRAL SCHOOL DISTRICT':
        return {
          color: '#297ca0', fillcolor: '#297ca0',
            weight: 1,
            fillOpacity: 0.3
        }
        break;
    }
  };

  function processSchooldistricts(json, lyr) {
    var att = json.properties;
    lyr.bindTooltip(att.NAME)
  };


  //Municipalities layer
  var municipalities = L.geoJSON.ajax('https://dl.dropboxusercontent.com/s/ex5gisdw2xtdptl/municipalities.geojson', {
    style: styleMunicipalities,
    onEachFeature: processMunicipalities
  });

  function styleMunicipalities(json) {
    var att = json.properties;
    switch (att.FULLNAME) {
      case 'TOWN OF GROTON':
        return {
          color: '#a6cee3', fillcolor: '#a6cee3',
            weight: 1,
            fillOpacity: 0.3
        }
        break;
      case 'CITY OF ITHACA':
        return {
          color: '#1f78b4', fillcolor: '#1f78b4',
            weight: 1,
            fillOpacity: 0.3
        }
        break;
      case 'TOWN OF ENFIELD':
        return {
          color: '#b2df8a', fillcolor: '#b2df8a',
            weight: 1,
            fillOpacity: 0.3
        }
        break;
      case 'TOWN OF CAROLINE':
        return {
          color: '#33a02c', fillcolor: '#33a02c',
            weight: 1,
            fillOpacity: 0.3
        }
        break;
      case 'VILLAGE OF FREEVILLE':
        return {
          color: '#fb9a99', fillcolor: '#fb9a99',
            weight: 1,
            fillOpacity: 0.3
        }
        break;
      case 'VILLAGE OF GROTON':
        return {
          color: '#e31a1c', fillcolor: '#e31a1c',
            weight: 1,
            fillOpacity: 0.3
        }
        break;
      case 'VILLAGE OF DRYDEN':
        return {
          color: '#fdbf6f', fillcolor: '#fdbf6f',
            weight: 1,
            fillOpacity: 0.3
        }
        break;
      case 'TOWN OF NEWFIELD':
        return {
          color: '#ff7f00', fillcolor: '#ff7f00',
            weight: 1,
            fillOpacity: 0.3
        }
        break;
      case 'TOWN OF DANBY':
        return {
          color: '#cab2d6', fillcolor: '#cab2d6',
            weight: 1,
            fillOpacity: 0.3
        }
        break;
      case 'TOWN OF LANSING':
        return {
          color: '#6a3d9a', fillcolor: '#6a3d9a',
            weight: 1,
            fillOpacity: 0.3
        }
        break;
      case 'TOWN OF ITHACA':
        return {
          color: '#ffff99', fillcolor: '#ffff99',
            weight: 1,
            fillOpacity: 0.3
        }
        break;
      case 'VILLAGE OF CAYUGA HEIGHTS':
        return {
          color: '#b15928', fillcolor: '#b15928',
            weight: 1,
            fillOpacity: 0.3
        }
        break;
      case 'VILLAGE OF LANSING':
        return {
          color: 'cd4dcc', fillcolor: 'cd4dcc',
            weight: 1,
            fillOpacity: 0.3
        }
        break;
      case 'TOWN OF ULYSSES':
        return {
          color: '#297ca0', fillcolor: '#297ca0',
            weight: 1,
            fillOpacity: 0.3
        }
        break;
      case 'VILLAGE OF TRUMANSBURG':
        return {
          color: '#91bd3a', fillcolor: '#91bd3a',
            weight: 1,
            fillOpacity: 0.3
        }
        break;
      case 'TOWN OF DRYDEN':
        return {
          color: '#dff6f0', fillcolor: '#dff6f0',
            weight: 1,
            fillOpacity: 0.3
        }
        break;
    }
  };

  function processMunicipalities(json, lyr) {
    var att = json.properties;
    lyr.bindTooltip(att.FULLNAME)
  };

  //Overlays
  var objOverlays = {
    "Municipalities": municipalities,
    "Schooldistrics": schooldistricts,
    "Builgings": buildings,
    "Flood Zones": floodzones,
    "Fire Stations": fireStations
  };

  //Base map control
  var ctlLayers = L.control.layers(objBasemaps, objOverlays, {
    collapsed: true
  }).addTo(mymap);


  //***************Event Handlers***************
  // Detect current location

$("#btnLocate").click(function(){
  mymap.locate();
})


  var mrkCurrentLocation;
  //if inof ok
  mymap.on('locationfound', function(e) {
    if (mrkCurrentLocation) {
      mrkCurrentLocation.remove();
    } //add a circle marker and zoom to the location
    mrkCurrentLocation = L.circleMarker(e.latlng, {
      radius: e.accuracy / 2
    }).addTo(mymap);
    mymap.setView(e.latlng, 14);
  });
  //if no info
  mymap.on('locationerror', function(e) {
    alert("Location not found");
  });

  // Slider opacity
  // $('#sldOpacity').on('change', function() {
  //   $('#flood-opacity').html(this.value);

    // call the baton rouge layer
  //   floodzones.setOpacity(this.value)
  // });
