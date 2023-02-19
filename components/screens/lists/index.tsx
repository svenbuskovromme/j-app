import React, { FC, Fragment, useCallback, useContext, useEffect, useState } from "react";
import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
import { useGetGeoIPQuery, useGetLocationNodeByQuery, useGetLocationNodesQuery } from "redux/api";
import { RootNavContext, RootScreenProps, source } from "utils";
import { ipInfo, locationNodeGraph, nodeListGraph, placeNodeListItem } from 'jungle-shared';
import { FlatList, TapGestureHandler, TapGestureHandlerGestureEvent } from "react-native-gesture-handler";
import Reanimated, { Easing, FadeIn, FadeInDown, FadeOut, FadeOutDown, Layout, runOnJS, useAnimatedGestureHandler, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Defs, Ellipse, LinearGradient, Rect, Stop } from "react-native-svg";
import FastImage from "react-native-fast-image";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import CenteredLoader from "components/shared/CenteredLoader";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppDispatch, useAppSelector, useLocationNodeData, useLocationNodeId } from "redux/hooks";
import { useFocusEffect } from "@react-navigation/native";
import { logAppActivity, setTabNavColors } from "redux/app";
import { setFilter, setSelectedLocationNode } from "redux/locationNodes";
import LocationNode from "components/shared/LocationNode";
import NodeListButton from "components/shared/NodeListButton";
import GradientHeader from "components/shared/GradientHeader";
import HeaderView from "components/shared/HeaderView";

const BranchInner: FC<{selected: boolean, location: locationNodeGraph, loading?: boolean, onPress(location: locationNodeGraph): void}> = ({selected, location, onPress, loading}) => {
    const opacity = useSharedValue(1);

    const _onPress = useCallback(() => {
        onPress(location);
    }, [onPress, location]);
    const _onBegan = useCallback(() => {opacity.value = 0.5}, [opacity]);
    const _onFinish = useCallback(() => {opacity.value = 1}, [opacity]);

    const sharedSelected = useSharedValue(selected);

    useEffect(() => {sharedSelected.value = selected}, [selected]);

    const uas = useAnimatedStyle(() => ({
        opacity: opacity.value,
        backgroundColor: withTiming(sharedSelected.value ? '#ffffff' : '#242424') 
    }), [opacity, sharedSelected]);
    const textUas = useAnimatedStyle(() => ({
        color: withTiming(sharedSelected.value ? '#030303' : '#ffffff')
    }), [sharedSelected])

    return (
        <TapGestureHandler onActivated={_onPress} onBegan={_onBegan} onEnded={_onFinish} onFailed={_onFinish} onCancelled={_onFinish}>
            <Reanimated.View style={[{
                height: 40, borderRadius: 30, paddingVertical: 10, paddingHorizontal: 20, margin: 5, backgroundColor: '#242424', flexDirection: 'row'}, uas]}>
                    <Reanimated.Text style={[{textTransform: 'capitalize', fontSize: 17}, textUas]}>{location.locationNode.name}</Reanimated.Text>
            </Reanimated.View>
        </TapGestureHandler>
    );
}


// const useGeoIP = () => {
//     const ip = useIp();
//     const [info, setInfo] = useState<ipInfo|null>(null);
//     const geoipData = useGetGeoIPQuery(ip ? {ip} : skipToken);
    
//     useEffect(() => {
//         setInfo(geoipData.data??null);
//     }, [geoipData]);

//     return info;
// }

const ListsScreen: FC<RootScreenProps<'Lists'>> = navProps => {
    const locationNodeId = useLocationNodeId();
    const locationNodeData = useGetLocationNodeByQuery(locationNodeId ? {id: locationNodeId} : skipToken);
    const [location, setLocation] = useState<locationNodeGraph>();

    // useEffect(() => {
    //     if(locationNodesData.isSuccess)
    //         setListLocationNodes(locationNodesData.data);
    // }, [locationNodesData]);

    const headerTitle = useCallback(() => <View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
        <Text style={{fontSize: 22, fontWeight: '500', color: 'white'}}>LISTS <Text style={{fontStyle: 'italic'}}>in</Text></Text>
        <LocationNode uppercase={true} fontSize={22} />
    </View>, []);

    useEffect(() => {
        navProps.navigation.setOptions({
            headerTransparent: true,
            headerStyle: {backgroundColor:'transparent'},
            headerTitle
        });
    }, [navProps]);

    const dispatch = useAppDispatch();
    useFocusEffect(() => {
        dispatch(setTabNavColors());
        dispatch(setFilter('lists'));
    });

    useEffect(() => {
        dispatch(logAppActivity({type: 'listsOpen'}));
    }, []);

    const selectLocation = useCallback((location: locationNodeGraph) => {
        dispatch(setSelectedLocationNode(location.locationNode.id));
    }, []);

    const handleLocationPress = useCallback((location: locationNodeGraph) => {
        selectLocation(location);
    }, [selectLocation]);

    const bounds = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const footerHeight = useAppSelector(state => state.app.footerHeight);

    useEffect(() => {
        setLocation(locationNodeData.data);
    }, [locationNodeData]);

    return <RootNavContext.Provider value={navProps}>
        <HeaderView style={{flex: 1, backgroundColor: '#030303'}}>
            <GradientHeader />
            {
                (!location || locationNodeData.isFetching) ? 
                <CenteredLoader color={'white'} /> :
                <Fragment>
                    <View style={{flex: 1}}>
                        <ScrollView  style={{overflow: 'visible', flex: 1}} contentContainerStyle={{}} showsVerticalScrollIndicator={false}>
                            <View style={{margin: 5,flexWrap: 'wrap', flexDirection: 'row'}}>
                                {!!location && 
                                    location.nodeLists.map(list => <View key={list.node.id} style={{padding: 5, width: '50%', aspectRatio: 180/220}}>
                                        <View style={{borderRadius: 25, overflow: 'hidden'}}>
                                            <NodeListButton locationNodeId={location?.locationNode?.id} nodeList={list} />
                                        </View>
                                    </View>)
                                }
                            </View>
                        </ScrollView>
                    </View>
                </Fragment>
            }
        </HeaderView>
    </RootNavContext.Provider>
}

export default ListsScreen;
