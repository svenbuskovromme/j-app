import { BottomSheetModal, BottomSheetScrollView, BottomSheetTextInput, TouchableOpacity } from "@gorhom/bottom-sheet";
import PushNotificationIOS from "@react-native-community/push-notification-ios";
import { api } from "jungle-shared";
import React, { FC, Fragment, PropsWithChildren, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Linking, View, Text, ActivityIndicator, KeyboardAvoidingView, Platform, useWindowDimensions } from "react-native";
import { getApp, requestDialog } from "redux/app";
import { useAppDispatch, useAppSelector } from "redux/hooks";
import { logoutUser } from "redux/user";
import { tc } from "utils";
import ApiCheckbox from "./ApiCheckbox";
import Reanimated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { TextInput } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const MenuModal: FC<{onDelete?: () => void, open: boolean, onClose(): void, onSignIn?: () => Promise<void>, onLogout?: () => Promise<void>, onEdit?: () => void}> = ({onDelete, open, onLogout, onEdit, onSignIn, onClose}) => {
    const user = useAppSelector(state => state.user.user);
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);

    useEffect(() => {
        if(open){
            bottomSheetModalRef.current?.present();
        }
        else{
            bottomSheetModalRef.current?.dismiss();
        }
    }, [open]);

    const insets = useSafeAreaInsets();
    const bounds = useWindowDimensions();

    const [snapPoints, setSnapPoints] = useState<[number]>([0]);
    const footerHeight = useAppSelector(state => state.app.footerHeight);

    useEffect(() => {setSnapPoints([bounds.height - (insets.top + insets.bottom + footerHeight + 50)])}, [insets, bounds, footerHeight]);

    const [aboutOpen, setAboutOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);

    const handleAboutPress = useCallback(() => {
        setAboutOpen(!aboutOpen)
    }, [aboutOpen, setAboutOpen]);

    const handleSettingsPress = useCallback(() => {
        setSettingsOpen(!settingsOpen);
    }, [setSettingsOpen, settingsOpen]);
    
    const handleTermsPress = useCallback(() => {
        Linking.openURL(tc);
    }, []);


    const handleIgPress = useCallback(() => { Linking.openURL('https://www.instagram.com/app.jungle') }, []);
    const handleWebPress = useCallback(() => { Linking.openURL('https://jungleapp.co') }, []);

    const handleTest = useCallback(() => {
        PushNotificationIOS.requestPermissions();
        PushNotificationIOS.addNotificationRequest({id: 'testPush', title: 'push title', body: 'push body text'});
    }, []);

    const handleIndexChange = useCallback((index: number) => {
        index === -1 && onClose();
    }, [onClose]);

    return <BottomSheetModal
        detached={false}
        ref={bottomSheetModalRef}
        onChange={handleIndexChange}
        index={0}
        snapPoints={snapPoints}
        handleIndicatorStyle={{backgroundColor: 'white'}}
        style={{backgroundColor: '#030303', borderTopWidth: 1, borderTopColor: '#ffffff30'}}
        backgroundStyle={{backgroundColor: '#030303'}}
        keyboardBlurBehavior={'restore'}
        keyboardBehavior={'extend'}
    >
        <BottomSheetScrollView style={{flex: 1, backgroundColor: '#030303'}} contentContainerStyle={{padding: 30}} showsVerticalScrollIndicator={false}>
                <View style={{height: 1, backgroundColor: '#ffffff30', width: '100%'}} />
                <View style={{marginVertical: 30}}>
                    <TouchableOpacity activeOpacity={0.75} onPress={handleAboutPress} style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{fontSize: 35, color: 'white'}}>About Jungle</Text>
                        <Text style={{marginLeft: 'auto', color: 'white', fontSize: 35, opacity: 0.5}}>[ {aboutOpen ? '-' : '+'} ]</Text>
                    </TouchableOpacity>
                    {aboutOpen && <About />}
                </View>
                <View style={{height: 1, backgroundColor: '#ffffff30', width: '100%'}} />
                <View style={{marginVertical: 20}}>
                    <TouchableOpacity activeOpacity={0.75} onPress={handleSettingsPress} style={{ marginVertical: 5, flexDirection: 'row' }}>
                        <Text style={{fontSize: 24, color: 'white'}}>Settings</Text>
                        <Text style={{marginLeft: 'auto', color: 'white', fontSize: 24, opacity: 0.5}}>[ {settingsOpen ? '-' : '+'} ]</Text>
                    </TouchableOpacity>
                    { settingsOpen && <Settings onEdit={onEdit} />}
                    <TouchableOpacity activeOpacity={0.75} onPress={handleTermsPress} style={{ marginVertical: 5 }}><Text style={{fontSize: 24, color: 'white', textDecorationLine: 'underline'}}>Terms &amp; Conditions</Text></TouchableOpacity>
                    {user ? 
                        <Fragment>
                            {!!onLogout && <TouchableOpacity activeOpacity={0.75} onPress={onLogout} style={{ marginVertical: 5 }}><Text style={{fontSize: 24, color: 'white'}}>Log out</Text></TouchableOpacity>}
                            {!!onDelete && <DeleteButton onDelete={onDelete} />}
                        </Fragment> :
                        (!!onSignIn && <TouchableOpacity activeOpacity={0.75} onPress={onSignIn} style={{ marginVertical: 5 }}><Text style={{fontSize: 24, color: 'white'}}>Sign in</Text></TouchableOpacity>)
                    }
                </View>
                <View style={{height: 1, backgroundColor: '#ffffff30', width: '100%'}} />
                <View style={{marginVertical: 20}}>
                    <TouchableOpacity activeOpacity={0.75} onPress={handleIgPress} style={{ paddingVertical: 15 }}><Text style={{textDecorationLine: 'underline', color: 'white'}}>Instagram</Text></TouchableOpacity>
                    <TouchableOpacity activeOpacity={0.75} onPress={handleWebPress} style={{ paddingVertical: 15 }}><Text style={{textDecorationLine: 'underline', color: 'white'}}>Web</Text></TouchableOpacity>
                </View>

            {/* <TouchableOpacity activeOpacity={0.75} onPress={handleTest} style={{ paddingVertical: 15 }}><Text style={{textDecorationLine: 'underline', fontSize: 25, color: 'white'}}>Test</Text></TouchableOpacity> */}
        </BottomSheetScrollView>
    </BottomSheetModal>
}

