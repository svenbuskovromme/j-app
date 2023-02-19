import { BottomSheetBackdrop, BottomSheetBackdropProps, BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import React, { FC, forwardRef, ForwardRefRenderFunction, useCallback, useImperativeHandle, useRef, useState } from "react";
import { Modal, StatusBar, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Video from "react-native-video";
import Reanimated, { FadeIn, FadeOut, runOnJS, useAnimatedStyle, useDerivedValue, useSharedValue, withTiming } from 'react-native-reanimated';
import { TouchableOpacity } from "react-native-gesture-handler";
import CenteredLoader from "components/shared/CenteredLoader";


export type VideoModalHandle = {
    open(src: string): void
}

const VideoModal: ForwardRefRenderFunction<VideoModalHandle, {}> = (props, ref) => {
    const renderBackdrop = useCallback(
        (props:BottomSheetBackdropProps) => (
          <BottomSheetBackdrop
            {...props}
            style={{position: 'absolute', top: 0, backgroundColor: '#030303', height: '100%', width: '100%'}}
            opacity={0.5}
            appearsOnIndex={0}
            disappearsOnIndex={-1}
          />
        ), []
    );

    const modalRef = useRef<BottomSheetModal>(null);

    

    const open = useCallback((src: string) => {
        modalRef.current?.present();
        setSrc(src);
        setVisible(true);
    }, [modalRef.current]);

    useImperativeHandle(ref, () => ({open}), [ref]);

    const insets = useSafeAreaInsets();
    const [src, setSrc] = useState('');
    const [ready, setReady] = useState(true);
    const [visible, setVisible] = useState(false);

    
    // return <Modal 
    // transparent={false}
    // animationType={'slide'}
    // style={{backgroundColor: 'black'}}
    // onRequestClose={() => {console.log('request close'); setVisible(false)}}
    // onDismiss={() => {console.log('dismiss'); setVisible(false)}}
    // visible={visible}
    // > 
    // <View>
    //     <StatusBar hidden={true} />
    //     {/* <TouchableOpacity onPress={() => setVisible(false)} style={{top: 20, zIndex: 20, left: 20}}>
    //         <Text style={{color: 'black'}}>Close</Text>
    //     </TouchableOpacity> */}
    //     {!!src &&
    //             <Video 
    //             muted={false}
    //             controls={true}
    //             fullscreen={true}
    //             paused={false}
    //             source={{uri: src}} style={{backgroundColor: 'black', width: '100%', height: '100%'}} resizeMode={'contain'} />
    //         }
    // </View>
    // </Modal>

    const animatedIndex = useSharedValue(-1);

    useDerivedValue(() => {
        if(animatedIndex.value === 0){
            runOnJS(setReady)(true);
        }
    }, [animatedIndex.value]);

    const wrapUas = useAnimatedStyle(() => ({
        opacity: withTiming(animatedIndex.value === 0 ? 1 : 0)
    }), [animatedIndex]);

    return <BottomSheetModal
        snapPoints={['100%']}
        backdropComponent={renderBackdrop}
        ref={modalRef}
        backgroundStyle={{backgroundColor: '#000'}}
        handleIndicatorStyle={{backgroundColor: '#727272'}}
        handleStyle={{display: 'none'}}
        enableDismissOnClose={true}
        detached={true}
        onDismiss={() => setSrc('')}
        animatedIndex={animatedIndex}
    >
        <SafeAreaView style={{flex: 1, width: '100%'}}>
            <StatusBar hidden={true} />
            <CenteredLoader style={{position: 'absolute', zIndex: 1}} />
            {
                <Reanimated.View style={[{width:'100%', height:'100%', zIndex: 2}, wrapUas]}>
                    {
                        !!src &&
                        <Video 
                        muted={false}
                        controls={true}
                        source={{uri: src}} style={{width: '100%', height: '100%'}} resizeMode={'contain'} />
                    }
                </Reanimated.View>
            }
        </SafeAreaView>
    </BottomSheetModal>
}

export default forwardRef(VideoModal);