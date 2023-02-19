import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { locationRow, locationNodeGraph, locationNodesFilter } from "jungle-shared";

interface locationNodesState{
    selectedLocationNode?: number
    defaultLocationNode?: number,
    modalRef: BottomSheetModalMethods|null,
    availableNodes: locationNodeGraph[],
    filter?: locationNodesFilter,
    visible: boolean,
}

const initialState: locationNodesState={
    
    modalRef: null,
    visible: false,
    availableNodes: []
}

const locationNodesSlice = createSlice({
    initialState,
    name: 'locationNodes',
    reducers: {
        setLocationModalVisible: (state, action: PayloadAction<boolean>) => {
            state.visible = action.payload;
        },
        setFilter: (state, action: PayloadAction<locationNodesFilter>) => {
            state.filter = action.payload;
        },
        setSelectedLocationNode: (state, action: PayloadAction<number>) => {
            state.selectedLocationNode = action.payload;
        },
        setDefaultLocationNode: (state, action: PayloadAction<number>) => {
            state.defaultLocationNode = action.payload;
        },
        setModalRef: (state, action: PayloadAction<BottomSheetModalMethods>) => {
            state.modalRef = action.payload;
        },
        setAvailableNodes: (state, action: PayloadAction<locationNodeGraph[]>) => {
            state.availableNodes = action.payload;
        }
    }
});

export const {setLocationModalVisible, setAvailableNodes, setDefaultLocationNode, setSelectedLocationNode, setModalRef, setFilter} = locationNodesSlice.actions;

export default locationNodesSlice.reducer;