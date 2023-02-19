import { BottomSheetBackdrop, BottomSheetBackdropProps, BottomSheetModal, BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import React, { FC, PropsWithChildren, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Button, Image, ImageSourcePropType, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
import { closePermissionDialog, PermissionKey } from "redux/app";
import { useAppDispatch, useAppSelector } from "redux/hooks";
import Reanimated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Path } from "react-native-svg";
import { requestAppleSignin, googleSignin } from "redux/user";
import {appleAuth} from '@invertase/react-native-apple-authentication';

type PermissionSheetProps = {src?: ImageSourcePropType, permissionKey: PermissionKey};

export const PermissionSheet: FC<PermissionSheetProps & { children: ReactNode }> = ({src, permissionKey, children}) => {
    const currentPermissionKey = useAppSelector(state => state.app.currentPermissionKey);
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);
    const [index, setIndex] = useState(-1);
    const dispatch = useAppDispatch();
    const resolver = useAppSelector(state => state.app.permissionResolver);

    const imageOpacity = useSharedValue(0);

    const close = useCallback(() => {
        imageOpacity.value = 0;

        if(resolver)
            resolver(false);

        if(currentPermissionKey !== null)
            dispatch(closePermissionDialog());
    }, [dispatch, imageOpacity, closePermissionDialog, resolver]);
    
    const handleSheetChanges = useCallback((index: number) => {
        setIndex(index);

        if(index === -1){
            close();
        }
    }, [close]);
    const [snapPoints, setSnapPoints] = useState([500]);

    const renderBackdrop = useCallback(
        (props:BottomSheetBackdropProps) => (
          <BottomSheetBackdrop
            {...props}
            style={{backgroundColor: '#030303', flex: 1, width: '100%'}}
            opacity={0.8}
            appearsOnIndex={0}
            disappearsOnIndex={-1}
          />
        ), []
      );

    useEffect(() => {
        if(currentPermissionKey === permissionKey){
            bottomSheetModalRef.current?.present();
        }
        else if(index !== -1){
            bottomSheetModalRef.current?.dismiss();
        }
    }, [currentPermissionKey, permissionKey, bottomSheetModalRef, close]);

    
    const imageWrapUAS = useAnimatedStyle(() => ({opacity: imageOpacity.value}))

     return <BottomSheetModal
        ref={bottomSheetModalRef}
        snapPoints={snapPoints}
        index={0}
        onChange={handleSheetChanges}
        backdropComponent={renderBackdrop}
        handleStyle={{display: 'none'}}
        backgroundStyle={{backgroundColor: 'transparent', borderRadius: 0, overflow: 'hidden'}}
        enableDismissOnClose={true}
      >
        <View style={{flex: 1, width: '100%', backgroundColor: 'white', overflow: 'hidden', borderRadius: 20}}>
            {
                !!src &&
                <Reanimated.View style={[{ width: '100%', aspectRatio: 375/176}, imageWrapUAS]}>
                    <Image onLoad={() => imageOpacity.value = withTiming(1, {duration: 350})} source={src} style={{ width: '100%', height: '100%' }} resizeMode={'cover'} />
                </Reanimated.View>
            }
            <View style={{backgroundColor: 'white', flex: 1, width: '100%'}}>
                {children}
            </View>
        </View>
      </BottomSheetModal>
}

