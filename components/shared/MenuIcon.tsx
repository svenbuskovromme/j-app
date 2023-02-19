import React, { FC } from "react";
import Svg, { Rect } from "react-native-svg";

export const MenuIcon: FC<{color: string}> = ({color}) => <Svg style={{}} width="30" height="30" viewBox="0 0 30 30" fill="none">
    <Rect x="0" y="11" width="30" height="2" fill={color}/>
    <Rect x="0" y="19" width="30" height="2" fill={color}/>
</Svg>