import { BottomSheetModal, BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { useFocusEffect } from "@react-navigation/native";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import CenteredLoader from "components/shared/CenteredLoader";
import Feed from "components/shared/Feed";
import Gap from "components/shared/Gap";
import JungleIcon from "components/shared/JungleIcon";
import LocationNode from "components/shared/LocationNode";
import React, { FC, Fragment, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Image, Linking, ListRenderItem, RefreshControl, ScrollView, StatusBar, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from "react-native-svg";
import { graphApi, useGetEventsQuery, useGetLocationNodeByQuery, useGetLocationNodesQuery, useGetTastemakerNoteByQuery, useGetTastemakerNotesQuery } from "redux/api";
import { logAppActivity, setTabNavColors } from "redux/app";
import { useAppDispatch, useAppSelector, useLocationNode, useLocationNodeId } from "redux/hooks";
import locationNodes, { setFilter } from "redux/locationNodes";
import { dateMonth, getFullName, RootNavContext, RootScreenProps, source } from "utils";
import Map from "components/singles/Map";
import { contentGraph, contentRow, locationNodeGraph, nodeListGraph, tastemakerNoteGraph } from "jungle-shared";
import NodeListButton from "components/shared/NodeListButton";
import FastImage from "react-native-fast-image";
import { PlaceLogo } from "components/shared/PlaceLogo";
import ArrowIcon from "components/shared/ArrowIcon";
import GradientHeader from "components/shared/GradientHeader";
import LocationHeader from "components/shared/LocationHeader";
import HeaderView from "components/shared/HeaderView";
import ActiveImage from "components/shared/ActiveImage";
import Gradient from "components/shared/Gradient";
import { BlurView } from "@react-native-community/blur";
import CheckMarkIcon from "components/shared/CheckMarkIcon";

const LatestRecommendation: FC = () => {
    const locationNodeId = useLocationNodeId();
    const timestamp = useMemo(() => Date.now(), []);
    const data = useGetTastemakerNoteByQuery(locationNodeId ? {featuredAt: {locationNodeId, timestamp}} : skipToken, {refetchOnReconnect: true});
    const nav = useContext(RootNavContext);
    const dispatch = useAppDispatch();
    const handleTmPress = useCallback(() => {
        if(data.data){
            nav.navigation.push('Tastemaker', {id: data.data.tastemaker.tastemaker.id})
        }
    }, [data, nav]);
    const handlePlacePress = useCallback(() => {
        if(data.data){
            nav.navigation.push('Place', {id: data.data.place.place.id});
            dispatch(logAppActivity({type: 'placeOpen', data: {placeId: data.data.place.place.id, fromHome: true}}));
        }
    }, [data,nav]);

    const [content, setContent] = useState<contentGraph>();
    useEffect(() => {
        setContent(data.data?.place?.posterContent ?? data.data?.place?.content[0]);
    }, [data.data?.place]);
    
    return (data.isFetching ? <ActivityIndicator style={{height: 150, width: '100%'}} color={'white'} /> :
            data.isSuccess ? 
            data.data ? <TouchableOpacity activeOpacity={0.75} onPress={handlePlacePress} style={{borderRadius: 20, overflow: 'hidden', backgroundColor: '#242424', width: '100%', alignItems: 'center', justifyContent: 'center'}}>
                    <View style={{justifyContent: 'space-evenly', flex: 1, zIndex:2}}>
                        <View style={{paddingHorizontal: 20, paddingVertical: 30, zIndex: 2}}>
                            {/* <Gap y={100} /> */}
                            <Text style={{ fontSize: 22, fontWeight: '500', color: 'white'}}>"{data.data.note.note}"
                            <TouchableOpacity activeOpacity={0.75} style={{alignSelf: 'flex-end'}} hitSlop={{top: 25, bottom: 25}} onPress={handleTmPress}><Text style={{ fontSize: 20, color: '#007aff', fontWeight: '500'}}> — {getFullName(data.data.tastemaker.tastemaker)}</Text></TouchableOpacity>
                            </Text>
                            <Gap y={10} />
                             
                        </View>
                    </View>
                    {
                        !!content?.content &&
                        <ActiveImage source={{uri: source.content.image(content.content.id, 640)}} style={{height: 100, width: '100%'}} />
                    }
                </TouchableOpacity> :
                null:
                // <Text style={{color: 'white'}}>Recommendation not found</Text> :
                null
            // <Text style={{color: 'white'}}>Last case</Text>
    )
}

const Header: FC<{text: string}> = ({text}) => {
    return <Text style={{padding: 10, color: 'white', fontSize: 20, fontWeight: '600'}}>{text}</Text>
}

const HomeScreen: FC<RootScreenProps<'Home'>> = navProps => {
    const insets = useSafeAreaInsets();
    const footerHeight = useAppSelector(state => state.app.footerHeight);
    const dispatch = useAppDispatch();
    const locationNodeId = useLocationNodeId();
    const locationNode = useLocationNode();

    const headerLeft = useCallback(() => <Svg width="30" height="17" viewBox="0 0 30 17" fill="none">
        <Path d="M28.2438 8.2895C26.5543 8.2895 24.933 8.8031 23.5743 9.75357C24.5064 7.60931 26.2283 5.88532 28.4268 4.93416L28.7169 4.80835L27.6482 2.42768L27.3582 2.5528C25.5814 3.32216 24.0263 4.50005 22.8147 5.98901V0H20.1649V5.9897C18.9533 4.50144 17.399 3.32285 15.6214 2.55349L15.3314 2.42837L14.2627 4.80904L14.5527 4.93485C16.7506 5.88602 18.4732 7.61 19.4053 9.75427C18.0459 8.80379 16.4246 8.29019 14.7351 8.29019H13.0603V10.8921H14.7351C17.7291 10.8921 20.1649 13.2838 20.1649 16.2237V16.5348H22.8147V16.2237C22.8147 13.2838 25.2505 10.8921 28.2445 10.8921H29.92V8.29019H28.2445L28.2438 8.2895Z" fill="white"/>
        <Path d="M8.11481 11.1472C8.11481 12.2767 7.88531 13.0993 7.43336 13.5914C6.98351 14.0808 6.40484 14.3186 5.66425 14.3186C4.87438 14.3186 4.26684 14.0663 3.80573 13.5465C3.3404 13.0218 3.10386 12.2435 3.10386 11.2336V10.9225H0V11.2336C0 13.0626 0.495604 14.4956 1.47203 15.4924C2.45197 16.4926 3.86205 17 5.66425 17C7.46644 17 8.85681 16.4829 9.83676 15.4633C10.8125 14.4486 11.3067 13.0039 11.3067 11.1693V0.076063H8.11481V11.1472Z" fill="white"/>
    </Svg>, []);

    useFocusEffect(() => {
        dispatch(setTabNavColors());
        dispatch(setFilter('home'));
    });

    useEffect(() => {
        dispatch(logAppActivity({type: 'homeOpen'}));
    }, []);

    useEffect(() => {
        navProps.navigation.setOptions({
            headerShown: false,
            headerLeft
        });
    }, [headerLeft]);

    const handleWeeklyPress = useCallback(() => {
        dispatch(logAppActivity({type: 'weeklyOpen'}))
        navProps.navigation.push('Weekly');
    }, [navProps]);

    const handleMapPress = useCallback(() => {
        navProps.navigation.push('Search', {initial: 'map'});
        dispatch(logAppActivity({type: 'searchOpen', data: {button: 'map'}}));
    }, [navProps]);

    const bounds = useWindowDimensions();
    const eventsData = useGetEventsQuery(locationNodeId ? {locationNodeId, count:0 , sort: 'startDate', order: 'asc', filter: 'weekly' } : skipToken, {refetchOnFocus: true});
    const [day, setDay] = useState(0);
    useEffect(() => {setDay((new Date().getDay() + 6) % 7)}, []);
    const [weeklyContent, setWeeklyContent] = useState<contentRow>();
    useEffect(() => {
        if(eventsData.data){
            const today = new Date();
            let day = new Date().getDay();
            const hours = new Date().getHours();

            if(day === 0 && hours >= 19)
                day++;

            setWeeklyContent(eventsData.data.find(e => new Date(e.event.start).getDay() === day)?.contentPoster);
        }
    }, [eventsData.data]);

    const [weekStart, weekEnd]: [Date, Date] = useMemo(() => {
        const monday = new Date();
        
        if(monday.getDay() === 0 && monday.getHours() >= 19){
            monday.setDate(monday.getDate() + 1);
            monday.setHours(0,0,0,0);
        }

        monday.setDate(monday.getDate() - (monday.getDay() || 7) + 1);
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() - (monday.getDay()) + 7);
        
        return [monday, sunday];
    }, []);

    const [weekStartDate, setWeekStartDate] = useState<number>();
    const [weekEndDate, setWeekEndDate] = useState<number>();
    const [weekEndMonth, setWeekEndMonth] = useState<string>();

    useEffect(() => {
        setWeekStartDate(weekStart.getDate());
    }, [weekStart]);
    useEffect(() => {
        setWeekEndDate(weekEnd.getDate());
        setWeekEndMonth(dateMonth(weekEnd));
    }, [weekEnd]);

    const weeklyConsumed = useAppSelector(state => state.app.weeklyConsumed);

    const weeklyTs = useAppSelector(state => state.app.weeklyTs);

    const [badgeCount, setBadgeCount] = useState<number>();

    useEffect(() => {
        const endTs = weekEnd.getTime();
        const currentTs = weeklyTs;
        const diff = endTs - currentTs;
        const daysRemaining = Math.min(Math.floor(diff / (1000 * 60 * 60 * 24)), 7);

        setBadgeCount(daysRemaining);
    }, [weekStart, weekEnd, weeklyTs]);

    const handleHello = useCallback(async () => {
        try{
            if(await Linking.canOpenURL('mailto:hello@thejungleapp.com')){
                Linking.openURL('mailto:hello@thejungleapp.com');
            }
            else{
                Alert.alert('Looks like you don\'t have email set up. Write us manually at hello@thejungleapp.com');
            }
        }
        catch(e){
        }
    }, []);

    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        setRefreshing(eventsData.isFetching && !eventsData.isLoading);
    }, [eventsData]);
    const handleRefresh = useCallback(() => {
        dispatch(graphApi.util.invalidateTags(['home']));
        setRefreshing(true);
    }, []);

    return <HeaderView>
        <LocationHeader fontSize={24} />
        <StatusBar barStyle={'light-content'} />
        <ScrollView 
        refreshControl={
            <RefreshControl
            tintColor={'white'}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            />
        }
        style={{backgroundColor: '#030303', overflow: 'visible' }} showsVerticalScrollIndicator={false} contentContainerStyle={{padding: 5, paddingBottom: 100}} >
            <RootNavContext.Provider value={navProps}>
                
                <View style={{  width: '100%', aspectRatio: 400/350, borderRadius: 20, overflow: 'hidden', borderWidth: 0, borderColor: weeklyConsumed ? '#606060' : '#ffffff'}}>
                    {
                        eventsData.isSuccess && 
                        weeklyContent ? 
                        <TouchableOpacity activeOpacity={0.75} onPress={handleWeeklyPress} style={{justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%'}}>
                            <ActiveImage source={{uri: source.content.image(weeklyContent.id, 640)}}  style={{width: '100%', height: '100%', position: 'absolute'}}/>
                            <Gradient height={'50%'} opacity={'0.2'} direction={'up'} />
                            <Gradient height={'50%'} opacity={'0.7'} direction={'down'} />
                            <View style={{position: 'absolute', zIndex: 2, top: 15, right: 15}}>
                                {   
                                    badgeCount === 0 ?
                                    <View style={{paddingHorizontal: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderRadius: 20, height: 40, borderWidth: 2, borderColor: 'white'}}>
                                        {/* <Text style={{color: 'white', fontSize: 24, fontWeight: '600'}}>{'Seen'}</Text>
                                        <Gap x={10} /> */}
                                        <CheckMarkIcon size={15} strokeWidth={2} color={'white'} /> 
                                    </View>
                                    :
                                    <View style={{justifyContent: 'center', alignItems: 'center', borderRadius: 20, height: 40, paddingHorizontal: 10, backgroundColor: '#007aff'}}>
                                        <Text style={{color: 'white', fontSize: 24, fontWeight: '600'}}>{'New'}</Text>
                                    </View>
                                }
                            </View>
                            <View style={{position: 'absolute', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', right: 5, bottom: 5, left: 10}}>
                                <View style={{}}>
                                    <Text style={{color: 'white', fontSize: 14, fontWeight: '900'}}>{weekStartDate}-{weekEndDate} {weekEndMonth}</Text>
                                    <View style={{flexDirection: 'row', alignItems: 'flex-start'}}>
                                        <Text style={{textShadowColor: 'white', color: 'white', fontSize: 55, fontWeight: '700'}}>This week</Text>
                                        <View style={{paddingTop: 15}}>
                                            <JungleIcon size={15} />
                                        </View>
                                    </View>
                                </View>
                                <View style={{alignSelf: 'flex-end', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderRadius: 30, backgroundColor: 'white', margin: 10}}>
                                    <ArrowIcon color={'black'} strokeWidth={1.5} size={30} />
                                </View>
                            </View>
                        </TouchableOpacity>
                        :
                        <TouchableOpacity activeOpacity={0.75} onPress={handleWeeklyPress} style={{justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%'}}>
                            <CenteredLoader color={'white'} />
                        </TouchableOpacity>
                    }
                </View>
                <Gap y={20} />
                <TouchableOpacity activeOpacity={0.75} onPress={handleMapPress} style={{overflow: 'hidden',  width: '100%', aspectRatio: 400/150, borderRadius: 20, backgroundColor: '#242424'}}>
                    <View pointerEvents="none" style={{position: 'absolute', height: '100%', width: '100%'}}>
                        <Map screen={'Home'} />
                    </View>
                    <View style={{padding: 10, paddingHorizontal: 15}}>
                        <Text style={{color: 'white', fontSize: 30, fontWeight: '700'}}>Explore</Text>
                        {/* <Text style={{color: 'white', fontSize: 30, fontWeight: '700', textTransform: 'capitalize'}}>{locationNode?.locationNode.name}</Text> */}
                    </View>
                    
                    {/* <View style={{flexDirection: 'row', alignItems: 'flex-start'}}>
                        <Text style={{color: 'white', fontSize: 38}}>Map</Text>
                    </View> */}
                </TouchableOpacity>
                <Gap y={50} />
                <ListsSection />
                <Gap y={50} />
                <LatestRecommendation />
                <Gap y={50} />
                <View style={{alignItems: 'center'}}>
                    <JungleIcon size={20} />
                    <Gap y={15} />
                    <Text style={{color: 'white', fontWeight: '400', fontSize: 17}}>Feedback or suggestions?</Text>
                    <Gap y={20} />
                    <TouchableOpacity activeOpacity={0.75} onPress={handleHello}>
                        <Text style={{color: 'white', fontSize: 24, textDecorationLine: 'underline'}}>Write us</Text>
                    </TouchableOpacity>
                </View>
            </RootNavContext.Provider>
        </ScrollView>
    </HeaderView>
}

const ListsSection: FC = () => {
    const navProps = useContext(RootNavContext);
    const handleListsPress = useCallback(() => {
        navProps.navigation.push('Lists');
    }, [navProps]);
    const locationNodeId = useLocationNodeId();
    const locationNodeData = useGetLocationNodeByQuery(locationNodeId ? {id: locationNodeId} : skipToken, {});
    
    return <View style={{ width: '100%'}}>
        <View style={{flexDirection: 'row', width: '100%', justifyContent: 'space-between', alignItems: 'center'}}>
            <Header text={'Lists'} />
            <TouchableOpacity activeOpacity={0.75} onPress={handleListsPress} style={{padding: 10}}>
                <Text style={{color: '#7a7a7a', fontSize: 18, fontWeight: '600'}}>View all</Text>
            </TouchableOpacity>
        </View>
        <Gap y={20} />
        {
                locationNodeData.data ? <Lists locationNodeGraph={locationNodeData.data} /> :
                <CenteredLoader color={'white'} />
        }
    </View>
}

const ListsGap: FC = () => <Gap x={10} />

const Lists: FC<{locationNodeGraph: locationNodeGraph}> = ({locationNodeGraph}) => {
    const keyExtractor: (item: nodeListGraph<'list'>) => string = useCallback((item) => item.node.id.toString(), [])
    const renderItem: ListRenderItem<nodeListGraph<'list'>> = useCallback(({item: nl}) => <View style={{borderRadius: 25, overflow: 'hidden', height: 165, width: 150}} key={nl.node.id}>
            <View style={{transform: [{scale: 1}]}}>
                <NodeListButton fontSize={20} fontWeight={'600'} padding={10} gradientOpacity={'0.5'} locationNodeId={locationNodeGraph.locationNode.id} nodeList={nl} />
            </View>
        </View>, [locationNodeGraph.locationNode.id]);
    const getItemLayout = useCallback((data: any, index: number) => ({length: 150, offset: index * 150,index}), []);
    const [lists, setLists] = useState<nodeListGraph<'list'>[]>();

    useEffect(() => {setLists(locationNodeGraph.nodeLists)}, [locationNodeGraph]);

    return  <FlatList 
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        data={lists}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        ItemSeparatorComponent={ListsGap}
        initialNumToRender={3}
        windowSize={1}
    />
}

export default HomeScreen