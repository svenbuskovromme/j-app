import React, { createContext, FC, Fragment, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {  StatusBar, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
import { useAppDispatch, useAppSelector } from "redux/hooks";
import { RootNavContext, RootScreenProps, RootStackParamList, source, useRouteId, useRouteNameUrl } from "utils";
import { api, place, placeGraph} from 'jungle-shared';
import ShareIcon from "components/shared/ShareIcon";
import { graphApi, useGetPlaceByQuery, useGetPostsQuery, useGetUserPlacesQuery, userGraphApi } from "redux/api";
import { BottomTabBarProps, BottomTabNavigationProp, BottomTabScreenProps, createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer, useFocusEffect, useIsFocused, useRoute } from "@react-navigation/native";
import PlaceAbout from "./about";
import { getPlaceBgColor, getPlaceLineColor, getPlaceTextColor, IPlaceScreenCtx, PlaceGraphContext, PlaceScreenContext, usePlaceBgColor, usePlaceBorderColor, usePlaceTextColor } from "./utils";
import PlacePeople from "./people";
import PlaceRecommendations from "./recommendations";
import TabBar from "components/shared/TabBar";
import { logAppActivity, PermissionKey, setTabNavColors } from "redux/app";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ApiFollow } from "components/shared/ApiFollow";
import { checkUser } from "redux/user";
import { store } from "redux/store";
import ShareButton from "components/shared/ShareButton";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import CenteredLoader from "components/shared/CenteredLoader";
import {useHeaderHeight} from '@react-navigation/elements';
import Reanimated, { FadeOut, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import ContentCarousel from "components/shared/ContentCarousel";
import PlaceRecsModal, { PlaceRecsModalHandle } from "components/singles/PlaceRecsModal";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import PlaceLocationsModal, { PlaceLocationsModalHandle } from "components/singles/PlaceLocationsModal";
import PlaceAddModal, { PlaceAddModalHandle } from "components/singles/PlaceAddModal";

export const PlaceRightActions: FC<{place: place}> = ({place}) => {
    // const color = usePlaceTextColor(place);
    const dispatch = useAppDispatch();
    const user = useAppSelector(state => state.user.user);
    const userPlaceData = useGetUserPlacesQuery(user ? {id: place.id} : skipToken);
    const [isFollowing, setIsFollowing] = useState(false);

    useEffect(() => {
        if(userPlaceData.isSuccess)
            setIsFollowing(userPlaceData.data.length === 1);
    }, [userPlaceData]);

    const handleChange = useCallback(async (newValue: boolean) => {
        const signedIn = await dispatch(checkUser({request: PermissionKey.followPlaces, required: true})).unwrap();

        if(!signedIn)
            return;

        newValue ?
            await api.put('user_place', {placeId: place.id}) :
            await api.delete('user_place', {placeId: place.id});

        dispatch(userGraphApi.util.invalidateTags(['places']));
    }, [place.id]);

    return <View style={{flexDirection: 'row', alignItems: 'center'}}>
        {/* <ApiFollow color={'white'} isFollowing={isFollowing} isFollowingFetching={userPlaceData.isFetching} onChange={handleChange} /> */}
        <ShareButton id={place.id} url={`https://jungle.link/place/${place.nameUrl}`} message={`${place.name} on Jungle`} type={'place'} color={'white'} />
    </View>
}

export type PlaceTabParamList = {
    'About'?: undefined;
    'People'?: undefined;
    'Recommendations'?: undefined;
};

export type PlaceTabScreenProps<S extends keyof PlaceTabParamList> = BottomTabScreenProps<PlaceTabParamList, S>;

export type TabNavProps = BottomTabNavigationProp<PlaceTabParamList>;

const Tabs = createBottomTabNavigator<PlaceTabParamList>();

export const PlaceView: FC<{placeGraph: placeGraph}> = ({placeGraph}) => {
    const {place} = placeGraph;
    const dispatch = useAppDispatch();
    const {navigation, route} = useContext(RootNavContext);
    
    const lineColor = usePlaceBorderColor(place);
    const backgroundColor = usePlaceBgColor(place);
    const color = usePlaceTextColor(place);
    
    const bounds = useWindowDimensions();

    const tabBar = useCallback((props: BottomTabBarProps) => <TabBar placeTabs={true} {...props} {...{backgroundColor, color, lineColor}} />, [backgroundColor, color, lineColor]);
    const insets = useSafeAreaInsets();

    const footerHeight = useAppSelector(state => state.app.footerHeight);
    const headerHeight = useHeaderHeight();

    const opacity = useSharedValue(0);
    const uas = useAnimatedStyle(() => ({opacity: opacity.value}), [opacity]);
    
    useEffect(() => {
        opacity.value = withTiming(1, {duration: 500});
    }, []);

    return (
        <PlaceGraphContext.Provider value={placeGraph}>
            <Reanimated.View style={[{flex: 1, alignItems: 'center', justifyContent: 'flex-start', backgroundColor, width: bounds.width}, uas]}>
                <PlaceAbout />
                <View style={{width: '100%', top: 0, height: 1, backgroundColor: lineColor}}></View>
            </Reanimated.View>
        </PlaceGraphContext.Provider>
    )
}

export const PlaceScreen: FC<RootScreenProps<'Place'>> = props => {
    const dispatch = useAppDispatch();
    const id = useRouteId(props.route);
    const nameUrl = useRouteNameUrl(props.route);
    const placeData = useGetPlaceByQuery(id || nameUrl ? {id, nameUrl, backwardsCompatibleDate: true} : skipToken);

    const isFocused = useIsFocused();
    const [barStyle, setBarstyle] = useState<'light-content' | 'dark-content'>();

    useEffect(() => {
        if(isFocused){
            if(placeData.isSuccess && placeData.data){
                const {place} = placeData.data;
                const color = getPlaceTextColor(place);
                const backgroundColor = getPlaceBgColor(place);
                const lineColor = getPlaceLineColor(place);

                props.navigation.setOptions({
                    title: place.name,
                    headerTransparent: true,
                    headerShadowVisible: false,
                    headerTintColor: 'white',
                    headerShown: true,
                    headerTitleStyle: {color: 'transparent'},
                    headerRight: () => <PlaceRightActions place={place} />
                });

                const rgb = parseInt(backgroundColor.replace('#', ''), 16);
                const r = (rgb >> 16) & 0xff;
                const g = (rgb >>  8) & 0xff;
                const b = (rgb >>  0) & 0xff;

                const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;

                setBarstyle(luma < 100 ? 'light-content' : 'dark-content');
                dispatch(setTabNavColors({
                    bg: backgroundColor,
                    line: lineColor,
                    text: color
                }));
            }    
            else{
                props.navigation.setOptions({
                    headerShown: false
                });
                dispatch(setTabNavColors());
            }
        }
    }, [isFocused, placeData.isSuccess]);

    const [placeScreenContext, setPlaceScreenCtx] = useState<IPlaceScreenCtx>({
        placeLocationsModalRef: null,
        placeRecsModalHandle: null,
        placeUserListAddModalHandle: null
    });

    const setPlaceRecsModalRefDispatch = useCallback((el: PlaceRecsModalHandle|null) => {
        placeScreenContext.placeRecsModalHandle = el;
      }, [placeScreenContext]);
    const setUserListPlaceAddRefDispatch = useCallback((el: PlaceAddModalHandle|null) => {
        placeScreenContext.placeUserListAddModalHandle = el;
    }, [placeScreenContext]);
    const setPlaceLocationsModal = useCallback((el: PlaceLocationsModalHandle|null) => {
        placeScreenContext.placeLocationsModalRef = el;
    }, [placeScreenContext]);

    return <RootNavContext.Provider value={props}>
        <PlaceScreenContext.Provider value={placeScreenContext}>
            <BottomSheetModalProvider>
            <View style={{flex: 1, backgroundColor: '#030303'}}>
                <StatusBar barStyle={"light-content"} />
                {
                    placeData.isError || (placeData.isSuccess && !placeData.data) ? 
                    <View style={{alignItems: 'center', justifyContent: 'center', flex: 1}}>
                        <TouchableOpacity activeOpacity={0.75} onPress={() => props.navigation.canGoBack() ? props.navigation.goBack() : props.navigation.navigate('Home')}>
                            <Text style={{color: 'white'}}>Place not found, return to home</Text>
                        </TouchableOpacity>
                    </View> : 
                    (placeData.isSuccess && !!placeData.data) ? <PlaceView placeGraph={placeData.data} /> :
                    <Reanimated.View exiting={FadeOut}>
                        <CenteredLoader style={{position: 'absolute'}} />
                    </Reanimated.View>
                }
            </View>
            <PlaceRecsModal ref={setPlaceRecsModalRefDispatch} />
            <PlaceLocationsModal ref={setPlaceLocationsModal} />
            <PlaceAddModal ref={setUserListPlaceAddRefDispatch} />
            </BottomSheetModalProvider>
        </PlaceScreenContext.Provider>
    </RootNavContext.Provider>
}

export default PlaceScreen;