import React, { FC, useContext, useMemo, useState } from "react";
import { useCallback } from "react";
import { useEffect } from "react";
import { ActivityIndicator, Image, RefreshControl, ScrollView, Text, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useGetPlaceByQuery, useGetPlacesQuery, useGetUserPlacesQuery, userGraphApi } from "redux/api";
import { getFullName, getSubtitle, rootNavRef, RootNavContext, RootScreenProps, source } from "utils";
import { api, placeGraph } from "jungle-shared";
import { HeaderContext, UserContext } from "./contexts";
import {  } from "@react-navigation/native-stack";
import Reanimated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated';
import ProfileFollowView from "./FollowView";
import CenteredLoader from "components/shared/CenteredLoader";
import { useAppDispatch } from "redux/hooks";

export const ProfilePlaces: FC = () => {
    const user = useContext(UserContext);
    const {header} = useContext(HeaderContext);
    const placesData = useGetUserPlacesQuery({}, {skip: !user});

    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        placesData.refetch();
    }, [placesData, setRefreshing]);

    useEffect(() => {
        setRefreshing(placesData.isFetching && !placesData.isLoading);
    }, [placesData]);

    return <Reanimated.ScrollView 
    refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      }
      showsVerticalScrollIndicator={false}
    style={{backgroundColor: '#030303', flex: 1, width: '100%'}} contentContainerStyle={{}}>
        {header}
        {   placesData.isLoading ? <CenteredLoader /> :
            placesData.data ? 
                placesData.data.length ? 
                    placesData.data.map(place => <ProfilePlaceView key={place.place.id} {...place} refreshing={refreshing} onUnfollow={onRefresh} />) :
                    <Text style={{padding: 20, color: 'white', fontSize: 17}}>Places you follow will show up here</Text>
            :null
        }
    </Reanimated.ScrollView>;
}

const ProfilePlaceView: FC<placeGraph & {refreshing: boolean, onUnfollow(): void}> = place => {
    const rootNav = useContext(RootNavContext) as RootScreenProps<'Profile'>;
    const dispatch = useAppDispatch();
    const handlePlacePress = useCallback(() => {
        rootNav.navigation.push('Place', {id: place.place.id});
    }, [place, rootNavRef]);

    const handleUnfollow = useCallback(async () => {
        await api.delete('user_place', {placeId: place.place.id});
        dispatch(userGraphApi.util.invalidateTags(['places']));
    }, [place]);

    const image = useMemo(() => <Image source={{uri: source.place.logo.small(place.place.id)}} style={{borderRadius: 25, width: '100%', height: '100%', backgroundColor: '#' + place.place.primaryColor, borderColor: '#' + place.place.accentColor, borderWidth: 1}} resizeMode={'cover'} />, [place.place]);
    
    return <ProfileFollowView image={image} name={place.place.name} onItemPress={handlePlacePress} onUnfollowDone={place.onUnfollow} unfollow={handleUnfollow}  />; 
}

export default ProfilePlaces;