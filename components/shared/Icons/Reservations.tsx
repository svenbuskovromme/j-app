import { FC } from "react";
import Svg, { Path } from "react-native-svg";

const Icon: FC<{color?: string, fill?: string, size?: number}> = ({color = 'white', fill = 'white', size = 1}) => {
    // return <Svg width={size * (24/27)} height={size} viewBox="0 0 24 27" fill="none">
    //     <Path fillRule="evenodd" clipRule="evenodd" d="M18.1012 2.0001C18.1012 1.36497 17.5863 0.850098 16.9512 0.850098C16.3161 0.850098 15.8012 1.36497 15.8012 2.0001V3.15H8.90156V2.0001C8.90156 1.36497 8.38669 0.850098 7.75156 0.850098C7.11643 0.850098 6.60156 1.36497 6.60156 2.0001V3.15H4.30156C2.39618 3.15 0.851562 4.69462 0.851562 6.6V22.7C0.851562 24.6054 2.39618 26.15 4.30156 26.15H20.4016C22.3069 26.15 23.8516 24.6054 23.8516 22.7V6.6C23.8516 4.69462 22.3069 3.15 20.4016 3.15H18.1012V2.0001ZM4.30156 5.45C3.66644 5.45 3.15156 5.96488 3.15156 6.6V10.0502H21.5516V6.6C21.5516 5.96488 21.0367 5.45 20.4016 5.45H18.1012V6.6001C18.1012 7.23523 17.5863 7.7501 16.9512 7.7501C16.3161 7.7501 15.8012 7.23523 15.8012 6.6001V5.45H8.90156V6.6001C8.90156 7.23523 8.38669 7.7501 7.75156 7.7501C7.11643 7.7501 6.60156 7.23523 6.60156 6.6001V5.45H4.30156ZM4.30156 23.85C3.66644 23.85 3.15156 23.3351 3.15156 22.7V12.3502H21.5516V22.7C21.5516 23.3351 21.0367 23.85 20.4016 23.85H4.30156Z" fill="white" />
    // </Svg>;
    

    return <Svg width={size * 9} height={size * 9} viewBox="0 0 9 9" fill="none" >
        <Path strokeWidth={'2'} d="M1.69844 1.80005C1.53275 1.80005 1.39844 1.93436 1.39844 2.10005V7.70005C1.39844 7.86573 1.53275 8.00005 1.69844 8.00005H7.29844C7.46412 8.00005 7.59844 7.86573 7.59844 7.70005V2.10005C7.59844 1.93436 7.46412 1.80005 7.29844 1.80005H1.69844ZM0.398438 2.10005C0.398438 1.38208 0.980467 0.800049 1.69844 0.800049H7.29844C8.01641 0.800049 8.59844 1.38208 8.59844 2.10005V7.70005C8.59844 8.41802 8.01641 9.00005 7.29844 9.00005H1.69844C0.980467 9.00005 0.398438 8.41802 0.398438 7.70005V2.10005Z" fill={color} />
        <Path strokeWidth={'2'} d="M6.09766 0C6.3738 0 6.59766 0.223858 6.59766 0.5V2.1C6.59766 2.37614 6.3738 2.6 6.09766 2.6C5.82151 2.6 5.59766 2.37614 5.59766 2.1V0.5C5.59766 0.223858 5.82151 0 6.09766 0Z" fill={color}/>
        <Path strokeWidth={'2'} d="M2.89844 0C3.17458 0 3.39844 0.223858 3.39844 0.5V2.1C3.39844 2.37614 3.17458 2.6 2.89844 2.6C2.6223 2.6 2.39844 2.37614 2.39844 2.1V0.5C2.39844 0.223858 2.6223 0 2.89844 0Z" fill={color}/>
        <Path d="M0.898438 4.00024H8.09844V5.00024H0.898438V4.00024Z" fill={color}/>
        <Path d="M0.898438 4.00024H8.09844V8.50024H0.898438V4.00024Z" fill={fill}/>
    </Svg>
    
}

export default Icon;