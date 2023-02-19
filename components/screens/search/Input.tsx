import {BottomSheetTextInput, useBottomSheetInternal } from '@gorhom/bottom-sheet';

import React, { Context, FC, Fragment, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Reanimated, { FadeInRight, FadeOutRight, Layout, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { RootNavContext, RootScreenProps } from 'utils';
import { SearchContext } from './contexts';

export const SearchInput: FC = () => {
    const context = useContext(SearchContext);
    const inputUAS = useAnimatedStyle(() => ({}));
    
    // const { shouldHandleKeyboardEvents } = useBottomSheetInternal();

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(context.searchTerm.trim() !== context.searchTermQuery.trim() || context.nodesLoading);
    }, [context.searchTerm, context.searchTermQuery, context.nodesLoading]);

    useEffect(() => {
        opacity.value = withSpring(loading ? 1 : 0, {overshootClamping: false});
    }, [loading]);
    
    const handleFocus = useCallback(() => {
        // shouldHandleKeyboardEvents.value = Platform.OS === 'ios';
        context.setSearchMode(true);
        context.setInputFocused(true);
    }, [
        context.setInputFocused, context.setSearchMode
    ]);
    const handleBlur = useCallback(() => {
        // shouldHandleKeyboardEvents.value = false;
        context.setInputFocused(false);
    }, [
        context.setInputFocused
    ]);

    const opacity = useSharedValue(0);
    const loadUas = useAnimatedStyle(() => ({opacity: opacity.value}), [opacity]);
    const searchUas = useAnimatedStyle(() => ({opacity: 1 - opacity.value}), [opacity]);
    const inputRef = useRef<TextInput>(null);

    useEffect(() => {
        if(!context.searchMode)
            inputRef.current?.blur();
    }, [inputRef.current, context.searchMode]);

    const [value, setValue] = useState('');

    const selectedBranchesLength = useRef(0);

    useEffect(() => {
        if(selectedBranchesLength.current < context.selectedBranches.length)
            setValue('');
            
        selectedBranchesLength.current = context.selectedBranches.length;
    }, [context.selectedBranches.length]);

    useEffect(() => { context.setSearchTerm(value); }, [value, context.setSearchTerm]);

    const handleClear = useCallback(() => {setValue('')}, []);

    return <Reanimated.View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', padding: 15, alignItems: 'center'}}>
        <Reanimated.View layout={Layout.springify().damping(50)} style={[{ flex: 1, backgroundColor: '#262626', flexDirection: 'row', alignItems: 'center', borderRadius: 30}, inputUAS]}>
            <View style={{width: 40, height: 40}}>
                <Reanimated.View style={[{position: 'absolute'}, loadUas]}>
                    <ActivityIndicator style={{margin: 10, width: 18}} color={'white'} /> 
                </Reanimated.View>
                <Reanimated.View style={[{position: 'absolute'}, searchUas]}>
                    <Svg width="18" height="18" viewBox="0 0 27 24" fill="none" style={{margin: 10}}>
                        <Path d="M26 21.6638L21.0418 17.7599C21.0496 17.7487 21.0574 17.7375 21.0652 17.7262C21.4617 17.1521 21.8005 16.5417 22.0767 15.9037C22.3574 15.2543 22.5716 14.5794 22.7163 13.8888C22.8646 13.1776 22.9392 12.4535 22.9391 11.7277C22.9392 11.0018 22.8645 10.2778 22.7162 9.5666C22.5715 8.87597 22.3573 8.20105 22.0766 7.55171C21.8005 6.91366 21.4617 6.30328 21.0651 5.72914C20.6714 5.15966 20.2231 4.62823 19.7262 4.14207C19.2291 3.65609 18.6856 3.21761 18.1033 2.83262C17.5162 2.44484 16.8921 2.11355 16.2397 1.84339C15.5757 1.56891 14.8856 1.35941 14.1794 1.21797C13.4521 1.07287 12.7118 0.999848 11.9695 1C11.2273 0.999851 10.487 1.07288 9.75973 1.21797C9.05353 1.35941 8.36339 1.56891 7.69941 1.84339C7.04699 2.11353 6.42285 2.44481 5.83573 2.83262C5.25341 3.21761 4.71 3.65609 4.21288 4.14207C3.71594 4.62822 3.26759 5.15965 2.87394 5.72914C2.47736 6.30329 2.13858 6.91367 1.86236 7.55171C1.58173 8.20106 1.36752 8.87598 1.22284 9.5666C1.07449 10.2778 0.999831 11.0018 1 11.7277C0.999833 12.4535 1.07449 13.1776 1.22284 13.8888C1.36752 14.5794 1.58173 15.2543 1.86236 15.9036C2.13858 16.5416 2.47736 17.152 2.87394 17.7262C3.26757 18.2957 3.71591 18.8271 4.21288 19.3132C4.71 19.7992 5.25341 20.2377 5.83573 20.6227C6.42285 21.0105 7.04699 21.3418 7.69941 21.6119C8.36339 21.8864 9.05353 22.0959 9.75973 22.2374C10.487 22.3824 11.2273 22.4555 11.9695 22.4553C12.7118 22.4555 13.4521 22.3824 14.1794 22.2374C14.8856 22.0959 15.5757 21.8864 16.2397 21.6119C16.8921 21.3418 17.5162 21.0105 18.1034 20.6227C18.6857 20.2377 19.2291 19.7992 19.7262 19.3132C19.7991 19.242 19.871 19.1697 19.9419 19.0963L24.8998 23L26 21.6638ZM17.1212 19.2012C16.6282 19.5269 16.1041 19.8051 15.5562 20.0319C14.9991 20.2622 14.4202 20.438 13.8277 20.5567C13.2162 20.6786 12.5936 20.74 11.9695 20.7398C11.3454 20.74 10.7229 20.6786 10.1114 20.5567C9.5189 20.438 8.93986 20.2622 8.38276 20.0319C7.83488 19.8051 7.31076 19.5269 6.81774 19.2012C6.32815 18.8775 5.87126 18.5088 5.4533 18.1002C5.03547 17.6916 4.6585 17.2448 4.32752 16.7661C3.99448 16.2839 3.70998 15.7714 3.47799 15.2356C3.2425 14.6908 3.06277 14.1245 2.94141 13.5451C2.81675 12.947 2.75403 12.3382 2.7542 11.7279C2.75403 11.1176 2.81675 10.5088 2.94141 9.91075C3.06276 9.3313 3.2425 8.76503 3.47799 8.22023C3.70998 7.68444 3.99448 7.17188 4.32752 6.68973C4.65849 6.21091 5.03546 5.7641 5.4533 5.35538C5.87125 4.94675 6.32814 4.57808 6.81774 4.25438C7.31077 3.92871 7.83489 3.65049 8.38276 3.42363C8.93985 3.19334 9.51889 3.01757 10.1114 2.89888C10.7229 2.77693 11.3454 2.71558 11.9695 2.71575C12.5936 2.71557 13.2162 2.77693 13.8277 2.89888C14.4202 3.01757 14.9992 3.19334 15.5563 3.42363C16.1041 3.65043 16.6282 3.92857 17.1212 4.25414C17.6108 4.57784 18.0677 4.94651 18.4857 5.35514C18.9035 5.76386 19.2805 6.21067 19.6114 6.68949C19.9445 7.17164 20.229 7.6842 20.461 8.21999C20.6964 8.76481 20.8761 9.33108 20.9975 9.91051C21.1222 10.5085 21.185 11.1173 21.1849 11.7277C21.185 12.338 21.1223 12.9468 20.9976 13.5448C20.8762 14.1243 20.6965 14.6905 20.4611 15.2353C20.2291 15.7712 19.9446 16.2838 19.6116 16.7661C19.2806 17.2448 18.9036 17.6916 18.4858 18.1002C18.0678 18.5088 17.6109 18.8775 17.1212 19.2012Z" 
                        fill="#A8A8A8" 
                        stroke="#A8A8A8" 
                        strokeWidth="0.3"/>
                    </Svg>
                </Reanimated.View>
            </View>
            <TextInput selectionColor={'white'} placeholder={'Search'} onFocus={handleFocus} onBlur={handleBlur} style={{ height: 40, opacity: 1, flex: 1, paddingHorizontal: 10, borderRadius: 0, fontSize: 18, color: 'white'}} ref={inputRef} 
            value={value} returnKeyType={'done'} onChangeText={setValue} 
            // value={value} returnKeyType={'done'} onChangeText={setValue} 
            autoCorrect={false} placeholderTextColor={'#4A4A4A'} clearButtonMode={'always'}></TextInput> 
        </Reanimated.View>
        <CancelButton onPress={handleClear} />
    </Reanimated.View>
}

const CancelButton: FC<{onPress: () => void}> = ({onPress}) => {
    const context = useContext(SearchContext);
    const clearButtonUAS = useAnimatedStyle(() => ({}));
    
    const handleClear = useCallback(() => {
        context.clearSelected();
        context.setSearchMode(false);
        // context.setSearchTermQuery('');
        onPress();
    }, [context.clearSelected, onPress]);

    return (
        <Reanimated.View entering={FadeInRight} exiting={FadeOutRight} style={[{}, clearButtonUAS]}>
            {
                context.searchMode ?
                <TouchableOpacity activeOpacity={0.75} style={{height: 40, width: 70, alignItems: 'center', justifyContent: 'center'}} onPress={handleClear} hitSlop={{top:10, bottom: 10, left: 10, right: 10}}>
                    <Text style={{color: 'white'}}>Cancel</Text>
                </TouchableOpacity> : null
            }
        </Reanimated.View>
    )
}

export default SearchInput;