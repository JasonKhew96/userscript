// ==UserScript==
// @name        Crunchyroll Tools
// @match       *://www.crunchyroll.com/*
// @match       *://imgsrv.crunchyroll.com/cdn-cgi/image/*
// @require     https://unpkg.com/gm-compat@1.1.0
// @require     https://cdn.jsdelivr.net/npm/@violentmonkey/dom@2
// @version     0.10
// @author      JasonKhew96
// @downloadURL https://github.com/JasonKhew96/userscript/raw/refs/heads/master/dist/crunchyroll-tools.user.js
// @grant       GM_addStyle
// @grant       unsafeWindow
// ==/UserScript==

(function (VM) {
'use strict';

function asyncGeneratorStep(n, t, e, r, o, a, c) {
  try {
    var i = n[a](c),
      u = i.value;
  } catch (n) {
    return void e(n);
  }
  i.done ? t(u) : Promise.resolve(u).then(r, o);
}
function _asyncToGenerator(n) {
  return function () {
    var t = this,
      e = arguments;
    return new Promise(function (r, o) {
      var a = n.apply(t, e);
      function _next(n) {
        asyncGeneratorStep(a, r, o, _next, _throw, "next", n);
      }
      function _throw(n) {
        asyncGeneratorStep(a, r, o, _next, _throw, "throw", n);
      }
      _next(void 0);
    });
  };
}

function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

var regeneratorRuntime$1 = {exports: {}};

var OverloadYield = {exports: {}};

var hasRequiredOverloadYield;

function requireOverloadYield () {
	if (hasRequiredOverloadYield) return OverloadYield.exports;
	hasRequiredOverloadYield = 1;
	(function (module) {
		function _OverloadYield(e, d) {
		  this.v = e, this.k = d;
		}
		module.exports = _OverloadYield, module.exports.__esModule = true, module.exports["default"] = module.exports; 
	} (OverloadYield));
	return OverloadYield.exports;
}

var regenerator$1 = {exports: {}};

var regeneratorDefine = {exports: {}};

var hasRequiredRegeneratorDefine;

function requireRegeneratorDefine () {
	if (hasRequiredRegeneratorDefine) return regeneratorDefine.exports;
	hasRequiredRegeneratorDefine = 1;
	(function (module) {
		function _regeneratorDefine(e, r, n, t) {
		  var i = Object.defineProperty;
		  try {
		    i({}, "", {});
		  } catch (e) {
		    i = 0;
		  }
		  module.exports = _regeneratorDefine = function regeneratorDefine(e, r, n, t) {
		    function o(r, n) {
		      _regeneratorDefine(e, r, function (e) {
		        return this._invoke(r, n, e);
		      });
		    }
		    r ? i ? i(e, r, {
		      value: n,
		      enumerable: !t,
		      configurable: !t,
		      writable: !t
		    }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2));
		  }, module.exports.__esModule = true, module.exports["default"] = module.exports, _regeneratorDefine(e, r, n, t);
		}
		module.exports = _regeneratorDefine, module.exports.__esModule = true, module.exports["default"] = module.exports; 
	} (regeneratorDefine));
	return regeneratorDefine.exports;
}

var hasRequiredRegenerator$1;

function requireRegenerator$1 () {
	if (hasRequiredRegenerator$1) return regenerator$1.exports;
	hasRequiredRegenerator$1 = 1;
	(function (module) {
		var regeneratorDefine = requireRegeneratorDefine();
		function _regenerator() {
		  /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */
		  var e,
		    t,
		    r = "function" == typeof Symbol ? Symbol : {},
		    n = r.iterator || "@@iterator",
		    o = r.toStringTag || "@@toStringTag";
		  function i(r, n, o, i) {
		    var c = n && n.prototype instanceof Generator ? n : Generator,
		      u = Object.create(c.prototype);
		    return regeneratorDefine(u, "_invoke", function (r, n, o) {
		      var i,
		        c,
		        u,
		        f = 0,
		        p = o || [],
		        y = false,
		        G = {
		          p: 0,
		          n: 0,
		          v: e,
		          a: d,
		          f: d.bind(e, 4),
		          d: function d(t, r) {
		            return i = t, c = 0, u = e, G.n = r, a;
		          }
		        };
		      function d(r, n) {
		        for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) {
		          var o,
		            i = p[t],
		            d = G.p,
		            l = i[2];
		          r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0));
		        }
		        if (o || r > 1) return a;
		        throw y = true, n;
		      }
		      return function (o, p, l) {
		        if (f > 1) throw TypeError("Generator is already running");
		        for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) {
		          i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u);
		          try {
		            if (f = 2, i) {
		              if (c || (o = "next"), t = i[o]) {
		                if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object");
		                if (!t.done) return t;
		                u = t.value, c < 2 && (c = 0);
		              } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1);
		              i = e;
		            } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break;
		          } catch (t) {
		            i = e, c = 1, u = t;
		          } finally {
		            f = 1;
		          }
		        }
		        return {
		          value: t,
		          done: y
		        };
		      };
		    }(r, o, i), true), u;
		  }
		  var a = {};
		  function Generator() {}
		  function GeneratorFunction() {}
		  function GeneratorFunctionPrototype() {}
		  t = Object.getPrototypeOf;
		  var c = [][n] ? t(t([][n]())) : (regeneratorDefine(t = {}, n, function () {
		      return this;
		    }), t),
		    u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c);
		  function f(e) {
		    return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, regeneratorDefine(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e;
		  }
		  return GeneratorFunction.prototype = GeneratorFunctionPrototype, regeneratorDefine(u, "constructor", GeneratorFunctionPrototype), regeneratorDefine(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", regeneratorDefine(GeneratorFunctionPrototype, o, "GeneratorFunction"), regeneratorDefine(u), regeneratorDefine(u, o, "Generator"), regeneratorDefine(u, n, function () {
		    return this;
		  }), regeneratorDefine(u, "toString", function () {
		    return "[object Generator]";
		  }), (module.exports = _regenerator = function _regenerator() {
		    return {
		      w: i,
		      m: f
		    };
		  }, module.exports.__esModule = true, module.exports["default"] = module.exports)();
		}
		module.exports = _regenerator, module.exports.__esModule = true, module.exports["default"] = module.exports; 
	} (regenerator$1));
	return regenerator$1.exports;
}

