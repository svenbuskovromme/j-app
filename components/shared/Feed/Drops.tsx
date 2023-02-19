import { useNavigation } from "@react-navigation/native";
import React, { FC, useCallback, useContext, useEffect, useState } from "react";
import { Text, View, FlatList, ListRenderItem, Image, TouchableOpacity } from "react-native";
import { TapGestureHandler } from "react-native-gesture-handler";
import { logAppActivity } from "redux/app";
import { useAppDispatch } from "redux/hooks";
import { dateMonth, RootNavProps, source } from "utils";
import { place, eventGraph } from "jungle-shared";
import { PlaceLogo } from "../PlaceLogo";
import { DropsListHeight, EventsListHeight, FeedContext } from "./contexts";
import Reanimated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import FastImage from "react-native-fast-image";
import { usePlaceBgColor, usePlaceTextColor } from "components/screens/place/utils";

const DropView: FC<{dropObject: eventGraph}> = ({dropObject: {places, contentPoster, event: drop}}) => {
    
    // const [title, setTitle] = useState('');
    const color = usePlaceTextColor();
    const backgroundColor = usePlaceBgColor();
    const [place, setPlace] = useState<place>();
    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(logAppActivity({type: 'dropImpression', data: {eventId: drop.id}}));
    }, [dispatch]);

    useEffect(() => {
        setPlace(places[0]);
    }, [places]);

    // useEffect(() => {
    //     if(place)
    //         setBgColor('#' + place.primaryColor);
    // }, [place]);

    const nav = useNavigation<RootNavProps>();

    const open = useCallback(() => nav.push('Event', {id: drop.id}), [nav, drop]);
    const opacity = useSharedValue(0);
    const handleLoad = useCallback(() => {opacity.value = withTiming(1, {duration: 200})}, [opacity]);
    const uas = useAnimatedStyle(() => ({opacity: opacity.value}), [opacity]);

    return <TouchableOpacity activeOpacity={0.75} activeOpacity={0.85} onPress={open}>
        <Reanimated.View style={[{width: 260, margin: 2.5}, uas]}>
            <Reanimated.View style={[{overflow: 'hidden', width: '100%', height: '100%', borderRadius: 16, backgroundColor: color}]}>
                <View style={{flex: 1}}>
                    {
                        (!!contentPoster) ?
                        <FastImage onLoad={handleLoad} onLoadEnd={handleLoad} onError={handleLoad} style={{width: '100%', height: '100%'}} source={{uri: source.content.image(contentPoster.id, 640)}} /> :
                        (!!place) ?
                        <View style={{width: '100%', height: '100%', backgroundColor: '#' + place.primaryColor}}>
                            <PlaceLogo size={150} big={true} {...place} />
                        </View> : 
                        null
                    }
                </View>
                {/* <View style={{zIndex: 1, backgroundColor: 'white', position: 'absolute', width: 40, aspectRatio: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
                    <View>
                        <Text style={{fontWeight: '300',color: '#030303' , textAlign: 'center', textTransform: 'uppercase', fontSize: 11}}>{dateMonth(drop.start)}</Text>
                        <Text style={{fontWeight: '300',color: '#030303' , textAlign: 'center', lineHeight: 21, fontSize: 21}}>{new Date(drop.start).getDate()}</Text>
                    </View>

                </View> */}
                {/* <View style={{flexDirection: 'row', width: '100%', height: 60, alignItems: 'center'}}>
                    <View style={{flex: 1}}>
                        <Text numberOfLines={2} style={{width: '100%', color: backgroundColor, padding: 10, fontSize: 15}}>{drop.title}</Text>
                    </View>
                    <View>
                        <Text style={{width: '100%', color: backgroundColor, padding: 10, fontSize: 15}}>{drop.price}</Text>
                    </View>
                </View> */}
            </Reanimated.View>
        </Reanimated.View>
    </TouchableOpacity>
}

const Drops: FC = () => {
    const context = useContext(FeedContext);
    const color = usePlaceTextColor();

    const renderItem = useCallback((({item}) => <DropView dropObject={item} />) as ListRenderItem<eventGraph>, []);
    const keyExtractor = useCallback((data: eventGraph, index: number) => `${data.event.id}`, []);
    const getLayout = useCallback((data: any, index: number) => {
        return {index, offset: (154 + 10) * index, length: 154 + 10}
    }, []);

    return context.drops.length ? <View style={{padding: 2.5, height: DropsListHeight}}>
        <Text style={{padding: 10, color, fontSize:17, fontWeight: '500', marginTop: 30}}>Drops</Text>
        <FlatList
            keyboardShouldPersistTaps={'always'}
            showsVerticalScrollIndicator={false}
            style={{overflow: 'visible'}}
            contentContainerStyle={{}}
            data={context.drops}
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

export default Drops;