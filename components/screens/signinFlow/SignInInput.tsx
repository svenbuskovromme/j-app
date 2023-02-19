import React, { ChangeEventHandler, FunctionComponent, LegacyRef, RefObject, useCallback, useState } from "react";
import { TextInput, TextInputProps } from "react-native";

const SignInInput: FunctionComponent<TextInputProps & {ref?: LegacyRef<TextInput>, placeholder: string}> = props => {
    return <TextInput placeholderTextColor={'#4A4A4A'} style={{fontSize: 16, width: '100%', color: '#F6F5F1', borderColor: '#292929', borderBottomWidth: 1, borderStyle: 'solid', height: 37 }}  {...props}/>;
}

export default SignInInput;