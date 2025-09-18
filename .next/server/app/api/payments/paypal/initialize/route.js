"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/payments/paypal/initialize/route";
exports.ids = ["app/api/payments/paypal/initialize/route"];
exports.modules = {

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "buffer":
/*!*************************!*\
  !*** external "buffer" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("buffer");

/***/ }),

/***/ "node:buffer":
/*!******************************!*\
  !*** external "node:buffer" ***!
  \******************************/
/***/ ((module) => {

module.exports = require("node:buffer");

/***/ }),

/***/ "node:fs":
/*!**************************!*\
  !*** external "node:fs" ***!
  \**************************/
/***/ ((module) => {

module.exports = require("node:fs");

/***/ }),

/***/ "node:http":
/*!****************************!*\
  !*** external "node:http" ***!
  \****************************/
/***/ ((module) => {

module.exports = require("node:http");

/***/ }),

/***/ "node:https":
/*!*****************************!*\
  !*** external "node:https" ***!
  \*****************************/
/***/ ((module) => {

module.exports = require("node:https");

/***/ }),

/***/ "node:net":
/*!***************************!*\
  !*** external "node:net" ***!
  \***************************/
/***/ ((module) => {

module.exports = require("node:net");

/***/ }),

/***/ "node:path":
/*!****************************!*\
  !*** external "node:path" ***!
  \****************************/
/***/ ((module) => {

module.exports = require("node:path");

/***/ }),

/***/ "node:process":
/*!*******************************!*\
  !*** external "node:process" ***!
  \*******************************/
/***/ ((module) => {

module.exports = require("node:process");

/***/ }),

/***/ "node:stream":
/*!******************************!*\
  !*** external "node:stream" ***!
  \******************************/
/***/ ((module) => {

module.exports = require("node:stream");

/***/ }),

/***/ "node:stream/web":
/*!**********************************!*\
  !*** external "node:stream/web" ***!
  \**********************************/
/***/ ((module) => {

module.exports = require("node:stream/web");

/***/ }),

/***/ "node:url":
/*!***************************!*\
  !*** external "node:url" ***!
  \***************************/
/***/ ((module) => {

module.exports = require("node:url");

/***/ }),

/***/ "node:util":
/*!****************************!*\
  !*** external "node:util" ***!
  \****************************/
/***/ ((module) => {

module.exports = require("node:util");

/***/ }),

/***/ "node:zlib":
/*!****************************!*\
  !*** external "node:zlib" ***!
  \****************************/
/***/ ((module) => {

module.exports = require("node:zlib");

/***/ }),

