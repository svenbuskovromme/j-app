import React, { FunctionComponent } from "react";
import { Button, ButtonProps, Text, TouchableHighlight, TouchableHighlightProps } from "react-native";

const SignInButton: FunctionComponent<TouchableHighlightProps & {text: string, width: number, valid: boolean, align?: 'center' | 'flex-start' | 'flex-end'}> = props => {
    return <TouchableHighlight disabled={!props.valid} 
        {...props}
        style={[
            {  justifyContent: 'center', alignItems: 'center', height: 57, borderRadius: 57/2, width: props.width, alignSelf: props.align ?? 'auto' },
            props.valid ? {backgroundColor: '#F6F5F1'} : {borderStyle: 'solid', borderWidth: 2, borderColor: '#333333'},
            props.style
        ]} >
        <Text style={{fontSize: 16, fontWeight: '600', color: props.valid ? '#101010' : '#333333'}}>{props.text.toUpperCase()}</Text>
    </TouchableHighlight>;
}

export default SignInButton;