import { AsyncThunk, AsyncThunkPayloadCreator, createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { api, userRow } from "jungle-shared";
import AsyncStorage from '@react-native-async-storage/async-storage';
import {appleAuth, AppleRequestResponse, AppleButton} from '@invertase/react-native-apple-authentication';
import axios from 'axios';
import { createRootAsyncThunk, rootNavRef } from 'utils';
import { GeolocationResponse } from '@react-native-community/geolocation';
import { PermissionKey, requestDialog } from './app';

import {
    GoogleSignin
  } from '@react-native-google-signin/google-signin';
import { userGraphApi } from './api';
import { AddUpdateListHandle } from 'components/shared/AddUpdateList';
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { PlaceAddModalHandle } from 'components/singles/PlaceAddModal';

  GoogleSignin.configure({
    webClientId: GOOGLE_CLIENT_ID, // client ID of type WEB for your server (needed to verify user ID and offline access)
    offlineAccess: true, // if you want to access Google API on behalf of the user FROM YOUR SERVER
    // hostedDomain: '', // specifies a hosted domain restriction
    forceCodeForRefreshToken: true, // [Android] related to `serverAuthCode`, read the docs link below *.
    // accountName: '', // [Android] specifies an account name on the device that should be used
    iosClientId: GOOGLE_CLIENT_ID, // [iOS] if you want to specify the client ID of type iOS (otherwise, it is taken from GoogleService-Info.plist)
    // googleServicePlistPath: '', // [iOS] if you renamed your GoogleService-Info file, new name here, e.g. GoogleService-Info-Staging
    // openIdRealm: '', // [iOS] The OpenID2 realm of the home web server. This allows Google to include the user's OpenID Identifier in the OpenID Connect ID token.
    profileImageSize: 120, // [iOS] The desired height (and width) of the profile image. Defaults to 120px
  });

 export const googleSignin = createRootAsyncThunk('googleSignIN', async (args: undefined, {dispatch, getState}) => {
    try {
        await GoogleSignin.hasPlayServices();

        const userInfo = await GoogleSignin.signIn();

        AsyncStorage.setItem('googleUserId', userInfo.user.id);

        const tokensRes = await axios.post<{refreshToken: string, idToken: string}>(`${api.baseUrl}/api/google/auth`, {authCode: userInfo.serverAuthCode});

        AsyncStorage.setItem('googleRefreshToken', tokensRes.data.refreshToken);

        api.googleIdToken = tokensRes.data.idToken;

        const signin = async (): Promise<userRow> => {
            const userRow = (await api.get('user', {session: true}))[0];
    
            if(!!userRow?.id){
                await Promise.all([
                    dispatch(getUserPosts()),
                    dispatch(getUserPlaces())
                ]);
    
                dispatch(setUserData(userRow));
    
                return userRow;
            }
            else{
                await api.put('user');
                return await signin();
            }
        }
    
        return await signin();
    //   this.setState({ userInfo });
    } catch (error) {
        console.log('google signin', error);
    //   if (error.code === statusCodes.SIGN_IN_CANCELLED) {
    //     // user cancelled the login flow
    //   } else if (error.code === statusCodes.IN_PROGRESS) {
    //     // operation (e.g. sign in) is in progress already
    //   } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
    //     // play services not available or outdated
    //   } else {
    //     // some other error happened
    //   }
    }
  });

export const getUserRow = createAsyncThunk('getUserRow', async () => await api.get('user', {session: true}));

export const getUserPlaces = createAsyncThunk('getUserPlaces', async () => await api.get('user_place'));

export const getUserPosts = createAsyncThunk('getUserPosts', async () => {const posts = await api.get('user_post'); return posts});

export const logoutUser = createAsyncThunk('logoutUser', async (undefined, {dispatch}) => {
    api.appleIdToken = '';
    api.googleIdToken = '';
    await GoogleSignin.signOut();
    await AsyncStorage.multiRemove(['appleRefreshToken', 'appleUserId', 'googleUserId', 'googleRefreshToken']);
    dispatch(userGraphApi.util.invalidateTags(['events', 'places', 'tastemakers']));
}, {});

export const appleRefresh = async () => {
    const refreshToken = await AsyncStorage.getItem('appleRefreshToken');

    const reply = await axios.get<{loggedIn: boolean, idToken: string}>(`${api.baseUrl}/api/apple/refresh`, {withCredentials: true, headers: {cookie: `refreshToken=${refreshToken}`}, });

    if(reply.data.loggedIn)
        api.appleIdToken = reply.data.idToken;

    return reply.data.loggedIn;
}

export const googleRefresh = async () => {
    try{
        const refreshToken = await AsyncStorage.getItem('googleRefreshToken');

        const reply = await axios.get<{loggedIn: boolean, accessToken: string, idToken: string}>(`${api.baseUrl}/api/google/refresh`, {withCredentials: true, headers: {cookie: `refreshToken=${refreshToken}`}, });

        if(reply.data.loggedIn){
            api.googleAccessToken = reply.data.accessToken;
            api.googleIdToken = reply.data.idToken;
        }

        return reply.data.loggedIn;
    }
    catch{
        return false;
    }
}

export const resolvers: {[k: number]: () => void} = {};

export const performAppleSigninRequest = async () => await appleAuth.performRequest({
    requestedOperation: appleAuth.Operation.LOGIN,
    requestedScopes: [appleAuth.Scope.EMAIL],
});

export const checkAppleResponseAndCredentials = async (appleAuthRequestResponse: AppleRequestResponse) => appleAuthRequestResponse && await appleAuth.getCredentialStateForUser(appleAuthRequestResponse.user) === appleAuth.State.AUTHORIZED;

export const getAppleTokensAndSignIn = createRootAsyncThunk('getAppleTokenAndSignin', async (appleAuthRequestResponse: AppleRequestResponse, {getState, dispatch}): Promise<userRow | undefined> => {
    const tokensRes = await axios.post<{refreshToken: string, idToken: string}>(`${api.baseUrl}/apple/auth`, {authCode: appleAuthRequestResponse.authorizationCode}, {withCredentials: true, headers: {"cookie": `authCode=${appleAuthRequestResponse.authorizationCode}`}});
    
    if(!tokensRes.data.idToken || !tokensRes.data.refreshToken){
        console.log('auth failed');
        return;
    }
        
    AsyncStorage.setItem('appleRefreshToken', tokensRes.data.refreshToken);
    AsyncStorage.setItem('appleUserId', appleAuthRequestResponse.user);
    
    api.appleIdToken = tokensRes.data.idToken;

    const signin = async (): Promise<userRow> => {
        const userRow = (await api.get('user', {session: true}))[0];

        if(!!userRow?.id){
            await Promise.all([
                dispatch(getUserPosts()),
                dispatch(getUserPlaces())
            ]);

            dispatch(setUserData(userRow));

            return userRow;
        }
        else{
            await api.put('user');
            return await signin();
        }
    }

    return await signin();
});

export const requestAppleSignin = createRootAsyncThunk('requestAppleSignin', async (args: undefined, {dispatch}) => {
    const appleAuthRequestResponse = await performAppleSigninRequest();

    if(await checkAppleResponseAndCredentials(appleAuthRequestResponse)){
        return await dispatch(getAppleTokensAndSignIn(appleAuthRequestResponse)).unwrap();
    }
    else console.log('credentials unauthed');
}); 

// const checkStatus = (status: PermissionStatus) => status === 'granted' || status === 'limited';
// const checkResponse = (res: NotificationsResponse) => checkStatus(res.status);
// export const checkReqPermission = async (permission: Permission) => checkStatus(await check(permission)) || checkStatus(await request(permission));

// export const requestNotificationsPermissions = async (request: boolean = true, type?: 'weekly') => {
//     if(type === 'weekly' && !(await requestDialog(DialogServiceRequest.pushWeekly)))
//         return false;
        
//     const hasPermission = checkResponse(await checkNotifications()) || (request ? checkResponse(await requestNotifications(['alert', 'badge', 'sound'])) : false);

//     if(hasPermission){
//         Notifications.registerRemoteNotifications();

//         return true;
//     }
//     else 
//         return false;
// }

// export const requestReminderPermissions = async () =>  await checkReqPermission(PERMISSIONS.IOS.REMINDERS);

const checkStatus = (status: any) => status === 'granted' || status === 'limited';
const checkResponse = (res: any) => checkStatus(res.status);
export const checkReqPermission = async (permission: any) => false;

export const requestNotificationsPermissions = async (request: boolean = true, type?: 'weekly') => {
    // if(type === 'weekly' && !(await requestDialog(DialogServiceRequest.pushWeekly)))
    //     return false;
        
    // const hasPermission = checkResponse(await checkNotifications()) || (request ? checkResponse(await requestNotifications(['alert', 'badge', 'sound'])) : false);

    // if(hasPermission){
    //     Notifications.registerRemoteNotifications();

    //     return true;
    // }
    // else 
    //     return false;

    return false;
}

const signedInApple = async (userId: string) => await appleAuth.getCredentialStateForUser(userId) === appleAuth.State.AUTHORIZED;
const signedInGoogle = async () => await GoogleSignin.isSignedIn();

export const checkUser = createRootAsyncThunk('checkUser', async ({request = null, required = true}: {request?: null|PermissionKey, required?: boolean} = {}, {getState, dispatch}) => await new Promise<userRow>(async (res, rej) =>{
    const ts = Date.now();
    
    // if(!appleAuth.isSupported){
    //     rej(SignInError.NotSupported);
    //     return;
    // }

    // await AsyncStorage.multiRemove(['googleUserId', 'appleUserId']);

    // await dispatch(logoutUser()).unwrap();

    const appleUserId = appleAuth.isSupported ? await AsyncStorage.getItem('appleUserId') : null;
    const googleUserId = await AsyncStorage.getItem('googleUserId');
    
    const alreadySignedIn = appleUserId ? await signedInApple(appleUserId) : googleUserId ? await signedInGoogle() : false;
    const state = getState();

    if(alreadySignedIn && (api.appleIdToken || api.googleIdToken) && state.user.user){
        res(state.user.user!);
        return;
    }
    
    const refreshed = 
        googleUserId ? await googleRefresh() : 
        appleUserId ? await appleRefresh() : false;
    
    const userRow = refreshed ? (await api.get('user', {session: true}))[0] : null;

    if(userRow){
        dispatch(setUserData(userRow));
    }

    if((userRow && userRow.signInStep === 4) || !required){
        res(userRow!);
    }
    else {        
        const getDialogUser = async (request: PermissionKey): Promise<userRow | null> => {
            const result = await dispatch(requestDialog(request)).unwrap();

            if(result){
                const user = getState().user.user;

                return user ?? null;
            }

            return null;
        }

        try{
            const user = await getDialogUser(request ?? PermissionKey.signInBase);

            if(user){
                if(user.signInStep < 3){                
                    dispatch(setResolver(res));
                    rootNavRef.current?.navigate('SignIn', {timestamp: ts});
                }
                else
                    res(user);
            }
            else
                rej(SignInError.SigninFailed)
        }
        catch{
            rej(SignInError.SigninFailed);
        }
    }
}));

export enum SignInError {
    NotSupported,
    SigninFailed
}

// export const checkSigninFlow = createRootAsyncThunk('checkSigninFlow', ({ts, res}: {ts: number, res: (v: userRow) => void}, {getState, dispatch}) => {
//     const user = getState().user.user;
    
//     if(user!.signInStep < 3){                
//         dispatch(setResolver(res));
//         rootNavRef.current?.navigate('SignIn', {timestamp: ts});
//     }
//     else
//         res(user);
// })

type userStateSlice = {
    user: userRow | null,
    userSavedPlaces: number[],
    userSavedPosts: number[],
    savedPlacesToggled: boolean,
    appLoggedIn: boolean,
    authTimestamp: number,
    checkResolver: ((v: userRow) => void) | null,
    photoTS: number,
    geolocation: GeolocationResponse | null,
    geolocationWatchId: number | null,
    addUpdateListRef: AddUpdateListHandle|null
}

const initialState: userStateSlice  = {
    user: null,
    savedPlacesToggled: false,
    appLoggedIn: false,
    geolocation: null,
    geolocationWatchId: null,
    userSavedPlaces: [],
    userSavedPosts: [],
    authTimestamp: 0,
    checkResolver: null,
    photoTS: Date.now(),
    addUpdateListRef: null
};

export const UserSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setAddUpdateListRef: (state, action: PayloadAction<AddUpdateListHandle|null>) => {
        state.addUpdateListRef = action.payload;
    },
    setUserLocation(state, action: PayloadAction<GeolocationResponse>){
        state.geolocation = action.payload;
    },
    setAuthTimestamp(state, action: PayloadAction<number>){
        state.authTimestamp = action.payload;
    },
    setUserData(state, action: PayloadAction<userRow | null>){
        const _state = {...state, user: action.payload ? {...action.payload} as userRow : null, appLoggedIn: !!action.payload};

        if(action.payload === null){
            _state.userSavedPlaces = [];
            _state.userSavedPosts = [];
        }

        if(!_state.appLoggedIn){
            _state.userSavedPlaces = [];
            _state.savedPlacesToggled = false;
        }

        return _state;
    },
    toggleSavedPlaces(state, action: PayloadAction<boolean>){
        state.savedPlacesToggled = action.payload;
    },
    setResolver(state, action: PayloadAction<((v: userRow) => void) | null>){
        state.checkResolver = action.payload;
    },
    updatePhotoTimestamp(state, action: PayloadAction<number>){
        return {...state, photoTS: action.payload};
    },
    // updateUserGeoLocation(state, action: PayloadAction<number[] | null>){
    //     state.geolocation = action.payload;
    // }
  },
  extraReducers: (builder) => {
      builder.addCase(getUserRow.fulfilled, (state, action) => {
          
        const newState = {...state, user: action.payload.length ? {...action.payload[0]} : null, appLoggedIn: !!action.payload?.length};
        
        return newState;
      });
      builder.addCase(getUserPlaces.fulfilled, (state, action) => {
          return {...state, userSavedPlaces: action.payload.map(({placeId}) => placeId)}
      });
      builder.addCase(getUserPosts.fulfilled, (state, action) => {
        return {...state, userSavedPosts: action.payload.map(({postId}) => postId)}
    });
    builder.addCase(logoutUser.fulfilled, state => {
        state.authTimestamp = 0;
        state.user = null;
        state.userSavedPlaces = [];
        state.userSavedPosts = [];
        state.appLoggedIn = false;
        state.savedPlacesToggled = false;
    })
  }
})

export const { setAddUpdateListRef, setUserLocation, setResolver, setUserData, setAuthTimestamp, toggleSavedPlaces, updatePhotoTimestamp } = UserSlice.actions
export default UserSlice.reducer;
