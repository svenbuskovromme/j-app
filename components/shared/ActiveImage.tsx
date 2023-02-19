import React, { FC, useState, useCallback } from "react";
import { ActivityIndicator, Image, ImageErrorEventData, ImageLoadEventData, ImageProps, NativeSyntheticEvent, View } from "react-native";
import FastImage, { FastImageProps, OnLoadEvent } from "react-native-fast-image"
import Reanimated, { useSharedValue, useAnimatedStyle, withTiming, FadeOut } from 'react-native-reanimated';
import CenteredLoader from "./CenteredLoader";

// const FastActiveImage: FC<FastImageProps> = props => {

// }

const ActiveImage: FC<FastImageProps> = props => {
    const opacity = useSharedValue(1);
    const handleLoad = useCallback(() => {
        opacity.value = withTiming(1, {duration: 200});
    }, [opacity]);

    const onLoadStart = useCallback(() => {
        opacity.value = withTiming(0, {duration: 200});

        props.onLoadStart && props.onLoadStart();
    }, []);

    const onLoad = useCallback((e: OnLoadEvent) => {
        handleLoad();
        props.onLoad && props.onLoad(e);
    }, [opacity]);
    const onLoadEnd = useCallback(() => {
        handleLoad();

        props.onLoadEnd && props.onLoadEnd();
    }, [opacity]);
    const onError = useCallback(() => {
        handleLoad();

        props.onError && props.onError();
    }, [handleLoad]);
    const uas = useAnimatedStyle(() => ({opacity: opacity.value}), [opacity]);
    const uasInd = useAnimatedStyle(() => ({opacity: 1 - opacity.value}), [opacity]);

    return <View style={[props.style, {alignItems: 'center', justifyContent: 'center'}]} >
        <Reanimated.View style={[{width: '100%', height: '100%'}, uas]}>
            <FastImage {...props} onLoadStart={onLoadStart} onLoad={onLoad} onLoadEnd={onLoadEnd} onError={onError}  />
        </Reanimated.View> 
        <Reanimated.View style={[{position: 'absolute'}, uasInd]} >
            <ActivityIndicator color={'white'} />
        </Reanimated.View>
    </View>
}

export default ActiveImage;