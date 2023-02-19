import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { FC, forwardRef, ForwardRefRenderFunction, useCallback, useEffect, useImperativeHandle, useRef } from "react";
import { Alert } from "react-native";
import { usePutUserListMutation } from "redux/api";
import user, { setAddUpdateListRef } from "redux/user";
import { ValidationError } from "yup";
import { userListRow } from "jungle-shared";
import TextInputModal, { TextInputModalHandle } from "./TextInputModal";
import { useAppDispatch, useAppSelector } from "redux/hooks";

export type AddUpdateListHandle = {
    put: () => Promise<number|undefined>
}

const AddUpdateList: ForwardRefRenderFunction<AddUpdateListHandle, {id?: number, onCreate?: (pk: number) => Promise<void>}> = ({id, onCreate}, ref) => {
    const nameInputRef = useRef<TextInputModalHandle>(null);

    const [putList] = usePutUserListMutation();

    const user = useAppSelector(state => state.user.user);
    
    const handlePutList = useCallback(async () => {
        console.log('handle put list called');
        if(user && nameInputRef.current){
            let pk = 0;
            while(!pk){
                const name = await nameInputRef.current.prompt();
                nameInputRef.current.setLoading(true);
                const res = await putList({list: {id, name} as userListRow}).unwrap();
                nameInputRef.current.setLoading(false);
                pk = res.pk;

                if(res.errors?.length){
                    res.errors.forEach(e => {
                        const error = e as ValidationError;
                        if(error.path === 'name' && error.type === 'required'){
                            Alert.alert('Your new list needs a name');
                        }
                    });
                }
            }

            if(onCreate)
                await onCreate(pk);
                
            nameInputRef.current?.close();

            return pk;
        }
    }, [user, id, nameInputRef.current, onCreate]);

    useImperativeHandle(ref, () => ({
        put: handlePutList
    }), [handlePutList]);

    return <TextInputModal confirmText="Create" startValue="" ref={nameInputRef} />
}

export default forwardRef(AddUpdateList);