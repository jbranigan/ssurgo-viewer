import React from 'react';
import ReactDOM from 'react-dom';
import ol from 'openlayers';
import {addLocaleData, IntlProvider} from 'react-intl';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import Zoom from '@boundlessgeo/sdk/components/Zoom';
import MapPanel from '@boundlessgeo/sdk/components/MapPanel';
import LayerList from '@boundlessgeo/sdk/components/LayerList';
import InfoPopup from '@boundlessgeo/sdk/components/InfoPopup';
import injectTapEventPlugin from 'react-tap-event-plugin';
import enLocaleData from 'react-intl/locale-data/en';
import enMessages from '@boundlessgeo/sdk/locale/en';
// TODO: switch styling to ol-mapbox-style
//import { apply } from 'ol-mapbox-style';

// Needed for onTouchTap
// Can go away when react 1.0 release
// Check this repo:
// https://github.com/zilverline/react-tap-event-plugin
injectTapEventPlugin();

addLocaleData(
  enLocaleData
);

var gsLayer = 'ssurgo:soil_types';
var gsLayerEspg = '900913';

var baseStyle = new ol.style.Style({
  fill: new ol.style.Fill({
    color: 'rgba(186,221,105,0.5)'
  }),
  stroke: new ol.style.Stroke({
    color: '#999',
    width: 0.25
  })
});

var map = new ol.Map({
  controls: [new ol.control.Attribution({collapsible: false})],
  layers: [
    new ol.layer.Group({
      type: 'base-group',
      title: 'Base maps',
      layers: [
        new ol.layer.Tile({
          type: 'base',
          title: 'OSM Streets',
          source: new ol.source.OSM()
        }),
        new ol.layer.Tile({
          type: 'base',
          title: 'ESRI world imagery',
          visible: false,
          source: new ol.source.XYZ({
            attributions: [
              new ol.Attribution({
                html:['Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community']
              })
            ],
            url: 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
          })
        })
      ]
    }),
    new ol.layer.VectorTile({
      // TODO: how do I access this from another part of the app?
      title: 'soils',
      id: 'soils',
      popupInfo: '<strong>[muname]</strong><p>Drainage: [drclassdcd]</p>',
      geometryType: 'Polygon',
      attributes: ['musym', 'muname', 'drclassdcd'],
      style: baseStyle,
      source: new ol.source.VectorTile({
        tilePixelRatio: 1,
        tileGrid: ol.tilegrid.createXYZ({maxZoom: 19}),
        format: new ol.format.MVT(),
        url: 'http://localhost:8080/geoserver/gwc/service/tms/1.0.0/' + gsLayer +
            '@EPSG%3A' + gsLayerEspg + '@pbf/{z}/{x}/{-y}.pbf'
      })
    })
  ],
  view: new ol.View({
    center: ol.proj.transform([-76.9347, 40.8104], 'EPSG:4326', 'EPSG:3857'),
    zoom: 12
  })
});

// fetch('mb-styles/drainage.json').then(function(response) {
//     response.json().then(function(glStyle) {
//         olms.applyStyle(soils, glStyle, 'map-units').then(function() {
//             map.addLayer(soils);
//         });
//     });
// });

class MyApp extends React.Component {
  getChildContext() {
    return {
      muiTheme: getMuiTheme()
    };
  }
  render() {
    return (
      // TODO: why is this not showing in the react debugger?
       <div id='content'>
        <MapPanel id='map' map={map} />
        <div id='layer-list'><LayerList collapsible={false} allowLabeling={false} map={map}/></div>
        <div id='zoom-buttons'><Zoom map={map} /></div>
        <div id='popup' className='ol-popup'><InfoPopup toggleGroup='navigation' map={map} /></div>
      </div>
    );
  }
}

MyApp.childContextTypes = {
  muiTheme: React.PropTypes.object
};

ReactDOM.render(<IntlProvider locale='en' messages={enMessages}><MyApp /></IntlProvider>, document.getElementById('main'));
