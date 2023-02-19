import { UseQueryHookResult } from "@reduxjs/toolkit/dist/query/react/buildHooks";
import React, { FC, Fragment, FunctionComponent, useContext, useState } from "react";
import { useCallback } from "react";
import { useEffect } from "react";
import { ActivityIndicator, Image, RefreshControl, ScrollView, Text, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useGetEventsQuery, useGetPlaceByQuery, useGetUserEventsQuery } from "redux/api";
import { dateFields, dateFieldsSingle, getFullName, getSubtitle, RootNavContext, rootNavRef, RootScreenProps, source } from "utils";
import { eventGraph, tastemakerGraph, tastemakerNoteGraph, place } from "jungle-shared";
import { HeaderContext, UserContext } from "./contexts";
import { PlaceLogo } from "components/shared/PlaceLogo";
import CenteredLoader from "components/shared/CenteredLoader";

export const ProfileEvents: FC = () => {
    const user = useContext(UserContext);
    const {header} = useContext(HeaderContext);
    const [refreshing, setRefreshing] = useState(false);
    const onRefresh = useCallback(() => {
        setRefreshing(true);
        eventData.refetch();
    }, [setRefreshing]);

    const eventData = useGetUserEventsQuery({}, {skip: !user});
    const [pastEvents, setPastEvents] = useState<eventGraph[]>([]);
    const [currentEvents, setCurrentEvents] = useState<eventGraph[]>([]);
    const [comingEvents, setComingEvents] = useState<eventGraph[]>([]);

    useEffect(() => {
        setRefreshing(eventData.isFetching && !eventData.isLoading);
    }, [eventData.isFetching]);

    useEffect(() => {
        if(eventData.isSuccess){
            const now = Date.now();

            for(let i = 0; i < eventData.data.length; i++){
                const g = eventData.data[i];
                g.event = dateFieldsSingle(g.event, 'start', 'end');
            }

            const pastEvents = eventData.data.filter(e => e.event.end && e.event.end.getTime() < now);
            const currentEvents = eventData.data.filter(e => e.event.start.getTime() < now && e.event.end && e.event.end.getTime() > now);
            const comingEvents = eventData.data.filter(e => e.event.start.getTime() > now);

            setPastEvents(pastEvents);
            setCurrentEvents(currentEvents);
            setComingEvents(comingEvents);
        }
    }, [eventData]);

    return <ScrollView 
    refreshControl={
        <RefreshControl
        refreshing={refreshing}
        onRefresh={onRefresh}
        />
    }
    showsVerticalScrollIndicator={false}
    style={{backgroundColor: '#030303', flex: 1, width: '100%'}} contentContainerStyle={{}}>
        {header}
        {
            eventData.isLoading ? <CenteredLoader /> : 
            eventData.data ?
                eventData.data.length ?
                    <Fragment>
                        {
                            !!currentEvents.length && 
                            <Text style={{margin: 30, color: 'white', opacity: 0.6, fontSize: 16, textTransform: 'uppercase'}}>On right now</Text>
                        }
                        {currentEvents.map(e => <EventView key={e.event.id} eventObject={e} />)}
                        {
                            !!comingEvents.length &&
                            <Text style={{margin: 30, color: 'white', opacity: 0.6, fontSize: 16, textTransform: 'uppercase'}}>Events coming up</Text>
                        }
                        {comingEvents.map(e => <EventView key={e.event.id} eventObject={e} />)}
                        {
                            !!pastEvents.length &&
                            <Text style={{margin: 30, color: 'white', opacity: 0.6, fontSize: 16, textTransform: 'uppercase'}}>Past events</Text>
                        }
                        {pastEvents.map(e => <EventView key={e.event.id} eventObject={e} />)}
                    </Fragment> :
                    <Text style={{padding: 20, color: 'white', fontSize: 17}}>Events you've shown interest in will show up here</Text>:
            null
        }
    </ScrollView>;
}

const EventView: FunctionComponent<{eventObject: eventGraph}> = ({eventObject: {places, event, contentPoster}}) => {
    const [bgColor, setBgColor] = useState('');
    const [title, setTitle] = useState('');
    
    const [place, setPlace] = useState<place>();

    useEffect(() => {
        setPlace(places[0]);
    }, [places]);

    useEffect(() => {
        setTitle(event.title);

        if(place)
            setBgColor('#' + place.primaryColor);
    }, [place, event]);

    const nav = useContext(RootNavContext) as RootScreenProps<'Profile'>;

    const open = useCallback(() => nav.navigation.push('Event', {id: event.id}), [event.id, nav.navigation]);

    return <TouchableOpacity activeOpacity={0.75} onPress={open} style={{width: 300, marginVertical: 30, alignSelf: 'center'}}>
        <View style={[{overflow: 'hidden', aspectRatio: 5/4, backgroundColor: bgColor, alignItems: 'center'}]}>
                {
                    (!!contentPoster) ?
                    <Image style={{width: '100%', height: '100%'}} source={{uri: source.content.image(contentPoster.id, 200)}} resizeMode={'cover'} /> :
                    (!contentPoster && !!place) ?
                    <View style={{width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', backgroundColor: '#' + place.primaryColor}}>
                        <PlaceLogo size={150} big={true} {...place} />
                    </View> : null
                }
        </View>
        <Text numberOfLines={1} style={{color: 'white', width: 250, paddingVertical: 10, fontSize: 12}}>{title}</Text>
    </TouchableOpacity>
}

export default ProfileEvents;