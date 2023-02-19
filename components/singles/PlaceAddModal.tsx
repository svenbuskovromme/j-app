import { BottomSheetBackdrop, BottomSheetBackdropProps, BottomSheetModal, BottomSheetScrollView, TouchableOpacity } from "@gorhom/bottom-sheet"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { skipToken } from "@reduxjs/toolkit/dist/query"
import lists from "components/screens/lists"
import { PlaceGraphContext } from "components/screens/place/utils"
import ApiCheckbox from "components/shared/ApiCheckbox"
import CenteredLoader from "components/shared/CenteredLoader"
import Gap from "components/shared/Gap"
import Gradient from "components/shared/Gradient"
import { userListDetails } from "jungle-shared"
import React, { FC, forwardRef, ForwardRefRenderFunction, Fragment, useCallback, useContext, useEffect, useImperativeHandle, useRef, useState } from "react"
import { View, Text, useWindowDimensions } from "react-native"
import { color } from "react-native-reanimated"
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg"
import { usePutUserListPlaceMutation, useDeleteUserListPlaceMutation, useGetUserListsQuery } from "redux/api"
import { useAppDispatch, useAppSelector } from "redux/hooks"

const UserListView: FC<{list: userListDetails, placeId: number}> = ({list, placeId}) => {
    const [checked, setChecked] = useState(false);

    useEffect(() => {
        setChecked(list.places.findIndex(p => p.place.id === placeId) !== -1);
        console.log(list.places, list.id, placeId);
    }, [placeId, list.places]);

    useEffect(() => {
        console.log('checked', checked);
    }, [checked]);

    const [putListPlace] = usePutUserListPlaceMutation();
    const [deleteListPlace] = useDeleteUserListPlaceMutation();

    const handlePress = useCallback(async () => {
        if(checked)
            deleteListPlace({listPlace: {placeId, userListId: list.id}});
        else
            putListPlace({listPlace: {placeId, userListId: list.id}});

    }, [checked, placeId, list.id]);

    return <View style={{flexDirection: 'row', alignItems: 'center', marginVertical: 20, transform: [{scale: 1}]}}>
        <ApiCheckbox size={20} value={checked} labelComponent={
            <Text style={{color: '#ffffff', fontSize: 20, fontWeight: '600' }}>{list.name}</Text>
        } onChange={handlePress} labelFirst={false} />
        
    </View>
}

export type PlaceAddModalHandle = {
    addPlaceToLists(place: {id: number, name: string}): void
}

