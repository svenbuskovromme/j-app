import { BaseQueryFn, createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { api, apiGetRoutes, eventContentRow, eventRow, graphApiDeleteRoutes, graphApiGetRoutes, graphApiPutRoutes, graphApiUserGetRoutes, place, tastemaker, tastemakerNote, userEventRow } from 'jungle-shared';
import axios, {AxiosError, AxiosRequestConfig, AxiosResponse} from 'axios';
import { EndpointBuilder } from '@reduxjs/toolkit/dist/query/endpointDefinitions';


api.baseUrl = 'https://jungleapp.co';
// api.baseUrl = 'https://jungle-api.vercel.app';

// api.baseUrl = 'http://192.168.68.118:3000';
// api.baseUrl = 'http://192.168.0.101:3000';
// api.baseUrl = 'http://192.168.156.129:3000';
// api.baseUrl = 'http://192.168.14.128:3000';
// api.baseUrl = 'http://192.168.1.10:3000';
// api.baseUrl = 'http://192.168.1.72:3000';
// api.baseUrl = 'http://192.168.7.136:3000';
// api.baseUrl = 'http://192.168.0.101:3000';
// api.baseUrl = 'http://127.0.0.1:3000';
// api.baseUrl = 'http://192.168.188.136:3000';
// api.baseUrl = 'http://172.20.10.4:3000';

const customBaseQuery: BaseQueryFn<Promise<AxiosResponse>> =async (
    args
) => {
    return await args.then((data) => ({data: data.data})).catch((error: string) => ({error}));
};

const axiosBaseQuery =
  (
    { baseUrl }: { baseUrl: string } = { baseUrl: '' }
  ): BaseQueryFn<
    {
      url: string
      method: AxiosRequestConfig['method']
      data?: AxiosRequestConfig['data']
      params?: AxiosRequestConfig['params']
    },
    unknown,
    unknown
  > =>
  async ({ url, method, data, params }) => {
    try {
      const result = await axios({ url: baseUrl + url, method, data, params, withCredentials: true, headers: api.getHeaders() })
      return { data: result.data }
    } catch (axiosError) {
      let err = axiosError as AxiosError
      return {
        error: {
          status: err.response?.status,
          data: err.response?.data || err.message,
        },
      }
    }
  }

export const userApi = createApi({
    reducerPath: 'userApi',
    baseQuery: customBaseQuery,
    endpoints: builder => ({
        getUserEvents: builder.query<eventRow[], void>({
            query: () => axios.get(api.baseUrl + '/api/user/event', {headers: api.getHeaders(), withCredentials: true})
        }),
        getUserFollows: builder.query<tastemaker, void>({
            query: () => axios.get(api.baseUrl + '/api/user/follow', {headers: api.getHeaders(), withCredentials: true})
        })
    })
});

const urlWithQueries = (endpoint: string, queries: {[k in string]: any}) => {
    const entries = Object.entries(queries);
    const arr: string[] = [];

    for(let i = 0; i < entries.length; i++){
        const [k, v] = entries[i];

        arr.push(`${k}=${v}`);
    }

    const url = [endpoint, arr.join('&')].join('?');
    
    return url;
}

export const publicApi = createApi({
    reducerPath: 'publicApi',
    baseQuery: axiosBaseQuery({baseUrl: api.baseUrl}),
    endpoints: builder => ({
        getTastemaker: builder.query<tastemaker, number>({
            query: id => ({url: `/api/tastemaker/${id}`, method: 'get'})
        }),
        getNotes: builder.query<tastemakerNote[], {tastemakerId?:number, placeId?: number} | undefined>({
            query: (queries = {}) => {
                // const endpoint = '';
                // const queries:string[] = [];
                
                // if(tastemakerId) queries.push(`tastemakerId=${tastemakerId}`);
                // if(placeId) queries.push(`placeId=${placeId}`);
                
                // const url = [endpoint, queries.join('&')].join('?');
                const url = urlWithQueries('/api/tastemakerNote', queries);

                return {url, method: 'get'};
            }
        }),
        getPlace: builder.query<place, number>({
            query: id => ({url: `/api/place/${id}`, method: 'get'})
        }),
        getEventContent: builder.query<eventContentRow[], number>({
            query: eventId => ({url: urlWithQueries('/api/eventContent', {eventId}), method: 'get'})
        })
    })
});

type tags = keyof graphApiPutRoutes | keyof graphApiGetRoutes | keyof graphApiDeleteRoutes | 'home';

const graphGetQuery = <T extends keyof graphApiGetRoutes>(builder: EndpointBuilder<GraphBaseQuery, tags, 'graphApi'>, method: T, providesTags: string[] = []) => {
  return builder.query<ReturnType<graphApiGetRoutes[T]>, Parameters<graphApiGetRoutes[T]>[0]>({
    query: async p => api.graph.get(method, p),
    // transformResponse: data => {

    //   return data;
    // },
    providesTags: (res: any, err, args) => {
    if(res){
      const resArr: any[] = res instanceof Array ? res : [res];

      return [...resArr.map(res => ({...res, type: method})), method, ...providesTags]
    }

    return [method, ...providesTags];
  }});
}

const graphUserGetQuery = <T extends keyof graphApiUserGetRoutes>(builder: EndpointBuilder<GraphBaseQuery, keyof graphApiUserGetRoutes, 'userGraphApi'>, method: T) => {
  return builder.query<ReturnType<graphApiUserGetRoutes[T]>, Parameters<graphApiUserGetRoutes[T]>[0]>({
    query: async p => api.graph.user(method, p),
    // transformResponse: data => {

    //   return data;
    // },
    providesTags: (res, err, args) => {
      if(res){
        const resArr: any[] = res instanceof Array ? res : [res];

        return [...resArr.map(res => ({...res, type: method})), method];
      }

    return [method];
  }});
}

const graphUserMutate = <T extends keyof graphApiUserGetRoutes>(builder: EndpointBuilder<GraphBaseQuery, keyof graphApiUserGetRoutes, 'userGraphApi'>, method: T, invalidatesTags: (keyof graphApiUserGetRoutes)[] = []) => {
  return builder.mutation<ReturnType<graphApiUserGetRoutes[T]>, Parameters<graphApiUserGetRoutes[T]>[0]>({
    query: async p => api.graph.user(method, p),
    // transformResponse: data => {

    //   return data;
    // },
    invalidatesTags: (res, err, args) => {
      if(res){
        const resArr: any[] = res instanceof Array ? res : [res];

        return [...invalidatesTags, ...resArr.map(res => ({...res, type: method})), method];
      }

    return [...invalidatesTags, method];
  }});
}

type GraphBaseQuery = BaseQueryFn<
    Promise<unknown>,
    unknown,
    unknown
>;
  
const graphBaseQuery: () => GraphBaseQuery = () => async promise => {
    try {
      const result = await promise;
      return { data: result }
    } catch (axiosError) {
      let err = axiosError as AxiosError
      return {
        error: {
          status: err.response?.status,
          data: err.response?.data || err.message,
        },
      }
    }
}

export const graphApi = createApi({
    reducerPath: 'graphApi',
  baseQuery: graphBaseQuery(),
  tagTypes: ['home', 'userList', 'geoip','event', 'events', 'noteBy', 'notes', 'locations', 'locationNodes', 'locationNodeBy', 'nodeListBy', 'placeBy', 'places', 'post', 'posts', 'node', 'content', 'contentById', 'tastemakers', 'tastemakerById', 'noteBy', 'nodeTree'],
  refetchOnReconnect: true,
  endpoints: builder => ({
    getEvent: graphGetQuery(builder, 'event'),
    getEvents: graphGetQuery(builder, 'events', ['home']),
    getPosts: graphGetQuery(builder, 'posts'),
    getPost: graphGetQuery(builder, 'post'),
    getSearchNodes: graphGetQuery(builder, 'nodeTree'),
    // getNodes: graphGetQuery(builder, 'node'),
    getContent: graphGetQuery(builder, 'content'),
    // getContentById: graphGetQuery(builder, 'contentById'),
    getTastemakerById: graphGetQuery(builder, 'tastemakerById'),
    getTastemakers: graphGetQuery(builder, 'tastemakers'),
    getPlaces: graphGetQuery(builder, 'places'),
    getPlaceBy: graphGetQuery(builder, 'placeBy'),
    getLocationNodes: graphGetQuery(builder, 'locationNodes'),
    getLocationNodeBy: graphGetQuery(builder, 'locationNodeBy', ['home']),
    getNodeListBy: graphGetQuery(builder, 'nodeListBy'),
    getTastemakerNoteBy: graphGetQuery(builder, 'noteBy', ['home']),
    getTastemakerNotes: graphGetQuery(builder, 'notes'),
    getGeoIP: graphGetQuery(builder, 'geoip'),
    getLocations: graphGetQuery(builder, 'locations'),
    getSharedUserList: graphGetQuery(builder, 'userList')
    // editContent: graphPutQuery(builder, 'contentById', ['content']),
    // editTastemaker: graphPutQuery(builder, 'tastemakerById', ['tastemakers']),
    // putPlace: graphPutQuery(builder, 'placeBy'),
    // putNote: graphPutQuery(builder, 'noteBy', ['places', 'placeBy', 'tastemakerById']),
    // deleteNote: graphDeleteQuery(builder, 'noteBy', ['places', 'placeBy', 'tastemakerById']),
  }),
});

export const userGraphApi = createApi({
  reducerPath: 'userGraphApi',
  baseQuery: graphBaseQuery(),
  refetchOnReconnect: true,
  tagTypes: ['events', 'places', 'tastemakers', 'putEvent', 'deleteEvent', 'getLists', 'getListBy', 'putList', 'putListPlace', 'deleteList','deleteListPlace'],
  endpoints: builder => ({
    getUserPlaces: graphUserGetQuery(builder, 'places'),
    getUserTastemakers: graphUserGetQuery(builder, 'tastemakers'),
    getUserEvents: graphUserGetQuery(builder, 'events'),
    getUserLists: graphUserGetQuery(builder, 'getLists'),
    getUserListBy: graphUserGetQuery(builder, 'getListBy'),
    putUserList: graphUserMutate(builder, 'putList', ['getLists', 'getListBy']),
    putUserListPlace: graphUserMutate(builder, 'putListPlace', ['getLists', 'getListBy']),
    putUserEvent: graphUserMutate(builder, 'putEvent', ['events']),
    deleteUserEvent: graphUserMutate(builder, 'deleteEvent', ['events']),
    deleteUserList: graphUserMutate(builder, 'deleteList', ['getLists', 'getListBy']),
    deleteUserListPlace: graphUserMutate(builder, 'deleteListPlace', ['getLists', 'getListBy'])
  }),
});

export const {
  useGetEventQuery,
  useGetEventsQuery, 
  useGetPostsQuery, 
  useGetPostQuery, 
  useGetSearchNodesQuery,
  useGetGeoIPQuery,
  // useGetNodesQuery, 
  useGetContentQuery,
  // useGetContentByIdQuery, 
  // useEditContentMutation, 
  useGetTastemakerByIdQuery, 
  // useEditTastemakerMutation,
  useGetLocationNodeByQuery,
  useGetTastemakersQuery,
  useGetPlacesQuery,
  useGetPlaceByQuery,
  useGetLocationNodesQuery,
  useGetNodeListByQuery,
  useGetTastemakerNoteByQuery,
  useGetLocationsQuery,
  useGetTastemakerNotesQuery,
  useGetSharedUserListQuery,
  useLazyGetSearchNodesQuery,
  useLazyGetLocationNodeByQuery
  // usePutPlaceMutation,
  // usePutNoteMutation,
  // useDeleteNoteMutation,
} = graphApi;
export const {
  useGetUserEventsQuery,
  useGetUserTastemakersQuery,
  useGetUserPlacesQuery,
  useGetUserListsQuery,
  useGetUserListByQuery,
  usePutUserListMutation,
  usePutUserListPlaceMutation,
  usePutUserEventMutation,
  useDeleteUserListMutation,
  useDeleteUserListPlaceMutation,
  useDeleteUserEventMutation
} = userGraphApi;
// export const {useGetUserEventsQuery} = userApi;
export const {useGetTastemakerQuery, useGetNotesQuery, useGetEventContentQuery} = publicApi;