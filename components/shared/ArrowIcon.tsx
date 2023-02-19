import React, { FC } from "react";
import Svg, { Path } from "react-native-svg";

const ArrowIcon: FC<{color?: string, size?: number, strokeWidth?: number}> = ({strokeWidth = 2, size = 22, color = 'white'}) => {
    return <Svg width={size} height={size} viewBox="2 2 18 18" fill="none">
        <Path d="M11 15.0002L15 11.0002M15 11.0002L11 7.00024M15 11.0002H7M21 11.0002" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
}

export default ArrowIcon;