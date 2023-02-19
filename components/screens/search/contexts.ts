import { branch, locationListItem, locationNodeRow, placeListItem, SearchItem, tastemakerGraph } from "jungle-shared";
import { createContext, Dispatch, SetStateAction } from "react";

type PlaceIdsMap = Map<number, Set<number>>;

export const queryInterval = 10

export interface ISearchContext {
    searchTerm: string,
    setSearchTerm(term: string): void,
    nodesLoading: boolean,
    setSearchMode: (mode: boolean) => void,
    searchMode: boolean,
    searchTermQuery: string,
    selectedBranches: number[],
    selectablePlaces: {id: number, name: string}[],
    // selectableNodes: nodeRow[],
    branchRoot: branch | null,
    // places: placeListItem<'search'>[],
    // tastemakers: tastemakerGraph[],
    searchItems: SearchItem[],
    locations: locationListItem<'search'>[],
    locationNodes: locationNodeRow[],
    clearSelected: (branch?: branch) => void,
    toggleSelected: (branch: branch) => void,
    handleNearbySelected(): Promise<boolean>,
    refreshing: boolean,
    onRefresh: () => void,
    tagsHeight: number,
    setTagsHeight: (height: number) => void,
    inputFocused: boolean
    setInputFocused: (v: boolean) => void,
    queryLimit: number,
    setQueryLimit: (v: number) => void,
    hasMoreResults: boolean
};

export interface ITagsContext {
    flatIndices: Set<number>
}

export const SearchContext = createContext({} as ISearchContext);
export const TagsContext = createContext({} as ITagsContext);

export const PlaceWithContentHeight = 280;
export const PlaceHeight = 70;
export const TastemakerHeight = 70;
export const IncreaseLimitButtonHeight = 50;