import { useFocusEffect, useNavigation } from "@react-navigation/native";
import CenteredLoader from "components/shared/CenteredLoader";
import ContentCarousel from "components/shared/ContentCarousel";
import ShareButton from "components/shared/ShareButton";
import { contentGraph, place, postGraph, postRow } from "jungle-shared";
import React, { FC, useCallback, useContext, useEffect, useState } from "react";
import { ActivityIndicator, Image, Linking, ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";
import InAppBrowser from "react-native-inappbrowser-reborn";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useGetPostQuery } from "redux/api";
import { logAppActivity, setTabNavColors } from "redux/app";
import { useAppDispatch, useAppSelector } from "redux/hooks";
import { dateFormatShort, getFullName, RootNavContext, RootNavProps, RootScreenProps, source, useRouteId, useRouteNameUrl } from "utils";
import { PostGraphContext } from "./contexts";
import Reanimated, { FadeOut } from 'react-native-reanimated';
import { skipToken } from "@reduxjs/toolkit/dist/query/react";
import ContentTagView, { ContentTagObject, getContentTagKey, getContentTags } from "components/shared/ContentTagView";

const PostHeaderRight: FC<{post: postRow}> = ({post}) => {
    const [shareMessage, setShareMessage] = useState('');
    const [shareUrl, setShareUrl] = useState('');
    useEffect(() => {
        setShareMessage(`${post.title} - Jungle`);
        setShareUrl(`https://jungle.link/post/${post.nameUrl}`);
    }, [post]);
    
    return <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <ShareButton id={post.id} message={shareMessage} url={shareUrl} type={'post'} color={'white'} />
    </View>
}

const News: FC<{postGraph: postGraph}> = ({postGraph}) => {
    // const {navigation, route: {params: {id: postId}}} = nav;
    // const postData = useGetPostQuery({id: postId});
    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(logAppActivity({type: 'listPostView', data: {id: postGraph.post.id}}));
    }, [dispatch]);

    const footerHeight = useAppSelector(state => state.app.footerHeight);
    const insets = useSafeAreaInsets();

    return <View style={{flex: 1, backgroundColor: '#030303'}} >
            {
             <Reanimated.ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 50}} style={{}}>
                <PostGraphContext.Provider value ={postGraph}>
                    <PostContentCarousel />
                    <View style={{padding: 20, paddingVertical: 23 }}>
                        <PostDate />
                        <PostTitle />
                        <PostText />
                        <PostContentTags />
                    </View>
                </PostGraphContext.Provider>
                </Reanimated.ScrollView>
            }
    </View>;
}

const PostContentCarousel: FC = () => {
    const postGraph = useContext(PostGraphContext);

    return <View>
        <ContentCarousel screen={'Post'} inView={true} content={postGraph.content} />
    </View>
}

const PostDate: FC = () => {
    const pg = useContext(PostGraphContext);

    return <Text style={{marginVertical: 7, color: '#FFFFFF60', fontSize: 17}}>{dateFormatShort(pg.post.publishDate)}</Text>
}
const PostTitle: FC = () => {
    const pg = useContext(PostGraphContext);

    return <Text style={{marginVertical: 7, color: 'white', fontSize: 28}}>{pg.post.title}</Text>
}
const PostText: FC = () => {
    const pg = useContext(PostGraphContext);

    return <Text style={{marginVertical: 7, color: 'white', fontSize: 17, lineHeight: 22}}>{pg.post.text}</Text>
}

const PostContentTags: FC = () => {
    const {content} = useContext(PostGraphContext);
    const nav = useNavigation<RootNavProps>();

    const [contentTags, setContentTags] = useState<ContentTagObject[]>([]);
    
    useEffect(() => {
        let contentTags: ContentTagObject[] = [];

        for(let i = 0; i < content.length; i++){
            contentTags.push(...getContentTags(content[i]));
        };

        contentTags = contentTags.filter((o, i, arr) => o.type !== 'post' && arr.findIndex(t => getContentTagKey(t) === getContentTagKey(o)) === i);

        setContentTags(contentTags);
    }, [content]);

    return <View style={{flexDirection: 'row', flexWrap: 'wrap', margin: -5, marginTop: 20}}>
        {
            contentTags.map(cto => <ContentTagView key={getContentTagKey(cto)} contentTagObject={cto} />)
        }
    </View>
}

const NewsIndex: FC<RootScreenProps<'Post'>> = props => {
    const id = useRouteId(props.route);
    const nameUrl = useRouteNameUrl(props.route);
    const postData = useGetPostQuery(id || nameUrl ? {id, nameUrl} : skipToken);
    const dispatch = useAppDispatch();

    useEffect(() => {
        props.navigation.setOptions({
            headerTitle: 'News',
            headerRight: () => (postData.isSuccess && postData.data) ? <PostHeaderRight post={postData.data.post} /> : null
        })
    }, [postData.isSuccess, postData.data]);

    useFocusEffect(() => {
        dispatch(setTabNavColors());
    });

    return <RootNavContext.Provider value={props}>
        <View style={{flex: 1, backgroundColor: '#030303'}}>
            <StatusBar barStyle={'light-content'} />
            {
                postData.isError || (postData.isSuccess && !postData.data) ? 
                <View style={{alignItems: 'center', justifyContent: 'center', flex: 1}}>
                    <TouchableOpacity activeOpacity={0.75} onPress={() => props.navigation.canGoBack() ? props.navigation.goBack() : props.navigation.navigate('Home')}>
                        <Text style={{color: 'white'}}>Post not found, return to home</Text>
                    </TouchableOpacity>
                </View> : 
                postData.isSuccess ? <News postGraph={postData.data} /> :
                <Reanimated.View exiting={FadeOut}>
                    <CenteredLoader style={{position: 'absolute'}} />
                </Reanimated.View>
            }
        </View>
    </RootNavContext.Provider>
}

export default NewsIndex;
