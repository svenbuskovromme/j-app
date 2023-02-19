import { FC } from "react";
import Svg, { Path } from "react-native-svg";

const Icon: FC<{size?: number}> = ({size = 1}) => {
    return <Svg width={size * 9} height={size * 8} viewBox="0 0 9 8" fill="none">
    <Path fillRule="evenodd" clipRule="evenodd" d="M5.72604 0C6.64604 0 7.36604 0.68 7.44604 1.56L8.04604 6.12C8.08604 6.6 7.92604 7.08 7.60604 7.44C7.24604 7.8 6.80604 8 6.32604 8H1.72604C1.24604 8 0.766041 7.8 0.446041 7.44C0.126041 7.08 -0.0339594 6.6 0.00604061 6.12L0.566041 1.56C0.646041 0.68 1.36604 0 2.24604 0H5.72604ZM1.96354 1.7201C1.96354 2.8401 2.88354 3.7601 4.00354 3.7601C5.12354 3.7601 6.04354 2.8401 6.04354 1.7201C6.04354 1.4801 5.88354 1.3201 5.64354 1.3201C5.40354 1.3201 5.24354 1.4801 5.24354 1.7201C5.24354 2.4001 4.68354 2.9601 4.00354 2.9601C3.32354 2.9601 2.76354 2.4001 2.76354 1.7201C2.76354 1.4801 2.60354 1.3201 2.36354 1.3201C2.12354 1.3201 1.96354 1.4801 1.96354 1.7201Z" fill="white"/>
    </Svg>
    
}

export default Icon;