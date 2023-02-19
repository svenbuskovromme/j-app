import BottomSheet, { BottomSheetBackdrop, BottomSheetBackdropProps, BottomSheetModal, BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import ActiveImage from "components/shared/ActiveImage";
import CenteredLoader from "components/shared/CenteredLoader";
import CloseIcon from "components/shared/CloseIcon";
import TextInputModal, { TextInputModalHandle } from "components/shared/TextInputModal";
import { place, userListPlaceRow, userListRow } from "jungle-shared";
import React, { Context, FC, Fragment, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import { Alert, ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";
import FastImage from "react-native-fast-image";
import Reanimated, { FadeOut, Layout } from "react-native-reanimated";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import { useDeleteUserListMutation, useDeleteUserListPlaceMutation, useGetSharedUserListQuery, useGetUserListByQuery, usePutUserListMutation } from "redux/api";
import { RootNavContext, RootScreenProps, source, useRouteId } from "utils"
import { userListDetails } from "jungle-shared";
import { useHeaderHeight } from '@react-navigation/elements';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import GradientHeader from "components/shared/GradientHeader";
import { MenuIcon } from "components/shared/MenuIcon";
import { IUserListContext, UserListCTX } from "./contexts";
import Gap from "components/shared/Gap";
import CheckBox from "@react-native-community/checkbox";
import ShareIcon from "components/shared/ShareIcon";
import ShareButton from "components/shared/ShareButton";
import { useAppDispatch } from "redux/hooks";
import { logAppActivity } from "redux/app";

const UserListPlaceView: FC<{userListId: number, place: userListDetails['places'][number]}> = ({userListId, place}) => {
    const context = useContext(UserListCTX);
    const navProps = useContext(RootNavContext as Context<RootScreenProps<'UserList'>>);
    const [selected, setSelected] = useState(false);
    const dispatch = useAppDispatch();
    const handlePress = useCallback(() => {
        context.selecting ?
        setSelected(!selected) :
        navProps.navigation.push('Place', {id: place.place.id});
        dispatch(logAppActivity({type: 'placeOpen', data: {placeId: place.place.id, fromUserList: navProps.route.params}}));
    }, [navProps, place.place.id, context.selecting, selected, setSelected]);

    // const [deletePrompt, setDeletePrompt] = useState(false); 

    // const toggleDeletePrompt = useCallback(() => {
    //     setDeletePrompt(!deletePrompt);
    // }, [setDeletePrompt, deletePrompt]);

    // const handleDeletePressConfirm = useCallback(async () => {
    //     await deleteListPlace({listPlace: {userListId: userListId, placeId: place.place.id, }}).unwrap();
    // }, [deleteListPlace, place.place.id, userListId]);

    useEffect(() => {
        if(context.selecting)
            context.toggleToUnsave({userListId, placeId: place.place.id}, selected);
        else{
            setSelected(false);
        }
    }, [selected, context.selecting, context.toggleToUnsave, userListId, place.place.id]);
    
    return (
        <TouchableOpacity activeOpacity={0.75} onPress={handlePress} style={{width: '100%', height: '100%'}} >
            <View style={{width: '100%', height: '100%', backgroundColor: '#242424', borderRadius: 25, overflow: 'hidden'}}>
                <ActiveImage source={{uri: source.content.image(place.content, 640)}} style={{width: '100%', height: '100%'}} />
                <Svg height="100%" width="100%" style={{position: 'absolute', zIndex: 1}}>
                    <Defs>
                        <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                        <Stop offset="0.6" stopColor="#030303" stopOpacity="0" />
                        <Stop offset="1" stopColor="transparent" stopOpacity="0.8" />
                        </LinearGradient>
                    </Defs>
                    <Rect x={0} y={0} width={'100%'} height={'100%'} fill={'url(#grad)'} />
                </Svg>
            </View>
            <Reanimated.View layout={Layout.springify().damping(20).overshootClamping(100)} style={{ position: 'absolute', right: 10, top: 10, backgroundColor: '#242424'}}>
                {
                    context.selecting &&
                    <CheckBox boxType={'square'} value={selected} pointerEvents={'none'}/>
                }
            </Reanimated.View>
            <View style={{position: 'absolute', bottom: 15, left: 15}}>
                <Text style={{color: 'white', fontWeight: '700', fontSize: 14}}>{place.place.name}</Text>
            </View>
        </TouchableOpacity>)
}

const UserListView: FC<{shared:boolean, list: userListDetails}> = ({list, shared}) => {
    const modalRef = useRef<TextInputModalHandle>(null);
    const navProps = useContext(RootNavContext);

    const [putList] = usePutUserListMutation();
    const [deleteList] = useDeleteUserListMutation();

    const handleSettingsRename = useCallback(async () => {
        Alert.prompt(`Rename list`, undefined, [{text: 'Save', style: 'default', async onPress(name){
            if(name)
                await putList({list: {id: list.id, name} as userListRow}).unwrap();
        }}, {text: 'Cancel', style: 'cancel'}], 'plain-text', list.name);
    }, [modalRef.current, list.id, list.name]);

    const settingsRef = useRef<BottomSheetModal>(null);
    const showSettings = useCallback(() => settingsRef.current?.present(), [settingsRef.current]);
    const hideSettings = useCallback(() => settingsRef.current?.dismiss(), [settingsRef.current]);

    const [selecting, setSelecting] = useState(false);
    const header = useCallback(() => {
        const handler = selecting ? () => {
            setSelecting(false);
        } : showSettings;

        return <View style={{flexDirection: 'row'}}>
            <ShareButton color={'white'} id={list.id} message={`Personal list - ${list.name}`} type={'userList'} url={`https://jungle.link/ulist/${list.shareId}`} />
            {
                !shared && 
                <Fragment>
                    <Gap x={20} />
                    <TouchableOpacity activeOpacity={0.75} onPress={handler}>
                        {
                            selecting ?
                            <Text style={{color: 'white', fontWeight: '600'}}>Done</Text> :
                            <MenuIcon color={'white'} />
                        }
                    </TouchableOpacity>
                </Fragment>
            }
        </View>
    }, [showSettings, setSelecting, selecting, shared, list]);

    const handleSettingsSelect = useCallback(async () => {
        setSelecting(true);
        hideSettings();
    }, [setSelecting, hideSettings]);
    
    const handleSettingsDelete = useCallback(async () => {
        Alert.alert(`Delete list '${list.name}'`, 'Are you sure?', [{text: 'Yes', style: 'destructive', async onPress(){
            await deleteList({id: list.id}).unwrap();
            navProps.navigation.goBack();
        }}, {text: 'No', style: 'cancel'}], {cancelable: true, userInterfaceStyle: 'dark'});
    }, [list]);

    useEffect(() => {
        navProps.navigation.setOptions({
            headerRight: header
        });
    }, [header]);

    const backdrop = useCallback((props: BottomSheetBackdropProps) => {
        return <BottomSheetBackdrop 
            {...props}
            opacity={0.5}
            appearsOnIndex={0}
            disappearsOnIndex={-1}
            style={{backgroundColor: '#030303', flex: 1}}
        />
    }, []);

    const [toUnsave, setToUnsave] = useState<userListPlaceRow[]>([]);

    const toggleToUnsave = useCallback((row: userListPlaceRow, selected: boolean) => {
        const index = toUnsave.findIndex(o => o.placeId === row.placeId && o.userListId === row.userListId);
        if(selected && index === -1)
            setToUnsave([...toUnsave, row]);
        else if(!selected && index !== -1){
            const arr = toUnsave.slice();
            arr.splice(index, 1);
            setToUnsave(arr);
        }
    }, [toUnsave, setToUnsave]);

    const [context, setContext] = useState<IUserListContext>({selecting, toggleToUnsave});

    useEffect(() => {setContext({selecting, toggleToUnsave})}, [setContext, selecting, toggleToUnsave]);

    const [deleteListPlace] = useDeleteUserListPlaceMutation();

    const handleSettingsUnsave = useCallback(async () => {
        Alert.alert(`Unsave ${toUnsave.length} item(s) from ${list.name}`, 'Are you sure?', [{text: 'Yes', style: 'destructive', async onPress(){
            const promises: Promise<void>[] = [];
            for(let i = 0; i < toUnsave.length; i++){
                const listPlace = toUnsave[i];
                promises.push(deleteListPlace({listPlace}).unwrap());
            }

            await Promise.all(promises);

            setToUnsave([]);
        }}, {text: 'No', style: 'cancel'}], {cancelable: true, userInterfaceStyle: 'dark'});
    }, [toUnsave, list.name]);

    const handleAddPlaces = useCallback(() => {
        navProps.navigation.navigate('Search');
    }, [navProps]);

    return (
        <BottomSheetModalProvider>
        <View style={{flex: 1}}>
            {/* <Reanimated.View layout={Layout.springify().damping(20).overshootClamping(100)} style={{flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center'}}>
                <TouchableOpacity activeOpacity={0.75} hitSlop={{top: 20, bottom: 20, left: 20, right: 20}} style={{paddingHorizontal: 10, backgroundColor: '#242424', height: 25, borderRadius: 20, justifyContent: 'center', padding: 0}} onPress={handleNamePress}><Text style={{color: 'white'}}>Rename</Text></TouchableOpacity>
                <Reanimated.View layout={Layout.springify().overshootClamping(100)} style={{paddingHorizontal: 10, backgroundColor: '#242424', alignItems: 'center', flexDirection: 'row', height: 25, borderRadius: 20, overflow: 'hidden'}}>
                    <TouchableOpacity activeOpacity={0.75} hitSlop={{top: 20, bottom: 20, left: 20, right: 20}} onPress={toggleDeletePrompt} style={{backgroundColor: '#242424', borderRadius: 25, padding: 0}}>
                        <Text style={{color: 'white'}}>{deletePrompt ? 'Cancel' : 'Delete'}</Text>
                    </TouchableOpacity>
                    {
                        deletePrompt && <TouchableOpacity activeOpacity={0.75} onPress={handleDeletePressConfirm} style={{marginLeft: 10}}>
                            <Text style={{color: '#ffffff', fontWeight: '700'}}>Confirm</Text>
                        </TouchableOpacity> 
                    }
                </Reanimated.View>
            </Reanimated.View> */}
            <UserListCTX.Provider value={context}>
                <ScrollView style={{overflow: 'visible', flex: 1}} showsVerticalScrollIndicator={false} contentContainerStyle={{flexDirection: 'row', flexWrap: 'wrap'}}>
                    {!list.places.length &&
                    <View style={{alignItems: 'center', width: '100%', height: '100%', justifyContent: 'center'}}>
                        <Gap y={50} />
                        <Text style={{fontWeight: '600', fontSize: 20, color: '#ffffff'}}>This list is empty</Text>
                        {
                            !shared && 
                            <Fragment>
                                <Gap y={50} />
                                <TouchableOpacity activeOpacity={0.75} onPress={handleAddPlaces} style={{backgroundColor: '#007aff', borderRadius: 25, padding: 10, paddingHorizontal: 15}}><Text style={{fontWeight: '600', fontSize: 20,  color: 'white'}}>Lets add some places</Text></TouchableOpacity>
                            </Fragment>
                        }
                    </View>
                    }
                    {list.places.map(p => <Reanimated.View key={p.place.id} exiting={FadeOut}style={{width: '50%', padding: 2, aspectRatio: 1}}>
                        <UserListPlaceView userListId={list.id} place={p} />
                    </Reanimated.View>
                    )}
                </ScrollView>
                {
                    (selecting && !!toUnsave.length) && 
                    <View style={{padding: 30, alignItems: 'center', backgroundColor: '#030303'}}>
                        <TouchableOpacity activeOpacity={0.75} style={{backgroundColor: '#242424', borderRadius: 25, paddingVertical: 10, paddingHorizontal: 15, alignItems: 'center', width: 200}} onPress={handleSettingsUnsave}><Text style={{fontSize: 20, fontWeight: '600', color: 'white'}}>Unsave</Text></TouchableOpacity>
                    </View>
                }
            </UserListCTX.Provider>
            
            <BottomSheetModal
            ref={settingsRef}
            snapPoints={['75%']}
            index={0}
            handleIndicatorStyle={{backgroundColor: '#ffffff'}}
            backgroundStyle={{backgroundColor: '#030303'}}
            backdropComponent={backdrop}
            >
                <View style={{flex: 1, padding: 30, alignItems: 'center'}}>
                    <TouchableOpacity activeOpacity={0.75} style={{backgroundColor: '#242424', borderRadius: 25, paddingVertical: 10, paddingHorizontal: 15, alignItems: 'center', width: 200}} onPress={handleSettingsSelect}><Text style={{fontSize: 20, fontWeight: '600', color: 'white'}}>Select places</Text></TouchableOpacity>
                    <Gap y={20} />
                    <TouchableOpacity activeOpacity={0.75} style={{backgroundColor: '#242424', borderRadius: 25, paddingVertical: 10, paddingHorizontal: 15, alignItems: 'center', width: 200}} onPress={handleSettingsRename}><Text style={{fontSize: 20, fontWeight: '600', color: 'white'}}>Rename list</Text></TouchableOpacity>
                    <Gap y={20} />
                    <TouchableOpacity activeOpacity={0.75} style={{backgroundColor: '#242424', borderRadius: 25, paddingVertical: 10, paddingHorizontal: 15, alignItems: 'center', width: 200}} onPress={handleSettingsDelete}><Text style={{fontSize: 20, fontWeight: '600', color: 'white'}}>Delete list</Text></TouchableOpacity>
                </View>
            </BottomSheetModal>
        </View>
        </BottomSheetModalProvider>
    );
}

const UserListScreen: FC<RootScreenProps<'UserList'>> = props => {
    const id = useRouteId(props.route);
    const shareId = props.route.params.shareId;

    const userListData = useGetUserListByQuery(id ? {id} : skipToken);
    const sharedUserListData = useGetSharedUserListQuery(shareId ? {shareId} : skipToken);

    const headerHeight = useHeaderHeight();
    const insets = useSafeAreaInsets();

    const [foundList, setFoundList] = useState(false);
    const [isError, setIsError] = useState(false);
    const [list, setList] = useState<userListDetails>();
    const [shared, setShared] = useState(false);

    useEffect(() => {
        setShared(!id && !!shareId);
    }, [id, shareId]);

    useEffect(() => {
        const foundList = 
            (userListData.isSuccess && !!userListData.data) || 
            (sharedUserListData.isSuccess && !!sharedUserListData.data);

        if(foundList){
            setFoundList(true);
            setList(userListData.data ?? sharedUserListData.data);
        }

        const isError = (userListData.isError || (userListData.isSuccess && !userListData.data)) ||
            (sharedUserListData.isError || (sharedUserListData.isSuccess && !sharedUserListData.data));

        setIsError(isError);
    }, [userListData, sharedUserListData]);

    useEffect(() => {
        if(list){
            props.navigation.setOptions({
                headerTitle: list.name,
                headerShown: true,
                headerTransparent: true,
                headerStyle: {backgroundColor: 'transparent'}
            });
        }
        else{
            props.navigation.setOptions({
                headerShown: false,
                headerTransparent: true,
                headerStyle: {backgroundColor: 'transparent'}
            });
        }

        
    }, [list]);

    return (
        <RootNavContext.Provider value={props}>
            <View style={{flex: 1, backgroundColor: '#030303', paddingTop: headerHeight}}>
                <GradientHeader />
                <StatusBar barStyle={"light-content"} />
                {
                    isError ? 
                    <View style={{alignItems: 'center', justifyContent: 'center', flex: 1}}>
                        <TouchableOpacity activeOpacity={0.75} onPress={() => props.navigation.canGoBack() ? props.navigation.goBack() : props.navigation.navigate('Home')}>
                            <Text style={{color: 'white'}}>List not found, return to home</Text>
                        </TouchableOpacity>
                    </View> :
                    !!list ? <UserListView list={list} shared={shared} /> :
                    <Reanimated.View exiting={FadeOut}>
                        <CenteredLoader color={'white'} style={{position: 'absolute'}} />
                    </Reanimated.View>
                }
            </View>
        </RootNavContext.Provider>
    )
}

export default UserListScreen;