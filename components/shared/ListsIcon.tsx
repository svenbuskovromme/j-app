import React, { FC } from "react";
import Svg, { Path, Rect } from "react-native-svg";

export const ListsIcon: FC<{color: string, fill: string, size: number}> = ({size, color,fill}) => {
    const gap = 12;
    const strokeWidth = 6;
    const d = 35;
    const br = 10;

    return <Svg width={size} height={size} viewBox={`0 0 ${d * 2 + strokeWidth + gap} ${d * 2 + strokeWidth + gap}`} fill="none">
        <Rect x={strokeWidth / 2} y={strokeWidth / 2} width={d} height={d} stroke={color} strokeWidth={strokeWidth} rx={br} ry={br} fill={fill}/>
        <Rect x={strokeWidth / 2} y={d + strokeWidth / 2 + gap} width={d} height={d} stroke={color} strokeWidth={strokeWidth} rx={br} ry={br} fill={fill}/>
        <Rect x={d + strokeWidth / 2 + gap} y={d + strokeWidth / 2 + gap} width={d} height={d} stroke={color} strokeWidth={strokeWidth} rx={br} ry={br} fill={fill}/>
        <Rect x={d + strokeWidth / 2 + gap} y={strokeWidth / 2} width={d} height={d} stroke={color} strokeWidth={strokeWidth} rx={br} ry={br} fill={fill}/>
    </Svg>    
}