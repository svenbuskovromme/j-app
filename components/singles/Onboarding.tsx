import React, { createContext, FC, useCallback, useContext, useEffect, useRef, useState } from "react";
import { ScrollView, Image, ImageSourcePropType, Platform, Text, useWindowDimensions, View, ScrollResponderEvent, NativeSyntheticEvent, NativeScrollEvent } from "react-native";
import Reanimated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TouchableOpacity } from "@gorhom/bottom-sheet";
import { useAppDispatch } from "redux/hooks";
import { logAppActivity, PermissionKey, requestDialog } from "redux/app";
import PushNotificationIOS, { PushNotificationPermissions } from "@react-native-community/push-notification-ios";

const ONBOARDING_KEY = 'onboarding-1';

const Card: FC<{index: number, src: ImageSourcePropType, title: string, message: string}> = ({src, title, message, index}) => {
    const context = useContext(OnboardingContext);

    const handleNext = useCallback(() => {
        context.onNext(index);
    }, [index, context]);

    const handleSkip = useCallback(() => {
        context.setDone(false);
    }, [index, context]);

    const bounds = useWindowDimensions();
    return <View style={{backgroundColor: 'white', width: bounds.width}}>
        <Image source={src} style={{width: '100%', maxHeight: bounds.height - 250, height: bounds.width * (530/375)}} resizeMode={'cover'} />
        <View style={{flex: 1, padding: 50, justifyContent: 'space-between'}}>
            <Text style={{color: '#030303', fontSize: 28, textAlign: 'center'}}>{title}</Text>
            <Text style={{color: '#7D7D7D', fontSize: 12, textAlign: 'center'}}>{message}</Text>
                {index !== 4  ?
                <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                    <TouchableOpacity activeOpacity={0.75} onPress={handleSkip} style={{height: 44, width: 125, borderRadius: 22, justifyContent: 'center', alignItems: 'center'}}>
                        <Text style={{color: '#030303', textDecorationLine: 'underline', fontSize: 12}}>Skip intro</Text>
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={0.75} onPress={handleNext} style={{height: 44, width: 125, borderRadius: 22, justifyContent: 'center', alignItems: 'center', backgroundColor: '#030303'}}>
                        <Text style={{color: 'white', fontSize: 12}}>Next</Text>
                    </TouchableOpacity>
                </View> 
                :
                <TouchableOpacity activeOpacity={0.75} onPress={handleNext} style={{height: 44, width: 125, borderRadius: 22, justifyContent: 'center', alignItems: 'center', backgroundColor: '#030303', alignSelf: 'center'}}>
                    <Text style={{color: 'white', fontSize: 12}}>Enter the Jungle</Text>
                </TouchableOpacity>    
            }
        </View>
    </View>
}

export const Onboarding: FC = () => {
    const bounds = useWindowDimensions();
    const dispatch = useAppDispatch();

    const [shouldShow, setShouldShow] = useState(false);
    const [index, setIndex] = useState(0);
    
    const opacity = useSharedValue(1);
    const uas = useAnimatedStyle(() => ({opacity: opacity.value}), [opacity]);

    const hide = useCallback(() => {
        opacity.value = withTiming(0, {duration: 500}, finished => runOnJS(setShouldShow)(false));
    }, [opacity, setShouldShow]);

    useEffect(() => {
        AsyncStorage.getItem(ONBOARDING_KEY).then(res => {
            setShouldShow(res !== 'done');
            // setShouldShow(true);
        });

        return () => {}
    }, [setShouldShow]);

    const [context, setContext] = useState<IOnboardingContext>();

    const setDone = useCallback(async (finished: boolean) => {
        AsyncStorage.setItem(ONBOARDING_KEY, 'done');

        dispatch(logAppActivity({type: 'onboardingClose', data: {step: index}}));

        hide();

        if(Platform.OS === 'ios' && finished){
            const existingPermissions = await new Promise<PushNotificationPermissions>(res => PushNotificationIOS.checkPermissions(res));

            if(existingPermissions.alert && existingPermissions.badge && existingPermissions.sound)
                return;

            const permission = await dispatch(requestDialog(PermissionKey.enablePush)).unwrap();
            if(permission)
                PushNotificationIOS.requestPermissions();
        }
    }, [index, dispatch, hide]);

    const onNext = useCallback((index: number) => {
        if(index === 4){
            setDone(true);
        }
        else{
            scrollRef.current?.scrollTo({x: bounds.width * index});
        }
    }, [setDone, setIndex, index]);

    useEffect(() => {
        setContext({setDone, onNext});
    }, [setDone, onNext]);

    const scrollRef = useRef<ScrollView>(null);

    const handleScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
        progress.value = withSpring(e.nativeEvent.contentOffset.x / bounds.width);

        setIndex(Math.max(0,Math.min(Math.round(e.nativeEvent.contentOffset.x / bounds.width), 3)));
    }, [bounds]);

    const progress = useSharedValue(0);

    const indicatorUas = useAnimatedStyle(() => ({transform: [{translateX: progress.value * (10 + 10)}]}), [progress, bounds]);

    return shouldShow ? <Reanimated.View style={[{position: 'absolute', zIndex: 101, ...bounds}, uas]}>
        {context && 
        <OnboardingContext.Provider value={context}>
            <ScrollView 
            ref={scrollRef}
            scrollEventThrottle={16}
            horizontal={true}
            snapToInterval={bounds.width}
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            decelerationRate={'fast'}>
                <Card index={1} src={require('images/onboarding/first.png')} title={'News \& events'} message={'Discover what\'s going on in your local food scene. Exciting pop ups, new place openings and much more.'}/>
                <Card index={2} src={require('images/onboarding/second.png')} title={'Places'} message={'Discover new places personally recommended by chefs, bakers, sommeliers and other industry folks and follow them to not miss out what they\'re doing.'}/>
                <Card index={3} src={require('images/onboarding/third.png')} title={'Tastemakers'} message={'Meet the people behind your favorite places and follow them to get notified every time they recommend a new place.'}/>
                <Card index={4} src={require('images/onboarding/fourth.png')} title={'Explore'} message={'You\'re all ready to explore your local food scene.'}/>
            </ScrollView>
            <View style={[{position: 'absolute', top: Math.min(bounds.width * (530/375), bounds.height - 250) - 30 , flexDirection: 'row', alignSelf: 'center'}]}>
                <Reanimated.View style={[{borderColor: 'white', borderWidth: 1, margin: 5, borderRadius: 5, height: 10, width: 10, backgroundColor: 'white',position: 'absolute' }, indicatorUas]} />
                <View style={{borderColor: 'white', borderWidth: 1, margin: 5, borderRadius: 5, height: 10, width: 10}} />
                <View style={{borderColor: 'white', borderWidth: 1, margin: 5, borderRadius: 5, height: 10, width: 10}} />
                <View style={{borderColor: 'white', borderWidth: 1, margin: 5, borderRadius: 5, height: 10, width: 10}} />
                <View style={{borderColor: 'white', borderWidth: 1, margin: 5, borderRadius: 5, height: 10, width: 10}} />
            </View>
        </OnboardingContext.Provider>}
        
    </Reanimated.View> : null;
}

interface IOnboardingContext{
    setDone(finished: boolean): void,
    onNext(index: number): void
}

const OnboardingContext = createContext({} as IOnboardingContext);