import React, { FC } from "react"
import Svg, { Path } from "react-native-svg";

const BookmarkIcon: FC<{size?: number, fill?: string, color?: string}> = ({color = '#030303', size = 20, fill='transparent'}) => {
    return <Svg width={size * (16/22)} height={size} viewBox="0.5 1.5 15 17" fill="none" style={{}}>
        <Path strokeWidth={2} fill={fill} stroke={color} d={"M 1.492 3.449 V 17.377 C 1.561 18.772 3.213 19.391 4.121 18.648 L 7.613 15.475 C 7.83 15.306 8.085 15.306 8.282 15.502 L 11.682 18.527 C 12.721 19.495 14.432 18.735 14.52 17.456 V 3.443 C 14.541 2.329 13.346 1.026 12.042 0.998 H 4.03 C 2.699 1.053 1.639 2.139 1.492 3.443Z"}/>
    </Svg>
}

export default BookmarkIcon;