/***/ "worker_threads":
/*!*********************************!*\
  !*** external "worker_threads" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("worker_threads");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fpayments%2Fpaypal%2Finitialize%2Froute&page=%2Fapi%2Fpayments%2Fpaypal%2Finitialize%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fpayments%2Fpaypal%2Finitialize%2Froute.js&appDir=C%3A%5CUsers%5CD%5CDownloads%5CDimplesluxe%5Cproject%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CD%5CDownloads%5CDimplesluxe%5Cproject&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fpayments%2Fpaypal%2Finitialize%2Froute&page=%2Fapi%2Fpayments%2Fpaypal%2Finitialize%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fpayments%2Fpaypal%2Finitialize%2Froute.js&appDir=C%3A%5CUsers%5CD%5CDownloads%5CDimplesluxe%5Cproject%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CD%5CDownloads%5CDimplesluxe%5Cproject&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   headerHooks: () => (/* binding */ headerHooks),\n/* harmony export */   originalPathname: () => (/* binding */ originalPathname),\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   requestAsyncStorage: () => (/* binding */ requestAsyncStorage),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   staticGenerationAsyncStorage: () => (/* binding */ staticGenerationAsyncStorage),\n/* harmony export */   staticGenerationBailout: () => (/* binding */ staticGenerationBailout)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/future/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/future/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/future/route-kind */ \"(rsc)/./node_modules/next/dist/server/future/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var C_Users_D_Downloads_Dimplesluxe_project_app_api_payments_paypal_initialize_route_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/payments/paypal/initialize/route.js */ \"(rsc)/./app/api/payments/paypal/initialize/route.js\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/payments/paypal/initialize/route\",\n        pathname: \"/api/payments/paypal/initialize\",\n        filename: \"route\",\n        bundlePath: \"app/api/payments/paypal/initialize/route\"\n    },\n    resolvedPagePath: \"C:\\\\Users\\\\D\\\\Downloads\\\\Dimplesluxe\\\\project\\\\app\\\\api\\\\payments\\\\paypal\\\\initialize\\\\route.js\",\n    nextConfigOutput,\n    userland: C_Users_D_Downloads_Dimplesluxe_project_app_api_payments_paypal_initialize_route_js__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { requestAsyncStorage, staticGenerationAsyncStorage, serverHooks, headerHooks, staticGenerationBailout } = routeModule;\nconst originalPathname = \"/api/payments/paypal/initialize/route\";\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        serverHooks,\n        staticGenerationAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIuanM/bmFtZT1hcHAlMkZhcGklMkZwYXltZW50cyUyRnBheXBhbCUyRmluaXRpYWxpemUlMkZyb3V0ZSZwYWdlPSUyRmFwaSUyRnBheW1lbnRzJTJGcGF5cGFsJTJGaW5pdGlhbGl6ZSUyRnJvdXRlJmFwcFBhdGhzPSZwYWdlUGF0aD1wcml2YXRlLW5leHQtYXBwLWRpciUyRmFwaSUyRnBheW1lbnRzJTJGcGF5cGFsJTJGaW5pdGlhbGl6ZSUyRnJvdXRlLmpzJmFwcERpcj1DJTNBJTVDVXNlcnMlNUNEJTVDRG93bmxvYWRzJTVDRGltcGxlc2x1eGUlNUNwcm9qZWN0JTVDYXBwJnBhZ2VFeHRlbnNpb25zPXRzeCZwYWdlRXh0ZW5zaW9ucz10cyZwYWdlRXh0ZW5zaW9ucz1qc3gmcGFnZUV4dGVuc2lvbnM9anMmcm9vdERpcj1DJTNBJTVDVXNlcnMlNUNEJTVDRG93bmxvYWRzJTVDRGltcGxlc2x1eGUlNUNwcm9qZWN0JmlzRGV2PXRydWUmdHNjb25maWdQYXRoPXRzY29uZmlnLmpzb24mYmFzZVBhdGg9JmFzc2V0UHJlZml4PSZuZXh0Q29uZmlnT3V0cHV0PSZwcmVmZXJyZWRSZWdpb249Jm1pZGRsZXdhcmVDb25maWc9ZTMwJTNEISIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7OztBQUFzRztBQUN2QztBQUNjO0FBQytDO0FBQzVIO0FBQ0E7QUFDQTtBQUNBLHdCQUF3QixnSEFBbUI7QUFDM0M7QUFDQSxjQUFjLHlFQUFTO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxZQUFZO0FBQ1osQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBLFFBQVEsdUdBQXVHO0FBQy9HO0FBQ0E7QUFDQSxXQUFXLDRFQUFXO0FBQ3RCO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDNko7O0FBRTdKIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZGltcGxlc2x1eGUtZWNvbW1lcmNlLz85NmU3Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFwcFJvdXRlUm91dGVNb2R1bGUgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9mdXR1cmUvcm91dGUtbW9kdWxlcy9hcHAtcm91dGUvbW9kdWxlLmNvbXBpbGVkXCI7XG5pbXBvcnQgeyBSb3V0ZUtpbmQgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9mdXR1cmUvcm91dGUta2luZFwiO1xuaW1wb3J0IHsgcGF0Y2hGZXRjaCBhcyBfcGF0Y2hGZXRjaCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2xpYi9wYXRjaC1mZXRjaFwiO1xuaW1wb3J0ICogYXMgdXNlcmxhbmQgZnJvbSBcIkM6XFxcXFVzZXJzXFxcXERcXFxcRG93bmxvYWRzXFxcXERpbXBsZXNsdXhlXFxcXHByb2plY3RcXFxcYXBwXFxcXGFwaVxcXFxwYXltZW50c1xcXFxwYXlwYWxcXFxcaW5pdGlhbGl6ZVxcXFxyb3V0ZS5qc1wiO1xuLy8gV2UgaW5qZWN0IHRoZSBuZXh0Q29uZmlnT3V0cHV0IGhlcmUgc28gdGhhdCB3ZSBjYW4gdXNlIHRoZW0gaW4gdGhlIHJvdXRlXG4vLyBtb2R1bGUuXG5jb25zdCBuZXh0Q29uZmlnT3V0cHV0ID0gXCJcIlxuY29uc3Qgcm91dGVNb2R1bGUgPSBuZXcgQXBwUm91dGVSb3V0ZU1vZHVsZSh7XG4gICAgZGVmaW5pdGlvbjoge1xuICAgICAgICBraW5kOiBSb3V0ZUtpbmQuQVBQX1JPVVRFLFxuICAgICAgICBwYWdlOiBcIi9hcGkvcGF5bWVudHMvcGF5cGFsL2luaXRpYWxpemUvcm91dGVcIixcbiAgICAgICAgcGF0aG5hbWU6IFwiL2FwaS9wYXltZW50cy9wYXlwYWwvaW5pdGlhbGl6ZVwiLFxuICAgICAgICBmaWxlbmFtZTogXCJyb3V0ZVwiLFxuICAgICAgICBidW5kbGVQYXRoOiBcImFwcC9hcGkvcGF5bWVudHMvcGF5cGFsL2luaXRpYWxpemUvcm91dGVcIlxuICAgIH0sXG4gICAgcmVzb2x2ZWRQYWdlUGF0aDogXCJDOlxcXFxVc2Vyc1xcXFxEXFxcXERvd25sb2Fkc1xcXFxEaW1wbGVzbHV4ZVxcXFxwcm9qZWN0XFxcXGFwcFxcXFxhcGlcXFxccGF5bWVudHNcXFxccGF5cGFsXFxcXGluaXRpYWxpemVcXFxccm91dGUuanNcIixcbiAgICBuZXh0Q29uZmlnT3V0cHV0LFxuICAgIHVzZXJsYW5kXG59KTtcbi8vIFB1bGwgb3V0IHRoZSBleHBvcnRzIHRoYXQgd2UgbmVlZCB0byBleHBvc2UgZnJvbSB0aGUgbW9kdWxlLiBUaGlzIHNob3VsZFxuLy8gYmUgZWxpbWluYXRlZCB3aGVuIHdlJ3ZlIG1vdmVkIHRoZSBvdGhlciByb3V0ZXMgdG8gdGhlIG5ldyBmb3JtYXQuIFRoZXNlXG4vLyBhcmUgdXNlZCB0byBob29rIGludG8gdGhlIHJvdXRlLlxuY29uc3QgeyByZXF1ZXN0QXN5bmNTdG9yYWdlLCBzdGF0aWNHZW5lcmF0aW9uQXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcywgaGVhZGVySG9va3MsIHN0YXRpY0dlbmVyYXRpb25CYWlsb3V0IH0gPSByb3V0ZU1vZHVsZTtcbmNvbnN0IG9yaWdpbmFsUGF0aG5hbWUgPSBcIi9hcGkvcGF5bWVudHMvcGF5cGFsL2luaXRpYWxpemUvcm91dGVcIjtcbmZ1bmN0aW9uIHBhdGNoRmV0Y2goKSB7XG4gICAgcmV0dXJuIF9wYXRjaEZldGNoKHtcbiAgICAgICAgc2VydmVySG9va3MsXG4gICAgICAgIHN0YXRpY0dlbmVyYXRpb25Bc3luY1N0b3JhZ2VcbiAgICB9KTtcbn1cbmV4cG9ydCB7IHJvdXRlTW9kdWxlLCByZXF1ZXN0QXN5bmNTdG9yYWdlLCBzdGF0aWNHZW5lcmF0aW9uQXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcywgaGVhZGVySG9va3MsIHN0YXRpY0dlbmVyYXRpb25CYWlsb3V0LCBvcmlnaW5hbFBhdGhuYW1lLCBwYXRjaEZldGNoLCAgfTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YXBwLXJvdXRlLmpzLm1hcCJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fpayments%2Fpaypal%2Finitialize%2Froute&page=%2Fapi%2Fpayments%2Fpaypal%2Finitialize%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fpayments%2Fpaypal%2Finitialize%2Froute.js&appDir=C%3A%5CUsers%5CD%5CDownloads%5CDimplesluxe%5Cproject%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CD%5CDownloads%5CDimplesluxe%5Cproject&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./app/api/payments/paypal/initialize/route.js":
