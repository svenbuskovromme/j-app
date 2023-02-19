import { contentGraph, place, placeListItem, tastemakerSummary } from "jungle-shared";
import React, { Context, FC, Fragment, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useAppDispatch, useAppSelector, useLocationNodeData, useLocationNodeId } from "redux/hooks";
import Reanimated, { FadeInRight, FadeOutRight, Layout, useAnimatedGestureHandler, useAnimatedStyle, useSharedValue, withDecay, withTiming } from 'react-native-reanimated';
import { EmitterSubscription, FlatListProps, Image, Keyboard, KeyboardAvoidingView, LayoutChangeEvent, ListRenderItemInfo, Platform, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, useWindowDimensions, View } from "react-native";
import { contentUtils, getFullName, nameFlatten, RootNavContext, RootNavProps, RootScreenProps, source } from "utils";
import { useNavigation } from "@react-navigation/native";
import { FlatList, PanGestureHandler, PanGestureHandlerGestureEvent } from "react-native-gesture-handler";
import Tags from "./Tags";
import { IncreaseLimitButtonHeight, PlaceHeight, PlaceWithContentHeight, queryInterval, SearchContext, TastemakerHeight } from "./contexts";
import { useGetContentQuery, useGetSearchNodesQuery, useGetUserPlacesQuery } from "redux/api";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import { PlaceLogo } from "components/shared/PlaceLogo";
import CenteredLoader from "components/shared/CenteredLoader";
import BottomSheet, { BottomSheetFlatList, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from "react-native-svg";
import SearchInput from "./Input";
import { logAppActivity } from "redux/app";
import ActiveImage from "components/shared/ActiveImage";
import FastImage from "react-native-fast-image";

type PlaceSearchItem = {type: 'place', data: placeListItem<'search'>};
type TMSearchItem = {type: 'tm', data: tastemakerSummary};
type SearchItem = (PlaceSearchItem | TMSearchItem);

const getItemHeight = (item: SearchItem) => {
    if(item.type === 'place'){
        return !!item.data.posterContent?.length ? PlaceWithContentHeight : PlaceHeight;
    }
    else
        return TastemakerHeight;
};

const PlaceWithContentView: FC<{item: PlaceSearchItem}> = ({item}) => {
    const nav = useNavigation<RootNavProps>();
    const height = PlaceWithContentHeight;
    const [contentLoaded, setContentLoaded] = useState(false);
    const context = useContext(SearchContext);
    const dispatch = useAppDispatch();

    const handlePress = useCallback(() => {
        if(item.type === 'place'){
            dispatch(logAppActivity({type: 'placeOpen', data: {placeId: item.data.id, fromSearch: {searchTerm: context.searchTerm, nodes: context.selectedBranches}}}));
            nav.push('Place', {id: item.data.id});
        }
        else{
            nav.push('Tastemaker', {id: item.data.id});
        }
    }, [item, nav, context.searchTerm, context.selectedBranches]);

    const opacity = useSharedValue(0);
    const handleLoad = useCallback(() => {setContentLoaded(true); opacity.value = withTiming(1, {duration: 200})}, [opacity]);
    const uas = useAnimatedStyle(() => ({opacity: opacity.value}), [opacity]);
    const [locationNodeNames, setLocationNodeNames] = useState<string[]>();

    useEffect(() => {
        setLocationNodeNames(item.data.locationNodes?.map(iln => context.locationNodes.find(ln => ln.type === 'neighborhood' && ln.id === iln)?.name).filter(Boolean) as string[]);
    }, [context.locationNodes, item.data.locationNodes]);

    return item.data.posterContent ? <TouchableOpacity activeOpacity={0.85} onPress={handlePress} key={item.data.id} style={{padding: 20, flexDirection: 'column', backgroundColor: 'rgba(255,0,0,0)', justifyContent: 'flex-start', alignItems: 'center', height: height - 20, marginBottom: 20}}>
        <View style={{width: '100%', height: '100%'}}>
            <ActiveImage source={{uri: source.content.image(item.data.posterContent![0], 640, true)}} style={{borderRadius: 25, height: '100%', width: '100%'}} />
            <View style={{position: 'absolute', alignSelf: 'flex-start', padding: 10, borderRadius: 30, alignItems: 'center', flexDirection: 'row', overflow: 'hidden'}}>
                <FastImage 
                    style={[{width: 50, aspectRatio: 1, borderRadius: 30, marginRight: 15}]} 
                    source={{uri: item.type === 'place' ? source.place.logo.background(item.data.id) : source.person.small(item.data.id)}}
                />
            </View>
            <View style={{position: 'absolute', bottom: 0, width: '100%', height: '100%'}} pointerEvents={'none'}>
                <Svg height={'100%'} width={'100%'} >
                    <Defs>
                        <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                        <Stop offset={1 - (120/220)} stopColor="transparent" stopOpacity="0" />
                        <Stop offset="1" stopColor="#030303" stopOpacity="0.9" />
                        </LinearGradient>
                    </Defs>
                    <Rect x={0} y={0} width={'100%'} height={'100%'} fill={'url(#grad)'} />
                </Svg>
            </View>
            <View style={{position: 'absolute', alignSelf: 'flex-start', bottom: 0, padding: 10}}>
                <Text style={{color: 'white', fontSize: 30}}>{item.data.name}</Text>
                {
                    !!locationNodeNames?.length &&
                    <Text style={{color: 'white', fontSize: 14, textTransform: 'capitalize'}}>{locationNodeNames.join(', ')}</Text>
                }
            </View>

        </View>
    </TouchableOpacity> : null;
}

const IncreaseLimitButton: FC = () => {
    const context = useContext(SearchContext);
    const handlePress = useCallback(() => {
        context.setQueryLimit(context.queryLimit + queryInterval);
    }, [context.hasMoreResults, context.queryLimit, context.setQueryLimit]);

    return <TouchableOpacity activeOpacity={0.75} onPress={handlePress} style={{height: IncreaseLimitButtonHeight, alignItems: 'center', justifyContent: 'center'}}>
        {
            context.hasMoreResults ? 
            <Text style={{color: 'white'}}>Show more results</Text> :
            null
        }
    </TouchableOpacity>
}

const ItemView: FC<{item: SearchItem}> = ({item}) => {
    const nav = useNavigation<RootNavProps>();
    const [height, setHeight] = useState(0);
    const [placeWithContent, setPlaceWithContent] = useState(false);
    const context = useContext(SearchContext);
    const dispatch = useAppDispatch();

    useEffect(() => {
        setPlaceWithContent(item.type === 'place' && !!item.data.posterContent?.length && item.data.posterContent[0] !== null);
    }, [item.data, item.type]);

    useEffect(() => {
        setHeight(getItemHeight(item));
    }, [item]);

    const handlePress = useCallback(() => {
        if(item.type === 'place'){
            dispatch(logAppActivity({type: 'placeOpen', data: {placeId: item.data.id, fromSearch: {searchTerm: context.searchTerm, nodes: context.selectedBranches}}}));
            nav.push('Place', {id: item.data.id});
        }
        else{
            nav.push('Tastemaker', {id: item.data.id});
        }
    }, [item, nav, 
        context.searchTerm, context.selectedBranches
    ]);

    const opacity = useSharedValue(0);
    const handleLoad = useCallback(() => {opacity.value = withTiming(1, {duration: 200})}, [opacity]);
    const uas = useAnimatedStyle(() => ({opacity: opacity.value}), [opacity]);

    const [locationNodeNames, setLocationNodeNames] = useState<string[]>();

    useEffect(() => {
        if(item.type === 'place'){
            setLocationNodeNames(item.data.locationNodes?.map(iln => context.locationNodes.find(ln => ln.type === 'neighborhood' && ln.id === iln)?.name).filter(Boolean) as string[]);
        }
    }, [context.locationNodes, item]);

    // return <Text style={{color: 'white'}}>{item.data.id}</Text>;

    return placeWithContent ? <PlaceWithContentView item={item as PlaceSearchItem} /> : <TouchableOpacity activeOpacity={0.85} onPress={handlePress} key={item.data.id} style={{flexDirection: 'column', alignItems: 'flex-start', height, paddingHorizontal: 40}}>
            <View style={{height: PlaceHeight - 10, marginVertical: 5, alignItems: 'center', flexDirection: 'row', overflow: 'hidden'}}>
                {
                    <FastImage
                        style={[{width: PlaceHeight - 10, aspectRatio: 1, borderRadius: 30, marginRight: 15}]} 
                        source={{uri: item.type === 'place' ? source.place.logo.background(item.data.id) : source.person.small(item.data.id)}}
                    />
                }
                <View style={{flexDirection: 'column'}}>
                    <Text style={{color: 'white', fontSize: 20}}>{item.type === 'place' ? item.data.name : getFullName(item.data)}</Text>
                    {
                        !!locationNodeNames?.length &&
                        <Text style={{color: 'white', fontSize: 12, textTransform: 'capitalize'}}>{locationNodeNames?.join(', ')}</Text>
                    }
                </View>
            </View>
    </TouchableOpacity>
}

const Places: FC = () => {
    const context = useContext(SearchContext);
    const [currentSearchItems, setItems] = useState<(SearchItem|null)[]>([]);

    const locationNodeId = useLocationNodeId();
    
    useEffect(() => {
        setItems([null, ...context.searchItems, null]);
        
        let mounted = true;

        return () => {
            mounted = false;
        }
    }, [context.searchItems]);

    const keyExtractor = useCallback((item: SearchItem | null, index: number) => item === null ? index === 0 ? 'tags' : 'increaseLimit' : `${item.type}_${item.data.id}`, []);
    
    const renderItem = useCallback(({item, index}: Omit< ListRenderItemInfo<SearchItem | null>, 'separators'>) =>
    item === null ? 
        index === 0 ? 
            <Tags key={'tags'} /> : 
            <IncreaseLimitButton key={'increaseLimit'} /> :
        <ItemView key={keyExtractor(item, index)} item={item} />, [keyExtractor]);

    const handleScroll = useCallback(() => {
        Keyboard.dismiss();
    }, []);

    const scrollViewRenderItem = useCallback((item: SearchItem|null) => {
        return item ? <ItemView key={`${item.type}_${item.data.id}`} item={item} /> : null
        // return renderItem({index, item});
    }, []);
    
    const [resultOffsets, setResultOffsets] = useState<number[]>([]);

    useEffect(() => {
        if(currentSearchItems.length){
            const offsets = Array(currentSearchItems.length - 1);

            offsets[0] = 0;

            for(let i = 0; i < offsets.length; i++){
                const prevItem = currentSearchItems[i];

                if(prevItem){
                    const offset = offsets[i - 1] + getItemHeight(prevItem);
        
                    offsets[i] = offset;
                }
            }

            setResultOffsets(offsets);
        }
        else{
            setResultOffsets([]);
        }
    }, [currentSearchItems, setResultOffsets]);

    // const getItemLayout = useCallback((data: (SearchItem|null)[] | null | undefined, index: number) => {
    //     if(index === 0){
    //         return {index, offset: 0, length: context.tagsHeight};
    //     }
    //     else if(index === context.queryLimit + 1){
    //         return {index, offset: context.tagsHeight + resultOffsets[resultOffsets.length - 1], length: IncreaseLimitButtonHeight};
    //     }
    //     else{
    //         const item = data ? data[index] : null;

    //         let offset = 0;
    //         let length = 0;

    //         if(item){
    //             offset = context.tagsHeight + (resultOffsets[index - 1] ?? 0);
    //             length = getItemHeight(item);
    //         }

    //         return {index, offset, length};
    //     }
    // }, [context.tagsHeight, context.queryLimit, resultOffsets]);

    const bounds = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const footerHeight = useAppSelector(state => state.app.footerHeight);

    const bottomSheetRef = useRef<BottomSheet>(null);

    const [sheetIndex, setSheetIndex] = useState(0);

    const [kbHeight, setKbHeight] = useState(0);

    useEffect(() => {
        if(context.inputFocused){
            const f = Platform.select({
                ios: () => bottomSheetRef.current?.snapToIndex(2),
                android:() => bottomSheetRef.current?.snapToPosition(bounds.height - kbHeight - 100)
            });

            if(f) f();
            // bottomSheetRef.current?.snapToIndex(2);
            
        }
    }, [context.inputFocused, kbHeight, bounds.height]);

    const dispatch = useAppDispatch();

    const handleIndexChange = useCallback((index: number) => {
        if(index === 0)
            dispatch(logAppActivity({type: 'mapOpen'}));
    }, [dispatch]);

    const [snapPoints, setSnapPoints] = useState<(number|string)[]>([]);

    useEffect(() => {
        if(Platform.OS === 'android'){
            const subs: EmitterSubscription[] = [
                Keyboard.addListener('keyboardDidShow', e => {
                    setKbHeight(e.endCoordinates.height);
                }),
                Keyboard.addListener('keyboardDidHide', e => {
                    setKbHeight(0);
                })
            ];
    
            return () => {
                console.log(subs)

                // if(subs)
                //     subs?.forEach(s => !!s && Keyboard.removeSubscription(s));
            }
        }

        setHeight(bounds.height);
    }, [bounds.height]);

    const [height, setHeight] = useState(bounds.height);
    

    useEffect(() => {
        const top = height - footerHeight - insets.bottom - insets.top - 50;
        const kbTop = height - kbHeight;
        setSnapPoints([footerHeight + 50 + insets.bottom + (context.selectedBranches?.length ? 100 : 40),
            height * 0.7,
            height
        ]);
    }, [height, kbHeight, footerHeight, insets, context.selectedBranches]);

    const [contentHeight, setContentHeight] = useState(0);
    const [containerHeight, setContainerHeight] = useState(0);
    const handleContentLayout = useCallback((e: LayoutChangeEvent) => {setContentHeight(e.nativeEvent.layout.height)}, [setContentHeight]);
    const handleContainerLayout = useCallback((e: LayoutChangeEvent) => {setContainerHeight(e.nativeEvent.layout.height)}, [setContainerHeight]);
    const y = useSharedValue(0);
    const scrollUAS = useAnimatedStyle(() => ({transform: [{translateY: y.value}]}), [y]);
    // const panHandler = useAnimatedGestureHandler<PanGestureHandlerGestureEvent, {start: number}>({
    //     onStart(e, c){
    //         c.start = y.value;
    //     },
    //     onActive(e, c){
    //         y.value = e.translationY + c.start;
    //     },
    //     onEnd(e, c){
    //         y.value = withDecay({velocity: e.velocityY, rubberBandEffect: true, rubberBandFactor: 0.6, clamp: [-(Math.max(contentHeight-containerHeight, 0) ), 0]});
    //     }
    // }, [contentHeight, containerHeight]);

    // return <View>
    //     {context.searchItems.map((item) => <ItemView key={`${item.type}_${item.data.id}`} item={item} /> )}
    // </View>

    const {navigation, route} = useContext(RootNavContext as Context<RootScreenProps<'Search'>>);

    useEffect(() => {
        switch(route.params?.initial){
            case 'map': break;
            case 'search': 
                setSheetIndex(1);
                // bottomSheetRef.current?.snapToIndex(1);
            break;
        }
    }, [route]);

    return (
        <View 
        //behavior={Platform.OS === "ios" ? "padding" : "position"}
        pointerEvents={'box-none'} style={{transform:[{translateY: 50}], position: 'absolute', overflow: 'hidden', bottom: 0, height: height - footerHeight - insets.bottom, width: bounds.width, zIndex: 51}}>
            {
                !!snapPoints?.length &&
                <BottomSheet
                    keyboardBlurBehavior="restore"
                    ref={bottomSheetRef}
                    snapPoints={snapPoints}
                    index={sheetIndex}
                    detached={true}
                    onChange={handleIndexChange}
                    handleStyle={{display: 'none'}}
                    handleComponent={null}
                    backgroundStyle={{overflow: 'hidden', borderRadius: 0, backgroundColor: 'transparent'}}
                    containerStyle={{overflow: 'hidden', borderRadius: 0, backgroundColor: 'transparent'}}
                    handleIndicatorStyle={{display: 'none'}}
                    enableContentPanningGesture={!context.inputFocused}
                    enableHandlePanningGesture={!context.inputFocused}
                    >
                    
                    <View 
                    pointerEvents={'box-none'}
                    style={{
                        backgroundColor: '#030303', borderTopLeftRadius: 25, borderTopRightRadius: 25,
                        marginTop: insets.top, zIndex: 11, width: '100%', flex: 1, overflow: 'hidden'}}>
                        <SearchInput />
                        <BottomSheetScrollView onScroll={handleScroll} showsVerticalScrollIndicator={false} style={{flex: 1}} contentContainerStyle={{paddingBottom: 75}}>
                            <Tags key={'tags'} />
                            {context.searchItems.map((item) => <ItemView key={`${item.type}_${item.data.id}`} item={item} /> )}
                            <IncreaseLimitButton />
                        </BottomSheetScrollView>
                    </View>
                </BottomSheet>
            }
        </View>
    )

    /* <FlatList
        keyboardShouldPersistTaps={'always'}
        showsVerticalScrollIndicator={false}
        style={{flex: 1}}
        contentContainerStyle={{paddingBottom: 75}}
        data={currentSearchItems}
        renderItem={renderItem}
        initialNumToRender={10}
        keyExtractor={keyExtractor}
        windowSize={2}
        updateCellsBatchingPeriod={100}
        getItemLayout={getItemLayout}
    /> */
}

export default Places;