import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { userRow } from "jungle-shared";
import { createContext, ReactNode } from "react";
import { RootStackParamList } from "utils";

export const UserContext = createContext({} as userRow);

export const HeaderContext = createContext({} as {header: ReactNode});