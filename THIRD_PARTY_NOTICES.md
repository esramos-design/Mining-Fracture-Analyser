# Third-Party Notices

## RegolithCo OCR parser concepts

MFA's experimental browser OCR adapter in `regolith-ocr.js` contains parsing logic adapted from the public RegolithCo OCR project:

- Project: RegolithCo/RegolithCo-OCR
- Package: @regolithco/ocr
- License: ISC
- Copyright: RegolithCo

ISC License

Copyright (c) RegolithCo

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

## Guten OCR / PaddleOCR models

The experimental browser OCR path uses `@gutenye/ocr-browser` with PP-OCRv4 ONNX model assets. The Guten OCR source is MIT-licensed. The PaddleOCR model and dictionary assets retain their upstream Apache-2.0 licensing.

MFA pins the experimental browser runtime/model versions in `regolith-ocr.js` so Alpha validation is reproducible.
