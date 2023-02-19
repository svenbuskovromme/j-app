import SignInInput from "components/screens/signinFlow/SignInInput";
import { api, userRow } from "jungle-shared";
import React, { useCallback, useState } from "react";
import { useEffect } from "react";
import { FunctionComponent } from "react";
import { View } from "react-native";
import { useAppSelector } from "redux/hooks";
import { store } from "redux/store";
import * as yup from "yup";

type ContainerProps = {onStateChange? :(state: 'dirty' | 'valid', value: boolean) => void};
type ContainerState = {dirty: boolean, valid: boolean};

export class ProfileNames extends React.Component<ContainerProps, ContainerState>{
    constructor(props: ContainerProps){
        super(props);

        this.state = {
            dirty: false, valid: !!this.firstName
        };
    }

    public lastName: string = '';
    public firstName: string = '';

    private handleChange = (names: {firstName: string, lastName: string}) => {
        this.firstName = names.firstName;
        this.lastName = names.lastName;

        this.props.onStateChange && this.props.onStateChange('dirty', true);
        this.props.onStateChange && this.props.onStateChange('valid', !!this.firstName);
    }

    public async save(){
        await api.patch('user', {row: {
            firstName: this.firstName,
            lastName: this.lastName
        }});
    }

    public render(){
        return <ProfileNamesInputs onChange={this.handleChange} />
    }
}

export const ProfileNamesInputs:FunctionComponent<{onChange: (names: {firstName: string, lastName: string}) => void}> = ({onChange}) => {
    const user = useAppSelector(state => state.user.user);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const firstNameChange = useCallback((e: string) => {
        setFirstName(e);
    }, []);

    const lastNameChange = useCallback((e: string) => {
        setLastName(e);
    }, []);

    useEffect(() => {
        onChange({firstName, lastName});
    }, [firstName, lastName]);

    useEffect(() => {
        if(user){
            setFirstName(user.firstName);
            setLastName(user.lastName);
        }
    }, [user]);
    
    return <View style={{width: '100%', padding: 30, justifyContent: 'space-between', height: 180}}>
        <SignInInput
            onChangeText={firstNameChange}
            value={firstName}
            placeholder={'First Name'}
        />
        <SignInInput
            onChangeText={lastNameChange}
            value={lastName}
            placeholder={'Last Name'}
        />
    </View>;
    
}