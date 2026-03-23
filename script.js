//Mapbox Public Token
mapboxgl.accessToken = "pk.eyJ1IjoiZGFuaWVsODEwMTciLCJhIjoiY21rZWI2eGg4MDU5NjNscHdxbjhkMTNmciJ9.jdsMukp7zHz3llySNBJs0A"

//Variable declaration
//Map with default centre/zoom/pitch/bearing
//Alternative centre/zoom for secondary stage
//Let variable for popup and map to permit reloads from line 172 onwards
//Variable for the hover event to fill the campus boundary

const center = [-79.39516, 43.66338];
const zoom = 14;
const pitch = 0;
const bearing = 0;
const centerafterboundaryclick = [-79.39916, 43.66226];
const zoomafterboundaryclick = 15;
let popup = new mapboxgl.Popup()
let map = new mapboxgl.Map(
    {
        container: 'main-map1',
        style: 'mapbox://styles/daniel81017/cmlofzis0001i01qn3jjqaxjd',
        center: center,
        zoom: zoom,
        pitch: pitch,
        bearing: bearing,
    }
);
let hoveredPolygonId = null;

//All under a variable "reloadonclick" to allow for reload from line 172 onwards
const reloadonclick = function () {
    //Data sources and layers
    console.log('start load');

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
        'id': 'campus-fill',
        'type': 'fill',
        'source': 'map-data',
        'layout': {},
        'paint': {
            'fill-color': '#c2dd13',
            'fill-opacity': [
                'case',
                ['boolean', ['feature-state', 'hover'], false], //INTERPRET ARRAY CORRECTLY
                0.3,
                0
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

    // Changes the pointer to a cursor when hovering over polygon feature, reverting back to pointer when not hovering.
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
        //Reassigned as "null" to facilitate future hovers after returning cursor to inside of map boundary
        hoveredPolygonId = null;
    });

    //Point feature
    //Fly to center on campus boundary click
    map.on('click', 'campus-fill', (e) => {
        map.flyTo({
            center: centerafterboundaryclick,
            zoom: zoomafterboundaryclick,
            pitch: pitch,
            bearing: bearing,
        });
        //If click/fly to has not yet been completed, points do not display
        if (map.getLayer('study-spots')) {
            map.removeLayer('study-spots');
        };

        //Points display after click
        map.addLayer({
            'id': 'study-spots',
            'type': 'circle',
            'source': 'map-data',
            'paint': {
                'circle-width': 10,
                'circle-color': '#000000',
                'circle-outline': 2,
            },
            'filter': ['==', ['geometry-type'], 'Point'],
        });
        //Removes campus ramp-to-scale expression (colour gradient)
        if (!map.removeLayer('campus-fill')) { };
    });
    // Change the pointer to cursor when hovering over point features, reverting back to pointer when not hovering.
    map.on('mouseenter', 'study-spots', () => {
        map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', 'study-spots', () => {
        map.getCanvas().style.cursor = '';
    });

    // Flies to feature (zooms in) after click
    map.on('click', 'study-spots', (e) => {
        console.log('after click study spot', e.features);
        //Remove other layers other than points for simplicity
        map.setLayoutProperty('official-bikelanes', 'visibility', 'none');
        map.setLayoutProperty('campus', 'visibility', 'none');
        map.flyTo({
            center: e.features[0].geometry.coordinates,
            zoom: 16.5,
            bearing: e.features[0].properties.bearing,
            pitch: 75,
            duration: 6000,
        });
        //Moved here (originally at line 155) to ensure "features" are remembered as part of "(e)"
        const coordinates = e.features[0].geometry.coordinates.slice();
        const description = e.features[0].properties.description;
        //Displays pop-up after flyTo is complete
        map.once('moveend', () => {
            console.log('popup at end of move');
            popup.setLngLat(coordinates)
                .setHTML(description)
                .addTo(map);
            //After popup is closed, flies back to secondary map extent
            popup.on('close', () => {
                map.flyTo({
                    center: centerafterboundaryclick,
                    zoom: zoomafterboundaryclick,
                    bearing: bearing,
                    pitch: zoom,
                    duration: 2500,
                });
                map.setLayoutProperty('official-bikelanes', 'visibility', 'visible');
                map.setLayoutProperty('campus', 'visibility', 'visible');
            });

        });
    });
    //Confirmation
    console.log("confirm function is complete");
};

//Actual loading of map, coded in a single variable. "Once" is used to act as prerequisite to the reload 
map.once('load', reloadonclick);

//Events after "return to default view" button is clicked
document.getElementById('defaultviewbutton').addEventListener('click', () => {
    //Removes existing popup (if not already closed) and previous map
    console.log("removes popup from map automatically");
    popup.remove();
    map.remove();

    //Loads new map
    map = new mapboxgl.Map(
        {
            container: 'main-map1',
            style: 'mapbox://styles/daniel81017/cmlofzis0001i01qn3jjqaxjd',
            center: center,
            zoom: zoom,
            pitch: pitch,
            bearing: bearing,
        }
    );

    //Loads new map into place, repeats every time button is clicked
    map.once('load', reloadonclick);
});