var regeneratorAsync = {exports: {}};

var regeneratorAsyncGen = {exports: {}};

var regeneratorAsyncIterator = {exports: {}};

var hasRequiredRegeneratorAsyncIterator;

function requireRegeneratorAsyncIterator () {
	if (hasRequiredRegeneratorAsyncIterator) return regeneratorAsyncIterator.exports;
	hasRequiredRegeneratorAsyncIterator = 1;
	(function (module) {
		var OverloadYield = requireOverloadYield();
		var regeneratorDefine = requireRegeneratorDefine();
		function AsyncIterator(t, e) {
		  function n(r, o, i, f) {
		    try {
		      var c = t[r](o),
		        u = c.value;
		      return u instanceof OverloadYield ? e.resolve(u.v).then(function (t) {
		        n("next", t, i, f);
		      }, function (t) {
		        n("throw", t, i, f);
		      }) : e.resolve(u).then(function (t) {
		        c.value = t, i(c);
		      }, function (t) {
		        return n("throw", t, i, f);
		      });
		    } catch (t) {
		      f(t);
		    }
		  }
		  var r;
		  this.next || (regeneratorDefine(AsyncIterator.prototype), regeneratorDefine(AsyncIterator.prototype, "function" == typeof Symbol && Symbol.asyncIterator || "@asyncIterator", function () {
		    return this;
		  })), regeneratorDefine(this, "_invoke", function (t, o, i) {
		    function f() {
		      return new e(function (e, r) {
		        n(t, i, e, r);
		      });
		    }
		    return r = r ? r.then(f, f) : f();
		  }, true);
		}
		module.exports = AsyncIterator, module.exports.__esModule = true, module.exports["default"] = module.exports; 
	} (regeneratorAsyncIterator));
	return regeneratorAsyncIterator.exports;
}

var hasRequiredRegeneratorAsyncGen;

