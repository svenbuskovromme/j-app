import React, { FC } from "react";
import Svg, { Circle, Path } from "react-native-svg";

export const SearchIcon: FC<{fill?: string,color: string, size?: number}> = ({fill = 'transparent', color, size = 30}) => <Svg width={size} height={size} viewBox="-1 -1 29 29" fill="none">
    <Circle r={12} cx={13} cy={13} stroke={color} strokeWidth={3} fill={fill} />
    <Path d="M26 26 l-5 -5" stroke={color} strokeWidth={4} />
</Svg>