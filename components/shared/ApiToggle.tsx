
import React, { createContext, Dispatch, FC, PropsWithChildren, SetStateAction, useCallback, useEffect, useMemo, useState } from "react"
import { Text, TouchableOpacity, View } from "react-native";

export const ApiToggle: FC<PropsWithChildren<{loadingState?: [boolean, Dispatch<SetStateAction<boolean>>], onChange(): Promise<void>}>> = ({children, onChange, loadingState = useState(false)}) => {
    const [loading, setLoading] = loadingState;

    const handleChange = useCallback(async () => {
        await onChange();
    }, [onChange]);

    const context: IApiToggleContext = useMemo(() => ({loading}), [loading]);

    return <TouchableOpacity activeOpacity={0.75} hitSlop={{top: 25, bottom: 25, left: 15, right:15}} disabled={loading} onPress={handleChange} style={{opacity: loading ? 0.5 : 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
        <ApiToggleContext.Provider value={context}>
            {children}
        </ApiToggleContext.Provider>
    </TouchableOpacity>
}

interface IApiToggleContext {
    loading: boolean
}

export const ApiToggleContext = createContext({} as IApiToggleContext);