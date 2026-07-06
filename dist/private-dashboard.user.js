// ==UserScript==
// @name        Private Dashboard
// @match       *://d*h.k*a*f*a.moe/*
// @require     https://unpkg.com/gm-compat@1.1.0
// @require     https://cdn.jsdelivr.net/npm/@violentmonkey/dom@2
// @require     https://cdn.jsdelivr.net/npm/@violentmonkey/ui@0.7
// @version     0.1
// @author      JasonKhew96
// @downloadURL https://github.com/JasonKhew96/userscript/raw/refs/heads/master/dist/private-dashboard.user.js
// @grant       GM_addElement
// @grant       GM_addStyle
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_xmlhttpRequest
// @grant       unsafeWindow
// ==/UserScript==

(function (ui) {
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

const narrowedError = name => `Stale read from <${name}>.`;
function For(props) {
  const fallback = "fallback" in props && {
    fallback: () => props.fallback
  };
  return createMemo(mapArray(() => props.each, props.children, fallback || undefined));
}
function Show(props) {
  const keyed = props.keyed;
  const conditionValue = createMemo(() => props.when, undefined, undefined);
  const condition = keyed ? conditionValue : createMemo(conditionValue, undefined, {
    equals: (a, b) => !a === !b
  });
  return createMemo(() => {
    const c = condition();
    if (c) {
      const child = props.children;
      const fn = typeof child === "function" && child.length > 0;
      return fn ? untrack(() => child(keyed ? c : () => {
        if (!untrack(condition)) throw narrowedError("Show");
        return conditionValue();
      })) : child;
    }
    return props.fallback;
  }, undefined, undefined);
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

const $$EVENTS = "_$DX_DELEGATE";
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
function delegateEvents(eventNames, document = window.document) {
  const e = document[$$EVENTS] || (document[$$EVENTS] = new Set());
  for (let i = 0, l = eventNames.length; i < l; i++) {
    const name = eventNames[i];
    if (!e.has(name)) {
      e.add(name);
      document.addEventListener(name, eventHandler);
    }
  }
}
function className(node, value) {
  if (value == null) node.removeAttribute("class");else node.className = value;
}
function insert(parent, accessor, marker, initial) {
  if (marker !== undefined && !initial) initial = [];
  if (typeof accessor !== "function") return insertExpression(parent, accessor, initial, marker);
  createRenderEffect(current => insertExpression(parent, accessor(), current, marker), initial);
}
function eventHandler(e) {
  let node = e.target;
  const key = `$$${e.type}`;
  const oriTarget = e.target;
  const oriCurrentTarget = e.currentTarget;
  const retarget = value => Object.defineProperty(e, "target", {
    configurable: true,
    value
  });
  const handleNode = () => {
    const handler = node[key];
    if (handler && !node.disabled) {
      const data = node[`${key}Data`];
      data !== undefined ? handler.call(node, data, e) : handler.call(node, e);
      if (e.cancelBubble) return;
    }
    node.host && typeof node.host !== "string" && !node.host._$host && node.contains(e.target) && retarget(node.host);
    return true;
  };
  const walkUpTree = () => {
    while (handleNode() && (node = node._$host || node.parentNode || node.host));
  };
  Object.defineProperty(e, "currentTarget", {
    configurable: true,
    get() {
      return node || document;
    }
  });
  if (e.composedPath) {
    const path = e.composedPath();
    retarget(path[0]);
    for (let i = 0; i < path.length - 2; i++) {
      node = path[i];
      if (!handleNode()) break;
      if (node._$host) {
        node = node._$host;
        walkUpTree();
        break;
      }
      if (node.parentNode === oriCurrentTarget) {
        break;
      }
    }
  }
  else walkUpTree();
  retarget(oriTarget);
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

var css_248z = "";

var styles = {"divider":"style-module_divider__7KOuN","panel-config":"style-module_panel-config__IcW-B","panel-search":"style-module_panel-search__RQgOc","list-scroll":"style-module_list-scroll__wesLr"};
var stylesheet="*,:after,:before{--un-rotate:0;--un-rotate-x:0;--un-rotate-y:0;--un-rotate-z:0;--un-scale-x:1;--un-scale-y:1;--un-scale-z:1;--un-skew-x:0;--un-skew-y:0;--un-translate-x:0;--un-translate-y:0;--un-translate-z:0;--un-pan-x: ;--un-pan-y: ;--un-pinch-zoom: ;--un-scroll-snap-strictness:proximity;--un-ordinal: ;--un-slashed-zero: ;--un-numeric-figure: ;--un-numeric-spacing: ;--un-numeric-fraction: ;--un-border-spacing-x:0;--un-border-spacing-y:0;--un-ring-offset-shadow:0 0 transparent;--un-ring-shadow:0 0 transparent;--un-shadow-inset: ;--un-shadow:0 0 transparent;--un-ring-inset: ;--un-ring-offset-width:0px;--un-ring-offset-color:#fff;--un-ring-width:0px;--un-ring-color:rgba(147,197,253,.5);--un-blur: ;--un-brightness: ;--un-contrast: ;--un-drop-shadow: ;--un-grayscale: ;--un-hue-rotate: ;--un-invert: ;--un-saturate: ;--un-sepia: ;--un-backdrop-blur: ;--un-backdrop-brightness: ;--un-backdrop-contrast: ;--un-backdrop-grayscale: ;--un-backdrop-hue-rotate: ;--un-backdrop-invert: ;--un-backdrop-opacity: ;--un-backdrop-saturate: ;--un-backdrop-sepia: }::backdrop{--un-rotate:0;--un-rotate-x:0;--un-rotate-y:0;--un-rotate-z:0;--un-scale-x:1;--un-scale-y:1;--un-scale-z:1;--un-skew-x:0;--un-skew-y:0;--un-translate-x:0;--un-translate-y:0;--un-translate-z:0;--un-pan-x: ;--un-pan-y: ;--un-pinch-zoom: ;--un-scroll-snap-strictness:proximity;--un-ordinal: ;--un-slashed-zero: ;--un-numeric-figure: ;--un-numeric-spacing: ;--un-numeric-fraction: ;--un-border-spacing-x:0;--un-border-spacing-y:0;--un-ring-offset-shadow:0 0 transparent;--un-ring-shadow:0 0 transparent;--un-shadow-inset: ;--un-shadow:0 0 transparent;--un-ring-inset: ;--un-ring-offset-width:0px;--un-ring-offset-color:#fff;--un-ring-width:0px;--un-ring-color:rgba(147,197,253,.5);--un-blur: ;--un-brightness: ;--un-contrast: ;--un-drop-shadow: ;--un-grayscale: ;--un-hue-rotate: ;--un-invert: ;--un-saturate: ;--un-sepia: ;--un-backdrop-blur: ;--un-backdrop-brightness: ;--un-backdrop-contrast: ;--un-backdrop-grayscale: ;--un-backdrop-hue-rotate: ;--un-backdrop-invert: ;--un-backdrop-opacity: ;--un-backdrop-saturate: ;--un-backdrop-sepia: }.style-module_count__EFG10{--un-text-opacity:1;color:rgb(249 115 22/var(--un-text-opacity))}.style-module_plus1__9RMn-{float:right}.style-module_divider__7KOuN{--un-border-opacity:1;border-color:rgb(209 213 219/var(--un-border-opacity));border-top-width:1px;margin-bottom:.5rem;margin-top:.5rem}.style-module_panel-config__IcW-B{display:flex;flex-direction:column;gap:.5rem}.style-module_panel-search__RQgOc{display:flex;flex-direction:row;gap:.5rem}.style-module_list-scroll__wesLr{max-height:90vh;overflow-y:auto}";

var _tmpl$ = /*#__PURE__*/template(`<div><div></div><div></div><div></div><div>`),
  _tmpl$2 = /*#__PURE__*/template(`<form><div><label for=token_tmdb>TMDB Token: </label><input aria-label=token_tmdb></div><div><label for=token_mal>MAL Token: </label><input aria-label=token_mal></div><button>Submit`),
  _tmpl$3 = /*#__PURE__*/template(`<div><form><input type=text placeholder=search required><select name=platform><option value=tmdb>TMDB</option><option value=bgm>BGM</option><option value=mal>MAL</option><option value=anilist>AniList</option></select><button>Search</button></form><div>`),
  _tmpl$4 = /*#__PURE__*/template(`<hr>`),
  _tmpl$5 = /*#__PURE__*/template(`<div><button>Show</button><button>Settings`);
function _createForOfIteratorHelperLoose(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (t) return (t = t.call(r)).next.bind(t); if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e) { t && (r = t); var o = 0; return function () { return o >= r.length ? { done: true } : { done: false, value: r[o++] }; }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
var settings = GM_getValue("config", {
  token_tmdb: "",
  token_mal: ""
});
function SearchItem(props) {
  return function () {
    var _el$ = _tmpl$(),
      _el$2 = _el$.firstChild,
      _el$3 = _el$2.nextSibling,
      _el$4 = _el$3.nextSibling,
      _el$5 = _el$4.nextSibling;
    _el$.$$click = function () {
      return props.onSelect(props.link);
    };
    insert(_el$2, function () {
      return props.title;
    });
    insert(_el$3, function () {
      return props.title_original;
    });
    insert(_el$4, function () {
      return props.air_date;
    });
    insert(_el$5, function () {
      return props.link;
    });
    return _el$;
  }();
}
function searchTMDB(keyword, onLoad) {
  var params = {
    query: keyword
  };
  GM_xmlhttpRequest({
    url: "https://api.themoviedb.org/3/search/multi?" + new URLSearchParams(params).toString(),
    method: "GET",
    timeout: 10000,
    responseType: "json",
    headers: {
      Authorization: "Bearer " + settings.token_tmdb
    },
    anonymous: true,
    onload: onLoad
  });
}
function searchBgm(keyword, onLoad) {
  var payload = {
    keyword: keyword,
    filter: {
      type: [2]
    }
  };
  GM_xmlhttpRequest({
    url: "https://api.bgm.tv/v0/search/subjects",
    method: "POST",
    data: JSON.stringify(payload),
    timeout: 10000,
    responseType: "json",
    anonymous: true,
    onload: onLoad
  });
}
function searchMal(keyword, onLoad) {
  var params = {
    q: keyword,
    fields: "id,title,alternative_titles,start_date"
  };
  GM_xmlhttpRequest({
    url: "https://api.myanimelist.net/v2/anime?" + new URLSearchParams(params).toString(),
    method: "GET",
    timeout: 10000,
    responseType: "json",
    headers: {
      "X-MAL-CLIENT-ID": settings.token_mal
    },
    anonymous: true,
    onload: onLoad
  });
}
function searchAnilist(keyword, onLoad) {
  var query = "\n    query ($search: String!) {\n      Page {\n        media(search: $search, type: ANIME) {\n          id\n          seasonYear\n          seasonInt\n          title {\n            romaji\n            english\n            native\n          }\n        }\n      }\n    }\n  ";
  GM_xmlhttpRequest({
    url: "https://graphql.anilist.co",
    method: "POST",
    timeout: 10000,
    responseType: "json",
    data: JSON.stringify({
      query: query,
      variables: {
        search: keyword
      }
    }),
    headers: {
      "Content-Type": "application/json"
    },
    anonymous: true,
    onload: onLoad
  });
}
function PanelSettings() {
  var _settings$token_tmdb, _settings$token_mal;
  var _createSignal = createSignal((_settings$token_tmdb = settings == null ? void 0 : settings.token_tmdb) != null ? _settings$token_tmdb : ""),
    tmdbToken = _createSignal[0],
    setTmdbToken = _createSignal[1];
  var _createSignal2 = createSignal((_settings$token_mal = settings == null ? void 0 : settings.token_mal) != null ? _settings$token_mal : ""),
    malToken = _createSignal2[0],
    setMalToken = _createSignal2[1];
  var onSubmit = function onSubmit(e) {
    e.preventDefault();
    settings.token_tmdb = tmdbToken();
    settings.token_mal = malToken();
    GM_setValue("config", settings);
  };
  return function () {
    var _el$6 = _tmpl$2(),
      _el$7 = _el$6.firstChild,
      _el$8 = _el$7.firstChild,
      _el$9 = _el$8.nextSibling,
      _el$0 = _el$7.nextSibling,
      _el$1 = _el$0.firstChild,
      _el$10 = _el$1.nextSibling;
    _el$6.addEventListener("submit", onSubmit);
    _el$9.addEventListener("change", function (e) {
      setTmdbToken(e.currentTarget.value);
    });
    _el$10.addEventListener("change", function (e) {
      setMalToken(e.currentTarget.value);
    });
    createRenderEffect(function () {
      return _el$9.value = tmdbToken();
    });
    createRenderEffect(function () {
      return _el$10.value = malToken();
    });
    return _el$6;
  }();
}
function PanelSearch() {
  var _createSignal3 = createSignal(""),
    query = _createSignal3[0],
    setQuery = _createSignal3[1];
  var _createSignal4 = createSignal("tmdb"),
    platform = _createSignal4[0],
    setPlatform = _createSignal4[1];
  var _createSignal5 = createSignal([]),
    items = _createSignal5[0],
    setItems = _createSignal5[1];
  var onSearch = function onSearch(e) {
    e.preventDefault();
    switch (platform()) {
      case "tmdb":
        searchTMDB(query(), function (r) {
          var obj = r.response;
          if (obj.total_results <= 0) return;
          var a = [];
          for (var _iterator = _createForOfIteratorHelperLoose(obj.results), _step; !(_step = _iterator()).done;) {
            var result = _step.value;
            a.push({
              title: result.name,
              title_original: result.original_name,
              air_date: result.first_air_date,
              link: "https://www.themoviedb.org/" + result.media_type + "/" + result.id
            });
          }
          setItems(a);
        });
        break;
      case "bgm":
        searchBgm(query(), function (r) {
          var obj = r.response;
          if (obj.total <= 0) return;
          var a = [];
          for (var _iterator2 = _createForOfIteratorHelperLoose(obj.data), _step2; !(_step2 = _iterator2()).done;) {
            var result = _step2.value;
            a.push({
              title: result.name_cn,
              title_original: result.name,
              air_date: result.date,
              link: "https://bgm.tv/subject/" + result.id
            });
          }
          setItems(a);
        });
        break;
      case "mal":
        searchMal(query(), function (r) {
          var obj = r.response;
          var a = [];
          for (var _iterator3 = _createForOfIteratorHelperLoose(obj.data), _step3; !(_step3 = _iterator3()).done;) {
            var result = _step3.value;
            var node = result.node;
            a.push({
              title: node.title,
              title_original: node.alternative_titles.ja,
              air_date: node.start_date,
              link: "https://myanimelist.net/anime/" + node.id
            });
          }
          setItems(a);
        });
        break;
      case "anilist":
        searchAnilist(query(), function (r) {
          var obj = r.response;
          var a = [];
          for (var _iterator4 = _createForOfIteratorHelperLoose(obj.data.Page.media), _step4; !(_step4 = _iterator4()).done;) {
            var result = _step4.value;
            a.push({
              title: result.title.romaji,
              title_original: result.title["native"],
              air_date: result.seasonYear + "-" + result.seasonInt,
              link: "https://anilist.co/anime/" + result.id
            });
          }
          setItems(a);
        });
        break;
    }
  };
  var onSelect = function onSelect(url) {
    var input = null;
    switch (platform()) {
      case "tmdb":
        input = document.querySelector("input[placeholder^='https://www.themoviedb.org/tv/']");
        break;
      case "bgm":
        input = document.querySelector("input[placeholder^='https://bgm.tv/subject/']");
        break;
      case "mal":
        input = document.querySelector("input[placeholder^='https://myanimelist.net/anime/']");
        break;
      case "anilist":
        input = document.querySelector("input[placeholder^='https://anilist.co/anime/']");
        break;
    }
    if (!input) return;
    input.value = url;
    input.dispatchEvent(new Event("input"));
  };
  return function () {
    var _el$11 = _tmpl$3(),
      _el$12 = _el$11.firstChild,
      _el$13 = _el$12.firstChild,
      _el$14 = _el$13.nextSibling,
      _el$15 = _el$12.nextSibling;
    _el$12.addEventListener("submit", onSearch);
    _el$13.$$input = function (e) {
      setQuery(e.currentTarget.value);
    };
    _el$14.addEventListener("change", function (e) {
      return setPlatform(e.currentTarget.value);
    });
    insert(_el$15, createComponent(For, {
      get each() {
        return items();
      },
      children: function children(item, index) {
        return [createComponent(SearchItem, {
          get title() {
            return item.title;
          },
          get title_original() {
            return item.title_original;
          },
          get air_date() {
            return item.air_date;
          },
          get link() {
            return item.link;
          },
          onSelect: onSelect
        }), createComponent(Show, {
          get when() {
            return index() < items().length - 1;
          },
          get children() {
            var _el$16 = _tmpl$4();
            createRenderEffect(function () {
              return className(_el$16, styles.divider);
            });
            return _el$16;
          }
        })];
      }
    }));
    createRenderEffect(function (_p$) {
      var _v$ = styles["panel-search"],
        _v$2 = styles["list-scroll"];
      _v$ !== _p$.e && className(_el$12, _p$.e = _v$);
      _v$2 !== _p$.t && className(_el$15, _p$.t = _v$2);
      return _p$;
    }, {
      e: undefined,
      t: undefined
    });
    createRenderEffect(function () {
      return _el$13.value = query();
    });
    createRenderEffect(function () {
      return _el$14.value = platform();
    });
    return _el$11;
  }();
}
function PanelMain() {
  var _createSignal6 = createSignal(false),
    isShowSearch = _createSignal6[0],
    setIsShowSearch = _createSignal6[1];
  var _createSignal7 = createSignal(false),
    isShowSettings = _createSignal7[0],
    setIsShowSettings = _createSignal7[1];
  var centerDiv = {
    top: "0px",
    left: "0px",
    height: "100vh",
    width: "100vw",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  };
  var panelSearch = ui.getPanel({
    theme: "dark",
    style: stylesheet
  });
  Object.assign(panelSearch.wrapper.style, centerDiv);
  panelSearch.setMovable(false);
  render(PanelSearch, panelSearch.body);
  var panelSettings = ui.getPanel({
    theme: "dark",
    style: stylesheet
  });
  Object.assign(panelSettings.wrapper.style, centerDiv);
  panelSettings.setMovable(false);
  render(PanelSettings, panelSettings.body);
  var onClick = function onClick() {
    setIsShowSearch(!isShowSearch());
    if (isShowSearch()) {
      panelSearch.show();
    } else {
      panelSearch.hide();
    }
  };
  var onSettingsClick = function onSettingsClick() {
    setIsShowSettings(!isShowSettings());
    if (isShowSettings()) {
      panelSettings.show();
    } else {
      panelSettings.hide();
    }
  };
  panelSearch.wrapper.addEventListener("click", function (e) {
    if (e.target == panelSearch.wrapper) {
      onClick();
    }
  });
  panelSettings.wrapper.addEventListener("click", function (e) {
    if (e.target == panelSettings.wrapper) {
      onSettingsClick();
    }
  });
  return function () {
    var _el$17 = _tmpl$5(),
      _el$18 = _el$17.firstChild,
      _el$19 = _el$18.nextSibling;
    _el$18.$$click = onClick;
    _el$19.$$click = onSettingsClick;
    createRenderEffect(function () {
      return className(_el$17, styles["panel-config"]);
    });
    return _el$17;
  }();
}
GM_addStyle(css_248z);
var panelMain = ui.getPanel({
  theme: "dark",
  style: stylesheet
});
Object.assign(panelMain.wrapper.style, {
  left: "8px",
  bottom: "8px"
});
Object.assign(panelMain.body.style, {
  borderRadius: "8px"
});
// panel.setMovable(false)
panelMain.show();
render(PanelMain, panelMain.body);
delegateEvents(["click", "input"]);

})(VM);
