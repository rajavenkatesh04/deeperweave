const RUNTIME_PUBLIC_PATH = "server/chunks/[turbopack]_runtime.js";
const RELATIVE_ROOT_PATH = "..";
const ASSET_PREFIX = "/";
/**
 * This file contains runtime types and functions that are shared between all
 * TurboPack ECMAScript runtimes.
 *
 * It will be prepended to the runtime code of each runtime.
 */ /* eslint-disable @typescript-eslint/no-unused-vars */ /// <reference path="./runtime-types.d.ts" />
const REEXPORTED_OBJECTS = new WeakMap();
/**
 * Constructs the `__turbopack_context__` object for a module.
 */ function Context(module, exports) {
    this.m = module;
    // We need to store this here instead of accessing it from the module object to:
    // 1. Make it available to factories directly, since we rewrite `this` to
    //    `__turbopack_context__.e` in CJS modules.
    // 2. Support async modules which rewrite `module.exports` to a promise, so we
    //    can still access the original exports object from functions like
    //    `esmExport`
    // Ideally we could find a new approach for async modules and drop this property altogether.
    this.e = exports;
}
const contextPrototype = Context.prototype;
const hasOwnProperty = Object.prototype.hasOwnProperty;
const toStringTag = typeof Symbol !== 'undefined' && Symbol.toStringTag;
function defineProp(obj, name, options) {
    if (!hasOwnProperty.call(obj, name)) Object.defineProperty(obj, name, options);
}
function getOverwrittenModule(moduleCache, id) {
    let module = moduleCache[id];
    if (!module) {
        // This is invoked when a module is merged into another module, thus it wasn't invoked via
        // instantiateModule and the cache entry wasn't created yet.
        module = createModuleObject(id);
        moduleCache[id] = module;
    }
    return module;
}
/**
 * Creates the module object. Only done here to ensure all module objects have the same shape.
 */ function createModuleObject(id) {
    return {
        exports: {},
        error: undefined,
        id,
        namespaceObject: undefined
    };
}
const BindingTag_Value = 0;
/**
 * Adds the getters to the exports object.
 */ function esm(exports, bindings) {
    defineProp(exports, '__esModule', {
        value: true
    });
    if (toStringTag) defineProp(exports, toStringTag, {
        value: 'Module'
    });
    let i = 0;
    while(i < bindings.length){
        const propName = bindings[i++];
        const tagOrFunction = bindings[i++];
        if (typeof tagOrFunction === 'number') {
            if (tagOrFunction === BindingTag_Value) {
                defineProp(exports, propName, {
                    value: bindings[i++],
                    enumerable: true,
                    writable: false
                });
            } else {
                throw new Error(`unexpected tag: ${tagOrFunction}`);
            }
        } else {
            const getterFn = tagOrFunction;
            if (typeof bindings[i] === 'function') {
                const setterFn = bindings[i++];
                defineProp(exports, propName, {
                    get: getterFn,
                    set: setterFn,
                    enumerable: true
                });
            } else {
                defineProp(exports, propName, {
                    get: getterFn,
                    enumerable: true
                });
            }
        }
    }
    Object.seal(exports);
}
/**
 * Makes the module an ESM with exports
 */ function esmExport(bindings, id) {
    let module;
    let exports;
    if (id != null) {
        module = getOverwrittenModule(this.c, id);
        exports = module.exports;
    } else {
        module = this.m;
        exports = this.e;
    }
    module.namespaceObject = exports;
    esm(exports, bindings);
}
contextPrototype.s = esmExport;
function ensureDynamicExports(module, exports) {
    let reexportedObjects = REEXPORTED_OBJECTS.get(module);
    if (!reexportedObjects) {
        REEXPORTED_OBJECTS.set(module, reexportedObjects = []);
        module.exports = module.namespaceObject = new Proxy(exports, {
            get (target, prop) {
                if (hasOwnProperty.call(target, prop) || prop === 'default' || prop === '__esModule') {
                    return Reflect.get(target, prop);
                }
                for (const obj of reexportedObjects){
                    const value = Reflect.get(obj, prop);
                    if (value !== undefined) return value;
                }
                return undefined;
            },
            ownKeys (target) {
                const keys = Reflect.ownKeys(target);
                for (const obj of reexportedObjects){
                    for (const key of Reflect.ownKeys(obj)){
                        if (key !== 'default' && !keys.includes(key)) keys.push(key);
                    }
                }
                return keys;
            }
        });
    }
    return reexportedObjects;
}
/**
 * Dynamically exports properties from an object
 */ function dynamicExport(object, id) {
    let module;
    let exports;
    if (id != null) {
        module = getOverwrittenModule(this.c, id);
        exports = module.exports;
    } else {
        module = this.m;
        exports = this.e;
    }
    const reexportedObjects = ensureDynamicExports(module, exports);
    if (typeof object === 'object' && object !== null) {
        reexportedObjects.push(object);
    }
}
contextPrototype.j = dynamicExport;
function exportValue(value, id) {
    let module;
    if (id != null) {
        module = getOverwrittenModule(this.c, id);
    } else {
        module = this.m;
    }
    module.exports = value;
}
contextPrototype.v = exportValue;
function exportNamespace(namespace, id) {
    let module;
    if (id != null) {
        module = getOverwrittenModule(this.c, id);
    } else {
        module = this.m;
    }
    module.exports = module.namespaceObject = namespace;
}
contextPrototype.n = exportNamespace;
function createGetter(obj, key) {
    return ()=>obj[key];
}
/**
 * @returns prototype of the object
 */ const getProto = Object.getPrototypeOf ? (obj)=>Object.getPrototypeOf(obj) : (obj)=>obj.__proto__;
