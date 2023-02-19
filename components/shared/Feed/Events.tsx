import { useNavigation } from "@react-navigation/native";
import React, { FC, useCallback, useContext, useEffect, useState } from "react";
import { Text, View, FlatList, ListRenderItem, Image, TouchableOpacity } from "react-native";
import { TapGestureHandler } from "react-native-gesture-handler";
import { logAppActivity } from "redux/app";
import { useAppDispatch } from "redux/hooks";
import { dateMonth, RootNavProps, source } from "utils";
import { place, eventGraph } from "jungle-shared";
import { PlaceLogo } from "../PlaceLogo";
import { EventsListHeight, FeedContext } from "./contexts";
import Reanimated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import FastImage from "react-native-fast-image";
import { usePlaceTextColor } from "components/screens/place/utils";

const EventView: FC<{eventObject: eventGraph}> = ({eventObject: {places, contentPoster, event}}) => {
    const [bgColor, setBgColor] = useState('');
    // const [title, setTitle] = useState('');
    const color = usePlaceTextColor();
    const [place, setPlace] = useState<place>();
    const dispatch = useAppDispatch();
    const context = useContext(FeedContext);

    useEffect(() => {
        dispatch(logAppActivity({type: 'eventImpression', data: {eventId: event.id}}));
    }, [dispatch]);

    useEffect(() => {
        setPlace(places[0]);
    }, [places]);

    useEffect(() => {
        if(place){
            // setTitle(event.title);
            setBgColor('#' + place.primaryColor);
        }
    }, [place, event]);

    const nav = useNavigation<RootNavProps>();

    // const open = (x: number, y: number) => controls.open(eventObject, {w: eventWidth, h: 100, r: 0, x, y});
    const open = useCallback(() => {
        nav.push('Event', {id: event.id});
        dispatch(logAppActivity({type: 'eventOpen', data: {id: event.id, from: context.placeId ? 'place' : 'calendar'}}));
    }, [nav, event, context.placeId]);

    const opacity = useSharedValue(0);
    const handleLoad = useCallback(() => {opacity.value = withTiming(1, {duration: 200})}, [opacity]);
    const uas = useAnimatedStyle(() => ({opacity: opacity.value}), [opacity]);

    return <TouchableOpacity activeOpacity={0.85} onPress={open}>
        <Reanimated.View style={[{width: 154, margin: 2.5}, uas]}>
            <Reanimated.View style={[{overflow: 'hidden', width: '100%', height: 194, borderRadius: 9, backgroundColor: bgColor}]}>
                <View style={{zIndex: 1, backgroundColor: 'white', position: 'absolute', width: 40, aspectRatio: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
                    <View>
                        <Text style={{fontWeight: '300',color: '#030303' , textAlign: 'center', textTransform: 'uppercase', fontSize: 11}}>{dateMonth(event.start)}</Text>
                        <Text style={{fontWeight: '300',color: '#030303' , textAlign: 'center', lineHeight: 21, fontSize: 21}}>{new Date(event.start).getDate()}</Text>
                    </View>

                </View>
                {
                    (!!contentPoster) ?
                    <FastImage onLoad={handleLoad} onLoadEnd={handleLoad} onError={handleLoad} style={{width: '100%', height: '100%'}} source={{uri: source.content.image(contentPoster.id, 200)}} /> :
                    (!!place) ?
                    <View style={{width: '100%', height: '100%', backgroundColor: '#' + place.primaryColor}}>
                        <PlaceLogo size={150} big={true} {...place} />
                    </View> : 
                    null
                }
            </Reanimated.View>
            <Text numberOfLines={1} style={{width: '100%', color, paddingVertical: 10, fontSize: 15}}>{event.title}</Text>
        </Reanimated.View>
    </TouchableOpacity>
}

const Events: FC = () => {
    const context = useContext(FeedContext);
    const color = usePlaceTextColor();

    const renderItem = useCallback((({item}) => <EventView eventObject={item} />) as ListRenderItem<eventGraph>, []);
    const keyExtractor = useCallback((data: eventGraph, index: number) => `${data.event.id}`, []);
    const getLayout = useCallback((data: any, index: number) => {
        return {index, offset: (154 + 10) * index, length: 154 + 10}
    }, []);

    return context.events.length ? <View style={{padding: 2.5, height: EventsListHeight}}>
        <Text style={{padding: 10, color, fontSize:17, fontWeight: '500', marginTop: 30}}>Events</Text>
        <FlatList
            keyboardShouldPersistTaps={'always'}
            showsVerticalScrollIndicator={false}
            style={{overflow: 'visible'}}
            contentContainerStyle={{}}
            data={context.events}
            renderItem={renderItem}
            initialNumToRender={3}
            keyExtractor={keyExtractor}
            windowSize={2}
            horizontal={true}
            updateCellsBatchingPeriod={1000}
            showsHorizontalScrollIndicator={false}
            getItemLayout={getLayout}
        />
    </View> : null;
}

export default Events;