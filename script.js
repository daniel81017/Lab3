mapboxgl.accessToken = "pk.eyJ1IjoiZGFuaWVsODEwMTciLCJhIjoiY21rZWI2eGg4MDU5NjNscHdxbjhkMTNmciJ9.jdsMukp7zHz3llySNBJs0A"

const map = new mapboxgl.Map(
    {
        container: 'main-map1',
        style: 'mapbox://styles/daniel81017/cmlofzis0001i01qn3jjqaxjd',
        center: [-79.39516, 43.66338],
        zoom: 14,
    }
);

let hoveredPolygonId = null;

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
    // CHANGE FRONT CAMPUS OBJECT TO UNIQUE CLASSIFICATION (CHANGE FILTER OR REMOVE ENTIRELY, OR USE IF/ELSE?)

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
                1,
                0.5
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

    // REVERT hoveredPolygonId to NULL with MOUSELEAVE
    map.on('mouseleave', 'campus-fill', () => {
        if (hoveredPolygonId !== null) {
            map.setFeatureState(
                { source: 'map-data', id: hoveredPolygonId},
                { hover: false }
            );
        }
        hoveredPolygonId = null;
    });

});

//Filter source: https://github.com/mapbox/mapbox-gl-js/issues/6508
//Detached head solution: https://stackoverflow.com/questions/10228760/how-do-i-fix-a-git-detached-head
//Mapbox GL JS Docs pop-up on click source: https://docs.mapbox.com/mapbox-gl-js/example/popup-on-click/