/** Prototypes that are not expanded for exports */ const LEAF_PROTOTYPES = [
    null,
    getProto({}),
    getProto([]),
    getProto(getProto)
];
/**
 * @param raw
 * @param ns
 * @param allowExportDefault
 *   * `false`: will have the raw module as default export
 *   * `true`: will have the default property as default export
 */ function interopEsm(raw, ns, allowExportDefault) {
    const bindings = [];
    let defaultLocation = -1;
    for(let current = raw; (typeof current === 'object' || typeof current === 'function') && !LEAF_PROTOTYPES.includes(current); current = getProto(current)){
        for (const key of Object.getOwnPropertyNames(current)){
            bindings.push(key, createGetter(raw, key));
            if (defaultLocation === -1 && key === 'default') {
                defaultLocation = bindings.length - 1;
            }
        }
    }
    // this is not really correct
    // we should set the `default` getter if the imported module is a `.cjs file`
    if (!(allowExportDefault && defaultLocation >= 0)) {
        // Replace the binding with one for the namespace itself in order to preserve iteration order.
        if (defaultLocation >= 0) {
            // Replace the getter with the value
            bindings.splice(defaultLocation, 1, BindingTag_Value, raw);
        } else {
            bindings.push('default', BindingTag_Value, raw);
        }
    }
    esm(ns, bindings);
    return ns;
}
function createNS(raw) {
    if (typeof raw === 'function') {
        return function(...args) {
            return raw.apply(this, args);
        };
    } else {
        return Object.create(null);
    }
}
function esmImport(id) {
    const module = getOrInstantiateModuleFromParent(id, this.m);
    // any ES module has to have `module.namespaceObject` defined.
    if (module.namespaceObject) return module.namespaceObject;
    // only ESM can be an async module, so we don't need to worry about exports being a promise here.
    const raw = module.exports;
    return module.namespaceObject = interopEsm(raw, createNS(raw), raw && raw.__esModule);
}
contextPrototype.i = esmImport;
function asyncLoader(moduleId) {
    const loader = this.r(moduleId);
    return loader(esmImport.bind(this));
}
contextPrototype.A = asyncLoader;
// Add a simple runtime require so that environments without one can still pass
// `typeof require` CommonJS checks so that exports are correctly registered.
const runtimeRequire = // @ts-ignore
typeof require === 'function' ? require : function require1() {
    throw new Error('Unexpected use of runtime require');
};
contextPrototype.t = runtimeRequire;
function commonJsRequire(id) {
    return getOrInstantiateModuleFromParent(id, this.m).exports;
}
contextPrototype.r = commonJsRequire;
/**
 * Remove fragments and query parameters since they are never part of the context map keys
 *
 * This matches how we parse patterns at resolving time.  Arguably we should only do this for
 * strings passed to `import` but the resolve does it for `import` and `require` and so we do
 * here as well.
 */ function parseRequest(request) {
    // Per the URI spec fragments can contain `?` characters, so we should trim it off first
    // https://datatracker.ietf.org/doc/html/rfc3986#section-3.5
    const hashIndex = request.indexOf('#');
    if (hashIndex !== -1) {
        request = request.substring(0, hashIndex);
    }
    const queryIndex = request.indexOf('?');
    if (queryIndex !== -1) {
        request = request.substring(0, queryIndex);
    }
    return request;
}
/**
 * `require.context` and require/import expression runtime.
 */ function moduleContext(map) {
    function moduleContext(id) {
        id = parseRequest(id);
        if (hasOwnProperty.call(map, id)) {
            return map[id].module();
        }
        const e = new Error(`Cannot find module '${id}'`);
        e.code = 'MODULE_NOT_FOUND';
        throw e;
    }
    moduleContext.keys = ()=>{
        return Object.keys(map);
    };
    moduleContext.resolve = (id)=>{
        id = parseRequest(id);
        if (hasOwnProperty.call(map, id)) {
            return map[id].id();
        }
        const e = new Error(`Cannot find module '${id}'`);
        e.code = 'MODULE_NOT_FOUND';
        throw e;
    };
    moduleContext.import = async (id)=>{
        return await moduleContext(id);
    };
    return moduleContext;
}
contextPrototype.f = moduleContext;
/**
 * Returns the path of a chunk defined by its data.
 */ function getChunkPath(chunkData) {
    return typeof chunkData === 'string' ? chunkData : chunkData.path;
}
function isPromise(maybePromise) {
    return maybePromise != null && typeof maybePromise === 'object' && 'then' in maybePromise && typeof maybePromise.then === 'function';
}
function isAsyncModuleExt(obj) {
    return turbopackQueues in obj;
}
function createPromise() {
    let resolve;
    let reject;
    const promise = new Promise((res, rej)=>{
        reject = rej;
        resolve = res;
    });
    return {
        promise,
        resolve: resolve,
        reject: reject
    };
}
// Load the CompressedmoduleFactories of a chunk into the `moduleFactories` Map.
// The CompressedModuleFactories format is
// - 1 or more module ids
// - a module factory function
// So walking this is a little complex but the flat structure is also fast to
// traverse, we can use `typeof` operators to distinguish the two cases.
function installCompressedModuleFactories(chunkModules, offset, moduleFactories, newModuleId) {
    let i = offset;
    while(i < chunkModules.length){
        let moduleId = chunkModules[i];
        let end = i + 1;
        // Find our factory function
        while(end < chunkModules.length && typeof chunkModules[end] !== 'function'){
            end++;
        }
        if (end === chunkModules.length) {
            throw new Error('malformed chunk format, expected a factory function');
        }
        // Each chunk item has a 'primary id' and optional additional ids. If the primary id is already
        // present we know all the additional ids are also present, so we don't need to check.
        if (!moduleFactories.has(moduleId)) {
            const moduleFactoryFn = chunkModules[end];
            applyModuleFactoryName(moduleFactoryFn);
            newModuleId?.(moduleId);
            for(; i < end; i++){
                moduleId = chunkModules[i];
                moduleFactories.set(moduleId, moduleFactoryFn);
            }
        }
        i = end + 1; // end is pointing at the last factory advance to the next id or the end of the array.
    }
}
// everything below is adapted from webpack
// https://github.com/webpack/webpack/blob/6be4065ade1e252c1d8dcba4af0f43e32af1bdc1/lib/runtime/AsyncModuleRuntimeModule.js#L13
const turbopackQueues = Symbol('turbopack queues');
const turbopackExports = Symbol('turbopack exports');
const turbopackError = Symbol('turbopack error');
function resolveQueue(queue) {
    if (queue && queue.status !== 1) {
        queue.status = 1;
        queue.forEach((fn)=>fn.queueCount--);
        queue.forEach((fn)=>fn.queueCount-- ? fn.queueCount++ : fn());
    }
}
function wrapDeps(deps) {
    return deps.map((dep)=>{
        if (dep !== null && typeof dep === 'object') {
            if (isAsyncModuleExt(dep)) return dep;
            if (isPromise(dep)) {
                const queue = Object.assign([], {
                    status: 0
                });
                const obj = {
                    [turbopackExports]: {},
                    [turbopackQueues]: (fn)=>fn(queue)
                };
                dep.then((res)=>{
                    obj[turbopackExports] = res;
                    resolveQueue(queue);
                }, (err)=>{
                    obj[turbopackError] = err;
                    resolveQueue(queue);
                });
                return obj;
            }
        }
        return {
            [turbopackExports]: dep,
            [turbopackQueues]: ()=>{}
        };
    });
}
function asyncModule(body, hasAwait) {
    const module = this.m;
    const queue = hasAwait ? Object.assign([], {
        status: -1
    }) : undefined;
    const depQueues = new Set();
    const { resolve, reject, promise: rawPromise } = createPromise();
    const promise = Object.assign(rawPromise, {
        [turbopackExports]: module.exports,
        [turbopackQueues]: (fn)=>{
            queue && fn(queue);
            depQueues.forEach(fn);
            promise['catch'](()=>{});
        }
    });
    const attributes = {
        get () {
            return promise;
        },
        set (v) {
            // Calling `esmExport` leads to this.
            if (v !== promise) {
                promise[turbopackExports] = v;
            }
        }
    };
    Object.defineProperty(module, 'exports', attributes);
    Object.defineProperty(module, 'namespaceObject', attributes);
    function handleAsyncDependencies(deps) {
        const currentDeps = wrapDeps(deps);
        const getResult = ()=>currentDeps.map((d)=>{
                if (d[turbopackError]) throw d[turbopackError];
                return d[turbopackExports];
            });
        const { promise, resolve } = createPromise();
        const fn = Object.assign(()=>resolve(getResult), {
            queueCount: 0
        });
        function fnQueue(q) {
            if (q !== queue && !depQueues.has(q)) {
                depQueues.add(q);
                if (q && q.status === 0) {
                    fn.queueCount++;
                    q.push(fn);
                }
            }
        }
        currentDeps.map((dep)=>dep[turbopackQueues](fnQueue));
        return fn.queueCount ? promise : getResult();
    }
    function asyncResult(err) {
        if (err) {
            reject(promise[turbopackError] = err);
        } else {
            resolve(promise[turbopackExports]);
        }
        resolveQueue(queue);
    }
    body(handleAsyncDependencies, asyncResult);
    if (queue && queue.status === -1) {
        queue.status = 0;
    }
}
contextPrototype.a = asyncModule;
/**
 * A pseudo "fake" URL object to resolve to its relative path.
 *
 * When UrlRewriteBehavior is set to relative, calls to the `new URL()` will construct url without base using this
 * runtime function to generate context-agnostic urls between different rendering context, i.e ssr / client to avoid
 * hydration mismatch.
 *
 * This is based on webpack's existing implementation:
 * https://github.com/webpack/webpack/blob/87660921808566ef3b8796f8df61bd79fc026108/lib/runtime/RelativeUrlRuntimeModule.js
 */ const relativeURL = function relativeURL(inputUrl) {
    const realUrl = new URL(inputUrl, 'x:/');
    const values = {};
    for(const key in realUrl)values[key] = realUrl[key];
    values.href = inputUrl;
    values.pathname = inputUrl.replace(/[?#].*/, '');
    values.origin = values.protocol = '';
    values.toString = values.toJSON = (..._args)=>inputUrl;
    for(const key in values)Object.defineProperty(this, key, {
        enumerable: true,
        configurable: true,
        value: values[key]
    });
};
relativeURL.prototype = URL.prototype;
contextPrototype.U = relativeURL;
/**
 * Utility function to ensure all variants of an enum are handled.
 */ function invariant(never, computeMessage) {
    throw new Error(`Invariant: ${computeMessage(never)}`);
}
/**
 * A stub function to make `require` available but non-functional in ESM.
 */ function requireStub(_moduleId) {
    throw new Error('dynamic usage of require is not supported');
}
contextPrototype.z = requireStub;
// Make `globalThis` available to the module in a way that cannot be shadowed by a local variable.
contextPrototype.g = globalThis;
function applyModuleFactoryName(factory) {
    // Give the module factory a nice name to improve stack traces.
    Object.defineProperty(factory, 'name', {
        value: 'module evaluation'
    });
}
/// <reference path="../shared/runtime-utils.ts" />
/// A 'base' utilities to support runtime can have externals.
/// Currently this is for node.js / edge runtime both.
/// If a fn requires node.js specific behavior, it should be placed in `node-external-utils` instead.
async function externalImport(id) {
    let raw;
    try {
        switch (id) {
  case "next/dist/compiled/@vercel/og/index.node.js":
    raw = await import("next/dist/compiled/@vercel/og/index.edge.js");
    break;
  default:
    raw = await import(id);
};
    } catch (err) {
        // TODO(alexkirsz) This can happen when a client-side module tries to load
        // an external module we don't provide a shim for (e.g. querystring, url).
        // For now, we fail semi-silently, but in the future this should be a
        // compilation error.
        throw new Error(`Failed to load external module ${id}: ${err}`);
    }
    if (raw && raw.__esModule && raw.default && 'default' in raw.default) {
        return interopEsm(raw.default, createNS(raw), true);
    }
    return raw;
}
contextPrototype.y = externalImport;
function externalRequire(id, thunk, esm = false) {
    let raw;
    try {
        raw = thunk();
    } catch (err) {
        // TODO(alexkirsz) This can happen when a client-side module tries to load
        // an external module we don't provide a shim for (e.g. querystring, url).
        // For now, we fail semi-silently, but in the future this should be a
        // compilation error.
        throw new Error(`Failed to load external module ${id}: ${err}`);
    }
    if (!esm || raw.__esModule) {
        return raw;
    }
    return interopEsm(raw, createNS(raw), true);
}
externalRequire.resolve = (id, options)=>{
    return require.resolve(id, options);
};
contextPrototype.x = externalRequire;
/* eslint-disable @typescript-eslint/no-unused-vars */ const path = require('path');
const relativePathToRuntimeRoot = path.relative(RUNTIME_PUBLIC_PATH, '.');
// Compute the relative path to the `distDir`.
const relativePathToDistRoot = path.join(relativePathToRuntimeRoot, RELATIVE_ROOT_PATH);
const RUNTIME_ROOT = path.resolve(__filename, relativePathToRuntimeRoot);
// Compute the absolute path to the root, by stripping distDir from the absolute path to this file.
const ABSOLUTE_ROOT = path.resolve(__filename, relativePathToDistRoot);
/**
 * Returns an absolute path to the given module path.
 * Module path should be relative, either path to a file or a directory.
 *
 * This fn allows to calculate an absolute path for some global static values, such as
 * `__dirname` or `import.meta.url` that Turbopack will not embeds in compile time.
 * See ImportMetaBinding::code_generation for the usage.
 */ function resolveAbsolutePath(modulePath) {
    if (modulePath) {
        return path.join(ABSOLUTE_ROOT, modulePath);
    }
    return ABSOLUTE_ROOT;
}
Context.prototype.P = resolveAbsolutePath;
/* eslint-disable @typescript-eslint/no-unused-vars */ /// <reference path="../shared/runtime-utils.ts" />
function readWebAssemblyAsResponse(path) {
    const { createReadStream } = require('fs');
    const { Readable } = require('stream');
    const stream = createReadStream(path);
    // @ts-ignore unfortunately there's a slight type mismatch with the stream.
    return new Response(Readable.toWeb(stream), {
        headers: {
            'content-type': 'application/wasm'
        }
    });
}
async function compileWebAssemblyFromPath(path) {
    const response = readWebAssemblyAsResponse(path);
    return await WebAssembly.compileStreaming(response);
}
async function instantiateWebAssemblyFromPath(path, importsObj) {
    const response = readWebAssemblyAsResponse(path);
    const { instance } = await WebAssembly.instantiateStreaming(response, importsObj);
    return instance.exports;
}
/* eslint-disable @typescript-eslint/no-unused-vars */ /// <reference path="../shared/runtime-utils.ts" />
/// <reference path="../shared-node/base-externals-utils.ts" />
/// <reference path="../shared-node/node-externals-utils.ts" />
/// <reference path="../shared-node/node-wasm-utils.ts" />
var SourceType = /*#__PURE__*/ function(SourceType) {
    /**
   * The module was instantiated because it was included in an evaluated chunk's
   * runtime.
   * SourceData is a ChunkPath.
   */ SourceType[SourceType["Runtime"] = 0] = "Runtime";
    /**
   * The module was instantiated because a parent module imported it.
   * SourceData is a ModuleId.
   */ SourceType[SourceType["Parent"] = 1] = "Parent";
    return SourceType;
}(SourceType || {});
process.env.TURBOPACK = '1';
const nodeContextPrototype = Context.prototype;
const url = require('url');
const moduleFactories = new Map();
nodeContextPrototype.M = moduleFactories;
const moduleCache = Object.create(null);
nodeContextPrototype.c = moduleCache;
/**
 * Returns an absolute path to the given module's id.
 */ function resolvePathFromModule(moduleId) {
    const exported = this.r(moduleId);
    const exportedPath = exported?.default ?? exported;
    if (typeof exportedPath !== 'string') {
        return exported;
    }
    const strippedAssetPrefix = exportedPath.slice(ASSET_PREFIX.length);
    const resolved = path.resolve(RUNTIME_ROOT, strippedAssetPrefix);
    return url.pathToFileURL(resolved).href;
}
nodeContextPrototype.R = resolvePathFromModule;
function loadRuntimeChunk(sourcePath, chunkData) {
    if (typeof chunkData === 'string') {
        loadRuntimeChunkPath(sourcePath, chunkData);
    } else {
        loadRuntimeChunkPath(sourcePath, chunkData.path);
    }
}
const loadedChunks = new Set();
const unsupportedLoadChunk = Promise.resolve(undefined);
const loadedChunk = Promise.resolve(undefined);
const chunkCache = new Map();
function clearChunkCache() {
    chunkCache.clear();
}
function loadRuntimeChunkPath(sourcePath, chunkPath) {
    if (!isJs(chunkPath)) {
        // We only support loading JS chunks in Node.js.
        // This branch can be hit when trying to load a CSS chunk.
        return;
    }
    if (loadedChunks.has(chunkPath)) {
        return;
    }
    try {
        const resolved = path.resolve(RUNTIME_ROOT, chunkPath);
        const chunkModules = requireChunk(chunkPath);
        installCompressedModuleFactories(chunkModules, 0, moduleFactories);
        loadedChunks.add(chunkPath);
    } catch (cause) {
        let errorMessage = `Failed to load chunk ${chunkPath}`;
        if (sourcePath) {
            errorMessage += ` from runtime for chunk ${sourcePath}`;
        }
        const error = new Error(errorMessage, {
            cause
        });
        error.name = 'ChunkLoadError';
        throw error;
    }
}
function loadChunkAsync(chunkData) {
    const chunkPath = typeof chunkData === 'string' ? chunkData : chunkData.path;
    if (!isJs(chunkPath)) {
        // We only support loading JS chunks in Node.js.
        // This branch can be hit when trying to load a CSS chunk.
        return unsupportedLoadChunk;
    }
    let entry = chunkCache.get(chunkPath);
    if (entry === undefined) {
        try {
            // resolve to an absolute path to simplify `require` handling
            const resolved = path.resolve(RUNTIME_ROOT, chunkPath);
            // TODO: consider switching to `import()` to enable concurrent chunk loading and async file io
            // However this is incompatible with hot reloading (since `import` doesn't use the require cache)
            const chunkModules = requireChunk(chunkPath);
            installCompressedModuleFactories(chunkModules, 0, moduleFactories);
            entry = loadedChunk;
        } catch (cause) {
            const errorMessage = `Failed to load chunk ${chunkPath} from module ${this.m.id}`;
            const error = new Error(errorMessage, {
                cause
            });
            error.name = 'ChunkLoadError';
            // Cache the failure promise, future requests will also get this same rejection
            entry = Promise.reject(error);
        }
        chunkCache.set(chunkPath, entry);
    }
    // TODO: Return an instrumented Promise that React can use instead of relying on referential equality.
    return entry;
}
contextPrototype.l = loadChunkAsync;
function loadChunkAsyncByUrl(chunkUrl) {
    const path1 = url.fileURLToPath(new URL(chunkUrl, RUNTIME_ROOT));
    return loadChunkAsync.call(this, path1);
}
contextPrototype.L = loadChunkAsyncByUrl;
function loadWebAssembly(chunkPath, _edgeModule, imports) {
    const resolved = path.resolve(RUNTIME_ROOT, chunkPath);
    return instantiateWebAssemblyFromPath(resolved, imports);
}
contextPrototype.w = loadWebAssembly;
function loadWebAssemblyModule(chunkPath, _edgeModule) {
    const resolved = path.resolve(RUNTIME_ROOT, chunkPath);
    return compileWebAssemblyFromPath(resolved);
}
contextPrototype.u = loadWebAssemblyModule;
function getWorkerBlobURL(_chunks) {
    throw new Error('Worker blobs are not implemented yet for Node.js');
}
nodeContextPrototype.b = getWorkerBlobURL;
function instantiateModule(id, sourceType, sourceData) {
    const moduleFactory = moduleFactories.get(id);
    if (typeof moduleFactory !== 'function') {
        // This can happen if modules incorrectly handle HMR disposes/updates,
        // e.g. when they keep a `setTimeout` around which still executes old code
        // and contains e.g. a `require("something")` call.
        let instantiationReason;
        switch(sourceType){
            case 0:
                instantiationReason = `as a runtime entry of chunk ${sourceData}`;
                break;
            case 1:
                instantiationReason = `because it was required from module ${sourceData}`;
                break;
            default:
                invariant(sourceType, (sourceType)=>`Unknown source type: ${sourceType}`);
        }
        throw new Error(`Module ${id} was instantiated ${instantiationReason}, but the module factory is not available.`);
    }
    const module1 = createModuleObject(id);
    const exports = module1.exports;
    moduleCache[id] = module1;
    const context = new Context(module1, exports);
    // NOTE(alexkirsz) This can fail when the module encounters a runtime error.
    try {
        moduleFactory(context, module1, exports);
    } catch (error) {
        module1.error = error;
        throw error;
    }
    module1.loaded = true;
    if (module1.namespaceObject && module1.exports !== module1.namespaceObject) {
        // in case of a circular dependency: cjs1 -> esm2 -> cjs1
        interopEsm(module1.exports, module1.namespaceObject);
    }
    return module1;
}
/**
 * Retrieves a module from the cache, or instantiate it if it is not cached.
 */ // @ts-ignore
function getOrInstantiateModuleFromParent(id, sourceModule) {
    const module1 = moduleCache[id];
    if (module1) {
        if (module1.error) {
            throw module1.error;
        }
        return module1;
    }
    return instantiateModule(id, 1, sourceModule.id);
}
/**
 * Instantiates a runtime module.
 */ function instantiateRuntimeModule(chunkPath, moduleId) {
    return instantiateModule(moduleId, 0, chunkPath);
}
/**
 * Retrieves a module from the cache, or instantiate it as a runtime module if it is not cached.
 */ // @ts-ignore TypeScript doesn't separate this module space from the browser runtime
function getOrInstantiateRuntimeModule(chunkPath, moduleId) {
    const module1 = moduleCache[moduleId];
    if (module1) {
        if (module1.error) {
            throw module1.error;
        }
        return module1;
    }
    return instantiateRuntimeModule(chunkPath, moduleId);
}
const regexJsUrl = /\.js(?:\?[^#]*)?(?:#.*)?$/;
/**
 * Checks if a given path/URL ends with .js, optionally followed by ?query or #fragment.
 */ function isJs(chunkUrlOrPath) {
    return regexJsUrl.test(chunkUrlOrPath);
}
module.exports = (sourcePath)=>({
        m: (id)=>getOrInstantiateRuntimeModule(sourcePath, id),
        c: (chunkData)=>loadRuntimeChunk(sourcePath, chunkData)
    });


//# sourceMappingURL=%5Bturbopack%5D_runtime.js.map

  function requireChunk(chunkPath) {
    switch(chunkPath) {
      case "server/chunks/ssr/410bb_@capacitor_app_dist_esm_web_2f63d67e.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/410bb_@capacitor_app_dist_esm_web_2f63d67e.js");
      case "server/chunks/ssr/5b3f9_next_11fc286e._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/5b3f9_next_11fc286e._.js");
      case "server/chunks/ssr/5b3f9_next_dist_39f05ec3._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/5b3f9_next_dist_39f05ec3._.js");
      case "server/chunks/ssr/5b3f9_next_dist_a5fd1e31._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/5b3f9_next_dist_a5fd1e31._.js");
      case "server/chunks/ssr/5b3f9_next_dist_beeaa646._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/5b3f9_next_dist_beeaa646._.js");
      case "server/chunks/ssr/5b3f9_next_dist_cca21116._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/5b3f9_next_dist_cca21116._.js");
      case "server/chunks/ssr/5b3f9_next_dist_client_components_2156901c._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/5b3f9_next_dist_client_components_2156901c._.js");
      case "server/chunks/ssr/5b3f9_next_dist_compiled_@opentelemetry_api_index_742dc68f.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/5b3f9_next_dist_compiled_@opentelemetry_api_index_742dc68f.js");
      case "server/chunks/ssr/5b3f9_next_dist_esm_1c33ee56._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/5b3f9_next_dist_esm_1c33ee56._.js");
      case "server/chunks/ssr/5b3f9_next_dist_esm_build_templates_app-page_f27b4a3c.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/5b3f9_next_dist_esm_build_templates_app-page_f27b4a3c.js");
      case "server/chunks/ssr/5b3f9_next_dist_esm_f5958720._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/5b3f9_next_dist_esm_f5958720._.js");
      case "server/chunks/ssr/[root-of-the-server]__0d13a2ea._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0d13a2ea._.js");
      case "server/chunks/ssr/[root-of-the-server]__1962d888._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__1962d888._.js");
      case "server/chunks/ssr/[root-of-the-server]__32cd6ca7._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__32cd6ca7._.js");
      case "server/chunks/ssr/[root-of-the-server]__50aa8342._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__50aa8342._.js");
      case "server/chunks/ssr/[root-of-the-server]__619d451d._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__619d451d._.js");
      case "server/chunks/ssr/[root-of-the-server]__6b9c2361._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__6b9c2361._.js");
      case "server/chunks/ssr/[root-of-the-server]__8e7255c7._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__8e7255c7._.js");
      case "server/chunks/ssr/[root-of-the-server]__98895c16._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__98895c16._.js");
      case "server/chunks/ssr/[root-of-the-server]__acf47d86._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__acf47d86._.js");
      case "server/chunks/ssr/[root-of-the-server]__d498b99b._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__d498b99b._.js");
      case "server/chunks/ssr/[turbopack]_runtime.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/[turbopack]_runtime.js");
      case "server/chunks/ssr/_aef8065e._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_aef8065e._.js");
      case "server/chunks/ssr/_next-internal_server_app__not-found_page_actions_554ec2bf.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app__not-found_page_actions_554ec2bf.js");
      case "server/chunks/ssr/app_1c6c0c3f._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/app_1c6c0c3f._.js");
      case "server/chunks/ssr/app_9f946e6b._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/app_9f946e6b._.js");
      case "server/chunks/ssr/app_error_tsx_5275429f._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/app_error_tsx_5275429f._.js");
      case "server/chunks/ssr/app_not-found_tsx_339d4b53._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/app_not-found_tsx_339d4b53._.js");
      case "server/chunks/ssr/c4952_sonner_dist_index_mjs_d4b8bc87._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/c4952_sonner_dist_index_mjs_d4b8bc87._.js");
      case "server/chunks/ssr/f2b82_@tanstack_query-core_build_modern_138212ae._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/f2b82_@tanstack_query-core_build_modern_138212ae._.js");
      case "server/chunks/ssr/node_modules__pnpm_3f0c00aa._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules__pnpm_3f0c00aa._.js");
      case "server/chunks/ssr/12975_react-icons_md_index_mjs_d025d931._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/12975_react-icons_md_index_mjs_d025d931._.js");
      case "server/chunks/ssr/5b3f9_next_979288ad._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/5b3f9_next_979288ad._.js");
      case "server/chunks/ssr/5b3f9_next_dist_44de39b5._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/5b3f9_next_dist_44de39b5._.js");
      case "server/chunks/ssr/5b3f9_next_dist_client_components_builtin_global-error_ad08c2cd.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/5b3f9_next_dist_client_components_builtin_global-error_ad08c2cd.js");
      case "server/chunks/ssr/5b3f9_next_dist_client_components_builtin_unauthorized_5eb03b16.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/5b3f9_next_dist_client_components_builtin_unauthorized_5eb03b16.js");
      case "server/chunks/ssr/[root-of-the-server]__122b5604._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__122b5604._.js");
      case "server/chunks/ssr/[root-of-the-server]__162d2326._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__162d2326._.js");
      case "server/chunks/ssr/[root-of-the-server]__3d36d8e9._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__3d36d8e9._.js");
      case "server/chunks/ssr/[root-of-the-server]__530ddcf1._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__530ddcf1._.js");
      case "server/chunks/ssr/[root-of-the-server]__76b540d6._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__76b540d6._.js");
      case "server/chunks/ssr/[root-of-the-server]__a8e6536d._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__a8e6536d._.js");
      case "server/chunks/ssr/[root-of-the-server]__e27e4113._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__e27e4113._.js");
      case "server/chunks/ssr/_061be312._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_061be312._.js");
      case "server/chunks/ssr/_06c863f5._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_06c863f5._.js");
      case "server/chunks/ssr/_71f8a50e._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_71f8a50e._.js");
      case "server/chunks/ssr/_8f0ba96d._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_8f0ba96d._.js");
      case "server/chunks/ssr/_bcfb78ad._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_bcfb78ad._.js");
      case "server/chunks/ssr/a8d7e_zod_v4_classic_external_f5e3af0c.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/a8d7e_zod_v4_classic_external_f5e3af0c.js");
      case "server/chunks/ssr/app_(inside)_blog_[slug]_loading_tsx_4c37f20a._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/app_(inside)_blog_[slug]_loading_tsx_4c37f20a._.js");
      case "server/chunks/ssr/app_(inside)_blog_loading_tsx_c26440f9._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/app_(inside)_blog_loading_tsx_c26440f9._.js");
      case "server/chunks/ssr/app_ui_skeletons_tsx_188336bd._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/app_ui_skeletons_tsx_188336bd._.js");
      case "server/chunks/ssr/lib_actions_cinematic-actions_ts_b50f15fa._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/lib_actions_cinematic-actions_ts_b50f15fa._.js");
      case "server/chunks/ssr/lib_data_countries_ts_5d9d6c92._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/lib_data_countries_ts_5d9d6c92._.js");
      case "server/chunks/ssr/node_modules__pnpm_3fcd6d86._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules__pnpm_3fcd6d86._.js");
      case "server/chunks/ssr/node_modules__pnpm_7a208aec._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules__pnpm_7a208aec._.js");
      case "server/chunks/ssr/node_modules__pnpm_7d91e6d3._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules__pnpm_7d91e6d3._.js");
      case "server/chunks/ssr/[root-of-the-server]__7821b5c9._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__7821b5c9._.js");
      case "server/chunks/ssr/[root-of-the-server]__c08b82d2._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__c08b82d2._.js");
      case "server/chunks/ssr/[root-of-the-server]__d9c8c406._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__d9c8c406._.js");
      case "server/chunks/ssr/_2db22acc._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_2db22acc._.js");
      case "server/chunks/ssr/_33f606ef._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_33f606ef._.js");
      case "server/chunks/ssr/_369e58d9._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_369e58d9._.js");
      case "server/chunks/ssr/_b2c5d9a1._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_b2c5d9a1._.js");
      case "server/chunks/ssr/[root-of-the-server]__3d6d939b._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__3d6d939b._.js");
      case "server/chunks/ssr/[root-of-the-server]__bbe3ef01._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__bbe3ef01._.js");
      case "server/chunks/ssr/[root-of-the-server]__e7fd827c._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__e7fd827c._.js");
      case "server/chunks/ssr/_96cb0513._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_96cb0513._.js");
      case "server/chunks/ssr/app_(inside)_blog_create_loading_tsx_2d646b0d._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/app_(inside)_blog_create_loading_tsx_2d646b0d._.js");
      case "server/chunks/ssr/app_(inside)_blog_create_page_tsx_bdf8e5e5._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/app_(inside)_blog_create_page_tsx_bdf8e5e5._.js");
      case "server/chunks/ssr/cfc87_node-fetch-native_dist_chunks_multipart-parser_mjs_dcb1a3dc._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/cfc87_node-fetch-native_dist_chunks_multipart-parser_mjs_dcb1a3dc._.js");
      case "server/chunks/ssr/cfc87_node-fetch-native_dist_node_mjs_21b22d29._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/cfc87_node-fetch-native_dist_node_mjs_21b22d29._.js");
      case "server/chunks/ssr/[root-of-the-server]__324e6f7b._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__324e6f7b._.js");
      case "server/chunks/ssr/[root-of-the-server]__b2702b3d._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__b2702b3d._.js");
      case "server/chunks/ssr/[root-of-the-server]__eeb710b3._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__eeb710b3._.js");
      case "server/chunks/ssr/_1590e0c2._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_1590e0c2._.js");
      case "server/chunks/ssr/[root-of-the-server]__70701d1b._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__70701d1b._.js");
      case "server/chunks/ssr/[root-of-the-server]__78a29e6b._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__78a29e6b._.js");
      case "server/chunks/ssr/_1336e8c1._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_1336e8c1._.js");
      case "server/chunks/ssr/_next-internal_server_app_(inside)_create_page_actions_3653c689.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_(inside)_create_page_actions_3653c689.js");
      case "server/chunks/ssr/[root-of-the-server]__8736ef7e._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__8736ef7e._.js");
      case "server/chunks/ssr/_622991dd._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_622991dd._.js");
      case "server/chunks/ssr/_70ddcf86._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_70ddcf86._.js");
      case "server/chunks/ssr/_cee49e58._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_cee49e58._.js");
      case "server/chunks/ssr/_faa98496._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_faa98496._.js");
      case "server/chunks/ssr/app_(inside)_discover_[media_type]_[id]_page_tsx_8c7c996e._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/app_(inside)_discover_[media_type]_[id]_page_tsx_8c7c996e._.js");
      case "server/chunks/ssr/app_b9556d94._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/app_b9556d94._.js");
      case "server/chunks/ssr/[root-of-the-server]__de7f76fa._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__de7f76fa._.js");
      case "server/chunks/ssr/_a968afac._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_a968afac._.js");
      case "server/chunks/ssr/_be096a3c._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_be096a3c._.js");
      case "server/chunks/ssr/_d9f84606._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_d9f84606._.js");
      case "server/chunks/ssr/[root-of-the-server]__efa44799._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__efa44799._.js");
      case "server/chunks/ssr/_4b0fbb1b._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_4b0fbb1b._.js");
      case "server/chunks/ssr/_d5a8d81c._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_d5a8d81c._.js");
      case "server/chunks/ssr/app_ui_discover_PosterCard_tsx_a199492f._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/app_ui_discover_PosterCard_tsx_a199492f._.js");
      case "server/chunks/ssr/[root-of-the-server]__910fad01._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__910fad01._.js");
      case "server/chunks/ssr/_5b6ebf83._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_5b6ebf83._.js");
      case "server/chunks/ssr/_b5bbb8c0._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_b5bbb8c0._.js");
      case "server/chunks/ssr/[root-of-the-server]__feaa70bd._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__feaa70bd._.js");
      case "server/chunks/ssr/_8fe24817._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_8fe24817._.js");
      case "server/chunks/ssr/_bff597bf._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_bff597bf._.js");
      case "server/chunks/ssr/[root-of-the-server]__133d3445._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__133d3445._.js");
      case "server/chunks/ssr/[root-of-the-server]__59c0965f._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__59c0965f._.js");
      case "server/chunks/ssr/_2eef970e._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_2eef970e._.js");
      case "server/chunks/ssr/_98787164._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_98787164._.js");
      case "server/chunks/ssr/_d8090453._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_d8090453._.js");
      case "server/chunks/ssr/[root-of-the-server]__84c22087._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__84c22087._.js");
      case "server/chunks/ssr/_04d9ae43._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_04d9ae43._.js");
      case "server/chunks/ssr/_acb7bfb9._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_acb7bfb9._.js");
      case "server/chunks/ssr/[root-of-the-server]__ecf6f922._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__ecf6f922._.js");
      case "server/chunks/ssr/_a723db5d._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_a723db5d._.js");
      case "server/chunks/ssr/_eb69e73c._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_eb69e73c._.js");
      case "server/chunks/ssr/[root-of-the-server]__eb0099ed._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__eb0099ed._.js");
      case "server/chunks/ssr/_565fab41._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_565fab41._.js");
      case "server/chunks/ssr/_afc64644._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_afc64644._.js");
      case "server/chunks/ssr/app_ui_explore_74f14fab._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/app_ui_explore_74f14fab._.js");
      case "server/chunks/ssr/[root-of-the-server]__b1002a30._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__b1002a30._.js");
      case "server/chunks/ssr/_41634dd5._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_41634dd5._.js");
      case "server/chunks/ssr/_49f4eab5._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_49f4eab5._.js");
      case "server/chunks/ssr/_9a428cd8._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_9a428cd8._.js");
      case "server/chunks/ssr/[root-of-the-server]__2fa2df0c._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__2fa2df0c._.js");
      case "server/chunks/ssr/_74d7c53c._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_74d7c53c._.js");
      case "server/chunks/ssr/_7ca705cf._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_7ca705cf._.js");
      case "server/chunks/ssr/_next-internal_server_app_(inside)_lists_[id]_page_actions_098653c9.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_(inside)_lists_[id]_page_actions_098653c9.js");
      case "server/chunks/ssr/[root-of-the-server]__ff755623._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__ff755623._.js");
      case "server/chunks/ssr/_42e8ecb1._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_42e8ecb1._.js");
      case "server/chunks/ssr/_4af15f1e._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_4af15f1e._.js");
      case "server/chunks/ssr/_ed42d138._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_ed42d138._.js");
      case "server/chunks/ssr/[root-of-the-server]__64fef70c._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__64fef70c._.js");
      case "server/chunks/ssr/_7c10eedb._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_7c10eedb._.js");
      case "server/chunks/ssr/_next-internal_server_app_(inside)_lists_page_actions_fa764cd9.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_(inside)_lists_page_actions_fa764cd9.js");
      case "server/chunks/ssr/[root-of-the-server]__2c5d5509._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__2c5d5509._.js");
      case "server/chunks/ssr/[root-of-the-server]__85bae44c._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__85bae44c._.js");
      case "server/chunks/ssr/_26ee1241._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_26ee1241._.js");
      case "server/chunks/ssr/_3496de8a._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_3496de8a._.js");
      case "server/chunks/ssr/_549b2618._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_549b2618._.js");
      case "server/chunks/ssr/_dbe59257._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_dbe59257._.js");
      case "server/chunks/ssr/_deda6a05._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_deda6a05._.js");
      case "server/chunks/ssr/app_(inside)_profile_[username]_analytics_loading_tsx_0a190de6._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/app_(inside)_profile_[username]_analytics_loading_tsx_0a190de6._.js");
      case "server/chunks/ssr/[root-of-the-server]__93521f99._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__93521f99._.js");
      case "server/chunks/ssr/_1017eca9._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_1017eca9._.js");
      case "server/chunks/ssr/_67e39f98._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_67e39f98._.js");
      case "server/chunks/ssr/_ea738945._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_ea738945._.js");
      case "server/chunks/ssr/app_ui_user_UserCard_tsx_4c1e31f8._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/app_ui_user_UserCard_tsx_4c1e31f8._.js");
      case "server/chunks/ssr/[root-of-the-server]__dc8c15d6._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__dc8c15d6._.js");
      case "server/chunks/ssr/_340000f9._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_340000f9._.js");
      case "server/chunks/ssr/_b493ad78._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_b493ad78._.js");
      case "server/chunks/ssr/5d111_html-to-image_es_index_25460c4f.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/5d111_html-to-image_es_index_25460c4f.js");
      case "server/chunks/ssr/[root-of-the-server]__85b208b5._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__85b208b5._.js");
      case "server/chunks/ssr/_05562933._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_05562933._.js");
      case "server/chunks/ssr/_70bf613b._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_70bf613b._.js");
      case "server/chunks/ssr/_c249c732._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_c249c732._.js");
      case "server/chunks/ssr/app_(inside)_profile_[username]_home_loading_tsx_1f080689._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/app_(inside)_profile_[username]_home_loading_tsx_1f080689._.js");
      case "server/chunks/ssr/app_ui_skeletons_tsx_aed20374._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/app_ui_skeletons_tsx_aed20374._.js");
      case "server/chunks/ssr/[root-of-the-server]__350bab45._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__350bab45._.js");
      case "server/chunks/ssr/_2cd5cd6c._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_2cd5cd6c._.js");
      case "server/chunks/ssr/_bbe652b8._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_bbe652b8._.js");
      case "server/chunks/ssr/_ec0a4872._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_ec0a4872._.js");
      case "server/chunks/ssr/app_(inside)_profile_[username]_lists_loading_tsx_12488980._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/app_(inside)_profile_[username]_lists_loading_tsx_12488980._.js");
      case "server/chunks/ssr/[root-of-the-server]__4d5eea4a._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__4d5eea4a._.js");
      case "server/chunks/ssr/_16e395b3._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_16e395b3._.js");
      case "server/chunks/ssr/_a8ebac9a._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_a8ebac9a._.js");
      case "server/chunks/ssr/[root-of-the-server]__36bf97cc._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__36bf97cc._.js");
      case "server/chunks/ssr/[root-of-the-server]__533469a1._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__533469a1._.js");
      case "server/chunks/ssr/[root-of-the-server]__799b0ab0._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__799b0ab0._.js");
      case "server/chunks/ssr/_73e655b4._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_73e655b4._.js");
      case "server/chunks/ssr/app_(inside)_profile_[username]_posts_loading_tsx_739a9161._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/app_(inside)_profile_[username]_posts_loading_tsx_739a9161._.js");
      case "server/chunks/ssr/[root-of-the-server]__57bd4301._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__57bd4301._.js");
      case "server/chunks/ssr/_17ed5710._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_17ed5710._.js");
      case "server/chunks/ssr/_3a756bd7._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_3a756bd7._.js");
      case "server/chunks/ssr/_5dd8ffdd._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_5dd8ffdd._.js");
      case "server/chunks/ssr/app_(inside)_profile_[username]_timeline_create_loading_tsx_ae720d43._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/app_(inside)_profile_[username]_timeline_create_loading_tsx_ae720d43._.js");
      case "server/chunks/ssr/app_(inside)_profile_[username]_timeline_loading_tsx_837c1f21._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/app_(inside)_profile_[username]_timeline_loading_tsx_837c1f21._.js");
      case "server/chunks/ssr/[root-of-the-server]__3ee7cff9._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__3ee7cff9._.js");
      case "server/chunks/ssr/_2f8ef920._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_2f8ef920._.js");
      case "server/chunks/ssr/_60ff9303._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_60ff9303._.js");
      case "server/chunks/ssr/_9e3befde._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_9e3befde._.js");
      case "server/chunks/ssr/app_(inside)_profile_[username]_timeline_edit_[id]_loading_tsx_b3eaf5c9._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/app_(inside)_profile_[username]_timeline_edit_[id]_loading_tsx_b3eaf5c9._.js");
      case "server/chunks/ssr/[root-of-the-server]__612ed0d6._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__612ed0d6._.js");
      case "server/chunks/ssr/_07b1a216._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_07b1a216._.js");
      case "server/chunks/ssr/_6fb1cd43._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_6fb1cd43._.js");
      case "server/chunks/ssr/_a7543365._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_a7543365._.js");
      case "server/chunks/ssr/app_ui_timeline_TimelineDisplay_tsx_3793fbe3._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/app_ui_timeline_TimelineDisplay_tsx_3793fbe3._.js");
      case "server/chunks/ssr/[root-of-the-server]__a56f9213._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__a56f9213._.js");
      case "server/chunks/ssr/_55d49c62._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_55d49c62._.js");
      case "server/chunks/ssr/_878d4fc1._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_878d4fc1._.js");
      case "server/chunks/ssr/_ebfa7a26._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_ebfa7a26._.js");
      case "server/chunks/ssr/[root-of-the-server]__60c54aba._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__60c54aba._.js");
      case "server/chunks/ssr/[root-of-the-server]__94c26524._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__94c26524._.js");
      case "server/chunks/ssr/_7c0c61ef._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_7c0c61ef._.js");
      case "server/chunks/ssr/_9c34149e._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_9c34149e._.js");
      case "server/chunks/ssr/app_(inside)_profile_edit_edit-form_tsx_6ffc4e83._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/app_(inside)_profile_edit_edit-form_tsx_6ffc4e83._.js");
      case "server/chunks/ssr/app_(inside)_profile_edit_loading_tsx_03897326._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/app_(inside)_profile_edit_loading_tsx_03897326._.js");
      case "server/chunks/ssr/[root-of-the-server]__74e70cfb._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__74e70cfb._.js");
      case "server/chunks/ssr/_b832d90f._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_b832d90f._.js");
      case "server/chunks/ssr/_next-internal_server_app_(inside)_profile_more_page_actions_b9c8cc52.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_(inside)_profile_more_page_actions_b9c8cc52.js");
      case "server/chunks/ssr/app_(inside)_profile_more_loading_tsx_169df073._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/app_(inside)_profile_more_loading_tsx_169df073._.js");
      case "server/chunks/ssr/[root-of-the-server]__93d53148._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__93d53148._.js");
      case "server/chunks/ssr/[root-of-the-server]__d3f3bbe5._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__d3f3bbe5._.js");
      case "server/chunks/ssr/_08bb49ef._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_08bb49ef._.js");
      case "server/chunks/ssr/_0a52a291._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_0a52a291._.js");
      case "server/chunks/ssr/_9d5b172f._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_9d5b172f._.js");
      case "server/chunks/ssr/app_(inside)_profile_notifications_loading_tsx_5407ae3a._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/app_(inside)_profile_notifications_loading_tsx_5407ae3a._.js");
      case "server/chunks/ssr/[root-of-the-server]__f2b9e260._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__f2b9e260._.js");
      case "server/chunks/ssr/_e056049e._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_e056049e._.js");
      case "server/chunks/ssr/_next-internal_server_app_(inside)_profile_page_actions_e938bdb9.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_(inside)_profile_page_actions_e938bdb9.js");
      case "server/chunks/ssr/[root-of-the-server]__3ef9ab25._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__3ef9ab25._.js");
      case "server/chunks/ssr/_1d7ff1f8._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_1d7ff1f8._.js");
      case "server/chunks/ssr/_fc17f285._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_fc17f285._.js");
      case "server/chunks/ssr/_next-internal_server_app_(inside)_profile_saved_page_actions_69b04e5f.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_(inside)_profile_saved_page_actions_69b04e5f.js");
      case "server/chunks/ssr/app_(inside)_profile_saved_loading_tsx_8af848f3._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/app_(inside)_profile_saved_loading_tsx_8af848f3._.js");
      case "server/chunks/ssr/[root-of-the-server]__e14fc871._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__e14fc871._.js");
      case "server/chunks/ssr/_3f84fad2._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_3f84fad2._.js");
      case "server/chunks/ssr/_ff6929fd._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_ff6929fd._.js");
      case "server/chunks/ssr/app_(inside)_profile_settings_settings-form_tsx_f579ef9a._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/app_(inside)_profile_settings_settings-form_tsx_f579ef9a._.js");
      case "server/chunks/ssr/node_modules__pnpm_a447bfee._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules__pnpm_a447bfee._.js");
      case "server/chunks/ssr/[root-of-the-server]__4a6df453._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__4a6df453._.js");
      case "server/chunks/ssr/[root-of-the-server]__bd87de8c._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__bd87de8c._.js");
      case "server/chunks/ssr/_1850c5e6._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_1850c5e6._.js");
      case "server/chunks/ssr/_3a9b57af._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_3a9b57af._.js");
      case "server/chunks/ssr/_752bc493._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_752bc493._.js");
      case "server/chunks/ssr/app_(inside)_search_loading_tsx_8ca80768._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/app_(inside)_search_loading_tsx_8ca80768._.js");
      case "server/chunks/ssr/5b3f9_next_dist_81156740._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/5b3f9_next_dist_81156740._.js");
      case "server/chunks/ssr/[root-of-the-server]__26a9a805._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__26a9a805._.js");
      case "server/chunks/ssr/[root-of-the-server]__713611e2._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__713611e2._.js");
      case "server/chunks/ssr/[root-of-the-server]__8cf50d1b._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__8cf50d1b._.js");
      case "server/chunks/ssr/_next-internal_server_app__global-error_page_actions_75761787.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app__global-error_page_actions_75761787.js");
      case "server/chunks/5b3f9_next_dist_esm_build_templates_app-route_916894f0.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/5b3f9_next_dist_esm_build_templates_app-route_916894f0.js");
      case "server/chunks/[externals]_next_dist_a6d89067._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/[externals]_next_dist_a6d89067._.js");
      case "server/chunks/[root-of-the-server]__dc08b839._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__dc08b839._.js");
      case "server/chunks/[turbopack]_runtime.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/[turbopack]_runtime.js");
      case "server/chunks/_next-internal_server_app_apple-icon_png_route_actions_40001896.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_apple-icon_png_route_actions_40001896.js");
      case "server/chunks/[root-of-the-server]__31678f81._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__31678f81._.js");
      case "server/chunks/_next-internal_server_app_auth_confirm_route_actions_3cff91a2.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_auth_confirm_route_actions_3cff91a2.js");
      case "server/chunks/node_modules__pnpm_e991ae2b._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/node_modules__pnpm_e991ae2b._.js");
      case "server/chunks/ssr/5b3f9_next_dist_e1bb6c66._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/5b3f9_next_dist_e1bb6c66._.js");
      case "server/chunks/ssr/[root-of-the-server]__4e2b0d82._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__4e2b0d82._.js");
      case "server/chunks/ssr/_7d53bc9a._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_7d53bc9a._.js");
      case "server/chunks/ssr/_next-internal_server_app_auth_error_page_actions_c6fb8d02.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_auth_error_page_actions_c6fb8d02.js");
      case "server/chunks/ssr/[root-of-the-server]__2ac189d7._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__2ac189d7._.js");
      case "server/chunks/ssr/[root-of-the-server]__6745dabe._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__6745dabe._.js");
      case "server/chunks/ssr/_03c1e622._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_03c1e622._.js");
      case "server/chunks/ssr/_a86c5dd5._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_a86c5dd5._.js");
      case "server/chunks/ssr/_b0846aae._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_b0846aae._.js");
      case "server/chunks/ssr/[root-of-the-server]__43031106._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__43031106._.js");
      case "server/chunks/ssr/[root-of-the-server]__e8e147cb._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__e8e147cb._.js");
      case "server/chunks/ssr/_1336dd4b._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_1336dd4b._.js");
      case "server/chunks/ssr/_d21a1f84._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_d21a1f84._.js");
      case "server/chunks/ssr/[root-of-the-server]__05759a7a._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__05759a7a._.js");
      case "server/chunks/ssr/[root-of-the-server]__2308d100._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__2308d100._.js");
      case "server/chunks/ssr/_3781d5ac._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_3781d5ac._.js");
      case "server/chunks/ssr/_56ccee28._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_56ccee28._.js");
      case "server/chunks/ssr/[root-of-the-server]__9d031a05._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__9d031a05._.js");
      case "server/chunks/ssr/[root-of-the-server]__bcd3ef92._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__bcd3ef92._.js");
      case "server/chunks/ssr/_9ed285d4._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_9ed285d4._.js");
      case "server/chunks/ssr/_ecc1f920._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_ecc1f920._.js");
      case "server/chunks/ssr/[root-of-the-server]__6b9e0bce._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__6b9e0bce._.js");
      case "server/chunks/ssr/_c8c466bc._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_c8c466bc._.js");
      case "server/chunks/ssr/_next-internal_server_app_auth_sign-up-success_page_actions_e41d2466.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_auth_sign-up-success_page_actions_e41d2466.js");
      case "server/chunks/ssr/[root-of-the-server]__327cb2f6._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__327cb2f6._.js");
      case "server/chunks/ssr/[root-of-the-server]__80c40050._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__80c40050._.js");
      case "server/chunks/ssr/_311216bb._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_311216bb._.js");
      case "server/chunks/ssr/_next-internal_server_app_delete-success_page_actions_af7030ba.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_delete-success_page_actions_af7030ba.js");
      case "server/chunks/ssr/[root-of-the-server]__d948b56d._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__d948b56d._.js");
      case "server/chunks/ssr/_f64a2e19._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_f64a2e19._.js");
      case "server/chunks/ssr/_next-internal_server_app_features_page_actions_2fccfe54.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_features_page_actions_2fccfe54.js");
      case "server/chunks/[root-of-the-server]__5f50f478._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__5f50f478._.js");
      case "server/chunks/_next-internal_server_app_manifest_webmanifest_route_actions_1bff3fca.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_manifest_webmanifest_route_actions_1bff3fca.js");
      case "server/chunks/ssr/[root-of-the-server]__657c3db5._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__657c3db5._.js");
      case "server/chunks/ssr/[root-of-the-server]__c9d560a4._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__c9d560a4._.js");
      case "server/chunks/ssr/_c7e6e760._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_c7e6e760._.js");
      case "server/chunks/ssr/_e2db450d._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_e2db450d._.js");
      case "server/chunks/ssr/app_onboarding_5d503b8d._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/app_onboarding_5d503b8d._.js");
      case "server/chunks/ssr/app_onboarding_onboarding-form_tsx_58bc96d8._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/app_onboarding_onboarding-form_tsx_58bc96d8._.js");
      case "server/chunks/ssr/cfc87_node-fetch-native_dist_chunks_multipart-parser_mjs_d20256cb._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/cfc87_node-fetch-native_dist_chunks_multipart-parser_mjs_d20256cb._.js");
      case "server/chunks/ssr/cfc87_node-fetch-native_dist_node_mjs_bb205b90._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/cfc87_node-fetch-native_dist_node_mjs_bb205b90._.js");
      case "server/chunks/ssr/[root-of-the-server]__3a502183._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__3a502183._.js");
      case "server/chunks/ssr/[root-of-the-server]__dd454a12._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__dd454a12._.js");
      case "server/chunks/ssr/_f72eeea8._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_f72eeea8._.js");
      case "server/chunks/ssr/_next-internal_server_app_page_actions_39d4fc33.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_page_actions_39d4fc33.js");
      case "server/chunks/ssr/app_ui_landing_LandingPageClient_tsx_c4b02496._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/app_ui_landing_LandingPageClient_tsx_c4b02496._.js");
      case "server/chunks/ssr/node_modules__pnpm_f231c4e9._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules__pnpm_f231c4e9._.js");
      case "server/chunks/ssr/[root-of-the-server]__b8c91931._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__b8c91931._.js");
      case "server/chunks/ssr/_0cdb5dcf._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_0cdb5dcf._.js");
      case "server/chunks/ssr/_next-internal_server_app_policies_page_actions_4bd69a7d.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_policies_page_actions_4bd69a7d.js");
      case "server/chunks/ssr/[root-of-the-server]__6a977d53._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__6a977d53._.js");
      case "server/chunks/ssr/_ada870bb._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_ada870bb._.js");
      case "server/chunks/ssr/_next-internal_server_app_policies_privacy_page_actions_527b484b.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_policies_privacy_page_actions_527b484b.js");
      case "server/chunks/ssr/[root-of-the-server]__ac0edebe._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__ac0edebe._.js");
      case "server/chunks/ssr/_06bc47a8._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_06bc47a8._.js");
      case "server/chunks/ssr/_next-internal_server_app_policies_terms_page_actions_ce086c6e.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_policies_terms_page_actions_ce086c6e.js");
      case "server/chunks/[root-of-the-server]__51cd43e9._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__51cd43e9._.js");
      case "server/chunks/_next-internal_server_app_robots_txt_route_actions_9118e90f.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_robots_txt_route_actions_9118e90f.js");
      case "server/chunks/ssr/[root-of-the-server]__141e3fef._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__141e3fef._.js");
      case "server/chunks/ssr/[root-of-the-server]__d1e026da._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__d1e026da._.js");
      case "server/chunks/ssr/_3ce60bb8._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/_3ce60bb8._.js");
      case "server/chunks/ssr/f0cc2_dist_build_webpack_loaders_next-flight-loader_action-client-wrapper_b00578cd.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/f0cc2_dist_build_webpack_loaders_next-flight-loader_action-client-wrapper_b00578cd.js");
      case "server/chunks/ssr/node_modules__pnpm_67d8e3cc._.js": return require("/home/raja/deeperweave/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules__pnpm_67d8e3cc._.js");
      default:
        throw new Error(`Not found ${chunkPath}`);
    }
  }
