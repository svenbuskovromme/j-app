import { tastemakerGraph } from './graphs';
export declare type userRow = {
    id: number;
    firstName: string;
    lastName: string;
    created: Date;
    magic_issuer: string;
    email: string;
    signInStep: number;
    locationEnabled: boolean;
    appleUserId: string;
    imageUrl: string | null;
    deleted: boolean;
};
export declare type userListRow = {
    id: number;
    name: string;
    created: Date;
    shareId: string;
};
export declare type userUserListRow = {
    userId: number;
    userListId: number;
};
export declare type userListPlaceRow = {
    userListId: number;
    placeId: number;
};
export declare type place = {
    id: number;
    name: string;
    created: Date;
    lat: number;
    long: number;
    rank: number | null;
    hasVideo: boolean;
    accentColor: string;
    primaryColor: string;
    iconColor: string | null;
    textColor: string | null;
    hours: string | null;
    streetName: string;
    houseNumber: string;
    zipCode: string;
    city: string;
    country: string;
    enabled: boolean;
    deleted: boolean;
    quoteSnippet: string | null;
    nameUrl: string;
};
export declare type placeContentRow = {
    placeId: number;
    contentId: number;
    primary: boolean;
    position: number | null;
};
export declare type tastemakerContentRow = {
    tastemakerId: number;
    contentId: number;
    primary: boolean;
    position: number | null;
};
export declare type linkRow = {
    id: number;
    name: string;
    url: string;
};
export declare type linkContentRow = {
    linkId: number;
    contentId: number;
    primary: boolean;
};
export declare type listRow = {
    id: number;
    name: string;
    description: string;
    nameUrl: string;
};
export declare type listPlaceRow = {
    listId: number;
    placeId: number;
    tastemakerId: number | null;
};
export declare type userPlaceRow = {
    userId: number;
    placeId: number;
};
export declare type userPostRow = {
    userId: number;
    postId: number;
};
export declare type userEventStatus = 'interested' | 'attended' | 'archived';
export declare type userEventRow = {
    userId: number;
    eventId: number;
    created: Date;
    status: userEventStatus;
};
export declare type userTastemakerRow = {
    userId: number;
    tastemakerId: number;
};
export declare enum userActivityType {
    appOpen = 0
}
export declare enum userLinkActivityType {
}
export declare type userLinkActivityRow = {
    userId: number;
    placeId: number;
    label: string;
    created: Date;
};
export declare type userActivityRow = {
    userId: number;
    type: userActivityType;
    created: Date;
};
export declare type videoListRow = {
    id: number;
    name: string;
    position: number;
};
export declare type videoListPlaceRow = {
    videoListId: number;
    placeId: number;
    position: number;
};
export declare type tag = {
    id: number;
    name: string;
};
export declare type tastemaker = {
    id: number;
    firstname: string;
    lastname: string | null;
    bio: string;
    role: string;
    placeId: number | null;
    placeName: string;
    enabled: boolean;
    deleted: boolean;
    nameUrl: string;
};
export declare type tastemakerListRow = {
    id: number;
    tastemakerId: number;
    imageUrl: string;
    position: number;
};
export declare type appRow = {
    id: number;
    created: Date;
    deviceToken: string | null;
    weeklyPush: boolean;
    dailyPush: boolean;
    followPush: boolean;
    type: number;
    dev: boolean;
    os: string;
    version: string;
};
export declare type appUserRow = {
    appId: number;
    userId: number;
};
export interface appActivityObject {
    type: appActivityType;
    data?: object;
}
export declare type appActivityType = appActivity['type'];
export interface appOpenActivity extends appActivityObject {
    type: 'appOpen';
}
export interface signInActivity extends appActivityObject {
    type: 'signIn';
}
export interface placeVideoOpenActivity extends appActivityObject {
    type: 'placeVideoOpen';
    data: {
        placeId: number;
    };
}
export interface placeOpenActivity extends appActivityObject {
    type: 'placeOpen';
    data: {
        fromUserList?: {
            id?: number;
            shareId?: string;
        };
        fromHome?: boolean;
        placeId: number;
        fromListId?: number;
        fromContentId?: number;
        fromMap?: boolean;
        fromSearch?: {
            searchTerm: string;
            nodes: number[];
        };
        fromPostId?: number;
        fromEventId?: number;
        fromTastemakerId?: number;
    };
}
export interface placeSaveActivity extends appActivityObject {
    type: 'placeSave';
    data: {
        placeId: number;
    };
}
export interface placeLinkOpenActivity extends appActivityObject {
    type: 'placeLinkOpen';
    data: {
        placeId: number;
        linkLabel: string;
    };
}
export interface locationOpen extends appActivityObject {
    type: 'locationOpen';
    data: {
        locationId: number;
        fromPlaceId?: number;
        fromEventId?: number;
    };
}
export interface tastemakerOpenActivity extends appActivityObject {
    type: 'tastemakerOpen';
    data: {
        tastemakerId: number;
    };
}
export interface discoverOpenActivity extends appActivityObject {
    type: 'disoverOpen';
}
export interface discoverVideoOpenActivity extends appActivityObject {
    type: 'discoverVideoOpen';
}
export interface discoverListOpenActivity extends appActivityObject {
    type: 'discoverList';
}
export interface searchOpenActivity extends appActivityObject {
    type: 'searchOpen';
    data: {
        button?: 'map' | 'search';
    };
}
export interface onboardingCloseActivity extends appActivityObject {
    type: 'onboardingClose';
    data: {
        step: number;
    };
}
export interface onboardingSubActivity extends appActivityObject {
    type: 'onboardingSub';
}
export interface urlShare extends appActivityObject {
    type: 'urlShare';
    data: {
        type: 'event' | 'post' | 'tastemaker' | 'place' | 'userList';
        id: number;
    };
}
export interface pushOpen extends appActivityObject {
    type: 'pushOpen';
    data: {
        type: 'weekly';
    };
}
export interface urlOpen extends appActivityObject {
    type: 'urlOpen';
    data: {
        url?: string;
        type?: 'event' | 'post' | 'tastemaker' | 'place' | 'userList';
        id?: number;
    };
}
export interface eventOpen extends appActivityObject {
    type: 'eventOpen';
    data: {
        id: number;
        from: 'weekly' | 'calendar' | 'place';
    };
}
export interface eventMore extends appActivityObject {
    type: 'eventMore';
    data: {
        id: number;
    };
}
export interface eventBookmark extends appActivityObject {
    type: 'eventBookmark';
    data: {
        id: number;
        from: 'event' | 'weekly';
    };
}
export interface gridPostTapped extends appActivityObject {
    type: 'gridPostTapped';
    data: {
        id: number;
    };
}
export interface listPostView extends appActivityObject {
    type: 'listPostView';
    data: {
        id: number;
    };
}
export interface listsOpen extends appActivityObject {
    type: 'listsOpen';
}
export interface postImpression extends appActivityObject {
    type: 'postImpression';
    data: {
        postId: number;
    };
}
export interface eventImpression extends appActivityObject {
    type: 'eventImpression';
    data: {
        eventId: number;
    };
}
export interface dropImpression extends appActivityObject {
    type: 'dropImpression';
    data: {
        eventId: number;
    };
}
export interface searchCategorySelect extends appActivityObject {
    type: 'searchCategorySelect';
    data: {
        nodeId: number;
    };
}
export interface searchItemSelect extends appActivityObject {
    type: 'searchItemSelect';
    data: {
        searchItem: {
            placeId?: number;
            tastemakerId?: number;
        };
        searchTerm: string;
        branches: number[];
    };
}
export interface mapOpen extends appActivityObject {
    type: 'mapOpen';
}
export interface listOpen extends appActivityObject {
    type: 'listOpen';
    data: {
        id: number;
    };
}
export interface nodeListOpen extends appActivityObject {
    type: 'nodeListOpen';
    data: {
        nodeId: number;
        locationNodeId: number;
    };
}
export interface placeRecommendationsOpen extends appActivityObject {
    type: 'placeRecommendationsOpen';
    data: {
        placeId: number;
    };
}
export interface linkOpen extends appActivityObject {
    type: 'linkOpen';
    data: {
        id: number;
        fromEventId?: number;
        fromPostId?: number;
    };
}
export interface homeOpen extends appActivityObject {
    type: 'homeOpen';
}
export interface weeklyOpen extends appActivityObject {
    type: 'weeklyOpen';
}
export interface weeklySwipe extends appActivityObject {
    type: 'weeklySwipe';
    data: {
        index: number;
    };
}
export interface weeklySub extends appActivityObject {
    type: 'weeklySub';
}
export interface userListOpen extends appActivityObject {
    type: 'userListOpen';
    data: {
        id?: number;
        shareId?: string;
    };
}
export interface userInboxOpen extends appActivityObject {
    type: 'userInboxOpen';
}
export declare type appActivity = weeklyOpen | weeklySub | weeklySwipe | userListOpen | userInboxOpen | linkOpen | homeOpen | onboardingSubActivity | postImpression | eventImpression | dropImpression | searchCategorySelect | searchItemSelect | mapOpen | listOpen | nodeListOpen | listsOpen | placeRecommendationsOpen | onboardingCloseActivity | placeVideoOpenActivity | discoverVideoOpenActivity | placeOpenActivity | placeSaveActivity | appOpenActivity | signInActivity | placeLinkOpenActivity | locationOpen | tastemakerOpenActivity | discoverOpenActivity | discoverListOpenActivity | searchOpenActivity | pushOpen | urlOpen | urlShare | eventOpen | eventBookmark | eventMore | gridPostTapped | listPostView;
export declare type appActivityRow = {
    appId: number;
    created: Date;
    type: appActivityType;
    data: string | null;
    dev: boolean;
    os: string;
    version: string;
};
export declare type tastemakerSummary = Pick<tastemaker, 'id' | 'firstname' | 'lastname' | 'role' | 'placeId' | 'placeName' | 'enabled'>;
export declare type tastemakerNote = {
    id: number;
    tastemakerId: number;
    placeId: number;
    note: string;
    featuredAt: Date | null;
    created: Date;
};
export declare type neighborhood = {
    id: number;
    name: string;
};
export declare type place_tag = {
    placeId: number;
    tagId: number;
};
export declare type place_link = {
    id: number;
    placeId: number;
    type: placeLinkType;
    label: string;
    value: string;
    valid: boolean;
};
export declare enum placeLinkType {
    url = 0,
    phoneNumber = 1,
    directions = 2,
    events = 3
}
export declare type tokenRow = {
    selector: string;
    validatorHashed: string;
    userId: number;
    expires: Date;
};
export declare type dropStatus = 'none' | 'available' | 'sold out';
export declare type eventRow = {
    id: number;
    title: string;
    subtitle: string | null;
    address: string | null;
    url: string | null;
    description: string | null;
    start: Date;
    end: Date | null;
    startEndLabel: string | null;
    nameUrl: string;
    price: string | null;
    canBuy: boolean;
    deleted: boolean;
    enabled: boolean;
    dropStatus: dropStatus;
    highlight: boolean;
};
export declare type eventContentRowOld = {
    id: number;
    eventId: number;
};
export declare type eventContentRow = {
    eventId: number;
    contentId: number;
    position: number | null;
};
export declare type eventLocationRow = {
    eventId: number;
    locationId: number;
};
export declare type eventTagRow = {
    eventId: number;
    tagId: number;
};
export declare type eventUnitRow = {
    eventId: number;
    unitId: number;
};
export declare type unitRow = {
    id: number;
    name: string;
    price: number;
};
export declare type placeEventRow = {
    placeId: number;
    eventId: number;
};
export declare type postRow = {
    id: number;
    title: string;
    text: string;
    publishDate: Date;
    creationDate: Date;
    enabled: boolean;
    longText: boolean;
    nameUrl: string;
};
export declare type postContentRow = {
    postId: number;
    contentId: number;
    position: number | null;
};
export declare type contentType = null | 'video' | 'image';
export declare type contentRow = {
    id: number;
    type: contentType;
};
export declare type contentTargetRow = {
    id: number;
    contentId: number;
    placeId: number | null;
    tastemakerId: number | null;
    eventId: number | null;
    url: string | null;
    name: string;
};
export declare type contentNodeRow = {
    contentId: number;
    nodeId: number;
    primary: boolean;
};
export declare type placeListItem<T extends 'search'> = Pick<place, 'id' | 'name'> & (T extends 'search' ? {
    posterContent: null | number[];
    locationNodes: null | number[];
} : never);
export declare type locationListItem<T extends 'search'> = Pick<locationRow, 'id' | 'lat' | 'long'> & (T extends 'search' ? {
    places: number[];
} : never);
export declare type PlaceSearchItem = {
    type: 'place';
    data: placeListItem<'search'>;
};
export declare type TMSearchItem = {
    type: 'tm';
    data: tastemakerSummary;
};
export declare type SearchItem = (PlaceSearchItem | TMSearchItem);
export declare type searchAndMapRow = {
    hasMoreResults: boolean;
    nodes: null | (nodeRow & {
        count: number;
    })[];
    items: SearchItem[];
    places: placeListItem<'search'>[];
    locations: null | locationListItem<'search'>[];
    locationNodes: locationNodeRow[];
    tastemakers: tastemakerGraph[];
};
export declare type schema = {
    app: appRow;
    app_user: appUserRow;
    app_activity: appActivityRow;
    content: contentRow;
    content_target: contentTargetRow;
    content_node: contentNodeRow;
    event: eventRow;
    eventContent: eventContentRowOld;
    event_content: eventContentRow;
    event_location: eventLocationRow;
    event_tag: eventTagRow;
    event_unit: eventUnitRow;
    link: linkRow;
    link_content: linkContentRow;
    list: listRow;
    list_place: listPlaceRow;
    location: locationRow;
    locationNode: locationNodeRow;
    locationNodeTree: locationNodeTreeRow;
    location_locationNode: locationLocationNodeRow;
    neighborhood: neighborhood;
    node: nodeRow;
    nodeTree: nodeTreeRow;
    place: place;
    place_content: placeContentRow;
    place_event: placeEventRow;
    place_node: placeNodeRow;
    place_tag: place_tag;
    place_link: place_link;
    place_location: placeLocationRow;
    post: postRow;
    post_content: postContentRow;
    tastemaker: tastemaker;
    tastemaker_content: tastemakerContentRow;
    tag: tag;
    tastemakerList: tastemakerListRow;
    tastemakerNote: tastemakerNote;
    token: tokenRow;
    unit: unitRow;
    user: userRow;
    user_event: userEventRow;
    user_tastemaker: userTastemakerRow;
    user_place: userPlaceRow;
    user_post: userPostRow;
    user_activity: userActivityRow;
    user_link_activity: userLinkActivityRow;
    userList: userListRow;
    userList_place: userListPlaceRow;
    user_userList: userUserListRow;
    videoList: videoListRow;
    videoList_place: videoListPlaceRow;
};
export declare type item = {
    name: string;
    id: number;
};
export declare type openHoursPeriod = {
    close: {
        day: number;
        time: string;
    };
    open: {
        day: number;
        time: string;
    };
};
export declare type openHours = {
    periods: openHoursPeriod[];
};
export declare type locationRow = {
    id: number;
    lat: number;
    long: number;
    type: string;
    streetName: string;
    houseNumber: string;
    zipCode: string;
    address: string;
    enabled: boolean;
    hidden: boolean;
    googlePlaceId: string;
    googlePlaceUrl: string;
};
export declare type locationNodeRow = {
    id: number;
    name: string;
    lat: number;
    long: number;
    type: 'planet' | 'country' | 'city' | 'neighborhood';
    homeEnabled: boolean;
};
export declare type locationNodeTreeRow = {
    parentLocationNodeId: number;
    locationNodeId: number;
};
export declare type locationLocationNodeRow = {
    locationId: number;
    locationNodeId: number;
};
export declare type placeLocationRow = {
    placeId: number;
    locationId: number;
};
export declare type nodeRow = {
    id: number;
    name: string;
    namePlural: string;
};
export declare type nodeTreeRow = {
    nodeId: number;
    parentNodeId: number;
};
export declare type placeNodeRow = {
    placeId: number;
    nodeId: number;
    primary: boolean;
};
