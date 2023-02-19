import React, { FC } from "react"
import Svg, { Path } from "react-native-svg"

const MoreIcon: FC<{strokeWidth?:number, size?: number, color: string, rotate?: number}> = ({color, rotate = 0, size = 25, strokeWidth = 2 }) => {
    return <Svg width={size} height={size * 13/25} viewBox={`${-strokeWidth/2 + 2} ${-strokeWidth/2 + 2} ${25 + strokeWidth - 2} ${13 + strokeWidth - 2}`} fill="none" style={{transform: [{rotateZ: `${rotate}deg`}]}}>
        <Path d="M23.0012 11.7328L12.4605 1.19214L1.91992 11.7328" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>    
}

export default MoreIcon;