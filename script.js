mapboxgl.accessToken = "pk.eyJ1IjoiZGFuaWVsODEwMTciLCJhIjoiY21rZWI2eGg4MDU5NjNscHdxbjhkMTNmciJ9.jdsMukp7zHz3llySNBJs0A"

const map = new mapboxgl.Map(
    {
        container: 'main-map1',
        style: 'mapbox://styles/daniel81017/cmlofzis0001i01qn3jjqaxjd',
        center: [-79.39516, 43.66338],
        zoom: 14,
    }
);

map.on('load', () => {
    map.addSource('map-data', {
        type: 'geojson',
        data: "https://raw.githubusercontent.com/daniel81017/Lab3/refs/heads/main/lab3.geojson",
    });

    map.addLayer({
        'id': 'official-bikelanes',
        'type': 'line',
        'source': 'map-data',
        'paint': {
            'line-width': 1.5,
            'line-color': '#22f513'
        },
        'filter': ['==', ['geometry-type'], 'LineString'],
    });

    map.addLayer({
        'id': 'study-spots',
        'type': 'circle',
        'source': 'map-data',
        'paint': {
            'circle-width': 10,
            'circle-color': '#0d5bd1',
            'circle-outline': 2,
        },
        'filter': ['==', ['geometry-type'], 'Point'],
    });
// CREATE FILL OPACITY + CHANGING TRANSPARENCY W/ SCROLL
    map.addLayer({
        'id': 'campus',
        'type': 'line',
        'source': 'map-data',
        'paint': {
            'line-width': 3,
            'line-color': '#ff0000'
        },
        'filter': ['==', ['geometry-type'], 'Polygon'],
    });
// CHANGE CLICKS TO BE FOR UOFT
    map.addInteraction('study-spots-click-interaction', {
        type: 'click',
        target: {layerId: 'study-spots'},
        handler: (e) => {
            console.log("e =", e);
            const coordinates = e.feature.geometry.coordinates.slice();
            const description = e.feature.properties.description;
            
            new mapboxgl.Popup()
                .setLngLat(coordinates)
                .setHTML(description)
                .addTo(map);
        }
    });
});

//Filter source: https://github.com/mapbox/mapbox-gl-js/issues/6508
//Detached head solution: https://stackoverflow.com/questions/10228760/how-do-i-fix-a-git-detached-head
//Mapbox GL JS Docs pop-up on click source: https://docs.mapbox.com/mapbox-gl-js/example/popup-on-click/