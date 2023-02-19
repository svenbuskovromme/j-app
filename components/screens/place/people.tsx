import { UseQueryHookResult } from "@reduxjs/toolkit/dist/query/react/buildHooks";
import React, { FC, useContext } from "react";
import { useCallback } from "react";
import { useEffect } from "react";
import { ActivityIndicator, Image, ScrollView, Text, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { getFullName, rootNavRef, RootNavContext, source } from "utils";
import { tastemakerGraph } from "jungle-shared";
import { PlaceGraphContext, usePlaceBgColor, usePlaceBorderColor, usePlaceTextColor } from "./utils";

export const PlacePeople: FC = () => {
    const placeGraph = useContext(PlaceGraphContext);
    const backgroundColor = usePlaceBgColor();

    return <ScrollView showsVerticalScrollIndicator={false} style={{backgroundColor, flex: 1, width: '100%'}} contentContainerStyle={{paddingBottom: 100, paddingHorizontal: 30, paddingTop: 30}}>
        {
            placeGraph.people.map(p => p.tastemaker.enabled ? <PersonView key={p.tastemaker.id} {...p}/> : null)
        }
    </ScrollView>;
}

const PersonView: FC<tastemakerGraph> = ({tastemaker}) => {
    const nav = useContext(RootNavContext);
    const color = usePlaceTextColor();
    const onPress = useCallback(() => {
        nav.navigation.push('Tastemaker', {id: tastemaker.id});
    }, [rootNavRef, tastemaker]);

    return <TouchableOpacity activeOpacity={0.75} style={{width: '100%'}} onPress={onPress}>
        <View style={{marginBottom: 10, width: '100%', aspectRatio: 330/350}}>
            <Image source={{uri: source.person.big(tastemaker.id)}} resizeMode={'cover'} style={{width: '100%', height: '100%'}} />
        </View>
        <Text style={{marginBottom: 5, fontSize: 17, color: color + '80'}}>{tastemaker.role}</Text>
        <Text style={{marginBottom: tastemaker.bio ? 15 : 60, fontSize: 22, color}}>{getFullName(tastemaker)}</Text>
        {!!tastemaker.bio && <Text style={{marginBottom: 60, fontSize: 17, lineHeight: 22, color}}>"{tastemaker.bio}"</Text>}
    </TouchableOpacity>
}

export default PlacePeople;