"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.placeLinkType = exports.userLinkActivityType = exports.userActivityType = void 0;
var userActivityType;
(function (userActivityType) {
    userActivityType[userActivityType["appOpen"] = 0] = "appOpen";
})(userActivityType = exports.userActivityType || (exports.userActivityType = {}));
var userLinkActivityType;
(function (userLinkActivityType) {
})(userLinkActivityType = exports.userLinkActivityType || (exports.userLinkActivityType = {}));
var placeLinkType;
(function (placeLinkType) {
    placeLinkType[placeLinkType["url"] = 0] = "url";
    placeLinkType[placeLinkType["phoneNumber"] = 1] = "phoneNumber";
    placeLinkType[placeLinkType["directions"] = 2] = "directions";
    placeLinkType[placeLinkType["events"] = 3] = "events";
})(placeLinkType = exports.placeLinkType || (exports.placeLinkType = {}));
