import React, { FC } from "react";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

const Gradient: FC<{color?: string, direction: 'up'|'down', height?: string, opacity?: string}> = ({opacity='1', direction, height = '100%', color='#030303'}) => {
    return <Svg height={height} width={'100%'} style={[{position: 'absolute'}, direction === 'up' ? {top: 0} : {bottom: 0}]} >
        <Defs>
            <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="1" stopColor={color} stopOpacity={direction === 'up' ? "0" : opacity} />
                <Stop offset="0" stopColor="transparent" stopOpacity={direction === 'up' ? opacity : '0'} />
            </LinearGradient>
        </Defs>
        <Rect x={0} y={0} width={'100%'} height={'100%'} fill={'url(#grad)'} />
    </Svg>
}

export default Gradient;