import saved from "components/screens/saved";
import React, { FC, useState, useEffect, useCallback, useRef } from "react";
import { TouchableOpacity } from "react-native-gesture-handler";
import Reanimated, { FadeOut } from 'react-native-reanimated';
import { FadeOutDown } from "react-native-reanimated";
import { graphApi, useDeleteUserEventMutation, usePutUserEventMutation } from "redux/api";
import { logAppActivity, PermissionKey } from "redux/app";
import { checkUser } from "redux/user";
import { userEventRow } from "jungle-shared";
import { View, Text, ActivityIndicator } from "react-native";
import { useAppDispatch } from "redux/hooks";
import BookmarkIcon from "./BookmarkIcon";
import { RootStackParamList } from "utils";

const Button: FC<{screen: keyof RootStackParamList, size?: number, saved: boolean, eventId: number, loading: boolean, setLoading: (loading: boolean) => void}> = ({setLoading, loading, saved, eventId, size = 50, screen}) => {
    const dispatch = useAppDispatch();
    const [putEvent] = usePutUserEventMutation();
    const [deleteEvent] = useDeleteUserEventMutation();
    const userInteractionRef = useRef(false);
    const [showSavedText, setShowSavedText] = useState(false);
    
    useEffect(() => {
        if(saved && userInteractionRef.current){
            setShowSavedText(true);
            setTimeout(() => {setShowSavedText(false)}, 1000);
        }
    }, [saved]);

    const handleBookmarkPress = useCallback(async () => {
        await dispatch(checkUser({request: PermissionKey.saveEvents, required: true}));

        userInteractionRef.current = true;
        if(!saved){
            setLoading(true);
            await putEvent({event: {eventId, status: 'interested'} as userEventRow}).unwrap();
            dispatch(logAppActivity({type: 'eventBookmark', data: {id: eventId, from: screen === 'Event' ? 'event' : 'weekly'}}));
            dispatch(graphApi.util.invalidateTags(['events']));
        }
        else{
            setLoading(true);
            await deleteEvent({id: eventId}).unwrap();
            dispatch(graphApi.util.invalidateTags(['events']));
        }
    }, [saved, eventId]);

    useEffect(() => {console.log('event saved', saved)}, [saved]);

    return <View style={{justifyContent: 'center', alignItems: 'center' }}>
        {
            showSavedText &&
            <Reanimated.View exiting={FadeOut} style={[{position: 'absolute', zIndex: 2, width: 200, backgroundColor: '#030303', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10}]}>
                <Text style={{fontSize: 14, fontWeight: '600', color: 'white'}}>Saved to profile!</Text>
            </Reanimated.View>
        }
        <TouchableOpacity activeOpacity={0.75} disabled={loading} onPress={handleBookmarkPress} style={{}}>
            <View style={{alignItems: 'center', justifyContent: 'center', opacity: saved ? 0.3 : 1, backgroundColor: 'white', overflow: 'hidden', borderRadius: 25, width: size, height: size}}>
                {
                    loading ?
                    <ActivityIndicator color={'#030303'} /> :
                    <BookmarkIcon size={size * 30/50}  />
                }
            </View>
        </TouchableOpacity>
    </View>
}

export default Button;