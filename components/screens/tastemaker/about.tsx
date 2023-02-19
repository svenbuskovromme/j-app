import { PlaceLogo } from "components/shared/PlaceLogo";
import { place } from "jungle-shared";
import React, { FC, useCallback, useContext, useEffect, useState } from "react"
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import FastImage from "react-native-fast-image";
import Reanimated, { useSharedValue, withTiming, useAnimatedStyle } from "react-native-reanimated";
import { logAppActivity } from "redux/app";
import { useAppDispatch, useAppSelector } from "redux/hooks";
import { getFullName, getSubtitle, RootNavContext, RootScreenProps, source } from "utils";
import { TastemakerGraphContext } from "./contexts";
import TastemakerRecommendations from "./recommendations";

const TastemakerAbout: FC = () => {
    return <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 50}}>
        <TastemakerPhoto />
        <View style={{padding: 20}}>
            <TastemakerName />
            <TastemakerPlaces />
            <TastemakerBio />
        </View>
        <View style={{height: 60, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#FFFFFF20', alignItems: 'center', justifyContent: 'center'}}>
            <Text style={{fontSize: 20, color: '#FFFFFF60'}}>Recommendations</Text>
        </View>
        <TastemakerRecommendations />
    </ScrollView>
}


const TastemakerPhoto: FC = () => {
    const tmg = useContext(TastemakerGraphContext);

    const opacity = useSharedValue(0);
    const handleLoad = useCallback(() => {opacity.value = withTiming(1, {duration: 200})}, [opacity]);
    const uas = useAnimatedStyle(() => ({opacity: opacity.value}), [opacity]);

    return <Reanimated.View style={[{width: '100%'}, uas]}>
        <FastImage onLoad={handleLoad} onLoadEnd={handleLoad} onError={handleLoad} source={{uri: source.person.big(tmg.tastemaker.id)}} resizeMode={'cover'} style={{aspectRatio: 4/5, width: '100%'}} />
    </Reanimated.View>
}

const TastemakerName: FC = () => {
    const tmg = useContext(TastemakerGraphContext);

    return <Text style={{fontSize: 27, marginBottom: 20, color: 'white'}}>{getFullName(tmg.tastemaker)}</Text>;
}

const TastemakerBio: FC = () => {
    const tmg = useContext(TastemakerGraphContext);

    return tmg.tastemaker.bio ? <Text style={{marginTop: 30, fontSize: 17, lineHeight: 22, marginBottom: 20, color: 'white'}}>"{tmg.tastemaker.bio}"</Text> : null;
}


const TastemakerPlaceView: FC = () => {
    const tmg = useContext(TastemakerGraphContext);
    const nav = useContext(RootNavContext) as RootScreenProps<'Tastemaker'>;
    const dispatch = useAppDispatch();
    const handlePress = useCallback(() => {
        if(tmg.tastemaker.placeId){
            dispatch(logAppActivity({type: 'placeOpen', data: {placeId: tmg.tastemaker.placeId, fromTastemakerId: tmg.tastemaker.id}}));
            nav.navigation.push('Place', {id: tmg.tastemaker.placeId});
        }
    }, [nav, tmg.tastemaker.placeId]);

    return !!tmg.tastemaker.placeId ? <TouchableOpacity activeOpacity={0.75} onPress={handlePress} style={{flexDirection: 'row', alignItems: 'center'}}>
        {
            !!tmg.tastemaker.placeId &&
            <View style={{marginRight: 8}}>
                <FastImage source={{uri: source.place.logo.background(tmg.tastemaker.placeId)}} style={{borderRadius: 25, height: 50, width: 50}} />
            </View>
        }
        <View>
            <Text style={{fontSize: 17,color: 'white'}}>{tmg.placeName}</Text>
            <Text style={{fontSize: 17,color: 'white'}}>{tmg.tastemaker.role}</Text>
        </View>
    </TouchableOpacity> : <Text style={{color: 'white'}}>{getSubtitle(tmg)}</Text>;
}
 
const TastemakerPlaces: FC = () => {
    return <TastemakerPlaceView />;
}

export default TastemakerAbout;