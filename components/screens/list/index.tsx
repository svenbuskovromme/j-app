import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import { skipToken } from "@reduxjs/toolkit/dist/query/react";
import React, { FC, Fragment, useCallback, useContext, useEffect, useState } from "react";
import { ActivityIndicator, Image, ScrollView, StatusBar, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
import { FadeOut, useSharedValue, withTiming, useAnimatedStyle } from "react-native-reanimated";
import { getFullName, RootNavContext, RootScreenProps, source, useRouteId } from "utils";
import Reanimated from 'react-native-reanimated';
import CenteredLoader from "components/shared/CenteredLoader";
import { useGetNodeListByQuery, useGetTastemakerNoteByQuery } from "redux/api";
import { nodeListGraph, placeGraph } from "jungle-shared/graphs";
import Svg, { Defs, LinearGradient, Stop, Rect } from "react-native-svg";
import FastImage from "react-native-fast-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppDispatch, useAppSelector } from "redux/hooks";
import { PlaceLogo } from "components/shared/PlaceLogo";
import { logAppActivity, setTabNavColors } from "redux/app";
import GradientHeader from "components/shared/GradientHeader";
import Gradient from "components/shared/Gradient";

const PlaceNoteView: FC<{noteId: number}> = ({noteId}) => {
    const nav = useContext(RootNavContext); 
    const noteData = useGetTastemakerNoteByQuery({id: noteId});
    const handleTmPress = useCallback(() => {
        if(noteData.data){
            nav.navigation.push('Tastemaker', {id: noteData.data.tastemaker.tastemaker.id})
        }
    }, [noteData, nav]);

    return <View style={{  }} pointerEvents={'box-none'}>
        {
            (!!noteData.isSuccess && noteData.data) ? <View style={{paddingHorizontal: 15}}>
                <Text numberOfLines={2} style={{ fontSize: 17,  color: 'white'}}>{noteData.data.note.note}</Text>
                <TouchableOpacity activeOpacity={0.75} style={{alignSelf: 'flex-end'}} hitSlop={{top: 50, bottom: 25}} onPress={handleTmPress}><Text style={{ fontSize: 14, color: '#007aff', fontWeight: '500'}}>- {getFullName(noteData.data.tastemaker.tastemaker)}</Text></TouchableOpacity> 
            </View>
            :
            <ActivityIndicator color={'white'} />
        }
    </View>;
}

const NodeListPlaceView: FC<{placeGraph: placeGraph, nodeListId: number}> = ({placeGraph, nodeListId}) => {
    const bounds = useWindowDimensions();
    const navProps = useContext(RootNavContext);
    const [hasPosterContent, setHasPosterContent] = useState<boolean>();
    const [hasPosterQuote, setHasPosterQuote] = useState<boolean>();
    const dispatch = useAppDispatch();
    
    useEffect(() => {
        setHasPosterContent(!!placeGraph.place.posterContent);
        setHasPosterQuote(!!placeGraph.place.posterQuote);
    }, [placeGraph]);

    const handlePress = useCallback(() => {
        dispatch(logAppActivity({type: 'placeOpen', data: {placeId: placeGraph.place.id, fromListId:nodeListId }}))
        navProps.navigation.push('Place', {id: placeGraph.place.id});
    }, [navProps, placeGraph]);

    const [contentLoaded, setContentLoaded] = useState(false);
    const opacity = useSharedValue(0);
    const handleLoad = useCallback(() => {setContentLoaded(true); opacity.value = withTiming(1, {duration: 200})}, [opacity]);
    const uas = useAnimatedStyle(() => ({opacity: opacity.value}), [opacity]);
    const [locationNodeNames, setLocationNodeNames] = useState<string[]>([]);
    useEffect(() => {
        setLocationNodeNames(placeGraph.locationNodes?.filter(ln => ln.type === 'neighborhood').map(ln => ln.name) ?? []);
    }, [placeGraph]);

    return <TouchableOpacity activeOpacity={0.75} onPress={handlePress} style={{padding: 15, paddingVertical: 30, width: bounds.width, flexDirection: 'column', backgroundColor: 'rgba(255,0,0,0)', justifyContent: 'flex-start', alignItems: 'center'}}>
        <View style={{width: '100%'}}>
            {
                <Reanimated.View style={[{backgroundColor: '#242424', width: '100%', borderRadius: 25, height: 250, overflow: 'hidden'}]}>
                    {
                        !!placeGraph.place.posterContent && <Fragment>
                            <Reanimated.View style={[{width: '100%', height: '100%'}, uas]}>
                                <FastImage onLoad={handleLoad} onLoadEnd={handleLoad} onError={handleLoad} source={{uri: source.content.image(placeGraph.place.posterContent, 640, true)}} style={{width: '100%', height: '100%'}} resizeMode={'cover'} />

                            </Reanimated.View>
                            {!contentLoaded && <CenteredLoader style={{position: 'absolute'}} /> }
                        </Fragment>
                    }
                </Reanimated.View>
            }
            <View style={{position: 'absolute', alignSelf: 'flex-start', paddingVertical: 20, paddingHorizontal: 20, borderRadius: 30, alignItems: 'center', flexDirection: 'row', overflow: 'hidden'}}>
                <FastImage 
                    style={[{width: 50, aspectRatio: 1, borderRadius: 30, marginRight: 15}]} 
                    source={{uri: source.place.logo.background(placeGraph.place.id)}}
                />
            </View>
            <View style={{position: 'absolute', bottom: 0, width: '100%', height: '100%'}} pointerEvents={'none'}>
                <Svg height={'100%'} width={'100%'} >
                    <Defs>
                        <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                        <Stop offset={1 - (120/220)} stopColor="transparent" stopOpacity="0" />
                        <Stop offset="1" stopColor="#030303" stopOpacity="0.85" />
                        </LinearGradient>
                    </Defs>
                    <Rect x={0} y={0} width={'100%'} height={'100%'} fill={'url(#grad)'} />
                </Svg>
            </View>
            <View style={{position: 'absolute', alignSelf: 'flex-start', bottom: 0, paddingVertical: 10, paddingHorizontal: 20}}>
                <Text style={{color: 'white', fontSize: 30}}>{placeGraph.place.name}</Text>
                {
                    !!locationNodeNames.length &&
                    <Text style={{color: 'white', fontSize: 14, textTransform: 'capitalize'}}>{locationNodeNames?.join(', ')}</Text>
                }
            </View>
        </View>
        <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 15}}>
            <View style={{flex: 1}}>
                {
                    hasPosterQuote ?
                    <PlaceNoteView noteId={placeGraph.place.posterQuote!} /> :
                    <View pointerEvents={'box-none'}>
                        <Text numberOfLines={2} style={{ fontSize: 17, padding: 15, color: 'white'}}>{placeGraph.place.quoteSnippet ?? ''}</Text>
                    </View>
                }
            </View>
        </View>
    </TouchableOpacity>
}