const DeleteButton: FC<{onDelete(): void}> = ({onDelete}) => {
    const [prompt, setPrompt] = useState(false);
    const [loading, setLoading] = useState(false);
    const [deleted, setDeleted] = useState(false);
    const [value, setValue] = useState('');

    const handleDelete = useCallback(async () => {
        if(!prompt){
            setPrompt(true);
        }
        else if(prompt && value === 'delete'){
            setLoading(true);
            await api.delete('user');
            onDelete();
        }
    }, [onDelete, prompt, onDelete, value]);


    return <View>
        {
            loading || deleted ? <Reanimated.View exiting={FadeOut} entering={FadeIn}><ActivityIndicator color={'white'} /></Reanimated.View>  :
            prompt ? <Reanimated.View exiting={FadeOut} entering={FadeIn} style={{alignItems: 'center'}}>
                <Text style={{color: '#FFFFFF90', fontSize: 15}}>To delete account, write 'delete' in the box below</Text>
                <View style={{flexDirection: 'row'}}>
                    <TouchableOpacity activeOpacity={0.75} onPress={() => setPrompt(false)}><Text style={{color: 'white', fontSize: 15, margin: 10, marginHorizontal: 15}}>Cancel</Text></TouchableOpacity>
                    <BottomSheetTextInput value={value} onChangeText={setValue} autoCapitalize={'none'} style={{paddingHorizontal: 10, borderRadius: 10, backgroundColor: 'darkred', width: 150, color: 'white'}} />
                    <TouchableOpacity activeOpacity={0.75} disabled={value !== 'delete'} style={{opacity: value === 'delete' ? 1 : 0.5}} onPress={handleDelete}><Text style={{color: 'white', fontSize: 15, margin: 10, marginHorizontal: 15}}>Confirm</Text></TouchableOpacity>
                </View>
            </Reanimated.View> :
            <TouchableOpacity activeOpacity={0.75} onPress={handleDelete} style={{ marginVertical: 5 }}><Text style={{color: 'red', fontSize: 24}}>Delete account</Text></TouchableOpacity>       
        }
    </View>;
}

