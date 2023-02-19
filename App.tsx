import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNetInfo, addEventListener } from '@react-native-community/netinfo';
import { CommonActions, DefaultTheme, LinkingOptions, NavigationContainer, NavigationContainerRef, NavigationState, ParamListBase, RouteProp, StackActions, useFocusEffect, useLinkTo, useRoute } from '@react-navigation/native';
import { APP_INSTALL_KEY, APP_INSTALL_KEY_ENC } from 'config';
import { api } from 'jungle-shared';
import React, {FC, ReactElement, useCallback, useEffect, useMemo, useRef, useState, type PropsWithChildren} from 'react';
import { Platform, StatusBar, Text, TouchableOpacity, useWindowDimensions, View, Animated, Linking, EmitterSubscription, KeyboardAvoidingView, AppState, NativeAppEventEmitter, NativeEventEmitter } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { closePermissionDialog, getApp, logAppActivity, PermissionKey, requestDialog, requestPermission, setAppId, setFooterShown, setLoadDone, setUserChecked, setVideoModalHandleRef, setWeeklyConsumed, setWeeklyTs } from 'redux/app';
import { useAppDispatch, useAppSelector } from 'redux/hooks';
import { store } from 'redux/store';
import Reanimated, { enableLayoutAnimations, FadeIn, FadeOut, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootNavProps, rootNavRef, RootStackParamList, WEEKLY_CONSUMED_KEY, WEEKLY_TS_KEY } from 'utils';
import Svg, { Path } from 'react-native-svg';

import SearchScreen from './components/screens/search';
import PlaceScreen from './components/screens/place';
import ProfileScreen from './components/screens/profile';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { checkUser, setAddUpdateListRef } from 'redux/user';
import { HomeIcon } from 'components/shared/HomeIcon';
import UserAvatar from 'components/shared/UserAvatar';
import SignInFlowScreen from 'components/screens/signinFlow';
import EventScreen from 'components/screens/event';
import TastemakerScreen from 'components/screens/tastemaker';
import PostScreen from 'components/screens/post';
import HomeScreen from 'components/screens/home';
import WeeklyScreen from 'components/screens/weekly';
import MapboxGL from '@rnmapbox/maps';
import BottomSheet, { BottomSheetModal, BottomSheetModalProvider, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { EnableLocationPermissionSheet, EnableNotiticationsPermissionSheet, FollowEventsPermissionSheet, FollowPermissionSheet, FollowPlacesPermissionSheet, FollowTastemakersPermissionSheet, PermissionSheet, SignInPermissionSheet } from 'components/shared/PermissionSheet';
import MenuModal from 'components/shared/MenuModal';
import PushNotificationIOS, { PushNotification } from '@react-native-community/push-notification-ios';
import { Onboarding } from 'components/singles/Onboarding';
import Splash from 'components/singles/Splash';
import { SearchIcon } from 'components/shared/SearchIcon';
import ListsScreen from 'components/screens/lists';
import ListScreen from 'components/screens/list';
import { ListsIcon } from 'components/shared/ListsIcon';
import { useGetLocationNodeByQuery, useLazyGetLocationNodeByQuery } from 'redux/api';
import { setDefaultLocationNode, setSelectedLocationNode } from 'redux/locationNodes';
import { LocationsModal } from 'components/singles/LocationsModal';
import LocationNode from 'components/shared/LocationNode';
import { setupListeners, skipToken } from '@reduxjs/toolkit/dist/query';
import UserListScreen from 'components/screens/userList';
import SavedScreen from 'components/screens/saved';
import PlaceLocationsModal from 'components/singles/PlaceLocationsModal';
import AddUpdateList, { AddUpdateListHandle } from 'components/shared/AddUpdateList';
import PlaceAddModal, { PlaceAddModalHandle } from 'components/singles/PlaceAddModal';
import PlaceRecsModal, { PlaceRecsModalHandle } from 'components/singles/PlaceRecsModal';
import CalendarScreen from 'components/screens/calendar';
import Icons from 'components/shared/Icons';
import Gap from 'components/shared/Gap';
import VideoModal, { VideoModalHandle } from 'components/singles/VideoModal';

MapboxGL.setAccessToken('sk.eyJ1Ijoiam9obmpjb25uIiwiYSI6ImNsN3ltNHZxcjBtZXUzcm10bHlzbjRncnIifQ.4sLoeLaJPf74W35wVuoveA');

const Stack = createNativeStackNavigator<RootStackParamList>();

const App = () => {
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <ReduxApp />
      </Provider>
    </SafeAreaProvider>
  )
};

