import React, { FC } from "react";
import { View } from "react-native";
import GradientHeader from "./GradientHeader";
import JungleIcon from "./JungleIcon";
import LocationNode, { LocationNodeProps } from "./LocationNode";

const LocationHeader: FC<LocationNodeProps> = props => {

    return <GradientHeader>
        <View style={{flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 5}}>
            <JungleIcon size={20} />
            <LocationNode {...props} paddingHorizontal={5} />
        </View>
    </GradientHeader>
}

export default LocationHeader;