const PlaceAddModal: ForwardRefRenderFunction<PlaceAddModalHandle, {}> = ({}, ref) => {
    const dispatch = useAppDispatch();
    
    const [open, setOpen] = useState(false);

    const modalRef = useRef<BottomSheetModal>(null);

    const handleChange = useCallback((from: number, to: number) => {
        setOpen(to === 0);
    }, [setOpen]);

    const listsData = useGetUserListsQuery(open ? {} : skipToken);

    const handleAddDone = useCallback(() => {
        modalRef.current?.dismiss();
    }, [modalRef.current]);

    const [placeId, setPlaceId] = useState<number>();
    const [placeName, setPlaceName] = useState<string>();

    const addPlaceToLists = useCallback((place: {id: number, name: string}) => {
        modalRef.current?.present();
        setPlaceId(place.id);
        setPlaceName(place.name);
    }, [modalRef, setPlaceId, setPlaceName]);

    useImperativeHandle(ref, () => ({addPlaceToLists}), [ref, addPlaceToLists]);
    
    const addUpdateRef = useAppSelector(state => state.user.addUpdateListRef);
    const [putListPlace] = usePutUserListPlaceMutation();
    const handleAddNewList = useCallback(async () => {
        if(!placeId)
            return;

        const pk = await addUpdateRef?.put();
        if(pk){
            await putListPlace({listPlace: {userListId: pk, placeId}});
        }
    }, [addUpdateRef, placeId]);

    const renderBackdrop = useCallback(
        (props:BottomSheetBackdropProps) => (
          <BottomSheetBackdrop
            {...props}
            style={{position: 'absolute', backgroundColor: '#030303', height: '100%', width: '100%'}}
            opacity={0.5}
            appearsOnIndex={0}
            disappearsOnIndex={-1}
          />
        ), []
    );

    const bounds = useWindowDimensions();

    return <BottomSheetModal
        ref={modalRef}
        onAnimate={handleChange}
        snapPoints={['75%']}
        detached={false}
        backgroundStyle={{backgroundColor: '#242424'}}
        handleIndicatorStyle={{backgroundColor: '#727272'}}
        backdropComponent={renderBackdrop}
    >
        <View style={{flex: 1, width: '100%', height: '100%', justifyContent: 'flex-start', alignItems: 'flex-start'}}>
            <View style={{backgroundColor: '#242424',zIndex: 2, width: '100%', justifyContent: 'center', alignItems: 'center', height: 60, paddingBottom: 10}}>
                <Text style={{fontSize: 17, textAlign: 'center', fontWeight: '600', color: '#727272'}}>Add <Text style={{color: '#ffffff'}}>{placeName}</Text></Text>
                <Text style={{fontSize: 17, textAlign: 'center', fontWeight: '600', color: '#727272'}}>to a personal list</Text>
            </View>
            <View style={{height: 1, width: '100%', backgroundColor: '#727272'}} />
            {
                !!placeId && <Fragment>
                    { 
                        (listsData.isSuccess) ?
                        !!listsData.data.length ?
                            <BottomSheetScrollView style={{width: bounds.width, flex: 1, overflow: 'visible'}} showsVerticalScrollIndicator={false} contentContainerStyle={{padding: 30, paddingBottom: 60}} >
                                {
                                    listsData.data.map(list => <UserListView key={list.id} list={list} placeId={placeId} />) 
                                }
                            </BottomSheetScrollView> :
                            <View style={{width: '100%', flex: 1, justifyContent: 'center', alignItems:'center'}}>
                                <TouchableOpacity activeOpacity={0.75} onPress={handleAddNewList} style={{height: 50, borderRadius: 25, backgroundColor: '#ffffff', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20}}>
                                    <Text style={{color: '#242424', fontSize: 16, fontWeight: '600'}}>Create a list</Text>
                                </TouchableOpacity>        
                            </View> :
                        <CenteredLoader color={'white'} />
                    }
                    {
                        (listsData.isFetching || !!listsData.data?.length) &&
                    <View style={{position: 'absolute', height: 70, alignItems: 'center', bottom: 0, paddingHorizontal: 10, flexDirection: 'row', justifyContent: 'flex-end', width: '100%'}}>
                        <Svg height={'100%'} width={'100%'} style={[{position: 'absolute', bottom: 0}]} >
                            <Defs>
                                <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                                    <Stop offset="0" stopColor="#242424" stopOpacity="0" />
                                    <Stop offset="1" stopColor="#242424" stopOpacity="1" />
                                </LinearGradient>
                            </Defs>
                            <Rect x={0} y={0} width={'100%'} height={'100%'} fill={'url(#grad)'} />
                        </Svg>
                        <TouchableOpacity activeOpacity={0.75} onPress={handleAddNewList} style={{height: 50, backgroundColor: '#242424', justifyContent: 'center', borderWidth: 1, borderColor: '#ffffff', borderRadius: 30, paddingVertical: 10, paddingHorizontal: 15}}>
                            <Text style={{fontSize: 16, color: 'white'}}>Add to new list</Text>
                        </TouchableOpacity>
                        <Gap x={15} />
                        <TouchableOpacity activeOpacity={0.75} onPress={handleAddDone} style={{height: 50, backgroundColor: 'white',justifyContent: 'center', borderRadius: 30, paddingVertical: 10, paddingHorizontal: 15}}>
                            <Text style={{fontSize: 16, color: '#030303'}}>Done</Text>
                        </TouchableOpacity>
                    </View>
                    }
                </Fragment>
            }
        </View>
    </BottomSheetModal>
}

export default forwardRef(PlaceAddModal);