import React, { useRef, useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Table } from 'react-bootstrap';
import { MapContainer, TileLayer, FeatureGroup, useMapEvents, LayersControl } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import { saveAs } from 'file-saver';
import L from 'leaflet';
import axios from 'axios';
import 'leaflet-editable';
import './formpopup.css';

const VectorData = () => {
    const [lat, setLat] = useState('lat');
    const [lng, setLng] = useState('lng');
    const [tableData, setTData] = useState(false);
    const [Json, setJson] = useState()
    const mapR = useRef();
    const divRef = useRef();
    const featureGroupRef = useRef();
    const mapRef = useRef();

    const [featureCollection, setFeatureCollection] = useState({
        type: 'FeatureCollection',
        features: [],
    });

    const [popupData, setPopupData] = useState([]);
    useEffect(() => {
        console.log("Updated Feature Collection:", featureCollection);
    }, [featureCollection]);

    const _onCreated = (e) => {
        console.log(e);
        if (e.layerType === "polygon" || e.layerType === "rectangle" || e.layerType === "circle" || e.layerType === 'polyline' || e.layerType === "circlemarker" || e.layerType === 'marker') {
            const createdLayer = e.layer;
            setTData(true);
            var shape = createdLayer.toGeoJSON()
            setFeatureCollection((prevCollection) => ({
                ...prevCollection,
                features: [...prevCollection.features, shape],
            }));
            createTooltip(createdLayer);
            createFormPopup(createdLayer);
        }
    }
    const _onEdited = (e) => {
        e.layers.eachLayer((layer) => {
            if (layer instanceof L.Polygon) {
                updateTooltip(layer);
            }
            if (layer instanceof L.Circle) {
                updateTooltip(layer);
            }
            if (layer instanceof L.Polyline) {
                updateTooltip(layer);
            }
        });
    }

    // initial layer popup when created  
    const createFormPopup = (layer) => {
        let popupContent =
            '<div>' +
            'Id :<br><input type="number" id="input_id" ><br>' +
            'Description:<br><input type="text" id="input_desc"><br>' +
            'Name:<br><input type="text" id="input_name"  ><br>' +
            'Measure:<br><input type="text" id = "input_measure"  "><br>' +
            '<input type="button" value="data" id="submit">' +
            '</div>';
        layer.bindPopup(popupContent).openPopup();

    };

    // function to update popup content based on entered form values

    const updatePopupContent = (id, name, description, measure) => {
        const popupContent =
            '<div>' +
            'Id: ' + id + '<br>' +
            'Name: ' + name + '<br>' +
            'Description: ' + description + '<br>' +
            'Measure: ' + measure +
            '</div>';
        const layers = featureGroupRef.current.getLayers();
        console.log('Layers:', layers);
        layers.forEach((layer) => {
            console.log(layer.id);
        })

        const currentLayer = layers.pop();
        if (currentLayer instanceof L.Polygon) {
            currentLayer.setPopupContent(popupContent);
        }
        else if (currentLayer instanceof L.Circle) {
            currentLayer.setPopupContent(popupContent);
        }
        else if (currentLayer instanceof L.Polyline) {
            currentLayer.setPopupContent(popupContent);
        }
    };
    // function to create a Tooltip which contains layer measurment
    const createTooltip = (layer) => {
        if (layer instanceof L.Polygon) {
            const coords = layer.getLatLngs()[0];
            console.log(coords);
            const area = L.GeometryUtil.geodesicArea(coords);
            const readableArea = L.GeometryUtil.readableArea(area, true);
            const toolContent = readableArea;
            layer.bindTooltip(toolContent.toString(), { permanent: true, direction: "center" }).openTooltip();
        }
        else if (layer instanceof L.Circle) {
            const radius = layer.getRadius();
            const area = Math.PI * Math.pow(radius, 2);
            const toolContent = `${area.toFixed(2)} sq m`;
            layer.bindTooltip(toolContent.toString(), { permanent: true, direction: "center" }).openTooltip();
        }
        else if (layer instanceof L.Polyline) {
            var length = 0;
            var lineCoords = layer.getLatLngs();
            for (var i = 0; i < lineCoords.length - 1; i++) {
                length += lineCoords[i].distanceTo(lineCoords[i + 1]);
            }
            console.log(`Length of polyline(m): ${length}`);
            const toolContent = `${length.toFixed(2)} m`;
            layer.bindTooltip(toolContent.toString(), { permanent: true, direction: "center" }).openTooltip()
        }
        else if (layer instanceof L.CircleMarker) {
            let coordsLat = layer.getLatLng().lat;
            let coordsLng = layer.getLatLng().lng;
            console.log(coordsLat);
            let toolContent = `${coordsLat}, ${coordsLng}`
            layer.bindTooltip(toolContent.toString(), { permanent: true, direction: "center" }).openTooltip();

        }
    }
    // Function to update tooltip when edited, based on layer type it updates its measurement and add as tooltip to Layer
    const updateTooltip = (layer) => {
        if (layer instanceof L.Polygon) {
            const editedPolygonCoords = layer.getLatLngs()[0];
            const area = L.GeometryUtil.geodesicArea(editedPolygonCoords);
            const readableArea = L.GeometryUtil.readableArea(area, true);
            const toolContent = readableArea;
            layer.bindTooltip(toolContent.toString(), { permanent: true, direction: "center" }).openTooltip();
        }
        else if (layer instanceof L.Circle) {
            const editedradius = layer.getRadius();
            const area = Math.PI * Math.pow(editedradius, 2);
            const toolContent = `${area.toFixed(2)} sq m`;
            layer.bindTooltip(toolContent.toString(), { permanent: true, direction: "center" }).openTooltip();
        }
        else if (layer instanceof L.Polyline) {
            var length = 0;
            var lineCoords = layer.getLatLngs();
            for (var i = 0; i < lineCoords.length - 1; i++) {
                length += lineCoords[i].distanceTo(lineCoords[i + 1]);
            }
            const toolContent = `${length.toFixed(2)} m`;
            layer.bindTooltip(toolContent.toString(), { permanent: true, direction: "center" }).openTooltip();
        }
        else if (layer instanceof L.CircleMarker) {
            let coordsLat = layer.getLatLng().lat;
            let coordsLng = layer.getLatLng().lng;
            console.log(coordsLat);
            let toolContent = `${coordsLat}, ${coordsLng}`
            layer.bindTooltip(toolContent.toString(), { permanent: true, direction: "center" }).openTooltip();

        }
    }
    const _onDeleted = (e) => {
        console.log(e);
    }
    // My component functional component which defines the functionality to show lat lng values on hover effect
    function MyComponent() {
        const map = useMapEvents({
            mousemove: (e) => {
                setLat(e.latlng.lat);
                setLng(e.latlng.lng)
            }
        })
        return null
    }
    useEffect(() => {
        const divElement = divRef.current;
        const latValue = lat;
        const lngValue = lng;
        divElement.textContent = `${latValue} | ${lngValue}`;
        divElement.classList.add('custom-div-class-v');
    }, [lat, lng]);
    //function to handle the submit of form details we entering when layer is created which contains information about created layer
    const handleFormSubmit = () => {
        // getting the values entered in the form
        const idValue = document.getElementById('input_i').value;
        const nameValue = document.getElementById('input_n').value;
        const descValue = document.getElementById('input_d').value;
        const measureValue = document.getElementById('input_m').value;
        // Check if an entry with the same VectorId already exists
        const existingEntry = popupData.find(entry => entry.VectorId === idValue);
        if (existingEntry) {
            // If an entry with the same VectorId exists, update its values
            existingEntry.name = nameValue;
            existingEntry.description = descValue;
            existingEntry.measure = measureValue;
        }
        else {
            setPopupData(prevFormData => [
                ...prevFormData,
                {
                    VectorId: idValue,
                    name: nameValue,
                    description: descValue,
                    measure: measureValue,
                },
            ]);
        }
        // Passing form values to updatePopupContent function based on these values it updates popup of the layer
        updatePopupContent(idValue, nameValue, descValue, measureValue);
        // clearing the form values after submit
        document.getElementById('input_i').value = '';
        document.getElementById('input_n').value = '';
        document.getElementById('input_d').value = '';
        document.getElementById('input_m').value = '';
    };
    // function to edit the poopup content it takes id of the layer as input
    const editPopupContent = (selectedVectorId) => {
        console.log(selectedVectorId);
        // getting the layer we want to edit
        const selectedVector = popupData.find(entry => entry.VectorId === selectedVectorId);
        // updating the values after edit
        document.getElementById('input_i').value = selectedVector.VectorId;
        document.getElementById('input_n').value = selectedVector.name;
        document.getElementById('input_d').value = selectedVector.description;
        document.getElementById('input_m').value = selectedVector.measure;
        updatePopupContent(selectedVector.VectorId, selectedVector.name, selectedVector.description, selectedVector.measure);
    };
    // function to handle the features export as json file
    const geojsonExport = () => {
        // Create a copy of the feature collection
        const exportedData = { ...featureCollection };
        // Add or create properties for each feature
        exportedData.features.forEach((feature, index) => {
            const matchingPopupData = popupData[index];
            console.log(matchingPopupData);
            if (matchingPopupData) {
                feature.properties = {
                    name: matchingPopupData.name,
                    description: matchingPopupData.description,
                    measure: matchingPopupData.measure,
                };
            }
        });
        setJson(exportedData);
        const blob = new Blob([JSON.stringify(exportedData)], { type: 'application/json' });
        saveAs(blob, 'shapeV_with_popup.geojson');
    };

    // console.log(featureCollection.features);
    useEffect(() => {
        console.log(Json);
    }, [Json]);
    // function to handle the conversion of features to the shapefile
    const handleConvertToShapefile = () => {
        // Make sure the server endpoint is correctly implemented
        axios.post('http://127.0.0.1:5000/convertToShapefile', { features: featureCollection.features })
            .then((response) => {
                console.log(response.data.message);
            })
            .catch((error) => {
                console.error('Error converting to Shapefile:', error);
            });
    };


    return (
        <div >
            <div className='divMapContainer'>
                <MapContainer className='mapContainerMain'
                    center={{ lat: 17.0000, lng: 78.0000 }}
                    zoom={9}
                    scrollWheelZoom={true}
                    measureControl={true}
                    whenCreated={(map) => {
                        // Set the mapRef when the map is created
                        mapRef.current = map;
                    }}
                    ref={mapR}
                >
                    <FeatureGroup ref={featureGroupRef}>
                        <EditControl
                            position="topright"
                            onEdited={_onEdited}
                            onCreated={_onCreated}
                            onDeleted={_onDeleted}
                            draw={{
                                rectangle: true,
                                polygon: {
                                    showArea: true,
                                    clickable: true,
                                    metric: false,
                                    allowIntersection: false
                                },
                                polyline: true,
                                circlemarker: true,
                                circle: true,
                                showMeasurements: true
                            }}
                        />
                    </FeatureGroup>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | GIS Simplified contributors'
                        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                    />
                    <LayersControl position='topleft'>
                        <LayersControl.Overlay unchecked name='WorldstreetMap'>
                            <TileLayer
                                attribution='&copy; Esri &mdash; Source: Esri'
                                url='https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}.png'
                            />
                        </LayersControl.Overlay>
                        <LayersControl.Overlay unchecked name='WorldNightMap'>
                            <TileLayer
                                attribution='&copy; Esri &mdash; Source: Esri'
                                url='https://map1.vis.earthdata.nasa.gov/wmts-webmerc/VIIRS_CityLights_2012/default//GoogleMapsCompatible_Level8/{z}/{y}/{x}.jpg'
                            />
                        </LayersControl.Overlay>
                        <LayersControl.Overlay unchecked name='WorldimgMap'>
                            <TileLayer
                                attribution='&copy; Esri &mdash; Source: Esri'
                                url='https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}.png'
                            />
                        </LayersControl.Overlay>
                    </LayersControl>
                    <MyComponent />
                </MapContainer>
            </div>
            <div ref={divRef} className='custom-div-class'  ></div>

            <div className='formPopup' style={{ border: '2ps solid' }}>
                <h5 id='formHeading'>Attribute Values and PopupData</h5>
                ID<input type='number' id='input_i' /> <br />
                Name<input type='text' id='input_n' /><br />
                Description<input type='text' id='input_d' /><br />
                Measure<input type='text' id='input_m' /> <br />
                <input type='button' id='input_b' value='Datasubmit' onClick={() => { handleFormSubmit() }} />
            </div>
            <div>
                <br />
                <h5 className='tableHeading'>Attribute Table</h5>
                {tableData && <Table striped bordered hover variant='dark' style={{ margin: '20px' }}>
                    <thead>
                        <tr>
                            <th>Id</th>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Measure</th>
                            <th>Edit Data</th>
                        </tr>
                    </thead>
                    {popupData.length > 0 ? (popupData.map(entry => (
                        <tbody><tr key={entry.id}>
                            <td>{entry.VectorId}</td>
                            <td>{entry.name}</td>
                            <td>{entry.description}</td>
                            <td>{entry.measure}</td>
                            <td><button
                                onClick={() => {
                                    editPopupContent(entry.VectorId);
                                }}
                            >
                                edit</button> </td>
                        </tr></tbody>
                    ))) : (<td>Draw Vector Layers</td>)}
                </Table>
                }
            </div>
            <button className='jsonButtton' onClick={() => { geojsonExport() }} >
                JSON
            </button>
            <button className='shapefileButtton' onClick={() => { handleConvertToShapefile() }} >
                Shapefile
            </button>
        </div>
    )
}
export default VectorData;