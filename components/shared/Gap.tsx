import React, { FC } from "react";
import { View } from "react-native";

const Gap: FC<{x?: number, y?: number}> = ({x = 0, y = 0}) => {
    return <View style={{height: y, width: x}} />
}

export default Gap;