(() => {
  var e = {
      515: (e, t, n) => {
        "use strict";
        n.d(t, { Z: () => o });
        var r = n(261);
        "undefined" != typeof window &&
          window.addEventListener(
            "message",
            (e) => {
              "https://extensionpay.com" === e.origin &&
                e.source == window &&
                (("fetch-user" !== e.data && "trial-start" !== e.data) ||
                  r.runtime.sendMessage(e.data));
            },
            !1
          );
        const o = function (e) {
          const t = "https://extensionpay.com",
            n = `${t}/extension/${e}`;
          function o(e) {
            return new Promise((t) => setTimeout(t, e));
          }
          async function i(e) {
            try {
              return await r.storage.sync.get(e);
            } catch (t) {
              return await r.storage.local.get(e);
            }
          }
          async function a(e) {
            try {
              return await r.storage.sync.set(e);
            } catch (t) {
              return await r.storage.local.set(e);
            }
          }
          r.management &&
            r.management.getSelf().then(async (e) => {
              if (!e.permissions.includes("storage")) {
                var t = e.hostPermissions.concat(e.permissions);
                throw `ExtPay Setup Error: please include the "storage" permission in manifest.json["permissions"] or else ExtensionPay won't work correctly.\n\nYou can copy and paste this to your manifest.json file to fix this error:\n\n"permissions": [\n    ${t
                  .map((e) => `"    ${e}"`)
                  .join(",\n")}${t.length > 0 ? "," : ""}\n    "storage"\n]\n`;
              }
            }),
            i(["extensionpay_installed_at", "extensionpay_user"]).then(
              async (e) => {
                if (e.extensionpay_installed_at) return;
                const t = e.extensionpay_user,
                  n = t ? t.installedAt : new Date().toISOString();
                await a({ extensionpay_installed_at: n });
              }
            );
          const s = [],
            l = [];
          async function c() {
            var e,
              o = {};
            if (r.management) e = await r.management.getSelf();
            else {
              if (!r.runtime)
                throw "ExtPay needs to be run in a browser extension context";
              if (!(e = await r.runtime.sendMessage("extpay-extinfo"))) {
                e = {
                  installType: !("update_url" in r.runtime.getManifest())
                    ? "development"
                    : "normal",
                };
              }
            }
            "development" == e.installType && (o.development = !0);
            const i = await fetch(`${n}/api/new-key`, {
              method: "POST",
              headers: {
                Accept: "application/json",
                "Content-type": "application/json",
              },
              body: JSON.stringify(o),
            });
            if (!i.ok) throw (i.status, `${t}/home`);
            const s = await i.json();
            return await a({ extensionpay_api_key: s }), s;
          }
          async function u() {
            const e = await i(["extensionpay_api_key"]);
            return e.extensionpay_api_key ? e.extensionpay_api_key : null;
          }
          const p = /^\d\d\d\d-\d\d-\d\dT/;
          async function m() {
            var e = await i(["extensionpay_user", "extensionpay_installed_at"]);
            const t = await u();
            if (!t)
              return {
                paid: !1,
                paidAt: null,
                installedAt: e.extensionpay_installed_at
                  ? new Date(e.extensionpay_installed_at)
                  : new Date(),
                trialStartedAt: null,
              };
            const r = await fetch(`${n}/api/user?api_key=${t}`, {
              method: "GET",
              headers: { Accept: "application/json" },
            });
            if (!r.ok)
              throw "ExtPay error while fetching user: " + (await r.text());
            const o = await r.json(),
              c = {};
            for (var [m, d] of Object.entries(o))
              d && d.match && d.match(p) && (d = new Date(d)), (c[m] = d);
            return (
              (c.installedAt = new Date(e.extensionpay_installed_at)),
              c.paidAt &&
                (!e.extensionpay_user ||
                  (e.extensionpay_user && !e.extensionpay_user.paidAt)) &&
                s.forEach((e) => e(c)),
              c.trialStartedAt &&
                (!e.extensionpay_user ||
                  (e.extensionpay_user &&
                    !e.extensionpay_user.trialStartedAt)) &&
                l.forEach((e) => e(c)),
              await a({ extensionpay_user: o }),
              c
            );
          }
          async function d(e, t, n) {
            if (r.windows && r.windows.create) {
              const o = await r.windows.getCurrent(),
                i = Math.round(0.5 * (o.width - t) + o.left),
                a = Math.round(0.5 * (o.height - n) + o.top);
              try {
                r.windows.create({
                  url: e,
                  type: "popup",
                  focused: !0,
                  width: t,
                  height: n,
                  left: i,
                  top: a,
                });
              } catch (o) {
                r.windows.create({
                  url: e,
                  type: "popup",
                  width: t,
                  height: n,
                  left: i,
                  top: a,
                });
              }
            } else
              window.open(
                e,
                null,
                `toolbar=no,location=no,directories=no,status=no,menubar=no,width=${t},height=${n},left=450`
              );
          }
          var f = !1;
          return {
            getUser: function () {
              return m();
            },
            onPaid: {
              addListener: function (e) {
                const n = `"content_scripts": [\n                {\n            "matches": ["${t}/*"],\n            "js": ["ExtPay.js"],\n            "run_at": "document_start"\n        }]`,
                  o = r.runtime.getManifest();
                if (!o.content_scripts)
                  throw `ExtPay setup error: To use the onPaid callback handler, please include ExtPay as a content script in your manifest.json. You can copy the example below into your manifest.json or check the docs: https://github.com/Glench/ExtPay#2-configure-your-manifestjson\n\n        ${n}`;
                const i = o.content_scripts.find((e) =>
                  e.matches.includes(t.replace(":3000", "") + "/*")
                );
                if (!i)
                  throw `ExtPay setup error: To use the onPaid callback handler, please include ExtPay as a content script in your manifest.json matching "${t}/*". You can copy the example below into your manifest.json or check the docs: https://github.com/Glench/ExtPay#2-configure-your-manifestjson\n\n        ${n}`;
                if (!i.run_at || "document_start" !== i.run_at)
                  throw `ExtPay setup error: To use the onPaid callback handler, please make sure the ExtPay content script in your manifest.json runs at document start. You can copy the example below into your manifest.json or check the docs: https://github.com/Glench/ExtPay#2-configure-your-manifestjson\n\n        ${n}`;
                s.push(e);
              },
            },
            openPaymentPage: async function () {
              d(
                await (async function () {
                  var e = await u();
                  return e || (e = await c()), `${n}?api_key=${e}`;
                })(),
                500,
                800
              );
            },
            openTrialPage: async function (e) {
              var t = await u();
              t || (t = await c());
              var r = `${n}/trial?api_key=${t}`;
              e && (r += `&period=${e}`), d(r, 500, 650);
            },
            openLoginPage: async function () {
              var e = await u();
              e || (e = await c()), d(`${n}/reactivate?api_key=${e}`, 500, 800);
            },
            onTrialStarted: {
              addListener: function (e) {
                l.push(e);
              },
            },
            startBackground: function () {
              r.runtime.onMessage.addListener(function (e, t, n) {
                if ("fetch-user" == e)
                  !(async function () {
                    if (!f) {
                      f = !0;
                      for (var e = await m(), t = 0; t < 120; ++t) {
                        if (e.paidAt) return (f = !1), e;
                        await o(1e3), (e = await m());
                      }
                      f = !1;
                    }
                  })();
                else if ("trial-start" == e) m();
                else if ("extpay-extinfo" == e && r.management)
                  return r.management.getSelf();
              });
            },
          };
        };
      },
      755: (e, t, n) => {
        "use strict";
        n.d(t, { Z: () => _ });
        var r = n(868),
          o = n.n(r),
          i = n(646),
          a = n.n(i),
          s = n(235),
          l = n.n(s),
          c = new URL(n(442), n.b),
          u = new URL(n(116), n.b),
          p = new URL(n(968), n.b),
          m = a()(o()),
          d = l()(c),
          f = l()(u),
          g = l()(p);
        m.push([
          e.id,
          `*,*:focus{outline:0}*{box-sizing:border-box}*,:after,:before{box-sizing:border-box}::-webkit-scrollbar{background:rgba(0,0,0,0)}::-webkit-scrollbar{width:10px;height:10px}::-webkit-scrollbar-thumb{background:#d3d1cb}::-webkit-scrollbar-track{background:#edece9}::-webkit-scrollbar-thumb:hover{background:#aeaca6}*::selection{background:rgba(45,170,219,.3)}body{margin:0;margin:8px;width:450px;padding:9px 15px;fill:currentcolor;line-height:1.5;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";-webkit-font-smoothing:auto}p{font-size:13px}.icon-nb{background-image:url(${d});width:25px;height:25px;background-size:contain;margin-right:8px}.twitter{display:inline-block;height:10px;width:10px;-webkit-mask-image:url(${f});mask-image:url(${f});background-color:rgba(55,53,47,.6);-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat}.back.button{display:inline-block;cursor:pointer;margin-bottom:5px}.back.button .arrow{-webkit-mask-image:url(${g});mask-image:url(${g});background-color:rgba(55,53,47,.6);display:inline-block;height:15px;width:15px;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;padding-left:60px}.underline{border-bottom:1px solid rgba(55,53,47,.1);margin-bottom:16px;padding-bottom:8px}.topline{border-top:1px solid rgba(55,53,47,.1);margin-top:16px;padding-top:16px}.external-link{color:rgba(55,53,47,.6);fill:rgba(55,53,47,.6);cursor:pointer;text-decoration:none;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;background-image:linear-gradient(to right, rgba(55, 53, 47, 0.16) 0%, rgba(55, 53, 47, 0.16) 100%);background-repeat:repeat-x;background-position:0px 100%;background-size:100% 1px}.title{color:#37352f;font-size:18px;font-weight:500;width:auto}.sub-title{font-size:14px}.wrapper{flex-grow:1}.wrapper .footer{display:flex;justify-content:space-between}.wrapper .footer .footer-item{display:inline-flex;text-decoration:none;user-select:none;cursor:pointer;color:inherit}.wrapper .footer .footer-item .btn2{user-select:none;cursor:pointer;display:inline-flex;align-items:center;white-space:nowrap;height:20px;border-radius:3px;font-size:12px;line-height:1.2;padding-left:5px;padding-right:5px;color:rgba(55,53,47,.6)}.wrapper .footer .footer-item .btn2:hover{background-color:rgba(55,53,47,.08)}.wrapper .footer .footer-item .button{user-select:none;cursor:pointer;display:inline-flex;align-items:center;flex-shrink:0;white-space:nowrap;border-radius:3px;font-size:13px;line-height:1.2;min-width:0px;padding:3px 6px;color:rgba(55,53,47,.5)}.wrapper .footer .footer-item .button:hover{background-color:rgba(55,53,47,.08)}.button.toggle{user-select:none;transition:background 20ms ease-in 0s;cursor:pointer;border-radius:44px}.button.toggle .knob{display:flex;flex-shrink:0;height:14px;width:26px;border-radius:44px;padding:2px;box-sizing:content-box;transition:background 200ms ease 0s,box-shadow 200ms ease 0s}.row.enable .button.toggle .knob{background:#2eaadc}.row.disable .button.toggle .knob{background:rgba(135,131,120,.3)}.button.toggle .pos{width:14px;height:14px;border-radius:44px;background:#fff;transition:transform 50ms ease-out 0s,background 50ms ease-out 0s}.row.enable .button.toggle .pos{transform:translateX(12px) translateY(0px)}.row.disable .button.toggle .pos{transform:translateX(0px) translateY(0px)}.pro{user-select:none;transition:background 20ms ease-in 0s;cursor:pointer;display:inline-block;align-items:center;border-radius:3px;margin-left:8px;margin-top:-3px}.pro.big{position:relative;bottom:1px}.pro.big div{padding:4px 6px;font-size:11px}.pro.small div{padding:2px 6px;font-size:9px}.pro div{border-radius:3px;color:rgba(55,53,47,.6);background:rgba(206,205,202,.5);line-height:1;text-transform:uppercase;letter-spacing:.04em;white-space:nowrap}.payment{display:flex;margin-bottom:10px;font-size:14px;color:#37352f;fill:currentcolor;line-height:1.5;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";-webkit-font-smoothing:auto;flex-direction:column}.payment>div:nth-child(1){margin-top:5px;margin-bottom:15px;font-weight:500;line-height:24px}.payment .pricing{border:1px solid rgba(55,53,47,.09);border-radius:3px;padding:15px 10px}.payment .pricing .features{display:flex;flex-direction:column}.payment .pricing .features>div{margin:7px 0px}.payment .pricing .payBtn{margin-top:20px;margin-bottom:10px;user-select:none;transition:background 20ms ease-in 0s;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;width:100%;flex-shrink:0;white-space:nowrap;height:32px;border-radius:3px;box-shadow:rgba(15,15,15,.1019607843) 0px 0px 0px 1px inset,rgba(15,15,15,.1019607843) 0px 1px 2px;background:#2eaadc;color:#fff;fill:#fff;line-height:1.2;padding-left:12px;padding-right:12px;font-size:14px;font-weight:500}.payment .pricing .loginWrapper{display:flex;align-items:center;justify-content:center}.payment .pricing .loginWrapper .loginBtn{user-select:none;cursor:pointer;margin-left:5px;text-decoration:underline;white-space:nowrap;font-size:14px;font-weight:500}.settings.search{width:100%;border:none;border-radius:2px;font-size:14px;margin-bottom:16px;padding:8px;color:rgba(55,53,47,.6);background:rgba(206,205,202,.4)}.settings.search::placeholder{color:rgba(55,53,47,.4);font-size:14px}.settings.table{display:flex;flex-direction:column;align-items:flex-start;width:100%;height:auto;padding-left:0px;padding-right:15px;overflow:auto;max-height:350px;scrollbar-width:thin}.settings.table .no-setting{font-size:14px;color:#37352f}.settings.table .row{display:flex;width:100%;align-items:center;cursor:pointer}.settings.table .row .text-wrapper{flex:1 1 0%;flex-wrap:wrap;min-height:38px;display:flex;align-items:center}.settings.table .row .text-wrapper .name{font-size:14px}.settings.table .row .text-wrapper .desc{font-size:12px;line-height:16px;color:rgba(55,53,47,.6);width:85%;margin-top:4px}.settings.table .divider{display:flex;align-items:center;justify-content:center;pointer-events:none;width:100%;height:24px;flex:0 0 auto}.settings.table .divider.last{height:12px}.settings.table .divider .border{width:100%;height:1px;visibility:visible;border-bottom:1px solid rgba(55,53,47,.09)}`,
          "",
        ]);
        const _ = m;
      },
      646: (e) => {
        "use strict";
        e.exports = function (e) {
          var t = [];
          return (
            (t.toString = function () {
              return this.map(function (t) {
                var n = "",
                  r = void 0 !== t[5];
                return (
                  t[4] && (n += "@supports (".concat(t[4], ") {")),
                  t[2] && (n += "@media ".concat(t[2], " {")),
                  r &&
                    (n += "@layer".concat(
                      t[5].length > 0 ? " ".concat(t[5]) : "",
                      " {"
                    )),
                  (n += e(t)),
                  r && (n += "}"),
                  t[2] && (n += "}"),
                  t[4] && (n += "}"),
                  n
                );
              }).join("");
            }),
            (t.i = function (e, n, r, o, i) {
              "string" == typeof e && (e = [[null, e, void 0]]);
              var a = {};
              if (r)
                for (var s = 0; s < this.length; s++) {
                  var l = this[s][0];
                  null != l && (a[l] = !0);
                }
              for (var c = 0; c < e.length; c++) {
                var u = [].concat(e[c]);
                (r && a[u[0]]) ||
                  (void 0 !== i &&
                    (void 0 === u[5] ||
                      (u[1] = "@layer"
                        .concat(u[5].length > 0 ? " ".concat(u[5]) : "", " {")
                        .concat(u[1], "}")),
                    (u[5] = i)),
                  n &&
                    (u[2]
                      ? ((u[1] = "@media "
                          .concat(u[2], " {")
                          .concat(u[1], "}")),
                        (u[2] = n))
                      : (u[2] = n)),
                  o &&
                    (u[4]
                      ? ((u[1] = "@supports ("
                          .concat(u[4], ") {")
                          .concat(u[1], "}")),
                        (u[4] = o))
                      : (u[4] = "".concat(o))),
                  t.push(u));
              }
            }),
            t
          );
        };
      },
      235: (e) => {
        "use strict";
        e.exports = function (e, t) {
          return (
            t || (t = {}),
            e
              ? ((e = String(e.__esModule ? e.default : e)),
                /^['"].*['"]$/.test(e) && (e = e.slice(1, -1)),
                t.hash && (e += t.hash),
                /["'() \t\n]|(%20)/.test(e) || t.needQuotes
                  ? '"'.concat(
                      e.replace(/"/g, '\\"').replace(/\n/g, "\\n"),
                      '"'
                    )
                  : e)
              : e
          );
        };
      },
      868: (e) => {
        "use strict";
        e.exports = function (e) {
          return e[1];
        };
      },
      40: (e) => {
        "use strict";
        var t = [];
        function n(e) {
          for (var n = -1, r = 0; r < t.length; r++)
            if (t[r].identifier === e) {
              n = r;
              break;
            }
          return n;
        }
        function r(e, r) {
          for (var i = {}, a = [], s = 0; s < e.length; s++) {
            var l = e[s],
              c = r.base ? l[0] + r.base : l[0],
              u = i[c] || 0,
              p = "".concat(c, " ").concat(u);
            i[c] = u + 1;
            var m = n(p),
              d = {
                css: l[1],
                media: l[2],
                sourceMap: l[3],
                supports: l[4],
                layer: l[5],
              };
            if (-1 !== m) t[m].references++, t[m].updater(d);
            else {
              var f = o(d, r);
              (r.byIndex = s),
                t.splice(s, 0, { identifier: p, updater: f, references: 1 });
            }
            a.push(p);
          }
          return a;
        }
        function o(e, t) {
          var n = t.domAPI(t);
          n.update(e);
          return function (t) {
            if (t) {
              if (
                t.css === e.css &&
                t.media === e.media &&
                t.sourceMap === e.sourceMap &&
                t.supports === e.supports &&
                t.layer === e.layer
              )
                return;
              n.update((e = t));
            } else n.remove();
          };
        }
        e.exports = function (e, o) {
          var i = r((e = e || []), (o = o || {}));
          return function (e) {
            e = e || [];
            for (var a = 0; a < i.length; a++) {
              var s = n(i[a]);
              t[s].references--;
            }
            for (var l = r(e, o), c = 0; c < i.length; c++) {
              var u = n(i[c]);
              0 === t[u].references && (t[u].updater(), t.splice(u, 1));
            }
            i = l;
          };
        };
      },
      178: (e) => {
        "use strict";
        var t = {};
        e.exports = function (e, n) {
          var r = (function (e) {
            if (void 0 === t[e]) {
              var n = document.querySelector(e);
              if (
                window.HTMLIFrameElement &&
                n instanceof window.HTMLIFrameElement
              )
                try {
                  n = n.contentDocument.head;
                } catch (e) {
                  n = null;
                }
              t[e] = n;
            }
            return t[e];
          })(e);
          if (!r)
            throw new Error(
              "Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid."
            );
          r.appendChild(n);
        };
      },
      663: (e) => {
        "use strict";
        e.exports = function (e) {
          var t = document.createElement("style");
          return e.setAttributes(t, e.attributes), e.insert(t, e.options), t;
        };
      },
      304: (e, t, n) => {
        "use strict";
        e.exports = function (e) {
          var t = n.nc;
          t && e.setAttribute("nonce", t);
        };
      },
      948: (e) => {
        "use strict";
        e.exports = function (e) {
          if ("undefined" == typeof document)
            return { update: function () {}, remove: function () {} };
          var t = e.insertStyleElement(e);
          return {
            update: function (n) {
              !(function (e, t, n) {
                var r = "";
                n.supports && (r += "@supports (".concat(n.supports, ") {")),
                  n.media && (r += "@media ".concat(n.media, " {"));
                var o = void 0 !== n.layer;
                o &&
                  (r += "@layer".concat(
                    n.layer.length > 0 ? " ".concat(n.layer) : "",
                    " {"
                  )),
                  (r += n.css),
                  o && (r += "}"),
                  n.media && (r += "}"),
                  n.supports && (r += "}");
                var i = n.sourceMap;
                i &&
                  "undefined" != typeof btoa &&
                  (r +=
                    "\n/*# sourceMappingURL=data:application/json;base64,".concat(
                      btoa(unescape(encodeURIComponent(JSON.stringify(i)))),
                      " */"
                    )),
                  t.styleTagTransform(r, e, t.options);
              })(t, e, n);
            },
            remove: function () {
              !(function (e) {
                if (null === e.parentNode) return !1;
                e.parentNode.removeChild(e);
              })(t);
            },
          };
        };
      },
      92: (e) => {
        "use strict";
        e.exports = function (e, t) {
          if (t.styleSheet) t.styleSheet.cssText = e;
          else {
            for (; t.firstChild; ) t.removeChild(t.firstChild);
            t.appendChild(document.createTextNode(e));
          }
        };
      },
      261: function (e, t) {
        var n, r, o;
        "undefined" != typeof globalThis
          ? globalThis
          : "undefined" != typeof self && self,
          (r = [e]),
          (n = function (e) {
            "use strict";
            if (
              "undefined" == typeof browser ||
              Object.getPrototypeOf(browser) !== Object.prototype
            ) {
              const t =
                  "The message port closed before a response was received.",
                n = (e) => {
                  const n = {
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
                  if (0 === Object.keys(n).length)
                    throw new Error(
                      "api-metadata.json has not been included in browser-polyfill"
                    );
                  class r extends WeakMap {
                    constructor(e, t = void 0) {
                      super(t), (this.createItem = e);
                    }
                    get(e) {
                      return (
                        this.has(e) || this.set(e, this.createItem(e)),
                        super.get(e)
                      );
                    }
                  }
                  const o = (e) =>
                      e && "object" == typeof e && "function" == typeof e.then,
                    i =
                      (t, n) =>
                      (...r) => {
                        e.runtime.lastError
                          ? t.reject(e.runtime.lastError)
                          : n.singleCallbackArg ||
                            (r.length <= 1 && !1 !== n.singleCallbackArg)
                          ? t.resolve(r[0])
                          : t.resolve(r);
                      },
                    a = (e) => (1 == e ? "argument" : "arguments"),
                    s = (e, t) =>
                      function (n, ...r) {
                        if (r.length < t.minArgs)
                          throw new Error(
                            `Expected at least ${t.minArgs} ${a(
                              t.minArgs
                            )} for ${e}(), got ${r.length}`
                          );
                        if (r.length > t.maxArgs)
                          throw new Error(
                            `Expected at most ${t.maxArgs} ${a(
                              t.maxArgs
                            )} for ${e}(), got ${r.length}`
                          );
                        return new Promise((o, a) => {
                          if (t.fallbackToNoCallback)
                            try {
                              n[e](...r, i({ resolve: o, reject: a }, t));
                            } catch (i) {
                              n[e](...r),
                                (t.fallbackToNoCallback = !1),
                                (t.noCallback = !0),
                                o();
                            }
                          else
                            t.noCallback
                              ? (n[e](...r), o())
                              : n[e](...r, i({ resolve: o, reject: a }, t));
                        });
                      },
                    l = (e, t, n) =>
                      new Proxy(t, { apply: (t, r, o) => n.call(r, e, ...o) });
                  let c = Function.call.bind(Object.prototype.hasOwnProperty);
                  const u = (e, t = {}, n = {}) => {
                      let r = Object.create(null),
                        o = {
                          has: (t, n) => n in e || n in r,
                          get(o, i, a) {
                            if (i in r) return r[i];
                            if (!(i in e)) return;
                            let p = e[i];
                            if ("function" == typeof p)
                              if ("function" == typeof t[i])
                                p = l(e, e[i], t[i]);
                              else if (c(n, i)) {
                                let t = s(i, n[i]);
                                p = l(e, e[i], t);
                              } else p = p.bind(e);
                            else if (
                              "object" == typeof p &&
                              null !== p &&
                              (c(t, i) || c(n, i))
                            )
                              p = u(p, t[i], n[i]);
                            else {
                              if (!c(n, "*"))
                                return (
                                  Object.defineProperty(r, i, {
                                    configurable: !0,
                                    enumerable: !0,
                                    get: () => e[i],
                                    set(t) {
                                      e[i] = t;
                                    },
                                  }),
                                  p
                                );
                              p = u(p, t[i], n["*"]);
                            }
                            return (r[i] = p), p;
                          },
                          set: (t, n, o, i) => (
                            n in r ? (r[n] = o) : (e[n] = o), !0
                          ),
                          defineProperty: (e, t, n) =>
                            Reflect.defineProperty(r, t, n),
                          deleteProperty: (e, t) =>
                            Reflect.deleteProperty(r, t),
                        },
                        i = Object.create(e);
                      return new Proxy(i, o);
                    },
                    p = (e) => ({
                      addListener(t, n, ...r) {
                        t.addListener(e.get(n), ...r);
                      },
                      hasListener: (t, n) => t.hasListener(e.get(n)),
                      removeListener(t, n) {
                        t.removeListener(e.get(n));
                      },
                    });
                  let m = !1;
                  const d = new r((e) =>
                      "function" != typeof e
                        ? e
                        : function (t, n, r) {
                            let i,
                              a,
                              s = !1,
                              l = new Promise((e) => {
                                i = function (t) {
                                  m || (m = !0), (s = !0), e(t);
                                };
                              });
                            try {
                              a = e(t, n, i);
                            } catch (e) {
                              a = Promise.reject(e);
                            }
                            const c = !0 !== a && o(a);
                            if (!0 !== a && !c && !s) return !1;
                            const u = (e) => {
                              e.then(
                                (e) => {
                                  r(e);
                                },
                                (e) => {
                                  let t;
                                  (t =
                                    e &&
                                    (e instanceof Error ||
                                      "string" == typeof e.message)
                                      ? e.message
                                      : "An unexpected error occurred"),
                                    r({
                                      __mozWebExtensionPolyfillReject__: !0,
                                      message: t,
                                    });
                                }
                              ).catch((e) => {});
                            };
                            return u(c ? a : l), !0;
                          }
                    ),
                    f = ({ reject: n, resolve: r }, o) => {
                      e.runtime.lastError
                        ? e.runtime.lastError.message === t
                          ? r()
                          : n(e.runtime.lastError)
                        : o && o.__mozWebExtensionPolyfillReject__
                        ? n(new Error(o.message))
                        : r(o);
                    },
                    g = (e, t, n, ...r) => {
                      if (r.length < t.minArgs)
                        throw new Error(
                          `Expected at least ${t.minArgs} ${a(
                            t.minArgs
                          )} for ${e}(), got ${r.length}`
                        );
                      if (r.length > t.maxArgs)
                        throw new Error(
                          `Expected at most ${t.maxArgs} ${a(
                            t.maxArgs
                          )} for ${e}(), got ${r.length}`
                        );
                      return new Promise((e, t) => {
                        const o = f.bind(null, { resolve: e, reject: t });
                        r.push(o), n.sendMessage(...r);
                      });
                    },
                    _ = {
                      runtime: {
                        onMessage: p(d),
                        onMessageExternal: p(d),
                        sendMessage: g.bind(null, "sendMessage", {
                          minArgs: 1,
                          maxArgs: 3,
                        }),
                      },
                      tabs: {
                        sendMessage: g.bind(null, "sendMessage", {
                          minArgs: 2,
                          maxArgs: 3,
                        }),
                      },
                    },
                    h = {
                      clear: { minArgs: 1, maxArgs: 1 },
                      get: { minArgs: 1, maxArgs: 1 },
                      set: { minArgs: 1, maxArgs: 1 },
                    };
                  return (
                    (n.privacy = {
                      network: { "*": h },
                      services: { "*": h },
                      websites: { "*": h },
                    }),
                    u(e, _, n)
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
              e.exports = n(chrome);
            } else e.exports = browser;
          }),
          void 0 === (o = "function" == typeof n ? n.apply(t, r) : n) ||
            (e.exports = o);
      },
      968: (e, t, n) => {
        "use strict";
        e.exports = n.p + "bf463c6a8989a892ff93.svg";
      },
      442: (e, t, n) => {
        "use strict";
        e.exports = n.p + "0476e46f03ca549fe3c1.svg";
      },
      116: (e, t, n) => {
        "use strict";
        e.exports = n.p + "a8ab7a45eb35f379dc04.svg";
      },
    },
    t = {};
  function n(r) {
    var o = t[r];
    if (void 0 !== o) return o.exports;
    var i = (t[r] = { id: r, exports: {} });
    return e[r].call(i.exports, i, i.exports, n), i.exports;
  }
  (n.m = e),
    (n.n = (e) => {
      var t = e && e.__esModule ? () => e.default : () => e;
      return n.d(t, { a: t }), t;
    }),
    (n.d = (e, t) => {
      for (var r in t)
        n.o(t, r) &&
          !n.o(e, r) &&
          Object.defineProperty(e, r, { enumerable: !0, get: t[r] });
    }),
    (n.g = (function () {
      if ("object" == typeof globalThis) return globalThis;
      try {
        return this || new Function("return this")();
      } catch (e) {
        if ("object" == typeof window) return window;
      }
    })()),
    (n.o = (e, t) => Object.prototype.hasOwnProperty.call(e, t)),
    (() => {
      var e;
      n.g.importScripts && (e = n.g.location + "");
      var t = n.g.document;
      if (!e && t && (t.currentScript && (e = t.currentScript.src), !e)) {
        var r = t.getElementsByTagName("script");
        if (r.length) for (var o = r.length - 1; o > -1 && !e; ) e = r[o--].src;
      }
      if (!e)
        throw new Error(
          "Automatic publicPath is not supported in this browser"
        );
      (e = e
        .replace(/#.*$/, "")
        .replace(/\?.*$/, "")
        .replace(/\/[^\/]+$/, "/")),
        (n.p = e);
    })(),
    (n.b = document.baseURI || self.location.href),
    (n.nc = void 0);
  var r = {};
  (() => {
    "use strict";
    n.d(r, { F: () => xt });
    var e,
      t,
      o,
      i,
      a,
      s,
      l,
      c,
      u = {},
      p = [],
      m = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i,
      d = Array.isArray;
    function f(e, t) {
      for (var n in t) e[n] = t[n];
      return e;
    }
    function g(e) {
      var t = e.parentNode;
      t && t.removeChild(e);
    }
    function _(t, n, r) {
      var o,
        i,
        a,
        s = {};
      for (a in n)
        "key" == a ? (o = n[a]) : "ref" == a ? (i = n[a]) : (s[a] = n[a]);
      if (
        (arguments.length > 2 &&
          (s.children = arguments.length > 3 ? e.call(arguments, 2) : r),
        "function" == typeof t && null != t.defaultProps)
      )
        for (a in t.defaultProps) void 0 === s[a] && (s[a] = t.defaultProps[a]);
      return h(t, s, o, i, null);
    }
    function h(e, n, r, i, a) {
      var s = {
        type: e,
        props: n,
        key: r,
        ref: i,
        __k: null,
        __: null,
        __b: 0,
        __e: null,
        __d: void 0,
        __c: null,
        constructor: void 0,
        __v: null == a ? ++o : a,
        __i: -1,
        __u: 0,
      };
      return null == a && null != t.vnode && t.vnode(s), s;
    }
    function b(e) {
      return e.children;
    }
    function x(e, t) {
      (this.props = e), (this.context = t);
    }
    function y(e, t) {
      if (null == t) return e.__ ? y(e.__, e.__i + 1) : null;
      for (var n; t < e.__k.length; t++)
        if (null != (n = e.__k[t]) && null != n.__e) return n.__e;
      return "function" == typeof e.type ? y(e) : null;
    }
    function v(e) {
      var t, n;
      if (null != (e = e.__) && null != e.__c) {
        for (e.__e = e.__c.base = null, t = 0; t < e.__k.length; t++)
          if (null != (n = e.__k[t]) && null != n.__e) {
            e.__e = e.__c.base = n.__e;
            break;
          }
        return v(e);
      }
    }
    function A(e) {
      ((!e.__d && (e.__d = !0) && i.push(e) && !w.__r++) ||
        a !== t.debounceRendering) &&
        ((a = t.debounceRendering) || s)(w);
    }
    function w() {
      var e, n, r, o, a, s, c, u, p;
      for (i.sort(l); (e = i.shift()); )
        e.__d &&
          ((n = i.length),
          (o = void 0),
          (s = (a = (r = e).__v).__e),
          (u = []),
          (p = []),
          (c = r.__P) &&
            (((o = f({}, a)).__v = a.__v + 1),
            t.vnode && t.vnode(o),
            M(
              c,
              o,
              a,
              r.__n,
              void 0 !== c.ownerSVGElement,
              32 & a.__u ? [s] : null,
              u,
              null == s ? y(a) : s,
              !!(32 & a.__u),
              p
            ),
            (o.__.__k[o.__i] = o),
            O(u, o, p),
            o.__e != s && v(o)),
          i.length > n && i.sort(l));
      w.__r = 0;
    }
    function k(e, t, n, r, o, i, a, s, l, c, m) {
      var d,
        f,
        g,
        _,
        h,
        b = (r && r.__k) || p,
        x = t.length;
      for (n.__d = l, S(n, t, b), l = n.__d, d = 0; d < x; d++)
        null != (g = n.__k[d]) &&
          "boolean" != typeof g &&
          "function" != typeof g &&
          ((f = -1 === g.__i ? u : b[g.__i] || u),
          (g.__i = d),
          M(e, g, f, o, i, a, s, l, c, m),
          (_ = g.__e),
          g.ref &&
            f.ref != g.ref &&
            (f.ref && $(f.ref, null, g), m.push(g.ref, g.__c || _, g)),
          null == h && null != _ && (h = _),
          65536 & g.__u || f.__k === g.__k
            ? (l = P(g, l, e))
            : "function" == typeof g.type && void 0 !== g.__d
            ? (l = g.__d)
            : _ && (l = _.nextSibling),
          (g.__d = void 0),
          (g.__u &= -196609));
      (n.__d = l), (n.__e = h);
    }
    function S(e, t, n) {
      var r,
        o,
        i,
        a,
        s,
        l = t.length,
        c = n.length,
        u = c,
        p = 0;
      for (e.__k = [], r = 0; r < l; r++)
        null !=
        (o = e.__k[r] =
          null == (o = t[r]) || "boolean" == typeof o || "function" == typeof o
            ? null
            : "string" == typeof o ||
              "number" == typeof o ||
              "bigint" == typeof o ||
              o.constructor == String
            ? h(null, o, null, null, o)
            : d(o)
            ? h(b, { children: o }, null, null, null)
            : void 0 === o.constructor && o.__b > 0
            ? h(o.type, o.props, o.key, o.ref ? o.ref : null, o.__v)
            : o)
          ? ((o.__ = e),
            (o.__b = e.__b + 1),
            (s = T(o, n, (a = r + p), u)),
            (o.__i = s),
            (i = null),
            -1 !== s && (u--, (i = n[s]) && (i.__u |= 131072)),
            null == i || null === i.__v
              ? (-1 == s && p--,
                "function" != typeof o.type && (o.__u |= 65536))
              : s !== a &&
                (s === a + 1
                  ? p++
                  : s > a
                  ? u > l - a
                    ? (p += s - a)
                    : p--
                  : (p = s < a && s == a - 1 ? s - a : 0),
                s !== r + p && (o.__u |= 65536)))
          : (i = n[r]) &&
            null == i.key &&
            i.__e &&
            (i.__e == e.__d && (e.__d = y(i)), U(i, i, !1), (n[r] = null), u--);
      if (u)
        for (r = 0; r < c; r++)
          null != (i = n[r]) &&
            0 == (131072 & i.__u) &&
            (i.__e == e.__d && (e.__d = y(i)), U(i, i));
    }
    function P(e, t, n) {
      var r, o;
      if ("function" == typeof e.type) {
        for (r = e.__k, o = 0; r && o < r.length; o++)
          r[o] && ((r[o].__ = e), (t = P(r[o], t, n)));
        return t;
      }
      return (
        e.__e != t && (n.insertBefore(e.__e, t || null), (t = e.__e)),
        t && t.nextSibling
      );
    }
    function C(e, t) {
      return (
        (t = t || []),
        null == e ||
          "boolean" == typeof e ||
          (d(e)
            ? e.some(function (e) {
                C(e, t);
              })
            : t.push(e)),
        t
      );
    }
    function T(e, t, n, r) {
      var o = e.key,
        i = e.type,
        a = n - 1,
        s = n + 1,
        l = t[n];
      if (null === l || (l && o == l.key && i === l.type)) return n;
      if (r > (null != l && 0 == (131072 & l.__u) ? 1 : 0))
        for (; a >= 0 || s < t.length; ) {
          if (a >= 0) {
            if (
              (l = t[a]) &&
              0 == (131072 & l.__u) &&
              o == l.key &&
              i === l.type
            )
              return a;
            a--;
          }
          if (s < t.length) {
            if (
              (l = t[s]) &&
              0 == (131072 & l.__u) &&
              o == l.key &&
              i === l.type
            )
              return s;
            s++;
          }
        }
      return -1;
    }
    function N(e, t, n) {
      "-" === t[0]
        ? e.setProperty(t, null == n ? "" : n)
        : (e[t] =
            null == n ? "" : "number" != typeof n || m.test(t) ? n : n + "px");
    }
    function E(e, t, n, r, o) {
      var i;
      e: if ("style" === t)
        if ("string" == typeof n) e.style.cssText = n;
        else {
          if (("string" == typeof r && (e.style.cssText = r = ""), r))
            for (t in r) (n && t in n) || N(e.style, t, "");
          if (n) for (t in n) (r && n[t] === r[t]) || N(e.style, t, n[t]);
        }
      else if ("o" === t[0] && "n" === t[1])
        (i = t !== (t = t.replace(/(PointerCapture)$|Capture$/, "$1"))),
          (t = t.toLowerCase() in e ? t.toLowerCase().slice(2) : t.slice(2)),
          e.l || (e.l = {}),
          (e.l[t + i] = n),
          n
            ? r
              ? (n.u = r.u)
              : ((n.u = Date.now()), e.addEventListener(t, i ? L : j, i))
            : e.removeEventListener(t, i ? L : j, i);
      else {
        if (o) t = t.replace(/xlink(H|:h)/, "h").replace(/sName$/, "s");
        else if (
          "width" !== t &&
          "height" !== t &&
          "href" !== t &&
          "list" !== t &&
          "form" !== t &&
          "tabIndex" !== t &&
          "download" !== t &&
          "rowSpan" !== t &&
          "colSpan" !== t &&
          "role" !== t &&
          t in e
        )
          try {
            e[t] = null == n ? "" : n;
            break e;
          } catch (e) {}
        "function" == typeof n ||
          (null == n || (!1 === n && "-" !== t[4])
            ? e.removeAttribute(t)
            : e.setAttribute(t, n));
      }
    }
    function j(e) {
      var n = this.l[e.type + !1];
      if (e.t) {
        if (e.t <= n.u) return;
      } else e.t = Date.now();
      return n(t.event ? t.event(e) : e);
    }
    function L(e) {
      return this.l[e.type + !0](t.event ? t.event(e) : e);
    }
    function M(e, n, r, o, i, a, s, l, c, u) {
      var p,
        m,
        g,
        _,
        h,
        y,
        v,
        A,
        w,
        S,
        P,
        C,
        T,
        N,
        E,
        j = n.type;
      if (void 0 !== n.constructor) return null;
      128 & r.__u && ((c = !!(32 & r.__u)), (a = [(l = n.__e = r.__e)])),
        (p = t.__b) && p(n);
      e: if ("function" == typeof j)
        try {
          if (
            ((A = n.props),
            (w = (p = j.contextType) && o[p.__c]),
            (S = p ? (w ? w.props.value : p.__) : o),
            r.__c
              ? (v = (m = n.__c = r.__c).__ = m.__E)
              : ("prototype" in j && j.prototype.render
                  ? (n.__c = m = new j(A, S))
                  : ((n.__c = m = new x(A, S)),
                    (m.constructor = j),
                    (m.render = H)),
                w && w.sub(m),
                (m.props = A),
                m.state || (m.state = {}),
                (m.context = S),
                (m.__n = o),
                (g = m.__d = !0),
                (m.__h = []),
                (m._sb = [])),
            null == m.__s && (m.__s = m.state),
            null != j.getDerivedStateFromProps &&
              (m.__s == m.state && (m.__s = f({}, m.__s)),
              f(m.__s, j.getDerivedStateFromProps(A, m.__s))),
            (_ = m.props),
            (h = m.state),
            (m.__v = n),
            g)
          )
            null == j.getDerivedStateFromProps &&
              null != m.componentWillMount &&
              m.componentWillMount(),
              null != m.componentDidMount && m.__h.push(m.componentDidMount);
          else {
            if (
              (null == j.getDerivedStateFromProps &&
                A !== _ &&
                null != m.componentWillReceiveProps &&
                m.componentWillReceiveProps(A, S),
              !m.__e &&
                ((null != m.shouldComponentUpdate &&
                  !1 === m.shouldComponentUpdate(A, m.__s, S)) ||
                  n.__v === r.__v))
            ) {
              for (
                n.__v !== r.__v &&
                  ((m.props = A), (m.state = m.__s), (m.__d = !1)),
                  n.__e = r.__e,
                  n.__k = r.__k,
                  n.__k.forEach(function (e) {
                    e && (e.__ = n);
                  }),
                  P = 0;
                P < m._sb.length;
                P++
              )
                m.__h.push(m._sb[P]);
              (m._sb = []), m.__h.length && s.push(m);
              break e;
            }
            null != m.componentWillUpdate && m.componentWillUpdate(A, m.__s, S),
              null != m.componentDidUpdate &&
                m.__h.push(function () {
                  m.componentDidUpdate(_, h, y);
                });
          }
          if (
            ((m.context = S),
            (m.props = A),
            (m.__P = e),
            (m.__e = !1),
            (C = t.__r),
            (T = 0),
            "prototype" in j && j.prototype.render)
          ) {
            for (
              m.state = m.__s,
                m.__d = !1,
                C && C(n),
                p = m.render(m.props, m.state, m.context),
                N = 0;
              N < m._sb.length;
              N++
            )
              m.__h.push(m._sb[N]);
            m._sb = [];
          } else
            do {
              (m.__d = !1),
                C && C(n),
                (p = m.render(m.props, m.state, m.context)),
                (m.state = m.__s);
            } while (m.__d && ++T < 25);
          (m.state = m.__s),
            null != m.getChildContext && (o = f(f({}, o), m.getChildContext())),
            g ||
              null == m.getSnapshotBeforeUpdate ||
              (y = m.getSnapshotBeforeUpdate(_, h)),
            k(
              e,
              d(
                (E =
                  null != p && p.type === b && null == p.key
                    ? p.props.children
                    : p)
              )
                ? E
                : [E],
              n,
              r,
              o,
              i,
              a,
              s,
              l,
              c,
              u
            ),
            (m.base = n.__e),
            (n.__u &= -161),
            m.__h.length && s.push(m),
            v && (m.__E = m.__ = null);
        } catch (e) {
          (n.__v = null),
            c || null != a
              ? ((n.__e = l), (n.__u |= c ? 160 : 32), (a[a.indexOf(l)] = null))
              : ((n.__e = r.__e), (n.__k = r.__k)),
            t.__e(e, n, r);
        }
      else
        null == a && n.__v === r.__v
          ? ((n.__k = r.__k), (n.__e = r.__e))
          : (n.__e = I(r.__e, n, r, o, i, a, s, c, u));
      (p = t.diffed) && p(n);
    }
    function O(e, n, r) {
      n.__d = void 0;
      for (var o = 0; o < r.length; o++) $(r[o], r[++o], r[++o]);
      t.__c && t.__c(n, e),
        e.some(function (n) {
          try {
            (e = n.__h),
              (n.__h = []),
              e.some(function (e) {
                e.call(n);
              });
          } catch (e) {
            t.__e(e, n.__v);
          }
        });
    }
    function I(t, n, r, o, i, a, s, l, c) {
      var p,
        m,
        f,
        _,
        h,
        b,
        x,
        v = r.props,
        A = n.props,
        w = n.type;
      if (("svg" === w && (i = !0), null != a))
        for (p = 0; p < a.length; p++)
          if (
            (h = a[p]) &&
            "setAttribute" in h == !!w &&
            (w ? h.localName === w : 3 === h.nodeType)
          ) {
            (t = h), (a[p] = null);
            break;
          }
      if (null == t) {
        if (null === w) return document.createTextNode(A);
        (t = i
          ? document.createElementNS("http://www.w3.org/2000/svg", w)
          : document.createElement(w, A.is && A)),
          (a = null),
          (l = !1);
      }
      if (null === w) v === A || (l && t.data === A) || (t.data = A);
      else {
        if (
          ((a = a && e.call(t.childNodes)), (v = r.props || u), !l && null != a)
        )
          for (v = {}, p = 0; p < t.attributes.length; p++)
            v[(h = t.attributes[p]).name] = h.value;
        for (p in v)
          (h = v[p]),
            "children" == p ||
              ("dangerouslySetInnerHTML" == p
                ? (f = h)
                : "key" === p || p in A || E(t, p, null, h, i));
        for (p in A)
          (h = A[p]),
            "children" == p
              ? (_ = h)
              : "dangerouslySetInnerHTML" == p
              ? (m = h)
              : "value" == p
              ? (b = h)
              : "checked" == p
              ? (x = h)
              : "key" === p ||
                (l && "function" != typeof h) ||
                v[p] === h ||
                E(t, p, h, v[p], i);
        if (m)
          l ||
            (f && (m.__html === f.__html || m.__html === t.innerHTML)) ||
            (t.innerHTML = m.__html),
            (n.__k = []);
        else if (
          (f && (t.innerHTML = ""),
          k(
            t,
            d(_) ? _ : [_],
            n,
            r,
            o,
            i && "foreignObject" !== w,
            a,
            s,
            a ? a[0] : r.__k && y(r, 0),
            l,
            c
          ),
          null != a)
        )
          for (p = a.length; p--; ) null != a[p] && g(a[p]);
        l ||
          ((p = "value"),
          void 0 !== b &&
            (b !== t[p] ||
              ("progress" === w && !b) ||
              ("option" === w && b !== v[p])) &&
            E(t, p, b, v[p], !1),
          (p = "checked"),
          void 0 !== x && x !== t[p] && E(t, p, x, v[p], !1));
      }
      return t;
    }
    function $(e, n, r) {
      try {
        "function" == typeof e ? e(n) : (e.current = n);
      } catch (e) {
        t.__e(e, r);
      }
    }
    function U(e, n, r) {
      var o, i;
      if (
        (t.unmount && t.unmount(e),
        (o = e.ref) && ((o.current && o.current !== e.__e) || $(o, null, n)),
        null != (o = e.__c))
      ) {
        if (o.componentWillUnmount)
          try {
            o.componentWillUnmount();
          } catch (e) {
            t.__e(e, n);
          }
        (o.base = o.__P = null), (e.__c = void 0);
      }
      if ((o = e.__k))
        for (i = 0; i < o.length; i++)
          o[i] && U(o[i], n, r || "function" != typeof e.type);
      r || null == e.__e || g(e.__e), (e.__ = e.__e = e.__d = void 0);
    }
    function H(e, t, n) {
      return this.constructor(e, n);
    }
    function B(n, r, o) {
      var i, a, s, l;
      t.__ && t.__(n, r),
        (a = (i = "function" == typeof o) ? null : (o && o.__k) || r.__k),
        (s = []),
        (l = []),
        M(
          r,
          (n = ((!i && o) || r).__k = _(b, null, [n])),
          a || u,
          u,
          void 0 !== r.ownerSVGElement,
          !i && o ? [o] : a ? null : r.firstChild ? e.call(r.childNodes) : null,
          s,
          !i && o ? o : a ? a.__e : r.firstChild,
          i,
          l
        ),
        O(s, n, l);
    }
    function D(t, n, r) {
      var o,
        i,
        a,
        s,
        l = f({}, t.props);
      for (a in (t.type && t.type.defaultProps && (s = t.type.defaultProps), n))
        "key" == a
          ? (o = n[a])
          : "ref" == a
          ? (i = n[a])
          : (l[a] = void 0 === n[a] && void 0 !== s ? s[a] : n[a]);
      return (
        arguments.length > 2 &&
          (l.children = arguments.length > 3 ? e.call(arguments, 2) : r),
        h(t.type, l, o || t.key, i || t.ref, null)
      );
    }
    (e = p.slice),
      (t = {
        __e: function (e, t, n, r) {
          for (var o, i, a; (t = t.__); )
            if ((o = t.__c) && !o.__)
              try {
                if (
                  ((i = o.constructor) &&
                    null != i.getDerivedStateFromError &&
                    (o.setState(i.getDerivedStateFromError(e)), (a = o.__d)),
                  null != o.componentDidCatch &&
                    (o.componentDidCatch(e, r || {}), (a = o.__d)),
                  a)
                )
                  return (o.__E = o);
              } catch (t) {
                e = t;
              }
          throw e;
        },
      }),
      (o = 0),
      (x.prototype.setState = function (e, t) {
        var n;
        (n =
          null != this.__s && this.__s !== this.state
            ? this.__s
            : (this.__s = f({}, this.state))),
          "function" == typeof e && (e = e(f({}, n), this.props)),
          e && f(n, e),
          null != e && this.__v && (t && this._sb.push(t), A(this));
      }),
      (x.prototype.forceUpdate = function (e) {
        this.__v && ((this.__e = !0), e && this.__h.push(e), A(this));
      }),
      (x.prototype.render = b),
      (i = []),
      (s =
        "function" == typeof Promise
          ? Promise.prototype.then.bind(Promise.resolve())
          : setTimeout),
      (l = function (e, t) {
        return e.__v.__b - t.__v.__b;
      }),
      (w.__r = 0),
      (c = 0);
    var F,
      z,
      R,
      W,
      V = 0,
      G = [],
      q = [],
      Z = t.__b,
      K = t.__r,
      Y = t.diffed,
      J = t.__c,
      X = t.unmount;
    function Q(e, n) {
      t.__h && t.__h(z, e, V || n), (V = 0);
      var r = z.__H || (z.__H = { __: [], __h: [] });
      return e >= r.__.length && r.__.push({ __V: q }), r.__[e];
    }
    function ee(e) {
      return (
        (V = 1),
        (function (e, t, n) {
          var r = Q(F++, 2);
          if (
            ((r.t = e),
            !r.__c &&
              ((r.__ = [
                n ? n(t) : ce(void 0, t),
                function (e) {
                  var t = r.__N ? r.__N[0] : r.__[0],
                    n = r.t(t, e);
                  t !== n && ((r.__N = [n, r.__[1]]), r.__c.setState({}));
                },
              ]),
              (r.__c = z),
              !z.u))
          ) {
            var o = function (e, t, n) {
              if (!r.__c.__H) return !0;
              var o = r.__c.__H.__.filter(function (e) {
                return e.__c;
              });
              if (
                o.every(function (e) {
                  return !e.__N;
                })
              )
                return !i || i.call(this, e, t, n);
              var a = !1;
              return (
                o.forEach(function (e) {
                  if (e.__N) {
                    var t = e.__[0];
                    (e.__ = e.__N), (e.__N = void 0), t !== e.__[0] && (a = !0);
                  }
                }),
                !(!a && r.__c.props === e) && (!i || i.call(this, e, t, n))
              );
            };
            z.u = !0;
            var i = z.shouldComponentUpdate,
              a = z.componentWillUpdate;
            (z.componentWillUpdate = function (e, t, n) {
              if (this.__e) {
                var r = i;
                (i = void 0), o(e, t, n), (i = r);
              }
              a && a.call(this, e, t, n);
            }),
              (z.shouldComponentUpdate = o);
          }
          return r.__N || r.__;
        })(ce, e)
      );
    }
    function te(e, n) {
      var r = Q(F++, 3);
      !t.__s && le(r.__H, n) && ((r.__ = e), (r.i = n), z.__H.__h.push(r));
    }
    function ne(e, t) {
      var n = Q(F++, 7);
      return le(n.__H, t)
        ? ((n.__V = e()), (n.i = t), (n.__h = e), n.__V)
        : n.__;
    }
    function re() {
      for (var e; (e = G.shift()); )
        if (e.__P && e.__H)
          try {
            e.__H.__h.forEach(ae), e.__H.__h.forEach(se), (e.__H.__h = []);
          } catch (n) {
            (e.__H.__h = []), t.__e(n, e.__v);
          }
    }
    (t.__b = function (e) {
      (z = null), Z && Z(e);
    }),
      (t.__r = function (e) {
        K && K(e), (F = 0);
        var t = (z = e.__c).__H;
        t &&
          (R === z
            ? ((t.__h = []),
              (z.__h = []),
              t.__.forEach(function (e) {
                e.__N && (e.__ = e.__N), (e.__V = q), (e.__N = e.i = void 0);
              }))
            : (t.__h.forEach(ae), t.__h.forEach(se), (t.__h = []), (F = 0))),
          (R = z);
      }),
      (t.diffed = function (e) {
        Y && Y(e);
        var n = e.__c;
        n &&
          n.__H &&
          (n.__H.__h.length &&
            ((1 !== G.push(n) && W === t.requestAnimationFrame) ||
              ((W = t.requestAnimationFrame) || ie)(re)),
          n.__H.__.forEach(function (e) {
            e.i && (e.__H = e.i),
              e.__V !== q && (e.__ = e.__V),
              (e.i = void 0),
              (e.__V = q);
          })),
          (R = z = null);
      }),
      (t.__c = function (e, n) {
        n.some(function (e) {
          try {
            e.__h.forEach(ae),
              (e.__h = e.__h.filter(function (e) {
                return !e.__ || se(e);
              }));
          } catch (r) {
            n.some(function (e) {
              e.__h && (e.__h = []);
            }),
              (n = []),
              t.__e(r, e.__v);
          }
        }),
          J && J(e, n);
      }),
      (t.unmount = function (e) {
        X && X(e);
        var n,
          r = e.__c;
        r &&
          r.__H &&
          (r.__H.__.forEach(function (e) {
            try {
              ae(e);
            } catch (e) {
              n = e;
            }
          }),
          (r.__H = void 0),
          n && t.__e(n, r.__v));
      });
    var oe = "function" == typeof requestAnimationFrame;
    function ie(e) {
      var t,
        n = function () {
          clearTimeout(r), oe && cancelAnimationFrame(t), setTimeout(e);
        },
        r = setTimeout(n, 100);
      oe && (t = requestAnimationFrame(n));
    }
    function ae(e) {
      var t = z,
        n = e.__c;
      "function" == typeof n && ((e.__c = void 0), n()), (z = t);
    }
    function se(e) {
      var t = z;
      (e.__c = e.__()), (z = t);
    }
    function le(e, t) {
      return (
        !e ||
        e.length !== t.length ||
        t.some(function (t, n) {
          return t !== e[n];
        })
      );
    }
    function ce(e, t) {
      return "function" == typeof t ? t(e) : t;
    }
    var ue = {};
    function pe(e, t) {
      for (var n in t) e[n] = t[n];
      return e;
    }
    function me(e, t, n) {
      var r,
        o = /(?:\?([^#]*))?(#.*)?$/,
        i = e.match(o),
        a = {};
      if (i && i[1])
        for (var s = i[1].split("&"), l = 0; l < s.length; l++) {
          var c = s[l].split("=");
          a[decodeURIComponent(c[0])] = decodeURIComponent(
            c.slice(1).join("=")
          );
        }
      (e = ge(e.replace(o, ""))), (t = ge(t || ""));
      for (var u = Math.max(e.length, t.length), p = 0; p < u; p++)
        if (t[p] && ":" === t[p].charAt(0)) {
          var m = t[p].replace(/(^:|[+*?]+$)/g, ""),
            d = (t[p].match(/[+*?]+$/) || ue)[0] || "",
            f = ~d.indexOf("+"),
            g = ~d.indexOf("*"),
            _ = e[p] || "";
          if (!_ && !g && (d.indexOf("?") < 0 || f)) {
            r = !1;
            break;
          }
          if (((a[m] = decodeURIComponent(_)), f || g)) {
            a[m] = e.slice(p).map(decodeURIComponent).join("/");
            break;
          }
        } else if (t[p] !== e[p]) {
          r = !1;
          break;
        }
      return (!0 === n.default || !1 !== r) && a;
    }
    function de(e, t) {
      return e.rank < t.rank ? 1 : e.rank > t.rank ? -1 : e.index - t.index;
    }
    function fe(e, t) {
      return (
        (e.index = t),
        (e.rank = (function (e) {
          return e.props.default ? 0 : ge(e.props.path).map(_e).join("");
        })(e)),
        e.props
      );
    }
    function ge(e) {
      return e.replace(/(^\/+|\/+$)/g, "").split("/");
    }
    function _e(e) {
      return ":" == e.charAt(0)
        ? 1 + "*+?".indexOf(e.charAt(e.length - 1)) || 4
        : 5;
    }
    var he = {},
      be = [],
      xe = [],
      ye = null,
      ve = { url: we() },
      Ae = (function (e, t) {
        var n = {
          __c: (t = "__cC" + c++),
          __: e,
          Consumer: function (e, t) {
            return e.children(t);
          },
          Provider: function (e) {
            var n, r;
            return (
              this.getChildContext ||
                ((n = []),
                ((r = {})[t] = this),
                (this.getChildContext = function () {
                  return r;
                }),
                (this.shouldComponentUpdate = function (e) {
                  this.props.value !== e.value &&
                    n.some(function (e) {
                      (e.__e = !0), A(e);
                    });
                }),
                (this.sub = function (e) {
                  n.push(e);
                  var t = e.componentWillUnmount;
                  e.componentWillUnmount = function () {
                    n.splice(n.indexOf(e), 1), t && t.call(e);
                  };
                })),
              e.children
            );
          },
        };
        return (n.Provider.__ = n.Consumer.contextType = n);
      })(ve);
    function we() {
      var e;
      return (
        "" +
        ((e =
          ye && ye.location
            ? ye.location
            : ye && ye.getCurrentLocation
            ? ye.getCurrentLocation()
            : "undefined" != typeof location
            ? location
            : he).pathname || "") +
        (e.search || "")
      );
    }
    function ke(e, t) {
      return (
        void 0 === t && (t = !1),
        "string" != typeof e && e.url && ((t = e.replace), (e = e.url)),
        (function (e) {
          for (var t = be.length; t--; ) if (be[t].canRoute(e)) return !0;
          return !1;
        })(e) &&
          (function (e, t) {
            void 0 === t && (t = "push"),
              ye && ye[t]
                ? ye[t](e)
                : "undefined" != typeof history &&
                  history[t + "State"] &&
                  history[t + "State"](null, null, e);
          })(e, t ? "replace" : "push"),
        Se(e)
      );
    }
    function Se(e) {
      for (var t = !1, n = 0; n < be.length; n++) be[n].routeTo(e) && (t = !0);
      return t;
    }
    function Pe(e) {
      if (e && e.getAttribute) {
        var t = e.getAttribute("href"),
          n = e.getAttribute("target");
        if (t && t.match(/^\//g) && (!n || n.match(/^_?self$/i))) return ke(t);
      }
    }
    function Ce(e) {
      return (
        e.stopImmediatePropagation && e.stopImmediatePropagation(),
        e.stopPropagation && e.stopPropagation(),
        e.preventDefault(),
        !1
      );
    }
    function Te(e) {
      if (!(e.ctrlKey || e.metaKey || e.altKey || e.shiftKey || e.button)) {
        var t = e.target;
        do {
          if ("a" === t.localName && t.getAttribute("href")) {
            if (t.hasAttribute("data-native") || t.hasAttribute("native"))
              return;
            if (Pe(t)) return Ce(e);
          }
        } while ((t = t.parentNode));
      }
    }
    var Ne = !1;
    function Ee(e) {
      e.history && (ye = e.history), (this.state = { url: e.url || we() });
    }
    pe((Ee.prototype = new x()), {
      shouldComponentUpdate: function (e) {
        return (
          !0 !== e.static ||
          e.url !== this.props.url ||
          e.onChange !== this.props.onChange
        );
      },
      canRoute: function (e) {
        var t = C(this.props.children);
        return void 0 !== this.g(t, e);
      },
      routeTo: function (e) {
        this.setState({ url: e });
        var t = this.canRoute(e);
        return this.p || this.forceUpdate(), t;
      },
      componentWillMount: function () {
        this.p = !0;
      },
      componentDidMount: function () {
        var e = this;
        Ne ||
          ((Ne = !0),
          ye ||
            addEventListener("popstate", function () {
              Se(we());
            }),
          addEventListener("click", Te)),
          be.push(this),
          ye &&
            (this.u = ye.listen(function (t) {
              var n = t.location || t;
              e.routeTo("" + (n.pathname || "") + (n.search || ""));
            })),
          (this.p = !1);
      },
      componentWillUnmount: function () {
        "function" == typeof this.u && this.u(), be.splice(be.indexOf(this), 1);
      },
      componentWillUpdate: function () {
        this.p = !0;
      },
      componentDidUpdate: function () {
        this.p = !1;
      },
      g: function (e, t) {
        e = e.filter(fe).sort(de);
        for (var n = 0; n < e.length; n++) {
          var r = e[n],
            o = me(t, r.props.path, r.props);
          if (o) return [r, o];
        }
      },
      render: function (e, t) {
        var n,
          r,
          o = e.onChange,
          i = t.url,
          a = this.c,
          s = this.g(C(e.children), i);
        if (
          (s &&
            (r = D(
              s[0],
              pe(pe({ url: i, matches: (n = s[1]) }, n), {
                key: void 0,
                ref: void 0,
              })
            )),
          i !== (a && a.url))
        ) {
          pe(
            ve,
            (a = this.c =
              {
                url: i,
                previous: a && a.url,
                current: r,
                path: r ? r.props.path : null,
                matches: n,
              })
          ),
            (a.router = this),
            (a.active = r ? [r] : []);
          for (var l = xe.length; l--; ) xe[l]({});
          "function" == typeof o && o(a);
        }
        return _(Ae.Provider, { value: a }, r);
      },
    });
    var je = {
        displayOutline: !0,
        toggleAll: !1,
        hideHelpBtn: !1,
        bolderTextInDark: !1,
        smallText: !1,
        fullWidth: !1,
        hideComments: !1,
        hideBacklinks: !1,
        scrollTopBtn: !1,
        hideSlashMenuAfterSpace: !1,
        disableSlashMenu: !1,
        leftAlignMedia: !1,
        hideNotification: !1,
        showHoverText: !1,
        hideHiddenColumns: !1,
        disablePopupOnURLPaste: !1,
        addMoreHeightToPage: !1,
        spellcheckForCode: !1,
        codeLineNumbers: !1,
        openFullPage: !1,
        narrowListItems: !1,
        indentationLines: !1,
        rollupUrlClickable: !1,
        borderOnImages: !1,
        disableSlashCommandPlaceholder: !1,
        disableAiAfterSpaceKey: !1,
      },
      Le = "$69",
      Me = "$99",
      Oe = "Unlocked! Thank you for supporting developer :)",
      Ie =
        "Please upgrade to use all 'pro' features. One-time payment of ".concat(
          Le,
          " for lifetime access! Click to learn more."
        ),
      $e = [
        {
          func: "displayOutline",
          name: "Show Outline",
          desc: "Show sticky outline (table of contents) for pages that have headings",
          pf: !1,
        },
        {
          func: "toggleAll",
          name: "Open Toggles",
          desc: "Open all toggles and toggle headings in the page",
          pf: !1,
        },
        {
          func: "fullWidth",
          name: "Full width for all pages",
          desc: "Set full width for all pages by default",
          pf: !1,
        },
        {
          func: "smallText",
          name: "Small text for all pages",
          desc: "Set small text for all pages by default",
          pf: !1,
        },
        {
          func: "disableAiAfterSpaceKey",
          name: "Disable AI menu when pressing space",
          desc: "Don't show AI command menu when pressing space key",
          disable_func: "disableAiAfterSpaceKey",
          pf: !1,
        },
        {
          func: "openFullPage",
          name: "Open full page instead of preview",
          desc: "Bypass preview and open full page of table, board, etc",
          pf: !1,
        },
        {
          func: "rollupUrlClickable",
          name: "Make Rollup URLs clickable",
          desc: "Make URLs in Rollup property clickable",
          pf: !0,
        },
        {
          func: "scrollTopBtn",
          name: "'Scroll to top' button",
          desc: "Add button at bottom-right corner for scrolling back to top",
          pf: !1,
        },
        {
          func: "hideSlashMenuAfterSpace",
          name: "Close slash command menu after space",
          desc: "Close slash command popup menu '/' by pressing space key",
          disable_func: "disableSlashMenu",
          pf: !1,
        },
        {
          func: "disableSlashMenu",
          name: "Don't show slash command menu when pressing '/'",
          desc: "Don't show slash command popup menu when pressing '/'",
          disable_func: "hideSlashMenuAfterSpace",
          pf: !1,
        },
        {
          func: "showHoverText",
          name: "Show full text on hover",
          desc: "Show full text in table cells on mouse hover",
          pf: !1,
        },
        {
          func: "codeLineNumbers",
          name: "Show code line numbers",
          desc: "Show line numbers for code blocks",
          pf: !1,
        },
        {
          func: "spellcheckForCode",
          name: "Enable spellcheck inside code blocks",
          desc: "Show squiggly red lines for any spelling mistakes inside code blocks",
          pf: !1,
        },
        {
          func: "disablePopupOnURLPaste",
          name: "Don't show popup menu when pasting external links",
          desc: "Don't show popup menu (i.e. dismiss, create bookmark, create embed) when pasting external URLs",
          pf: !1,
        },
        {
          func: "leftAlignMedia",
          name: "Left align media",
          desc: "Align document images and videos to the left instead of center",
          pf: !1,
        },
        {
          func: "addMoreHeightToPage",
          name: "Add more height to page",
          desc: "Add more height to page by hiding top padding, image cover, & icon",
          pf: !0,
        },
        {
          func: "hideNotification",
          name: "Hide notification icon",
          desc: "Hide red notification icon from sidebar when it's in closed state and hide notification number from tab title",
          pf: !0,
        },
        {
          func: "hideHelpBtn",
          name: "Hide Help button from pages",
          desc: "",
          pf: !1,
        },
        {
          func: "narrowListItems",
          name: "Narrow spacing between items",
          desc: "Fit more content on screen by reducing space between items i.e. headings, lists, etc.",
          pf: !0,
        },
        {
          func: "indentationLines",
          name: "Add indentation lines to lists",
          desc: "Add vertical indentation lines to bullet and to-do lists",
          pf: !1,
        },
        {
          func: "bolderTextInDark",
          name: "Bolder text in dark mode",
          desc: "Fix poorly recognizable bold text in dark mode",
          pf: !1,
        },
        {
          func: "hideHiddenColumns",
          name: "Hide 'Hidden columns' in board view",
          desc: "Truly hide 'Hidden columns' in Kanban board view",
          pf: !1,
        },
        {
          func: "hideComments",
          name: "Hide comments section from all pages",
          desc: "",
          pf: !1,
        },
        {
          func: "hideBacklinks",
          name: "Hide backlinks section from all pages",
          desc: "",
          pf: !1,
        },
        {
          func: "borderOnImages",
          name: "Add frame to images",
          desc: "Add frame around images to make them easily noticeable on page",
          pf: !0,
        },
        {
          func: "disableSlashCommandPlaceholder",
          name: "Hide slash command placeholder",
          desc: "Hide placeholder: Press '/' for commands…",
          pf: !0,
        },
      ];
    function Ue(e) {
      return (
        (Ue =
          "function" == typeof Symbol && "symbol" == typeof Symbol.iterator
            ? function (e) {
                return typeof e;
              }
            : function (e) {
                return e &&
                  "function" == typeof Symbol &&
                  e.constructor === Symbol &&
                  e !== Symbol.prototype
                  ? "symbol"
                  : typeof e;
              }),
        Ue(e)
      );
    }
    function He(e, t) {
      var n = Object.keys(e);
      if (Object.getOwnPropertySymbols) {
        var r = Object.getOwnPropertySymbols(e);
        t &&
          (r = r.filter(function (t) {
            return Object.getOwnPropertyDescriptor(e, t).enumerable;
          })),
          n.push.apply(n, r);
      }
      return n;
    }
    function Be(e, t, n) {
      return (
        (t = (function (e) {
          var t = (function (e, t) {
            if ("object" != Ue(e) || !e) return e;
            var n = e[Symbol.toPrimitive];
            if (void 0 !== n) {
              var r = n.call(e, t || "default");
              if ("object" != Ue(r)) return r;
              throw new TypeError(
                "@@toPrimitive must return a primitive value."
              );
            }
            return ("string" === t ? String : Number)(e);
          })(e, "string");
          return "symbol" == Ue(t) ? t : String(t);
        })(t)),
        t in e
          ? Object.defineProperty(e, t, {
              value: n,
              enumerable: !0,
              configurable: !0,
              writable: !0,
            })
          : (e[t] = n),
        e
      );
    }
    function De(e) {
      return document.querySelector(e);
    }
    function Fe(e) {
      return !1 !== e && !0 !== e && (!e || 0 === Object.keys(e).length);
    }
    function ze() {
      var e = new Promise(function (e, t) {
        try {
          var n = (function (e) {
            for (var t = 1; t < arguments.length; t++) {
              var n = null != arguments[t] ? arguments[t] : {};
              t % 2
                ? He(Object(n), !0).forEach(function (t) {
                    Be(e, t, n[t]);
                  })
                : Object.getOwnPropertyDescriptors
                ? Object.defineProperties(
                    e,
                    Object.getOwnPropertyDescriptors(n)
                  )
                : He(Object(n)).forEach(function (t) {
                    Object.defineProperty(
                      e,
                      t,
                      Object.getOwnPropertyDescriptor(n, t)
                    );
                  });
            }
            return e;
          })({}, je);
          chrome.storage.sync.get(["nb_settings"], function (t) {
            var r = t.nb_settings;
            if (!Fe(r))
              for (var o = 0, i = Object.keys(je); o < i.length; o++) {
                var a = i[o];
                Fe(r[a]) || (n[a] = r[a]);
              }
            e(n);
          });
        } catch (e) {
          t(Error("some issue... promise rejected"));
        }
      });
      return e;
    }
    function Re() {
      window.location.replace("/popup.html");
    }
    function We(e) {
      var t = e.txtS,
        n = e.url,
        r = e.urlTxt,
        o = e.txtE;
      return _(
        "div",
        {
          style: {
            width: "100%",
            fontSize: "13px",
            marginTop: "8px",
            marginBottom: "8px",
          },
        },
        _(
          "div",
          {
            style: {
              display: "flex",
              alignItems: "flex-start",
              width: "100%",
              paddingLeft: "2px",
              color: "inherit",
              fill: "inherit",
            },
          },
          _(
            "div",
            {
              style: {
                marginRight: "2px",
                width: "24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexGrow: 0,
                flexShrink: 0,
              },
            },
            _(
              "div",
              {
                style: {
                  fontSize: "1.5em",
                  lineHeight: 1,
                  marginBottom: "0.1em",
                },
              },
              "•"
            )
          ),
          _(
            "div",
            {
              style: {
                flex: "1 1 0px",
                minWidth: "1px",
                display: "flex",
                flexDirection: "column",
              },
            },
            _(
              "div",
              { style: { display: "flex" } },
              _(
                "div",
                {
                  placeholder: "List",
                  "data-root": "true",
                  className: "notranslate",
                  style: {
                    maxWidth: "100%",
                    width: "100%",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    caretColor: "rgb(55, 53, 47)",
                    padding: "3px 2px",
                    textAlign: "left",
                  },
                },
                t,
                n &&
                  _(
                    "a",
                    {
                      target: "_blank",
                      className: "external-link",
                      rel: "noopener",
                      href: n,
                      title: n,
                    },
                    r
                  ),
                o,
                " "
              )
            )
          )
        )
      );
    }
    function Ve() {
      return _(
        "div",
        null,
        _(
          "div",
          {
            className: "back button",
            role: "button",
            onClick: Re,
            tabIndex: 0,
          },
          _("span", { className: "arrow" })
        ),
        _(
          "div",
          {
            className: "title",
            style: { display: "flex", marginBottom: "3px" },
          },
          _("span", { className: "icon-nb" }),
          "Notion Boost"
        ),
        _(
          "div",
          { className: "sub-title underline" },
          "Make Notion more productive and less distractive"
        ),
        _(We, {
          txtS: "Visit ",
          txtE: "",
          urlTxt: "Homepage",
          url: "https://gourav.io/notion-boost",
        }),
        _(We, {
          txtE: "",
          txtS: "Missing something? ",
          urlTxt: "suggest / feedback",
          url: "https://github.com/GorvGoyl/Notion-Boost-browser-extension/issues",
        }),
        _(We, {
          txtE: "",
          txtS: "Made by ",
          urlTxt: _(b, null, "Gourav Goyal"),
          url: "https://gourav.io",
        }),
        _(We, {
          txtE: "",
          url: "",
          urlTxt: "",
          txtS: "Version: ".concat(chrome.runtime.getManifest().version),
        })
      );
    }
    var Ge = n(40),
      qe = n.n(Ge),
      Ze = n(948),
      Ke = n.n(Ze),
      Ye = n(178),
      Je = n.n(Ye),
      Xe = n(304),
      Qe = n.n(Xe),
      et = n(663),
      tt = n.n(et),
      nt = n(92),
      rt = n.n(nt),
      ot = n(755),
      it = {};
    (it.styleTagTransform = rt()),
      (it.setAttributes = Qe()),
      (it.insert = Je().bind(null, "head")),
      (it.domAPI = Ke()),
      (it.insertStyleElement = tt());
    qe()(ot.Z, it);
    ot.Z && ot.Z.locals && ot.Z.locals;
    var at = {
      link: {
        textDecoration: "underline",
        color: "#37352f80",
        lineHeight: "1.2",
        fontSize: "13px",
        cursor: "pointer",
      },
      smallGreyText: {
        color: "#37352f80",
        lineHeight: "1.2",
        fontSize: "12px",
      },
    };
    function st(e) {
      return (
        (function (e) {
          if (Array.isArray(e)) return ut(e);
        })(e) ||
        (function (e) {
          if (
            ("undefined" != typeof Symbol && null != e[Symbol.iterator]) ||
            null != e["@@iterator"]
          )
            return Array.from(e);
        })(e) ||
        ct(e) ||
        (function () {
          throw new TypeError(
            "Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."
          );
        })()
      );
    }
    function lt(e, t) {
      return (
        (function (e) {
          if (Array.isArray(e)) return e;
        })(e) ||
        (function (e, t) {
          var n =
            null == e
              ? null
              : ("undefined" != typeof Symbol && e[Symbol.iterator]) ||
                e["@@iterator"];
          if (null != n) {
            var r,
              o,
              i,
              a,
              s = [],
              l = !0,
              c = !1;
            try {
              if (((i = (n = n.call(e)).next), 0 === t)) {
                if (Object(n) !== n) return;
                l = !1;
              } else
                for (
                  ;
                  !(l = (r = i.call(n)).done) &&
                  (s.push(r.value), s.length !== t);
                  l = !0
                );
            } catch (e) {
              (c = !0), (o = e);
            } finally {
              try {
                if (
                  !l &&
                  null != n.return &&
                  ((a = n.return()), Object(a) !== a)
                )
                  return;
              } finally {
                if (c) throw o;
              }
            }
            return s;
          }
        })(e, t) ||
        ct(e, t) ||
        (function () {
          throw new TypeError(
            "Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."
          );
        })()
      );
    }
    function ct(e, t) {
      if (e) {
        if ("string" == typeof e) return ut(e, t);
        var n = Object.prototype.toString.call(e).slice(8, -1);
        return (
          "Object" === n && e.constructor && (n = e.constructor.name),
          "Map" === n || "Set" === n
            ? Array.from(e)
            : "Arguments" === n ||
              /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)
            ? ut(e, t)
            : void 0
        );
      }
    }
    function ut(e, t) {
      (null == t || t > e.length) && (t = e.length);
      for (var n = 0, r = new Array(t); n < t; n++) r[n] = e[n];
      return r;
    }
    function pt(e) {
      var t = true,
        n = lt(ee(""), 2),
        r = n[0],
        o = n[1],
        i = lt(ee($e), 2),
        a = i[0],
        s = i[1];
      te(function () {
        l();
      }, []);
      var l = function () {
          var e = st($e);
          ze()
            .then(function (t) {
              return (
                e.forEach(function (e) {
                  e.status = t[e.func] ? "enable" : "disable";
                }),
                s(st(e)),
                null
              );
            })
            .catch(function (e) {});
        },
        c = (function (e, t) {
          return (
            (V = 8),
            ne(function () {
              return e;
            }, t)
          );
        })(
          function (e) {
            if (!e.pf || t) {
              var n = e.func,
                r = e.disable_func,
                o = !1;
              o = "enable" !== e.status;
              try {
                ze()
                  .then(function (e) {
                    return (
                      (e[n] = o),
                      (e.call_func = { name: n, arg: o }),
                      r &&
                        (function (e) {
                          var t = De("[data-func=".concat(e, "]"));
                          return !(!t || !t.classList.contains("enable"));
                        })(r) &&
                        o &&
                        (e[r] = !1),
                      chrome.storage.sync.set({ nb_settings: e }, function () {
                        l();
                      }),
                      null
                    );
                  })
                  .catch(function (e) {});
              } catch (e) {}
            } else ke("/payment", !0);
          },
          [t]
        ),
        u = a.filter(function (e) {
          return (
            e.name.toLocaleLowerCase().includes(r) ||
            e.desc.toLocaleLowerCase().includes(r)
          );
        }),
        p = r ? u : a;
      return _(
        b,
        null,
        _("input", {
          className: "settings search",
          type: "text",
          autoFocus: !0,
          value: r,
          placeholder: "Search feature...",
          onInput: function (e) {
            o(e.target.value.toLocaleLowerCase());
          },
        }),
        _(
          "div",
          { className: "settings table" },
          !u.length &&
            _("div", { className: "no-setting" }, "No setting found"),
          p.map(function (e, n) {
            return _(
              b,
              { key: e.func },
              _(
                "div",
                {
                  className: "row ".concat(e.status),
                  "data-func": e.func,
                  "data-disable_func": e.disable_func,
                  title: e.pf ? (t ? "" : Ie) : "",
                  onClick: function () {
                    return c(e);
                  },
                },
                _(
                  "div",
                  { className: "text-wrapper" },
                  _("div", { className: "name" }, e.name),
                  e.pf &&
                    _(
                      "div",
                      {
                        className: "pro small",
                        role: "button",
                        title: t ? Oe : Ie,
                        "aria-disabled": "false",
                      },
                      _("div", null, "Pro")
                    ),
                  e.desc && _("div", { className: "desc" }, e.desc)
                ),
                _(
                  "div",
                  {
                    className: "button toggle",
                    role: "button",
                    "aria-disabled": "false",
                    tabIndex: 0,
                  },
                  _(
                    "div",
                    { className: "knob" },
                    _("div", { className: "pos" })
                  )
                )
              ),
              n === $e.length - 1
                ? _("div", { className: "divider last" })
                : _(
                    "div",
                    { className: "divider" },
                    _("div", { className: "border" })
                  )
            );
          })
        )
      );
    }
    function mt() {
      window.location.replace("/popup.html");
    }
    function dt() {
      return _(
        "div",
        null,
        _(
          "div",
          {
            className: "back button",
            role: "button",
            onClick: mt,
            tabIndex: 0,
          },
          _("span", { className: "arrow" })
        ),
        _(
          "div",
          {
            className: "title",
            style: { display: "flex", marginBottom: "3px" },
          },
          _("span", { className: "icon-nb" }),
          "Notion Boost"
        )
      );
    }
    function ft() {
      return _(
        "svg",
        {
          fill: "inherit",
          className: "thinCheck",
          color: "#37352F",
          viewBox: "0 0 16 16",
          style: {
            width: 12,
            height: 12,
            WebkitFlexShrink: "0",
            flexShrink: "0",
            backfaceVisibility: "hidden",
          },
        },
        _("path", {
          d: "M6.385 14.162c.362 0 .642-.15.84-.444L13.652 3.71c.144-.226.205-.417.205-.602 0-.485-.341-.82-.833-.82-.335 0-.54.123-.746.444l-5.926 9.4L3.31 8.229c-.205-.267-.417-.376-.718-.376-.492 0-.848.348-.848.827 0 .212.075.417.253.629l3.541 4.416c.24.3.492.437.848.437z",
        })
      );
    }
    function gt(e, t) {
      return (
        (function (e) {
          if (Array.isArray(e)) return e;
        })(e) ||
        (function (e, t) {
          var n =
            null == e
              ? null
              : ("undefined" != typeof Symbol && e[Symbol.iterator]) ||
                e["@@iterator"];
          if (null != n) {
            var r,
              o,
              i,
              a,
              s = [],
              l = !0,
              c = !1;
            try {
              if (((i = (n = n.call(e)).next), 0 === t)) {
                if (Object(n) !== n) return;
                l = !1;
              } else
                for (
                  ;
                  !(l = (r = i.call(n)).done) &&
                  (s.push(r.value), s.length !== t);
                  l = !0
                );
            } catch (e) {
              (c = !0), (o = e);
            } finally {
              try {
                if (
                  !l &&
                  null != n.return &&
                  ((a = n.return()), Object(a) !== a)
                )
                  return;
              } finally {
                if (c) throw o;
              }
            }
            return s;
          }
        })(e, t) ||
        (function (e, t) {
          if (!e) return;
          if ("string" == typeof e) return _t(e, t);
          var n = Object.prototype.toString.call(e).slice(8, -1);
          "Object" === n && e.constructor && (n = e.constructor.name);
          if ("Map" === n || "Set" === n) return Array.from(e);
          if (
            "Arguments" === n ||
            /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)
          )
            return _t(e, t);
        })(e, t) ||
        (function () {
          throw new TypeError(
            "Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."
          );
        })()
      );
    }
    function _t(e, t) {
      (null == t || t > e.length) && (t = e.length);
      for (var n = 0, r = new Array(t); n < t; n++) r[n] = e[n];
      return r;
    }
    var ht = (0, n(515).Z)("notion-boost");
    function bt() {
      var e = gt(ee(!1), 2),
        t = e[0],
        n = e[1];
      function r(e) {
        chrome.storage.sync.set({ nb_settings_pd: e }, function () {}), n(e);
      }
      return (
        te(function () {
          ht.onPaid.addListener(function (e) {
            r(!0), ke("/popup", !0);
          });
        }, []),
        ht
          .getUser()
          .then(function (e) {
            return r(e.paid), !0;
          })
          .catch(function (e) {}),
        chrome.storage.sync.get(["nb_settings_pd"], function (e) {
          try {
            !0 === e.nb_settings_pd && n(!0);
          } catch (e) {}
        }),
        _(
          "div",
          null,
          _(
            "div",
            { className: "wrapper" },
            _(
              "div",
              { className: "title underline" },
              "Notion Boost",
              " ",
              _(
                "div",
                {
                  className: "pro big",
                  role: "button",
                  title: Ie,
                  "aria-disabled": "false",
                  tabIndex: 0,
                },
                _(
                  "div",
                  {
                    role: "button",
                    title: t ? Oe : Ie,
                    "aria-disabled": "false",
                    tabIndex: 0,
                    onClick: function () {
                    //   t ? xt() : ke("/payment", !0);
                      return;
                    },
                  },
                  "Pro ",
                  _(t ? At : yt, null)
                )
              )
            ),
            _(pt, { isPaid: t }),
            _(
              "div",
              { className: "footer topline" },
              _(
                "a",
                {
                  className: "footer-item",
                  href: "https://gourav.io/notion-boost#-currently-added-features",
                  target: "_blank",
                },
                _(
                  "div",
                  { className: "button", role: "button", tabIndex: 0 },
                  "Features info ",
                  _(vt, null)
                )
              ),
              _(
                "a",
                { className: "footer-item", href: "/about" },
                _(
                  "div",
                  { className: "button", role: "button", tabIndex: 0 },
                  "About"
                )
              )
            ),
            _(
              "div",
              {
                style: {
                  paddingTop: "10px",
                  borderTop: "1px solid rgb(55 53 47 / 10%)",
                  marginTop: "10px",
                },
              },
              _(
                "a",
                {
                  style: at.link,
                  href: "https://chatgptwriter.ai?ref=notionboost",
                  target: "_blank",
                  title: "ChatGPT Writer",
                },
                "ChatGPT Writer"
              ),
              _(
                "span",
                { style: at.smallGreyText },
                " ",
                "- Let AI write emails and messages for you"
              )
            )
          )
        )
      );
    }
    function xt() {
      try {
        ht.openPaymentPage();
      } catch (e) {}
    }
    function yt() {
      return _(
        "svg",
        {
          xmlns: "http://www.w3.org/2000/svg",
          width: "10",
          height: "10",
          x: "0",
          y: "0",
          fill: "currentColor",
          version: "1.1",
          viewBox: "0 0 401.998 401.998",
          xmlSpace: "preserve",
        },
        _("path", {
          d: "M357.45 190.721c-5.331-5.33-11.8-7.993-19.417-7.993h-9.131v-54.821c0-35.022-12.559-65.093-37.685-90.218C266.093 12.563 236.025 0 200.998 0c-35.026 0-65.1 12.563-90.222 37.688-25.126 25.126-37.685 55.196-37.685 90.219v54.821h-9.135c-7.611 0-14.084 2.663-19.414 7.993-5.33 5.326-7.994 11.799-7.994 19.417V374.59c0 7.611 2.665 14.086 7.994 19.417 5.33 5.325 11.803 7.991 19.414 7.991H338.04c7.617 0 14.085-2.663 19.417-7.991 5.325-5.331 7.994-11.806 7.994-19.417V210.135c.004-7.612-2.669-14.084-8.001-19.414zm-83.363-7.993H127.909v-54.821c0-20.175 7.139-37.402 21.414-51.675 14.277-14.275 31.501-21.411 51.678-21.411 20.179 0 37.399 7.135 51.677 21.411 14.271 14.272 21.409 31.5 21.409 51.675v54.821z",
        })
      );
    }
    function vt() {
      return _(
        "svg",
        {
          xmlns: "http://www.w3.org/2000/svg",
          width: "11",
          height: "11",
          style: { marginLeft: "5px" },
          fill: "currentColor",
          viewBox: "0 0 24 24",
        },
        _("path", {
          d: "M18 23H4c-1.654 0-3-1.346-3-3V6c0-1.654 1.346-3 3-3h8a1 1 0 110 2H4c-.551 0-1 .448-1 1v14c0 .552.449 1 1 1h14c.551 0 1-.448 1-1v-8a1 1 0 112 0v8c0 1.654-1.346 3-3 3z",
        }),
        _("path", {
          d: "M22 1h-6a1 1 0 00-.707 1.707L17.586 5l-7.293 7.293a.999.999 0 101.414 1.414L19 6.414l2.293 2.293A1 1 0 0023 8V2a1 1 0 00-1-1z",
        })
      );
    }
    function At() {
      return _(
        "svg",
        {
          xmlns: "http://www.w3.org/2000/svg",
          x: "0",
          y: "0",
          width: "10",
          height: "10",
          fill: "currentColor",
          version: "1.1",
          viewBox: "0 0 408.576 408.576",
          xmlSpace: "preserve",
        },
        _("path", {
          d: "M204.288 0C91.648 0 0 91.648 0 204.288s91.648 204.288 204.288 204.288 204.288-91.648 204.288-204.288S316.928 0 204.288 0zm114.176 150.528l-130.56 129.536c-7.68 7.68-19.968 8.192-28.16.512L90.624 217.6c-8.192-7.68-8.704-20.48-1.536-28.672 7.68-8.192 20.48-8.704 28.672-1.024l54.784 50.176L289.28 121.344c8.192-8.192 20.992-8.192 29.184 0s8.192 20.992 0 29.184z",
        })
      );
    }
    B(
      _(function () {
        return _(
          Ee,
          null,
          _(bt, { path: "/", default: !0 }),
          _(Ve, { path: "/about" }),
          _(dt, { path: "/payment" })
        );
      }, null),
      document.body
    );
  })();
})();
