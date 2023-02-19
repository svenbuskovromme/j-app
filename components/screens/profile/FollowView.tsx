import React, { FC, ReactElement, useCallback, useState } from "react";
import { ActivityIndicator, ImageProps, Text, TouchableOpacity, View } from "react-native";
import Reanimated, { FadeIn, FadeOut, Layout } from "react-native-reanimated";
import CenteredLoader from "components/shared/CenteredLoader";

export const FollowView: FC<{onUnfollowDone(): void, unfollow(): Promise<void>, onItemPress(): void, image: ReactElement<ImageProps>, name: string}> = ({onItemPress, unfollow, onUnfollowDone, image, name}) => {
    const [loading, setLoading] = useState(false);
    const [deleted, setDeleted] = useState(false);
    const [prompt, setPrompt] = useState(false);

    const handleFollowPress = useCallback(async () => {
        setPrompt(true);
    }, []);

    const handleUnfollow = useCallback(async () => {
        setLoading(true);
        await unfollow();
        setDeleted(true);
        setLoading(false);
        onUnfollowDone();
    }, [unfollow, onUnfollowDone]);

    return <Reanimated.View exiting={FadeOut} layout={Layout.springify()} style={{paddingHorizontal: 20, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
        <TouchableOpacity activeOpacity={0.75} onPress={onItemPress} style={{flexDirection: 'row', alignItems: 'center'}} >
            <View style={{width: 50, aspectRatio: 1, marginRight: 20}}>{image}</View>
            <Text style={{color: 'white'}}>{name}</Text>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.75} onPress={handleFollowPress}>
            <Reanimated.View>
                {
                    loading || deleted ? <Reanimated.View exiting={FadeOut} entering={FadeIn}><ActivityIndicator color={'white'} /></Reanimated.View>  :
                    prompt ? <Reanimated.View exiting={FadeOut} entering={FadeIn} style={{alignItems: 'center'}}>
                        <Text style={{color: '#FFFFFF90', fontSize: 15}}>Stop following?</Text>
                        <View style={{flexDirection: 'row'}}>
                            <TouchableOpacity activeOpacity={0.75} onPress={() => setPrompt(false)}><Text style={{color: 'white', fontSize: 15, margin: 10, marginHorizontal: 15}}>No</Text></TouchableOpacity>
                            <TouchableOpacity activeOpacity={0.75} onPress={handleUnfollow}><Text style={{color: 'white', fontSize: 15, margin: 10, marginHorizontal: 15}}>Yes</Text></TouchableOpacity>

                        </View>
                    </Reanimated.View> :
                    <Reanimated.View entering={FadeIn} exiting={FadeOut}><Text style={{color: 'white', opacity: 0.5}}>Following</Text></Reanimated.View>
                }
            </Reanimated.View>
        </TouchableOpacity>
    </Reanimated.View>
}

export default FollowView;