import { BottomSheetBackdrop, BottomSheetBackdropProps, BottomSheetFlatList, BottomSheetModal } from "@gorhom/bottom-sheet"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import React, { FC, useCallback, useRef } from "react"
import { FlatList, ListRenderItem, Modal, Pressable, Text, TouchableOpacity, View } from "react-native"
import { useAppDispatch, useAppSelector, useLocationNodeId } from "redux/hooks"
import { setLocationModalVisible, setModalRef, setSelectedLocationNode } from "redux/locationNodes"
import { locationNodeGraph } from "jungle-shared"
import CheckBox from "@react-native-community/checkbox"
import { BlurView } from "@react-native-community/blur"
import Gap from "components/shared/Gap"
import Reanimated, { FadeIn, FadeOut } from 'react-native-reanimated';

export const LocationNodeView: FC<{locationNodeGraph: locationNodeGraph}> = ({locationNodeGraph}) => {
    const modalRef = useAppSelector(state => state.locationNodes.modalRef);
    const dispatch = useAppDispatch();
    const handlePress = useCallback(() => {
        dispatch(setSelectedLocationNode(locationNodeGraph.locationNode.id));
        modalRef?.dismiss();
    }, [locationNodeGraph.locationNode, modalRef]);
    const locationNodeId = useLocationNodeId();

    return <TouchableOpacity activeOpacity={0.75} style={{borderTopColor: '#FFFFFF30', borderTopWidth: 0, height: 50, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center'}} onPress={handlePress} >
        <CheckBox style={{height: 15, transform: [{scale: 1}]}} value={locationNodeGraph.locationNode.id === locationNodeId} />
        <Text style={{color: 'white', fontSize: 20, textTransform: 'capitalize'}}>{locationNodeGraph.locationNode.name}</Text>
    </TouchableOpacity>;
}

export const LocationsModal: FC = () => {
    const dispatch = useAppDispatch();
    const setRef = useCallback((el: BottomSheetModalMethods) => {
        dispatch(setModalRef(el));
    }, []);
    const visible = useAppSelector(state => state.locationNodes.visible);
    const setVisible = useCallback((v: boolean) => {
        dispatch(setLocationModalVisible(v));
    }, [dispatch, visible]);
    const close = useCallback(() => {setVisible(false)}, [setVisible]);
    const open = useCallback(() => {setVisible(true)}, [setVisible]);

    const locationNodes = useAppSelector(state => state.locationNodes.availableNodes);
    const keyExtractor: (item: locationNodeGraph) => string = useCallback((item) => item.locationNode.id.toString(), [])
    const renderItem: ListRenderItem<locationNodeGraph> = useCallback(({item: lng}) => <LocationNodeView locationNodeGraph={lng} />, []);
    const getItemLayout = useCallback((data: any, index: number) => ({length: 50, offset: index * 50,index}), []);

    // return <Modal
    //     visible={visible}
    //     transparent={true}
    //     onRequestClose={close}
    //     animationType={'slide'}
    // >
    //     <View style={{justifyContent: 'center', alignItems: 'center', flex: 1, width: '100%'}}>
    //         <Pressable onPress={close} style={{position: 'absolute', width: '100%', height: '100%'}}>
    //             <BlurView blurAmount={1} blurRadius={1} style={{height: '100%', width: '100%'}} />
    //         </Pressable>
    //         <View pointerEvents={'box-none'} style={{width: '100%', padding: 30, justifyContent: 'center', alignItems: 'center'}}>
    //             <View style={{width: '100%', height: locationNodes.length * 50, maxHeight: 700, borderRadius: 25, overflow: 'hidden', backgroundColor: '#030303'}}>
    //                 {/* {locationNodes.map(lng => <LocationNodeView key={keyExtractor(lng)} locationNodeGraph={lng} />)} */}
    //                 <FlatList 
    //                     centerContent={true}
    //                     style={{flex: 1}}
    //                     data={locationNodes}
    //                     renderItem={renderItem}
    //                     keyExtractor={keyExtractor}
    //                     getItemLayout={getItemLayout}
    //                     ItemSeparatorComponent={() => <View  style={{width: '100%', height: 1, backgroundColor: '#242424'}}/>}
    //                 />
    //             </View>
    //         </View>
    //     </View>
    // </Modal>

    return <BottomSheetModal 
        snapPoints={['75%']}
        detached={true}
        ref={setRef}
        index={0}
        handleIndicatorStyle={{backgroundColor: 'white'}}
        style={{}}
        backgroundStyle={{ backgroundColor: '#030303', borderRadius: 25}}
        backdropComponent={Backdrop}
    >
        <View style={{flex: 1, width: '100%'}}>
            <BottomSheetFlatList 
                data={locationNodes}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                getItemLayout={getItemLayout}
            />
        </View>
    </BottomSheetModal>
}

const Backdrop: FC<BottomSheetBackdropProps> = props => {
    const ref = useAppSelector(state => state.locationNodes.modalRef);
    const press = useCallback(() => {ref?.dismiss()}, [ref]);

    return <BottomSheetBackdrop 
        {...props}
        opacity={0.7}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        style={{flex: 1, backgroundColor: '#242424'}} 
        />
}