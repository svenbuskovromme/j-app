import { UseQueryHookResult } from "@reduxjs/toolkit/dist/query/react/buildHooks";
import React, { FC, useContext } from "react";
import { useCallback } from "react";
import { useEffect } from "react";
import { ActivityIndicator, Image, ScrollView, Text, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useGetPlaceByQuery } from "redux/api";
import { getFullName, getSubtitle, RootNavContext, source } from "utils";
import { tastemakerGraph, tastemakerNoteGraph } from "jungle-shared";
import { PlaceGraphContext, usePlaceBgColor, usePlaceBorderColor, usePlaceTextColor } from "./utils";
import CenteredLoader from "components/shared/CenteredLoader";

export const PlaceRecommendations: FC = () => {
    const placeGraph = useContext(PlaceGraphContext);
    const color = usePlaceTextColor();
    const backgroundColor = usePlaceBgColor();
    const lineColor = usePlaceBorderColor();

    return <ScrollView showsVerticalScrollIndicator={false} style={{backgroundColor, flex: 1, width: '100%'}} contentContainerStyle={{}}>
        {
            placeGraph.notes.map(p => <NoteView key={p.note.id} {...p}/>)
        }
    </ScrollView>;
}

const NoteView: FC<tastemakerNoteGraph> = ({note, tastemaker}) => {
    const color = usePlaceTextColor();
    const lineColor = usePlaceBorderColor();
    const nav = useContext(RootNavContext);
    const onPress = useCallback(() => {
        nav.navigation.push('Tastemaker', {id: tastemaker.tastemaker.id});
    }, [nav, tastemaker]);


    return <View style={{borderBottomColor: lineColor, borderBottomWidth: 1, width: '100%', paddingHorizontal: 20, paddingVertical: 40}} >
        <TouchableOpacity activeOpacity={0.75} style={{width: '100%', flexDirection: 'row', alignItems: 'center', marginBottom: 15}} onPress={onPress}>
            <View style={{width: 50, aspectRatio: 1,borderRadius: 25, overflow: 'hidden', marginRight: 15}}>
                <Image source={{uri: source.person.small(tastemaker.tastemaker.id)}} resizeMode={'cover'} style={{width: '100%', height: '100%'}} />
            </View>
            <View style={{flex: 1}}>
                <Text style={{fontSize: 20, color }}>{getFullName(tastemaker.tastemaker)}</Text>
                <Text style={{width: '100%', fontSize: 20, color}}>{getSubtitle(tastemaker)}</Text>
            </View>
        </TouchableOpacity>
        <Text style={{fontSize: 17, lineHeight: 22, color, }}>"{note.note}"</Text>
    </View>
}

export default PlaceRecommendations;