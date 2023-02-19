import { contentGraph, eventGraph, eventGraphFilter, eventGraphSort, listGraph, locationGraph, locationNodeGraph, nodeGraph, nodeListGraph, placeGraph, postGraph, postGraphSort, tastemakerGraph, tastemakerNoteGraph, userListDetails } from './graphs';
import { tastemaker, schema, place, neighborhood, tag, tastemakerNote, place_tag, tastemakerSummary, userRow, userPlaceRow, place_link, userActivityType, appUserRow, appActivityRow, appRow, eventRow, placeEventRow, unitRow, eventUnitRow, videoListRow, videoListPlaceRow, tastemakerListRow, nodeRow, nodeTreeRow, placeNodeRow, contentRow, contentTargetRow, postRow, postContentRow, userPostRow, userEventRow, userTastemakerRow, linkRow, locationNodeRow, locationRow, locationNodeTreeRow, searchAndMapRow, placeLocationRow, eventLocationRow, locationListItem, userListRow, userListPlaceRow } from "./tables";
export declare type routeHandler<params extends object = {}, returnType = any> = (p: params) => returnType;
export declare type apiPostRoutes = {
    push(p: {
        type: 'test';
    }): void;
};
declare type getRouteHandler<t extends schema[keyof schema], p = {}> = routeHandler<{
    id?: number;
    nameUrl?: string;
} & p, t[]>;
export declare type IGetContent = {
    (p: {
        id: number;
    }): Promise<contentGraph | undefined>;
    (p: {
        id: undefined;
        sort?: 'asc' | 'desc';
    }): Promise<contentGraph[]>;
};
export interface ipInfo {
    range: [number, number];
    country: string;
    region: string;
    eu: "0" | "1";
    timezone: string;
    city: string;
    ll: [number, number];
    metro: number;
    area: number;
}
export declare type branch = {
    id: number;
    name: string;
    namePlural: string;
    level: number;
    children: branch[];
};
export declare type locationBranch = Omit<locationNodeRow, 'lat' | 'long'> & {
    children: locationBranch[];
};
export declare type ActivityRow = {
    date: Date;
    weekly: number;
    monthly: number;
    wom: number;
};
export declare type locationNodesFilter = 'home' | 'search' | 'lists';
export declare type graphApiGetRoutes = {
    event: (p: {
        id?: number;
        nameUrl?: string;
    }) => eventGraph | undefined;
    events: (p: {
        placeId?: number;
        locationNodeId?: number;
        eventNameUrl?: string;
        eventId?: number;
        sort?: eventGraphSort;
        order?: 'desc' | 'asc';
        filter?: eventGraphFilter;
        cursor?: number;
        count?: number;
        enabled?: boolean;
    }) => eventGraph[];
    posts: (p: {
        postId?: number;
        placeId?: number;
        locationNodeId?: number;
        postNameUrl?: string;
        sort?: postGraphSort;
        cursor?: number;
        count?: number;
        enabled?: boolean;
        published?: boolean;
    }) => postGraph[];
    post: (p: {
        id?: number;
        nameUrl?: string;
    }) => postGraph | undefined;
    tastemakers: (p: {
        id?: number;
        notePlaceId?: number;
        nameUrl?: string;
        broken?: boolean;
    }) => tastemakerGraph[];
    tastemakerById: (p: {
        id?: number;
        notePlaceId?: number;
        nameUrl?: string;
    }) => tastemakerGraph | undefined;
    places: (p: {
        backwardsCompatibleDate?: boolean;
        id?: number;
        nameUrl?: string;
        broken?: boolean;
    }) => placeGraph[];
    placeBy: (p: {
        backwardsCompatibleDate?: boolean;
        id?: number;
        nameUrl?: string;
    }) => placeGraph | undefined;
    noteBy: (p: {
        id?: number;
        featuredAt?: {
            timestamp: number;
            locationNodeId: number;
        };
    }) => tastemakerNoteGraph | undefined;
    notes: (p: {
        date?: boolean;
        featuredAt?: {
            timestamp: number;
            locationNodeId: number;
        };
        limit?: number;
        sort?: 'latest' | 'earliest';
        locationNodeId?: number;
        noteId?: number;
        placeId?: number;
        tastemakerId?: number;
    }) => tastemakerNoteGraph[];
    links: (p: {}) => linkRow[];
    lists: (p: {
        listNameUrl?: string;
        listId?: number;
        firstPlaces?: number;
    }) => listGraph[];
    list: (p: {
        id?: number;
        nameUrl?: string;
    }) => listGraph | undefined;
    nodeListBy: (p: {
        id: number;
        locationNodeId: number;
    }) => nodeListGraph<'single'> | undefined;
    locationBy: (p: {
        id: number;
    }) => locationGraph<'single'> | undefined;
    locationNodes: (p: {
        filter?: locationNodesFilter;
        locationNodeId?: number;
        locationId?: number;
    }) => locationNodeGraph[];
    locationNodeBy: (p: {
        id?: number;
        ip?: string;
        location?: [number, number];
    }) => locationNodeGraph | undefined;
    locationNodeTree: () => locationBranch;
    locations: (p: {
        locationNodeId?: number;
        selectedBranches: number[];
    }) => locationListItem<'search'>[];
    node: (p: {
        id: number;
    }) => nodeGraph | undefined;
    nodeTree: (p: {
        limit?: number;
        selectedBranches: number[];
        selectedLocation: number;
        searchTerm: string;
    }) => {
        root: branch;
    } & searchAndMapRow;
    search: (p: {
        user?: userRow;
        selectedBranches: number[];
        searchTerm: string;
    }) => {
        nodes: nodeRow[];
        places: ({
            id: number;
            name: string;
        })[];
    };
    content: (p?: {
        search?: {
            placeIds: number[];
            nodeIds: number[];
        };
        id?: number;
        eventId?: number;
        postId?: number;
        placeId?: number;
        placeNameUrl?: string;
        sort?: 'asc' | 'desc';
    }) => contentGraph[];
    contentById: (p: {
        id: number;
    }) => contentGraph | undefined;
    placeLinks: (p: {}) => place_link[];
    geoip: (p: {
        ip: string;
    }) => ipInfo | null;
    activity: (p?: {
        type?: 'daily' | 'weekly' | 'monthly';
        from?: Date;
        to?: Date;
    }) => ActivityRow[];
    userList: (p: {
        shareId: string;
    }) => userListDetails | undefined;
};
export declare type graphApiUserGetRoutes = {
    tastemakers: (p: {
        id?: number;
    }) => tastemakerGraph[];
    places: (p: {
        id?: number;
    }) => placeGraph[];
    events: (p: {
        id?: number;
        filter?: eventGraphFilter;
        order?: 'desc' | 'asc';
    }) => eventGraph[];
    getLists: (p?: {
        userListId?: number;
    }) => userListDetails[];
    getListBy: (p?: {
        id?: number;
    }) => userListDetails | undefined;
    putEvent: (p: {
        event: userEventRow;
    }) => void;
    putList: (p: {
        list: userListRow;
    }) => putResponse;
    putListPlace: (p: {
        listPlace: userListPlaceRow;
    }) => void;
    deleteList: (p: {
        id: number;
    }) => void;
    deleteListPlace: (p: {
        listPlace: userListPlaceRow;
    }) => void;
    deleteEvent: (p: {
        id: number;
    }) => void;
};
export declare type graphApiPutRoutes = {
    contentById: (p: {
        id: number;
    } & contentGraph) => void;
    tastemakerById: (p: {
        dry: boolean;
    } & tastemaker) => putResponse;
    placeBy: (p: {
        dry: boolean;
    } & place) => putResponse;
    noteBy: (p: tastemakerNote) => putResponse;
    placeLink: (p: place_link) => putResponse;
    link: (p: linkRow) => putResponse;
    placeNode: (p: placeNodeRow) => void;
    location: (p: {
        location: locationRow;
    }) => putResponse;
    placeLocation: (p: placeLocationRow) => void;
    eventLocation: (p: eventLocationRow) => void;
    locationNode: (p: locationNodeRow) => putResponse;
    locationNodeTree: (p: locationNodeTreeRow) => void;
    locationLocationNode: (p: {
        locationNodeId: number;
        locationId: number;
    }) => void;
};
export declare type graphApiDeleteRoutes = {
    noteBy: (p: tastemakerNote) => void;
    placeLink: (p: place_link) => void;
    link: (p: linkRow) => void;
    placeNode: (p: Omit<placeNodeRow, 'primary'>) => void;
    event: (p: eventRow) => void;
    location: (p: {
        locationId: number;
    }) => void;
    placeLocation: (p: placeLocationRow) => void;
    eventLocation: (p: eventLocationRow) => void;
    locationNode: (p: locationNodeRow) => void;
    locationNodeTree: (p: locationNodeTreeRow) => void;
    locationLocationNode: (p: {
        locationNodeId: number;
        locationId?: number;
    }) => void;
};
export declare type FixieRow = {};
export declare type SessionAnalyticsRow = {
    placeOpens: number;
    placeLinkOpens: number;
    placeLinksPerPlaceOpen: number;
    shares: number;
    eventOpens: {
        all: number;
        weekly: number;
    };
};
export declare type graphApiInternalRoutes = {
    fixie: () => FixieRow;
    activity: () => ActivityRow;
    sessionAnalytics: (version: string) => SessionAnalyticsRow;
};
export declare type apiGetRoutes = {
    app: routeHandler<{}, appRow>;
    content: getRouteHandler<contentRow>;
    content_target: getRouteHandler<contentTargetRow>;
    event: routeHandler<{
        id?: number;
        future?: boolean;
        nameUrl?: string;
    }, eventRow[]>;
    event_unit: getRouteHandler<eventUnitRow>;
    place: getRouteHandler<place, {
        dataItem?: boolean;
        name?: string;
        nameUrl?: string;
    }>;
    place_event: routeHandler<{
        placeId?: number;
        eventId?: number;
    }, placeEventRow[]>;
    tastemaker: getRouteHandler<tastemaker>;
    tastemakerNote: routeHandler<{
        placeId?: number;
        tastemakerId?: number;
    }, tastemakerNote[]>;
    neighborhood: getRouteHandler<neighborhood>;
    node: getRouteHandler<nodeRow>;
    nodeTree: getRouteHandler<nodeTreeRow>;
    tag: getRouteHandler<tag>;
    place_tag: getRouteHandler<place_tag>;
    place_node: getRouteHandler<placeNodeRow>;
    place_link: routeHandler<{
        placeId: number;
    }, place_link[]>;
    post: getRouteHandler<postRow>;
    post_content: routeHandler<{
        postId: number;
    }, postContentRow[]>;
    tastemakerSummaries: routeHandler<{}, tastemakerSummary[]>;
    tastemakerList: getRouteHandler<tastemakerListRow>;
    unit: getRouteHandler<unitRow>;
    user: routeHandler<{
        id?: number;
        session?: boolean;
    }, userRow[]>;
    user_place: routeHandler<{}, userPlaceRow[]>;
    user_post: routeHandler<{}, userPostRow[]>;
    user_event: routeHandler<{}, userEventRow[]>;
    user_tastemaker: routeHandler<{}, userTastemakerRow[]>;
    videoList: getRouteHandler<videoListRow>;
    videoList_place: routeHandler<{
        videoListId?: number;
    }, videoListPlaceRow[]>;
};
export declare type getInstanceRoute<T> = (data: {
    id: number;
}) => Promise<T>;
export declare type deleteInstanceRoute = (data: {
    id: number;
}) => Promise<void>;
export declare type apiGetInstanceRoutes = {};
export declare type apiGetBytesHandlers = {};
declare type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
declare type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
declare type putRow<T extends {
    id: number;
}> = PartialBy<T, 'id'>;
declare type putResponse = {
    pk: number;
    errors?: {
        path?: string;
        errors: string[];
    }[];
};
export declare type apiPutRoutes = {
    app: (p?: Partial<appRow>) => {
        pk: number;
        encrypted: string;
    };
    app_user: routeHandler<appUserRow>;
    app_activity: routeHandler<{
        row: appActivityRow;
    }>;
    content: routeHandler<{
        row: contentRow;
    }, putResponse>;
    content_target: routeHandler<{
        row: Partial<contentTargetRow>;
        dry: boolean;
    }>;
    event: routeHandler<{
        row: eventRow;
        dry: boolean;
    }, putResponse>;
    event_unit: routeHandler<{
        eventId: number;
        unitId: number;
    }>;
    place: routeHandler<{
        row: place;
        dry: boolean;
    }, putResponse>;
    place_event: routeHandler<{
        placeId: number;
        eventId: number;
    }>;
    tastemaker: routeHandler<{
        row: tastemaker;
    }, putResponse>;
    tastemakerNote: routeHandler<{
        row: putRow<tastemakerNote>;
    }, putResponse>;
    neighborhood: routeHandler<{
        row: neighborhood;
    }, putResponse>;
    node: routeHandler<{
        row: nodeRow;
        dry: boolean;
    }, putResponse>;
    nodeTree: routeHandler<{
        row: nodeTreeRow;
        dry: boolean;
    }>;
    tag: routeHandler<{
        row: tag;
    }, putResponse>;
    place_tag: routeHandler<{
        placeId: number;
        tagId: number;
    }>;
    place_link: routeHandler<{
        row: place_link;
    }>;
    post: routeHandler<{
        row: postRow;
        dry: boolean;
    }, putResponse>;
    post_content: routeHandler<{
        row: postContentRow;
    }>;
    tastemakerList: routeHandler<{
        row: tastemakerListRow;
    }, putResponse>;
    unit: routeHandler<{
        row: unitRow;
    }, putResponse>;
    user: (p?: {
        row?: userRow;
    }) => putResponse;
    user_place: (p: {
        placeId: number;
    }) => void;
    user_post: (p: {
        postId: number;
    }) => void;
    user_event: (p: {
        eventId: number;
    }) => void;
    user_activity: (p: {
        type: userActivityType;
    }) => void;
    user_link_activity: (p: {
        placeId: number;
        label: string;
    }) => void;
    user_tastemaker: (p: {
        tastemakerId: number;
    }) => void;
    videoList: routeHandler<{
        row: videoListRow;
    }, putResponse>;
    videoList_place: routeHandler<videoListPlaceRow>;
};
export declare type apiUploadHandlers = {};
export declare type apiPatchRoutes = {
    app: (p: {
        row: Partial<appRow>;
    }) => void;
    place: (p: {
        row: Partial<place>;
    }) => void;
    user: (p: {
        row: Partial<userRow>;
    }) => void;
    tastemaker: (p: {
        row: Partial<tastemaker>;
    }) => void;
};
export declare type apiPatchHandlers = {};
export declare type apiDeleteRoutes = {
    content: (p: {
        id: number;
    }) => void;
    content_target: (p: {
        contentId?: number;
        id?: number;
    }) => void;
    user_place: (p: {
        placeId: number;
    }) => void;
    user_post: (p: {
        postId: number;
    }) => void;
    user_event: (p: {
        eventId: number;
    }) => void;
    user_tastemaker: (p: {
        tastemakerId: number;
    }) => void;
    user: (p?: {}) => void;
    event: (p: {
        id: number;
    }) => void;
    event_unit: (p: {
        eventId: number;
    }) => void;
    node: (p: {
        id: number;
    }) => void;
    nodeTree: (p: {
        nodeId?: number;
        parentNodeId?: number;
    }) => void;
    place: (p: {
        id: number;
    }) => void;
    place_event: (p: {
        eventId: number;
        placeId?: number;
    }) => void;
    place_link: (p: {
        placeId: number;
    }) => void;
    place_tag: (p: {
        placeId: number;
    }) => void;
    post: (p: {
        id: number;
    }) => void;
    post_content: (p: {
        postId: number;
        contentId: number;
    }) => void;
    unit: (p: {
        id: number;
    }) => void;
    tastemaker: (p: {
        tastemakerId: number;
    }) => void;
    tastemakerNote: (p: {
        tastemakerNoteId?: number;
        placeId?: number;
        personId?: number;
    }) => void;
    tastemakerList: (p: {
        tastemakerListId: number;
    }) => void;
    videoList: (p: {
        videoListId: number;
    }) => void;
    videoList_place: (p: ({
        videoListId: number;
        placeId?: number;
    })) => void;
};
export declare type apiPushRoutes = {
    test(): void;
};
export declare type apiDeleteInstancesRoutes = {};
export {};
