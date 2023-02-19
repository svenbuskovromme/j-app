import { BlurView } from "@react-native-community/blur";
import ActiveImage from "components/shared/ActiveImage";
import CenteredLoader from "components/shared/CenteredLoader";
import Gap from "components/shared/Gap";
import React, { FC, useCallback, useContext, useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import Reanimated, { ComplexAnimationBuilder, FadeOut, FadeOutDown, FadeOutLeft, FadeOutRight, FadeOutUp, Layout } from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import { useGetUserEventsQuery, usePutUserEventMutation } from "redux/api";
import { RootNavContext, RootScreenProps, source } from "utils";
import { userEventRow, eventGraph } from "jungle-shared";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const UserEventView: FC<{eventGraph: eventGraph}> = ({eventGraph}) => {
    const nav = useContext(RootNavContext);
    const [exiting, setExiting] = useState<'left'|'right'>();
    const [putEvent] = usePutUserEventMutation();
    const handleArchive = useCallback(async() => {
        setExiting('left');
        await putEvent({event: {eventId: eventGraph.event.id, status: 'archived'} as userEventRow}).unwrap();
    }, []);

    const handleWent = useCallback(async () => {
        setExiting('right');
        await putEvent({event: {eventId: eventGraph.event.id, status: 'attended'} as userEventRow}).unwrap();
    }, []);

    const handlePress = useCallback(() => {
        nav.navigation.push('Event', {id: eventGraph.event.id});
    }, []);

    return <Reanimated.View style={{marginVertical: 20}} exiting={exiting === 'left' ? FadeOutLeft : exiting === 'right' ? FadeOutRight : FadeOutUp}>
            {/* <BlurView style={{position: 'absolute', height: '100%', width: '100%', zIndex: 1 }} blurAmount={2}  /> */}
            {/* <Svg height="100%" width="100%" style={{position: 'absolute', zIndex: 1}}>
                <Defs>
                    <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0" stopColor="#030303" stopOpacity="0" />
                    <Stop offset="1" stopColor="transparent" stopOpacity="0.8" />
                    </LinearGradient>
                </Defs>
                <Rect x={0} y={0} width={'100%'} height={'100%'} fill={'url(#grad)'} />
            </Svg> */}
            <TouchableOpacity activeOpacity={0.75} onPress={handlePress} style={{marginVertical: 0, justifyContent: 'flex-end', width: '100%', aspectRatio: 400/150, borderRadius: 25, overflow: 'hidden'}}>
                <ActiveImage style={{position: 'absolute', width: '100%', height: '100%'}} source={{uri: source.content.image(eventGraph.contentPoster?.id ?? 0, 640, true)}} />
            </TouchableOpacity>
            <View style={{paddingHorizontal: 20, height: 50, alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row', width: '100%', zIndex: 2,bottom: 0}}>
                <View style={{flex: 1}}>
                    <Text  style={{fontSize: 16, fontWeight: '700', color: '#ffffff'}}>{eventGraph.event.title}</Text>
                </View>
                <TouchableOpacity activeOpacity={0.75} style={{borderRadius: 25, backgroundColor: '#242424', paddingHorizontal: 10, paddingVertical: 5}} onPress={handleArchive}><Text style={{color: 'white', fontWeight: '600', fontSize: 16}}>Done</Text></TouchableOpacity>
                {/* <Gap x={20} />
                <TouchableOpacity activeOpacity={0.75} style={{borderRadius: 25, backgroundColor: '#242424', paddingHorizontal: 10, paddingVertical: 5}} onPress={handleWent}><Text style={{color: 'white', fontWeight: '600', fontSize: 16}}>Went there</Text></TouchableOpacity> */}
            </View>
        </Reanimated.View>
}

const SavedScreen: FC<RootScreenProps<'Saved'>> = navProps => {
    const eventsData = useGetUserEventsQuery({filter: 'saved', order: 'desc'});

    useEffect(() => {
        navProps.navigation.setOptions({headerTitleStyle: {fontSize: 24, fontWeight: '700'}, headerTitle: 'My saved events'});
    }, []);

    const insets = useSafeAreaInsets();

    return <RootNavContext.Provider value={navProps}>
        {/* <Reanimated.View layout={Layout.springify()} style={{flex: 1, backgroundColor: '#030303'}} contentContainerStyle={{paddingHorizontal: 5, paddingVertical: 50, flex: 1}}> */}
        <Reanimated.ScrollView layout={Layout.springify()} style={{flex: 1, backgroundColor: '#030303', paddingHorizontal: 5, paddingVertical: 50}} showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: insets.top + 50}} >
            {
                eventsData.isSuccess ? eventsData.data.map(e => <UserEventView key={e.event.id} eventGraph={e} />) :
                eventsData.isLoading ? <CenteredLoader color={'white'} /> :
                null
            }
        </Reanimated.ScrollView>
    </RootNavContext.Provider>
}

export default SavedScreen;