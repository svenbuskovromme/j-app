import { nodeListGraph, placeNodeListItem } from "jungle-shared";
import React, { FC, useCallback, useContext, useEffect, useState } from "react";
import { Text, TextStyle, TouchableOpacity, useWindowDimensions, View } from "react-native";
import FastImage from "react-native-fast-image";
import Svg, { Defs, LinearGradient, Stop, Rect } from "react-native-svg";
import { RootNavContext, source } from "utils";

const NodeListButton: FC<{fontSize?: number, padding?: number, fontWeight?: TextStyle['fontWeight'], gradientOpacity?: string, locationNodeId: number, nodeList: nodeListGraph<'list'>}> = ({fontWeight = '400',gradientOpacity = '0.9',padding = 5, nodeList, locationNodeId, fontSize = 24}) => {
    const [posterPlace, setPosterPlace] = useState<placeNodeListItem>();
    const navContext = useContext(RootNavContext);

    useEffect(() => {
        const places = nodeList.places.slice().filter(p => !!p.content).sort((a, b) => b.id - a.id);
        
        setPosterPlace(places[0]);
    }, [nodeList]);

    const handlePress = useCallback(() => {
        navContext.navigation.push('List', {id: nodeList.node.id, locationNodeId});
    }, [navContext.navigation, locationNodeId]);

    return <TouchableOpacity activeOpacity={0.75} onPress={handlePress} style={{width: '100%', height: '100%'}}>
        <View style={{ flex: 1, alignItems:'flex-start', backgroundColor: '#242424', justifyContent: 'flex-end'}}>
            {
                !!posterPlace && 
                <FastImage source={{uri: source.content.image(posterPlace.content, 640)}} resizeMode={'cover'} style={{position: 'absolute', height: '100%', width: '100%'}} />
            }
            <Svg height="100%" width="100%" style={{position: 'absolute'}}>
                <Defs>
                    <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset={1 - (120/220)} stopColor="transparent" stopOpacity="0" />
                    <Stop offset="1" stopColor="#030303" stopOpacity={gradientOpacity} />
                    </LinearGradient>
                </Defs>
                <Rect x={0} y={0} width={'100%'} height={'100%'} fill={'url(#grad)'} />
            </Svg>
            <Text style={{padding, textTransform: 'capitalize', color: 'white', fontSize, fontWeight}}>{nodeList.node.name}</Text>
        </View>
    </TouchableOpacity>
}

export default NodeListButton;