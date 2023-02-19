import React, { FC } from "react"
import Svg, { Path } from "react-native-svg";

const Icon: FC<{size?: number}> = ({size = 1}) => {
    return <Svg width={size * 9} height={size * 10} viewBox="0 0 9 10" fill="none">
        <Path d="M6.5 1H2.5C1.39543 1 0.5 1.89543 0.5 3V7C0.5 8.10457 1.39543 9 2.5 9H6.5C7.60457 9 8.5 8.10457 8.5 7V3C8.5 1.89543 7.60457 1 6.5 1Z" stroke="white" strokeLinecap="round" strokeLinejoin="round"/>
        <Path d="M6.09969 4.74812C6.14905 5.08102 6.09219 5.42101 5.93719 5.71973C5.78219 6.01845 5.53695 6.26069 5.23634 6.41199C4.93573 6.56329 4.59507 6.61596 4.2628 6.56249C3.93054 6.50903 3.62359 6.35215 3.38562 6.11418C3.14765 5.87622 2.99078 5.56927 2.93731 5.23701C2.88385 4.90474 2.93651 4.56408 3.08782 4.26347C3.23912 3.96286 3.48136 3.71762 3.78008 3.56262C4.0788 3.40762 4.41879 3.35076 4.75169 3.40012C5.09126 3.45047 5.40563 3.60871 5.64837 3.85144C5.8911 4.09418 6.04933 4.40855 6.09969 4.74812Z" stroke="white" strokeLinecap="round" strokeLinejoin="round"/>
        <Path d="M6.7002 2.80005H6.7045" stroke="white" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>    
}

export default Icon;