import React, { createContext, FC, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { contentGraph } from "jungle-shared";
import Reanimated, { measure, useAnimatedGestureHandler, useAnimatedRef, useAnimatedStyle, useSharedValue, withDelay, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { Button, FlatList, FlatListProps, Image, LayoutChangeEvent, LayoutRectangle, ListRenderItemInfo, ScrollView, Text, useWindowDimensions, View, ViewabilityConfigCallbackPair, ViewabilityConfigCallbackPairs, ViewToken, VirtualizedList } from "react-native";
import { RootNavContext, RootNavProps, RootStackParamList, source } from "utils";
import Video, { OnLoadData, OnPlaybackRateData, OnProgressData, VideoProperties } from 'react-native-video'
import { PanGestureHandler, PanGestureHandlerGestureEvent, TapGestureHandler, TapGestureHandlerGestureEvent } from "react-native-gesture-handler";
import { NavigationContext, useFocusEffect, useIsFocused, useNavigation, useRoute } from "@react-navigation/native";

import { useAppSelector } from "redux/hooks";
import { BottomSheetModal, BottomSheetModalProvider, BottomSheetScrollView, TouchableOpacity } from "@gorhom/bottom-sheet";
import FastImage from "react-native-fast-image";
import ContentTagView, { ContentGraphContext, ContentTagObject, getContentTagKey, getContentTags } from "./ContentTagView";

interface ICarouselContext{
    width: number,
    inView: boolean,
    screen: keyof RootStackParamList,
    visibleKey?: string | number
}

const CarouselContext = createContext({} as ICarouselContext);

type ContentWidth = Parameters<typeof source.content.image>[1];
const contentWidths = [200, 640, 1080, 1200];

const ContentView: FC<{showTags: boolean, content: contentGraph, aspectRatio: number}> = ({aspectRatio, content, showTags}) => {
    const carouselContext = useContext(CarouselContext);

    const [src, setSrc] = useState<string>();
    
    const contentWidth = useMemo(() => (contentWidths.find(w => w > carouselContext.width) ?? null) as ContentWidth, [carouselContext.width]);

    useEffect(() => {
        setSrc(content.content.type === 'video' ? 
            source.content.image(content.content.id, null) : 
            source.content.image(content.content.id, contentWidth));
    }, [setSrc, content.content.id, contentWidth, content.content.type]);

    const [isPaused, setPaused] = useState(true);

    useEffect(() => {
        const key = content.id.toString();
        if(key !== carouselContext.visibleKey)
            setPaused(true);
        // setIsContentMounted(key === context.visibleKey);
    }, [carouselContext.visibleKey, content]);
    
    const nav = useNavigation();
    const rootNav = useContext(RootNavContext);
    
    useEffect(() => {
        const beforeRemoveSub = nav.addListener('beforeRemove', e => { setPaused(true); });
        const blurSub = nav.addListener('blur', e => { setPaused(true); });

        const rootNavSubs = rootNav?.navigation ? [
            rootNav.navigation.addListener('transitionStart', e => { setPaused(true)})
        ] : [];

        return () => {
            beforeRemoveSub();
            blurSub();

            rootNavSubs.forEach(sub => sub());
        }
    }, [nav, rootNav, isPaused, setPaused]);

    const handlePlaybackRate = useCallback((e: OnPlaybackRateData) => {
        setPaused(e.playbackRate === 0);
    }, [setPaused]);

    const muted = useAppSelector(state => state.app.muted);

    const videoRef = useRef<Video>(null);
    const opacity = useSharedValue(0);
    const handleLoad = useCallback(() => {opacity.value = withTiming(1, {duration: 200})}, [opacity]);
    const uas = useAnimatedStyle(() => ({opacity: opacity.value}), [opacity]);

    const [contentTags, setContentTags] = useState<ContentTagObject[]>([]);
    
    useEffect(() => {
        let contentTags: ContentTagObject[] = [];

        contentTags.push(...getContentTags(content));

        const screenFilter = (o: ContentTagObject) => {
            return (
            carouselContext.screen === 'Post' ? o.type !== 'post' : 
            carouselContext.screen === 'Place' ? o.type !== 'place' && o.type !== 'node' : 
            carouselContext.screen === 'Event' ? o.type !== 'event' :
            carouselContext.screen === 'List' ? o.type !== 'node' :
            true)
        }
        
        contentTags = contentTags.filter((o, i, arr) => screenFilter(o) && arr.findIndex(t => getContentTagKey(t) === getContentTagKey(o)) === i);

        setContentTags(contentTags);
    }, [content, carouselContext.screen]);

    const videoModalRef = useAppSelector(state => state.app.videoModalHandle);

    const handlePlay = useCallback(() => {
        if(videoModalRef)
            videoModalRef.open(source.content.video(content.content.id));
    }, [videoModalRef, content.content.id]);

    return <View>
        <ContentGraphContext.Provider value={content}>
            {
                contentWidth ? <Reanimated.View style={[{width: carouselContext.width, aspectRatio, borderRadius: 25, overflow: 'hidden'}, uas]}>

                {
                    src
                    ? <FastImage onLoad={handleLoad} onLoadEnd={handleLoad} onError={handleLoad} source={{uri: src}} resizeMode={'cover'} style={{height: '100%', width: '100%'}} />
                    // ? content.content.type === 'image'
                    //     : 
                    //     <View>
                    //         <FastImage onLoad={handleLoad} onLoadEnd={handleLoad} onError={handleLoad} source={{uri: src}} resizeMode={'cover'} style={{height: '100%', width: '100%'}} />
                    //     </View>
                    //     <Video 
                    //         onLoad={handleLoad}
                    //         onError={handleLoad}
                    //         ref={videoRef}
                    //         onPlaybackRateChange={handlePlaybackRate} 
                    //         posterResizeMode={'cover'} 
                    //         poster={source.content.image(content.content.id, null)} 
                    //         source={{uri: src}} 
                    //         paused={isPaused}
                    //         allowsExternalPlayback={false} 
                    //         resizeMode={'cover'} style={{height: '100%', width: '100%'}} 
                    //         controls={false} />
                    : null
                }
                {
                    content.content.type === 'video' &&
                    <TouchableOpacity onPress={handlePlay} style={{position: 'absolute', bottom: 20, left: 20, backgroundColor: '#030303', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20}}>
                        <Text style={{color: 'white', fontWeight: '600', fontSize: 16}}>Watch video</Text>
                    </TouchableOpacity>
                }
                </Reanimated.View> : null
            }
            {
                showTags && 
                <ScrollView showsHorizontalScrollIndicator={false} contentContainerStyle={{}} horizontal={true} style={{height: 50, width: carouselContext.width}}>
                    {
                        contentTags.map(cto => <ContentTagView key={getContentTagKey(cto)} contentTagObject={cto} />)
                    }
                </ScrollView>
            }
        </ContentGraphContext.Provider>
    </View>;
}

const ContentCarousel: FC<{showTags?: boolean, aspectRatio?: number, screen: keyof RootStackParamList, content: contentGraph[], inView: boolean}> = ({screen, content, inView, showTags = true, aspectRatio = 4/5}) => {
    const [containerWidth, setContainerWidth] = useState(0);
    const [visibleKey, setVisibleKey] = useState<number|string>();

    const handleContainerLayout = useCallback((e: LayoutChangeEvent) => {
        setContainerWidth(e.nativeEvent.layout.width);
    }, [setContainerWidth]);

    const contextMemo: ICarouselContext = useMemo(() => ({width: containerWidth, inView, visibleKey, screen}), [containerWidth, inView, visibleKey, screen]);
    const [context, setContext] = useState<ICarouselContext>(contextMemo);

    useEffect(() => {
        setContext(contextMemo);
    }, [contextMemo]);

    const render = useCallback(({item: content}: ListRenderItemInfo<contentGraph>) => <ContentView key={content.id.toString()} showTags={showTags} aspectRatio={aspectRatio} content={content} />,[aspectRatio, content, showTags]);
    const keyExtractor = useCallback((content: contentGraph, index: number) => content.id.toString(),[content]);
    const bounds = useWindowDimensions();
    const getItemLayout: FlatListProps<contentGraph>['getItemLayout'] = useCallback((data: any, index: number) => ({index, length: bounds.width, offset: bounds.width*index}), [bounds.width]);
    const handleViewable: FlatListProps<contentGraph>['onViewableItemsChanged'] = useCallback((e: {viewableItems: ViewToken[]}) => {
        const key = e.viewableItems[0]?.key;
        setVisibleKey(key);
    }, [setVisibleKey]);

    const bottomSheetModalRef = useRef<BottomSheetModal>(null);
    const snapPoints = useMemo(() => ['50%'], []);
    const handleIndexChange = useCallback((index: number) => {
        
    }, []);

    const [open, setOpen] = useState(false);
    const handleViewTagsPress = useCallback(() => {
        if(!open)
            bottomSheetModalRef.current?.present();
        else
            bottomSheetModalRef.current?.dismiss();
    }, [open]);

    const tagsHeight = useMemo(() => showTags ? 50 : 0, [showTags]);

    return <CarouselContext.Provider value={context}>
            <View style={{overflow: 'hidden'}}>
                {/* <BottomSheetModalProvider> */}
                    <FlatList 
                        viewabilityConfig={{itemVisiblePercentThreshold: 100, minimumViewTime: 500}}
                        onViewableItemsChanged={handleViewable}
                        onLayout={handleContainerLayout} style={{width: bounds.width, height: (bounds.width/aspectRatio) + tagsHeight}}
                        renderItem={render}
                        keyExtractor={keyExtractor}
                        data={content}
                        horizontal={true}
                        snapToAlignment={'start'}
                        decelerationRate={'fast'}
                        initialNumToRender={1}
                        windowSize={3}
                        snapToInterval={bounds.width}
                        showsHorizontalScrollIndicator={false}
                        getItemLayout={getItemLayout}
                    />
                    {/* <BottomSheetModal
                    detached={false}
                    ref={bottomSheetModalRef}
                    onChange={handleIndexChange}
                    index={0}
                    snapPoints={snapPoints}
                    handleIndicatorStyle={{backgroundColor: 'white'}}
                    style={{backgroundColor: '#030303', borderTopWidth: 1, borderTopColor: '#ffffff30'}}
                    backgroundStyle={{backgroundColor: '#030303'}}
                    >
                        <BottomSheetScrollView style={{flex: 1, backgroundColor: 'white'}} contentContainerStyle={{padding: 30}}>
                            
                        </BottomSheetScrollView>
                    </BottomSheetModal> */}
                {/* </BottomSheetModalProvider> */}
            </View>
        </CarouselContext.Provider>
}

export default ContentCarousel;