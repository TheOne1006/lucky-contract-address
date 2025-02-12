let wasm

const cachedTextDecoder =
  typeof TextDecoder !== "undefined"
    ? new TextDecoder("utf-8", { ignoreBOM: true, fatal: true })
    : {
        decode: () => {
          throw Error("TextDecoder not available")
        },
      }

if (typeof TextDecoder !== "undefined") {
  cachedTextDecoder.decode()
}

let cachedUint8ArrayMemory0 = null

function getUint8ArrayMemory0() {
  if (
    cachedUint8ArrayMemory0 === null ||
    cachedUint8ArrayMemory0.byteLength === 0
  ) {
    cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer)
  }
  return cachedUint8ArrayMemory0
}

function getStringFromWasm0(ptr, len) {
  ptr = ptr >>> 0
  return cachedTextDecoder.decode(
    getUint8ArrayMemory0().subarray(ptr, ptr + len),
  )
}

let WASM_VECTOR_LEN = 0

function passArray8ToWasm0(arg, malloc) {
  const ptr = malloc(arg.length * 1, 1) >>> 0
  getUint8ArrayMemory0().set(arg, ptr / 1)
  WASM_VECTOR_LEN = arg.length
  return ptr
}
/**
 * @param {Uint8Array} factory_address
 * @param {Uint8Array} salt
 * @param {Uint8Array} bytecode_hash
 */
export function compute_ready(factory_address, salt, bytecode_hash) {
  const ptr0 = passArray8ToWasm0(factory_address, wasm.__wbindgen_malloc)
  const len0 = WASM_VECTOR_LEN
  const ptr1 = passArray8ToWasm0(salt, wasm.__wbindgen_malloc)
  const len1 = WASM_VECTOR_LEN
  const ptr2 = passArray8ToWasm0(bytecode_hash, wasm.__wbindgen_malloc)
  const len2 = WASM_VECTOR_LEN
  wasm.compute_ready(ptr0, len0, ptr1, len1, ptr2, len2)
}

/**
 * @returns {string}
 */
export function compute_next() {
  let deferred1_0
  let deferred1_1
  try {
    const ret = wasm.compute_next()
    deferred1_0 = ret[0]
    deferred1_1 = ret[1]
    return getStringFromWasm0(ret[0], ret[1])
  } finally {
    wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
  }
}

let cachedDataViewMemory0 = null

function getDataViewMemory0() {
  if (
    cachedDataViewMemory0 === null ||
    cachedDataViewMemory0.buffer.detached === true ||
    (cachedDataViewMemory0.buffer.detached === undefined &&
      cachedDataViewMemory0.buffer !== wasm.memory.buffer)
  ) {
    cachedDataViewMemory0 = new DataView(wasm.memory.buffer)
  }
  return cachedDataViewMemory0
}

function getArrayJsValueFromWasm0(ptr, len) {
  ptr = ptr >>> 0
  const mem = getDataViewMemory0()
  const result = []
  for (let i = ptr; i < ptr + 4 * len; i += 4) {
    result.push(wasm.__wbindgen_export_0.get(mem.getUint32(i, true)))
  }
  wasm.__externref_drop_slice(ptr, len)
  return result
}
/**
 * @param {number} loop_times
 * @returns {string[]}
 */
export function compute_batch(loop_times) {
  const ret = wasm.compute_batch(loop_times)
  var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice()
  wasm.__wbindgen_free(ret[0], ret[1] * 4, 4)
  return v1
}

async function __wbg_load(module, imports) {
  if (typeof Response === "function" && module instanceof Response) {
    if (typeof WebAssembly.instantiateStreaming === "function") {
      try {
        return await WebAssembly.instantiateStreaming(module, imports)
      } catch (e) {
        if (module.headers.get("Content-Type") != "application/wasm") {
          console.warn(
            "`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n",
            e,
          )
        } else {
          throw e
        }
      }
    }

    const bytes = await module.arrayBuffer()
    return await WebAssembly.instantiate(bytes, imports)
  } else {
    const instance = await WebAssembly.instantiate(module, imports)

    if (instance instanceof WebAssembly.Instance) {
      return { instance, module }
    } else {
      return instance
    }
  }
}

function __wbg_get_imports() {
  const imports = {}
  imports.wbg = {}
  imports.wbg.__wbindgen_init_externref_table = function () {
    const table = wasm.__wbindgen_export_0
    const offset = table.grow(4)
    table.set(0, undefined)
    table.set(offset + 0, undefined)
    table.set(offset + 1, null)
    table.set(offset + 2, true)
    table.set(offset + 3, false)
  }
  imports.wbg.__wbindgen_string_new = function (arg0, arg1) {
    const ret = getStringFromWasm0(arg0, arg1)
    return ret
  }

  return imports
}

function __wbg_init_memory(imports, memory) {}

function __wbg_finalize_init(instance, module) {
  wasm = instance.exports
  __wbg_init.__wbindgen_wasm_module = module
  cachedDataViewMemory0 = null
  cachedUint8ArrayMemory0 = null

  wasm.__wbindgen_start()
  return wasm
}

function initSync(module) {
  if (wasm !== undefined) return wasm

  if (typeof module !== "undefined") {
    if (Object.getPrototypeOf(module) === Object.prototype) {
      ;({ module } = module)
    } else {
      console.warn(
        "using deprecated parameters for `initSync()`; pass a single object instead",
      )
    }
  }

  const imports = __wbg_get_imports()

  __wbg_init_memory(imports)

  if (!(module instanceof WebAssembly.Module)) {
    module = new WebAssembly.Module(module)
  }

  const instance = new WebAssembly.Instance(module, imports)

  return __wbg_finalize_init(instance, module)
}

async function __wbg_init(module_or_path) {
  if (wasm !== undefined) return wasm

  if (typeof module_or_path !== "undefined") {
    if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
      ;({ module_or_path } = module_or_path)
    } else {
      console.warn(
        "using deprecated parameters for the initialization function; pass a single object instead",
      )
    }
  }

  if (typeof module_or_path === "undefined") {
    throw new Error("module_or_path not provided")
    module_or_path = new URL("worker_lca_bg.wasm", import.meta.url)
  }
  const imports = __wbg_get_imports()

  if (
    typeof module_or_path === "string" ||
    (typeof Request === "function" && module_or_path instanceof Request) ||
    (typeof URL === "function" && module_or_path instanceof URL)
  ) {
    module_or_path = fetch(module_or_path)
  }

  __wbg_init_memory(imports)

  const { instance, module } = await __wbg_load(await module_or_path, imports)

  return __wbg_finalize_init(instance, module)
}

export { initSync }
export default __wbg_init
