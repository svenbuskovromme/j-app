import { TouchableOpacity } from "@gorhom/bottom-sheet";
import AsyncStorage from "@react-native-async-storage/async-storage";
import PushNotificationIOS from "@react-native-community/push-notification-ios";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import ActiveImage from "components/shared/ActiveImage";
import BookmarkButton from "components/shared/BookmarkButton";
import BookmarkIcon from "components/shared/BookmarkIcon";
import CloseIcon from "components/shared/CloseIcon";
import Gap from "components/shared/Gap";
import Gradient from "components/shared/Gradient";
import LocationNode from "components/shared/LocationNode";
import MoreIcon from "components/shared/MoreIcon";
import { api, userEventRow } from "jungle-shared";
import React, { createContext, FC, Fragment, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, LayoutChangeEvent, Platform, SafeAreaView, ScrollView, Text, useWindowDimensions, View } from "react-native";
import FastImage from "react-native-fast-image";
import { PanGestureHandler, PanGestureHandlerGestureEvent, TapGestureHandler } from "react-native-gesture-handler";
import Reanimated, { Easing, EasingNode, event, FadeIn, FadeOut, FadeOutLeft, FadeOutUp, Layout, measure, MeasuredDimensions, runOnJS, SharedValue, useAnimatedGestureHandler, useAnimatedReaction, useAnimatedRef, useAnimatedStyle, useDerivedValue, useSharedValue, withDecay, withSpring, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import { graphApi, useDeleteUserEventMutation, useGetEventsQuery, useGetUserEventsQuery, usePutUserEventMutation } from "redux/api";
import { getApp, getPermission, logAppActivity, PermissionKey, requestDialog, requestPermission, setFooterShown, setWeeklyConsumed, setWeeklyTs } from "redux/app";
import { useAppDispatch, useAppSelector, useLocationNodeId } from "redux/hooks";
import { checkReqPermission, checkUser } from "redux/user";
import { clamp, RootNavContext, RootScreenProps, source, WEEKLY_CONSUMED_KEY, WEEKLY_TS_KEY } from "utils";
import { eventGraph } from "jungle-shared";

interface IWeeklyCTX {
    height: number,
    width: number,
    progress: SharedValue<number>,
    loading: boolean, setLoading: (b: boolean) => void
}

const WeeklyCTX = createContext({} as IWeeklyCTX);

const days = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
];

const WeeklyEventCard: FC<{id: number, info: string, neighborhood: string, saved: boolean, index: number, uri: string, placeNames: string, title: string}> = ({uri, placeNames,title, neighborhood, info, id, saved }) => {
    const ctx = useContext(WeeklyCTX);
    const bounds = useWindowDimensions();
    const dispatch = useAppDispatch();
    const navProps = useContext(RootNavContext);
    
    const handlePress = useCallback(() => {
        navProps.navigation.push('Event', {id});
        dispatch(logAppActivity({type: 'eventOpen', data: {id: id, from: 'weekly'}}));
    }, [navProps.navigation, id]);

    return <Reanimated.View style={{height: '100%', width: '100%', paddingHorizontal: 0, justifyContent: 'space-between', alignItems: 'center'}}>
        <Text style={{color: '#818181', fontWeight: '600', fontSize: 19, textTransform:'capitalize', }}>{neighborhood}</Text>
        <Gap y={20} />
        <View style={{width: '100%', flex: 1}}>
            
            <View style={{position: 'absolute', zIndex: 2, top: 10, right: 10, justifyContent: 'center', alignItems: 'center' }}>
                <BookmarkButton screen={'Weekly'} eventId={id} loading={ctx.loading} setLoading={ctx.setLoading} saved={saved} />
            </View>
            <TapGestureHandler onActivated={handlePress} maxDeltaX={5}>
                <View style={{borderRadius: 15, overflow: 'hidden', width: '100%', height: '100%'}}>
                    <ActiveImage source={{uri}} style={{width: '100%', height: '100%' }} resizeMode={'cover'} />
                    <View pointerEvents="none" style={{position: 'absolute', bottom: -3, width: '100%', height: '100%'}}>
                        <Gradient direction={'down'} height={'50%'} opacity={'0.7'} />
                    </View>
                    <View style={{position: 'absolute', width: '100%', padding: 10, justifyContent: 'flex-end', bottom: 0}}>
                        <Text style={{color: 'white', fontSize: 19, fontWeight: '500'}}>{placeNames}</Text>
                        <View style={{justifyContent: 'space-between', flexDirection: 'row'}}>
                            <Text style={{flex: 1, textAlign: 'left', color: 'white', fontWeight: '600', fontSize: 30}}>{title}</Text>
                            {
                                info &&
                                <View style={{backgroundColor: 'white', paddingHorizontal: 10, justifyContent: 'center', borderRadius: 20, height: 35, alignSelf: 'flex-end'}}>
                                    <Text style={{color: '#030303', fontSize: 18, fontWeight: '700'}}>{info}</Text>
                                </View>
                            }
                        </View>
                    </View>
                </View>
            </TapGestureHandler>
        </View>
        {/* <View style={{width: '100%', padding: 10}}>
            {
                !!placeNames.length &&
                <Fragment>
                    <Text style={{textAlign: info ? 'left' : 'center', color: 'white', fontWeight: '600', fontSize: 15}}>{placeNames.join(' X ')}</Text>
                    <Gap y={10} />
                </Fragment>
            }
            <View style={{width:'100%', justifyContent: info ? 'space-between' : 'center', flexDirection: 'row' }}>
                <Text style={{textAlign: info ? 'left' : 'center', color: 'white', fontWeight: '500', fontSize: 25}}>{title}</Text>
                <Text>{info}</Text>
            </View>
        </View> */}
    </Reanimated.View>
};

