import React, { FC, Fragment, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { RootNavProps, RootScreenProps, getSource, RootNavContext, source, RootStackParamList } from "utils";
import MapboxGL, { ImageSourceProps, OnPressEvent, ShapeSource } from "@rnmapbox/maps";
import { ActivityIndicator, GestureResponderEvent, ImageSourcePropType, Insets, PixelRatio, Platform, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
import { useAppDispatch, useAppSelector, useLocationNode, useLocationNodeId } from "redux/hooks";
import { Feature, FeatureCollection, Geometry, Point, Position, GeoJsonProperties } from "geojson";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NAV_HEIGHT, NAV_TOP } from "config";
import { locationListItem, locationNodeGraph, place } from "jungle-shared";
import { TapGestureHandler, TapGestureHandlerGestureEvent } from "react-native-gesture-handler";
import { event, useAnimatedGestureHandler, useSharedValue } from "react-native-reanimated";
import { CameraProps, UserTrackingMode } from "@rnmapbox/maps/javascript/components/Camera";
import { getPermission, logAppActivity, PermissionKey, setTabNavColors } from "redux/app";
import UserAvatar from "components/shared/UserAvatar";
import { PERMISSIONS } from "react-native-permissions";
import Svg, { Path } from "react-native-svg";
import { setUserLocation } from "redux/user";
import BottomSheet, { BottomSheetModal, BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { SearchContext } from "components/screens/search/contexts";
import CenteredLoader from "components/shared/CenteredLoader";
import { useGetLocationsQuery } from "redux/api";
import { skipToken } from "@reduxjs/toolkit/dist/query";


export const getVector = (a: number[], b: number[]): [number, number] => [a[0] - b[0], b[1] - a[1]];
export const getVectorLength = (a: number, b: number) => Math.sqrt(a * a + b * b);
export const getPointDistance = (a: number[], b: number[]) => {
    const vector = getVector(a, b);
    return getVectorLength(vector[0], vector[1]);
}
export const getPointAngle = (a: number[], b: number[]) => {
    const vector = getVector(a, b);

    return Math.atan2(
        vector[1],
        vector[0]
    );
};

export const getBbox = (collections: FeatureCollection<Geometry, any>[]) => {
    
    let latMax = 0;
    let longMax = 0;
    
    for(let j = 0; j < collections.length; j++){
        const collection = collections[j];
        const features = collection.features;
    
        for(let i = 0; i < features.length; i++){
            const feature = features[i];
            const geo = feature.geometry;
            if(geo.type === 'Point'){
                latMax = Math.max(latMax, geo.coordinates[0]);       
                longMax = Math.max(longMax, geo.coordinates[1]);
            }
        }
    }

    let latMin = latMax;
    let longMin = longMax;

    for(let j = 0; j < collections.length; j++){
        const collection = collections[j];
        const features = collection.features;

        for(let i = 0; i < features.length; i++){
            const feature = features[i];
            const geo = feature.geometry;
            if(geo.type === 'Point'){
                latMin = Math.min(latMin, geo.coordinates[0]);       
                longMin = Math.min(longMin, geo.coordinates[1]);
            }
        }
    }

    return {ne: [latMin, longMin], sw: [latMax, longMax]};
}

export const getWeightedCenter = (places: {lat: number, long: number}[]) => {
    let currentCenter: [number, number]= [0,0];
    for(let i = 0; i < places.length; i++){
        const place = places[i];
        const location = [place.lat, place.long] as [number, number];
        if(!currentCenter)
            currentCenter = location;
        else{
            const distanceToCenter = getPointDistance(location, currentCenter);
            const angle = getPointAngle(location, currentCenter);
            const newCenter = [
                currentCenter[0] + Math.cos(angle) * distanceToCenter / (i + 1),
                currentCenter[1] - Math.sin(angle) * distanceToCenter / (i + 1)
            ] as [number, number];

            currentCenter = newCenter;
        }
    }

    return currentCenter!;
}

const Map: FC<{screen?: keyof RootStackParamList}> = ({screen}) => {
    const cameraRef = useRef<MapboxGL.Camera>(null);
    const userLocationRef = useRef<MapboxGL.UserLocation>(null);
    const user = useAppSelector(state => state.user.user);
    const searchContext = useContext(SearchContext);
    const locationNode = useLocationNode();
    const locationsData = useGetLocationsQuery(screen === 'Home' && locationNode ? {selectedBranches: [], locationNodeId: locationNode.locationNode.id} : skipToken);

    const dispatch = useAppDispatch();
    // const [places, setPlaces] = useState<place[]>([]);
    const [shape, setShape] = useState<FeatureCollection>({features: [], type: 'FeatureCollection'});
    const [images, setImages] = useState<{[k: string]: ImageSourcePropType}>({});
    const [userLocationVisible, setUserLocationVisible] = useState(false);
    const [userLocation, setUserLocation] = useState<MapboxGL.Location>();
    const [shouldLocateUser, setShouldLocateUser] = useState(false);
    const [locations,setLocations] = useState<locationListItem<'search'>[]>();

    useEffect(() => {
        if(searchContext.locations)
            setLocations(searchContext.locations);
    }, [searchContext]);

    useEffect(() => {
        if(locationsData.isSuccess)
            setLocations(locationsData.data);
    }, [locationsData]);

    useEffect(() => {
        let mounted = true;

        dispatch(getPermission({permission:'location', required: false})).unwrap().then(result => {
            if(result && mounted)
                setUserLocationVisible(true);
        });

        return () => {mounted = false;}
    }, [dispatch]);

    useEffect(() => {
        dispatch(logAppActivity({type: 'mapOpen'}));
    }, [dispatch]);

    const handleLocation = useCallback((e: MapboxGL.Location) => {
        setUserLocation(e);
    }, [setUserLocation]);

    const handleLocationPress = useCallback(async () => {
        const permission = await dispatch(getPermission({permission:'location', request: PermissionKey.enableLocation, required: true})).unwrap();
        if(permission){
            setUserLocationVisible(true);
            setShouldLocateUser(true);
        }
    }, [setUserLocationVisible, setShouldLocateUser]);

    useEffect(() => {
        if(shouldLocateUser && userLocation){
            cameraRef.current?.setCamera({animationDuration: 1000, animationMode: 'flyTo', zoomLevel: 13, centerCoordinate: [userLocation.coords.longitude,userLocation.coords.latitude]});
            setShouldLocateUser(false);
        }
    }, [shouldLocateUser, userLocation]);

    const shapesRef = useRef<ShapeSource>(null);
    const mapRef = useRef<MapboxGL.MapView>(null);
    
    useEffect(() => {
        if(locations){
            const features: Feature<Point>[] = locations.map(loc => {
               
                return ({

                
                    geometry: {
                        type: 'Point',
                        coordinates: [loc.long, loc.lat] 
                    },
                    properties: {
                        src: loc.id,
                        placeId: loc.places[0],
                        active: false,
                    },
                    type: 'Feature',
                    id: loc.id
            } as Feature<Point>)});
    
            const shape: FeatureCollection<Point> = {
                features,
                type: 'FeatureCollection',
            }
    
            setShape(shape);
    
            if(screen !== 'Home'){
                const images: {[k: string]: ImageSourcePropType} = {};
                for(let i = 0; i < locations.length; i++){
                    images[locations[i].id] = {uri: source.place.logo.background(locations[i].places[0])};
                }
        
                setImages(images);
            }
        }
    }, [locations]);

    const getNewBounds = useCallback(({ne, sw}: {ne: Position, sw: Position}, padding: number) => ({ne, sw, paddingBottom: padding*2, paddingLeft: padding, paddingRight: padding, paddingTop: padding*2}), []);
    const [defCam, setDefCam] = useState<CameraProps['defaultSettings']>({});
   
    const prevLocationNode = useRef<locationNodeGraph>();
    const [didLocationInit, setDidLocationInit] = useState(false);

    useEffect(() => {
        if(!!locationNode){
            const {lat, long} = locationNode.locationNode;

            if(!prevLocationNode.current && !didLocationInit){
                setDefCam({centerCoordinate: [lat, long], zoomLevel: 10, animationMode: 'none'});
                setDidLocationInit(true);
            }
            else{
                cameraRef.current?.setCamera({centerCoordinate: [lat, long], animationMode: 'flyTo', zoomLevel: 10, animationDuration: 1750});
            }
        }

        return () => {
            prevLocationNode.current = locationNode;
        }
    }, [locationNode, screen]);

    const nav = useNavigation<RootNavProps>();
    
    const startRef = useRef([0,0]);

    const handleStart = useCallback(async (e: GestureResponderEvent) => {
        if(screen === 'Home')
            return;

        startRef.current[0] = e.nativeEvent.pageX;
        startRef.current[1] = e.nativeEvent.pageY;

        e.persist();
    }, [startRef]);

    const handleEnd = useCallback(async (e: GestureResponderEvent) => {
        if(screen === 'Home')
            return;

        const dx = startRef.current[0] - e.nativeEvent.pageX;
        const dy = startRef.current[1] - e.nativeEvent.pageY;
        const d = Math.sqrt(dx*dx + dy*dy);

        e.persist();

        if(d < 1)
            handleTap(e);
    }, [startRef]);
    const handleTap = useCallback(async (e: GestureResponderEvent) => {
        if(screen === 'Home')
            return;

        if(!mapRef.current || !shapesRef.current)
            return;

        e.persist();

        const dpr = Platform.select({ios: 1, android: PixelRatio.get()}) ?? 1;

        const result = await mapRef.current.queryRenderedFeaturesAtPoint([e.nativeEvent.locationX * dpr, e.nativeEvent.locationY * dpr], undefined, ['circles']);

        if(result){
            const {features, bbox} = result;

            for(let i = 0; i < features.length; i++){
                const feature = features[i];

                if(feature.properties?.cluster){
                    const leaves = await shapesRef.current.getClusterLeaves(feature as any, -1, 0);

                    const {ne, sw} = getBbox([leaves] as any);

                    cameraRef.current?.setCamera({
                        bounds: getNewBounds({ne, sw}, 0),
                        animationDuration: 500
                    });
                }
                else if(feature.properties?.placeId){
                    const zoom = await mapRef.current?.getZoom();

                    if(zoom >= 6){
                        dispatch(logAppActivity({type: 'placeOpen', data: {placeId: feature.properties?.placeId as number, fromMap: true}}));
                        nav.push('Place', {id: feature.properties?.placeId as number});
                    }
                    else if(feature.geometry.type === 'Point'){
                        cameraRef.current?.setCamera({
                            centerCoordinate: feature.geometry.coordinates,
                            animationMode: 'easeTo',
                            zoomLevel: 6.1
                        });
                    }
                }
            }
        }
    }, [mapRef]);

    const insets = useSafeAreaInsets();
    const bounds = useWindowDimensions();
    const footerHeight = 0;
    // const footerHeight = useAppSelector(state => state.app.footerHeight);

    const bottomSheetModalRef = useRef<BottomSheetModal>(null);

    const handlePresentModalPress = useCallback(() => {
        bottomSheetModalRef.current?.present();
      }, [bottomSheetModalRef.current]);

    useEffect(() => {
        handlePresentModalPress();
    }, [handlePresentModalPress]);

    const [sizeFactor, setSizeFactor] = useState(0);

    useEffect(() => {
        const dpr = Platform.select({ios: 2.5, android: PixelRatio.get() * 0.5}) ?? 2;
        setSizeFactor(5 / dpr);
    }, []);

    const [mapReady, setMapReady] = useState(false);

    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#030303' }}>
            {
                !locationNode || !mapReady &&
                <View style={{zIndex: 10, backgroundColor: '#030303', position: 'absolute', ...bounds}}>
                    <CenteredLoader />
                </View>
            }
            {
            locationNode &&
            <MapboxGL.MapView 
            ref={mapRef}

            onTouchStart={handleStart}
            onTouchEnd={handleEnd}
            pitchEnabled={false}
            rotateEnabled={false}
            scaleBarEnabled={false}
            // pointerEvents={screen === 'Home' ? 'none' : 'auto'}
            animated={true}
            onDidFinishLoadingMap={() => {setMapReady(true)}}

            styleURL={'mapbox://styles/johnjconn/cl9b42n4k005a14mt27mw2zas'}
            // styleURL={'mapbox://styles/johnjconn/cl2ud3mx3000814p7sl821wyq'}
            style={{flex: 1, width: '100%'}}>
                <MapboxGL.Images images={images} />
                
                <MapboxGL.ShapeSource 
                    id="dotsSource"
                    shape={shape}
                    cluster={true}
                    clusterRadius={screen === 'Home' ? 2 : 3}
                    
                    clusterProperties={{
                        bgColor: ['coalesce', ['get', 'bgColor']],
                        accentColor: ['coalesce', ['get', 'accentColor']],
                        textColor: ['coalesce', ['get', 'textColor']],
                    }}
                    buffer={0}
                    ref={shapesRef}
                >
                    <MapboxGL.CircleLayer 
                        id={'dots'}
                        sourceID="dotsSource"
                        style={{
                            circleRadius: 
                            screen === 'Home' ? 
                            [
                                "interpolate", ["linear"], ["zoom"],
                                0, ['case', ['has', 'point_count'], ['interpolate', ['linear'], ['get', 'point_count'], 0, 1, 40, 2], 1],
                                9, ['case', ['has', 'point_count'], ['interpolate', ['linear'], ['get', 'point_count'], 0, 0.5, 40, 4], 1]
                            ]
                            :
                            [
                                "interpolate", ["linear"], ["zoom"],
                                0, ['case', ['has', 'point_count'], ['interpolate', ['linear'], ['get', 'point_count'], 0, 1, 40, 2], 1],
                                9, ['case', ['has', 'point_count'], ['interpolate', ['linear'], ['get', 'point_count'], 0, 3, 40, 4], 2]
                            ],
                            circleStrokeColor: ['get', 'accentColor'], 
                            circleStrokeWidth: 0,
                            circleStrokeOpacity: 1,
                            circleOpacity: screen=== 'Home' ?  0.6 : 1,
                            circleColor: '#ffffff',
                            circleBlur: 0

                        }}
                    />
                </MapboxGL.ShapeSource>

                    {
                        screen !== 'Home' &&
                        <Fragment>
                            <MapboxGL.ShapeSource 
                                id="places"
                                shape={shape}
                                cluster={true}
                                clusterRadius={40}
                                clusterMaxZoomLevel={14}
                                clusterProperties={{
                                    bgColor: ['coalesce', ['get', 'bgColor']],
                                    accentColor: ['coalesce', ['get', 'accentColor']],
                                    src: ['coalesce', ['get', 'src']],
                                    names: ['concat', ['concat', ['get', 'name'], ', ']]
                                }}
                                buffer={0}
                                ref={shapesRef}
            
                            >
                                <MapboxGL.CircleLayer 
                                    id={'circles'}
                                    sourceID="places"
                                    
                                    style={{
                                        circleOpacity: 0,
                                        circleStrokeWidth: 0,
                                        circleRadius: [
                                            "interpolate", ["linear"], ["zoom"],
                                            0, 25,
                                            10, 25,
                                            20, 25,
                                        ]
                                    }}
                                />
                                <MapboxGL.SymbolLayer
                                id="logos"
                                sourceID="places"
                                filter={['!', ['has', 'point_count']]}
                                style={{
                                    iconOpacity: [
                                        "step", ["zoom"],
                                        0, 6,
                                        1
                                    ],
                                    iconAllowOverlap: true,
                                    iconSize: ['case', 
                                    ['has', 'point_count'], ['interpolate', ['linear'], ['get', 'point_count'], 0, 0.10*sizeFactor, 40, 0.13*sizeFactor], 
                                        0.17*sizeFactor],
                                    iconImage: ['get', 'src']
                                }}
                                />
                                <MapboxGL.SymbolLayer
                                id="clusterLogos"
                                sourceID="places"
                                filter={['>', 4, ['get', 'point_count']]}
                                style={{
                                    iconOpacity: [
                                        "step", ["zoom"],
                                        0, 10,
                                        1
                                    ],
                                    iconAllowOverlap: true,
                                    iconSize: ['case', 
                                    ['has', 'point_count'], ['interpolate', ['linear'], ['get', 'point_count'], 0, 0.10*sizeFactor, 40, 0.13*sizeFactor], 
                                        0.17*sizeFactor],
                                    iconImage: ['get', 'src']
                                }}
                                />
                            </MapboxGL.ShapeSource>
                        </Fragment>
                    }

                    {/* <MapboxGL.SymbolLayer
                    id="clusterLabels"
                    sourceID="places"
                    style={{
                        textColor: '#ffffff',
                        textSize: 20,
                        textHaloWidth: 0.5,
                        textHaloColor: '#030303'
                    }}
                    /> */}
                
                {screen !== 'Home' && !!userLocationVisible && <MapboxGL.UserLocation ref={userLocationRef} onUpdate={handleLocation} visible={userLocationVisible} renderMode={'native'} animated={true} showsUserHeadingIndicator={true} />}
                <MapboxGL.Camera ref={cameraRef} defaultSettings={defCam}  />
                
            </MapboxGL.MapView>}
            {
                screen !== 'Home' && 
                <TouchableOpacity activeOpacity={0.75} onPress={handleLocationPress} style={{backgroundColor: '#03030320',height: 50, aspectRatio: 1, justifyContent: 'center', alignItems: 'center', borderRadius: 25, position: 'absolute', bottom: insets.bottom + footerHeight + 130, right: 20}}>
                    <Svg width="30" height="20" viewBox="-2 0 24 24" style={{transform: [{rotate: '-45deg'}]}}>
                        <Path d={`
                            M22.9692 10.6335
                            L1.71539 0.1875
                            C0.788472 0.1875 -0.0220794 1.06212 0.234712 2.08928
                            L2.77762 12.1241
                            L0.235106 21.9107
                            C-0.0220794 22.9394 0.788472 23.814 1.71539 23.814
                            C1.94382 23.814 2.17736 23.7626 2.40201 23.6495
                            L22.9692 13.368
                            C24.0968 12.8042 24.0968 11.1973 22.9692 10.6335Z`}
                            stroke={'#030303'}
                            fill={'white'}
                        />
                    </Svg>
                </TouchableOpacity>
            }
        </View>
    );
};

  export default Map;