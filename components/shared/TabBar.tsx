import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { ParamListBase } from "@react-navigation/native";
import { usePlaceTextColor } from "components/screens/place/utils";
import React, { FC, ReactNode, useCallback } from "react";
import { Text, TouchableOpacity, useWindowDimensions, View } from "react-native";

type route = BottomTabBarProps['state']['routes'][number];

const Tab: FC<{onPress(route: route): void, color: string,  placeTabs: boolean, state: {index: number}, route:route, index: number }> = ({placeTabs, color, route, index, state, onPress}) => {
    const handlePress = useCallback(() => {onPress(route)}, [route]);

    return <TouchableOpacity activeOpacity={0.75} key={route.key} hitSlop={{top: 20, bottom: 20}} style={[
            { opacity: index === state.index ? 1: 0.5,alignItems: 'center', justifyContent: 'center', height: '100%'}, 
            placeTabs && route.name === 'People' ? {marginLeft: 30, marginRight: 'auto'}:null
        ]} onPress={handlePress}>
        <Text style={{position: 'absolute', top:0, color, textAlign: 'center', fontSize: 40, opacity: index === state.index ? 1 : 0}}>·</Text>
        <Text style={{color, fontSize: 13, textTransform: 'uppercase', fontWeight: index === state.index ? '400' :'400' }}>{route.name}</Text>
    </TouchableOpacity>};

const TabBar: FC<BottomTabBarProps & {placeTabs?: boolean, tabRender?: (route: BottomTabBarProps['state']['routes'][number], index: number) => ReactNode, color: string, backgroundColor: string, lineColor: string}> = ({placeTabs = false, backgroundColor,color,lineColor, tabRender,... props}) => {
    const bounds = useWindowDimensions();
    const state = props.navigation.getState();

    const handleTabPress = useCallback((route: route) => {
        props.navigation.navigate(route.name);
    }, [props.navigation]);

    const _tabRender = useCallback((route: BottomTabBarProps['state']['routes'][number], index: number) => tabRender ? tabRender(route, index) : 
        <Tab key={route.name} onPress={handleTabPress} color={color} index={index}  placeTabs={placeTabs} route={route} state={state} />, [tabRender, state, color, handleTabPress, placeTabs]);
    
    return <View style={{width: bounds.width, height: 80, backgroundColor}}>
        <View style={{width: '100%', top: 0, height: 1, backgroundColor: lineColor}}></View>
        <View style={{flexDirection: 'row', height: '100%', width: '100%', justifyContent: 'space-between', paddingHorizontal: 30}}>
            {
                props.state.routes.map(_tabRender)
            }
        </View>
    </View>;
}

export default TabBar;