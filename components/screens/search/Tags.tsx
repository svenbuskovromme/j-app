import React, { createContext, FC, Fragment, FunctionComponent, ReactElement, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, LayoutChangeEvent, Text, TouchableOpacity, View } from "react-native";
import Reanimated, { BaseAnimationBuilder, BounceIn, BounceInLeft, BounceOut, BounceOutLeft, ComplexAnimationBuilder, Easing, EntryExitAnimationFunction, FadeIn, FadeInDown, FadeInLeft, FadeInRight, FadeInUp, FadeOut, FadeOutDown, FadeOutLeft, FadeOutUp, Keyframe, Layout, runOnJS, SharedValue, SlideInLeft, SlideOutLeft, SlideOutRight, useAnimatedGestureHandler, useAnimatedReaction, useAnimatedStyle, useDerivedValue, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useAppDispatch, useAppSelector } from "redux/hooks";
import { branch, locationNodeRow, nodeRow, nodeTreeRow, placeNodeRow } from "jungle-shared";
import { FlatList, ScrollView, TapGestureHandler, TapGestureHandlerGestureEvent } from "react-native-gesture-handler";
import { FAVS_ID, nameFlatten, OPEN_NEW_ID, RootNavProps, RootScreenProps, setIntersect } from "utils";

import { FAVS, NEARBY, NEARBY_ID, OPEN_NOW } from "utils";
import { useNavigation, useRoute } from "@react-navigation/native";
import { ITagsContext, SearchContext, TagsContext } from "./contexts";
import { useGetUserPlacesQuery } from "redux/api";
import { skipToken } from "@reduxjs/toolkit/dist/query";

import {PERMISSIONS, request, RESULTS} from 'react-native-permissions';
import { getPermission } from "redux/app";
import Geolocation, { GeolocationResponse } from "@react-native-community/geolocation";
import { setUserLocation } from "redux/user";
import CenteredLoader from "components/shared/CenteredLoader";

const BranchInner: FC<{selected?: boolean, loading?: boolean, name: string, onPress(): void}> = ({selected = false,name,onPress, loading}) => {
    const [bgColor, setBgColor] = useState<string>('');
    const [textColor, setTextColor] = useState<string>('');
    const opacity = useSharedValue(1);

    const {nodesLoading} = useContext(SearchContext);
    
    const _onPress = useCallback(() => {
        onPress();
    }, [onPress]);
    const _onBegan = useCallback(() => {opacity.value = 0.5}, [opacity]);
    const _onFinish = useCallback(() => {opacity.value = 1}, [opacity]);

    useEffect(() => {
        setBgColor(selected ? 'white' : '#242424');
        setTextColor(selected ? '#030303' : 'white');
    }, [selected]);

    const uas = useAnimatedStyle(() => ({
        opacity: opacity.value
    }), [opacity]);

    return (
        <TapGestureHandler enabled={!nodesLoading} onActivated={_onPress} onBegan={_onBegan} onEnded={_onFinish} onFailed={_onFinish} onCancelled={_onFinish}>
            <Reanimated.View layout={Layout.duration(500).easing(Easing.out(Easing.poly(10)))} 
            entering={selected ? FadeInDown : FadeIn} exiting={selected ? FadeOutDown : FadeOut} 
            style={[{
                borderRadius: 30, paddingVertical: 10, paddingHorizontal: 20, margin: 5, backgroundColor: bgColor, borderColor: 'white', flexDirection: 'row'}, uas]}>
                    <Text style={{textTransform: 'capitalize', fontSize: 17, color: textColor}}>{name}</Text>
                    
                    {loading && <Reanimated.View entering={FadeIn} style={{marginLeft: 8}}>
                        <ActivityIndicator  />
                    </Reanimated.View>}
            </Reanimated.View>
        </TapGestureHandler>
    );
}

// const LocationBranchView: FC<{ln: locationNodeRow}> = ({ln}) => {
//     const context = useContext(SearchContext);

    
//     const handlePress = useCallback(() => {
//         dis
//     }, [ln]);

//     return <BranchInner selected={context.selectedLocationNode?.id === ln.id} name={ln.name} onPress={handlePress} />
// }

type BranchViewProps = { selected?: boolean, index?: number, flatIndices?: Set<number>, branch: branch, onPress(b: nodeRow): void};

const BranchView: FunctionComponent<BranchViewProps> = ({ index, branch, selected = false, onPress}) => {
    const selectedAnim = useSharedValue(selected);
    const [flatDisabled, setFlatDisabled] = useState(false);
    const {flatIndices} = useContext(TagsContext);

    const [loading, setLoading] = useState(false);

    const {selectedBranches} = useContext(SearchContext);

    useEffect(() => {
        const index = selectedBranches.indexOf(branch.id);
        const shouldBeSelected = index !== -1;
        setLoading((shouldBeSelected && !selected) || (!shouldBeSelected && selected));
    }, [selectedBranches, selected]);

    useEffect(() => {
        if(flatIndices?.size && typeof index !== 'undefined')
            setFlatDisabled(!flatIndices.has(index));
        else
            setFlatDisabled(false);
    }, [flatIndices, index]);

    const handlePress = useCallback(() => onPress(branch), [onPress, branch]);

    return !flatDisabled ?
        <BranchInner loading={loading} name={branch.name} selected={selected} onPress={handlePress} /> : null;
}

