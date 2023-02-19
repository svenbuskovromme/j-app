import { BottomSheetBackdrop, BottomSheetBackdropProps, BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet"
import { PlaceGraphContext } from "components/screens/place/utils"
import Gap from "components/shared/Gap"
import Icons from "components/shared/Icons"
import React, { FC, forwardRef, ForwardRefRenderFunction, ReactNode, useCallback, useContext, useEffect, useImperativeHandle, useRef, useState } from "react"
import { Linking, ScrollView, Text, TouchableOpacity, useWindowDimensions, View } from "react-native"
import { logAppActivity } from "redux/app"
import { useAppDispatch, useAppSelector } from "redux/hooks"
import { locationRow } from "jungle-shared"

const LocationView: FC<{location: locationRow}> = ({location}) => {
    const dispatch = useAppDispatch();

    const handleLocationPress = useCallback(() => {
        Linking.openURL(location.googlePlaceUrl);

        dispatch(logAppActivity({type: 'locationOpen', data: {locationId: location.id, fromPlaceId: 1}}));
    }, [location]);

    return <TouchableOpacity activeOpacity={0.25} onPress={handleLocationPress} style={{ flex: 1, marginVertical: 15, flexDirection: 'row', alignItems: 'center', marginHorizontal: 7.5, borderRadius: 25, paddingHorizontal: 15}}>
        {/* <Icons.LocationPin size={25} />
        <Gap x={10} /> */}
        <View style={{flex: 1}}>
            <Text style={{ width: '100%', color: '#e0e0e0', fontSize: 15, fontWeight: '500', textTransform: 'capitalize' }}>{location.address}</Text>
        </View>
        <Gap x={30} />
        <View style={{backgroundColor: 'white', height: 40, width: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center'}}>
            <Icons.Google size={1.2} />
        </View>
    </TouchableOpacity>;
}

export type PlaceLocationsModalHandle = {
    open: (locations: locationRow[]) => void
}

const PlaceLocationsModal: ForwardRefRenderFunction<PlaceLocationsModalHandle> = ({}, ref) => {
    const [locations, setLocations] = useState<locationRow[]>([]);

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

    const modalRef = useRef<BottomSheetModal>(null);

    const open = useCallback((locations: locationRow[]) => {
        modalRef.current?.present();
        setLocations(locations);
    }, [modalRef, setLocations]);

    useImperativeHandle(ref, () => ({
        open,
    }), [open]);
    const bounds = useWindowDimensions();

    return <BottomSheetModal
        ref={modalRef}
        snapPoints={['50%']}
        detached={false}
        backgroundStyle={{backgroundColor: '#242424'}}
        handleIndicatorStyle={{backgroundColor: '#727272'}}
        backdropComponent={renderBackdrop}
    >
        <View style={{flex: 1, width: '100%', justifyContent: 'flex-start', alignItems: 'flex-start'}}>
            <BottomSheetScrollView style={{ width: bounds.width, flex: 1, overflow: 'visible'}} showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 30}} >
                {
                    locations.map(location => <LocationView key={location.id} location={location} />) 
                }
            </BottomSheetScrollView>
        </View>
    </BottomSheetModal>
}

export default forwardRef(PlaceLocationsModal);