const H1: FC<PropsWithChildren> = ({children}) => <Text style={{marginVertical: 20, fontSize: 20, color: 'white', fontWeight: '500'}}>{children}</Text>;
const P: FC<PropsWithChildren> = ({children}) => <Text style={{fontSize: 14, marginVertical: 10, fontWeight: '300', color: 'white'}}>{children}</Text>;

const About: FC = () => {
    
    return <View>
        <H1>Powered by the industry</H1>
        <P>On Jungle, local industry people share their inspiration from the food scene. Good places to eat, hidden gems, exciting bars, new dishes, cozy bakeries and unmissable pop-ups.</P>
        <P>So far, more than 150 local chefs, sommeliers, baristas, bakers, mixologists and restaurateurs have joined us on our mission to make the food scene accessible to everyone.</P>
        <P>Think of Jungle as a guide, but also a place where you hang out and get to feel more at home on your food scene.</P>
        <H1>Get the inside story, not the outside one</H1>
        <P>You probably know lots of apps that rely on crowdsourced reviews, ratings and photos to let the guests tell you about places. We don&apos;t do ratings. At Jungle we believe in letting the places tell their story from the inside and out. That way you get to know about the ideas, craft and people behind the food scene.</P>
        <H1>Weekly drops, events and pop-ups</H1>
        <P>Every week, we gather the most exciting pop-ups, events and drops from the more than 400 places on Jungle. We hope you&apos;ll check in once in a while, and that you find a couple of remarkable experiences whenever you need them!</P>
    </View>
}

const Settings: FC<{onEdit?: () => void}> = ({onEdit}) => {
    const subbedDaily = useAppSelector(state => state.app.subbedDaily);
    const subbedWeekly = useAppSelector(state => state.app.subbedWeekly);
    const subbedFollow = useAppSelector(state => state.app.subbedFollow);
    const user = useAppSelector(state => state.user.user);
    
    const dispatch = useAppDispatch();
    
    const handleDaily = useCallback(async () => {
        await api.patch('app', {row: {dailyPush: !subbedDaily}});
        await dispatch(getApp()).unwrap();
    }, [subbedDaily, dispatch, getApp]);
    const handleWeekly = useCallback(async () => {
        await api.patch('app', {row: {weeklyPush: !subbedWeekly}});
        await dispatch(getApp()).unwrap();
    }, [subbedWeekly, dispatch, getApp]);
    const handleFollow = useCallback(async () => {
        await api.patch('app', {row: {followPush: !subbedFollow}});
        await dispatch(getApp()).unwrap();
    }, [subbedFollow, dispatch, getApp]);
     
    return <View style={{marginVertical: 20}}>
        {(!!user && !!onEdit) && <TouchableOpacity activeOpacity={0.75} onPress={onEdit} style={{margin: 5, paddingVertical:10 }}><Text style={{fontSize: 18, color: 'white'}}>Edit profile info</Text></TouchableOpacity>}
        <Text style={{color: '#FFFFFF90', margin: 5}}>Notifications</Text>
        <View style={{padding: 10}}><ApiCheckbox value={subbedDaily} label={'Daily recommendations'} onChange={handleDaily} /></View>
        <View style={{padding: 10}}><ApiCheckbox value={subbedWeekly} label={'Weekly recommendations'} onChange={handleWeekly} /></View>
        <View style={{padding: 10}}><ApiCheckbox value={subbedFollow} label={'News from follows'} onChange={handleFollow} /></View>
    </View>;
}

export default MenuModal;