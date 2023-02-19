import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import ContentCarousel from "components/shared/ContentCarousel";
import { contentGraph, locationRow, nodeRow, placeGraph, placeLinkType, place_link, postGraph, tastemakerGraph, userListDetails } from "jungle-shared";
import React, { createContext, FC, Fragment, ReactElement, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Image, LayoutChangeEvent, Linking, ListRenderItem, ListRenderItemInfo, ScrollView, Text, TextInput, TouchableOpacity, useWindowDimensions, View, ViewToken } from "react-native";
import { useDeleteUserListPlaceMutation, useGetPostsQuery, useGetUserListsQuery, usePutUserListMutation, usePutUserListPlaceMutation } from "redux/api";
import { dateFieldsSingle, dateFormatShort, getFullAddress, getFullName, getLinkDisplayName, getLinksOrder, RootNavContext, RootScreenProps, RootStackParamList, source } from "utils";
import { IPlaceScreenCtx, PlaceGraphContext, PlaceScreenContext, usePlaceBgColor, usePlaceBorderColor, usePlaceTextColor, ViewableContext } from "./utils";
import CenteredLoader from "components/shared/CenteredLoader";
import { useAppDispatch, useAppSelector } from "redux/hooks";
import { logAppActivity, PermissionKey } from "redux/app";
import InAppBrowser from "react-native-inappbrowser-reborn";
import { FlatList } from "react-native-gesture-handler";
import Feed from "components/shared/Feed";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import { PlaceLogo } from "components/shared/PlaceLogo";
import FastImage from "react-native-fast-image";
import { checkUser } from "redux/user";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import { BottomSheetBackdrop, BottomSheetBackdropProps, BottomSheetModal, BottomSheetModalProvider, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import ApiCheckbox from "components/shared/ApiCheckbox";
import AddUpdateList, { AddUpdateListHandle } from "components/shared/AddUpdateList";
import { MenuIcon } from "components/shared/MenuIcon";
import Icons from "components/shared/Icons";
import Gap from "components/shared/Gap";
import ActiveImage from "components/shared/ActiveImage";

const PlaceLinkButton: FC<{onPress: () => void, label: string, logo: ReactNode}> = ({onPress, label, logo}) => {
    return <TouchableOpacity activeOpacity={0.25} onPress={onPress} style={{height: 40, flexDirection: 'row', alignItems: 'center', marginHorizontal: 10, borderRadius: 25, backgroundColor:'#242424', paddingHorizontal: 15}}>
        {logo}
        <Gap x={12} />
        <Text style={{ color: '#ffffff', fontSize: 17, fontWeight: '600', textTransform: 'capitalize' }}>{label}</Text>
    </TouchableOpacity>
}

export const PlaceAbout: FC = () => {
    const placeGraph = useContext(PlaceGraphContext);

    const [appendHeight, setAppendHeight] = useState(0);
    const insets = useSafeAreaInsets();

    const handleLayout = useCallback((e: LayoutChangeEvent) => setAppendHeight(e.nativeEvent.layout.height), [setAppendHeight]);
    
    const user = useAppSelector(state => state.user.user);
    const dispatch = useAppDispatch();

    const {placeUserListAddModalHandle} = useContext(PlaceScreenContext);

    const handleAddPress = useCallback(async () => {
        try{
            await dispatch(checkUser({required: true, request: PermissionKey.followPlaces})).unwrap();
    
            placeUserListAddModalHandle?.addPlaceToLists({...placeGraph.place});
        }
        catch{}
    }, [placeUserListAddModalHandle]);

    return (
        
            <View style={{flex: 1, backgroundColor:'#030303', alignItems: 'center', justifyContent: 'flex-start'}}>
                <View style={{position: 'absolute', zIndex: 10, top: 0, height: insets.top + 50, width: '100%'}}>
                    <Svg height={'100%'} width={'100%'} >
                        <Defs>
                            <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                            <Stop offset="1" stopColor="#030303" stopOpacity="0" />
                            <Stop offset="0" stopColor="transparent" stopOpacity="1" />
                            </LinearGradient>
                        </Defs>
                        <Rect x={0} y={0} width={'100%'} height={'100%'} fill={'url(#grad)'} />
                    </Svg>
                </View>
                <TouchableOpacity activeOpacity={0.75} onPress={handleAddPress} style={[{ zIndex: 2, position: 'absolute', right: 20, bottom: 20, borderRadius: 25, paddingHorizontal: 15, paddingVertical: 10, backgroundColor: '#007aff'}]}>
                    <Text style={{fontSize: 20, color: 'white'}}>Add +</Text>
                </TouchableOpacity>
                <Feed appendHeight={appendHeight} place={placeGraph.place} append={
                <View onLayout={handleLayout} style={{paddingTop: insets.top}}>
                    <PlaceContentCarousel key={'placeContentCarousel'} />
                    <View style={{paddingHorizontal: 15 }}>
                        <View style={{height: 50}} />
                        <Title />
                        <View style={{height: 30}} />
                        <Links key={'placeLinks'} />
                        <View style={{height: 30}} />
                        <QuoteSnippet key={'placeQuoteSnippet'} />
                        <View style={{height: 30}} />
                        <People />
                        <Tags key={'placeTags'} />
                    </View>
                </View>} />
            </View>
    )
}

const LogoBig: FC = () => {
    const {place} = useContext(PlaceGraphContext);

    return <View style={{padding: 10, width: '100%', aspectRatio: 176 / 80, alignItems: 'center'}}>
        <Image source={{uri: source.place.logo.big(place.id)}} resizeMode={'contain'} style={{width: '60%', height: '100%'}} />
    </View>;
}

const Title: FC = () => {
    const {place, locationNodes} = useContext(PlaceGraphContext);

    console.log(locationNodes);
    const [nbNames, setNbNames] = useState('');

    useEffect(() => {
        setNbNames(
            locationNodes?.filter(n => n.type === 'neighborhood').map(n => n.name).join(', ') ||
            locationNodes?.filter(n => n.type === 'neighborhood').map(n => n.name).join(', ') ||
            ''
        );
    }, [locationNodes]);

    return (
        
            <View style={{width: '100%', flexDirection: 'row', alignItems: 'center'}}>
                <PlaceLogo {...place} size={50} />
                <Gap x={15} />
                <View style={{flex: 1}}>
                    <Text style={{flex: 1, fontSize: 35, fontWeight: '600', color: 'white'}}>{place.name}</Text>
                    {   
                        !!nbNames &&
                        <Text style={{textTransform: 'capitalize', fontSize: 16, color: '#727272', fontWeight: '500'}}>{nbNames}</Text>
                    }
                </View>
            </View>
        
    )
}

const PlaceContentCarousel: FC = () => {
    const {content, notes} = useContext(PlaceGraphContext);
    const {placeRecsModalHandle} = useContext(PlaceScreenContext);
    const showRecsModal = useCallback(() => {
        placeRecsModalHandle?.show(notes);
    }, [placeRecsModalHandle]);
   
    return <View>
        {
            !!notes.length &&
            <TouchableOpacity activeOpacity={0.75} onPress={showRecsModal} style={[{position: 'absolute', bottom: 20, right: 20, zIndex: 2}, {}]}>
                <Text style={{fontSize: 16, color: 'white'}}>Recommended by:</Text>
                <Gap y={15} />
                <View style={{flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center'}}>
                    {notes.length > 0 && <Text style={{marginRight: 15, color: 'white', fontSize: 16}}>···</Text>}
                    {notes.slice(0, 3).map(n => <View style={{marginLeft: -10}} key={n.note.id} >
                        <ActiveImage style={{ height: 40, width: 40, borderRadius: 20}} source={{uri: source.person.small(n.tastemaker.tastemaker.id)}} />
                    </View>)}
                </View>
            </TouchableOpacity>
        }
        {content.length ? <ContentCarousel showTags={false} screen={'Place'} aspectRatio={4/6} inView={true} content={content} /> : null}
    </View>
}

const QuoteSnippet: FC = () => {
    const {place} = useContext(PlaceGraphContext);
    const color = usePlaceTextColor(place);
    
    return <View style={{}}>
        <Text style={{fontSize: 18, fontWeight: '500', color}}>{place.quoteSnippet}</Text>
    </View>
}

const LinkLogo: FC<{label: string}> = ({label}) => {
    const size = 1.6;
    switch(true){
        case label.includes('menu'): return <Icons.Menu size={size} />
        case label.includes('shop'): return <Icons.Shop size={size} />
        case label.includes('directions'): return <Icons.LocationPin size={size} />
        case label.includes('instagram'): return <Icons.Instagram size={size} />
        case label.includes('gift'): return <Icons.Gift size={size} />
        case label.includes('reservation'): return <Icons.Reservations size={size} />
        case label.includes('call'): return <Icons.Call size={size} />
        default: return null
    }
}

const LinkView: FC<place_link & {last?:boolean}> = link => {
    const {label,type, last = false} = link;
    const placeGraph = useContext(PlaceGraphContext);
    const [displayLabel, setDisplayLabel] = useState('');
    const dispatch = useAppDispatch();

    const color = usePlaceTextColor();
    const backgroundColor = usePlaceBgColor();
    const lineColor = usePlaceBorderColor();

    useEffect(() => {
        setDisplayLabel(
            // type === placeLinkType.directions ? 
            //     getFullAddress(placeGraph) :
                getLinkDisplayName(link)
        );
    }, [label, type]);

    const handlePress = useCallback(() => {
        dispatch(logAppActivity({type: 'placeLinkOpen', data: {linkLabel: link.label, placeId: link.placeId}}));
        switch(link.type){
            case placeLinkType.directions:
                Linking.openURL(link.value);
                break;
            case placeLinkType.phoneNumber: 
                Linking.openURL(`telprompt:${link.value}`);
                break;
            case placeLinkType.url:
                if(link.label === 'instagram')
                    Linking.openURL(link.value)
                else
                    InAppBrowser.open(link.value as string, {
                        modalPresentationStyle: 'fullScreen',
                        animated: true,
                        preferredBarTintColor: backgroundColor
                    });
                break;
        }
    }, [link, dispatch, backgroundColor]);

    return <PlaceLinkButton logo={<LinkLogo label={link.label} />} label={displayLabel} onPress={handlePress} />
}

const DirectionsLink: FC = () => {
    const {locations} = useContext(PlaceGraphContext);
    const {placeLocationsModalRef} = useContext(PlaceScreenContext)

    const showLocations = useCallback(() => {placeLocationsModalRef?.open(locations);}, [placeLocationsModalRef]);

    if(!locations.length)
        return null;

    return <PlaceLinkButton 
    label={'Directions'}
    logo={<Icons.LocationPin size={1.6} />}
    onPress={showLocations}
    />;
    // <TouchableOpacity activeOpacity={0.75} onPress={showLocations} style={{height: 30, flexDirection: 'row', alignItems: 'center', marginHorizontal: 7.5, borderRadius: 25, backgroundColor:'#242424', paddingHorizontal: 15}}>
        
    //     <Gap x={10} />
    //     <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: '600', textTransform: 'capitalize' }}>Directions</Text>
    // </TouchableOpacity>
}

const Links: FC = () => {
    const {links} = useContext(PlaceGraphContext);
    
    const [sorted, setSorted] = useState<place_link[]>([]);

    useEffect(() => {
        //https://www.google.com/maps/place/?q=place_id:{your place id}
        const sorted = links.slice();
        sorted.sort((a, b) => getLinksOrder(a) - getLinksOrder(b))
        setSorted(sorted.filter(l => l.label !== 'directions'));
    }, [links]);

    return <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={{marginHorizontal: -7.5}}>
        <DirectionsLink />
        {sorted.map((link, index) => <LinkView key={link.label} {...link} last={index === links.length - 1} />)}
    </ScrollView>
}

const TagView: FC<{tag: nodeRow}> = ({tag}) => {
    const rootNav = useContext(RootNavContext) as RootScreenProps<'Place'>;
    const color = usePlaceTextColor();
    const lineColor = usePlaceBorderColor();
    const handlePress = useCallback(() => {
        rootNav.navigation.push('Search', {branch: tag.id});
    }, [rootNav, tag]);
    
    return <TouchableOpacity activeOpacity={0.75} onPress={handlePress} style={{backgroundColor: '#242424', alignItems: 'center', justifyContent: 'center', margin: 5, paddingVertical: 5, borderRadius: 20, paddingHorizontal: 15, height: 32, borderWidth: 1 }}>
        <Text style={{color: 'white', textTransform: 'capitalize'}}>{tag.name}</Text>
    </TouchableOpacity>;
}

const Tags: FC = () => {
    const {tags} = useContext(PlaceGraphContext);
    
    return <View style={{paddingVertical: 45, marginHorizontal: -5, flexDirection: 'row', flexWrap: 'wrap'}}>
        {tags.map(tag => <TagView key={tag.id} tag={tag} />)}
    </View>
}

const PeopleView: FC<{tmg: tastemakerGraph}> = ({tmg}) => {
    const navProps = useContext(RootNavContext);
    const handlePress = useCallback(() => {
        navProps.navigation.push('Tastemaker', {id: tmg.tastemaker.id});
    }, [navProps, tmg.tastemaker.id]);
    
    return <TouchableOpacity onPress={handlePress} activeOpacity={0.75} style={{marginHorizontal: 10, width: 150}}>
        <FastImage source={{uri: source.person.small(tmg.tastemaker.id)}} style={{width: '100%', aspectRatio: 1, borderRadius: 25}} />
        <View style={{height: 15}} />
        <Text style={{fontWeight: '600', fontSize: 15, color: 'white'}}>{getFullName(tmg.tastemaker)}</Text>
        <Text style={{fontWeight: '400', fontSize: 15, color: '#868686'}}>{tmg.tastemaker.role}</Text>
    </TouchableOpacity>
}

const People: FC = () => {
    const {people} = useContext(PlaceGraphContext);

    return <ScrollView style={{marginHorizontal: 0}} horizontal={true} showsHorizontalScrollIndicator={false}>
        {
            people.map(p => <PeopleView tmg={p} key={p.tastemaker.id} />)
        }
    </ScrollView>
}

const PostView: FC<{postGraph: postGraph}> = ({postGraph}) => {
    const color = usePlaceTextColor();
    const nav = useContext(RootNavContext) as RootScreenProps<'Place'>;
    const handlePress = useCallback(() => {nav.navigation.push('Post', {id: postGraph.post.id})}, [nav, postGraph.post]);
    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(logAppActivity({type: 'postImpression', data: {postId: postGraph.post.id}}));
    }, [dispatch]);

    return <TouchableOpacity activeOpacity={0.75} onPress={handlePress} style={{marginBottom: 40}}>
        <Image source={{uri: source.content.image(postGraph.contentPoster.id, 640)}} resizeMode={'cover'} style={{width: '100%', aspectRatio: 375/183}} />
        <View style={{padding: 15, paddingVertical: 8 }}>
            <Text style={{marginVertical: 7, color: color + '60', fontSize: 13}}>{dateFormatShort(postGraph.post.publishDate)}</Text>
            <Text style={{marginVertical: 7, color, fontSize: 19}}>{postGraph.post.title}</Text>
        </View>
    </TouchableOpacity>
}

const Posts: FC<{posts: (postGraph)[]}> = ({posts}) => {
    const lineColor = usePlaceBorderColor();
    const color = usePlaceTextColor();

    return <Fragment>
        {
            !!posts.length &&
            <View key={'place_news_header'} style={{height: 60, borderTopWidth: 1, borderBottomWidth: 1, borderColor: lineColor, alignItems: 'center', justifyContent: 'center'}}>
                <Text style={{color: color + '60'}}>Latest news</Text>
            </View>
        }
        {posts.map(p => <PostView key={'place_news_' + p.post.id} postGraph={p} />)}
    </Fragment>
}

export default PlaceAbout;
