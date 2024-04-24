(() => {
  var e = {
      515: (e, r, t) => {
        "use strict";
        t.d(r, { Z: () => s });
        var n = t(261);
        "undefined" != typeof window &&
          window.addEventListener(
            "message",
            (e) => {
              "https://extensionpay.com" === e.origin &&
                e.source == window &&
                (("fetch-user" !== e.data && "trial-start" !== e.data) ||
                  n.runtime.sendMessage(e.data));
            },
            !1
          );
        const s = function (e) {
          const r = "https://extensionpay.com",
            t = `${r}/extension/${e}`;
          function s(e) {
            return new Promise((r) => setTimeout(r, e));
          }
          async function a(e) {
            try {
              return await n.storage.sync.get(e);
            } catch (r) {
              return await n.storage.local.get(e);
            }
          }
          async function i(e) {
            try {
              return await n.storage.sync.set(e);
            } catch (r) {
              return await n.storage.local.set(e);
            }
          }
          n.management &&
            n.management.getSelf().then(async (e) => {
              if (!e.permissions.includes("storage")) {
                var r = e.hostPermissions.concat(e.permissions);
                throw `ExtPay Setup Error: please include the "storage" permission in manifest.json["permissions"] or else ExtensionPay won't work correctly.\n\nYou can copy and paste this to your manifest.json file to fix this error:\n\n"permissions": [\n    ${r
                  .map((e) => `"    ${e}"`)
                  .join(",\n")}${r.length > 0 ? "," : ""}\n    "storage"\n]\n`;
              }
            }),
            a(["extensionpay_installed_at", "extensionpay_user"]).then(
              async (e) => {
                if (e.extensionpay_installed_at) return;
                const r = e.extensionpay_user,
                  t = r ? r.installedAt : new Date().toISOString();
                await i({ extensionpay_installed_at: t });
              }
            );
          const o = [],
            g = [];
          async function m() {
            var e,
              s = {};
            if (n.management) e = await n.management.getSelf();
            else {
              if (!n.runtime)
                throw "ExtPay needs to be run in a browser extension context";
              if (!(e = await n.runtime.sendMessage("extpay-extinfo"))) {
                e = {
                  installType: !("update_url" in n.runtime.getManifest())
                    ? "development"
                    : "normal",
                };
              }
            }
            "development" == e.installType && (s.development = !0);
            const a = await fetch(`${t}/api/new-key`, {
              method: "POST",
              headers: {
                Accept: "application/json",
                "Content-type": "application/json",
              },
              body: JSON.stringify(s),
            });
            if (!a.ok) throw (a.status, `${r}/home`);
            const o = await a.json();
            return await i({ extensionpay_api_key: o }), o;
          }
          async function l() {
            const e = await a(["extensionpay_api_key"]);
            return e.extensionpay_api_key ? e.extensionpay_api_key : null;
          }
          const c = /^\d\d\d\d-\d\d-\d\dT/;
          async function A() {
            var e = await a(["extensionpay_user", "extensionpay_installed_at"]);
            const r = await l();
            if (!r)
              return {
                paid: !1,
                paidAt: null,
                installedAt: e.extensionpay_installed_at
                  ? new Date(e.extensionpay_installed_at)
                  : new Date(),
                trialStartedAt: null,
              };
            const n = await fetch(`${t}/api/user?api_key=${r}`, {
              method: "GET",
              headers: { Accept: "application/json" },
            });
            if (!n.ok)
              throw "ExtPay error while fetching user: " + (await n.text());
            const s = await n.json(),
              m = {};
            for (var [A, u] of Object.entries(s))
              u && u.match && u.match(c) && (u = new Date(u)), (m[A] = u);
            return (
              (m.installedAt = new Date(e.extensionpay_installed_at)),
              m.paidAt &&
                (!e.extensionpay_user ||
                  (e.extensionpay_user && !e.extensionpay_user.paidAt)) &&
                o.forEach((e) => e(m)),
              m.trialStartedAt &&
                (!e.extensionpay_user ||
                  (e.extensionpay_user &&
                    !e.extensionpay_user.trialStartedAt)) &&
                g.forEach((e) => e(m)),
              await i({ extensionpay_user: s }),
              m
            );
          }
          async function u(e, r, t) {
            if (n.windows && n.windows.create) {
              const s = await n.windows.getCurrent(),
                a = Math.round(0.5 * (s.width - r) + s.left),
                i = Math.round(0.5 * (s.height - t) + s.top);
              try {
                n.windows.create({
                  url: e,
                  type: "popup",
                  focused: !0,
                  width: r,
                  height: t,
                  left: a,
                  top: i,
                });
              } catch (s) {
                n.windows.create({
                  url: e,
                  type: "popup",
                  width: r,
                  height: t,
                  left: a,
                  top: i,
                });
              }
            } else
              window.open(
                e,
                null,
                `toolbar=no,location=no,directories=no,status=no,menubar=no,width=${r},height=${t},left=450`
              );
          }
          var x = !1;
          return {
            getUser: function () {
              return A();
            },
            onPaid: {
              addListener: function (e) {
                const t = `"content_scripts": [\n                {\n            "matches": ["${r}/*"],\n            "js": ["ExtPay.js"],\n            "run_at": "document_start"\n        }]`,
                  s = n.runtime.getManifest();
                if (!s.content_scripts)
                  throw `ExtPay setup error: To use the onPaid callback handler, please include ExtPay as a content script in your manifest.json. You can copy the example below into your manifest.json or check the docs: https://github.com/Glench/ExtPay#2-configure-your-manifestjson\n\n        ${t}`;
                const a = s.content_scripts.find((e) =>
                  e.matches.includes(r.replace(":3000", "") + "/*")
                );
                if (!a)
                  throw `ExtPay setup error: To use the onPaid callback handler, please include ExtPay as a content script in your manifest.json matching "${r}/*". You can copy the example below into your manifest.json or check the docs: https://github.com/Glench/ExtPay#2-configure-your-manifestjson\n\n        ${t}`;
                if (!a.run_at || "document_start" !== a.run_at)
                  throw `ExtPay setup error: To use the onPaid callback handler, please make sure the ExtPay content script in your manifest.json runs at document start. You can copy the example below into your manifest.json or check the docs: https://github.com/Glench/ExtPay#2-configure-your-manifestjson\n\n        ${t}`;
                o.push(e);
              },
            },
            openPaymentPage: async function () {
              u(
                await (async function () {
                  var e = await l();
                  return e || (e = await m()), `${t}?api_key=${e}`;
                })(),
                500,
                800
              );
            },
            openTrialPage: async function (e) {
              var r = await l();
              r || (r = await m());
              var n = `${t}/trial?api_key=${r}`;
              e && (n += `&period=${e}`), u(n, 500, 650);
            },
            openLoginPage: async function () {
              var e = await l();
              e || (e = await m()), u(`${t}/reactivate?api_key=${e}`, 500, 800);
            },
            onTrialStarted: {
              addListener: function (e) {
                g.push(e);
              },
            },
            startBackground: function () {
              n.runtime.onMessage.addListener(function (e, r, t) {
                if ("fetch-user" == e)
                  !(async function () {
                    if (!x) {
                      x = !0;
                      for (var e = await A(), r = 0; r < 120; ++r) {
                        if (e.paidAt) return (x = !1), e;
                        await s(1e3), (e = await A());
                      }
                      x = !1;
                    }
                  })();
                else if ("trial-start" == e) A();
                else if ("extpay-extinfo" == e && n.management)
                  return n.management.getSelf();
              });
            },
          };
        };
      },
      261: function (e, r) {
        var t, n, s;
        "undefined" != typeof globalThis
          ? globalThis
          : "undefined" != typeof self && self,
          (n = [e]),
          (t = function (e) {
            "use strict";
            if (
              "undefined" == typeof browser ||
              Object.getPrototypeOf(browser) !== Object.prototype
            ) {
              const r =
                  "The message port closed before a response was received.",
                t = (e) => {
                  const t = {
                    alarms: {
                      clear: { minArgs: 0, maxArgs: 1 },
                      clearAll: { minArgs: 0, maxArgs: 0 },
                      get: { minArgs: 0, maxArgs: 1 },
                      getAll: { minArgs: 0, maxArgs: 0 },
                    },
                    bookmarks: {
                      create: { minArgs: 1, maxArgs: 1 },
                      get: { minArgs: 1, maxArgs: 1 },
                      getChildren: { minArgs: 1, maxArgs: 1 },
                      getRecent: { minArgs: 1, maxArgs: 1 },
                      getSubTree: { minArgs: 1, maxArgs: 1 },
                      getTree: { minArgs: 0, maxArgs: 0 },
                      move: { minArgs: 2, maxArgs: 2 },
                      remove: { minArgs: 1, maxArgs: 1 },
                      removeTree: { minArgs: 1, maxArgs: 1 },
                      search: { minArgs: 1, maxArgs: 1 },
                      update: { minArgs: 2, maxArgs: 2 },
                    },
                    browserAction: {
                      disable: {
                        minArgs: 0,
                        maxArgs: 1,
                        fallbackToNoCallback: !0,
                      },
                      enable: {
                        minArgs: 0,
                        maxArgs: 1,
                        fallbackToNoCallback: !0,
                      },
                      getBadgeBackgroundColor: { minArgs: 1, maxArgs: 1 },
                      getBadgeText: { minArgs: 1, maxArgs: 1 },
                      getPopup: { minArgs: 1, maxArgs: 1 },
                      getTitle: { minArgs: 1, maxArgs: 1 },
                      openPopup: { minArgs: 0, maxArgs: 0 },
                      setBadgeBackgroundColor: {
                        minArgs: 1,
                        maxArgs: 1,
                        fallbackToNoCallback: !0,
                      },
                      setBadgeText: {
                        minArgs: 1,
                        maxArgs: 1,
                        fallbackToNoCallback: !0,
                      },
                      setIcon: { minArgs: 1, maxArgs: 1 },
                      setPopup: {
                        minArgs: 1,
                        maxArgs: 1,
                        fallbackToNoCallback: !0,
                      },
                      setTitle: {
                        minArgs: 1,
                        maxArgs: 1,
                        fallbackToNoCallback: !0,
                      },
                    },
                    browsingData: {
                      remove: { minArgs: 2, maxArgs: 2 },
                      removeCache: { minArgs: 1, maxArgs: 1 },
                      removeCookies: { minArgs: 1, maxArgs: 1 },
                      removeDownloads: { minArgs: 1, maxArgs: 1 },
                      removeFormData: { minArgs: 1, maxArgs: 1 },
                      removeHistory: { minArgs: 1, maxArgs: 1 },
                      removeLocalStorage: { minArgs: 1, maxArgs: 1 },
                      removePasswords: { minArgs: 1, maxArgs: 1 },
                      removePluginData: { minArgs: 1, maxArgs: 1 },
                      settings: { minArgs: 0, maxArgs: 0 },
                    },
                    commands: { getAll: { minArgs: 0, maxArgs: 0 } },
                    contextMenus: {
                      remove: { minArgs: 1, maxArgs: 1 },
                      removeAll: { minArgs: 0, maxArgs: 0 },
                      update: { minArgs: 2, maxArgs: 2 },
                    },
                    cookies: {
                      get: { minArgs: 1, maxArgs: 1 },
                      getAll: { minArgs: 1, maxArgs: 1 },
                      getAllCookieStores: { minArgs: 0, maxArgs: 0 },
                      remove: { minArgs: 1, maxArgs: 1 },
                      set: { minArgs: 1, maxArgs: 1 },
                    },
                    devtools: {
                      inspectedWindow: {
                        eval: { minArgs: 1, maxArgs: 2, singleCallbackArg: !1 },
                      },
                      panels: {
                        create: {
                          minArgs: 3,
                          maxArgs: 3,
                          singleCallbackArg: !0,
                        },
                        elements: {
                          createSidebarPane: { minArgs: 1, maxArgs: 1 },
                        },
                      },
                    },
                    downloads: {
                      cancel: { minArgs: 1, maxArgs: 1 },
                      download: { minArgs: 1, maxArgs: 1 },
                      erase: { minArgs: 1, maxArgs: 1 },
                      getFileIcon: { minArgs: 1, maxArgs: 2 },
                      open: {
                        minArgs: 1,
                        maxArgs: 1,
                        fallbackToNoCallback: !0,
                      },
                      pause: { minArgs: 1, maxArgs: 1 },
                      removeFile: { minArgs: 1, maxArgs: 1 },
                      resume: { minArgs: 1, maxArgs: 1 },
                      search: { minArgs: 1, maxArgs: 1 },
                      show: {
                        minArgs: 1,
                        maxArgs: 1,
                        fallbackToNoCallback: !0,
                      },
                    },
                    extension: {
                      isAllowedFileSchemeAccess: { minArgs: 0, maxArgs: 0 },
                      isAllowedIncognitoAccess: { minArgs: 0, maxArgs: 0 },
                    },
                    history: {
                      addUrl: { minArgs: 1, maxArgs: 1 },
                      deleteAll: { minArgs: 0, maxArgs: 0 },
                      deleteRange: { minArgs: 1, maxArgs: 1 },
                      deleteUrl: { minArgs: 1, maxArgs: 1 },
                      getVisits: { minArgs: 1, maxArgs: 1 },
                      search: { minArgs: 1, maxArgs: 1 },
                    },
                    i18n: {
                      detectLanguage: { minArgs: 1, maxArgs: 1 },
                      getAcceptLanguages: { minArgs: 0, maxArgs: 0 },
                    },
                    identity: { launchWebAuthFlow: { minArgs: 1, maxArgs: 1 } },
                    idle: { queryState: { minArgs: 1, maxArgs: 1 } },
                    management: {
                      get: { minArgs: 1, maxArgs: 1 },
                      getAll: { minArgs: 0, maxArgs: 0 },
                      getSelf: { minArgs: 0, maxArgs: 0 },
                      setEnabled: { minArgs: 2, maxArgs: 2 },
                      uninstallSelf: { minArgs: 0, maxArgs: 1 },
                    },
                    notifications: {
                      clear: { minArgs: 1, maxArgs: 1 },
                      create: { minArgs: 1, maxArgs: 2 },
                      getAll: { minArgs: 0, maxArgs: 0 },
                      getPermissionLevel: { minArgs: 0, maxArgs: 0 },
                      update: { minArgs: 2, maxArgs: 2 },
                    },
                    pageAction: {
                      getPopup: { minArgs: 1, maxArgs: 1 },
                      getTitle: { minArgs: 1, maxArgs: 1 },
                      hide: {
                        minArgs: 1,
                        maxArgs: 1,
                        fallbackToNoCallback: !0,
                      },
                      setIcon: { minArgs: 1, maxArgs: 1 },
                      setPopup: {
                        minArgs: 1,
                        maxArgs: 1,
                        fallbackToNoCallback: !0,
                      },
                      setTitle: {
                        minArgs: 1,
                        maxArgs: 1,
                        fallbackToNoCallback: !0,
                      },
                      show: {
                        minArgs: 1,
                        maxArgs: 1,
                        fallbackToNoCallback: !0,
                      },
                    },
                    permissions: {
                      contains: { minArgs: 1, maxArgs: 1 },
                      getAll: { minArgs: 0, maxArgs: 0 },
                      remove: { minArgs: 1, maxArgs: 1 },
                      request: { minArgs: 1, maxArgs: 1 },
                    },
                    runtime: {
                      getBackgroundPage: { minArgs: 0, maxArgs: 0 },
                      getPlatformInfo: { minArgs: 0, maxArgs: 0 },
                      openOptionsPage: { minArgs: 0, maxArgs: 0 },
                      requestUpdateCheck: { minArgs: 0, maxArgs: 0 },
                      sendMessage: { minArgs: 1, maxArgs: 3 },
                      sendNativeMessage: { minArgs: 2, maxArgs: 2 },
                      setUninstallURL: { minArgs: 1, maxArgs: 1 },
                    },
                    sessions: {
                      getDevices: { minArgs: 0, maxArgs: 1 },
                      getRecentlyClosed: { minArgs: 0, maxArgs: 1 },
                      restore: { minArgs: 0, maxArgs: 1 },
                    },
                    storage: {
                      local: {
                        clear: { minArgs: 0, maxArgs: 0 },
                        get: { minArgs: 0, maxArgs: 1 },
                        getBytesInUse: { minArgs: 0, maxArgs: 1 },
                        remove: { minArgs: 1, maxArgs: 1 },
                        set: { minArgs: 1, maxArgs: 1 },
                      },
                      managed: {
                        get: { minArgs: 0, maxArgs: 1 },
                        getBytesInUse: { minArgs: 0, maxArgs: 1 },
                      },
                      sync: {
                        clear: { minArgs: 0, maxArgs: 0 },
                        get: { minArgs: 0, maxArgs: 1 },
                        getBytesInUse: { minArgs: 0, maxArgs: 1 },
                        remove: { minArgs: 1, maxArgs: 1 },
                        set: { minArgs: 1, maxArgs: 1 },
                      },
                    },
                    tabs: {
                      captureVisibleTab: { minArgs: 0, maxArgs: 2 },
                      create: { minArgs: 1, maxArgs: 1 },
                      detectLanguage: { minArgs: 0, maxArgs: 1 },
                      discard: { minArgs: 0, maxArgs: 1 },
                      duplicate: { minArgs: 1, maxArgs: 1 },
                      executeScript: { minArgs: 1, maxArgs: 2 },
                      get: { minArgs: 1, maxArgs: 1 },
                      getCurrent: { minArgs: 0, maxArgs: 0 },
                      getZoom: { minArgs: 0, maxArgs: 1 },
                      getZoomSettings: { minArgs: 0, maxArgs: 1 },
                      goBack: { minArgs: 0, maxArgs: 1 },
                      goForward: { minArgs: 0, maxArgs: 1 },
                      highlight: { minArgs: 1, maxArgs: 1 },
                      insertCSS: { minArgs: 1, maxArgs: 2 },
                      move: { minArgs: 2, maxArgs: 2 },
                      query: { minArgs: 1, maxArgs: 1 },
                      reload: { minArgs: 0, maxArgs: 2 },
                      remove: { minArgs: 1, maxArgs: 1 },
                      removeCSS: { minArgs: 1, maxArgs: 2 },
                      sendMessage: { minArgs: 2, maxArgs: 3 },
                      setZoom: { minArgs: 1, maxArgs: 2 },
                      setZoomSettings: { minArgs: 1, maxArgs: 2 },
                      update: { minArgs: 1, maxArgs: 2 },
                    },
                    topSites: { get: { minArgs: 0, maxArgs: 0 } },
                    webNavigation: {
                      getAllFrames: { minArgs: 1, maxArgs: 1 },
                      getFrame: { minArgs: 1, maxArgs: 1 },
                    },
                    webRequest: {
                      handlerBehaviorChanged: { minArgs: 0, maxArgs: 0 },
                    },
                    windows: {
                      create: { minArgs: 0, maxArgs: 1 },
                      get: { minArgs: 1, maxArgs: 2 },
                      getAll: { minArgs: 0, maxArgs: 1 },
                      getCurrent: { minArgs: 0, maxArgs: 1 },
                      getLastFocused: { minArgs: 0, maxArgs: 1 },
                      remove: { minArgs: 1, maxArgs: 1 },
                      update: { minArgs: 2, maxArgs: 2 },
                    },
                  };
                  if (0 === Object.keys(t).length)
                    throw new Error(
                      "api-metadata.json has not been included in browser-polyfill"
                    );
                  class n extends WeakMap {
                    constructor(e, r = void 0) {
                      super(r), (this.createItem = e);
                    }
                    get(e) {
                      return (
                        this.has(e) || this.set(e, this.createItem(e)),
                        super.get(e)
                      );
                    }
                  }
                  const s = (e) =>
                      e && "object" == typeof e && "function" == typeof e.then,
                    a =
                      (r, t) =>
                      (...n) => {
                        e.runtime.lastError
                          ? r.reject(e.runtime.lastError)
                          : t.singleCallbackArg ||
                            (n.length <= 1 && !1 !== t.singleCallbackArg)
                          ? r.resolve(n[0])
                          : r.resolve(n);
                      },
                    i = (e) => (1 == e ? "argument" : "arguments"),
                    o = (e, r) =>
                      function (t, ...n) {
                        if (n.length < r.minArgs)
                          throw new Error(
                            `Expected at least ${r.minArgs} ${i(
                              r.minArgs
                            )} for ${e}(), got ${n.length}`
                          );
                        if (n.length > r.maxArgs)
                          throw new Error(
                            `Expected at most ${r.maxArgs} ${i(
                              r.maxArgs
                            )} for ${e}(), got ${n.length}`
                          );
                        return new Promise((s, i) => {
                          if (r.fallbackToNoCallback)
                            try {
                              t[e](...n, a({ resolve: s, reject: i }, r));
                            } catch (a) {
                              t[e](...n),
                                (r.fallbackToNoCallback = !1),
                                (r.noCallback = !0),
                                s();
                            }
                          else
                            r.noCallback
                              ? (t[e](...n), s())
                              : t[e](...n, a({ resolve: s, reject: i }, r));
                        });
                      },
                    g = (e, r, t) =>
                      new Proxy(r, { apply: (r, n, s) => t.call(n, e, ...s) });
                  let m = Function.call.bind(Object.prototype.hasOwnProperty);
                  const l = (e, r = {}, t = {}) => {
                      let n = Object.create(null),
                        s = {
                          has: (r, t) => t in e || t in n,
                          get(s, a, i) {
                            if (a in n) return n[a];
                            if (!(a in e)) return;
                            let c = e[a];
                            if ("function" == typeof c)
                              if ("function" == typeof r[a])
                                c = g(e, e[a], r[a]);
                              else if (m(t, a)) {
                                let r = o(a, t[a]);
                                c = g(e, e[a], r);
                              } else c = c.bind(e);
                            else if (
                              "object" == typeof c &&
                              null !== c &&
                              (m(r, a) || m(t, a))
                            )
                              c = l(c, r[a], t[a]);
                            else {
                              if (!m(t, "*"))
                                return (
                                  Object.defineProperty(n, a, {
                                    configurable: !0,
                                    enumerable: !0,
                                    get: () => e[a],
                                    set(r) {
                                      e[a] = r;
                                    },
                                  }),
                                  c
                                );
                              c = l(c, r[a], t["*"]);
                            }
                            return (n[a] = c), c;
                          },
                          set: (r, t, s, a) => (
                            t in n ? (n[t] = s) : (e[t] = s), !0
                          ),
                          defineProperty: (e, r, t) =>
                            Reflect.defineProperty(n, r, t),
                          deleteProperty: (e, r) =>
                            Reflect.deleteProperty(n, r),
                        },
                        a = Object.create(e);
                      return new Proxy(a, s);
                    },
                    c = (e) => ({
                      addListener(r, t, ...n) {
                        r.addListener(e.get(t), ...n);
                      },
                      hasListener: (r, t) => r.hasListener(e.get(t)),
                      removeListener(r, t) {
                        r.removeListener(e.get(t));
                      },
                    });
                  let A = !1;
                  const u = new n((e) =>
                      "function" != typeof e
                        ? e
                        : function (r, t, n) {
                            let a,
                              i,
                              o = !1,
                              g = new Promise((e) => {
                                a = function (r) {
                                  A || (A = !0), (o = !0), e(r);
                                };
                              });
                            try {
                              i = e(r, t, a);
                            } catch (e) {
                              i = Promise.reject(e);
                            }
                            const m = !0 !== i && s(i);
                            if (!0 !== i && !m && !o) return !1;
                            const l = (e) => {
                              e.then(
                                (e) => {
                                  n(e);
                                },
                                (e) => {
                                  let r;
                                  (r =
                                    e &&
                                    (e instanceof Error ||
                                      "string" == typeof e.message)
                                      ? e.message
                                      : "An unexpected error occurred"),
                                    n({
                                      __mozWebExtensionPolyfillReject__: !0,
                                      message: r,
                                    });
                                }
                              ).catch((e) => {});
                            };
                            return l(m ? i : g), !0;
                          }
                    ),
                    x = ({ reject: t, resolve: n }, s) => {
                      e.runtime.lastError
                        ? e.runtime.lastError.message === r
                          ? n()
                          : t(e.runtime.lastError)
                        : s && s.__mozWebExtensionPolyfillReject__
                        ? t(new Error(s.message))
                        : n(s);
                    },
                    d = (e, r, t, ...n) => {
                      if (n.length < r.minArgs)
                        throw new Error(
                          `Expected at least ${r.minArgs} ${i(
                            r.minArgs
                          )} for ${e}(), got ${n.length}`
                        );
                      if (n.length > r.maxArgs)
                        throw new Error(
                          `Expected at most ${r.maxArgs} ${i(
                            r.maxArgs
                          )} for ${e}(), got ${n.length}`
                        );
                      return new Promise((e, r) => {
                        const s = x.bind(null, { resolve: e, reject: r });
                        n.push(s), t.sendMessage(...n);
                      });
                    },
                    p = {
                      runtime: {
                        onMessage: c(u),
                        onMessageExternal: c(u),
                        sendMessage: d.bind(null, "sendMessage", {
                          minArgs: 1,
                          maxArgs: 3,
                        }),
                      },
                      tabs: {
                        sendMessage: d.bind(null, "sendMessage", {
                          minArgs: 2,
                          maxArgs: 3,
                        }),
                      },
                    },
                    f = {
                      clear: { minArgs: 1, maxArgs: 1 },
                      get: { minArgs: 1, maxArgs: 1 },
                      set: { minArgs: 1, maxArgs: 1 },
                    };
                  return (
                    (t.privacy = {
                      network: { "*": f },
                      services: { "*": f },
                      websites: { "*": f },
                    }),
                    l(e, p, t)
                  );
                };
              if (
                "object" != typeof chrome ||
                !chrome ||
                !chrome.runtime ||
                !chrome.runtime.id
              )
                throw new Error(
                  "This script should only be loaded in a browser extension."
                );
              e.exports = t(chrome);
            } else e.exports = browser;
          }),
          void 0 === (s = "function" == typeof t ? t.apply(r, n) : t) ||
            (e.exports = s);
      },
    },
    r = {};
  function t(n) {
    var s = r[n];
    if (void 0 !== s) return s.exports;
    var a = (r[n] = { exports: {} });
    return e[n].call(a.exports, a, a.exports, t), a.exports;
  }
  (t.d = (e, r) => {
    for (var n in r)
      t.o(r, n) &&
        !t.o(e, n) &&
        Object.defineProperty(e, n, { enumerable: !0, get: r[n] });
  }),
    (t.o = (e, r) => Object.prototype.hasOwnProperty.call(e, r)),
    (() => {
      "use strict";
      function e(e, t) {
        return (
          (function (e) {
            if (Array.isArray(e)) return e;
          })(e) ||
          (function (e, r) {
            var t =
              null == e
                ? null
                : ("undefined" != typeof Symbol && e[Symbol.iterator]) ||
                  e["@@iterator"];
            if (null != t) {
              var n,
                s,
                a,
                i,
                o = [],
                g = !0,
                m = !1;
              try {
                if (((a = (t = t.call(e)).next), 0 === r)) {
                  if (Object(t) !== t) return;
                  g = !1;
                } else
                  for (
                    ;
                    !(g = (n = a.call(t)).done) &&
                    (o.push(n.value), o.length !== r);
                    g = !0
                  );
              } catch (e) {
                (m = !0), (s = e);
              } finally {
                try {
                  if (
                    !g &&
                    null != t.return &&
                    ((i = t.return()), Object(i) !== i)
                  )
                    return;
                } finally {
                  if (m) throw s;
                }
              }
              return o;
            }
          })(e, t) ||
          (function (e, t) {
            if (!e) return;
            if ("string" == typeof e) return r(e, t);
            var n = Object.prototype.toString.call(e).slice(8, -1);
            "Object" === n && e.constructor && (n = e.constructor.name);
            if ("Map" === n || "Set" === n) return Array.from(e);
            if (
              "Arguments" === n ||
              /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)
            )
              return r(e, t);
          })(e, t) ||
          (function () {
            throw new TypeError(
              "Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."
            );
          })()
        );
      }
      function r(e, r) {
        (null == r || r > e.length) && (r = e.length);
        for (var t = 0, n = new Array(r); t < r; t++) n[t] = e[t];
        return n;
      }
      (0, t(515).Z)("notion-boost");
      chrome.runtime.onInstalled.addListener(function (r) {
        chrome.declarativeContent.onPageChanged.removeRules(
          void 0,
          function () {
            chrome.declarativeContent.onPageChanged.addRules([
              {
                conditions: [
                  new chrome.declarativeContent.PageStateMatcher({
                    pageUrl: { hostContains: "notion.so" },
                  }),
                  new chrome.declarativeContent.PageStateMatcher({
                    pageUrl: { hostContains: "notion.site" },
                  }),
                ],
                actions: [new chrome.declarativeContent.ShowPageAction()],
              },
            ]);
          }
        );
        var t = chrome.runtime.getManifest().version,
          n = r.previousVersion,
          s = r.reason,
          a = (function (r, t) {
            if (!r || !t) return "some version is missing";
            var n = e(r.split(".").map(Number), 3),
              s = n[0],
              a = n[1],
              i = void 0 === a ? 0 : a,
              o = n[2],
              g = void 0 === o ? 0 : o,
              m = e(t.split(".").map(Number), 3),
              l = m[0],
              c = m[1],
              A = void 0 === c ? 0 : c,
              u = m[2];
            return l > s
              ? "major"
              : A > i
              ? "minor"
              : (void 0 === u ? 0 : u) > g
              ? "patch"
              : "same or downgrade version";
          })(n, t);
        switch (s) {
          case "install":
            chrome.tabs.create({ url: "https://gourav.io/notion-boost" });
            break;
          case "update":
            ("major" !== a && "minor" !== a) ||
              chrome.tabs.create({
                url: "https://gourav.io/notion-boost/whats-new",
              });
        }
      });
    })();
})();