const MoreBranchView: FC<{onPress():void}> = ({onPress}) => {
    return <BranchInner name={' ··· '} onPress={onPress} />
}

type BranchTopViewProps = {viewState: 'filterFlat' | 'filterTree' | 'noFilter', branch: branch, children: ReactElement<BranchViewProps>[]}

const BranchTopView: FunctionComponent<BranchTopViewProps> = ({viewState, branch, children}) => {
    const [showAll, setShowAll] = useState(false);
    const [topView, setTopView] = useState<ReactElement<BranchViewProps>>();
    const [subViews, setSubViews] = useState<ReactElement[]>([]);
    const [showTopView, setShowTopView] = useState(false);
    const [showHideBtn, setShowHideBtn] = useState(false);

    useEffect(() => {
        let showAllButtons = false;
        const views: ReactElement[] = new Array( showAll ? children.length - 1 : 7);
        let index = 0;
        for(let i = 0; i < children.length; i++){
            if(viewState === 'noFilter' && !showAll && index === 6){
                views[index] = <MoreBranchView key={'more' + branch.id} onPress={() => setShowAll(true)} />;
                showAllButtons = true;
                break;
            }
            else{
                const view = children[i];

                if(view.props.branch.level > 1)
                    views[index++] = view;
                else{
                    setTopView(view);
                }
            }
        }
        
        setSubViews(views.filter((view, index, arr) => arr.findIndex(_view => _view.key === view.key) === index));
    }, [showAll, children]);

    useEffect(() => {
        setShowTopView(viewState !== 'filterFlat' && !!subViews.length);
        setShowHideBtn(viewState === 'noFilter' && subViews.length > 6 && showAll);
    }, [viewState, subViews, showAll]);

    return <Fragment>
        {
            viewState !== 'filterFlat' &&
            <TapGestureHandler key={'header_'+branch.id} enabled={showHideBtn} onActivated={() => setShowAll(false)}>
                <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between'}}>
                    {(showTopView && topView?.props.branch.id !== -1) && <Text style={{paddingHorizontal: 20, paddingTop: 15, paddingBottom: 5, textTransform: 'uppercase', fontSize: 12, fontWeight: '300', color: 'white'}}>{topView?.props.branch.name}</Text>}
                    {showHideBtn && <Text style={{color: 'white', alignSelf: 'flex-end', paddingHorizontal: 20, textDecorationLine: 'underline'}}>hide</Text>}
                </View>
            </TapGestureHandler>
        }
        {subViews}
    </Fragment>;
}

