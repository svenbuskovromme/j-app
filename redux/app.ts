import React from 'react';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { PayloadAction } from '@reduxjs/toolkit/dist/createAction';
import { api, appActivity, appActivityType, place } from 'jungle-shared';
// import { DialogServiceRequest } from 'components/common/PermissionsDialog';
// import { store } from './store';
import permissions, { Permission } from 'react-native-permissions';
import { createRootAsyncThunk } from 'utils';
import { Alert, Platform } from 'react-native';
import { PlaceRecsModalHandle } from 'components/singles/PlaceRecsModal';
import { VideoModalHandle } from 'components/singles/VideoModal';

export enum PermissionKey {
  followPlaces, followTastemakers, saveEvents,
  enablePush, enableLocation,
  signInBase
}

const initialState: {
  currentPermissionKey: PermissionKey|null,
  appId: number, 
  subbedWeekly: boolean,
  subbedDaily: boolean,
  subbedFollow: boolean,
  contentLoaded: boolean, 
  userChecked: boolean, 
  rootTabTextColor: string
  rootTabBackgroundColor: string,
  rootTabLineColor: string,
  footerHeight: number,
  footerShown: boolean,
  muted: boolean,
  weeklyConsumed: boolean,
  weeklyTs: number,
  permissionResolver: ((res: boolean) => void) | null,
  videoModalHandle: VideoModalHandle|null
} = {
  permissionResolver: null,
  currentPermissionKey: null,
  appId: 0,
  contentLoaded: false,
  userChecked: false,
  subbedWeekly: false,
  subbedDaily: false,
  subbedFollow: false,
  rootTabBackgroundColor: '#030303',
  rootTabTextColor: 'white',
  rootTabLineColor: '#FFFFFF20',
  footerHeight: 60,
  footerShown: true,
  weeklyConsumed: false,
  weeklyTs: 0,
  muted: true,
  videoModalHandle: null
}

export const requestDialog = createRootAsyncThunk('permissionDialog', async (request: PermissionKey, {dispatch, getState}) => {
  dispatch(requestPermission(request));

  return new Promise<boolean>(res => {
    dispatch(setPermissionResolver(res));
  });
}) 



// export const getFollowSignin = createRootAsyncThunk('followSigninDialog', async (request: PermissionKey, {dispatch}) => {
//   return new Promise(res => {
//       dispatch()
//   });
// });



// export const checkSystemPermission = async (requiredPermission: Permission) => {
//   const existing = await permissions.check(requiredPermission);

//   if(existing === 'limited' || existing === 'granted')
//     return true;
//   else if(existing === 'blocked'){
//     permissions.openSettings();

//     return false;
//   }

//   const permission = await permissions.request(requiredPermission);

//   if(permission === 'limited' || permission === 'granted')
//       return true;
      
//   return false;
// }

export type enabledPermissions = 'location' | 'images';

export const getPlatformPermission = (permission: enabledPermissions) => {
  switch(permission){
    case 'location': return Platform.OS === 'android' ? permissions.PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION : Platform.OS === 'ios' ? permissions.PERMISSIONS.IOS.LOCATION_WHEN_IN_USE : null;
    case 'images': return Platform.select({ios: permissions.PERMISSIONS.IOS.PHOTO_LIBRARY, android: permissions.PERMISSIONS.ANDROID.READ_MEDIA_IMAGES}) ?? null;
  }
}

export const getPermission = createRootAsyncThunk('getPermission', async ({permission, required = false, request = null}: {permission: enabledPermissions, required?: boolean, request?: PermissionKey|null}, {dispatch, getState}) => {
  const requiredPermission = getPlatformPermission(permission);

  if(requiredPermission === null)
    return false;

  const existing = await permissions.check(requiredPermission);

  if(existing === 'granted' || existing === 'limited')
    return true;
  else if(!required)
    return false;
  else if(existing === 'blocked'){
    Alert.alert('It looks like you\'ve previously disabled this feature', 'Would you like to open settings to enable it?', [
      {style: 'default', text: 'Yes', onPress(){permissions.openSettings();}},
      {style: 'cancel', text: 'No'}
    ]);

    return false;
  }
  else if(existing === 'unavailable')
    return false;
  
  const junglePermission = request ? await dispatch(requestDialog(request)).unwrap() : true;

  if(junglePermission){
    const permission = await permissions.request(requiredPermission);

    if(permission === 'limited' || permission === 'granted')
      return true;
  }

  return false;
});

export const logAppActivity = createAsyncThunk('app/logActivity', async (act: appActivity, {dispatch, getState}) => {
  try{
    if(__DEV__)
      throw 'in dev mode';

    api.put('app_activity', {row: {os: Platform.OS, version: '1', created: new Date(), data: act.data ? JSON.stringify(act.data) : null, type: act.type, appId: 0, dev: __DEV__}});    
  }
  catch(e){
    console.log('logging app activity failed, reason:', e, act.type);
  }
});

export const getApp = createAsyncThunk('getApp', async () => {
  const app = await api.get('app');

  return app;
});

export const AppSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    // setMenuOpen(state, action: PayloadAction<boolean>){
    //   state.menuOpen = action.payload;
    // },
    setAppId(state, action: PayloadAction<number>){
      state.appId = action.payload;
    },
    setUserChecked: state => {
      state.userChecked = true;
      return state;
    },
    setLoadDone: state => {
      state.contentLoaded = true;
      return state;
    },
    setTabNavColors: (state, action: PayloadAction<{text?: string, bg?: string, line?: string} | undefined>) => {
      const colors = action.payload || {};

      return {
          ...state,
          rootTabBackgroundColor: colors.bg || '#030303',
          rootTabTextColor: colors.text || 'white',
          rootTabLineColor: colors.line || '#FFFFFF20'
      }
    },
    setMuted: (state, action: PayloadAction<boolean>) => {
      state.muted = action.payload;
    },
    requestPermission(state, action: PayloadAction<PermissionKey>){
      state.currentPermissionKey = action.payload;
    },
    setPermissionResolver(state, action: PayloadAction<(res: boolean) => void>){
      state.permissionResolver = action.payload;
    },
    closePermissionDialog(state){
      state.currentPermissionKey = null;
      state.permissionResolver = null;
    },
    setFooterShown(state, action: PayloadAction<boolean>){
      state.footerShown = action.payload;
    },
    setWeeklyConsumed(state, action: PayloadAction<boolean>){
      state.weeklyConsumed = action.payload;
    },
    setWeeklyTs(state, action: PayloadAction<number>){
      state.weeklyTs = action.payload;
    },
    setVideoModalHandleRef: (state, action: PayloadAction<VideoModalHandle|null>) => {
      state.videoModalHandle = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(getApp.fulfilled, (state, action) => {
      state.subbedWeekly = action.payload.weeklyPush;
      state.subbedDaily = action.payload.dailyPush;
      state.subbedFollow = action.payload.followPush;
    });
  }
})

export const { 
  setAppId, 
  setTabNavColors,
  setLoadDone,
  setUserChecked,
  requestPermission,
  closePermissionDialog,
  setPermissionResolver,
  setFooterShown,
  setWeeklyConsumed,
  setWeeklyTs,
  setVideoModalHandleRef
} = AppSlice.actions
export default AppSlice.reducer;