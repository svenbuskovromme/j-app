import ApiCheckbox from "components/shared/ApiCheckbox";
import ContentCarousel from "components/shared/ContentCarousel";
import ShareIcon from "components/shared/ShareIcon";
import React, { createContext, FC, Fragment, PropsWithChildren, useCallback, useContext, useEffect, useState } from "react";
import { ScrollView, ActivityIndicator, Image, StatusBar, Text, View, Linking, Platform } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { graphApi, useGetEventQuery, useGetEventsQuery, useGetPostQuery, useGetUserEventsQuery, userGraphApi } from "redux/api";
import { useAppDispatch, useAppSelector } from "redux/hooks";
import { dateFormat, dateFormatShort, RootNavContext, RootScreenProps, RootStackParamList, source, timeFormat, useRouteId, useRouteNameUrl } from "utils";
import { api, userEventRow, place, eventGraph, eventRow, linkRow } from "jungle-shared";
import { PlaceLogo } from "components/shared/PlaceLogo";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { getPermission, logAppActivity, PermissionKey, requestDialog, setTabNavColors } from "redux/app";
import InAppBrowser from "react-native-inappbrowser-reborn";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CenteredLoader from "components/shared/CenteredLoader";
import ShareButton from "components/shared/ShareButton";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import { checkUser } from "redux/user";
import Reanimated, { FadeOut } from "react-native-reanimated";
import HeaderView from "components/shared/HeaderView";
import GradientHeader from "components/shared/GradientHeader";
import BookmarkIcon from "components/shared/BookmarkIcon";
import Gap from "components/shared/Gap";
import BookmarkButton from "components/shared/BookmarkButton";

const EventHeaderRight: FC<{event: eventRow}> = ({event}) => {
    const user = useAppSelector(state => state.user.user);
    const dispatch = useAppDispatch();

    const eventData = useGetUserEventsQuery({id: event.id});
    const [shareMessage, setShareMessage] = useState('');
    const [shareUrl, setShareUrl] = useState('');
    useEffect(() => {
        setShareMessage(`${dateFormatShort(event.start)} - ${event.title}`);
        setShareUrl(`https://jungle.link/event/${event.nameUrl}`);
    }, [event]);

    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        setLoading(eventData.isFetching);

        if(eventData.isSuccess)
            setSaved(eventData.data.length === 1 && !!eventData.data[0].saved);
    }, [eventData, setSaved]);

    return <View style={{flexDirection: 'row', alignItems:'center', height: '100%' }}>
        <View>
            <ShareButton id={event.id} message={shareMessage} url={shareUrl} type={'event'} color={'white'} />
        </View>
        <Gap x={25} />
        <BookmarkButton screen={'Event'} size={40} eventId={event.id} loading={loading} saved={saved} setLoading={setLoading} />
    </View>
}

const LinkView: FC<{link: linkRow}> = ({link}) => {
    const dispatch = useAppDispatch();
    
    const handlePress = useCallback(() => {
        dispatch(logAppActivity({type: 'linkOpen', data: {id: link.id}}));
        Linking.openURL(link.url);
    }, [link]);

    return <TouchableOpacity activeOpacity={0.75} onPress={handlePress} style={{ borderRadius: 25, paddingHorizontal: 15, paddingVertical: 10, backgroundColor: '#007aff'}}>
        <Text style={{fontSize: 20, fontWeight: '600', color: 'white'}}>{link.name}</Text>
    </TouchableOpacity>
}

