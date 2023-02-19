import BottomSheet from "@gorhom/bottom-sheet";
import { createContext } from "react";
import { userListPlaceRow } from "jungle-shared";

export interface IUserListContext {
    selecting: boolean,
    toggleToUnsave(userListPlace: userListPlaceRow, selected: boolean): void
}

export const UserListCTX = createContext({} as IUserListContext);