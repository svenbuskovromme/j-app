import React, { FC, PropsWithChildren } from "react";
import { useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import Gradient from "./Gradient";

const GradientHeader: FC<PropsWithChildren> = ({children}) => {
    const bounds = useWindowDimensions();
    const insets = useSafeAreaInsets();
    
    return <View pointerEvents={'box-none'} style={{overflow: 'hidden', width: bounds.width, zIndex: 10, flexDirection: 'row', position: 'absolute', top: 0, height: insets.top + 60}}>
        <Gradient direction="up" />
        <View style={{marginTop: insets.top, height: 50}}>
            {children}
        </View>
    </View>
}

export default GradientHeader;