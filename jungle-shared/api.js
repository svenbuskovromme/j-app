"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
const axios_1 = __importDefault(require("axios"));
const graph = {
    get: async (route, data) => {
        let url = api.restUrl(route, undefined, 'get');
        return (await axios_1.default.post(url, data, { withCredentials: true, headers: api.getHeaders() })).data;
    },
    put: async (route, data) => {
        let url = api.restUrl(route, undefined, 'put');
        return (await axios_1.default.post(url, data, { withCredentials: true, headers: api.getHeaders() })).data;
    },
    delete: async (route, data) => {
        let url = api.restUrl(route, undefined, 'delete');
        return (await axios_1.default.post(url, data, { withCredentials: true, headers: api.getHeaders() })).data;
    },
    user: async (route, data) => {
        let url = api.restUrl(route, undefined, 'user');
        return (await axios_1.default.post(url, data, { withCredentials: true, headers: api.getHeaders() })).data;
    },
};
class api {
    static restUrl(base, data, graphMethod) {
        if (graphMethod)
            base = `graph/${graphMethod}/${base}`;
        let url = `${this.baseUrl}/api/${base}`;
        if (data) {
            url += '?';
            const queries = [];
            Object.entries(data).forEach(([k, v]) => typeof v !== 'undefined' && queries.push(`${k}=${v}`));
            url += queries.join('&');
        }
        return url;
    }
    ;
    static getHeaders() {
        return this.browser ? {} : { "cookie": `googleIdToken=${api.googleIdToken};key=${api.key};idToken=${api.appleIdToken};appToken=${api.appToken};`, "Authorization": `Bearer ${api.didToken}` };
    }
}
exports.api = api;
_a = api;
api.baseUrl = '';
api.browser = false;
api.put = async (table, ...rest) => {
    return (await axios_1.default.put(api.restUrl(table), rest[0], { withCredentials: true, headers: api.getHeaders() })).data;
};
api.get = async (table, data) => {
    let url = api.restUrl(table, data);
    return (await axios_1.default.get(url, { withCredentials: true, headers: api.getHeaders() })).data;
};
api.graph = graph;
api.post = async (route, data) => {
    const url = api.restUrl(route);
    return (await axios_1.default.post(url, data ?? {}, { withCredentials: true, headers: api.getHeaders() })).data;
};
api.patch = async (route, ...data) => {
    const url = api.restUrl(route);
    return (await axios_1.default.patch(url, data[0] ?? {}, { withCredentials: true, headers: api.getHeaders() })).data;
};
api.delete = async (route, data) => {
    let url = api.restUrl(route, data);
    return (await axios_1.default.delete(url, { withCredentials: true, headers: api.getHeaders() }));
};
api.push = async (route, data) => {
    let url = api.restUrl(route, data);
    return (await axios_1.default.post(url, { withCredentials: true, headers: api.getHeaders() }));
};
api.axios = axios_1.default;
api.key = '';
api.didToken = '';
api.appleIdToken = '';
api.appToken = '';
api.googleAccessToken = '';
api.googleIdToken = '';
