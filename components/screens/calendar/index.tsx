import { useFocusEffect } from "@react-navigation/native";
import Feed from "components/shared/Feed";
import Gradient from "components/shared/Gradient";
import GradientHeader from "components/shared/GradientHeader";
import HeaderView from "components/shared/HeaderView";
import JungleIcon from "components/shared/JungleIcon";
import LocationHeader from "components/shared/LocationHeader";
import LocationNode from "components/shared/LocationNode";
import React, { FC } from "react";
import { useEffect } from "react";
import { View } from "react-native";
import { useAppDispatch } from "redux/hooks";
import { setFilter } from "redux/locationNodes";
import { RootNavContext, RootScreenProps } from "utils";

const CalendarScreen: FC<RootScreenProps<'Calendar'>> = navProps => {
    const dispatch = useAppDispatch();
    useFocusEffect(() => {
        dispatch(setFilter('home'));
    });

    useEffect(() => {
        navProps.navigation.setOptions({
            headerTransparent: true,
            headerStyle: {backgroundColor: 'transparent'},
            headerTitle: () => <View style={{flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10}}>
                <JungleIcon size={20} />
                <LocationNode paddingHorizontal={5} />
            </View>
        })
    }, []);

    return <HeaderView style={{flex: 1, backgroundColor: '#030303'}}>
        <RootNavContext.Provider value={navProps}>
            <GradientHeader />
            <Feed />
        </RootNavContext.Provider>
    </HeaderView>
}

export default CalendarScreen;