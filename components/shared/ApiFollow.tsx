import React, { FC, useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { ApiToggle } from "./ApiToggle";
import CenteredLoader from "./CenteredLoader";
import Reanimated, { Layout } from 'react-native-reanimated';
import { usePlaceTextColor } from "components/screens/place/utils";

export const ApiFollow: FC<{color?: string, isFollowing: boolean, isFollowingFetching: boolean, onChange(newValue: boolean): Promise<void>}> = ({isFollowing, isFollowingFetching, onChange, color = 'white'}) => {
    const loadingState = useState(false);
    const [loading, setLoading] = loadingState;
    const [changing, setChanging] = useState(false);

    useEffect(() => {
        setLoading(isFollowingFetching || changing);
    }, [isFollowingFetching, changing]);
    
    const handleToggleChange = useCallback(async () => {
        setChanging(true);
        try{
            await onChange(!isFollowing);
        }
        catch(e){
            
        }
        setChanging(false);
    }, [onChange, setChanging, isFollowing]);

    return <ApiToggle loadingState={loadingState} onChange={handleToggleChange}>
        <Reanimated.View layout={Layout.springify()} style={{flexDirection: 'row', alignItems: 'center', paddingRight: 15}}>
            <Reanimated.View style={{}}><Text numberOfLines={1} style={{color, opacity: loading ? 1 : isFollowing ? 0.5 : 1}}>{isFollowing ? 'Following' : 'Follow'}</Text></Reanimated.View>
            {loading && <ActivityIndicator size={'small'} color={color} style={{}} />}
        </Reanimated.View>
    </ApiToggle>
}