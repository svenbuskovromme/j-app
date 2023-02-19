import React, { FC } from "react"
import { ActivityIndicator, ActivityIndicatorProps, View } from "react-native"

const CenteredLoader: FC<ActivityIndicatorProps> = props => {
    return <View style={[{width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center'}, props.style]}>
        <ActivityIndicator {...props} />
    </View>
}

export default CenteredLoader;