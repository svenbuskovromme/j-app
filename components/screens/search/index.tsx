import { Header } from "@react-navigation/elements";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import { NAV_HEIGHT, NAV_TOP } from "config";
import React, { Context, FC, Fragment, ReactElement, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { InteractionManager, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, useWindowDimensions, View } from "react-native";
import { FlatList, ScrollView } from "react-native-gesture-handler";
import Reanimated, { Easing, FadeInRight, FadeInUp, FadeOut, FadeOutRight, FadeOutUp, Layout, max, useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import { useSafeArea, useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, Defs, G, LinearGradient, Path, Rect, Stop } from "react-native-svg";
import { getPermission, logAppActivity, PermissionKey, setTabNavColors } from "redux/app";
import { useAppDispatch, useAppSelector, useLocationNode, useLocationNodeId } from "redux/hooks";
// import { clearSelected } from "redux/search";
import { nameFlatten, getOpenNow, RootNavProps, RootScreenProps, setIntersect, NEARBY_ID, orderPlacesByDistance, FAVS, FAVS_ID, NEARBY, OPEN_NEW_ID, OPEN_NOW, RootNavContext} from '../../../utils';
import { ISearchContext, queryInterval, SearchContext } from "./contexts";

import Places from "./Places";
import JungleMap from 'components/singles/Map';
import Geolocation, { GeolocationResponse } from "@react-native-community/geolocation";
import { PERMISSIONS } from "react-native-permissions";
import { place, branch, locationNodeRow, searchAndMapRow } from "jungle-shared";
import { setUserLocation } from "redux/user";
import { graphApi, useGetLocationNodeByQuery, useGetSearchNodesQuery } from "redux/api";
import { setFilter } from "redux/locationNodes";
import LocationNode from "components/shared/LocationNode";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import SearchInput from "./Input";
import LocationHeader from "components/shared/LocationHeader";
import JungleIcon from "components/shared/JungleIcon";
import GradientHeader from "components/shared/GradientHeader";
import Gradient from "components/shared/Gradient";

export const Search: FC<{}> = () => {
    const dispatch = useAppDispatch();
    
    const [selectedBranches, setSelectdBranches] = useState<number[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchMode, setSearchMode] = useState(false);
    const [searchTermQuery, setSearchTermQuery] = useState('');
    const [queryLimit, setQueryLimit] = useState(queryInterval);
    const searchTermQueryTimerRef = useRef<any>();
    const locationNodeId = useLocationNodeId();

    useEffect(() => {
        clearTimeout(searchTermQueryTimerRef.current);

        if(queryLimit !== queryInterval)
            setQueryLimit(queryInterval);

        if(searchTerm){
            searchTermQueryTimerRef.current = setTimeout(async () => {
                setSearchTermQuery(searchTerm.trim());
            }, 250);
        }
        else
            setSearchTermQuery(searchTerm.trim());

    }, [searchTerm]);

    const nodeTreeData = useGetSearchNodesQuery(locationNodeId ? {limit: queryLimit, selectedBranches: selectedBranches, searchTerm: searchTermQuery, selectedLocation: locationNodeId} : skipToken, {});

    const nav = useNavigation<RootNavProps>();

    useFocusEffect(() => {
        dispatch(setTabNavColors());
        dispatch(setFilter('search'));
    });

    const clearSelected = useCallback((branch?: branch) => {
        const selectedBranches: number[] = [];
            
        if(branch)
            selectedBranches.push(branch.id);

        setSelectdBranches(selectedBranches);
    }, [setSelectdBranches]);

    const [context, setContext] = useState<ISearchContext>({searchTerm: '', searchTermQuery: '', searchItems: []} as any as ISearchContext);
    const [placeIdsMap, setPlaceIdsMap] = useState<Map<number, Set<number>>>(new Map);

    const toggleSelected = useCallback((branch: branch) => {
        const index = selectedBranches.indexOf(branch.id);
        const newSelected = selectedBranches.slice();

        index === -1 ?
            newSelected.push(branch.id) :
            newSelected.splice(index, 1);

        if(index === -1){
            dispatch(logAppActivity({type: 'searchCategorySelect', data: {nodeId: branch.id}}));
            setSearchTerm('');
        }
        
        setSelectdBranches(newSelected);
    }, [selectedBranches, setSelectdBranches, placeIdsMap, setSearchTerm, dispatch]);

    useEffect(() => {
        if(!!selectedBranches.length)
            setSearchMode(true);
    }, [selectedBranches.length]);

    const [watchId, setWatchId] = useState<number>();
    const userLocation = useAppSelector(state => state.user.geolocation);
    
    useEffect(() => {
        return () => {watchId && Geolocation.clearWatch(watchId)};
    }, [watchId]);
    
    const handleNearbySelected = useCallback(async () => {
        const permission = await dispatch(getPermission({permission: 'location', request: PermissionKey.enableLocation, required: true})).unwrap();
        
        if(!permission)
            return false;
        
        if(!watchId)
            setWatchId(Geolocation.watchPosition(position => dispatch(setUserLocation(position))));
        
        return true;
    }, []);

    const [refreshing, setRefreshing] = useState(false);
    const [tagsHeight, setTagsHeight] = useState(0);
    const [inputFocused, setInputFocused] = useState(false);
    
    const onRefresh = useCallback(async () => {
        // setRefreshing(true);
        dispatch(graphApi.util.invalidateTags(['events', 'posts']));
    }, []);
    useEffect(() => {
        clearSelected();
    }, [locationNodeId]);

    const nodeTreeDataTimerRef = useRef<any>(null);
    const previousRequestId = useRef<any>(null);
    const currentRequestId = useRef<any>(null);
    const timerRequestId = useRef<any>(null);
    const [currentSearchData, setCurrentSearchData] = useState<searchAndMapRow & {root: branch}>();

    useEffect(() => {
        currentRequestId.current = nodeTreeData.requestId;

        if(nodeTreeDataTimerRef.current !== null){
            clearTimeout(nodeTreeDataTimerRef.current);
            nodeTreeDataTimerRef.current = null;
        }

        return () => {
            previousRequestId.current = currentRequestId.current;
        }
    }, [nodeTreeData.requestId]);

    useEffect(() => {
        const data = nodeTreeData.data;
        const requestId = nodeTreeData.requestId;
        
        if(!!data && nodeTreeData.isSuccess){
            timerRequestId.current = requestId;

            
            requestAnimationFrame(() => {
                if(!nodeTreeData.isFetching)
                    setCurrentSearchData(data);
            });  
            
            // nodeTreeDataTimerRef.current = setTimeout(() => {
            //     if(!nodeTreeData.isFetching && timerRequestId.current === nodeTreeData.requestId){
            //             setCurrentSearchData(data);
            //         }
            //         nodeTreeDataTimerRef.current = null;
            // }, 50);
        }
    }, [nodeTreeData.data, nodeTreeData.isFetching]);

    useEffect(() => {
        const {
            locationNodes = [],
            locations = [],
            nodes = [],
            tastemakers = [],
            places = [],
            root = null,
            hasMoreResults,
            items,
        } = currentSearchData ?? {};

        setContext({
            selectablePlaces: [],
            branchRoot: root,
            locationNodes: locationNodes ?? [],
            locations: locations ?? [],
            searchItems: items ?? [],
            nodesLoading: nodeTreeData.isLoading,
            selectedBranches,
            clearSelected,
            setSearchTerm,
            searchMode,
            setSearchMode,
            toggleSelected,
            searchTerm,
            searchTermQuery,
            handleNearbySelected,
            refreshing,
            onRefresh,
            setTagsHeight,
            tagsHeight,
            inputFocused,
            setInputFocused,
            queryLimit, setQueryLimit,
            hasMoreResults: hasMoreResults ?? !!context?.hasMoreResults
        });

    }, [selectedBranches, inputFocused, currentSearchData, nodeTreeData.isLoading, searchTermQuery, setInputFocused, tagsHeight, setTagsHeight, clearSelected, toggleSelected, searchMode, setSearchMode, searchTerm, setSearchTerm, placeIdsMap, setPlaceIdsMap, handleNearbySelected, refreshing, onRefresh]);

    const insets = useSafeAreaInsets();
    const bounds = useWindowDimensions();

    useEffect(() => {
        if(!selectedBranches.length)
            setQueryLimit(queryInterval);
    }, [selectedBranches]);
    
    return <View style={{flex: 1}}>
        {
                !!context ?
                    <SearchContext.Provider value={context}>
                        <View style={[
                            {
                                zIndex:4, width: bounds.width, flex: 1, overflow: 'hidden', 
                                backgroundColor: '#030303'
                            }]}>
                            <Places />
                            <JungleMap />
                        </View>
                        <LocationHeader fontSize={24} />
                    </SearchContext.Provider> :
                    null
        }
        {/* <SearchContext.Provider value={context}>
            <SearchInput />
            <TextInput value={searchTerm} onChangeText={setSearchTerm} style={{color: 'white'}} placeholderTextColor={'white'} placeholder={'search'} />
            <TouchableOpacity activeOpacity={0.75} onPress={() => {
                clearSelected();
                setQueryLimit(10);
                setSearchTerm('');
                }}>
                <Text style={{color:'white'}}>Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.75} onPress={() => { setQueryLimit(queryLimit + 10) }}>
                    <Text style={{color: 'white'}}>Increase</Text>
                </TouchableOpacity>
            <View style={{height: 500}}>
                
            </View>
        </SearchContext.Provider> */}
    </View>
}

// export const Test: FC<{text: string}> = ({text}) => {
//     const [testOver, setTestOver] = useState(false);

//     useEffect(() => {
//         setTimeout(() => {
//             setTestOver(true);
//         }, 1000);
//     }, []);

//     return <View>
//         {
//             testOver ? null : <Reanimated.View exiting={FadeOut} ><Text style={{color: 'white'}}>Testing</Text></Reanimated.View>
//         }
//         <Text style={{color: 'white'}}>{text}</Text>
//     </View>
// }

export const SearchScreen: FC<RootScreenProps<'Search'>> = navProps => {
    const bounds = useWindowDimensions();
    const insets = useSafeAreaInsets();
    // const footerHeight = useAppSelector(state => state.app.footerHeight);
    const footerHeight = 0;
    const {navigation,route: {params: {branch: parametersBranch} = {}}} = navProps;

    const [headerShown, setHeaderShown] = useState(false);

    useEffect(() => {
        const canGoBack = navProps.navigation.canGoBack();
        
        navProps.navigation.setOptions({
            headerShown: false
        });

        setHeaderShown(canGoBack);
    }, [navProps.navigation]);

    return <RootNavContext.Provider value={navProps}>
        <Search />
    </RootNavContext.Provider>
}

export default SearchScreen;