const DoneCard: FC<{}> = () => {
    const [skipped, setSkipped] = useState(false);
    const navProps = useContext(RootNavContext);

    const dispatch = useAppDispatch();

    const subbedWeekly = useAppSelector(state => state.app.subbedWeekly);
    const [pushPerm, setPushPerm] = useState(false);
    const [subbed, setSubbed] = useState(false);

    useEffect(() => {
        if(Platform.OS === 'ios'){
            PushNotificationIOS.checkPermissions(p => {
                const perm = !!(p.alert && p.badge && p.sound);
                setPushPerm(perm);
            });
        }
    }, []);

    useEffect(() => {setSubbed(pushPerm && subbedWeekly)}, [pushPerm, subbedWeekly]);
    
    const handleClose = useCallback(() => {
        navProps.navigation.goBack();
    }, [navProps]);

    const handleSub = useCallback(async () => {
        const permission = await dispatch(requestDialog(PermissionKey.enablePush)).unwrap();

        if(!permission)
            return;

        const permissions = await PushNotificationIOS.requestPermissions({sound: true, alert: true, badge: true});

        if(permissions.alert && permissions.badge && permissions.sound){
            await api.patch('app', {row: {weeklyPush: true}});
            await dispatch(getApp()).unwrap();
            dispatch(logAppActivity({type: 'weeklySub'}));
            setPushPerm(true);
        }
    }, [subbed, dispatch, getApp]);
    const handleSkip = useCallback(() => {setSkipped(true)}, []);

    return <View style={{width: '100%', height: '100%'}}>
        <Reanimated.View layout={Layout.springify()} style={{flex: 1, alignItems: 'center', justifyContent: 'space-evenly'}}>
            <Text style={{color: 'white', fontSize: 25}}>All for now!</Text>
            <Text style={{color: '#575757', fontSize: 18}}>Come back next week for more</Text>
            {
                (subbed || skipped) ? 
                <TouchableOpacity activeOpacity={0.75} onPress={handleClose} style={{padding: 20, backgroundColor: '#242424', borderRadius: 25}}>
                    <Text style={{color: 'white', fontSize: 25}}>Close</Text>
                </TouchableOpacity> :
                <Reanimated.View style={{flexDirection: 'column', alignItems: 'center'}} exiting={FadeOut}>
                    <TouchableOpacity activeOpacity={0.75} onPress={handleSub} style={{padding: 20, backgroundColor: '#3B72FF', borderRadius: 25}}>
                        <Text style={{color: 'white', fontSize: 25}}>Remind me</Text>
                    </TouchableOpacity>
                    <Gap y={0} />
                    <TouchableOpacity activeOpacity={0.75} onPress={handleSkip} style={{padding: 20, borderRadius: 25}}>
                        <Text style={{color: 'white', fontSize: 25}}>Skip</Text>
                    </TouchableOpacity>
                </Reanimated.View>
            }
        </Reanimated.View>
    </View>
}

