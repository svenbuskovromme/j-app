import React, { FunctionComponent, RefObject, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Button, DeviceEventEmitter, Dimensions, GestureResponderEvent, Image, KeyboardAvoidingView, Linking, Platform, SafeAreaView, Text, TextInput, TextInputProps, TouchableHighlight, useWindowDimensions, View } from 'react-native';
import { api, userRow } from 'jungle-shared';
import { useAppDispatch, useAppSelector } from 'redux/hooks';
import { useDispatch } from 'react-redux';
import { setAuthTimestamp, setUserData, getUserPlaces, getUserRow, setResolver } from 'redux/user';
import { getSource, RootScreenProps } from 'utils';
import SignInButton from './SignInButton';
import ProfilePicViewShot, { ProfilePicViewShotHandle } from 'components/shared/ProfilePicViewShot';
import { ProfileNames } from 'components/shared/ProfileNames';
import * as yup from "yup";
import CenteredLoader from "components/shared/CenteredLoader";
import { useFocusEffect } from '@react-navigation/native';
import { setTabNavColors } from 'redux/app';
import UserAvatar from 'components/shared/UserAvatar';

const emailSchema = yup.object({
    email: yup.string().email().required()
});

const useMount = (func: () => void) => useEffect(() => func(), []);

const useInitialURL = () => {
  const [url, setUrl] = useState<string|null>(null);
  const [processing, setProcessing] = useState(true);

  useMount(() => {
    const getUrlAsync = async () => {
      // Get the deep link used to open the app
      const initialUrl = await Linking.getInitialURL();

      // The setTimeout is just for testing purpose
      setTimeout(() => {
        setUrl(initialUrl);
        setProcessing(false);
      }, 1000);
    };

    getUrlAsync();
  });

  return { url, processing };
};

const BackButton: FunctionComponent<{onPress: () => void} > = ({onPress}) => {
    return <TouchableHighlight style={{height: 30, width: 30}} onPress={onPress}><Text>back</Text></TouchableHighlight>
}

