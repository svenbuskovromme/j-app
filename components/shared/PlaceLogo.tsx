import { place } from "jungle-shared";
import React, { FC } from "react";
import { Image, View } from "react-native";
import FastImage from "react-native-fast-image";
import { source } from "utils";


export const PlaceLogo: FC<place & {borderWidth?: number, size: number, big?: boolean, round?: boolean}> = ({id, primaryColor, accentColor, size, borderWidth = 0}) => {
    return <View style={{borderWidth, borderColor: '#' + accentColor, height: size, width: size, borderRadius: size/2, overflow: 'hidden', backgroundColor: '#' + primaryColor}}><FastImage style={{height: '100%', width: '100%'}} source={{ uri: source.place.logo.small(id)}} /></View>
}