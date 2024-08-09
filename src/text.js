// MIT License
//
// Copyright (c) 2017-2021 Sergej Sintschilin
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
//
// https://github.com/SeregPie/THREE.TextSprite
// https://github.com/SeregPie/THREE.TextTexture
//


function toCSSFont(family, size, style, variant, weight) {
  let el = document.createElement('span');
  el.style.font = '1px serif';
  el.style.fontFamily = family;
  el.style.fontSize = `${size}px`;
  el.style.fontStyle = style;
  el.style.fontVariant = variant;
  el.style.fontWeight = weight;
  return el.style.font;
}


import {
  MathUtils,
  Texture,
  Vector2,
  Vector3,
  Sprite,
  SpriteMaterial,
} from './vendor/three/build/three.module';

let AbstractDynamicTexture = class extends Texture {
  constructor() {
    super(document.createElement('canvas'));
    let drawing = null;
    let getDrawing = (() => drawing ??= this.createDrawing());
    let getWidth = (() => getDrawing().width);
    let getHeight = (() => getDrawing().height);
    let getSize = (target => {
      target.set(getWidth(), getHeight());
      return target;
    });
    let draw = ((...args) => getDrawing().draw(...args));

    let needsRedraw = true;

    let pixelRatio = 1;

    let getDrawingBufferWidth = (() => MathUtils.ceilPowerOfTwo(getWidth() * pixelRatio));
    let getDrawingBufferHeight = (() => MathUtils.ceilPowerOfTwo(getHeight() * pixelRatio));

    let setPixelRatio = (value => {
      if (pixelRatio !== value) {
        let oldWidth = getDrawingBufferWidth();
        let oldHeight = getDrawingBufferHeight();
        pixelRatio = value;
        let newWidth = getDrawingBufferWidth();
        let newHeight = getDrawingBufferHeight();
        if ((newWidth !== oldWidth) || (newHeight !== oldHeight)) {
          needsRedraw = true;
        }
      }
    });

    let computeOptimalPixelRatio = (() => {
      let cameraPosition = new Vector3();
      let rendererSize = new Vector2();
      let objectPosition = new Vector3();
      let objectScale = new Vector3();
      let textureSize = new Vector2();
      return ((object, renderer, camera) => {
        getSize(textureSize);
        if (textureSize.x && textureSize.y) {
          object.getWorldPosition(objectPosition);
          camera.getWorldPosition(cameraPosition);
          let distance = objectPosition.distanceTo(cameraPosition);
          if (camera.isPerspectiveCamera) {
            distance *= Math.tan(MathUtils.degToRad(camera.fov) / 2) * 2;
          }
          if (camera.isPerspectiveCamera || camera.isOrthographicCamera) {
            distance /= camera.zoom;
          }
          if (distance) {
            object.getWorldScale(objectScale);
            let maxTextureSize = renderer.capabilities?.maxTextureSize ?? Infinity;
            renderer.getDrawingBufferSize(rendererSize);
            return Math.min(
              Math.max(
                (objectScale.x / distance) * (rendererSize.x / textureSize.x),
                (objectScale.y / distance) * (rendererSize.y / textureSize.y),
              ),
              maxTextureSize / textureSize.x,
              maxTextureSize / textureSize.y,
            );
          }
        }
        return 0;
      });
    })();

    Object.defineProperties(this, {
      width: {
        get: getWidth,
      },
      height: {
        get: getHeight,
      },
      pixelRatio: {
        get() {
          return pixelRatio;
        },
        set: setPixelRatio,
      },
      needsRedraw: {
        set(value) {
          if (value) {
            needsRedraw = true;
            drawing = null;
          }
        },
      },
    });
    Object.assign(this, {
      redraw() {
        if (needsRedraw) {
          let canvas = this.image;
          let ctx = canvas.getContext('2d');
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          canvas.width = getDrawingBufferWidth();
          canvas.height = getDrawingBufferHeight();
          if (canvas.width && canvas.height) {
            ctx.save();
            ctx.scale(canvas.width / getWidth(), canvas.height / getHeight());
            draw(ctx);
            ctx.restore();
          } else {
            canvas.width = canvas.height = 1;
          }
          needsRedraw = false;
          this.needsUpdate = true;
        }
      },

      setOptimalPixelRatio(...args) {
        setPixelRatio(computeOptimalPixelRatio(...args));
      },
    });
  }
};

AbstractDynamicTexture.prototype.isDynamicTexture = true;