function requireRegeneratorAsyncGen () {
	if (hasRequiredRegeneratorAsyncGen) return regeneratorAsyncGen.exports;
	hasRequiredRegeneratorAsyncGen = 1;
	(function (module) {
		var regenerator = requireRegenerator$1();
		var regeneratorAsyncIterator = requireRegeneratorAsyncIterator();
		function _regeneratorAsyncGen(r, e, t, o, n) {
		  return new regeneratorAsyncIterator(regenerator().w(r, e, t, o), n || Promise);
		}
		module.exports = _regeneratorAsyncGen, module.exports.__esModule = true, module.exports["default"] = module.exports; 
	} (regeneratorAsyncGen));
	return regeneratorAsyncGen.exports;
}

var hasRequiredRegeneratorAsync;

function requireRegeneratorAsync () {
	if (hasRequiredRegeneratorAsync) return regeneratorAsync.exports;
	hasRequiredRegeneratorAsync = 1;
	(function (module) {
		var regeneratorAsyncGen = requireRegeneratorAsyncGen();
		function _regeneratorAsync(n, e, r, t, o) {
		  var a = regeneratorAsyncGen(n, e, r, t, o);
		  return a.next().then(function (n) {
		    return n.done ? n.value : a.next();
		  });
		}
		module.exports = _regeneratorAsync, module.exports.__esModule = true, module.exports["default"] = module.exports; 
	} (regeneratorAsync));
	return regeneratorAsync.exports;
}

var regeneratorKeys = {exports: {}};

var hasRequiredRegeneratorKeys;

function requireRegeneratorKeys () {
	if (hasRequiredRegeneratorKeys) return regeneratorKeys.exports;
	hasRequiredRegeneratorKeys = 1;
	(function (module) {
		function _regeneratorKeys(e) {
		  var n = Object(e),
		    r = [];
		  for (var t in n) r.unshift(t);
		  return function e() {
		    for (; r.length;) if ((t = r.pop()) in n) return e.value = t, e.done = false, e;
		    return e.done = true, e;
		  };
		}
		module.exports = _regeneratorKeys, module.exports.__esModule = true, module.exports["default"] = module.exports; 
	} (regeneratorKeys));
	return regeneratorKeys.exports;
}

var regeneratorValues = {exports: {}};

var _typeof = {exports: {}};

var hasRequired_typeof;

function require_typeof () {
	if (hasRequired_typeof) return _typeof.exports;
	hasRequired_typeof = 1;
	(function (module) {
		function _typeof(o) {
		  "@babel/helpers - typeof";

		  return module.exports = _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
		    return typeof o;
		  } : function (o) {
		    return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
		  }, module.exports.__esModule = true, module.exports["default"] = module.exports, _typeof(o);
		}
		module.exports = _typeof, module.exports.__esModule = true, module.exports["default"] = module.exports; 
	} (_typeof));
	return _typeof.exports;
}

var hasRequiredRegeneratorValues;

function requireRegeneratorValues () {
	if (hasRequiredRegeneratorValues) return regeneratorValues.exports;
	hasRequiredRegeneratorValues = 1;
	(function (module) {
		var _typeof = require_typeof()["default"];
		function _regeneratorValues(e) {
		  if (null != e) {
		    var t = e["function" == typeof Symbol && Symbol.iterator || "@@iterator"],
		      r = 0;
		    if (t) return t.call(e);
		    if ("function" == typeof e.next) return e;
		    if (!isNaN(e.length)) return {
		      next: function next() {
		        return e && r >= e.length && (e = void 0), {
		          value: e && e[r++],
		          done: !e
		        };
		      }
		    };
		  }
		  throw new TypeError(_typeof(e) + " is not iterable");
		}
		module.exports = _regeneratorValues, module.exports.__esModule = true, module.exports["default"] = module.exports; 
	} (regeneratorValues));
	return regeneratorValues.exports;
}

var hasRequiredRegeneratorRuntime;

