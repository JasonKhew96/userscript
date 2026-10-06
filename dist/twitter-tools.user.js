// ==UserScript==
// @name        Twitter Tools
// @match       *://x.com/*
// @match       *://*.x.com/*
// @require     https://unpkg.com/gm-compat@1.1.0
// @require     https://cdn.jsdelivr.net/npm/@violentmonkey/dom@2
// @require     https://cdn.jsdelivr.net/npm/@violentmonkey/ui@0.7
// @require     https://update.greasyfork.org/scripts/554436/1692608/GM_lock.js
// @version     0.8
// @author      JasonKhew96
// @downloadURL https://github.com/JasonKhew96/userscript/raw/refs/heads/master/dist/twitter-tools.user.js
// @grant       GM_addStyle
// @grant       GM_addValueChangeListener
// @grant       GM_getValue
// @grant       GM_removeValueChangeListener
// @grant       GM_setValue
// @grant       unsafeWindow
// ==/UserScript==

(function (ui, VM) {
'use strict';

const IS_DEV = false;
const equalFn = (a, b) => a === b;
const $TRACK = Symbol("solid-track");
const signalOptions = {
  equals: equalFn
};
let runEffects = runQueue;
const STALE = 1;
const PENDING = 2;
const UNOWNED = {
  owned: null,
  cleanups: null,
  context: null,
  owner: null
};
var Owner = null;
let Transition = null;
let ExternalSourceConfig = null;
let Listener = null;
let Updates = null;
let Effects = null;
let ExecCount = 0;
function createRoot(fn, detachedOwner) {
  const listener = Listener,
    owner = Owner,
    unowned = fn.length === 0,
    current = detachedOwner === undefined ? owner : detachedOwner,
    root = unowned ? UNOWNED : {
      owned: null,
      cleanups: null,
      context: current ? current.context : null,
      owner: current
    },
    updateFn = unowned ? fn : () => fn(() => untrack(() => cleanNode(root)));
  Owner = root;
  Listener = null;
  try {
    return runUpdates(updateFn, true);
  } finally {
    Listener = listener;
    Owner = owner;
  }
}
function createSignal(value, options) {
  options = options ? Object.assign({}, signalOptions, options) : signalOptions;
  const s = {
    value,
    observers: null,
    observerSlots: null,
    comparator: options.equals || undefined
  };
  const setter = value => {
    if (typeof value === "function") {
      value = value(s.value);
    }
    return writeSignal(s, value);
  };
  return [readSignal.bind(s), setter];
}
function createRenderEffect(fn, value, options) {
  const c = createComputation(fn, value, false, STALE);
  updateComputation(c);
}
function createMemo(fn, value, options) {
  options = options ? Object.assign({}, signalOptions, options) : signalOptions;
  const c = createComputation(fn, value, true, 0);
  c.observers = null;
  c.observerSlots = null;
  c.comparator = options.equals || undefined;
  updateComputation(c);
  return readSignal.bind(c);
}
function untrack(fn) {
  if (Listener === null) return fn();
  const listener = Listener;
  Listener = null;
  try {
    if (ExternalSourceConfig) ;
    return fn();
  } finally {
    Listener = listener;
  }
}
function onCleanup(fn) {
  if (Owner === null) ;else if (Owner.cleanups === null) Owner.cleanups = [fn];else Owner.cleanups.push(fn);
  return fn;
}
function readSignal() {
  if (this.sources && (this.state)) {
    if ((this.state) === STALE) updateComputation(this);else {
      const updates = Updates;
      Updates = null;
      runUpdates(() => lookUpstream(this), false);
      Updates = updates;
    }
  }
  if (Listener) {
    const observers = this.observers;
    if (!observers || observers[observers.length - 1] !== Listener) {
      const sSlot = observers ? observers.length : 0;
      if (!Listener.sources) {
        Listener.sources = [this];
        Listener.sourceSlots = [sSlot];
      } else {
        Listener.sources.push(this);
        Listener.sourceSlots.push(sSlot);
      }
      if (!observers) {
        this.observers = [Listener];
        this.observerSlots = [Listener.sources.length - 1];
      } else {
        observers.push(Listener);
        this.observerSlots.push(Listener.sources.length - 1);
      }
    }
  }
  return this.value;
}
function writeSignal(node, value, isComp) {
  let current = node.value;
  if (!node.comparator || !node.comparator(current, value)) {
    node.value = value;
    if (node.observers && node.observers.length) {
      runUpdates(() => {
        for (let i = 0; i < node.observers.length; i += 1) {
          const o = node.observers[i];
          const TransitionRunning = Transition && Transition.running;
          if (TransitionRunning && Transition.disposed.has(o)) ;
          if (TransitionRunning ? !o.tState : !o.state) {
            if (o.pure) Updates.push(o);else Effects.push(o);
            if (o.observers) markDownstream(o);
          }
          if (!TransitionRunning) o.state = STALE;
        }
        if (Updates.length > 10e5) {
          Updates = [];
          if (IS_DEV) ;
          throw new Error();
        }
      }, false);
    }
  }
  return value;
}
function updateComputation(node) {
  if (!node.fn) return;
  cleanNode(node);
  const time = ExecCount;
  runComputation(node, node.value, time);
}
function runComputation(node, value, time) {
  let nextValue;
  const owner = Owner,
    listener = Listener;
  Listener = Owner = node;
  try {
    nextValue = node.fn(value);
  } catch (err) {
    if (node.pure) {
      {
        node.state = STALE;
        node.owned && node.owned.forEach(cleanNode);
        node.owned = null;
      }
    }
    node.updatedAt = time + 1;
    return handleError(err);
  } finally {
    Listener = listener;
    Owner = owner;
  }
  if (!node.updatedAt || node.updatedAt <= time) {
    if (node.updatedAt != null && "observers" in node) {
      writeSignal(node, nextValue);
    } else node.value = nextValue;
    node.updatedAt = time;
  }
}
function createComputation(fn, init, pure, state = STALE, options) {
  const c = {
    fn,
    state: state,
    updatedAt: null,
    owned: null,
    sources: null,
    sourceSlots: null,
    cleanups: null,
    value: init,
    owner: Owner,
    context: Owner ? Owner.context : null,
    pure
  };
  if (Owner === null) ;else if (Owner !== UNOWNED) {
    {
      if (!Owner.owned) Owner.owned = [c];else Owner.owned.push(c);
    }
  }
  return c;
}
function runTop(node) {
  if ((node.state) === 0) return;
  if ((node.state) === PENDING) return lookUpstream(node);
  if (node.suspense && untrack(node.suspense.inFallback)) return node.suspense.effects.push(node);
  const ancestors = [node];
  while ((node = node.owner) && (!node.updatedAt || node.updatedAt < ExecCount)) {
    if (node.state) ancestors.push(node);
  }
  for (let i = ancestors.length - 1; i >= 0; i--) {
    node = ancestors[i];
    if ((node.state) === STALE) {
      updateComputation(node);
    } else if ((node.state) === PENDING) {
      const updates = Updates;
      Updates = null;
      runUpdates(() => lookUpstream(node, ancestors[0]), false);
      Updates = updates;
    }
  }
}
function runUpdates(fn, init) {
  if (Updates) return fn();
  let wait = false;
  if (!init) Updates = [];
  if (Effects) wait = true;else Effects = [];
  ExecCount++;
  try {
    const res = fn();
    completeUpdates(wait);
    return res;
  } catch (err) {
    if (!wait) Effects = null;
    Updates = null;
    handleError(err);
  }
}
function completeUpdates(wait) {
  if (Updates) {
    runQueue(Updates);
    Updates = null;
  }
  if (wait) return;
  const e = Effects;
  Effects = null;
  if (e.length) runUpdates(() => runEffects(e), false);
}
function runQueue(queue) {
  for (let i = 0; i < queue.length; i++) runTop(queue[i]);
}
function lookUpstream(node, ignore) {
  node.state = 0;
  for (let i = 0; i < node.sources.length; i += 1) {
    const source = node.sources[i];
    if (source.sources) {
      const state = source.state;
      if (state === STALE) {
        if (source !== ignore && (!source.updatedAt || source.updatedAt < ExecCount)) runTop(source);
      } else if (state === PENDING) lookUpstream(source, ignore);
    }
  }
}
function markDownstream(node) {
  for (let i = 0; i < node.observers.length; i += 1) {
    const o = node.observers[i];
    if (!o.state) {
      o.state = PENDING;
      if (o.pure) Updates.push(o);else Effects.push(o);
      o.observers && markDownstream(o);
    }
  }
}
function cleanNode(node) {
  let i;
  if (node.sources) {
    while (node.sources.length) {
      const source = node.sources.pop(),
        index = node.sourceSlots.pop(),
        obs = source.observers;
      if (obs && obs.length) {
        const n = obs.pop(),
          s = source.observerSlots.pop();
        if (index < obs.length) {
          n.sourceSlots[s] = index;
          obs[index] = n;
          source.observerSlots[index] = s;
        }
      }
    }
  }
  if (node.tOwned) {
    for (i = node.tOwned.length - 1; i >= 0; i--) cleanNode(node.tOwned[i]);
    delete node.tOwned;
  }
  if (node.owned) {
    for (i = node.owned.length - 1; i >= 0; i--) cleanNode(node.owned[i]);
    node.owned = null;
  }
  if (node.cleanups) {
    for (i = node.cleanups.length - 1; i >= 0; i--) node.cleanups[i]();
    node.cleanups = null;
  }
  node.state = 0;
}
function castError(err) {
  if (err instanceof Error) return err;
  return new Error(typeof err === "string" ? err : "Unknown error", {
    cause: err
  });
}
function handleError(err, owner = Owner) {
  const error = castError(err);
  throw error;
}

const FALLBACK = Symbol("fallback");
function dispose(d) {
  for (let i = 0; i < d.length; i++) d[i]();
}
function mapArray(list, mapFn, options = {}) {
  let items = [],
    mapped = [],
    disposers = [],
    len = 0,
    indexes = mapFn.length > 1 ? [] : null;
  onCleanup(() => dispose(disposers));
  return () => {
    let newItems = list() || [],
      newLen = newItems.length,
      i,
      j;
    newItems[$TRACK];
    return untrack(() => {
      let newIndices, newIndicesNext, temp, tempdisposers, tempIndexes, start, end, newEnd, item;
      if (newLen === 0) {
        if (len !== 0) {
          dispose(disposers);
          disposers = [];
          items = [];
          mapped = [];
          len = 0;
          indexes && (indexes = []);
        }
        if (options.fallback) {
          items = [FALLBACK];
          mapped[0] = createRoot(disposer => {
            disposers[0] = disposer;
            return options.fallback();
          });
          len = 1;
        }
      }
      else if (len === 0) {
        mapped = new Array(newLen);
        for (j = 0; j < newLen; j++) {
          items[j] = newItems[j];
          mapped[j] = createRoot(mapper);
        }
        len = newLen;
      } else {
        temp = new Array(newLen);
        tempdisposers = new Array(newLen);
        indexes && (tempIndexes = new Array(newLen));
        for (start = 0, end = Math.min(len, newLen); start < end && items[start] === newItems[start]; start++);
        for (end = len - 1, newEnd = newLen - 1; end >= start && newEnd >= start && items[end] === newItems[newEnd]; end--, newEnd--) {
          temp[newEnd] = mapped[end];
          tempdisposers[newEnd] = disposers[end];
          indexes && (tempIndexes[newEnd] = indexes[end]);
        }
        newIndices = new Map();
        newIndicesNext = new Array(newEnd + 1);
        for (j = newEnd; j >= start; j--) {
          item = newItems[j];
          i = newIndices.get(item);
          newIndicesNext[j] = i === undefined ? -1 : i;
          newIndices.set(item, j);
        }
        for (i = start; i <= end; i++) {
          item = items[i];
          j = newIndices.get(item);
          if (j !== undefined && j !== -1) {
            temp[j] = mapped[i];
            tempdisposers[j] = disposers[i];
            indexes && (tempIndexes[j] = indexes[i]);
            j = newIndicesNext[j];
            newIndices.set(item, j);
          } else disposers[i]();
        }
        for (j = start; j < newLen; j++) {
          if (j in temp) {
            mapped[j] = temp[j];
            disposers[j] = tempdisposers[j];
            if (indexes) {
              indexes[j] = tempIndexes[j];
              indexes[j](j);
            }
          } else mapped[j] = createRoot(mapper);
        }
        mapped = mapped.slice(0, len = newLen);
        items = newItems.slice(0);
      }
      return mapped;
    });
    function mapper(disposer) {
      disposers[j] = disposer;
      if (indexes) {
        const [s, set] = createSignal(j);
        indexes[j] = set;
        return mapFn(newItems[j], s);
      }
      return mapFn(newItems[j]);
    }
  };
}
function createComponent(Comp, props) {
  return untrack(() => Comp(props || {}));
}
function For(props) {
  const fallback = "fallback" in props && {
    fallback: () => props.fallback
  };
  return createMemo(mapArray(() => props.each, props.children, fallback || undefined));
}

function reconcileArrays(parentNode, a, b) {
  let bLength = b.length,
    aEnd = a.length,
    bEnd = bLength,
    aStart = 0,
    bStart = 0,
    after = a[aEnd - 1].nextSibling,
    map = null;
  while (aStart < aEnd || bStart < bEnd) {
    if (a[aStart] === b[bStart]) {
      aStart++;
      bStart++;
      continue;
    }
    while (a[aEnd - 1] === b[bEnd - 1]) {
      aEnd--;
      bEnd--;
    }
    if (aEnd === aStart) {
      const node = bEnd < bLength ? bStart ? b[bStart - 1].nextSibling : b[bEnd - bStart] : after;
      while (bStart < bEnd) parentNode.insertBefore(b[bStart++], node);
    } else if (bEnd === bStart) {
      while (aStart < aEnd) {
        if (!map || !map.has(a[aStart])) a[aStart].remove();
        aStart++;
      }
    } else if (a[aStart] === b[bEnd - 1] && b[bStart] === a[aEnd - 1]) {
      const node = a[--aEnd].nextSibling;
      parentNode.insertBefore(b[bStart++], a[aStart++].nextSibling);
      parentNode.insertBefore(b[--bEnd], node);
      a[aEnd] = b[bEnd];
    } else {
      if (!map) {
        map = new Map();
        let i = bStart;
        while (i < bEnd) map.set(b[i], i++);
      }
      const index = map.get(a[aStart]);
      if (index != null) {
        if (bStart < index && index < bEnd) {
          let i = aStart,
            sequence = 1,
            t;
          while (++i < aEnd && i < bEnd) {
            if ((t = map.get(a[i])) == null || t !== index + sequence) break;
            sequence++;
          }
          if (sequence > index - bStart) {
            const node = a[aStart];
            while (bStart < index) parentNode.insertBefore(b[bStart++], node);
          } else parentNode.replaceChild(b[bStart++], a[aStart++]);
        } else aStart++;
      } else a[aStart++].remove();
    }
  }
}
function render(code, element, init, options = {}) {
  let disposer;
  createRoot(dispose => {
    disposer = dispose;
    element === document ? code() : insert(element, code(), element.firstChild ? null : undefined, init);
  }, options.owner);
  return () => {
    disposer();
    element.textContent = "";
  };
}
function template(html, isImportNode, isSVG, isMathML) {
  let node;
  const create = () => {
    const t = document.createElement("template");
    t.innerHTML = html;
    return t.content.firstChild;
  };
  const fn = () => (node || (node = create())).cloneNode(true);
  fn.cloneNode = fn;
  return fn;
}
function className(node, value) {
  node.className = value;
}
function insert(parent, accessor, marker, initial) {
  if (marker !== undefined && !initial) initial = [];
  if (typeof accessor !== "function") return insertExpression(parent, accessor, initial, marker);
  createRenderEffect(current => insertExpression(parent, accessor(), current, marker), initial);
}
function insertExpression(parent, value, current, marker, unwrapArray) {
  while (typeof current === "function") current = current();
  if (value === current) return current;
  const t = typeof value,
    multi = marker !== undefined;
  parent = multi && current[0] && current[0].parentNode || parent;
  if (t === "string" || t === "number") {
    if (t === "number") {
      value = value.toString();
      if (value === current) return current;
    }
    if (multi) {
      let node = current[0];
      if (node && node.nodeType === 3) {
        node.data !== value && (node.data = value);
      } else node = document.createTextNode(value);
      current = cleanChildren(parent, current, marker, node);
    } else {
      if (current !== "" && typeof current === "string") {
        current = parent.firstChild.data = value;
      } else current = parent.textContent = value;
    }
  } else if (value == null || t === "boolean") {
    current = cleanChildren(parent, current, marker);
  } else if (t === "function") {
    createRenderEffect(() => {
      let v = value();
      while (typeof v === "function") v = v();
      current = insertExpression(parent, v, current, marker);
    });
    return () => current;
  } else if (Array.isArray(value)) {
    const array = [];
    const currentArray = current && Array.isArray(current);
    if (normalizeIncomingArray(array, value, current, unwrapArray)) {
      createRenderEffect(() => current = insertExpression(parent, array, current, marker, true));
      return () => current;
    }
    if (array.length === 0) {
      current = cleanChildren(parent, current, marker);
      if (multi) return current;
    } else if (currentArray) {
      if (current.length === 0) {
        appendNodes(parent, array, marker);
      } else reconcileArrays(parent, current, array);
    } else {
      current && cleanChildren(parent);
      appendNodes(parent, array);
    }
    current = array;
  } else if (value.nodeType) {
    if (Array.isArray(current)) {
      if (multi) return current = cleanChildren(parent, current, marker, value);
      cleanChildren(parent, current, null, value);
    } else if (current == null || current === "" || !parent.firstChild) {
      parent.appendChild(value);
    } else parent.replaceChild(value, parent.firstChild);
    current = value;
  } else ;
  return current;
}
function normalizeIncomingArray(normalized, array, current, unwrap) {
  let dynamic = false;
  for (let i = 0, len = array.length; i < len; i++) {
    let item = array[i],
      prev = current && current[normalized.length],
      t;
    if (item == null || item === true || item === false) ; else if ((t = typeof item) === "object" && item.nodeType) {
      normalized.push(item);
    } else if (Array.isArray(item)) {
      dynamic = normalizeIncomingArray(normalized, item, prev) || dynamic;
    } else if (t === "function") {
      if (unwrap) {
        while (typeof item === "function") item = item();
        dynamic = normalizeIncomingArray(normalized, Array.isArray(item) ? item : [item], Array.isArray(prev) ? prev : [prev]) || dynamic;
      } else {
        normalized.push(item);
        dynamic = true;
      }
    } else {
      const value = String(item);
      if (prev && prev.nodeType === 3 && prev.data === value) normalized.push(prev);else normalized.push(document.createTextNode(value));
    }
  }
  return dynamic;
}
function appendNodes(parent, array, marker = null) {
  for (let i = 0, len = array.length; i < len; i++) parent.insertBefore(array[i], marker);
}
function cleanChildren(parent, current, marker, replacement) {
  if (marker === undefined) return parent.textContent = "";
  const node = replacement || document.createTextNode("");
  if (current.length) {
    let inserted = false;
    for (let i = current.length - 1; i >= 0; i--) {
      const el = current[i];
      if (node !== el) {
        const isParent = el.parentNode === parent;
        if (!inserted && !i) isParent ? parent.replaceChild(node, el) : parent.insertBefore(node, marker);else isParent && el.remove();
      } else inserted = true;
    }
  } else parent.insertBefore(node, marker);
  return [node];
}

var styles = {"list":"style-module_list__qe8IL"};
var stylesheet=".style-module_list__qe8IL{margin:.5rem;padding-left:.5rem}";

var css_248z = ".tools-highlight{background:#ff0;border-radius:4px;color:#000;display:inline-block;padding-left:2px;padding-right:2px}";

var _tmpl$ = /*#__PURE__*/template(`<ul>`),
  _tmpl$2 = /*#__PURE__*/template(`<li>`);
function _createForOfIteratorHelperLoose(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (t) return (t = t.call(r)).next.bind(t); if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e) { t && (r = t); var o = 0; return function () { return o >= r.length ? { done: true } : { done: false, value: r[o++] }; }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
GM_addStyle(css_248z);
var log = function log() {
  var _console;
  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }
  (_console = console).debug.apply(_console, ["twitter-tools:"].concat(args));
};
var currentProfileId = "";
var _createSignal = createSignal([]),
  currentUserLists = _createSignal[0],
  setCurrentUserLists = _createSignal[1];
var listAdd = function listAdd(list_id, name) {
  GM_lock("lock_list", function () {
    var lists = GM_getValue("lists", {});
    lists[list_id] = name;
    GM_setValue("lists", lists);
  });
};
var listMemberAdd = function listMemberAdd(list_id, user_ids) {
  GM_lock("lock_list", function () {
    var member_lists = GM_getValue("member_lists", {});
    for (var _iterator = _createForOfIteratorHelperLoose(user_ids), _step; !(_step = _iterator()).done;) {
      var user_id = _step.value;
      if (!member_lists[user_id]) member_lists[user_id] = [];
      if (!member_lists[user_id].includes(list_id)) {
        member_lists[user_id].push(list_id);
      }
    }
    GM_setValue("member_lists", member_lists);
  });
};
var memberListAdd = function memberListAdd(user_id) {
  for (var _len2 = arguments.length, list_ids = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
    list_ids[_key2 - 1] = arguments[_key2];
  }
  GM_lock("lock_list", function () {
    var member_lists = GM_getValue("member_lists", {});
    if (!member_lists[user_id]) member_lists[user_id] = [];
    for (var _i = 0, _list_ids = list_ids; _i < _list_ids.length; _i++) {
      var list_id = _list_ids[_i];
      if (!member_lists[user_id].includes(list_id)) {
        member_lists[user_id].push(list_id);
      }
    }
    GM_setValue("member_lists", member_lists);
  });
};
var memberListRemove = function memberListRemove(user_id) {
  for (var _len3 = arguments.length, list_ids = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
    list_ids[_key3 - 1] = arguments[_key3];
  }
  GM_lock("lock_list", function () {
    var member_lists = GM_getValue("member_lists", {});
    for (var _i2 = 0, _list_ids2 = list_ids; _i2 < _list_ids2.length; _i2++) {
      var list_id = _list_ids2[_i2];
      var deleteIndex = member_lists[user_id].indexOf(list_id);
      if (deleteIndex > -1) {
        member_lists[user_id].splice(deleteIndex, 1);
      }
    }
    GM_setValue("member_lists", member_lists);
  });
};
var updateLists = function updateLists(member_lists) {
  var _member_lists$current;
  var lists = (_member_lists$current = member_lists[currentProfileId]) != null ? _member_lists$current : [];
  var lists_cache = GM_getValue("lists", {});
  setCurrentUserLists(lists == null ? void 0 : lists.flatMap(function (l) {
    return lists_cache[l];
  }));
  if (lists.length > 0) {
    panelMain.show();
  } else {
    panelMain.hide();
  }
};
GM_addValueChangeListener("member_lists", function (_name, _oldValue, newValue) {
  updateLists(newValue);
});
var loadMemberLists = function loadMemberLists() {
  var member_lists = GM_getValue("member_lists", {});
  updateLists(member_lists);
};
var clearMemberLists = function clearMemberLists() {
  currentProfileId = "";
  setCurrentUserLists([]);
  panelMain.hide();
};
var xhr_proto = GMCompat.unsafeWindow.XMLHttpRequest.prototype;
var backup_xhr_send = xhr_proto.send;
var onResponse = function onResponse(xhr) {
  var contentType = xhr.getResponseHeader("Content-Type");
  if (!(contentType != null && contentType.includes("application/json"))) return;
  var url = URL.parse(xhr.responseURL);
  if (!url) return;
  if (/^\/i\/api\/graphql\/\S+\/CreateList$/.test(url.pathname)) {
    var _obj$data;
    var obj = JSON.parse(xhr.response);
    var list = obj == null || (_obj$data = obj.data) == null ? void 0 : _obj$data.list;
    var list_id = list == null ? void 0 : list.id_str;
    var name = list == null ? void 0 : list.name;
    listAdd(list_id, name);
  }
  if (/^\/i\/api\/graphql\/\S+\/ListAddMember$/.test(url.pathname)) {
    var _obj$data2;
    if (!currentProfileId) return;
    var _obj = JSON.parse(xhr.response);
    var _list_id = _obj == null || (_obj$data2 = _obj.data) == null || (_obj$data2 = _obj$data2.list) == null ? void 0 : _obj$data2.id_str;
    if (!_list_id) return;
    memberListAdd(currentProfileId, _list_id);
    loadMemberLists();
  }
  // /i/api/graphql/c2IzeyWiwaQBkFs2VV_vSA/ListRemoveMember
  if (/^\/i\/api\/graphql\/\S+\/ListRemoveMember$/.test(url.pathname)) {
    var _obj2$data;
    log(currentProfileId);
    if (!currentProfileId) return;
    var _obj2 = JSON.parse(xhr.response);
    var _list_id2 = _obj2 == null || (_obj2$data = _obj2.data) == null || (_obj2$data = _obj2$data.list) == null ? void 0 : _obj2$data.id_str;
    log(_list_id2);
    if (!_list_id2) return;
    memberListRemove(currentProfileId, _list_id2);
    loadMemberLists();
  }
  if (/^\/i\/api\/1\.1\/lists\/memberships\.json$/.test(url.pathname)) {
    var _obj3 = JSON.parse(xhr.response);
    var lists = _obj3 == null ? void 0 : _obj3.lists;
    if (!lists) return;
    var user_id = url.searchParams.get("user_id");
    if (!user_id) return;
    var list_ids = lists == null ? void 0 : lists.flatMap(function (l) {
      return l == null ? void 0 : l.id_str;
    });
    memberListAdd.apply(void 0, [user_id].concat(list_ids));
  }
  if (/^\/i\/api\/graphql\/\S+\/ListMembers$/.test(url.pathname)) {
    var _JSON$parse, _obj4$data, _instructions$find;
    var _obj4 = JSON.parse(xhr.response);
    var variables = url.searchParams.get("variables");
    if (!variables) return;
    var _list_id3 = (_JSON$parse = JSON.parse(variables)) == null ? void 0 : _JSON$parse.listId;
    if (!_list_id3) return;
    var instructions = _obj4 == null || (_obj4$data = _obj4.data) == null || (_obj4$data = _obj4$data.list) == null || (_obj4$data = _obj4$data.members_timeline) == null || (_obj4$data = _obj4$data.timeline) == null ? void 0 : _obj4$data.instructions;
    if (!instructions) return;
    var entries = instructions == null || (_instructions$find = instructions.find(function (instruction) {
      return (instruction == null ? void 0 : instruction.type) == "TimelineAddEntries";
    })) == null ? void 0 : _instructions$find.entries;
    if (!entries) return;
    var userEntries = entries == null ? void 0 : entries.filter(function (entry) {
      var _entry$entryId;
      return entry == null || (_entry$entryId = entry.entryId) == null ? void 0 : _entry$entryId.startsWith("user-");
    });
    var user_ids = [];
    for (var _iterator2 = _createForOfIteratorHelperLoose(userEntries), _step2; !(_step2 = _iterator2()).done;) {
      var _entry$content;
      var entry = _step2.value;
      var _user_id = entry == null || (_entry$content = entry.content) == null || (_entry$content = _entry$content.itemContent) == null || (_entry$content = _entry$content.user_results) == null || (_entry$content = _entry$content.result) == null ? void 0 : _entry$content.rest_id;
      user_ids.push(_user_id);
    }
    listMemberAdd(_list_id3, user_ids);
  }
  if (/^\/i\/api\/graphql\/\S+\/ListsManagementPageTimeline$/.test(url.pathname)) {
    var _obj5$data, _instructions$filter, _entries$filter;
    var _obj5 = JSON.parse(xhr.response);
    var _instructions = _obj5 == null || (_obj5$data = _obj5.data) == null || (_obj5$data = _obj5$data.viewer) == null || (_obj5$data = _obj5$data.list_management_timeline) == null || (_obj5$data = _obj5$data.timeline) == null ? void 0 : _obj5$data.instructions;
    if (!_instructions) return;
    var _entries = (_instructions$filter = _instructions.filter(function (instruction) {
      return (instruction == null ? void 0 : instruction.type) == "TimelineAddEntries";
    })) == null || (_instructions$filter = _instructions$filter.at(0)) == null ? void 0 : _instructions$filter.entries;
    if (!_entries) return;
    var items = (_entries$filter = _entries.filter(function (entry) {
      return (entry == null ? void 0 : entry.entryId) == "owned-subscribed-list-module-0";
    })) == null || (_entries$filter = _entries$filter.at(0)) == null || (_entries$filter = _entries$filter.content) == null ? void 0 : _entries$filter.items;
    if (!items) return;
    var _lists = items == null ? void 0 : items.flatMap(function (item) {
      var _item$item;
      return item == null || (_item$item = item.item) == null || (_item$item = _item$item.itemContent) == null ? void 0 : _item$item.list;
    });
    GM_lock("lock_list", function () {
      var lists_prev = GM_getValue("lists", {});
      for (var _iterator3 = _createForOfIteratorHelperLoose(_lists), _step3; !(_step3 = _iterator3()).done;) {
        var l = _step3.value;
        var id = l == null ? void 0 : l.id_str;
        var _name2 = l == null ? void 0 : l.name;
        if (!id || !_name2) continue;
        lists_prev[id] = _name2;
      }
      GM_setValue("lists", lists_prev);
    });
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
var processSpan = function processSpan(span) {
  if (span.childElementCount > 0) return;
  var regex = /(総?作画?監督?|第?(2|２|二)原画?|原画|コンテ|演出|脚本|担当|美術|背景|制作|仕上|動画?検査?|手伝い|参加|カット|レイアウト|key animat(or|ion)|\bcuts?\b|\bgenga\b|\bnigen\b|\blo\b|sakkan|layouts?|storyboards?|animation direction|\bpart\b|episode director)/gi;
  if (!regex.test(span.textContent)) return;
  var el = document.createElement("span");
  el.classList.add("tools-highlight");
  el.innerText = "REPLACE";
  span.innerHTML = span.innerHTML.replaceAll(regex, el.outerHTML.replace("REPLACE", "$$&"));
};
VM.observe(document.body, function (mutations) {
  for (var _iterator4 = _createForOfIteratorHelperLoose(mutations), _step4; !(_step4 = _iterator4()).done;) {
    var _target$parentElement;
    var mutation = _step4.value;
    var target = mutation.target;
    if (mutation.type == "characterData" && ((_target$parentElement = target.parentElement) == null || (_target$parentElement = _target$parentElement.parentElement) == null ? void 0 : _target$parentElement.dataset["testid"]) == "tweetText" && target.parentElement instanceof HTMLSpanElement) {
      processSpan(target.parentElement);
    } else if (mutation.type == "childList" && target instanceof HTMLElement) {
      var _target$parentElement2;
      if (target.dataset["testid"] == "tweetText") {
        // log("show more", target, mutation.addedNodes)
        for (var _iterator5 = _createForOfIteratorHelperLoose(mutation.addedNodes), _step5; !(_step5 = _iterator5()).done;) {
          var addedNode = _step5.value;
          var span = addedNode;
          if (!(span instanceof HTMLSpanElement)) continue;
          processSpan(span);
        }
      }
      if ((_target$parentElement2 = target.parentElement) != null && (_target$parentElement2 = _target$parentElement2.ariaLabel) != null && _target$parentElement2.startsWith("Timeline: ")) {
        // log("posts", target, mutation.addedNodes)
        for (var _iterator6 = _createForOfIteratorHelperLoose(mutation.addedNodes), _step6; !(_step6 = _iterator6()).done;) {
          var _addedNode = _step6.value;
          var el = _addedNode;
          if (!(el instanceof HTMLDivElement)) continue;
          var tweetTexts = el.querySelectorAll('[data-testid="tweetText"]');
          for (var _iterator7 = _createForOfIteratorHelperLoose(tweetTexts), _step7; !(_step7 = _iterator7()).done;) {
            var tweetText = _step7.value;
            var spans = tweetText.querySelectorAll("span");
            for (var _iterator8 = _createForOfIteratorHelperLoose(spans), _step8; !(_step8 = _iterator8()).done;) {
              var _span = _step8.value;
              processSpan(_span);
            }
          }
        }
      }
    }
  }
}, {
  characterData: true
});
VM.observe(document.head, function () {
  var _obj$mainEntity;
  var userProfileSchema = document.querySelector("script[data-testid=UserProfileSchema-test]");
  if (!userProfileSchema) {
    clearMemberLists();
    return;
  }
  var obj = JSON.parse(userProfileSchema == null ? void 0 : userProfileSchema.textContent);
  if (obj["@type"] != "ProfilePage" || (obj == null ? void 0 : obj.mainEntity["@type"]) != "Person") {
    clearMemberLists();
    return;
  }
  currentProfileId = obj == null || (_obj$mainEntity = obj.mainEntity) == null ? void 0 : _obj$mainEntity.identifier;
  loadMemberLists();
});
document.addEventListener("copy", function (event) {
  var _document$getSelectio;
  var textSelection = (_document$getSelectio = document.getSelection()) == null ? void 0 : _document$getSelectio.toString();
  if (!textSelection) return;
  if (!URL.canParse(textSelection)) return;
  var url = URL.parse(textSelection);
  if (!url) return;
  if (url.hostname != "x.com") return;
  var re = /^\/\S+\/status\/(\d+)$/;
  var match = url.pathname.match(re);
  if (!match) return;
  var snowflakeId = match.at(1);
  if (!snowflakeId) return;
  if (!event.clipboardData) return;
  event.clipboardData.setData("text/plain", snowflakeId);
  event.preventDefault();
});
function PanelMain() {
  return function () {
    var _el$ = _tmpl$();
    insert(_el$, createComponent(For, {
      get each() {
        return currentUserLists();
      },
      children: function children(id) {
        return function () {
          var _el$2 = _tmpl$2();
          insert(_el$2, id);
          return _el$2;
        }();
      }
    }));
    createRenderEffect(function () {
      return className(_el$, styles["list"]);
    });
    return _el$;
  }();
}
var panelMain = ui.getPanel({
  style: stylesheet
});
Object.assign(panelMain.wrapper.style, {
  left: "8px",
  bottom: "8px"
});
Object.assign(panelMain.body.style, {
  borderRadius: "8px",
  padding: "4px"
});
render(PanelMain, panelMain.body);

})(VM, VM);
