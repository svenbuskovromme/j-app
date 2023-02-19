
import React, { FC, useCallback, useEffect, useState } from 'react';
import { Image, useWindowDimensions } from 'react-native';
import Reanimated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

const Splash: FC = () => {
    const bounds = useWindowDimensions();
    const opacityImage = useSharedValue(0);
    const opacityView = useSharedValue(1);
    const uasImage = useAnimatedStyle(() => ({opacity: opacityImage.value}));
    const uasView = useAnimatedStyle(() => ({opacity: opacityView.value}));
    const [done, setDone] = useState(false);
    const handleLoad = useCallback(() => {
        opacityImage.value = withTiming(1, {duration: 300});
    }, []);
    const disappear = useCallback(() => {
        opacityView.value = withTiming(0, {duration: 500}, () => runOnJS(setDone)(true));
    }, []);

    useEffect(() => {
        setTimeout(() => disappear(), 1000);
    }, [disappear]);

    return done ? null : 
    <Reanimated.View style={[{backgroundColor: '#030303', position: 'absolute', justifyContent: 'center', alignItems: 'center', ...bounds, zIndex: 102}, uasView]}>
        <Svg width="78" height="78" viewBox="0 0 530 530" fill="none">
            <Path d="M476.934 265.708C423.914 265.708 373.038 282.142 330.402 312.554C359.651 243.944 413.686 188.781 482.677 158.346L491.779 154.321L458.244 78.1457L449.143 82.1491C393.384 106.767 344.584 144.456 306.565 192.099V0.466675H223.413V192.121C185.394 144.5 136.616 106.789 80.8351 82.1712L71.7335 78.1678L38.1988 154.343L47.3004 158.368C116.27 188.803 170.327 243.966 199.576 312.576C156.918 282.164 106.041 265.73 53.0221 265.73H0.466675V348.983H53.0221C146.977 348.983 223.413 425.512 223.413 519.58V529.533H306.565V519.58C306.565 425.512 383.001 348.983 476.956 348.983H529.533V265.73H476.956L476.934 265.708Z" fill="white"/>
        </Svg>
        {/* <Reanimated.Image source={require('images/launch.png')} onLoad={handleLoad} style={[{width: '100%', height: '100%'}, uasImage]} resizeMode={'cover'} /> */}
    </Reanimated.View>
}

export default Splash;