/*!*****************************************************!*\
  !*** ./app/api/payments/paypal/initialize/route.js ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   POST: () => (/* binding */ POST)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/web/exports/next-response */ \"(rsc)/./node_modules/next/dist/server/web/exports/next-response.js\");\n/* harmony import */ var node_fetch__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! node-fetch */ \"(rsc)/./node_modules/node-fetch/src/index.js\");\n\n\nconst PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;\nconst PAYPAL_SECRET = process.env.PAYPAL_SECRET;\nconst PAYPAL_API = \"https://api-m.sandbox.paypal.com\"; // Change to 'https://api-m.paypal.com' for production\nasync function getAccessToken() {\n    if (!PAYPAL_CLIENT_ID || !PAYPAL_SECRET) {\n        throw new Error(\"Missing PayPal credentials: PAYPAL_CLIENT_ID or PAYPAL_SECRET not set\");\n    }\n    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString(\"base64\");\n    const response = await (0,node_fetch__WEBPACK_IMPORTED_MODULE_1__[\"default\"])(`${PAYPAL_API}/v1/oauth2/token`, {\n        method: \"POST\",\n        headers: {\n            Authorization: `Basic ${auth}`,\n            \"Content-Type\": \"application/x-www-form-urlencoded\"\n        },\n        body: \"grant_type=client_credentials\"\n    });\n    const data = await response.json();\n    if (!response.ok) {\n        throw new Error(data.error?.description || \"Failed to get PayPal access token\");\n    }\n    return data.access_token;\n}\nasync function POST(req) {\n    try {\n        const body = await req.json();\n        console.log(\"Initialize request body:\", body); // Debug log\n        const { amount, currency, orderId, orderNumber, email, items, shipping } = body;\n        // Validate input\n        if (!amount || !currency || !orderId || !orderNumber || !email || !items) {\n            return next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__[\"default\"].json({\n                status: false,\n                message: \"Missing required fields in request body\"\n            }, {\n                status: 400\n            });\n        }\n        const accessToken = await getAccessToken();\n        const orderData = {\n            intent: \"CAPTURE\",\n            purchase_units: [\n                {\n                    reference_id: orderNumber,\n                    amount: {\n                        currency_code: currency,\n                        value: amount,\n                        breakdown: {\n                            item_total: {\n                                currency_code: currency,\n                                value: (parseFloat(amount) - parseFloat(shipping)).toFixed(2)\n                            },\n                            shipping: {\n                                currency_code: currency,\n                                value: shipping\n                            }\n                        }\n                    },\n                    items: items.map((item)=>({\n                            name: item.name || \"Unknown Item\",\n                            description: item.description || \"\",\n                            unit_amount: {\n                                currency_code: currency,\n                                value: parseFloat(item.price).toFixed(2)\n                            },\n                            quantity: item.quantity.toString()\n                        }))\n                }\n            ],\n            payer: {\n                email_address: email\n            },\n            application_context: {\n                return_url: `http://localhost:3000/order-confirmation/${orderNumber}?cancelled=false`,\n                cancel_url: `http://localhost:3000/order-confirmation/${orderNumber}?cancelled=true`\n            }\n        };\n        console.log(\"Creating PayPal order with data:\", orderData); // Debug log\n        const response = await (0,node_fetch__WEBPACK_IMPORTED_MODULE_1__[\"default\"])(`${PAYPAL_API}/v2/checkout/orders`, {\n            method: \"POST\",\n            headers: {\n                \"Content-Type\": \"application/json\",\n                Authorization: `Bearer ${accessToken}`\n            },\n            body: JSON.stringify(orderData)\n        });\n        const data = await response.json();\n        console.log(\"PayPal API response:\", data); // Debug log\n        if (!response.ok) {\n            return next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__[\"default\"].json({\n                status: false,\n                message: data.error?.message || \"Failed to create PayPal order\"\n            }, {\n                status: 500\n            });\n        }\n        const approveUrl = data.links.find((link)=>link.rel === \"approve\")?.href;\n        if (!approveUrl) {\n            return next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__[\"default\"].json({\n                status: false,\n                message: \"No approval URL returned from PayPal\"\n            }, {\n                status: 500\n            });\n        }\n        return next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__[\"default\"].json({\n            status: true,\n            approve_url: approveUrl\n        });\n    } catch (error) {\n        console.error(\"PayPal initialize error:\", error.message);\n        return next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__[\"default\"].json({\n            status: false,\n            message: error.message || \"Internal server error\"\n        }, {\n            status: 500\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL3BheW1lbnRzL3BheXBhbC9pbml0aWFsaXplL3JvdXRlLmpzIiwibWFwcGluZ3MiOiI7Ozs7OztBQUEyQztBQUNaO0FBRS9CLE1BQU1FLG1CQUFtQkMsUUFBUUMsR0FBRyxDQUFDRixnQkFBZ0I7QUFDckQsTUFBTUcsZ0JBQWdCRixRQUFRQyxHQUFHLENBQUNDLGFBQWE7QUFDL0MsTUFBTUMsYUFBYSxvQ0FBb0Msc0RBQXNEO0FBRTdHLGVBQWVDO0lBQ2IsSUFBSSxDQUFDTCxvQkFBb0IsQ0FBQ0csZUFBZTtRQUN2QyxNQUFNLElBQUlHLE1BQ1I7SUFFSjtJQUVBLE1BQU1DLE9BQU9DLE9BQU9DLElBQUksQ0FBQyxDQUFDLEVBQUVULGlCQUFpQixDQUFDLEVBQUVHLGNBQWMsQ0FBQyxFQUFFTyxRQUFRLENBQ3ZFO0lBRUYsTUFBTUMsV0FBVyxNQUFNWixzREFBS0EsQ0FBQyxDQUFDLEVBQUVLLFdBQVcsZ0JBQWdCLENBQUMsRUFBRTtRQUM1RFEsUUFBUTtRQUNSQyxTQUFTO1lBQ1BDLGVBQWUsQ0FBQyxNQUFNLEVBQUVQLEtBQUssQ0FBQztZQUM5QixnQkFBZ0I7UUFDbEI7UUFDQVEsTUFBTTtJQUNSO0lBRUEsTUFBTUMsT0FBTyxNQUFNTCxTQUFTTSxJQUFJO0lBQ2hDLElBQUksQ0FBQ04sU0FBU08sRUFBRSxFQUFFO1FBQ2hCLE1BQU0sSUFBSVosTUFDUlUsS0FBS0csS0FBSyxFQUFFQyxlQUFlO0lBRS9CO0lBQ0EsT0FBT0osS0FBS0ssWUFBWTtBQUMxQjtBQUVPLGVBQWVDLEtBQUtDLEdBQUc7SUFDNUIsSUFBSTtRQUNGLE1BQU1SLE9BQU8sTUFBTVEsSUFBSU4sSUFBSTtRQUMzQk8sUUFBUUMsR0FBRyxDQUFDLDRCQUE0QlYsT0FBTyxZQUFZO1FBQzNELE1BQU0sRUFBRVcsTUFBTSxFQUFFQyxRQUFRLEVBQUVDLE9BQU8sRUFBRUMsV0FBVyxFQUFFQyxLQUFLLEVBQUVDLEtBQUssRUFBRUMsUUFBUSxFQUFFLEdBQ3RFakI7UUFF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b21tZXJjZS8uL2FwcC9hcGkvcGF5bWVudHMvcGF5cGFsL2luaXRpYWxpemUvcm91dGUuanM/YTNjZiJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBOZXh0UmVzcG9uc2UgfSBmcm9tIFwibmV4dC9zZXJ2ZXJcIjtcclxuaW1wb3J0IGZldGNoIGZyb20gXCJub2RlLWZldGNoXCI7XHJcblxyXG5jb25zdCBQQVlQQUxfQ0xJRU5UX0lEID0gcHJvY2Vzcy5lbnYuUEFZUEFMX0NMSUVOVF9JRDtcclxuY29uc3QgUEFZUEFMX1NFQ1JFVCA9IHByb2Nlc3MuZW52LlBBWVBBTF9TRUNSRVQ7XHJcbmNvbnN0IFBBWVBBTF9BUEkgPSBcImh0dHBzOi8vYXBpLW0uc2FuZGJveC5wYXlwYWwuY29tXCI7IC8vIENoYW5nZSB0byAnaHR0cHM6Ly9hcGktbS5wYXlwYWwuY29tJyBmb3IgcHJvZHVjdGlvblxyXG5cclxuYXN5bmMgZnVuY3Rpb24gZ2V0QWNjZXNzVG9rZW4oKSB7XHJcbiAgaWYgKCFQQVlQQUxfQ0xJRU5UX0lEIHx8ICFQQVlQQUxfU0VDUkVUKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoXHJcbiAgICAgIFwiTWlzc2luZyBQYXlQYWwgY3JlZGVudGlhbHM6IFBBWVBBTF9DTElFTlRfSUQgb3IgUEFZUEFMX1NFQ1JFVCBub3Qgc2V0XCJcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICBjb25zdCBhdXRoID0gQnVmZmVyLmZyb20oYCR7UEFZUEFMX0NMSUVOVF9JRH06JHtQQVlQQUxfU0VDUkVUfWApLnRvU3RyaW5nKFxyXG4gICAgXCJiYXNlNjRcIlxyXG4gICk7XHJcbiAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChgJHtQQVlQQUxfQVBJfS92MS9vYXV0aDIvdG9rZW5gLCB7XHJcbiAgICBtZXRob2Q6IFwiUE9TVFwiLFxyXG4gICAgaGVhZGVyczoge1xyXG4gICAgICBBdXRob3JpemF0aW9uOiBgQmFzaWMgJHthdXRofWAsXHJcbiAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkXCIsXHJcbiAgICB9LFxyXG4gICAgYm9keTogXCJncmFudF90eXBlPWNsaWVudF9jcmVkZW50aWFsc1wiLFxyXG4gIH0pO1xyXG5cclxuICBjb25zdCBkYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xyXG4gIGlmICghcmVzcG9uc2Uub2spIHtcclxuICAgIHRocm93IG5ldyBFcnJvcihcclxuICAgICAgZGF0YS5lcnJvcj8uZGVzY3JpcHRpb24gfHwgXCJGYWlsZWQgdG8gZ2V0IFBheVBhbCBhY2Nlc3MgdG9rZW5cIlxyXG4gICAgKTtcclxuICB9XHJcbiAgcmV0dXJuIGRhdGEuYWNjZXNzX3Rva2VuO1xyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gUE9TVChyZXEpIHtcclxuICB0cnkge1xyXG4gICAgY29uc3QgYm9keSA9IGF3YWl0IHJlcS5qc29uKCk7XHJcbiAgICBjb25zb2xlLmxvZyhcIkluaXRpYWxpemUgcmVxdWVzdCBib2R5OlwiLCBib2R5KTsgLy8gRGVidWcgbG9nXHJcbiAgICBjb25zdCB7IGFtb3VudCwgY3VycmVuY3ksIG9yZGVySWQsIG9yZGVyTnVtYmVyLCBlbWFpbCwgaXRlbXMsIHNoaXBwaW5nIH0gPVxyXG4gICAgICBib2R5O1xyXG5cclxuICAgIC8vIFZhbGlkYXRlIGlucHV0XHJcbiAgICBpZiAoIWFtb3VudCB8fCAhY3VycmVuY3kgfHwgIW9yZGVySWQgfHwgIW9yZGVyTnVtYmVyIHx8ICFlbWFpbCB8fCAhaXRlbXMpIHtcclxuICAgICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKFxyXG4gICAgICAgIHsgc3RhdHVzOiBmYWxzZSwgbWVzc2FnZTogXCJNaXNzaW5nIHJlcXVpcmVkIGZpZWxkcyBpbiByZXF1ZXN0IGJvZHlcIiB9LFxyXG4gICAgICAgIHsgc3RhdHVzOiA0MDAgfVxyXG4gICAgICApO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGFjY2Vzc1Rva2VuID0gYXdhaXQgZ2V0QWNjZXNzVG9rZW4oKTtcclxuXHJcbiAgICBjb25zdCBvcmRlckRhdGEgPSB7XHJcbiAgICAgIGludGVudDogXCJDQVBUVVJFXCIsXHJcbiAgICAgIHB1cmNoYXNlX3VuaXRzOiBbXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgcmVmZXJlbmNlX2lkOiBvcmRlck51bWJlcixcclxuICAgICAgICAgIGFtb3VudDoge1xyXG4gICAgICAgICAgICBjdXJyZW5jeV9jb2RlOiBjdXJyZW5jeSxcclxuICAgICAgICAgICAgdmFsdWU6IGFtb3VudCxcclxuICAgICAgICAgICAgYnJlYWtkb3duOiB7XHJcbiAgICAgICAgICAgICAgaXRlbV90b3RhbDoge1xyXG4gICAgICAgICAgICAgICAgY3VycmVuY3lfY29kZTogY3VycmVuY3ksXHJcbiAgICAgICAgICAgICAgICB2YWx1ZTogKHBhcnNlRmxvYXQoYW1vdW50KSAtIHBhcnNlRmxvYXQoc2hpcHBpbmcpKS50b0ZpeGVkKDIpLFxyXG4gICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgc2hpcHBpbmc6IHtcclxuICAgICAgICAgICAgICAgIGN1cnJlbmN5X2NvZGU6IGN1cnJlbmN5LFxyXG4gICAgICAgICAgICAgICAgdmFsdWU6IHNoaXBwaW5nLFxyXG4gICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgaXRlbXM6IGl0ZW1zLm1hcCgoaXRlbSkgPT4gKHtcclxuICAgICAgICAgICAgbmFtZTogaXRlbS5uYW1lIHx8IFwiVW5rbm93biBJdGVtXCIsXHJcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBpdGVtLmRlc2NyaXB0aW9uIHx8IFwiXCIsXHJcbiAgICAgICAgICAgIHVuaXRfYW1vdW50OiB7XHJcbiAgICAgICAgICAgICAgY3VycmVuY3lfY29kZTogY3VycmVuY3ksXHJcbiAgICAgICAgICAgICAgdmFsdWU6IHBhcnNlRmxvYXQoaXRlbS5wcmljZSkudG9GaXhlZCgyKSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgcXVhbnRpdHk6IGl0ZW0ucXVhbnRpdHkudG9TdHJpbmcoKSxcclxuICAgICAgICAgIH0pKSxcclxuICAgICAgICB9LFxyXG4gICAgICBdLFxyXG4gICAgICBwYXllcjoge1xyXG4gICAgICAgIGVtYWlsX2FkZHJlc3M6IGVtYWlsLFxyXG4gICAgICB9LFxyXG4gICAgICBhcHBsaWNhdGlvbl9jb250ZXh0OiB7XHJcbiAgICAgICAgcmV0dXJuX3VybDogYGh0dHA6Ly9sb2NhbGhvc3Q6MzAwMC9vcmRlci1jb25maXJtYXRpb24vJHtvcmRlck51bWJlcn0/Y2FuY2VsbGVkPWZhbHNlYCxcclxuICAgICAgICBjYW5jZWxfdXJsOiBgaHR0cDovL2xvY2FsaG9zdDozMDAwL29yZGVyLWNvbmZpcm1hdGlvbi8ke29yZGVyTnVtYmVyfT9jYW5jZWxsZWQ9dHJ1ZWAsXHJcbiAgICAgIH0sXHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnNvbGUubG9nKFwiQ3JlYXRpbmcgUGF5UGFsIG9yZGVyIHdpdGggZGF0YTpcIiwgb3JkZXJEYXRhKTsgLy8gRGVidWcgbG9nXHJcblxyXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChgJHtQQVlQQUxfQVBJfS92Mi9jaGVja291dC9vcmRlcnNgLCB7XHJcbiAgICAgIG1ldGhvZDogXCJQT1NUXCIsXHJcbiAgICAgIGhlYWRlcnM6IHtcclxuICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcclxuICAgICAgICBBdXRob3JpemF0aW9uOiBgQmVhcmVyICR7YWNjZXNzVG9rZW59YCxcclxuICAgICAgfSxcclxuICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkob3JkZXJEYXRhKSxcclxuICAgIH0pO1xyXG5cclxuICAgIGNvbnN0IGRhdGEgPSBhd2FpdCByZXNwb25zZS5qc29uKCk7XHJcbiAgICBjb25zb2xlLmxvZyhcIlBheVBhbCBBUEkgcmVzcG9uc2U6XCIsIGRhdGEpOyAvLyBEZWJ1ZyBsb2dcclxuXHJcbiAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XHJcbiAgICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbihcclxuICAgICAgICB7XHJcbiAgICAgICAgICBzdGF0dXM6IGZhbHNlLFxyXG4gICAgICAgICAgbWVzc2FnZTogZGF0YS5lcnJvcj8ubWVzc2FnZSB8fCBcIkZhaWxlZCB0byBjcmVhdGUgUGF5UGFsIG9yZGVyXCIsXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7IHN0YXR1czogNTAwIH1cclxuICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBhcHByb3ZlVXJsID0gZGF0YS5saW5rcy5maW5kKChsaW5rKSA9PiBsaW5rLnJlbCA9PT0gXCJhcHByb3ZlXCIpPy5ocmVmO1xyXG4gICAgaWYgKCFhcHByb3ZlVXJsKSB7XHJcbiAgICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbihcclxuICAgICAgICB7IHN0YXR1czogZmFsc2UsIG1lc3NhZ2U6IFwiTm8gYXBwcm92YWwgVVJMIHJldHVybmVkIGZyb20gUGF5UGFsXCIgfSxcclxuICAgICAgICB7IHN0YXR1czogNTAwIH1cclxuICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oeyBzdGF0dXM6IHRydWUsIGFwcHJvdmVfdXJsOiBhcHByb3ZlVXJsIH0pO1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKFwiUGF5UGFsIGluaXRpYWxpemUgZXJyb3I6XCIsIGVycm9yLm1lc3NhZ2UpO1xyXG4gICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKFxyXG4gICAgICB7IHN0YXR1czogZmFsc2UsIG1lc3NhZ2U6IGVycm9yLm1lc3NhZ2UgfHwgXCJJbnRlcm5hbCBzZXJ2ZXIgZXJyb3JcIiB9LFxyXG4gICAgICB7IHN0YXR1czogNTAwIH1cclxuICAgICk7XHJcbiAgfVxyXG59XHJcbiJdLCJuYW1lcyI6WyJOZXh0UmVzcG9uc2UiLCJmZXRjaCIsIlBBWVBBTF9DTElFTlRfSUQiLCJwcm9jZXNzIiwiZW52IiwiUEFZUEFMX1NFQ1JFVCIsIlBBWVBBTF9BUEkiLCJnZXRBY2Nlc3NUb2tlbiIsIkVycm9yIiwiYXV0aCIsIkJ1ZmZlciIsImZyb20iLCJ0b1N0cmluZyIsInJlc3BvbnNlIiwibWV0aG9kIiwiaGVhZGVycyIsIkF1dGhvcml6YXRpb24iLCJib2R5IiwiZGF0YSIsImpzb24iLCJvayIsImVycm9yIiwiZGVzY3JpcHRpb24iLCJhY2Nlc3NfdG9rZW4iLCJQT1NUIiwicmVxIiwiY29uc29sZSIsImxvZyIsImFtb3VudCIsImN1cnJlbmN5Iiwib3JkZXJJZCIsIm9yZGVyTnVtYmVyIiwiZW1haWwiLCJpdGVtcyIsInNoaXBwaW5nIiwic3RhdHVzIiwibWVzc2FnZSIsImFjY2Vzc1Rva2VuIiwib3JkZXJEYXRhIiwiaW50ZW50IiwicHVyY2hhc2VfdW5pdHMiLCJyZWZlcmVuY2VfaWQiLCJjdXJyZW5jeV9jb2RlIiwidmFsdWUiLCJicmVha2Rvd24iLCJpdGVtX3RvdGFsIiwicGFyc2VGbG9hdCIsInRvRml4ZWQiLCJtYXAiLCJpdGVtIiwibmFtZSIsInVuaXRfYW1vdW50IiwicHJpY2UiLCJxdWFudGl0eSIsInBheWVyIiwiZW1haWxfYWRkcmVzcyIsImFwcGxpY2F0aW9uX2NvbnRleHQiLCJyZXR1cm5fdXJsIiwiY2FuY2VsX3VybCIsIkpTT04iLCJzdHJpbmdpZnkiLCJhcHByb3ZlVXJsIiwibGlua3MiLCJmaW5kIiwibGluayIsInJlbCIsImhyZWYiLCJhcHByb3ZlX3VybCJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./app/api/payments/paypal/initialize/route.js\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/node-fetch","vendor-chunks/fetch-blob","vendor-chunks/formdata-polyfill","vendor-chunks/data-uri-to-buffer","vendor-chunks/web-streams-polyfill","vendor-chunks/node-domexception"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fpayments%2Fpaypal%2Finitialize%2Froute&page=%2Fapi%2Fpayments%2Fpaypal%2Finitialize%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fpayments%2Fpaypal%2Finitialize%2Froute.js&appDir=C%3A%5CUsers%5CD%5CDownloads%5CDimplesluxe%5Cproject%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CD%5CDownloads%5CDimplesluxe%5Cproject&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();