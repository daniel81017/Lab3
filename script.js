//Mapbox Public Token
mapboxgl.accessToken = "pk.eyJ1IjoiZGFuaWVsODEwMTciLCJhIjoiY21rZWI2eGg4MDU5NjNscHdxbjhkMTNmciJ9.jdsMukp7zHz3llySNBJs0A"

//Map with default center and zoom
const map = new mapboxgl.Map(
    {
        container: 'main-map1',
        style: 'mapbox://styles/daniel81017/cmlofzis0001i01qn3jjqaxjd',
        center: [-79.39516, 43.66338],
        zoom: 14,
    }
);

//Variable for the hover event filling the campus boundary (placed here for consistency purposes)
let hoveredPolygonId = null;

//Following map load, spatial data (GeoJSON file) is referenced from the remote repository, with its layers symbolized and added to the map
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

    map.addLayer({
        'id': 'campus-fill',
        'type': 'fill',
        'source': 'map-data',
        'layout': {},
        'paint': {
            'fill-color': '#627BC1', //CHANGE FILL COLOUR
            'fill-opacity': [
                'case',
                ['boolean', ['feature-state', 'hover'], false], //INTERPRET ARRAY CORRECTLY
                0.75,
                0.2
            ]
        },
        'filter': ['==', ['geometry-type'], 'Polygon'],
    });

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

    map.addInteraction('study-spots-click-interaction', {
        type: 'click',
        target: { layerId: 'study-spots' },
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

    //Fill campus boundary with mouse hover
    map.on('mousemove', 'campus-fill', (e) => {
        if (e.features.length > 0) {
            if (hoveredPolygonId !== null) {
                map.setFeatureState(
                    { source: 'map-data', id: hoveredPolygonId },
                    { hover: false }
                );
            }
            hoveredPolygonId = e.features[0].id;
            map.setFeatureState(
                { source: 'map-data', id: hoveredPolygonId },
                { hover: true }
            );
        }
    });

    map.on('mouseleave', 'campus-fill', () => {
        if (hoveredPolygonId !== null) {
            map.setFeatureState(
                { source: 'map-data', id: hoveredPolygonId },
                { hover: false }
            );
        }
        hoveredPolygonId = null;
    //Zoom to feature
    map.on('click', 'study-spots', (e) => {
        // map.flyTo({center: [0, 0], zoom: 9});
        map.flyTo({
            center: e.features[0].geometry.coordinates, zoom: 20
        });
    });

    // Change the pointer to cursor when hovering over point features, reverting back to pointer when not hovering.
    map.on('mouseenter', 'study-spots', () => {
        map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', 'study-spots', () => {
        map.getCanvas().style.cursor = '';
    });
    
    });

});

//Filter source: https://github.com/mapbox/mapbox-gl-js/issues/6508
//Detached head solution: https://stackoverflow.com/questions/10228760/how-do-i-fix-a-git-detached-head
//Mapbox GL JS Docs pop-up on click source: https://docs.mapbox.com/mapbox-gl-js/example/popup-on-click/