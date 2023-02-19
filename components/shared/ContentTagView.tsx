import { getPlaceLineColor, getPlaceTextColor, PlaceGraphContext, usePlaceTextColor } from "components/screens/place/utils";
import { PostGraphContext } from "components/screens/post/contexts";
import { contentGraph } from "jungle-shared";
import React, { FC, useState, useEffect, useCallback, useContext, createContext } from "react";
import { Image, Linking, Text, TouchableOpacity } from "react-native";
import FastImage from "react-native-fast-image";
import InAppBrowser from "react-native-inappbrowser-reborn";
import { useDispatch } from "react-redux";
import { logAppActivity } from "redux/app";
import { useAppDispatch } from "redux/hooks";
import { getFullName, RootNavContext, source } from "utils";

export const ContentGraphContext = createContext({} as contentGraph);

const ContentTagImage: FC<{cto: ContentTagObject}> = ({cto}) => {
    const [src, setSrc] = useState('');
    const [borderColor, setBorderColor] = useState('transparent');
    const [backgroundColor, setBackgroundColor] = useState('');

    useEffect(() => {
        if(isPlace(cto)) {
            setSrc(source.place.logo.small(cto.data.id));
            setBackgroundColor('#' + cto.data.primaryColor);
            setBorderColor('#' + cto.data.accentColor);
        }
        else if(isTastemaker(cto)) {
            setSrc(source.person.small(cto.data.id));
            setBackgroundColor('');
            setBorderColor('transparent');
        }
        else{
            setSrc('');
            setBackgroundColor('');
            setBorderColor('transparent');
        }
    }, [cto.type]);

    return src ? <FastImage source={{uri: src}} style={{width: 30, aspectRatio: 1, marginRight: -8, borderRadius: 30, borderColor, borderWidth: 1, backgroundColor}} /> : null;
}

const ContentTagLabel: FC<{cto: ContentTagObject}> = ({cto}) => {
    const place = useContext(PlaceGraphContext);
    const [text, setText] = useState('');
    const [color, setColor] = useState('');

    useEffect(() => {
        setColor(place?.place ? getPlaceTextColor(place.place) : cto.data.primary ? '#030303' : '#ffffff');
    }, [cto.data.primary]);

    useEffect(() => {
        setText(getContentTagLabel(cto));
    }, [cto]);

    return <Text style={{marginLeft: 16, fontSize: 17, color}}>{text}</Text>;
}

const ContentTagView: FC<{contentTagObject: ContentTagObject}> = ({contentTagObject}) => {
    const place = useContext(PlaceGraphContext);
    const content = useContext(ContentGraphContext);
    const post = useContext(PostGraphContext);
    const {navigation: nav} = useContext(RootNavContext);
    const [backgroundColor, setBackgroundColor] = useState<string>();
    const dispatch = useAppDispatch();

    useEffect(() => {
        setBackgroundColor(place?.place ? getPlaceLineColor(place.place) : contentTagObject.data.primary ? '#ffffff' : '#1a1a1a');
    }, [contentTagObject.data.primary, place]);
    
    const handlePress = useCallback(async () => {
        if(isPlace(contentTagObject)) {
            dispatch(logAppActivity({type: 'placeOpen', data: {placeId: contentTagObject.data.id, fromPostId: post?.post.id, fromContentId: content?.content.id}}));
            nav.push('Place', {id: contentTagObject.data.id});
        }
        if(isTastemaker(contentTagObject)) nav.push('Tastemaker', {id: contentTagObject.data.id});
        if(isPost(contentTagObject)) nav.push('Post', {id: contentTagObject.data.id});
        if(isEvent(contentTagObject)) nav.push('Event', {id: contentTagObject.data.id});
        if(isNode(contentTagObject)) nav.push('Search', {branch: contentTagObject.data.id});
        if(isLink(contentTagObject)) {
            dispatch(logAppActivity({type: 'linkOpen', data: {id: contentTagObject.data.id}}));

            if(await Linking.canOpenURL(contentTagObject.data.url))
                Linking.openURL(contentTagObject.data.url);
            else
                InAppBrowser.open(contentTagObject.data.url);
        }
    }, [nav, contentTagObject]);

    return <TouchableOpacity activeOpacity={0.75} onPress={handlePress} style={{backgroundColor, borderRadius: 30, height: 40, flexDirection: 'row', alignItems: 'center', padding: 4, paddingRight: 20, margin: 5}}>
        <ContentTagImage cto={contentTagObject} />
        <ContentTagLabel cto={contentTagObject} />
    </TouchableOpacity>
}


export interface ContentTagObject {
    type: ContentTagType
    data: {id: number, primary?: boolean}
}

export type ContentTagType = ContentTag['type'];

export type ContentPlaceTag = {
    type: 'place',
    data: contentGraph['places'][number]
}

export type ContentEventTag = {
    type: 'event',
    data: contentGraph['events'][number]
}
export type ContentNodeTag = {
    type: 'node',
    data: contentGraph['nodes'][number]
}
export type ContentTastemakerTag = {
    type: 'tastemaker',
    data: contentGraph['tastemakers'][number]
}
export type ContentPostTag = {
    type: 'post',
    data: contentGraph['posts'][number]
}
export type ContentLinkTag = {
    type: 'link',
    data: contentGraph['links'][number]
}

export type ContentTag = 
    ContentPostTag|
    ContentEventTag|
    ContentNodeTag|
    ContentTastemakerTag|
    ContentPlaceTag|
    ContentLinkTag;

const isEvent = (o: ContentTagObject): o is ContentEventTag => o.type === 'event';
const isPlace = (o: ContentTagObject): o is ContentPlaceTag => o.type === 'place';
const isPost = (o: ContentTagObject): o is ContentPostTag => o.type === 'post';
const isTastemaker = (o: ContentTagObject): o is ContentTastemakerTag => o.type === 'tastemaker';
const isNode = (o: ContentTagObject): o is ContentNodeTag => o.type === 'node';
const isLink = (o: ContentTagObject): o is ContentLinkTag => o.type === 'link';
export const getContentTagKey = (o: ContentTagObject) => `${o.type}_${o.data.id}`;

export const getContentTagLabel = (o: ContentTagObject): string => {
    if(isEvent(o)) return o.data.title;
    if(isPlace(o)) return o.data.name;
    if(isTastemaker(o)) return getFullName(o.data);
    if(isPost(o)) return o.data.title;
    if(isLink(o)) return o.data.name;
    if(isNode(o)) return o.data.name;
    return '';
}

export const getContentTags = (content: contentGraph) => {
    const tags: ContentTagObject[] = [];
    const {events,links,nodes,places,posts,tastemakers} = content;

    tags.push(...tastemakers.map(e => ({type: 'tastemaker' as const, data: e})));
    tags.push(...places.map(e => ({type: 'place' as const, data: e})));
    tags.push(...posts.map(e => ({type: 'post' as const, data: e})));
    tags.push(...events.map(e => ({type: 'event' as const, data: e})));
    tags.push(...links.map(e => ({type: 'link' as const, data: e})));
    tags.push(...nodes.map(e => ({type: 'node' as const, data: e})));

    return [...tags.filter(t => !!t.data.primary), ...tags.filter(t => !t.data.primary)];
}

export default ContentTagView;