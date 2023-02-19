import { contentRow, contentTargetRow, eventLocationRow, eventRow, linkRow, listRow, locationNodeRow, locationRow, nodeRow, place, placeLocationRow, place_link, postRow, tastemaker, tastemakerNote } from "./tables";
export declare type eventGraph = {
    event: eventRow;
    places: place[];
    content: contentGraph[];
    contentPoster?: contentRow;
    saved: boolean;
    locations: (Pick<locationRow, 'id' | 'houseNumber' | 'streetName' | 'address'> & eventLocationRow & {
        neighborhood: locationNodeRow;
    })[];
};
export declare type eventGraphSort = 'startDate';
export declare type eventGraphFilter = 'notDone' | 'drops' | 'all' | 'weekly' | 'saved';
export declare type postGraphSort = 'publishDate';
export declare type postContentGraph = {
    content: contentRow;
    targets: contentTargetRow[];
};
export declare type postGraph = {
    post: postRow;
    contentPoster: contentRow;
    content: contentGraph[];
};
export declare type tastemakerGraph = {
    tastemaker: tastemaker;
    placeName: string;
    placeUrl?: string;
    notes: tastemakerNoteGraph[];
};
export declare type tastemakerNoteGraph = {
    note: tastemakerNote;
    tastemaker: tastemakerGraph;
    place: placeGraph;
};
export declare type placeGraphBasic = {
    place: place & {
        posterContent?: null | number;
        posterQuote?: null | number;
    };
    featureQuote?: tastemakerGraph;
    posterContent?: contentGraph;
    posterQuote?: tastemakerNoteGraph;
    locationNodes?: locationNodeRow[];
    notes: tastemakerNoteGraph[];
    links: place_link[];
    tags: (nodeRow & {
        primary: boolean;
    })[];
    people: tastemakerGraph[];
    content: contentGraph[];
    locations: (locationRow & placeLocationRow)[];
    neighborhoodName: string;
};
export declare type placeGraph<T extends 'basic' | 'nodeList' = 'basic'> = T extends 'nodeList' ? placeGraphBasic & {
    quote: {
        text: string;
        author?: tastemaker;
    };
} : placeGraphBasic;
export declare type listGraph = {
    list: listRow;
    places: placeGraph[];
};
export declare type nodeGraph = {
    node: nodeRow;
    parents: nodeRow[];
};
export declare type placeNodeListItem = {
    id: number;
    name: string;
    content: number;
};
export declare type nodeListGraph<type extends 'single' | 'list'> = {
    node: nodeRow;
    locationNode: locationNodeRow;
    places: type extends 'single' ? placeGraph<'nodeList'>[] : placeNodeListItem[];
};
export declare type locationNodeGraph = {
    locationNode: locationNodeRow;
    nodeLists: nodeListGraph<'list'>[];
    parents: locationNodeRow[];
};
export declare type contentGraph = {
    id: number;
    content: contentRow;
    posts: postRow[];
    places: (place & {
        primary: boolean;
    })[];
    events: eventRow[];
    tastemakers: (tastemaker & {
        primary: boolean;
    })[];
    links: (linkRow & {
        primary: boolean;
    })[];
    nodes: (nodeRow & {
        primary: boolean;
    })[];
};
export declare type locationGraph<type extends 'map' | 'single' | 'list'> = type extends 'single' ? {
    location: locationRow;
    locationNodes: locationNodeRow[];
} : {
    location: Pick<locationRow, 'id' | 'lat' | 'long'>;
} & (type extends 'list' ? {
    fId: number;
    type: 'place';
} : type extends 'map' ? {} : never);
export declare type userListPlaceListItem = {
    place: Pick<place, 'id' | 'name'>;
    content: number;
};
export declare type userListDetails = {
    id: number;
    name: string;
    shareId: string;
    places: userListPlaceListItem[];
};