const SignInFlow: FunctionComponent<RootScreenProps<'SignIn'>> = ({navigation, route: {params: {timestamp = 0} = {}}}) => {
    const dispatch = useAppDispatch();
    const checkResolver = useAppSelector(state => state.user.checkResolver);
    const [user, setUserRow] = useState<userRow | null>(useAppSelector(state => state.user.user));
    const [loading, setLoading] = useState<boolean>(false);
    const [step, setStep] = useState<number>(user?.signInStep ?? 1);

    useFocusEffect(() => {dispatch(setTabNavColors())});

    useEffect(() => {
        const unsub = navigation.addListener('beforeRemove', () => {
            checkResolver && checkResolver(user!);
            dispatch(setResolver(null));
        });

        return () => {
            unsub();
        }
    }, [navigation, checkResolver, dispatch]);

    useEffect(() => {
        navigation.setOptions({
            headerStyle: {
                backgroundColor: '#030303'
            },
            headerTitle: 'Profile setup',
            // headerTitleAlign: 'center',
            headerTitleStyle: {
                fontWeight: '400',
                fontSize: 14
            },
            headerShadowVisible: false,
            headerTintColor: 'white'
        });
    }, [user]);
    
    useEffect(() => {
        if(step === 4){
            Promise.all([
                dispatch(getUserPlaces())
            ]).then(() => {
                checkResolver && checkResolver(user!);
                dispatch(setResolver(null));
                navigation.pop();
            });
        }
    }, [step]);
    
    const profilePicViewShotRef = useRef<ProfilePicViewShotHandle>(null);
    const profileNamesRef = useRef<ProfileNames>() as RefObject<ProfileNames>;

    const submitPhoto = async () => {
        setLoading(true);
        try{
            const nextStep = 2;

            await profilePicViewShotRef.current?.save();
            
            await api.patch('user', {row: {signInStep: nextStep}});
            
            user!.signInStep = nextStep;
            
            setUserRow({...user!});
            
            dispatch(setUserData(user!));

            setStep(nextStep);
            setLoading(false);}
        catch(e){
            setLoading(false);
        }
    }

    const submitName = async () => {
        setLoading(true);
        try{
            const nextStep = 3;
    
            const {firstName, lastName} = profileNamesRef.current!;

            await api.patch('user', {row: {
                firstName,
                lastName,
                signInStep: nextStep
            }});

            const user = await dispatch(getUserRow()).unwrap();
    
            setUserRow(user[0]);
    
            setStep(nextStep);
            setLoading(false);
        }
        catch(e){
            setLoading(false);
        }
    };
    const enterJungle = async () => {
        setLoading(true);
        const nextStep = 4;

        await api.patch('user', {row: {
            signInStep: nextStep
        }});

        user!.signInStep = nextStep; 

        setUserRow({...user!});

        dispatch(setUserData(user!));

        setStep(nextStep);
        setLoading(false);
    };

    const [profilePicValid, setProfilePicValid] = useState<boolean>(false);
    const [profileNameValid, setProfileNameValid] = useState<boolean>(false);
    // const finishStep = (stepHandler: () => Promise<any>) => {
    //     setStepFunc(stepHandler);
    // }

    return <SafeAreaView style={{backgroundColor: '#010101', height: '100%'}}>
        {
            loading &&
            <CenteredLoader style={{zIndex: 1, position: 'absolute', width: '100%', height: Dimensions.get('window').height, backgroundColor: '#010101'}} size="large" color="white" />
        }
        { 
        (step === 0 || step === 1) ?
            <View style={{width: '100%', height: '100%', padding: 28, alignItems: 'center', justifyContent: 'space-evenly'}}>
                <View style={{width: '100%'}}>
                    <Text style={{width: '100%', color: '#F6F5F1', fontWeight: '600', fontSize: 19, marginBottom: 40}}>Add a profile pic</Text>
                    <Text style={{width: '100%', color: '#F6F5F1'}}>Only you will be able to see it</Text>
                </View>
                 
                <ProfilePicViewShot ref={profilePicViewShotRef} onDirty={valid => setProfilePicValid(valid)}/>
             
                <View style={{width: '100%', flexDirection: 'row', justifyContent: 'space-between'}}>
                    <TouchableHighlight onPress={() => setStep(4)}>
                        <Text style={{lineHeight: 57, paddingHorizontal: 20, fontSize: 16, color: '#F6F5F1'}}>Skip</Text>
                    </TouchableHighlight>
                    <SignInButton width={103} align={'flex-end'} text={'Next'} valid={!!profilePicValid} onPress={submitPhoto}></SignInButton>
                </View>
            </View>
             :
            step === 2 ? 
            <KeyboardAvoidingView
                style={{flex: 1}}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <View style={{height: '100%', width: '100%', padding: 28, justifyContent: 'space-between', maxHeight: 540}}>
                    <Text style={{fontSize: 19, fontWeight: '600', color: '#F6F5F1'}}>Name</Text>
                    <ProfileNames ref={profileNamesRef} onStateChange={(state, value) => state === 'valid' && setProfileNameValid(value)}/>
                    <View style={{width: '100%', flexDirection: 'row', justifyContent: 'space-between'}}>
                        <TouchableHighlight onPress={() => setStep(4)}>
                            <Text style={{lineHeight: 57, paddingHorizontal: 20, fontSize: 16, color: '#F6F5F1'}}>Skip</Text>
                        </TouchableHighlight>
                        <SignInButton width={103} text={'Next'} valid={profileNameValid} align={'flex-end'} onPress={submitName}></SignInButton>
                    </View>
                </View>
            </KeyboardAvoidingView>
            :
            step === 3 ? 
            <View style={{height: '100%', width: '100%', padding: 28, alignItems: 'center', justifyContent: 'center'}}>
                <UserAvatar size={150} />
                
                <View style={{marginVertical: 60}}>
                    <Text style={{color: 'white'}}>{user?.firstName} {user?.lastName}</Text>
                </View>
                
                <TouchableHighlight onPress={enterJungle}>
                    <View style={{ borderRadius: 66/2, alignItems: 'center', justifyContent: 'center', height: 66, width: 193, borderStyle:'solid', borderWidth: 1.5, borderColor: '#FFFDF6'}}>
                        <Text style={{color: '#FFFDF6'}}>Enter Jungle</Text>
                    </View>
                </TouchableHighlight>
            </View>
            :
            null
        }
    </SafeAreaView> ;
}

export default SignInFlow;