const Event: FC<{eventGraph: eventGraph}> = ({eventGraph}) => {
    const dispatch = useAppDispatch();
    
    const insets = useSafeAreaInsets();

    const footerHeight = useAppSelector(state => state.app.footerHeight);

    const [links, setLinks] = useState<linkRow[]>([]);

    useEffect(() => {
        const links: linkRow[] = [];
        for(let i = 0; i < eventGraph.content.length; i++){
            const content = eventGraph.content[i];

            links.push(...content.links);
        }

        setLinks(links);
    }, [eventGraph]);

    return <View style={{flex: 1, backgroundColor: '#030303'}}>
        <GradientHeader>

        </GradientHeader>
        <View style={{height: 1, backgroundColor: '#03030320'}} />
        {
            <EventContext.Provider value={eventGraph}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 100, paddingTop: insets.top}}>
                    <EventImage />
                    <View style={{width: '100%', flexDirection: 'row', justifyContent: 'space-between'}}>
                        <View style={{flex: 1}}>
                            <Title />
                            <EventPlaces />
                            <SubTitle />
                        </View>
                    </View>
                    <Description />
                </ScrollView>
                <View style={{position: 'absolute', bottom: 100, right: 20, flexDirection: 'row'}}>
                    {links?.map(link => <LinkView link={link} key={link.id} />)}
                </View>
                <View style={{height: 1, backgroundColor: '#FFFFFF20'}} />
                <EventInfoCarousel />
            </EventContext.Provider>
        }
    </View>;
}

const openUrl = async (url: string) => {
    if(await InAppBrowser.isAvailable()){
        InAppBrowser.open(url, {
            modalPresentationStyle: 'fullScreen',
            animated: true,
            dismissButtonStyle: 'done'
        });
    }
    else{
        Linking.openURL(url);
    }
}

const EventAction: FC = () => {
    const event = useContext(EventContext);

    const handlePress = useCallback(async () => {
        if(event.event.url){
            event.event.canBuy ? 
                Linking.openURL(event.event.url) :
                openUrl(event.event.url);
        }
    }, [event.event]);

    return event.event.url ? <TouchableOpacity activeOpacity={0.75} onPress={handlePress} style={{margin: 25, backgroundColor: 'white', borderRadius: 25, paddingHorizontal: 10, paddingVertical: 5}}>
        {
            event.event.canBuy ? 
            <Text style={{color: '#030303', fontSize: 14, textTransform: 'uppercase'}}>Buy {event.event.price ?? ''}</Text>:
            <Text style={{color: '#030303', fontSize: 14, textTransform: 'uppercase'}}>More</Text>
        }
    </TouchableOpacity> : null
}

const EventInfoCarousel: FC = () => {
    return <ScrollView showsHorizontalScrollIndicator={false} horizontal={true} style={{height: 60, width: '100%'}}>
        <EventDateTime />
        <EventInfoAddress />
    </ScrollView>;
}

const EventInfoItem: FC<PropsWithChildren<{text: string, border?: boolean, underline?: boolean}>> = ({children, text, underline = false, border = true}) => {
    return <View style={{paddingHorizontal: 30, borderRightWidth: border ? 1 : 0, borderLeftWidth: 0, borderColor: '#FFFFFF20', height: '100%', justifyContent: 'center'}}>
        <Text style={{fontSize: 17, color: 'white', textDecorationLine: underline ? 'underline' : 'none'}}>{text}</Text>
    </View>
}

const EventInfoAddress: FC = () => {
    const event = useContext(EventContext);

    const handlePress = useCallback(async () => {
        const url = Platform.select({ 
            ios: `maps://?q=${event.event.address}`, 
            android: `geo://?q=${event.event.address}` 
        });

        if(url)
            Linking.openURL(url);
    }, [openUrl, event.event.address]);

    return event.event.address ? <TouchableOpacity activeOpacity={0.75} onPress={handlePress}>
        <EventInfoItem border={false} underline={true} text={event.event.address} />
    </TouchableOpacity> : null;
}

const EventDateTime: FC = () => {
    const event = useContext(EventContext);

    return event.event.startEndLabel ? 
        <EventInfoItem text={event.event.startEndLabel} /> :
        <Fragment>
            <EventDate />
            <EventTime />
        </Fragment>;
}

const EventDate: FC = () => {
    const event = useContext(EventContext);
    const [text, setText] = useState('');

    useEffect(() => {
        const start = dateFormat(event.event.start);
        
        setText(start);
    },[ event.event]);

    return <EventInfoItem text={text} />
}

const EventTime: FC = () => {
    const event = useContext(EventContext);
    const [text, setText] = useState('');

    useEffect(() => {
        const start = timeFormat(event.event.start);
        const end = event.event.end ? timeFormat(event.event.end) : null;
        setText(`${start}${end ? ` - ${end}` : ''}`);
    },[ event.event]);

    return <EventInfoItem text={text} />
}



