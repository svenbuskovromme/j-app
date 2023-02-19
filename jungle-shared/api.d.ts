import { apiGetRoutes, apiPostRoutes, apiPutRoutes, apiPatchRoutes, apiDeleteRoutes, apiPushRoutes, graphApiGetRoutes, graphApiPutRoutes, graphApiDeleteRoutes, graphApiUserGetRoutes } from "./routes";
import { schema } from "./tables";
declare const graph: {
    get: <k extends keyof graphApiGetRoutes>(route: k, data: Parameters<graphApiGetRoutes[k]>[0]) => Promise<ReturnType<graphApiGetRoutes[k]>>;
    put: <k extends keyof graphApiPutRoutes>(route: k, data: Parameters<graphApiPutRoutes[k]>[0]) => Promise<ReturnType<graphApiPutRoutes[k]>>;
    delete: <k extends keyof graphApiDeleteRoutes>(route: k, data: Parameters<graphApiDeleteRoutes[k]>[0]) => Promise<ReturnType<graphApiDeleteRoutes[k]>>;
    user: <k extends keyof graphApiUserGetRoutes>(route: k, data: Parameters<graphApiUserGetRoutes[k]>[0]) => Promise<ReturnType<graphApiUserGetRoutes[k]>>;
};
export declare class api {
    static baseUrl: string;
    static browser: boolean;
    static restUrl(base: string | keyof schema, data?: object, graphMethod?: keyof typeof graph): string;
    static getHeaders(): any;
    static put: <k extends keyof apiPutRoutes>(table: k, ...rest: Parameters<apiPutRoutes[k]>) => Promise<ReturnType<apiPutRoutes[k]>>;
    static get: <k extends keyof apiGetRoutes>(table: k, data?: Parameters<apiGetRoutes[k]>[0]) => Promise<ReturnType<apiGetRoutes[k]>>;
    static graph: {
        get: <k extends keyof graphApiGetRoutes>(route: k, data: Parameters<graphApiGetRoutes[k]>[0]) => Promise<ReturnType<graphApiGetRoutes[k]>>;
        put: <k_1 extends keyof graphApiPutRoutes>(route: k_1, data: Parameters<graphApiPutRoutes[k_1]>[0]) => Promise<ReturnType<graphApiPutRoutes[k_1]>>;
        delete: <k_2 extends keyof graphApiDeleteRoutes>(route: k_2, data: Parameters<graphApiDeleteRoutes[k_2]>[0]) => Promise<ReturnType<graphApiDeleteRoutes[k_2]>>;
        user: <k_3 extends keyof graphApiUserGetRoutes>(route: k_3, data: Parameters<graphApiUserGetRoutes[k_3]>[0]) => Promise<ReturnType<graphApiUserGetRoutes[k_3]>>;
    };
    static post: <k extends keyof apiPostRoutes>(table: k, data?: Parameters<apiPostRoutes[k]>[0]) => Promise<ReturnType<apiPostRoutes[k]>>;
    static patch: <k extends keyof apiPatchRoutes>(table: k, ...data: Parameters<apiPatchRoutes[k]>) => Promise<ReturnType<apiPatchRoutes[k]>>;
    static delete: <k extends keyof apiDeleteRoutes>(table: k, ...data: Parameters<apiDeleteRoutes[k]>) => Promise<ReturnType<apiDeleteRoutes[k]>>;
    static push: <k extends keyof apiPushRoutes>(table: k, ...data: Parameters<apiPushRoutes[k]>) => Promise<ReturnType<apiPushRoutes[k]>>;
    static axios: import("axios").AxiosStatic;
    static key: string;
    static didToken: string;
    static appleIdToken: string;
    static appToken: string;
    static googleAccessToken: string;
    static googleIdToken: string;
}
export {};
