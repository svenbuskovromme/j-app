import React, { FC, PropsWithChildren } from "react"
import { View, ViewProps } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context";

const HeaderView: FC<ViewProps> = props => {
    const insets = useSafeAreaInsets();
    return <View {...props} style={[props.style, {paddingTop: insets.top + 50}]} />;
}

export default HeaderView;