const EventContext = createContext({} as eventGraph);

const EventImage: FC = () => {
    const event = useContext(EventContext);

    return <View>
        <ContentCarousel showTags={false} aspectRatio={4/5} screen={'Event'}  inView={true} content={event.content} />
    </View>
}

const Title: FC = () => {
    const event = useContext(EventContext);

    return <Text style={{fontSize: 34, fontWeight: '600', color: 'white', padding: 15, paddingVertical: 25}}>{event.event.title}</Text>;
}

const EventPlaceView: FC<{place: place, eventId: number}> = ({place, eventId}) => {
    const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const dispatch = useAppDispatch();

    const handlePress = useCallback(() => {
        dispatch(logAppActivity({type: 'placeOpen', data: {placeId: place.id, fromEventId: eventId}}));
        nav.push('Place', {id: place.id});
    }, [nav, place.id, eventId]);

    return <TouchableOpacity activeOpacity={0.75} onPress={handlePress} style={{flexDirection: 'row', alignItems: 'center', marginHorizontal: 10}}>
        <PlaceLogo size={40} {...place} />
        <Text style={{marginLeft: 10, color: 'white', fontSize: 20, fontWeight: '400'}}>{place.name}</Text>
    </TouchableOpacity>
}

const EventPlaces: FC = () => {
    const event = useContext(EventContext);

    return <ScrollView horizontal={true} style={{marginHorizontal: 5, marginVertical: 0}} contentContainerStyle={{paddingRight: 120}} showsHorizontalScrollIndicator={false}>
        {event.places.map(p => <EventPlaceView key={p.id} place={p} eventId={event.event.id} />)}
    </ScrollView>
}

const SubTitle: FC = () => {
    const event = useContext(EventContext);

    return event.event.subtitle ? <Text style={{fontSize: 22, color: 'white', padding: 15, paddingVertical: 25}}>{event.event.subtitle}</Text> : null;
}

const Description: FC = () => {
    const event = useContext(EventContext);

    return event.event.description ? <Text style={{fontSize: 17, lineHeight: 22, color: 'white', padding: 15, paddingVertical: 25}}>{event.event.description}</Text> : null;
}

const EventIndex: FC<RootScreenProps<'Event'>> = props => {
    const id = useRouteId(props.route);
    const nameUrl = useRouteNameUrl(props.route);
    const eventData = useGetEventQuery(id || nameUrl ? {id, nameUrl} : skipToken);
    const dispatch = useAppDispatch();
    const headerRight = useCallback(() => (eventData.isSuccess && eventData.data) ? <EventHeaderRight event={eventData.data.event} /> : null, [eventData]);
    
    const setColors = useCallback(() => {
        dispatch(setTabNavColors());
    }, [dispatch]);

    useFocusEffect(setColors);
    
    useEffect(() => {
        props.navigation.setOptions({
            headerRight,
            headerTintColor: 'white',
            headerTitle: '',
            headerStyle: {backgroundColor: 'transparent'},
            headerTransparent: true
        });
    }, [headerRight]);

    return <RootNavContext.Provider value={props}>
        <View style={{flex: 1, backgroundColor: '#030303'}}>
            <StatusBar barStyle={'light-content'} />
            {
                eventData.isError || (eventData.isSuccess && !eventData.data) ? 
                <View style={{alignItems: 'center', justifyContent: 'center', flex: 1}}>
                    <TouchableOpacity activeOpacity={0.75} onPress={() => props.navigation.canGoBack() ? props.navigation.goBack() : props.navigation.navigate('Home')}>
                        <Text style={{color: 'white'}}>Event not found, return to home</Text>
                    </TouchableOpacity>
                </View> : 
                eventData.isSuccess && !!eventData.data ? <Event eventGraph={eventData.data} /> :
                <Reanimated.View exiting={FadeOut}>
                    <CenteredLoader style={{position: 'absolute'}} />
                </Reanimated.View>
            }
        </View>
    </RootNavContext.Provider>
}

export default EventIndex;