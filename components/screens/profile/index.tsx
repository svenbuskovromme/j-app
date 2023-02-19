import { BottomTabBarProps, BottomTabNavigationProp, BottomTabScreenProps, createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNavigationContainerRef, NavigationContainer, useFocusEffect, useNavigation } from "@react-navigation/native";
import TabBar from "components/shared/TabBar";
import UserAvatar from "components/shared/UserAvatar";
import { api, eventRow, userListDetails, userListRow, userRow } from "jungle-shared";
import React, { createContext, FC, Fragment, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { ActionSheetIOS, ActivityIndicator, Alert, Linking, ScrollView, Text, TextInput, TouchableOpacity, useWindowDimensions, View } from "react-native";
import { TapGestureHandler } from "react-native-gesture-handler";
import Reanimated, { FadeIn, FadeOut, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useDeleteUserListMutation, useDeleteUserListPlaceMutation, useGetUserEventsQuery, useGetUserListsQuery, usePutUserListMutation, usePutUserListPlaceMutation } from "redux/api";
import { useAppDispatch, useAppSelector } from "redux/hooks";
import { dateFields, RootNavContext, RootNavProps, RootScreenProps, RootStackParamList, source, tc } from "utils";
import { HeaderContext, UserContext } from "./contexts";
import ProfileEvents from "./events";
import ProfilePeople from "./people";
import ProfilePlaces from "./places";
import {
    BottomSheetModal,
    BottomSheetModalProvider,
    BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { MenuIcon } from "components/shared/MenuIcon";
import { useSafeAreaFrame, useSafeAreaInsets } from "react-native-safe-area-context";
import { getUserRow, logoutUser } from "redux/user";
import ProfilePicViewShot, { ProfilePicViewShotHandle } from "components/shared/ProfilePicViewShot";
import { ProfileNames } from "components/shared/ProfileNames";
import CheckBox from "@react-native-community/checkbox";
import { getApp, logAppActivity, setTabNavColors } from "redux/app";
import ApiCheckbox from "components/shared/ApiCheckbox";
import MenuModal from "components/shared/MenuModal";
import CenteredLoader from "components/shared/CenteredLoader";
import FastImage from "react-native-fast-image";
import ActiveImage from "components/shared/ActiveImage";
import Svg, { Defs, LinearGradient, Stop, Rect } from "react-native-svg";
import TextInputModal, { TextInputModalHandle } from "components/shared/TextInputModal";
import BookmarkIcon from "components/shared/BookmarkIcon";
import Gap from "components/shared/Gap";
import { BlurView, VibrancyView } from "@react-native-community/blur";
import { ValidationError } from "yup";
import Gradient from "components/shared/Gradient";
import HeaderView from "components/shared/HeaderView";
import GradientHeader from "components/shared/GradientHeader";

export type ProfileTabParamList = {
    'Places'?: undefined;
    'Events'?: undefined;
    'People'?: undefined;
};

const DisplayHeader: FC<userRow & {setEditEnabled: (enabled: boolean) => void}> = user => {
    const handleEdit = useCallback(() => {
        user.setEditEnabled(true);
    }, [user.setEditEnabled]);

    return <View style={{ flexDirection: 'row', width: '100%', alignItems: 'center'}}>
        <View style={{}}>
            <UserAvatar border={'transparent'} size={101} />
        </View>
        <View style={{margin: 30, flex: 1}}>
            <Text style={{color: 'white', fontWeight: '700', fontSize: 30}}>{user.firstName}{user.lastName ? ' ' + user.lastName : ''}</Text>
            <TouchableOpacity activeOpacity={0.75} onPress={handleEdit}>
                <Text style={{color: '#6b6b6b', fontWeight: '700', fontSize: 17}}>Edit profile</Text>
            </TouchableOpacity>
        </View>
    </View>};

const EditHeader: FC<userRow & {setEditEnabled: (enabled: boolean) => void}> = ({setEditEnabled, ...user}) => {
    const viewShotRef = useRef<ProfilePicViewShotHandle>(null);
    const [fn, setFn] = useState(user.firstName);
    const [ln, setLn] = useState(user.lastName);
    const [loading, setLoading] = useState(false);
    const dispatch = useAppDispatch();

    const editCancel = useCallback(() => {setEditEnabled(false)}, [setEditEnabled]);

    const editSave = useCallback(async (firstName: string, lastName: string) => {
        try{
            await viewShotRef.current?.save();
            await api.patch('user', {row: {firstName,lastName}});
            await dispatch(getUserRow());
            editCancel();
        }
        catch(e){
            console.log('save profile failed', e);
        }
    }, []);

    const handleSave = useCallback(async () => {
        setLoading(true);
        await editSave(fn, ln);
        setLoading(false);
    }, [fn, ln]);

    return <View style={{width: '100%', alignItems: 'center'}}>
        <View style={{}}>
            <ProfilePicViewShot ref={viewShotRef} />
        </View>
        <View style={{flexDirection: 'column', width: 200}}>
            <TextInput value={fn} onChangeText={setFn} placeholder={'First name'} placeholderTextColor={'#FFFFFF70'} style={{fontSize: 16, margin: 5,width: '100%', color: '#F6F5F1', borderColor: '#292929', borderBottomWidth: 1, borderStyle: 'solid', height: 37 }}/>
            <TextInput value={ln} onChangeText={setLn} placeholder={'Last name'} placeholderTextColor={'#FFFFFF70'} style={{fontSize: 16, margin: 5,width: '100%', color: '#F6F5F1', borderColor: '#292929', borderBottomWidth: 1, borderStyle: 'solid', height: 37 }}/>
        </View>
        <View style={{flexDirection: 'row', marginVertical: 20}}>
            <TouchableOpacity activeOpacity={0.75} disabled={loading} onPress={editCancel}><Text style={{borderWidth: 1, borderColor: 'white', fontSize: 18, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 18, height: 36, margin: 5, color:'white'}}>Cancel</Text></TouchableOpacity>
            <TouchableOpacity activeOpacity={0.75} disabled={loading} onPress={handleSave}><Text style={{borderWidth: 1, borderColor: 'white', fontSize: 18, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 18, height: 36, margin: 5, color:'white'}}>{loading ? 'Saving' : 'Save'}</Text></TouchableOpacity>
        </View>
    </View>
};

export type ProfileTabScreenProps<S extends keyof ProfileTabParamList> = BottomTabScreenProps<ProfileTabParamList, S>;

export type TabNavProps = BottomTabNavigationProp<ProfileTabParamList>;

const Tabs = createBottomTabNavigator<ProfileTabParamList>();

const Header: FC<{ text: string, size: '1' | '2'}> = ({text, size}) => {
    return <Text style={{paddingHorizontal: 10, color: 'white', fontWeight: '700', fontSize: size === '1' ? 35 : 25}}>{text}</Text>;
}

export const Profile: FC<RootScreenProps<'Profile'>> = navProps => {
    const tabBar = useCallback((props: BottomTabBarProps) => {
        return <TabBar {...props} backgroundColor={'#030303'} color={'white'} lineColor={"#ffffff20"} />
    }, []);
    const user = useAppSelector(state => state.user.user);
    const dispatch = useAppDispatch();
    useFocusEffect(() => {
        dispatch(setTabNavColors());
    });

    const [editEnabled, setEditEnabled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    const handleMenu = useCallback(() => {
        setMenuOpen(true);
    }, [dispatch]);

    const eventsData = useGetUserEventsQuery({filter: 'saved'});
    
    useEffect(() => {
        if(user){
            navProps.navigation.setOptions({
                headerStyle: {
                    backgroundColor: 'transparent'
                },
                headerTransparent: true,
                headerTitle: '',
                headerTintColor: 'white',
                headerRight: () => <TouchableOpacity activeOpacity={0.75} onPress={handleMenu}><MenuIcon color={'white'} /></TouchableOpacity>
            });
        }
    }, [user, navProps.navigation]);

    const handleEdit = useCallback(() => {
        setEditEnabled(true);
        setMenuOpen(false);
    }, [setEditEnabled]);

    const handleLogOut = useCallback(async () => {
        await dispatch(logoutUser()).unwrap();
        setMenuOpen(false);
        navProps.navigation.navigate('Search');
    }, [dispatch]);

    const handleDelete = useCallback(() => {
        handleLogOut();
    }, [handleLogOut]);

    const insets = useSafeAreaInsets();

    const footerHeight = useAppSelector(state => state.app.footerHeight);
    const handleMenuClose = useCallback(() => {setMenuOpen(false)}, [setMenuOpen]);

    const nameInputRef = useRef<TextInputModalHandle>(null);

    const [putList] = usePutUserListMutation();
    // const [putListPlace] = usePutUserListPlaceMutation();
    
    const [deleteListPlace] = useDeleteUserListPlaceMutation();
    const listsData = useGetUserListsQuery({});

    const addUpdateRef = useAppSelector(state => state.user.addUpdateListRef);

    const handleCreateList = useCallback(async () => {
        const pk = await addUpdateRef?.put();
        if(pk){
            dispatch(logAppActivity({type: 'userListOpen', data: {id: pk}}));
            navProps.navigation.push('UserList', {id: pk});
        }

        // if(user && nameInputRef.current){
        //     let pk = 0;
        //     while(!pk){
        //         const name = await nameInputRef.current.prompt();
        //         nameInputRef.current.setLoading(true);
        //         const res = await putList({list: {name} as userListRow}).unwrap();
        //         nameInputRef.current.setLoading(false);
        //         pk = res.pk;

        //         if(res.errors?.length){
        //             res.errors.forEach(e => {
        //                 const error = e as ValidationError;
        //                 if(error.path === 'name' && error.type === 'required'){
        //                     Alert.alert('Your new list needs a name');
        //                 }
        //             });
        //         }
        //     }

        //     
        //     nameInputRef.current?.close();
        // }
    }, [user, addUpdateRef]);

    const handleSavedPress = useCallback(() => {
        navProps.navigation.push('Saved');
        dispatch(logAppActivity({type: 'userInboxOpen'}));
    }, [navProps.navigation]);

    return <HeaderView style={{flex: 1, backgroundColor: '#030303', paddingTop: insets.top}}>
        <GradientHeader />
        <ScrollView style={{ overflow: 'visible', flex: 1}} showsVerticalScrollIndicator={false} contentContainerStyle={{paddingHorizontal: 5, paddingVertical: 50}}>
            <RootNavContext.Provider value={navProps}>
            {
                !!user ?
                    editEnabled ? 
                    <EditHeader {...user} setEditEnabled={setEditEnabled} />:
                <UserContext.Provider value={user}>
                    <DisplayHeader {...user} setEditEnabled={setEditEnabled} />
                    <Gap y={25} />
                    <Header size={'1'} text={'Events & Products'} />
                    <Gap y={20} />
                    <TouchableOpacity activeOpacity={0.75} onPress={handleSavedPress} style={{height: 85, backgroundColor: '#242424', borderRadius: 25, overflow: 'hidden'}}>
                        <ActiveImage style={{position: 'absolute', width: '100%', height: '100%'}} source={{uri: source.content.image((eventsData?.data && eventsData.data[0] && eventsData.data[0].contentPoster) ? eventsData.data[0].contentPoster.id : 0, 640, true)}} />
                        <BlurView blurType={'dark'} style={{position:'absolute', width: '100%', height:'100%'}} />
                        <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'flex-start', width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0)'}}>
                            <View style={{marginLeft: 20, borderRadius: 25, height: 40, aspectRatio: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'white'}}>
                                <BookmarkIcon size={20} />
                            </View>
                            <Gap x={15} />
                            <Text style={{fontSize: 40, fontWeight: '700', color: 'white'}}>Saved</Text>
                        </View>
                    </TouchableOpacity>
                    <Gap y={40} />
                    <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                        <Header size={'1'} text={'Places'} />
                        <TouchableOpacity activeOpacity={0.75} onPress={handleCreateList} style={{ backgroundColor: '#242424', alignSelf: 'flex-start', margin: 5, borderRadius: 20, paddingHorizontal: 15, paddingVertical: 10}}>
                            <Text style={{color: 'white', fontWeight: '600', fontSize: 16}}>+ Create new list</Text>
                        </TouchableOpacity>
                    </View>
                    <Gap y={20} />
                    <View>
                        {
                            listsData.isLoading ? <CenteredLoader color={'white'} /> :
                            listsData.isSuccess ? listsData.data.map(l => <UserListView key={l.id} list={l} />) : null
                        }
                    </View>
                </UserContext.Provider> :
                null
            }
            
            </RootNavContext.Provider>
        </ScrollView>
        <BottomSheetModalProvider>
            <MenuModal open={menuOpen} onDelete={handleDelete} onClose={handleMenuClose} onEdit={handleEdit} onLogout={handleLogOut} />
        </BottomSheetModalProvider>
    </HeaderView>;
}

const UserListCard: FC<PropsWithChildren<{onPress: () => void}>> = ({children, onPress}) => {
    return <TouchableOpacity activeOpacity={0.75} onPress={onPress} style={{width: 290/2, height: 330/2, justifyContent: 'center', alignItems: 'center', margin: 5, backgroundColor: '#242424', borderRadius: 15, overflow: 'hidden'}} >
        {children}
    </TouchableOpacity>
}

const UserListPlaceView: FC<{place: userListDetails['places'][number]}> = ({place}) => {
    const navProps = useContext(RootNavContext);
    const handlePress = useCallback(() => {
        navProps.navigation.push('Place', {id: place.place.id});
    }, [place.place.id, navProps]);

    return <UserListCard onPress={handlePress}>
        <ActiveImage style={{width: '100%', height: '100%'}} source={{uri: source.content.image(place.content, 200)}} />
        <Gradient direction="down" height="30%" opacity="0.8" />
        <Text numberOfLines={1} style={{zIndex: 2, bottom: 5, left: 5, fontSize: 12, color: 'white', fontWeight: '700', position: 'absolute'}}>{place.place.name}</Text>
    </UserListCard>
}

const UserListView: FC<{list: userListDetails}> = ({list}) => {
    const navProps = useContext(RootNavContext);
    const dispatch = useAppDispatch();

    const handleListTap = useCallback(async () => {
        navProps.navigation.push('UserList', {id: list.id});
        dispatch(logAppActivity({type: 'userListOpen', data: {id: list.id}}));
    }, [list.id]);

    const [slicedPlaces, setSlicedPlaces] = useState<userListDetails['places']>([]);
    const [hasMore, setHasMore] = useState(0);

    useEffect(() => {
        setSlicedPlaces(list.places.slice(0,3)); 
        setHasMore(Math.max(list.places.length - 3, 0));
    }, [list.places]);

    return <View style={{marginBottom: 30}}>
        <View style={{width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10}}>
            <TouchableOpacity activeOpacity={0.75} onPress={handleListTap}>
                <Text style={{fontWeight: '700', fontSize: 16, color: 'white'}}>{list.name}</Text>
            </TouchableOpacity>
        </View>
        <Gap y={15} />
        {
            !!slicedPlaces.length ?
            <ScrollView style={{flexDirection: 'row', margin: -5}} horizontal={true} showsHorizontalScrollIndicator={false}>
                {slicedPlaces.map(listPlace => <UserListPlaceView key={listPlace.place.id} place={listPlace} />)}
                {!!hasMore && <UserListCard onPress={handleListTap}>
                    <Text style={{color: 'white', fontWeight: '700'}}>More</Text>
                </UserListCard>}
            </ScrollView> :
            <View style={{flexDirection: 'row', paddingHorizontal: 10}}>
                <Text style={{color: '#4f4f4f'}}>This list is empty</Text>
                {/* <TouchableOpacity activeOpacity={0.75}><Text style={{color: 'white'}}>Search</Text></TouchableOpacity> */}
            </View>
        }
    </View>
}

export default Profile;