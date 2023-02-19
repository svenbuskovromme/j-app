import { BottomSheetBackdrop, BottomSheetBackdropProps, BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { NavigationProp, StackActionHelpers, StackActions, StackActionType, useNavigation } from "@react-navigation/native";
import ActiveImage from "components/shared/ActiveImage";
import Gap from "components/shared/Gap";
import React, { FC, forwardRef, ForwardRefRenderFunction, useCallback, useImperativeHandle, useRef, useState } from "react";
import { Text, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { dateFormat, dateFormatAge, dateFormatShort, getSubtitle, rootNavRef, RootStackParamList, source } from "utils";
import { tastemakerNoteGraph } from "jungle-shared";

export type PlaceRecsModalHandle = {
    show: (recommendations: tastemakerNoteGraph[]) => void
}

const NoteView: FC<{note: tastemakerNoteGraph}> = ({note}) => {
    
    const push = StackActions.push as (r: Parameters<StackActionHelpers<RootStackParamList>['push']>[0], p: Parameters<StackActionHelpers<RootStackParamList>['push']>[1]) => StackActionType;

    const handleTmPress = useCallback(() => {
        const tmId = note.tastemaker.tastemaker.id;
        if(tmId){
            rootNavRef.current?.dispatch(push('Tastemaker', {id: tmId}));
        }
    }, []);
    const handlePlacePress = useCallback(() => {
        const placeId = note.tastemaker.tastemaker.placeId;
        if(placeId){
            rootNavRef.current?.dispatch(push('Place', {id: placeId}));
        }
    }, []);
    return <View style={{}}>
        <Gap y={50} />
        <TouchableOpacity activeOpacity={0.75} onPress={handleTmPress} style={{flexDirection: 'row', alignItems: 'center'}}>
            <ActiveImage style={{borderRadius: 30, height: 60, width: 60}} source={{uri: source.person.small(note.tastemaker.tastemaker.id)}} />
            <Gap x={15} />
            <View style={{flex: 1}}>
                <Text style={{fontSize: 22, fontWeight:'500', color: '#ffffff'}}>{note.tastemaker.tastemaker.firstname}</Text>
                <Text style={{fontSize: 22, fontWeight:'500', color: '#ffffff'}}>{note.tastemaker.tastemaker.lastname ?? ''}</Text>
            </View>
            <Text style={{color: '#727272', alignSelf: 'flex-start'}}>{note.note.created ? dateFormatAge(note.note.created) : ''}</Text>
        </TouchableOpacity>
        <Gap y={15} />
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text style={{fontSize: 16, color: '#727272'}}>{note.tastemaker.tastemaker.role} · </Text>
            <TouchableOpacity activeOpacity={0.75} onPress={handlePlacePress}><Text style={{fontSize: 16, color: '#727272', textDecorationLine: 'underline'}}>{note.tastemaker.placeName}</Text></TouchableOpacity>
        </View>
        <Gap y={20} />
        <Text style={{fontSize: 16, color: '#ffffff'}}>"{note.note.note}"</Text>
    </View>
}

const PlaceRecsModal: ForwardRefRenderFunction<PlaceRecsModalHandle, {}> = (props, ref) => {
    const renderBackdrop = useCallback(
        (props:BottomSheetBackdropProps) => (
          <BottomSheetBackdrop
            {...props}
            style={{position: 'absolute', top: 0, backgroundColor: '#030303', height: '100%', width: '100%'}}
            opacity={0.5}
            appearsOnIndex={0}
            disappearsOnIndex={-1}
          />
        ), []
    );

    const modalRef = useRef<BottomSheetModal>(null);

    const [notes, setNotes] = useState<tastemakerNoteGraph[]>([]);

    const show = useCallback((notes: tastemakerNoteGraph[]) => {
        modalRef.current?.present();
        setNotes(notes);
    }, [modalRef.current]);

    useImperativeHandle(ref, () => ({show}), [ref]);

    const insets = useSafeAreaInsets();

    return <BottomSheetModal
        snapPoints={['75%']}
        backdropComponent={renderBackdrop}
        ref={modalRef}
        backgroundStyle={{backgroundColor: '#242424'}}
        handleIndicatorStyle={{backgroundColor: '#727272'}}
        enableDismissOnClose={true}
    >
        <View style={{flex: 1, width: '100%'}}>
            <Text style={{fontSize: 18, color: '#ffffff', fontWeight: '600', padding: 5, textAlign: 'center'}}>Recommendations</Text>
            <BottomSheetScrollView style={{flex: 1}} showsVerticalScrollIndicator={false} contentContainerStyle={{paddingHorizontal: 15, paddingBottom: 50 + insets.bottom}}>
                {notes.map(note => <NoteView note={note} key={note.note.id} />)}
            </BottomSheetScrollView>
        </View>
    </BottomSheetModal>
}

export default forwardRef(PlaceRecsModal);