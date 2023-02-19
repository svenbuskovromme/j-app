import { tastemakerNoteGraph } from "jungle-shared";
import React, { FC, useCallback, useContext } from "react"
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native"
import { logAppActivity } from "redux/app";
import { useAppDispatch, useAppSelector } from "redux/hooks";
import { source, RootNavContext, RootScreenProps } from "utils";
import { TastemakerGraphContext } from "./contexts";

export const TastemakerRecommendations: FC = () => {
    const tmg = useContext(TastemakerGraphContext);

    return <ScrollView showsVerticalScrollIndicator={false} style={{backgroundColor: '#030303', flex: 1}}>
        {tmg.notes.map(note => <NoteView key={note.note.id} tmg={note} />)}
    </ScrollView>
}

const NoteView: FC<{tmg: tastemakerNoteGraph}> = ({tmg: {note, tastemaker, place}}) => {
    const nav = useContext(RootNavContext) as RootScreenProps<'Tastemaker'>;
    const dispatch = useAppDispatch();
    const onPress = useCallback(() => {
        dispatch(logAppActivity({type: 'placeOpen', data: {placeId: place.place.id, fromTastemakerId: tastemaker.tastemaker.id}}));
        nav.navigation.push('Place', {id: place.place.id});
    }, [nav, tastemaker]);
    
    return <View style={{width: '100%', borderBottomColor: '#FFFFFF20', borderBottomWidth: 1, paddingHorizontal: 30, paddingVertical: 40}} >
        <TouchableOpacity activeOpacity={0.75} style={{flexDirection: 'row', alignItems: 'center', marginBottom: 15}} onPress={onPress}>
            <View style={{backgroundColor: '#' + place.place.primaryColor, width: 50, aspectRatio: 1,borderRadius: 25, overflow: 'hidden', marginRight: 15, borderWidth: 1, borderColor: '#' + place.place.accentColor}}>
                <Image source={{uri: source.place.logo.small(note.placeId)}} resizeMode={'cover'} style={{width: '100%', height: '100%'}} />
            </View>
            <View>
                <Text style={{fontSize: 20, color: 'white' }}>{place.place.name}</Text>
            </View>
        </TouchableOpacity>
        <Text style={{fontSize: 17, lineHeight: 22, color: 'white' }}>"{note.note}"</Text>
    </View>
}

export default TastemakerRecommendations;