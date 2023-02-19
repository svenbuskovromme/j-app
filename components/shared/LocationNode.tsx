import React, { FC, useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { useLocationNodeId, useAppSelector, useAppDispatch } from "redux/hooks";
import { setLocationModalVisible } from "redux/locationNodes";
import { boolean } from "yup/lib/locale";
import CenteredLoader from "./CenteredLoader";

export type LocationNodeProps = {uppercase?: boolean, color?: string, fontSize?: number, paddingHorizontal?: number, paddingVertical?: number};

const LocationNode: FC<LocationNodeProps> = ({ uppercase=false, color = '#ffffff', paddingHorizontal = 10, paddingVertical = 5, fontSize = 20}) => {
    const locationNodeId = useLocationNodeId();
    const bounds = useWindowDimensions();
    const locationsModalRef = useAppSelector(state => state.locationNodes.modalRef);
    const availableNodes = useAppSelector(state => state.locationNodes.availableNodes);
    const [name, setName] = useState('');
    const dispatch = useAppDispatch();

    const handlePress = useCallback(() => {
        // dispatch(setLocationModalVisible(true));
        locationsModalRef?.present();
    }, [locationsModalRef]);

    useEffect(() => {
        setName(availableNodes.find(ln => ln.locationNode.id === locationNodeId)?.locationNode.name ?? '');
    }, [locationNodeId, availableNodes]);
    
    return <TouchableOpacity activeOpacity={0.75} onPress={handlePress} style={{paddingHorizontal, paddingVertical}}>
        {
            !locationNodeId ? 
                <ActivityIndicator color={color} /> : 
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Text numberOfLines={1} style={{textTransform: uppercase ? 'uppercase' : 'capitalize', color, fontSize, fontWeight: '500'}}>{name}</Text>
                    <Svg style={{marginLeft: 5}} width="10" height="10" viewBox="0 0 8 7" fill="none" >
                        <Path d="M4.7394 6.20186C4.34271 6.88894 3.35098 6.88894 2.95429 6.20186L0.276636 1.56402C-0.120054 0.87693 0.375809 0.0180723 1.16919 0.0180724L6.52451 0.0180729C7.31789 0.0180729 7.81375 0.876932 7.41706 1.56402L4.7394 6.20186Z" fill={'white'}/>
                    </Svg>
                </View> 
        }
    </TouchableOpacity>
}

export default LocationNode;