mapboxgl.accessToken = "pk.eyJ1IjoiZGFuaWVsODEwMTciLCJhIjoiY21rZWI2eGg4MDU5NjNscHdxbjhkMTNmciJ9.jdsMukp7zHz3llySNBJs0A"

const map = new mapboxgl.Map(
    {
        container: 'main-map1',
        style: 'mapbox://styles/daniel81017/cmlofzis0001i01qn3jjqaxjd',
        center: [-0.02421, 51.58095],
        zoom: 12.5,
    }
);

map.on('load', () => {
    map.addSource('walthamstow-data', {
        type: 'geojson',
        data: "https://raw.githubusercontent.com/daniel81017/Lab2/refs/heads/main/walthamstow.geojson",
    });

    map.addLayer({
        'id': 'walthamstow-lines',
        'type': 'line',
        'source': 'walthamstow-data',
        'paint': {
            'line-width': 3,
            'line-color': '#210059'
        },
        'filter': ['==', ['geometry-type'], 'LineString'],
    });

    map.addLayer({
        'id': 'walthamstow-points',
        'type': 'circle',
        'source': 'walthamstow-data',
        'paint': {
            'circle-width': 10,
            'circle-color': '#000000',
            'circle-outline': 2,
        },
        'filter': ['==', ['geometry-type'], 'Point'],
    });
    map.addLayer({
        'id': 'walthamstow-polygon',
        'type': 'line',
        'source': 'walthamstow-data',
        'paint': {
            'line-width': 3,
            'line-color': '#ff0000'
        },
        'filter': ['==', ['geometry-type'], 'Polygon'],
    });

    map.addInteraction('walthamstow-click-interaction', {
        type: 'click',
        target: {layerId: 'walthamstow-points'},
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