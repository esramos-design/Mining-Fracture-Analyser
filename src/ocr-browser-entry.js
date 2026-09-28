// Configure the same ONNX Runtime instance that Guten OCR uses BEFORE Ocr.create.
// Keep WebAssembly files from the matching npm version on our own origin.
import * as ort from "onnxruntime-web";
import Ocr from "@gutenye/ocr-browser";
ort.env.wasm.wasmPaths = new URL("./assets/ort/", import.meta.url).href;
ort.env.wasm.numThreads = 1;
export default Ocr;
