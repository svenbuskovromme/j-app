import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import { PlaceAddModalHandle } from "components/singles/PlaceAddModal";
import { PlaceLocationsModalHandle } from "components/singles/PlaceLocationsModal";
import { PlaceRecsModalHandle } from "components/singles/PlaceRecsModal";
import { place, placeGraph } from "jungle-shared";
import { createContext, useContext, useEffect, useState } from "react";

export interface IPlaceScreenCtx {
    placeLocationsModalRef: PlaceLocationsModalHandle|null,
    placeRecsModalHandle: PlaceRecsModalHandle|null,
    placeUserListAddModalHandle: PlaceAddModalHandle|null
}

export const PlaceScreenContext = createContext({} as IPlaceScreenCtx);
export const PlaceGraphContext = createContext({} as placeGraph);
export const ViewableContext = createContext({} as {[k in string]: boolean});

// export const getPlaceTextColor = (place: place) => `#${(place.textColor ?? place.accentColor) ?? 'FFFFFF'}`;
// export const getPlaceBgColor = (place: place) => `#${(place.primaryColor ?? '030303')}`;
// export const getPlaceLineColor = (place: place) => `#${(place.textColor ?? place.accentColor) ?? 'FFFFFF'}20`;
export const getPlaceTextColor = (place: place) => `#FFFFFF`;
export const getPlaceBgColor = (place: place) => `#030303`;
export const getPlaceLineColor = (place: place) => `#FFFFFF20`;


export const usePlaceTextColor = (placeArg?:place) => {
    const placeContext = useContext(PlaceGraphContext);
    const [color, setColor] = useState('');

    useEffect(() => {
        const place = placeArg ?? placeContext?.place;
        if(place){
            setColor(getPlaceTextColor(place));
        }
        else setColor('#FFFFFF');
    }, [placeContext, placeArg]);

    return color;
}

export const usePlaceBgColor = (placeArg?:place) => {
    const placeContext = useContext(PlaceGraphContext);
    const [color, setColor] = useState('');

    useEffect(() => {
        const place = placeArg ?? placeContext?.place;
        if(place)
            setColor(getPlaceBgColor(place));
        else setColor('');
    }, [placeContext, placeArg]);

    return color;
}

export const usePlaceBorderColor = (placeArg?:place) => {
    const placeContext = useContext(PlaceGraphContext);
    const [color, setColor] = useState('');

    useEffect(() => {
        const place = placeArg ?? placeContext?.place;
        if(place){
            setColor(getPlaceLineColor(place));
        }
        else setColor('red');
    }, [placeContext, placeArg]);

    return color;
}