const RootTabButton: FC<PropsWithChildren<{hasBadge?: boolean, label?: string, name: keyof RootStackParamList, onPress: () => void, icon: (active: boolean) => ReactElement}>> = ({label, name, onPress, icon, hasBadge}) => {
  const [route, setRoute] = useState<string>();
  const [active, setActive] = useState(false);

  useEffect(() => {
    setActive(route === name);
  }, [route]);

  useEffect(() => {
    const setCurrentRoute = () => {
      const route = rootNavRef.current?.getCurrentRoute();
      setRoute(route?.name);
    }

    const listener = rootNavRef.current?.addListener('state', e => {
      const route = rootNavRef.current?.getCurrentRoute();
      setRoute(route?.name);
    });

    setCurrentRoute();

    return () => {
      !!listener && listener();
    }
  }, [rootNavRef.current]);

  const footerShown = useAppSelector(state => state.app.footerShown);

  return <TouchableOpacity activeOpacity={0.75} disabled={!footerShown} hitSlop={{top: 25, bottom: 25, left: 25, right: 25}} style={{opacity: active ? 1 : 0.40, height: 45, alignItems:'center', justifyContent: 'space-between'}} onPress={onPress}>
    {
      !!hasBadge &&
      <View style={{position: 'absolute', right: 3, top:-5, backgroundColor: '#007aff', height: 12, width: 12, borderRadius: 10, zIndex: 2}} />
    }
    <View style={{flex: 1}}>
      {icon(active)}
    </View>
    <Text style={{fontSize: 12, fontWeight: '400', color: 'white'}}>{label ?? name}</Text>
  </TouchableOpacity>
}