function requireRegeneratorRuntime () {
	if (hasRequiredRegeneratorRuntime) return regeneratorRuntime$1.exports;
	hasRequiredRegeneratorRuntime = 1;
	(function (module) {
		var OverloadYield = requireOverloadYield();
		var regenerator = requireRegenerator$1();
		var regeneratorAsync = requireRegeneratorAsync();
		var regeneratorAsyncGen = requireRegeneratorAsyncGen();
		var regeneratorAsyncIterator = requireRegeneratorAsyncIterator();
		var regeneratorKeys = requireRegeneratorKeys();
		var regeneratorValues = requireRegeneratorValues();
		function _regeneratorRuntime() {

		  var r = regenerator(),
		    e = r.m(_regeneratorRuntime),
		    t = (Object.getPrototypeOf ? Object.getPrototypeOf(e) : e.__proto__).constructor;
		  function n(r) {
		    var e = "function" == typeof r && r.constructor;
		    return !!e && (e === t || "GeneratorFunction" === (e.displayName || e.name));
		  }
		  var o = {
		    "throw": 1,
		    "return": 2,
		    "break": 3,
		    "continue": 3
		  };
		  function a(r) {
		    var e, t;
		    return function (n) {
		      e || (e = {
		        stop: function stop() {
		          return t(n.a, 2);
		        },
		        "catch": function _catch() {
		          return n.v;
		        },
		        abrupt: function abrupt(r, e) {
		          return t(n.a, o[r], e);
		        },
		        delegateYield: function delegateYield(r, o, a) {
		          return e.resultName = o, t(n.d, regeneratorValues(r), a);
		        },
		        finish: function finish(r) {
		          return t(n.f, r);
		        }
		      }, t = function t(r, _t, o) {
		        n.p = e.prev, n.n = e.next;
		        try {
		          return r(_t, o);
		        } finally {
		          e.next = n.n;
		        }
		      }), e.resultName && (e[e.resultName] = n.v, e.resultName = void 0), e.sent = n.v, e.next = n.n;
		      try {
		        return r.call(this, e);
		      } finally {
		        n.p = e.prev, n.n = e.next;
		      }
		    };
		  }
		  return (module.exports = _regeneratorRuntime = function _regeneratorRuntime() {
		    return {
		      wrap: function wrap(e, t, n, o) {
		        return r.w(a(e), t, n, o && o.reverse());
		      },
		      isGeneratorFunction: n,
		      mark: r.m,
		      awrap: function awrap(r, e) {
		        return new OverloadYield(r, e);
		      },
		      AsyncIterator: regeneratorAsyncIterator,
		      async: function async(r, e, t, o, u) {
		        return (n(e) ? regeneratorAsyncGen : regeneratorAsync)(a(r), e, t, o, u);
		      },
		      keys: regeneratorKeys,
		      values: regeneratorValues
		    };
		  }, module.exports.__esModule = true, module.exports["default"] = module.exports)();
		}
		module.exports = _regeneratorRuntime, module.exports.__esModule = true, module.exports["default"] = module.exports; 
	} (regeneratorRuntime$1));
	return regeneratorRuntime$1.exports;
}

var regenerator;
var hasRequiredRegenerator;

function requireRegenerator () {
	if (hasRequiredRegenerator) return regenerator;
	hasRequiredRegenerator = 1;
	// TODO(Babel 8): Remove this file.

	var runtime = requireRegeneratorRuntime()();
	regenerator = runtime;

	// Copied from https://github.com/facebook/regenerator/blob/main/packages/runtime/runtime.js#L736=
	try {
	  regeneratorRuntime = runtime;
	} catch (accidentalStrictMode) {
	  if (typeof globalThis === "object") {
	    globalThis.regeneratorRuntime = runtime;
	  } else {
	    Function("r", "regeneratorRuntime = r")(runtime);
	  }
	}
	return regenerator;
}

var regeneratorExports = requireRegenerator();
var _regeneratorRuntime = /*@__PURE__*/getDefaultExportFromCjs(regeneratorExports);

var css_248z = ".sub-download{cursor:pointer}.sub-download,.sub-monospace{font-family:monospace}";

