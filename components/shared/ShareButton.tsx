import React, { FC, useCallback } from "react";
import { urlShare } from "jungle-shared";
import { TouchableOpacity } from "react-native-gesture-handler";
import ShareIcon from "./ShareIcon";
import { useAppDispatch } from "redux/hooks";
import { logAppActivity } from "redux/app";
import { Share } from "react-native";

const ShareButton: FC<{color?: string, id: number, type: urlShare['data']['type'], message: string, url: string}> = ({color = '#030303', url, message, type, id}) => {
    const dispatch = useAppDispatch();

    const handlePress = useCallback(async () => {
        const share = await Share.share({
            message: url
        });

        if(share.action === Share.sharedAction)
            dispatch(logAppActivity({type: 'urlShare', data: {id, type}}));
    }, [url, message, type, id]);

    return <TouchableOpacity activeOpacity={0.75} hitSlop={{left: 20, right: 20, top: 25, bottom: 25}} onPress={handlePress}>
        <ShareIcon color={color} />
    </TouchableOpacity>
}

export default ShareButton;