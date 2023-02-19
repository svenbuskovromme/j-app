import React, { FC } from "react";
import Svg, { Path } from "react-native-svg";

const CheckMarkIcon: FC<{color?: string, size?: number, strokeWidth?: number}> = ({size = 20, strokeWidth = 4, color = '#030303'}) => {
    return <Svg width={size} height={size} viewBox={`${-strokeWidth/2} ${-strokeWidth/2} ${15 + strokeWidth} ${10 + strokeWidth}`}>
        <Path d={`M0 5L5 10L15 0`} stroke={color} strokeWidth={strokeWidth} strokeLinecap={'round'} strokeLinejoin={'round'} />
    </Svg>;
}

export default CheckMarkIcon;