function _createForOfIteratorHelperLoose(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (t) return (t = t.call(r)).next.bind(t); if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e) { t && (r = t); var o = 0; return function () { return o >= r.length ? { done: true } : { done: false, value: r[o++] }; }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function locale2str(locale) {
  var _Intl$DisplayNames$of;
  var currentLang = navigator.language.indexOf("-") ? navigator.language.split("-")[0] : navigator.language;
  if (locale.indexOf("-") > 0) {
    var splits = locale.split("-");
    return new Intl.DisplayNames([currentLang], {
      type: "language"
    }).of(splits[0]) + " (" + new Intl.DisplayNames([currentLang], {
      type: "region"
    }).of(splits[1]) + ")";
  }
  return (_Intl$DisplayNames$of = new Intl.DisplayNames([currentLang], {
    type: "language"
  }).of(locale)) != null ? _Intl$DisplayNames$of : "";
}
function onMain() {
  GM_addStyle(css_248z);
  var custom_data = {
    eligible_region: "",
    series_id: "",
    season_id: "",
    episode_id: "",
    premium_available_date: "",
    thumbnail: ""
  };
  var custom_data_2 = {
    season_title: "",
    episode: ""
  };
  var normalizeEpisode = function normalizeEpisode(episode) {
    try {
      parseInt(episode);
      return episode.padStart(2, "0");
    } catch (_unused) {
      // do nothing
    }
    return episode;
  };
  var buildRow = function buildRow(table, el, data) {
    for (var _i = 0, _Object$entries = Object.entries(data); _i < _Object$entries.length; _i++) {
      var _Object$entries$_i = _Object$entries[_i],
        k = _Object$entries$_i[0],
        v = _Object$entries$_i[1];
      var clone = el.cloneNode(true);
      if (!(clone instanceof HTMLDivElement)) return;
      delete clone.dataset["t"];
      var col = clone.querySelector("[data-t=details-table-column-name]");
      var desc = clone.querySelector("[data-t=details-table-description]");
      if (!col || !desc) return;
      col.textContent = k;
      switch (k) {
        case "thumbnail":
          {
            var a = document.createElement("a");
            a.href = v;
            a.textContent = "link";
            desc.textContent = "";
            desc.appendChild(a);
            break;
          }
        case "premium_available_date":
          {
            var d = new Date(v);
            desc.textContent = d.toLocaleString();
            break;
          }
        default:
          desc.textContent = v;
      }
      table.appendChild(clone);
    }
  };
  var insertData = function insertData(target) {
    var table = target.querySelector(".languages-table-details");
    var el = table == null ? void 0 : table.firstElementChild;
    if (!el) return;
    buildRow(table, el, custom_data);
  };
  VM.observe(document.body, function (mutations) {
    for (var _iterator = _createForOfIteratorHelperLoose(mutations), _step; !(_step = _iterator()).done;) {
      var mutation = _step.value;
      var target = mutation.target;
      if (!(target instanceof HTMLDivElement) || !("t" in target.dataset) || target.dataset["t"] != "expandable-section") continue;
      insertData(target);
    }
  });
  var xhr_proto = GMCompat.unsafeWindow.XMLHttpRequest.prototype;
  var backup_xhr_send = xhr_proto.send;
  var onResponse = function onResponse(xhr) {
    var contentType = xhr.getResponseHeader("Content-Type");
    if (!(contentType != null && contentType.includes("application/json"))) return;
    var url = URL.parse(xhr.responseURL);
    if (url != null && url.pathname.startsWith("/content/v2/cms/objects/")) {
      var _obj$data$at, _obj$data, _data$episode_metadat, _episode_metadata$eli, _episode_metadata$ser, _episode_metadata$sea, _data$id, _data$images$thumbnai, _data$images, _episode_metadata$pre, _episode_metadata$sea2, _episode_metadata$epi;
      var obj = JSON.parse(xhr.responseText);
      var data = (_obj$data$at = obj == null || (_obj$data = obj.data) == null ? void 0 : _obj$data.at(0)) != null ? _obj$data$at : {};
      var episode_metadata = (_data$episode_metadat = data == null ? void 0 : data.episode_metadata) != null ? _data$episode_metadat : {};
      custom_data["eligible_region"] = (_episode_metadata$eli = episode_metadata == null ? void 0 : episode_metadata.eligible_region) != null ? _episode_metadata$eli : "";
      custom_data["series_id"] = (_episode_metadata$ser = episode_metadata == null ? void 0 : episode_metadata.series_id) != null ? _episode_metadata$ser : "";
      custom_data["season_id"] = (_episode_metadata$sea = episode_metadata == null ? void 0 : episode_metadata.season_id) != null ? _episode_metadata$sea : "";
      custom_data["episode_id"] = (_data$id = data == null ? void 0 : data.id) != null ? _data$id : "";
      custom_data["thumbnail"] = (_data$images$thumbnai = data == null || (_data$images = data.images) == null || (_data$images = _data$images.thumbnail) == null || (_data$images = _data$images.at(0)) == null || (_data$images = _data$images.at(-1)) == null ? void 0 : _data$images.source) != null ? _data$images$thumbnai : "";
      custom_data["premium_available_date"] = (_episode_metadata$pre = episode_metadata == null ? void 0 : episode_metadata.premium_available_date) != null ? _episode_metadata$pre : "";
      custom_data_2["season_title"] = (_episode_metadata$sea2 = episode_metadata == null ? void 0 : episode_metadata.season_title) != null ? _episode_metadata$sea2 : "";
      custom_data_2["episode"] = (_episode_metadata$epi = episode_metadata == null ? void 0 : episode_metadata.episode) != null ? _episode_metadata$epi : "";
    }
  };
  function new_xhr_send(body) {
    var backup_onreadystatechange = this.onreadystatechange;
    this.onreadystatechange = function (event) {
      if (this.readyState === this.DONE && this.responseURL && this.status === 200) {
        onResponse(this);
      }
      if (backup_onreadystatechange) {
        backup_onreadystatechange.call(this, event);
      }
    };
    GMCompat.apply(this, backup_xhr_send, [body]);
  }
  xhr_proto.send = GMCompat["export"](new_xhr_send);
  var backup_fetch = GMCompat.unsafeWindow.fetch;
  function new_fetch(_x, _x2) {
    return _new_fetch.apply(this, arguments);
  }
  function _new_fetch() {
    _new_fetch = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime.mark(function _callee2(input, init) {
      var response, responseClone, url, _obj$subtitles, obj, subtitles, tableParent, el, clone, col, desc, table, _loop, _ret, _i2, _Object$values;
      return _regeneratorRuntime.wrap(function (_context3) {
        while (1) switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 1;
            return backup_fetch(input, init);
          case 1:
            response = _context3.sent;
            responseClone = response.clone();
            if (!(typeof input !== "string")) {
              _context3.next = 2;
              break;
            }
            return _context3.abrupt("return", response);
          case 2:
            url = URL.parse(input);
            if (!(url != null && url.pathname.startsWith("/playback/v3/") && url != null && url.pathname.endsWith("/play"))) {
              _context3.next = 11;
              break;
            }
            _context3.next = 3;
            return responseClone.json()["catch"](function () {
              return responseClone.text();
            });
          case 3:
            obj = _context3.sent;
            subtitles = (_obj$subtitles = obj == null ? void 0 : obj.subtitles) != null ? _obj$subtitles : {};
            tableParent = document.querySelector(".languages-table-details");
            el = tableParent == null ? void 0 : tableParent.firstElementChild;
            if (el) {
              _context3.next = 4;
              break;
            }
            return _context3.abrupt("return", response);
          case 4:
            clone = el.cloneNode(true);
            if (clone instanceof HTMLDivElement) {
              _context3.next = 5;
              break;
            }
            return _context3.abrupt("return", response);
          case 5:
            delete clone.dataset["t"];
            col = clone.querySelector("[data-t=details-table-column-name]");
            desc = clone.querySelector("[data-t=details-table-description]");
            if (!(!col || !desc)) {
              _context3.next = 6;
              break;
            }
            return _context3.abrupt("return", response);
          case 6:
            col.textContent = "subtitles";
            desc.innerHTML = "";
            table = document.createElement("table");
            _loop = /*#__PURE__*/_regeneratorRuntime.mark(function _loop() {
              var v, u, filename, re, matches, d, p1, p2;
              return _regeneratorRuntime.wrap(function (_context2) {
                while (1) switch (_context2.prev = _context2.next) {
                  case 0:
                    v = _Object$values[_i2];
                    if (v != null && v.url) {
                      _context2.next = 1;
                      break;
                    }
                    return _context2.abrupt("return", 0);
                  case 1:
                    u = URL.parse(v.url);
                    filename = u == null ? void 0 : u.pathname.split("/").at(-1);
                    if (filename) {
                      _context2.next = 2;
                      break;
                    }
                    return _context2.abrupt("return", 0);
                  case 2:
                    re = /^subtitle(-\S+-(\d+))?\.(\S+)$/; // https://vod-fy-mod.crunchyrollcdn.com/static/majin/e00378795a00378807jajp/clean/subtitles/enus/20260820_225123/subtitle.ass?t=exp=1790108771~acl=/static/majin/e00378795a00378807jajp/clean/subtitles/enus/20260820_225123/subtitle.ass~hmac=ab24ea77856258131a4a0558ac12e5ac1b3ec924245240506532a90add970530
                    matches = filename == null ? void 0 : filename.match(re);
                    if (matches) {
                      _context2.next = 3;
                      break;
                    }
                    return _context2.abrupt("return", 0);
                  case 3:
                    if (matches[2] != undefined) {
                      d = new Date(parseInt(matches[2]) * 1000);
                    }
                    p1 = document.createElement("p");
                    p1.classList.add("sub-download");
                    p1.textContent = locale2str(v.language);
                    p1.onclick = /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regeneratorRuntime.mark(function _callee() {
                      var language, newFilename, _response, blob, blobUrl, link, _t;
                      return _regeneratorRuntime.wrap(function (_context) {
                        while (1) switch (_context.prev = _context.next) {
                          case 0:
                            _context.prev = 0;
                            language = (v == null ? void 0 : v.language) || "unk";
                            newFilename = custom_data_2["season_title"] + "_" + normalizeEpisode(custom_data_2["episode"]) + "_" + language + "." + matches[3];
                            _context.next = 1;
                            return fetch(v.url);
                          case 1:
                            _response = _context.sent;
                            _context.next = 2;
                            return _response.blob();
                          case 2:
                            blob = _context.sent;
                            blobUrl = window.URL.createObjectURL(blob);
                            link = document.createElement("a");
                            link.href = blobUrl;
                            link.download = newFilename;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            window.URL.revokeObjectURL(blobUrl);
                            _context.next = 4;
                            break;
                          case 3:
                            _context.prev = 3;
                            _t = _context["catch"](0);
                            console.error(_t);
                          case 4:
                          case "end":
                            return _context.stop();
                        }
                      }, _callee, null, [[0, 3]]);
                    }));
                    desc.appendChild(p1);
                    if (d !== undefined) {
                      p2 = document.createElement("p");
                      p2.classList.add("sub-monospace");
                      p2.textContent = d.toLocaleString();
                      desc.appendChild(p2);
                    }
                  case 4:
                  case "end":
                    return _context2.stop();
                }
              }, _loop);
            });
            _i2 = 0, _Object$values = Object.values(subtitles);
          case 7:
            if (!(_i2 < _Object$values.length)) {
              _context3.next = 10;
              break;
            }
            return _context3.delegateYield(_loop(), "t0", 8);
          case 8:
            _ret = _context3.t0;
            if (!(_ret === 0)) {
              _context3.next = 9;
              break;
            }
            return _context3.abrupt("continue", 9);
          case 9:
            _i2++;
            _context3.next = 7;
            break;
          case 10:
            desc.appendChild(table);
            tableParent.appendChild(clone);
          case 11:
            return _context3.abrupt("return", response);
          case 12:
          case "end":
            return _context3.stop();
        }
      }, _callee2);
    }));
    return _new_fetch.apply(this, arguments);
  }
  unsafeWindow.fetch = GMCompat["export"](new_fetch);
}
function onImgSrv(url) {
  if (!url.pathname.startsWith("/cdn-cgi/image/")) return;
  url.pathname = url.pathname.split("/").slice(4).join("/");
  document.location.href = url.toString();
}
var currentHref = new URL(document.location.href);
if (currentHref.hostname === "www.crunchyroll.com") {
  onMain();
} else if (currentHref.hostname === "imgsrv.crunchyroll.com") {
  onImgSrv(currentHref);
}

})(VM);
