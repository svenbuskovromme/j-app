import { createContext } from "react";
import { eventGraph, postGraph } from "jungle-shared";

export interface IFeedContext{
    drops: eventGraph[],
    events: eventGraph[],
    news: postGraph[],
    placeId?: number
}

export const FeedContext = createContext({} as IFeedContext);

export const PostHeight = 300;
export const EventsListHeight = 320;
export const DropsListHeight = 320;
export const NewsHeaderHeight = 80;