let TextTexture = class extends AbstractDynamicTexture {
  constructor({
                alignment = 'center',
                backgroundColor = 'rgba(0,0,0,0)',
                color = '#fff',
                fontFamily = 'sans-serif',
                fontSize = 16,
                fontStyle = 'normal',
                fontVariant = 'normal',
                fontWeight = 'normal',
                lineGap = 1/4,
                padding = 1/2,
                strokeColor = '#fff',
                strokeWidth = 0,
                text = '',
              } = {}) {
    super();
    Object.entries({
      alignment,
      backgroundColor,
      color,
      fontFamily,
      fontSize,
      fontStyle,
      fontVariant,
      fontWeight,
      lineGap,
      padding,
      strokeColor,
      strokeWidth,
      text,
    }).forEach(([key, currentValue]) => {
      Object.defineProperty(this, key, {
        get() {
          return currentValue;
        },
        set(value) {
          if (currentValue !== value) {
            currentValue = value;
            this.needsRedraw = true;
          }
        },
      });
    });
  }

  get lines() {
    let {text} = this;
    return text ? text.split('\n') : [];
  }

  get font() {
    return toCSSFont(
      this.fontFamily,
      this.fontSize,
      this.fontStyle,
      this.fontVariant,
      this.fontWeight,
    );
  }

  checkFontFace() {
    try {
      let {font} = this;
      return document.fonts.check(font);
    } catch {
      // pass
    }
    return true;
  }

  async loadFontFace() {
    try {
      let {font} = this;
      await document.fonts.load(font);
    } catch {
      // pass
    }
  }

  createDrawing() {
    let {
      alignment,
      backgroundColor,
      color,
      font,
      fontSize,
      lineGap,
      lines,
      padding,
      strokeColor,
      strokeWidth,
    } = this;
    padding *= fontSize;
    lineGap *= fontSize;
    strokeWidth *= fontSize;
    let linesCount = lines.length;
    let lineOffset = fontSize + lineGap;
    let contentWidth = (linesCount
        ? (() => {
          let canvas = document.createElement('canvas');
          let ctx = canvas.getContext('2d');
          ctx.font = font;
          return Math.max(...lines.map(text => ctx.measureText(text).width));
        })()
        : 0
    );
    let contentHeight = (linesCount
        ? (fontSize + lineOffset * linesCount)
        : 0
    );
    let contentOffset = padding + strokeWidth / 2;
    let width = contentWidth + contentOffset * 2;
    let height = contentHeight + contentOffset * 2;
    return {
      width,
      height,
      draw(ctx) {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        let left;
        let top = contentOffset + fontSize / 2;
        Object.assign(ctx, {
          fillStyle: color,
          font: font,
          lineWidth: strokeWidth,
          miterLimit: 1,
          strokeStyle: strokeColor,
          textAlign: (() => {
            switch (alignment) {
              case 'left':
                left = contentOffset;
                return 'left';
              case 'right':
                left = width - contentOffset;
                return 'right';
            }
            left = width / 2;
            return 'center';
          })(),
          textBaseline:  'middle',
        });
        lines.forEach(text => {
          ctx.fillText(text, left, top);
          if (strokeWidth) {
            ctx.strokeText(text, left, top);
          }
          top += lineOffset;
        });
      },
    };
  }
};

TextTexture.prototype.isTextTexture = true;


let TextSprite = class extends Sprite {
  constructor(
    {
      fontSize = 1,
      ...options
    } = {},
    material = new SpriteMaterial({
      depthWrite: false,
    }),
  ) {
    super(material);
    let texture = new TextTexture({
      fontSize,
      ...options,
    });
    this.material.map = texture;
  }

  onBeforeRender(renderer, scene, camera) {
    let {material} = this;
    let {map: texture} = material;
    if (texture.checkFontFace()) {
      let {scale} = this;
      let {
        height,
        width,
      } = texture;
      if (width && height) {
        scale.setX(width).setY(height);
        texture.setOptimalPixelRatio(this, renderer, camera);
        texture.redraw();
      } else {
        scale.setScalar(1);
      }
    } else {
      texture.loadFontFace();
    }
  }

  dispose() {
    let {material} = this;
    let {map: texture} = material;
    texture.dispose();
    material.dispose();
  }
};

[
  'alignment',
  'backgroundColor',
  'color',
  'fontFamily',
  'fontSize',
  'fontStyle',
  'fontVariant',
  'fontWeight',
  'lineGap',
  'padding',
  'strokeColor',
  'strokeWidth',
  'text',
].forEach(key => {
  Object.defineProperty(TextSprite.prototype, key, {
    get() {
      return this.material.map[key];
    },
    set(value) {
      this.material.map[key] = value;
    },
  });
});

TextSprite.prototype.isTextSprite = true;

export default TextSprite;