const WeeklyDayCard: FC<{events: eventGraph[], day: number}> = ({day,events}) => {
    const context = useContext(WeeklyCTX);
    const renderEvent = useCallback((eventGraph: eventGraph, index: number) => {
        const uri = source.content.image(eventGraph.contentPoster?.id ?? 0, 640);
        const placeNames = eventGraph.places.map(p => p.name).join(' X ');
        const info = eventGraph.event.price ?? '';
        const neighborhood = eventGraph.locations[0]?.neighborhood.name;
        
        return <WeeklyEventCard saved={eventGraph.saved} neighborhood={neighborhood} id={eventGraph.event.id} index={index} info={info} key={eventGraph.event.id} uri={uri} placeNames={placeNames} title={eventGraph.event.title} />
    }, []);

    const bounds = useWindowDimensions();

    const uas = useAnimatedStyle(() => {
        // const opacity = Math.pow(1 - Math.abs(day - (context.progress.value ?? 0)), 4);
        const progAbs = clamp(Math.pow(1 - Math.abs(day - (context.progress.value ?? 0)) * 0.05, 4), 0, 1);
        const scaleFull = Math.pow(0.05, 4);
        const prog = Math.pow(1 - (day - (context.progress.value ?? 0)) * 0.05, 4);
        
        return {
            transform: [{translateX: -(bounds.width - 60) * 0.5 * (1 - scaleFull) * (1 - prog)}, {scale: progAbs }], 
            opacity: Math.pow(progAbs, 3)
        };
    }, [day, context.progress]);

    return <Reanimated.View style={[{ width: '100%', justifyContent: 'center'}, uas]}>
        
            {/* <ScrollView 
                snapToInterval={bounds.width}
                decelerationRate={'fast'}
                showsHorizontalScrollIndicator={false}  style={{flex: 1}} horizontal={true}>
                {events.map(renderEvent)}
            </ScrollView> */}
            
            {events.slice(0,1).map(renderEvent)}
            
            {/* <MoreIcon color={'white'} rotate={180} /> */}
        
    </Reanimated.View>;
}

const WeeklyDayLabel: FC<{day: number}> = ({day}) => {
    const context = useContext(WeeklyCTX);

    const uas = useAnimatedStyle(() => ({
        opacity: Math.pow(1 - Math.abs(day - (context.progress.value ?? 0)), 6)
    }), [day, context.progress]);

    return <Reanimated.View key={day} style={[{width: '100%'}, uas]}>
        <Text style={{textAlign: 'center', fontSize: 35, fontWeight: '500', color: 'white'}}>{days[day]}</Text>
    </Reanimated.View>
}

