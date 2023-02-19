import { TouchableOpacity } from "@gorhom/bottom-sheet";
import { useNavigation } from "@react-navigation/native";
import { QueryDefinition } from "@reduxjs/toolkit/dist/query";
import { UseQueryHookResult } from "@reduxjs/toolkit/dist/query/react/buildHooks";
import { usePlaceTextColor } from "components/screens/place/utils";
import { eventGraph, place, postGraph } from "jungle-shared";
import React, { FC, ReactElement, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatListProps, Image, ListRenderItem, RefreshControl, Text, View, ViewToken } from "react-native";
import FastImage from "react-native-fast-image";
import { FlatList, TapGestureHandler } from "react-native-gesture-handler";
import Reanimated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useGetEventsQuery, useGetPostsQuery } from "redux/api";
import { logAppActivity } from "redux/app";
import { useAppDispatch, useAppSelector, useLocationNodeId } from "redux/hooks";
import { dateFormatShort, RootNavContext, source } from "utils";
import { DropsListHeight, EventsListHeight, FeedContext, IFeedContext, NewsHeaderHeight, PostHeight } from "./contexts";
import Drops from "./Drops";
import Events from "./Events";

const PostView: FC<{post: postGraph}> = ({post}) => {
    const dispatch = useAppDispatch();
    const color = usePlaceTextColor();

    useEffect(() => {
        dispatch(logAppActivity({type: 'postImpression', data: {postId: post.post.id}}));
        
    }, [dispatch]);

    useEffect(() => {
        FastImage.preload([{uri: source.content.image(post.contentPoster?.id ?? 0, 1080)}]);
    }, [post.contentPoster]);

    const opacity = useSharedValue(0);
    const handleLoad = useCallback(() => {opacity.value = withTiming(1, {duration: 200})}, [opacity]);
    const uas = useAnimatedStyle(() => ({opacity: opacity.value}), [opacity]);
    const context = useContext(RootNavContext);

    const handlePress = useCallback(() => {
        context.navigation.push('Post', {id: post.post.id});
    }, []);

    return <TouchableOpacity activeOpacity={0.85} onPress={handlePress}>
        <Reanimated.View style={[{width: '100%', height:PostHeight}, uas]}>
            <View style={{height: 200, borderRadius: 9, overflow: 'hidden'}}>
                <FastImage onLoad={handleLoad} onLoadEnd={handleLoad} onError={handleLoad} source={{uri: source.content.image(post.contentPoster?.id ?? 0, 640)}} style={{width: '100%', height: '100%'}} resizeMode={'cover'} />
            </View>
            <View style={{height: 100, justifyContent: 'flex-start', padding: 10}}>
                <Text numberOfLines={1} style={{color: color + '60', fontSize: 13}}>{dateFormatShort(post.post.publishDate)}</Text>
                <Text numberOfLines={1} style={{color, fontSize: 19}}>{post.post.title}</Text>
            </View>
        </Reanimated.View>
    </TouchableOpacity>
}

const NewsHeader: FC = () => {
    const color = usePlaceTextColor();
    const context = useContext(FeedContext);
    return context.news.length ? 
    <View style={{height: NewsHeaderHeight, padding: 10, justifyContent: 'flex-end'}}>
        <Text style={{fontSize: 20, fontWeight: '600', color}}>News</Text>
    </View> : null; 
}

const useProvideContext = <T extends unknown>(getContext: () => T) => {
    const [context, setContext] = useState(getContext());

    useEffect(() => {
        setContext(getContext());
    }, [getContext]);

    return context;
}

const TestStick: FC = () => {
    return <View style={{height: 50, width: 50, backgroundColor: 'blue'}}>

    </View>
}

const Feed: FC<{append?: ReactElement, appendHeight?: number, place?: place}> = ({place, append = null, appendHeight = 0}) => {
    const locationNodeId = useLocationNodeId();
    const dropsData = useGetEventsQuery({locationNodeId, placeId: place?.id, count:0 , sort: 'startDate', order: 'asc', filter: 'drops' });
    const eventsData = useGetEventsQuery({locationNodeId, placeId:place?.id, count:0 , sort: 'startDate', order: 'asc', filter: 'notDone' });
    const newsData = useGetPostsQuery({locationNodeId, placeId: place?.id, count: 0, enabled: true, published: true, sort: 'publishDate'}, {});

    const getContext = useCallback(() => ({
        drops: dropsData.data ?? [],
        events: eventsData.data ?? [],
        news: newsData.data ?? [],
        placeId: place?.id
    } as IFeedContext), [dropsData, eventsData, newsData, place]);

    const context = useProvideContext(getContext);

    const [items, setItems] = useState<(postGraph|null)[]>([]);
    const renderItem = useCallback((({item, index}) => item === null ? index === 0 ? append : index === 1 ? <Drops /> : index === 2 ? <Events /> : <NewsHeader /> : <PostView post={item} />) as ListRenderItem<postGraph | null>, [append]);
    const keyExtractor = useCallback((data: postGraph|null, index: number) => data === null ? index === 0 ? 'append' : index === 1 ? 'drops' : index === 2 ? 'events' : 'newsHeader' : `${data.post.id}`, []);

    useEffect(() => {
        setItems([null, null, null, null, ...context.news]);
    }, [context.news]);
    
    const getItemLayout = useCallback((data: any, index: number) => {
        const dropsHeight = context.events.length ? DropsListHeight : 0;
        const eventsHeight = context.drops.length ? EventsListHeight: 0;
        const headerHeight = context.news.length ? NewsHeaderHeight : 0;

        if(index > 3){
            const offset = appendHeight+dropsHeight+eventsHeight+headerHeight + PostHeight*(index - 4);
            const length = PostHeight;

            return {offset, length, index};
        }
        else{
            const offset = index === 0 ? 0 : index === 1 ? appendHeight : index === 2 ? dropsHeight + appendHeight : dropsHeight + eventsHeight + appendHeight;
            const length = index === 0 ? appendHeight : index === 1 ? dropsHeight : index === 2 ? eventsHeight : headerHeight;

            return {offset, length, index};
        }
    }, [context.events, context.drops, context.news, appendHeight]);

    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        const isLoading = dropsData.isLoading || eventsData.isLoading || newsData.isLoading;
        const isFetching = dropsData.isFetching || eventsData.isFetching || newsData.isFetching;
        setLoading(isLoading);
        setRefreshing(isFetching && !isLoading);
    }, [dropsData, eventsData, newsData]);

    const handleRefresh = useCallback(() => {
        setRefreshing(true);
        dropsData.refetch();
        eventsData.refetch();
        newsData.refetch();
    }, [eventsData, dropsData, newsData]);

    const color = usePlaceTextColor();
    
    const list = useMemo(() =>  <FlatList 
        refreshControl={
            <RefreshControl
            tintColor={color}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            />
        }
        data={items}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        style={{overflow: 'visible'}}
        windowSize={2}
        initialNumToRender={4}
        getItemLayout={getItemLayout}
        stickyHeaderIndices={[1]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: 50}}
        // StickyHeaderComponent={TestStick}
    />, [color, refreshing, handleRefresh, items, renderItem, keyExtractor, getItemLayout]);

    return <FeedContext.Provider value={context}>
            {list}
            {   
                loading && 
                    <View style={{position: 'absolute', zIndex: 2, backgroundColor: '#030303', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center'}}>
                        <ActivityIndicator size={'large'} color={'white'} />
                    </View>
            }
        </FeedContext.Provider>
}

export default Feed;