import { BottomTabBarProps, BottomTabNavigationProp, BottomTabScreenProps, createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useFocusEffect } from "@react-navigation/native";
import { PlaceLogo } from "components/shared/PlaceLogo";
import ShareIcon from "components/shared/ShareIcon";
import TabBar from "components/shared/TabBar";
import { api, place, tastemaker } from "jungle-shared";
import React, { FC, useCallback, useContext, useEffect, useState } from "react";
import { ActivityIndicator, Image, Share, StatusBar, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { graphApi, useGetTastemakerByIdQuery, useGetTastemakerQuery, useGetUserTastemakersQuery, userGraphApi } from "redux/api";
import { logAppActivity, PermissionKey, setTabNavColors } from "redux/app";
import { useAppDispatch, useAppSelector } from "redux/hooks";
import { getFullName, getSubtitle, RootNavContext, RootScreenProps, source, useRouteId, useRouteNameUrl } from "utils";
import { tastemakerGraph } from "jungle-shared";
import TastemakerAbout from "./about";
import { TastemakerGraphContext } from "./contexts";
import TastemakerRecommendations from "./recommendations";
import CenteredLoader from "components/shared/CenteredLoader";
import { ApiToggle } from "components/shared/ApiToggle";
import { ApiFollow } from "components/shared/ApiFollow";
import { checkUser } from "redux/user";
import ShareButton from "components/shared/ShareButton";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import Reanimated, { FadeOut } from 'react-native-reanimated';
import {useHeaderHeight} from '@react-navigation/elements';

export const TastemakerRightActions: FC<{tastemaker: tastemaker}> = ({tastemaker}) => {
    const dispatch = useAppDispatch();
    const user = useAppSelector(state => state.user.user);
    const [isFollowing, setIsFollowing] = useState(false);
    const userTastemakerData = useGetUserTastemakersQuery(user ? {id: tastemaker.id} : skipToken);

    useEffect(() => {
        if(userTastemakerData.isSuccess){
            setIsFollowing(userTastemakerData.data.length === 1);
        }
    }, [userTastemakerData, setIsFollowing]);

    const handleFollowChange = useCallback(async (newValue: boolean) => {
        const signedIn = await dispatch(checkUser({request: PermissionKey.followTastemakers, required: true})).unwrap();

        if(!signedIn)
            return;

        newValue ?
            await api.put('user_tastemaker', {tastemakerId: tastemaker.id}) :
            await api.delete('user_tastemaker', {tastemakerId: tastemaker.id});

        dispatch(userGraphApi.util.invalidateTags(['tastemakers']));
    }, [tastemaker.id]);

    const [shareMessage, setShareMessage] = useState('');
    const [shareUrl, setShareUrl] = useState('');
    useEffect(() => {
        setShareMessage(`${getFullName(tastemaker)} on Jungle`);
        setShareUrl(`https://jungle.link/tastemaker/${tastemaker.nameUrl}`);
    }, [tastemaker]);
    
    return <View style={{flexDirection: 'row', alignItems: 'center'}}>
        {/* <ApiFollow isFollowing={isFollowing} isFollowingFetching={userTastemakerData.isFetching} onChange={handleFollowChange} /> */}
        <ShareButton id={tastemaker.id} message={shareMessage} type={'tastemaker'} url={shareUrl} color={'white'} />
    </View>
}

export type TastemakerTabParamList = {
    'About'?: undefined;
    'Recommendations'?: undefined;
};

export type TastemakerTabScreenProps<S extends keyof TastemakerTabParamList> = BottomTabScreenProps<TastemakerTabParamList, S>;

export type TabNavProps = BottomTabNavigationProp<TastemakerTabParamList>;

export const Tastemaker: FC<{tastemakerGraph: tastemakerGraph}> = ({tastemakerGraph}) => {
    const insets = useSafeAreaInsets();

    const footerHeight = useAppSelector(state => state.app.footerHeight);

    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(logAppActivity({type: 'tastemakerOpen', data: {tastemakerId: tastemakerGraph.tastemaker.id}}));
    }, []);

    return <View style={{flex:1, backgroundColor: '#030303'}}>
        <TastemakerGraphContext.Provider value={tastemakerGraph}>
            <TastemakerAbout />
        </TastemakerGraphContext.Provider>
    </View>;
}

const TastemakerIndex: FC<RootScreenProps<'Tastemaker'>> = props => {
    const id = useRouteId(props.route);
    const nameUrl = useRouteNameUrl(props.route);
    const tmData = useGetTastemakerByIdQuery(id || nameUrl ? {id, nameUrl} : skipToken);

    const dispatch = useAppDispatch();

    useFocusEffect(() => {
        dispatch(setTabNavColors());
    });

    useEffect(() => {
        if(tmData.isSuccess && tmData.data){
            const tastemaker = tmData.data.tastemaker;
            props.navigation.setOptions({
                headerShown: true,
                headerTransparent: true,
                headerTintColor: 'white',
                headerTitle: getFullName(tastemaker),
                headerRight: () => <TastemakerRightActions tastemaker={tastemaker as tastemaker} />
            });
        }
        else{
            props.navigation.setOptions({
                headerShown: false,
                headerTransparent: true,
            });
        }
    }, [props.navigation, tmData]);

    const headerHeight = useHeaderHeight();

    return <RootNavContext.Provider value={props}>
    <View style={{flex: 1, backgroundColor: '#030303', paddingTop: headerHeight}}>
        <StatusBar barStyle={'light-content'} />
        {
            tmData.isError || (tmData.isSuccess && !tmData.data) ? 
            <View style={{alignItems: 'center', justifyContent: 'center', flex: 1}}>
                <TouchableOpacity activeOpacity={0.75} onPress={() => props.navigation.canGoBack() ? props.navigation.goBack() : props.navigation.navigate('Home')}>
                    <Text style={{color: 'white'}}>Tastemaker not found, return to home</Text>
                </TouchableOpacity>
            </View> : 
            tmData.isSuccess ? <Tastemaker tastemakerGraph={tmData.data} /> :
            <Reanimated.View exiting={FadeOut}>
                <CenteredLoader style={{position: 'absolute'}} />
            </Reanimated.View>
        }
    </View>
</RootNavContext.Provider>
}

export default TastemakerIndex;