export const SignInView: FC<PropsWithChildren> = ({children}) => {
    const dispatch = useAppDispatch();
    const resolver = useAppSelector(state => state.app.permissionResolver);
    const handleCancel = useCallback(() => {
        if(resolver)
            resolver(false);

        dispatch(closePermissionDialog());
    }, [dispatch, resolver]);

    const handleConfirmApple = useCallback(async () => {
        const appleRes = await dispatch(requestAppleSignin()).unwrap();

        if(!!appleRes){
            resolver && resolver(true);
            dispatch(closePermissionDialog());
        }
    }, [dispatch, resolver]);

    const handleConfirmGoogle = useCallback(async () => {
        const googleRes = await dispatch(googleSignin()).unwrap();

        if(!!googleRes){
            resolver && resolver(true);
            dispatch(closePermissionDialog());
        }
    }, [dispatch, resolver]);

    return <View style={{flex: 1, backgroundColor: 'white', alignItems: 'center', justifyContent: 'space-evenly', paddingHorizontal: 40}}>
        {children}
        {appleAuth.isSupported && <TouchableOpacity activeOpacity={0.75} onPress={handleConfirmApple} style={{margin: 5, width: 200, flexDirection: 'row', backgroundColor: '#030303', height: 44, borderRadius: 22, alignItems: 'center'}}>
            <Svg style={{margin: 15}} width="12" height="14" viewBox="0 0 12 14" fill="none">
                <Path d="M9.7003 7.40155C9.68408 5.64322 11.1769 4.78779 11.2452 4.74797C10.3997 3.54611 9.08928 3.3819 8.62878 3.3688C7.52815 3.25587 6.46055 4.01092 5.89988 4.01092C5.32803 4.01092 4.46465 3.37971 3.53413 3.39826C2.33671 3.41627 1.2165 4.09221 0.602123 5.14186C-0.665804 7.28207 0.279825 10.4272 1.49459 12.1571C2.10226 13.0044 2.81232 13.9504 3.74172 13.9171C4.65098 13.8806 4.99062 13.3519 6.08789 13.3519C7.17508 13.3519 7.49402 13.9171 8.44189 13.8958C9.41773 13.8806 10.0321 13.0448 10.6185 12.1899C11.3207 11.2188 11.6028 10.2624 11.6139 10.2133C11.591 10.2057 9.71877 9.50902 9.7003 7.40155Z" fill="white"/>
                <Path d="M7.90976 2.23077C8.3988 1.63448 8.73341 0.823243 8.64053 0C7.9327 0.0305511 7.04751 0.477361 6.53776 1.06056C6.08677 1.57447 5.6839 2.41681 5.78797 3.20895C6.58309 3.26678 7.39946 2.81779 7.90976 2.23077Z" fill="white"/>
            </Svg>
            <Text style={{ fontSize: 12, color: 'white'}}>Continue with Apple</Text>
        </TouchableOpacity>}
        <TouchableOpacity activeOpacity={0.75} onPress={handleConfirmGoogle} style={{margin: 5, width: 200, flexDirection: 'row', backgroundColor: 'white', borderColor: '#4286F5', borderWidth: 1, height: 44, borderRadius: 22, alignItems: 'center'}}>
            <Svg style={{margin: 12}} width="16" height="16" viewBox="0 0 16 16" fill="none">
                <Path fillRule="evenodd" clipRule="evenodd" d="M15.68 8.18177C15.68 7.6145 15.6291 7.06905 15.5345 6.54541H8V9.63996H12.3055C12.12 10.64 11.5564 11.4872 10.7091 12.0545V14.0618H13.2945C14.8073 12.669 15.68 10.6181 15.68 8.18177Z" fill="#4285F4"/>
                <Path fillRule="evenodd" clipRule="evenodd" d="M7.99968 16C10.1597 16 11.9706 15.2837 13.2942 14.0618L10.7088 12.0546C9.9924 12.5346 9.07604 12.8182 7.99968 12.8182C5.91604 12.8182 4.1524 11.4109 3.52331 9.52002H0.850586V11.5927C2.16695 14.2073 4.8724 16 7.99968 16Z" fill="#34A853"/>
                <Path fillRule="evenodd" clipRule="evenodd" d="M3.52364 9.51995C3.36364 9.03995 3.27273 8.52723 3.27273 7.99995C3.27273 7.47268 3.36364 6.95995 3.52364 6.47995V4.40723H0.850909C0.309091 5.48723 0 6.70904 0 7.99995C0 9.29086 0.309091 10.5127 0.850909 11.5927L3.52364 9.51995Z" fill="#FBBC05"/>
                <Path fillRule="evenodd" clipRule="evenodd" d="M7.99968 3.18182C9.17422 3.18182 10.2288 3.58545 11.0579 4.37818L13.3524 2.08364C11.9669 0.792727 10.156 0 7.99968 0C4.8724 0 2.16695 1.79273 0.850586 4.40727L3.52331 6.48C4.1524 4.58909 5.91604 3.18182 7.99968 3.18182Z" fill="#EA4335"/>
            </Svg>
            <Text style={{ fontSize: 12, color: '#030303'}}>Continue with Google</Text>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.75} onPress={handleCancel} style={{margin: 5, width: 200, flexDirection: 'row', backgroundColor: 'white', borderColor: 'white', borderWidth: 1, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center'}}>
            <Text style={{ textDecorationLine: 'underline', fontSize: 12, color: '#030303'}}>Not now</Text>
        </TouchableOpacity>
    </View>
}

export const SignInPermissionSheet: FC = () => {
    return <PermissionSheet permissionKey={PermissionKey.signInBase}>
        <View style={{padding: 50, paddingVertical: 100, alignItems: 'center', flex: 1, justifyContent: 'space-around'}}>
            <Text style={{color: '#030303', fontSize: 28}}>Sign in to Jungle</Text>
            <SignInView />
        </View>
    </PermissionSheet>
}

export const FollowPermissionSheet: FC<PermissionSheetProps & {message: string}> = ({message, ...props}) => {
    return <PermissionSheet {...props}>
        <SignInView>
            <Text style={{margin: 10, fontSize: 28, textAlign: 'center', color: '#030303'}}>{message}</Text>
        </SignInView>
    </PermissionSheet>
}

export const EnablePermissionSheet: FC<PermissionSheetProps & {title: string, subtitle: string, buttonText: string}> = ({title, subtitle, buttonText, ...props}) => {
    const dispatch = useAppDispatch();
    const resolver = useAppSelector(state => state.app.permissionResolver);
    const handleCancel = useCallback(() => {
        if(resolver)
            resolver(false);

        dispatch(closePermissionDialog());
    }, [dispatch, resolver]);

    const handleConfirm = useCallback(() => {
        if(resolver){
            resolver(true);
        }

        dispatch(closePermissionDialog());
    }, [dispatch, resolver]);

    return <PermissionSheet {...props}>
        <View style={{flex: 1, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40}}>
            <Text style={{margin: 10, fontSize: 28, textAlign: 'center', color: '#030303'}}>{title}</Text>
            <Text style={{textAlign: 'center', marginBottom: 20, marginHorizontal: 10, fontSize: 12, color: '#7D7D7D'}}>{subtitle}</Text>
            <Text style={{textAlign: 'center', marginBottom: 20, marginHorizontal: 10, fontSize: 12, color: '#7D7D7D'}}>You will be able to change this later</Text>
            <TouchableOpacity activeOpacity={0.75} onPress={handleConfirm} style={{justifyContent: 'center', margin: 5, width: 200, flexDirection: 'row', backgroundColor: '#030303', height: 44, borderRadius: 22, alignItems: 'center'}}>
                {/* <Svg style={{margin: 15}} width="12" height="14" viewBox="0 0 12 14" fill="none">
                    <Path d="M9.7003 7.40155C9.68408 5.64322 11.1769 4.78779 11.2452 4.74797C10.3997 3.54611 9.08928 3.3819 8.62878 3.3688C7.52815 3.25587 6.46055 4.01092 5.89988 4.01092C5.32803 4.01092 4.46465 3.37971 3.53413 3.39826C2.33671 3.41627 1.2165 4.09221 0.602123 5.14186C-0.665804 7.28207 0.279825 10.4272 1.49459 12.1571C2.10226 13.0044 2.81232 13.9504 3.74172 13.9171C4.65098 13.8806 4.99062 13.3519 6.08789 13.3519C7.17508 13.3519 7.49402 13.9171 8.44189 13.8958C9.41773 13.8806 10.0321 13.0448 10.6185 12.1899C11.3207 11.2188 11.6028 10.2624 11.6139 10.2133C11.591 10.2057 9.71877 9.50902 9.7003 7.40155Z" fill="white"/>
                    <Path d="M7.90976 2.23077C8.3988 1.63448 8.73341 0.823243 8.64053 0C7.9327 0.0305511 7.04751 0.477361 6.53776 1.06056C6.08677 1.57447 5.6839 2.41681 5.78797 3.20895C6.58309 3.26678 7.39946 2.81779 7.90976 2.23077Z" fill="white"/>
                </Svg> */}
                <Text style={{ fontSize: 12, color: 'white'}}>{buttonText}</Text>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.75} onPress={handleCancel} style={{margin: 5, width: 200, flexDirection: 'row', backgroundColor: 'white', borderColor: 'white', borderWidth: 1, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center'}}>
                <Text style={{ textDecorationLine: 'underline', fontSize: 12, color: '#030303'}}>Not now</Text>
            </TouchableOpacity>
        </View>
    </PermissionSheet>
}

export const FollowPlacesPermissionSheet: FC = () => <FollowPermissionSheet permissionKey={PermissionKey.followPlaces} message="Sign in to start building personal lists" src={require('images/followPlaces.png')} />;
export const FollowTastemakersPermissionSheet: FC = () => <FollowPermissionSheet permissionKey={PermissionKey.followTastemakers} message="Sign in to follow your favorite tastemakers" src={require('images/followTastemakers.png')} />;
export const FollowEventsPermissionSheet: FC = () => <FollowPermissionSheet permissionKey={PermissionKey.saveEvents} message="Sign in to save upcoming events" src={require('images/followEvents.png')} />;
export const EnableLocationPermissionSheet: FC = () => <EnablePermissionSheet permissionKey={PermissionKey.enableLocation} title={'Enable location'} buttonText={'Enable location'} subtitle={'Find places near you more easily. News and events will be more relevant based on proximity.'} src={require('images/enableLocation.png')} />;
export const EnableNotiticationsPermissionSheet: FC = () => <EnablePermissionSheet permissionKey={PermissionKey.enablePush} title={'Enable notifications'} buttonText={'Enable notifications'} subtitle={'Don\'t miss your daily/weekly recommendations or the latest news about your favorite places.'} src={require('images/enableNotifications.png')} />;