const Weekly: FC<RootScreenProps<'Weekly'>>  = navProps => {
    const locationNodeId = useLocationNodeId();
    const eventsData = useGetEventsQuery({locationNodeId, count:0 , sort: 'startDate', order: 'asc', filter: 'weekly',  });
    const bounds = useWindowDimensions();
    const [loading, setLoading] = useState(false);
    
    const progress = useSharedValue(0);
    const [context, setContext] = useState<IWeeklyCTX>({height: 0, width: 0, progress, loading, setLoading});
    
    const [height, setHeight] = useState(0);
    const [width, setWidth] = useState(0);
    
    const [count, setCount] = useState(0);
    const [dayGroups, setDayGroups] = useState<eventGraph[][]>();
    const [initialIndex, setInitialIndex] = useState<number>();
    const [jsIndex, setJsIndex] = useState<number>(-1);
    const [maxIndex, setMaxIndex] = useState<number>(-1);

    useEffect(() => {
        setMaxIndex(Math.max(maxIndex, jsIndex));
    }, [jsIndex]);

    useEffect(() => {
        if(maxIndex !== -1){
            dispatch(logAppActivity({type: 'weeklySwipe', data: {index: maxIndex}}));
        }
    }, [maxIndex]);

    const weeklyTs = useAppSelector(state => state.app.weeklyTs);

    const [weekStart, weekEnd]: [Date, Date] = useMemo(() => {
        const monday = new Date();
        const sunday = new Date();
        
        if(monday.getDay() === 0 && monday.getHours() >= 19){
            monday.setDate(monday.getDate() + 1);
            sunday.setDate(sunday.getDate() + 1);   
        }
        monday.setHours(0,0,0,0);
        sunday.setHours(0,0,0,0);

        monday.setDate(monday.getDate() - (monday.getDay() || 7) + 1);
        sunday.setDate(monday.getDate() - (monday.getDay()) + 7);

        return [monday, sunday];
    }, []);

    useEffect(() => {
        if(typeof initialIndex === 'undefined' && width !== 0){
            const date = new Date(Math.max(weeklyTs, weekStart.getTime()));
            const today = new Date()
            const progressIndex = (date.getDay() + 6) % 7;
            const dayIndex = (today.getDay() + 6) % 7;

            const index = progressIndex >= 6 ? dayIndex : 0;
            
            setInitialIndex(index);
            x.value = -width * index;
        }
    }, [width, weekStart, weeklyTs, initialIndex]);

    useEffect(() => {setContext({height, width, progress: context.progress, loading, setLoading})}, [height, width, loading, setLoading]);

    useEffect(() => {
        if(eventsData.data){
            const groups = days.map((d, index) => eventsData.data!.filter(e => (new Date(e.event.start).getDay() + 6) % 7 === index));
            setDayGroups(groups);
            setCount(groups.length);
        }
    }, [eventsData.data]);

    useEffect(() => {
        setLoading(eventsData.isFetching);
    }, [eventsData.isFetching]);

    useEffect(() => {
        // if(jsIndex === 7){
        //     
        //     dispatch(setWeeklyConsumed(true));
        // }
        if(typeof initialIndex !== 'undefined'){
            const date = new Date(weekStart);
            date.setDate(date.getDate() + Math.min(jsIndex, 6) );
            const ts = date.getTime();
            
            if(ts > weeklyTs){
                AsyncStorage.setItem(WEEKLY_TS_KEY, ts.toString());
                dispatch(setWeeklyTs(ts));
            }
        }
    }, [jsIndex, weekStart, weeklyTs, initialIndex]);
    
    const y = useSharedValue(0);
    const x = useSharedValue(0);
    const xDayView = useSharedValue(0);
    const index = useSharedValue(0);
    const uasDayView = useAnimatedStyle(() => ({transform: [{translateX: xDayView.value}]}), [xDayView]);
    const uas = useAnimatedStyle(() => ({transform: [{translateX: x.value}]}), [y, x]);

    useDerivedValue(() => {
        progress.value = width === 0 ? 0 : x.value / -width;
        index.value = width === 0 ? 0 : Math.round(progress.value);
        xDayView.value = progress.value * -200;
        
        runOnJS(setJsIndex)(index.value);
    }, [y, x, height, width]);

    // const avref = useAnimatedRef<Reanimated.View>();

    const pan = useAnimatedGestureHandler<PanGestureHandlerGestureEvent, {startIndex: number, start: number}>({
        onStart(e, ctx){
            // ctx.start = y.value;
            ctx.start = x.value;
            ctx.startIndex = index.value;
        },
        onActive(e, ctx){
            // y.value = ctx.start + e.translationY;
            x.value = ctx.start + e.translationX;
        },
        onEnd(e, ctx){
            if(width !== 0){
                let nextIndex = ctx.startIndex;
    
                if(Math.abs(e.velocityX) > 100){
                    const direction = Math.sign(e.velocityX);
                    nextIndex = Math.max(Math.min(ctx.startIndex - direction, count), 0);
                }
                else{
                    nextIndex = Math.max(Math.min(Math.round((x.value / -width) + 0.15), count), 0);
                }
    
                x.value = withSpring(nextIndex * -width, {damping: 50, overshootClamping: true, velocity: e.velocityX});
            }
        }
    }, [height, width, count]);
    
    const onLayout = useCallback((e: LayoutChangeEvent) => {
        setHeight(e.nativeEvent.layout.height);
        setWidth(e.nativeEvent.layout.width);
    }, []);
    
    const insets = useSafeAreaInsets();
    const dispatch = useAppDispatch();

    const renderDay = useCallback((events: eventGraph[], day: number) => <WeeklyDayCard key={day} day={day} events={events} />, []);

    const handleClose = useCallback(() => {
        navProps.navigation.goBack();
    }, [navProps]);

    const handleNext = useCallback(() => {
        const nextIndex = index.value + 1;
        // y.value = withSpring(nextIndex * -height, {damping: 50, overshootClamping: true});
        x.value = withSpring(nextIndex * -width, {damping: 50, overshootClamping: true});
    }, [y.value, x.value, height, width, index.value]);
    const handlePrev = useCallback(() => {
        const nextIndex = index.value - 1;
        // y.value = withSpring(nextIndex * -height, {damping: 50, overshootClamping: true});
        x.value = withSpring(nextIndex * -width, {damping: 50, overshootClamping: true});
    }, [y.value, x.value, height, width, index.value]);

    const renderDayLabel = useCallback((d: any, day: number) => <WeeklyDayLabel key={day} day={day} />, [days]);

    return (
        <RootNavContext.Provider value={navProps}>
            <View style={{flex: 1, backgroundColor: '#030303', justifyContent: 'space-between', paddingTop: insets.top, paddingBottom: insets.bottom}}>
                <View style={{paddingHorizontal: 20, width: bounds.width, zIndex:2}}>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <TouchableOpacity hitSlop={{left: 25, right:25, top:25, bottom:25}} activeOpacity={0.75} onPress={handleClose}>
                            <MoreIcon color={'white'} rotate={-90} strokeWidth={4} size={25} />
                        </TouchableOpacity>
                        
                        <Gap x={10} />
                        <View style={{flex: 1}}>
                            <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                                <Text style={{fontSize: 38,  textAlign: 'left', color: 'white'}}>This week</Text>
                                {/* <TouchableOpacity activeOpacity={0.75} onPress={handleClose}>
                                    <CloseIcon />
                                </TouchableOpacity> */}
                            </View>
                            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                <Text style={{fontSize: 24, color: 'white'}}>in </Text>
                                <LocationNode paddingHorizontal={0} paddingVertical={0} fontSize={24} color={'#7a7a7a'} />
                            </View>
                        </View>
                    </View>
                </View>
                <WeeklyCTX.Provider value={context}>
                <View style={{flex: 1, justifyContent: 'center'}}>
                    <PanGestureHandler onGestureEvent={pan}>
                        <Reanimated.View style={[{justifyContent: 'center', overflow: 'hidden', alignItems: 'center', width: bounds.width}]}>
                            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                <View style={{marginTop: 5,height: 30, justifyContent: 'center', width: 50, alignItems: 'center'}}>
                                    {
                                        jsIndex > 0 && jsIndex < count && 
                                        <Reanimated.View exiting={FadeOut} entering={FadeIn}>
                                            <TouchableOpacity activeOpacity={0.75} onPress={handlePrev} hitSlop={{top: 50, bottom: 50, left: 50, right: 50}}>
                                                <MoreIcon color={'#606060'} strokeWidth={6} size={20} rotate={-90} />
                                            </TouchableOpacity>
                                        </Reanimated.View>
                                    }
                                </View>
                                <Gap x={20} />
                                <View style={{width: 200, height: 40, marginHorizontal: -30}} pointerEvents={'none'}>
                                    <Reanimated.View style={[{flexDirection: 'row', alignItems: 'center'}, uasDayView]}>
                                        {dayGroups?.map(renderDayLabel)}
                                    </Reanimated.View>
                                </View>
                                <Gap x={20} />
                                <View style={{marginTop: 5, height: 30, justifyContent: 'center', width: 50, alignItems: 'center'}}>
                                    {
                                        jsIndex < count &&
                                        <Reanimated.View exiting={FadeOut} entering={FadeIn}>
                                            <TouchableOpacity activeOpacity={0.75} onPress={handleNext}  hitSlop={{top: 50, bottom: 50, left: 50, right: 50}}>
                                                <MoreIcon color={'#606060'} strokeWidth={6} size={20} rotate={90} />
                                            </TouchableOpacity>
                                        </Reanimated.View> 
                                    }
                                </View>
                            </View>
                            <Reanimated.View style={[{width: bounds.width - 40, aspectRatio: 350/400, flexDirection: 'row'}, uas]} onLayout={onLayout}>
                                {dayGroups?.map(renderDay)}
                                <DoneCard />
                            </Reanimated.View>
                        </Reanimated.View>
                    </PanGestureHandler>
                </View>
                </WeeklyCTX.Provider>
            </View>
        </RootNavContext.Provider>
    )
}

export default Weekly;