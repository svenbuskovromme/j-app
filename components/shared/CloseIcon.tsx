import React, { FC } from "react"
import Svg, { Path } from "react-native-svg"

const CloseIcon: FC<{size?: number}> = ({size = 22}) => {
    return <Svg width={size} height={size} viewBox="0 0 22 22" fill="none">
        <Path d="M11 21C16.5228 21 21 16.5228 21 11C21 5.47715 16.5228 1 11 1C5.47715 1 1 5.47715 1 11C1 16.5228 5.47715 21 11 21Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <Path d="M14 8L8 14" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <Path d="M8 8L14 14" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
}

export default CloseIcon;