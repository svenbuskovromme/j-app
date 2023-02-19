import { UseQueryHookResult } from "@reduxjs/toolkit/dist/query/react/buildHooks";
import React, { FC, ReactElement, useContext, useMemo, useState } from "react";
import { useCallback } from "react";
import { useEffect } from "react";
import { ActivityIndicator, Image, RefreshControl, ScrollView, Text, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import Reanimated, { FadeIn, FadeOut, Layout } from "react-native-reanimated";
import { ImageProps } from "react-native-svg";
import { graphApi, useGetPlaceByQuery, useGetTastemakersQuery, useGetUserTastemakersQuery } from "redux/api";
import { getFullName, getSubtitle, RootNavContext, rootNavRef, RootScreenProps, source } from "utils";
import { api, tastemakerGraph, tastemakerNoteGraph } from "jungle-shared";
import { HeaderContext, UserContext } from "./contexts";
import ProfileFollowView from "./FollowView";
import CenteredLoader from "components/shared/CenteredLoader";
import { useDispatch } from "react-redux";
import { useAppDispatch } from "redux/hooks";

export const ProfilePeople: FC = () => {
    const user = useContext(UserContext);
    const dispatch = useAppDispatch();
    const {header} = useContext(HeaderContext);

    const peopleData = useGetUserTastemakersQuery({}, {skip: !user});

    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        peopleData.refetch();
    }, [peopleData, setRefreshing]);

    useEffect(() => {
        setRefreshing(peopleData.isFetching && !peopleData.isLoading);
    }, [peopleData]);

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
            {   peopleData.isLoading ? <CenteredLoader /> :
                peopleData.data ? 
                    peopleData.data.length ? 
                        peopleData.data.map(tm => <ProfilePersonView key={tm.tastemaker.id} {...tm} onUnfollow={onRefresh} />) :
                        <Text style={{padding: 20, color: 'white', fontSize: 17}}>People you follow will show up here</Text>:
                null
            }
        </Reanimated.ScrollView>
}

const ProfilePersonView: FC<tastemakerGraph & {onUnfollow(): void}> = tm => {
    const rootNav = useContext(RootNavContext) as RootScreenProps<'Profile'>;
    const image = useMemo(() => <Image source={{uri: source.person.small(tm.tastemaker.id)}} style={{width: '100%', borderRadius: 25, height: '100%'}} resizeMode={'cover'} />, [tm.tastemaker.id]) 
    const name = useMemo(() => getFullName(tm.tastemaker), [tm.tastemaker]);
    const unfollow = useCallback(async () => {
        await api.delete('user_tastemaker', {tastemakerId: tm.tastemaker.id});
    }, [tm.tastemaker.id]);
    const {onUnfollow} = tm;
    const handleItemPress = useCallback(() => {
        rootNav.navigation.push('Tastemaker', {id: tm.tastemaker.id});
    }, [rootNav, tm.tastemaker.id]);

    return <ProfileFollowView image={image} name={name} onItemPress={handleItemPress} onUnfollowDone={onUnfollow} unfollow={unfollow}  />; 
}


export default ProfilePeople;