const Tags: FunctionComponent<{}> = ({}) => {
    const dispatch = useAppDispatch();
    const context = useContext(SearchContext);

    const {selectedBranches, selectablePlaces, toggleSelected, clearSelected} = useContext(SearchContext);
    
    const [allBranches, setAllBranches] = useState<branch[]>([]);
    const [root, setRoot] = useState<branch>();
    const [flat, setFlat] = useState(true);

    const [selectedViews, setSelectedViews] = useState<ReactNode>();
    const [selectableViews, setSelectableViews] = useState<ReactNode>();

    const [flatIndices, setFlatIndices] = useState<Set<number>>(new Set());
    const [tagsContext, setTagsContext] = useState<ITagsContext>({flatIndices});

    useEffect(() => {
        setTagsContext({flatIndices});
    }, [flatIndices]);

    // useEffect(() => {
    //     if(!root || !context.placeIdsMap.size)
    //         return;

    //     const selected = Array.from(selectedBranches.values());

    //     // setSelected(selected);
    //     setSelectedViews(selected.map(b => <BranchView selected={true} key={b.id} branch={b} onPress={handleBranchPress} />));

    //     return () => {
            
    //     };
    // }, [root, allBranches, selectedBranches]);

    useEffect(() => {
        // if(!root || !context.placeIdsMap.size)
        if(!context.branchRoot)
            return;

        let viewIndex = 0;

        const getBranchView = (branch: branch, selected: boolean) => {
            const view = <BranchView selected={selected} index={branch.level > 1 ? viewIndex : undefined} key={branch.id} onPress={handleBranchPress} branch={branch} />;
            if(branch.level > 1)
                viewIndex++;
            return view;
        };

        const newSelectableViews: ReactElement<BranchTopViewProps>[] = [];
        const viewsFlat: ReactElement<BranchViewProps>[] = [];
        const newSelectedViews: ReactElement<BranchTopViewProps>[] = [];

        const checkBranchIntersect = (branch: branch): [ReactElement<BranchViewProps>][] => {
            const views: [ReactElement][] = [];
            
            try{
                // const isSelectable = () => branch.id === NEARBY_ID || (newSelectableViews.findIndex(b => b.key === branch.id) === -1);
                
                // if(isSelectable()){
                    const index = selectedBranches.indexOf(branch.id);
                    const selected = index !== -1;
                    // if(!selectedBranches.has(branch.id))
                    if(!selected || context.searchTermQuery)
                        views.push([getBranchView(branch, selected)]);
                    else
                        newSelectedViews.push(<BranchView selected={selected} key={branch.id} branch={branch} onPress={handleBranchPress} />);
    
                    for(let i = 0; i < branch.children.length; i++)
                        views.push(...checkBranchIntersect(branch.children[i] as branch));
                // }
            }
            catch(e){}

            return views;
        }

        const viewState: BranchTopViewProps['viewState'] = !!context.selectedBranches.length ? flat ? 'filterFlat' : 'filterTree' : 'noFilter';

        const searchTerm = context.searchTermQuery ? nameFlatten(context.searchTermQuery.trim()) : null;

        const getBranchesWithPlaces = (branches: branch[]) => {
            for(let i = 0; i < branches.length; i++){
                const branch = branches[i];
                if(branch.level === 1 && branch.name === 'location')
                    continue;

                const views = checkBranchIntersect(branches[i]);

                views.filter(v => v[0].props.branch.level > 1).forEach(v => viewsFlat.push(v[0]));

                const isSearchEnabled = (str: string) => (!searchTerm || nameFlatten(str).includes(searchTerm));
                // const isSearchEnabled = (str: string) => true;

                const children = views.filter(v => isSearchEnabled(v[0].props.branch.name)).map(v => v[0]);

                newSelectableViews.push(<BranchTopView viewState={viewState} key={branches[i].id} children={children} branch={branches[i]} />);
            }
        }

        getBranchesWithPlaces(context.branchRoot.children as branch[]);

        const _flatIndices = new Set<number>();

        switch(viewState){
            case'noFilter': 
            case 'filterTree': setSelectableViews(newSelectableViews); break;
            case 'filterFlat': 
                if(viewsFlat.length > 10){
                    while(_flatIndices.size < 10){
                        const index = Math.round(Math.random() * (viewsFlat.length));
                        
                        _flatIndices.add(index);
                    }

                    if(!context.searchTermQuery){
                        let count = newSelectableViews.length,
                            randomnumber,
                            temp;
                        while( count ){
                            randomnumber = Math.random() * count-- | 0;
                            temp = newSelectableViews[count];
                            newSelectableViews[count] = newSelectableViews[randomnumber];
                            newSelectableViews[randomnumber] = temp;
                        }
                    }
                }

                setSelectableViews(newSelectableViews);
                
                if(viewsFlat.length > 10)
                    newSelectableViews.push(<MoreBranchView key={'moreFilter'} onPress={() => setFlat(false)} />);
            break;
        }

        setFlatIndices(_flatIndices);

        setSelectedViews(newSelectedViews.filter((a, b, c) => c.findIndex(aa => a.key === aa.key) === b));
    }, [context.branchRoot, flat]);

    const nav = useNavigation<RootNavProps>();

    const route = useRoute<RootScreenProps<'Search'>['route']>();

    useEffect(() => {
        if(route.params?.reset){
            clearSelected();
        }
        else{
            const branch = allBranches.find(b => b.id === route.params?.branch);
            if(branch){
                clearSelected(branch);
            }
        }
    }, [route.params, allBranches]);

    const handleBranchPress = useCallback(async (b: branch) => {
        if(b.id === NEARBY_ID && !(await context.handleNearbySelected()))
            return;

        toggleSelected(b);
    }, [toggleSelected, context.handleNearbySelected]);

    const handleLayout = useCallback((e: LayoutChangeEvent) => {
        context.setTagsHeight(e.nativeEvent.layout.height);
    }, [context.setTagsHeight]);

    return <TagsContext.Provider value={tagsContext}>
        {
            context.nodesLoading ? <CenteredLoader color={'white'} />:
            <Reanimated.View onLayout={handleLayout} pointerEvents={'box-none'} layout={Layout.duration(500).easing(Easing.out(Easing.poly(10)))} style={[{}]}>
                <Reanimated.View style={{flexDirection: 'row'}}>
                    <Reanimated.ScrollView showsHorizontalScrollIndicator={false} layout={Layout.duration(500).easing(Easing.out(Easing.poly(10)))} horizontal={true} style={{overflow: 'hidden'}}>
                        {selectedViews}
                    </Reanimated.ScrollView>
                </Reanimated.View>
                <Reanimated.View layout={Layout.duration(500).easing(Easing.out(Easing.poly(10)))} style={[{flexDirection: 'row', flexWrap:'wrap'}]}>
                    {selectableViews}
                </Reanimated.View>
            </Reanimated.View>
        }
    </TagsContext.Provider>
}

export default Tags;