const ReduxApp = () => {
  const dispatch = useAppDispatch();
  const bounds = useWindowDimensions();
  const contentLoaded = useAppSelector(state => state.app.contentLoaded);
  const userChecked = useAppSelector(state => state.app.userChecked);
  const [aik, setAik] = useState<number>(0);

  const netInfo = useNetInfo();
  const [loadFailed, setLoadFailed] = useState<boolean>(false);

  
  const defLocationNodeData = useGetLocationNodeByQuery({ip: 'true'});
  const defLocationNode = useAppSelector(state => state.locationNodes.defaultLocationNode);

  useEffect(() => {
    if(defLocationNodeData.data)
      dispatch(setDefaultLocationNode(defLocationNodeData.data.locationNode.id));
    else if(defLocationNodeData.isSuccess)
      dispatch(setDefaultLocationNode(4));
  }, [defLocationNodeData]);

  useEffect(() => {
    let mounted = true;

    const tryApp = async () => {
      if(aik === 0){
        AsyncStorage.multiGet([APP_INSTALL_KEY, APP_INSTALL_KEY_ENC]).then(async keys => {
          let [, key] = keys.find(key => key[0] === APP_INSTALL_KEY)!;
          let [, keyEnc] = keys.find(key => key[0] === APP_INSTALL_KEY_ENC)!;
    
          if(mounted){
            try{
              if(key === null || keyEnc === null){
                const keyRow = await api.put('app', {os: Platform.OS, version: String(Platform.Version)});
      
                key = keyRow.pk.toString();
                keyEnc = keyRow.encrypted;
                
                await Promise.all([
                  AsyncStorage.setItem(APP_INSTALL_KEY, key),
                  AsyncStorage.setItem(APP_INSTALL_KEY_ENC, keyRow.encrypted)
                ]);
              }
    
              api.appToken = keyEnc!;
      
              dispatch(setAppId(parseInt(key)));
              setAik(parseInt(key));

              dispatch(logAppActivity({type: 'appOpen'}));
            }
            catch{}
          }
        });
      }
    }

    try{
      if(netInfo.isConnected){
        tryApp();
      }
    }
    catch(e){
      setLoadFailed(true);
    }
  
    return () => {
      mounted = false;
    }
  }, [aik, netInfo.isConnected, loadFailed]);

  useEffect(() => {
    let mounted = true;

    AsyncStorage.getItem(WEEKLY_TS_KEY).then(value => {
      if(value && mounted){
        const ts = parseInt(value);
        
        dispatch(setWeeklyTs(ts));
      }
    });
    
    return () => {mounted = false;}
  }, []);

  const enableLinks = useCallback(() => {
    const handleUrl = (url: string) => {
      // console.log(url);
    }

    // Linking.getInitialURL().then(url => handleUrl('https://jungle.link/place/2'));

    return [
      Linking.addEventListener('url', e => {
        handleUrl(e.url);
      })
    ];
  }, []);

  const [initialPushHandled, setInitialPushHandled] = useState(false);

  const enablePush = useCallback(async () => {
    const handleNotifications = (push: PushNotification) => {
      const data = push.getData();
      if(data.data = 'weekly'){
        dispatch(logAppActivity({type: 'pushOpen', data: {type: 'weekly'}}));
        rootNavRef.current?.navigate('Home');
        push.finish('success');
      }

      PushNotificationIOS.removeAllDeliveredNotifications();
    }

    PushNotificationIOS.addEventListener('register', e => {
      api.patch('app', {row: {deviceToken: e}});
    });
    
    PushNotificationIOS.addEventListener('localNotification', e => {
      handleNotifications(e);
    });

    PushNotificationIOS.addEventListener('notification', e => {
      handleNotifications(e);
    });

    PushNotificationIOS.checkPermissions(p => {
      if(p.alert && p.badge && p.sound){
        PushNotificationIOS.requestPermissions({alert: true, badge: true, sound: true});
      }
    });

    const initialPush = await PushNotificationIOS.getInitialNotification();

    if(initialPush && !initialPushHandled){
      handleNotifications(initialPush);
      setInitialPushHandled(true);
    }
  }, [initialPushHandled]);

  useEffect(() => {
    if(!!aik){
      enablePush();
      // const linkSubs = enableLinks();

      return () => {
        PushNotificationIOS.removeEventListener('register');
        PushNotificationIOS.removeEventListener('localNotification');
        PushNotificationIOS.removeEventListener('notification');
        // linkSubs.forEach(sub => sub.remove());
      }
    }
  }, [aik, enableLinks, enablePush]);

  useEffect(() => {
    if(aik !== 0 && netInfo.isConnected && netInfo.isInternetReachable && !userChecked){
      dispatch(checkUser({request: null, required: false})).unwrap()
      .then(user => {
        if(user){
          logAppActivity({type: 'signIn'});
          api.put('app_user', {appId: aik, userId: user.id});
        }
        
        dispatch(setUserChecked());
      });
    }
  }, [aik, netInfo.isConnected, netInfo.isInternetReachable, userChecked, setUserChecked]);

  useEffect(() => {
    if(aik !== 0 && netInfo.isConnected && netInfo.isInternetReachable && !contentLoaded && defLocationNode){
      Promise.all([
        dispatch(getApp()).unwrap(),
      ]).then(() => {
        api.patch('app', {row: {version: '1', os: Platform.OS}}),
        dispatch(setLoadDone());
      });
    }
  }, [aik, defLocationNode, netInfo.isConnected, netInfo.isInternetReachable, contentLoaded, setLoadDone]);

  const [retryFade, setRetryFade] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    setTimeout(() => {if(mounted) setRetryFade(false)}, 5000);

    return () => { mounted = false; }
  }, [retryFade]);

  const handleAppPress = () => {
    setRetryFade(true);
  }

  const handleHome = useCallback(() => {
    const state = rootNavRef.current?.getState();
    const base = state?.routes[0]?.name;
    const canGoBack = rootNavRef.canGoBack()

    if(base === 'Home' && canGoBack){
      rootNavRef.current?.dispatch(StackActions.popToTop());
    }
    else if(base === 'Home' && !canGoBack){

    }
    else if(base !== 'Home' && !canGoBack){
      rootNavRef.current?.dispatch(StackActions.replace('Home'));
    }
    else if(base !== 'Home' && canGoBack){
      rootNavRef.current?.reset({routes: [{name: 'Home'}]});
    }
  }, [rootNavRef]);

  const handleSearch = useCallback(() => {
    const current = rootNavRef.current?.getCurrentRoute()?.name;
    const same = current === 'Search';

    rootNavRef.current?.navigate('Search', {reset: same, initial: 'search'});
    dispatch(logAppActivity({type: 'searchOpen', data: {button: 'search'}}));
    
    // rootNavRef.current?.navigate('Map', {placeIds: []});
  }, [rootNavRef]);

  const [menuOpen, setMenuOpen] = useState(false);

  const handleProfile = useCallback(async () => {
    const user = await dispatch(checkUser({required: false})).unwrap();

    if(user)
      rootNavRef.current?.navigate('Profile');
    else
      setMenuOpen(true);
  }, [rootNavRef, dispatch, checkUser, setMenuOpen, requestDialog]);

  const handleLists = useCallback(() => {
    rootNavRef.current?.navigate('Lists');
  }, []);

  const handleCalendar = useCallback(() => {
    rootNavRef.current?.navigate('Calendar');
  }, []);

  // LogBox.ignoreAllLogs(true);

  useEffect(() => {
    enableLayoutAnimations(Platform.OS !== 'android');
  }, [Platform.OS])

  useEffect(() => {
    // return setupListeners(dispatch);

    return setupListeners(dispatch, (dispatch, {onFocus,onFocusLost,onOffline,onOnline}) => {
      const unsubFocus = AppState.addEventListener('change', e => {
        if(e === 'active')
          dispatch(onFocus());
        else if(e === 'inactive')
          dispatch(onFocusLost());
      });

      let online = false;

      const unsubConnection = addEventListener(e => {
        if(!e.isConnected && online){
          online = false;
          dispatch(onOffline());
        }
        else if(e.isConnected && !online){
          online = true;
          dispatch(onOnline());
        }
      });
      
      return () => {
        unsubFocus.remove();
        unsubConnection();
      }
    });
  }, []);

  const insets = useSafeAreaInsets();

  const tabTextColor = useAppSelector(state => state.app.rootTabTextColor);
  const tabLineColor = useAppSelector(state => state.app.rootTabLineColor);
  const footerHeight = useAppSelector(state => state.app.footerHeight);
  const footerShown = useAppSelector(state => state.app.footerShown);

  const handleSignIn = useCallback(async () => {
    setMenuOpen(false);
    const check = await dispatch(checkUser({required: true, request: PermissionKey.signInBase})).unwrap();
    
    if(check){
      rootNavRef.current?.navigate('Profile');
    }
  }, [dispatch, requestDialog, rootNavRef]);

  const linking = {
    prefixes: ['https://jungle.link', 'https://www.jungle.link', 'jungleapp://'],
    subscribe(listener){
      const linkingSubscription = Linking.addEventListener('url', ({ url }) => {
        const prefix = 'https://jungle.link/ulist/'
        dispatch(logAppActivity({type: 'urlOpen', data: {url}}));
        if(url.startsWith(prefix)){
          dispatch(logAppActivity({type: 'userListOpen', data:{shareId: url.replace(prefix, '')}}));
        }

        listener(url);
      });
  
      return () => {
        // Clean up the event listeners
        linkingSubscription.remove();
      };
    },
    config: {
      screens: {
        'Event': 'event/:id',
        'Place': 'place/:id',
        'Post': 'post/:id',
        'Tastemaker': 'tastemaker/:id',
        'Weekly': 'weekly',
        'UserList': 'ulist/:shareId'
      }
    }
  } as LinkingOptions<RootStackParamList>;

  const handleMenuClose = useCallback(() => {setMenuOpen(false)}, [setMenuOpen]);
  const homeIcon = useCallback((active: boolean) => <HomeIcon fill={active ? tabTextColor : 'transparent'} color={tabTextColor} size={23} />, [tabTextColor]);
  const searchIcon = useCallback((active: boolean) => <SearchIcon fill={active ? tabTextColor : 'transparent'}  color={tabTextColor} size={24} />, [tabTextColor]);
  const listsIcon = useCallback((active: boolean) => <ListsIcon color={tabTextColor} fill={active ? tabTextColor : 'transparent'} size={23} />, [tabTextColor]);
  const calendarIcon = useCallback((active: boolean) => <Icons.Reservations color={tabTextColor} fill={active ? tabTextColor : 'transparent'} size={2.3} />, [tabTextColor]);
  const userIcon = useCallback((active: boolean) => <UserAvatar borderWidth={active ? 3 : 2} border={tabTextColor} size={26} />, [tabTextColor]);
  const weeklyHeader = useCallback(() => {
    return <View style={{flex: 1, paddingVertical: 0}}>
      <Text style={{paddingHorizontal: 10,  textAlign: 'left', color: 'white'}}>This week in</Text>
      <LocationNode />
    </View>
  }, []);

  const footerOpacity = useSharedValue(1);

  useEffect(() => {
    footerOpacity.value = withTiming(footerShown ? 1 : 0, {duration: 200});
  }, [footerShown]);

  const footerUas = useAnimatedStyle(() => ({
    opacity: footerOpacity.value
  }), [footerOpacity]);
  
  useEffect(() => {
    if(rootNavRef.current){
      const sub = rootNavRef.current.addListener('state', e => {
        const route = rootNavRef.getCurrentRoute();
        
        dispatch(setFooterShown(route?.name !== 'Weekly'));
      });
      return () => {
        sub();
      }
    }
  }, [rootNavRef.current]);

  const setAddUpdateListRefDispatch = useCallback((el: AddUpdateListHandle|null) => {
    dispatch(setAddUpdateListRef(el));
  }, []);

  const setVideoModalRefDispatch = useCallback((el: VideoModalHandle|null) => {
    dispatch(setVideoModalHandleRef(el));
  }, []);

  const weeklyTs = useAppSelector(state => state.app.weeklyTs);
  const [weeklyOpened, setWeeklyOpened ] = useState(false);
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
    setWeeklyOpened(weeklyTs >= weekStart.getTime());
  }, [weekStart, weeklyTs]);

  useEffect(() => {
    if(weeklyOpened && Platform.OS === 'ios')
      PushNotificationIOS.setApplicationIconBadgeNumber(0);
  }, [weeklyOpened]);

  return (
    <View style={{flex: 1, backgroundColor: '#030303'}}>
      <Splash />
      <GestureHandlerRootView style={{flex: 1}}>
        <NavigationContainer linking={linking} ref={rootNavRef} theme={{dark: true, colors: {...DefaultTheme.colors, background: 'transparent'}}}>
          <Reanimated.View style={{flex: 1, zIndex: 3}} >
            <Stack.Navigator initialRouteName='Home' screenOptions={{
              headerBackTitleVisible: false
            }}>
              <Stack.Group screenOptions={{headerStyle: {backgroundColor: '#030303'}, headerTintColor: 'white'}}>
                <Stack.Screen name={'Home'} component={HomeScreen} options={props => ({headerStyle: {backgroundColor: '#030303'}, headerTintColor: 'white'})} />
                <Stack.Screen name={'Search'} component={SearchScreen} options={props => ({animation: props.route.params?.reset ? 'none' : 'default', headerShown: false, headerStyle: {backgroundColor: '#030303'}, headerTintColor: 'white'})} />
                <Stack.Screen name={'Lists'} component={ListsScreen}/>
                <Stack.Screen name={'List'} component={ListScreen}/>
                <Stack.Screen name={'UserList'} component={UserListScreen}/>
                <Stack.Screen name={'Profile'} component={ProfileScreen}/>
                <Stack.Screen name={'SignIn'} component={SignInFlowScreen}/>
                <Stack.Screen name={'Tastemaker'} component={TastemakerScreen} options={{headerStyle: {backgroundColor: '#030303'}, headerTintColor: 'white'}} />
                <Stack.Screen name={'Post'} component={PostScreen} />
                <Stack.Screen name={'Event'} component={EventScreen}  />
                <Stack.Screen name={'Saved'} component={SavedScreen}  />
                <Stack.Screen name={'Calendar'} component={CalendarScreen}  />
                <Stack.Screen name={'Weekly'} component={WeeklyScreen} 
                  options={{
                    headerShown: false
                  }}
                  />
              </Stack.Group>
              <Stack.Group >
                <Stack.Screen name={'Place'} component={PlaceScreen}/>
                {/* <Stack.Screen name={'Map'} component={MapScreen}/> */}
              </Stack.Group>
            </Stack.Navigator>
          </Reanimated.View>
        </NavigationContainer>
        <Reanimated.View entering={FadeIn} exiting={FadeOut} style={[{paddingVertical: 10, paddingHorizontal: 20, zIndex: 4, width: '100%', height: footerHeight + insets.bottom, paddingBottom: insets.bottom, borderTopColor: tabLineColor, alignItems: 'flex-end', justifyContent: 'space-around', flexDirection: 'row', borderTopWidth: 1, backgroundColor: 'transparent'}, footerUas]}>
            <RootTabButton hasBadge={!weeklyOpened} name={'Home'} onPress={handleHome} icon={homeIcon} />
            <RootTabButton name={'Search'} onPress={handleSearch} icon={searchIcon} />
            <RootTabButton name={'Calendar'} label={'Events'} onPress={handleCalendar} icon={calendarIcon} />
            {/* <RootTabButton name={'Lists'} onPress={handleLists} icon={listsIcon} /> */}
            <RootTabButton name={'Profile'} onPress={handleProfile} icon={userIcon} />
        </Reanimated.View>
        <View pointerEvents={'box-none'} style={{opacity: 1, position: 'absolute', flex: 1, zIndex: 10, width: '100%', height: '100%'}}>
            <BottomSheetModalProvider>
              <FollowPlacesPermissionSheet />
              <FollowTastemakersPermissionSheet />
              <FollowEventsPermissionSheet />
              <EnableLocationPermissionSheet />
              <EnableNotiticationsPermissionSheet />
              <SignInPermissionSheet />
              <MenuModal open={menuOpen} onClose={handleMenuClose} onSignIn={handleSignIn} />
              <LocationsModal />
              <VideoModal ref={setVideoModalRefDispatch} />
            </BottomSheetModalProvider>
        </View>
        <AddUpdateList ref={setAddUpdateListRefDispatch} />
        <Onboarding />
        {
          !netInfo.isConnected &&
          <View style={{position: 'absolute', backgroundColor: 'rgba(0,0,0,0.8)',paddingBottom: 150, paddingTop: bounds.height/2 - 105, zIndex: 20, top: 0, left: 0, bottom: 0, right: 0, width: '100%', height: '100%', alignItems: 'center', justifyContent: 'space-between'}}>
            <View style={{alignItems: 'center'}}>
              <Svg width="81" height="73" viewBox="0 0 81 73" fill="none" style={{marginBottom: 40}}>
                <Path d="M80.9998 26.9023L78.5371 29.2667C78.4072 29.0712 78.2648 28.8844 78.1107 28.7074C73.66 24.1717 68.4477 20.4552 62.712 17.7277C62.3821 17.5708 62.2056 17.5989 61.9598 17.8798C59.7202 20.4359 57.4708 22.983 55.2114 25.5209C55.1042 25.6424 55.0019 25.7688 54.8617 25.934C59.5968 28.011 63.7694 30.8373 67.3984 34.4558C68.243 35.2985 69.0339 36.1949 69.8785 37.0996L67.3341 39.2781C67.2161 39.1501 67.1056 39.0369 67.0041 38.9171C63.1761 34.4467 58.3419 30.9518 52.9004 28.7206C52.6736 28.6273 52.5053 28.5604 52.2934 28.8033C49.984 31.4249 47.6658 34.0395 45.3388 36.6468C45.277 36.717 45.225 36.7955 45.1227 36.931C50.61 38.005 55.237 40.5579 59.0458 44.6664L56.6144 46.9333C55.5281 45.7263 54.3109 44.6442 52.9854 43.7072C49.9641 41.5712 46.4391 40.2613 42.7581 39.9069C42.4867 39.8796 42.33 39.9655 42.1618 40.1547C38.3826 44.4353 34.6004 48.7126 30.8152 52.9866C25.0362 59.5199 19.257 66.0532 13.4775 72.5865C13.4057 72.6691 13.3464 72.7599 13.2581 72.8773L10.7351 70.6549L37.6873 40.2828C32.7939 41.0643 28.7104 43.304 25.3271 46.9317L22.9006 44.6721C23.9015 43.5444 25.0098 42.517 26.2097 41.6046C29.6682 38.9609 33.5529 37.3452 37.8638 36.7575C38.7711 36.632 39.6989 36.6278 40.6144 36.5452C40.8 36.5279 41.0334 36.4626 41.1489 36.3296C43.7332 33.4364 46.3096 30.5354 48.8779 27.6268C48.9134 27.5871 48.9381 27.5376 49.014 27.4244C48.4697 27.2922 47.9624 27.1559 47.4469 27.046C40.6285 25.5796 34.0665 26.5024 27.7231 29.2411C22.692 31.4139 18.4361 34.6549 14.9283 38.875C14.8326 38.9906 14.7345 39.1038 14.6099 39.2492L12.058 37.0665C12.788 36.2527 13.4684 35.4423 14.2025 34.6839C19.6196 29.0819 26.1354 25.459 33.7498 23.8149C39.6181 22.5492 45.4246 22.7805 51.1626 24.5584C51.3935 24.6295 51.5535 24.6295 51.735 24.4238C54.0895 21.7498 56.4505 19.081 58.8182 16.4175C58.8627 16.3671 58.9007 16.3092 58.9931 16.1861C49.2342 12.4965 39.3204 11.8 29.2094 14.2157C19.119 16.6265 10.5223 21.6619 3.3195 29.1998L0.996094 26.6734C1.58334 26.1191 2.28275 25.4631 2.97557 24.803C8.76388 19.2919 15.4254 15.2096 22.96 12.556C26.3414 11.3694 29.8319 10.5217 33.3803 10.0254C36.2159 9.62724 39.0622 9.40914 41.9242 9.47771C48.3347 9.62014 54.6685 10.9071 60.6278 13.278C61.2463 13.5259 61.2455 13.5259 61.7 13.0162C65.4302 8.8402 69.161 4.6645 72.8923 0.489081C73.0292 0.337067 73.1677 0.186712 73.3376 0L75.8318 2.19923L64.5801 14.9601C70.7154 17.9368 76.2748 21.9801 80.9998 26.9023Z" fill="#FCFAEE"/>
                <Path d="M40.9412 50.0819C39.8359 50.0813 38.7414 50.2997 37.7207 50.7245C36.7 51.1493 35.7733 51.7721 34.9938 52.5571C34.2144 53.3421 33.5976 54.2737 33.179 55.2984C32.7604 56.3231 32.5483 57.4206 32.5548 58.5277C32.5543 59.634 32.7716 60.7296 33.1943 61.7517C33.617 62.7737 34.2368 63.7023 35.0183 64.4841C35.7997 65.2659 36.7274 65.8857 37.7483 66.3079C38.7692 66.7301 39.8631 66.9465 40.9676 66.9446C42.0723 66.9456 43.1663 66.7283 44.1869 66.305C45.2076 65.8818 46.1349 65.261 46.9156 64.4782C47.6963 63.6953 48.3152 62.7659 48.7367 61.7431C49.1583 60.7204 49.3742 59.6243 49.3721 58.5178C49.3776 57.4077 49.1632 56.3075 48.7413 55.2809C48.3195 54.2544 47.6985 53.3218 46.9144 52.5373C46.1303 51.7527 45.1986 51.1317 44.1733 50.7102C43.148 50.2888 42.0495 50.0752 40.9412 50.0819ZM40.9354 63.5979C38.1312 63.5805 35.8465 61.2722 35.8696 58.4856C35.8935 55.6675 38.2161 53.3749 41.0196 53.4014C43.7834 53.4262 46.0623 55.7328 46.0647 58.5079C46.0672 61.321 43.7554 63.6152 40.9354 63.5979Z" fill="#FCFAEE"/>
              </Svg>
              <Text style={{textTransform: 'uppercase', color: '#FCFAEE', fontSize: 20, fontWeight: '600'}}>Connection lost</Text>
            </View>
            <TouchableOpacity onPress={handleAppPress} activeOpacity={1} disabled={retryFade}>
              <Text style={{height: 50, fontSize: 14, color: '#FCFAEE', opacity: retryFade ? 0.5 : 1}}>Try again</Text>
            </TouchableOpacity>
          </View>
        }
      </GestureHandlerRootView>
    </View>
  )
  {/* <InputDialog content={dialogContent}></InputDialog> */}
}

export default App;
