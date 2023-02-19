import CheckBox from "@react-native-community/checkbox";
import React, { Dispatch, FC, Fragment, ReactNode, SetStateAction, useCallback, useContext, useEffect, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { ApiToggle, ApiToggleContext } from "./ApiToggle";

const ApiCheckbox: FC<{hideLabel?: boolean, labelFirst?: boolean, size?: number, externalFetch?: boolean, loadingState?: [boolean, Dispatch<SetStateAction<boolean>>], color?: string, changeOnMount?: boolean, value: boolean, label?: string, labelComponent?: ReactNode, onChange?: () => Promise<void>}> = ({externalFetch, loadingState = useState(false), value, onChange, label = '', color = 'white', size = 25, labelFirst = true, labelComponent = null, hideLabel = false}) => {
    const [loading, setLoading] = loadingState;

    const handleChange = useCallback(async () => {
        setLoading(true);
        try{
            !!onChange && await onChange();
        }
        catch(e){console.log(e);}
        setLoading(externalFetch ?? false);
    }, [onChange]);

    useEffect(() => {
        if(!externalFetch)
            setLoading(false);
    }, [externalFetch]);

    return <ApiToggle onChange={handleChange} loadingState={loadingState}>
        {(!hideLabel && labelFirst) &&
            <Fragment>
                <Text numberOfLines={1} style={{fontSize: size, color: value ? '#007aff' : color}}>{label}</Text>
                {labelComponent}
            </Fragment>
        }
        <View style={{alignItems: 'center', justifyContent: 'center'}}>
            <View pointerEvents="none" style={{opacity: loading ? 0 : 1}}>
                <CheckBox value={value} tintColors={{ 'true': '#007aff' }}  style={{height: size }} />
            </View>
            <ActivityIndicator style={{opacity: loading ? 1 : 0, position: 'absolute', transform: [{scale: 1}]}} color={color} size={'small'} />
        </View>
        {(!hideLabel && !labelFirst) && 
            <Fragment>
                <Text numberOfLines={1} style={{fontSize: size, marginLeft: size/4, color: value ? '#007aff' : color}}>{label}</Text>
                {labelComponent}
            </Fragment>
        }
    </ApiToggle>
}

export default ApiCheckbox;