const NodeListView: FC<{nodeList: nodeListGraph<'single'>}> = ({nodeList}) => {
    const dispatch = useAppDispatch();
    useEffect(() => {
        dispatch(logAppActivity({type: 'nodeListOpen', data:{nodeId: nodeList.node.id, locationNodeId: nodeList.locationNode.id}}));
    }, []);
    const insets = useSafeAreaInsets();
    const bounds = useWindowDimensions();

    return <View style={{flex: 1, paddingTop: insets.top}}>
        <View style={{position: 'absolute', width: bounds.width, height: insets.top + 100, top: 0, zIndex: 1}}>
            <Gradient direction="up" />
        </View>
        <View style={{alignItems: 'center', paddingVertical: 10, paddingHorizontal: 50, zIndex: 1}}>
            {/* <Text style={{fontSize: 13, textTransform: 'capitalize', color: 'white'}}>{`${listData.data.locationNode?.name}` ?? ''}</Text> */}
            <Text style={{fontSize: 20, color: 'white'}}>{`${nodeList.node.name}`.toUpperCase()}<Text style={{fontStyle: 'italic'}}> in </Text>{`${nodeList.locationNode.name.toUpperCase()}` ?? ''}</Text>
        </View>
        <ScrollView style={{flex: 1, overflow: 'visible'}} showsVerticalScrollIndicator={false}>
            {nodeList.places.map(pg => <NodeListPlaceView key={pg.place.id} placeGraph={pg} nodeListId={nodeList.node.id} />)}
        </ScrollView>
    </View>
}

const ListScreen: FC<RootScreenProps<'List'>> = props => {
    const id = useRouteId(props.route);
    const listData = useGetNodeListByQuery(id && props.route.params.locationNodeId ? {id, locationNodeId: props.route.params.locationNodeId} : skipToken);

    const isFocused = useIsFocused();
    const header = useCallback(() => <Text>The {listData.data?.node.name} list</Text>, [listData.data]);

    useEffect(() => {

    }, [])

    useEffect(() => {
        props.navigation.setOptions({
            headerTransparent: true,
            headerTitle: '',
            headerStyle: {backgroundColor: 'transparent'}
        });
    }, []);

    const insets = useSafeAreaInsets();
    const footerHeight = useAppSelector(state => state.app.footerHeight);

    return <RootNavContext.Provider value={props}>
        <StatusBar barStyle={'light-content'} />
        <View style={{flex: 1, backgroundColor: '#030303'}}>
            {
                listData.isError || (listData.isSuccess && !listData.data) ? 
                <View style={{alignItems: 'center', justifyContent: 'center', flex: 1}}>
                    <TouchableOpacity activeOpacity={0.75} onPress={() => props.navigation.canGoBack() ? props.navigation.goBack() : props.navigation.navigate('Home')}>
                        <Text style={{color: 'white'}}>List not found, return to home</Text>
                    </TouchableOpacity>
                </View> : 
                (listData.isSuccess && !!listData.data) ? <NodeListView nodeList={listData.data} /> :
                <Reanimated.View exiting={FadeOut}>
                    <CenteredLoader style={{position: 'absolute'}} />
                </Reanimated.View>
            }
        </View>
    </RootNavContext.Provider>   
}

export default ListScreen;