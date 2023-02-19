import { BottomSheetModal, BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { BlurView } from "@react-native-community/blur";
import React, { FC, forwardRef, ForwardRefRenderFunction, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, Text, TextInput, TouchableOpacity, useWindowDimensions, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import Reanimated from 'react-native-reanimated';
import Gap from "./Gap";

export type TextInputModalHandle = {
    prompt(): Promise<string>,
    close(): void,
    setLoading(v: boolean): void 
}

const TextInputModal: ForwardRefRenderFunction<TextInputModalHandle, {startValue?: string, confirmText?: string}>  = ({ confirmText = 'Save', startValue = ''}, ref) => {
    const bounds = useWindowDimensions();
    const inputModalRef = useRef<BottomSheetModal>(null);
    const [value, setValue] = useState(startValue);
    const resRef = useRef<((value: string) => void)|null>(null);
    const rejRef = useRef<((reason?: any) => void)|null>(null);
    const [loading, setLoading] = useState(false);
    const close = useCallback(() => { setVisible(false); }, []);
    const prompt = useCallback(async () => await new Promise<string>((res, rej) => {
        setVisible(true);
        setValue(startValue);
        resRef.current = res;
        rejRef.current = rej;
    }), []);
    
    useImperativeHandle(ref, () => ({
        prompt,
        close,
        setLoading
    }), [startValue, setLoading]);

    const handleConfirm = useCallback(async () => {
        const resolver = resRef.current;
        if(resolver){
            resolver(value);
            resRef.current = null;
            rejRef.current = null;
        }
    }, [value]);

    const handleDismiss = useCallback(() => {
        // const rejector = rejRef.current;
        // if(rejector){
        //     rejector();
        resRef.current = null;
        rejRef.current = null;
        // }
    }, []);

    const [visible, setVisible] = useState(false);

    
    
    return <Modal
        animationType={'fade'}
        visible={visible}
        onRequestClose={close}
        transparent={true}
        onDismiss={handleDismiss}
    >
        <View style={{justifyContent: 'center', alignItems: 'center', flex: 1, width: '100%'}}>
            <Pressable onPress={close} style={{position: 'absolute', width: '100%', height: '100%', backgroundColor: '#030303', opacity: 0.5}} />
            
            <KeyboardAvoidingView 

            behavior={Platform.select({ios: 'padding', android: 'height'})}
            style={{width: '100%', padding: 30}} pointerEvents={'box-none'}>
                <ScrollView 
                keyboardShouldPersistTaps={'always'}
                style={{backgroundColor: '#242424', padding: 30, borderRadius: 25}}>
                    <TextInput onSubmitEditing={handleConfirm} returnKeyType={'done'} autoFocus={true} style={{ color: 'white', fontSize: 30}} placeholderTextColor={'rgb(100,100,100)'} placeholder={'List name'} value={value} onChangeText={setValue} />
                    {/* <View style={{flexDirection: 'row'}}></View> */}
                    <Gap y={50} />
                    <View style={{width: '100%', alignItems: 'center'}}>
                        <TouchableOpacity activeOpacity={0.75} disabled={loading} style={{backgroundColor: '#ffffff', height: 50, width: 150, borderRadius: 25, alignItems: 'center', justifyContent: 'center'}} onPress={handleConfirm}>
                            {
                                loading ? <ActivityIndicator color={'#030303'} /> :
                                <Text style={{fontWeight: '700', fontSize: 14, color: '#030303'}}>{confirmText}</Text>
                            }
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    </Modal>
}

export default forwardRef(TextInputModal);