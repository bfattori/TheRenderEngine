/**
 * The Render Engine
 * VectorText
 *
 * Copyright (c) 2008-2018 Brett Fattori (bfattori@gmail.com)
 */
"use strict";

/**
 * @class A text renderer which draws text like the old-school vector monitors.
 *
 * @constructor
 * @param componentName {String} The name of the text component
 * @param priority {Number} The priority of the component
 * @extends AbstractTextRenderer
 */
class VectorText extends AbstractTextRenderer {

  constructor(componentName, priority) {
    super(componentName, priority);
    this.rText = [];
    this.spacing = 0;
    this.textWeight = 1.5;
  }

  destroy() {
    this.clearPoints();
    super.destroy();
  }

  release() {
    super.release();
    this.rText = null;
  }

  /**
   * Get the class name of this object
   * @return {String} The string "VectorText"
   */
  get className() {
    return "VectorText";
  }

  /**
   * Calculate the bounding box for the text and set it on the host object.
   * @private
   */
  calculateBoundingBox() {
    var x1 = Math2.MAX_INT;
    var x2 = -Math2.MAX_INT;
    var y1 = Math2.MAX_INT;
    var y2 = -Math2.MAX_INT;
    for (var p = 0; p < this.rText.length; p++) {
      var pt = this.rText[p];

      if (pt != null) {
        if (pt.x < x1) {
          x1 = pt.x;
        }
        if (pt.x > x2) {
          x2 = pt.x;
        }
        if (pt.y < y1) {
          y1 = pt.y;
        }
        if (pt.y > y2) {
          y2 = pt.y;
        }
      }
    }

    this.gameObject.boundingBox.x = 0;
    this.gameObject.boundingBox.y = 0;
    this.gameObject.boundingBox.width = ((Math.abs(x1) + x2) * this.size) + 2;
    this.gameObject.boundingBox.height = ((Math.abs(y1) + y2) * this.size) + 2;
    //this.textAlignment = this.textAlignment;
  }

  /**
   * Set the scaling of the text
   * @param size {Number}
   */
  set size(size) {
    super.size = size;
    this.calculateBoundingBox();
  }

  clearPoints() {
    while (this.rText.length > 0) {
      var pt = this.rText.shift();
      if (pt) {
        pt.destroy();
      }
    }
  }

  /**
   * Set the text to render.
   *
   * @param text {String} The text to vectorize
   */
  set text(text) {
    // We only have uppercase letters
    text = String(text).toUpperCase();
    super.text = text;

    this.clearPoints();
    var spacing = 11.5;

    // Replace special chars
    text = text.replace(/&COPY;/g, "a").replace(/&REG;/g, "b");

    var lCount = text.length;
    var letter = 0;
    var kern = Point2D.create(spacing, 0);
    var lineHeight = this.size * 5;
    var y = 0;

    // Vectorize the text
    var pc = Point2D.create(0, y);
    while (lCount-- > 0) {
      var ltr = [];
      var chr = text.charCodeAt(letter);
      if (chr == 10) {
        // Support multi-line text
        y += (this.size * 10) + this.lineSpacing;
        pc.set(0, y);
      }
      else {
        var glyph = VectorText.chars[chr - 32];
        if (glyph.length == 0) {
          pc.add(kern);
        }
        else {

          for (var p = 0; p < glyph.length; p++) {
            if (glyph[p] != null) {
              this.rText.push(Point2D.create(glyph[p]).add(pc));
            }
            else {
              this.rText.push(null);
            }
          }
          this.rText.push(null);
          pc.add(kern);
        }
      }
      letter += 1;
    }
    pc.destroy();
    kern.destroy();
    this.calculateBoundingBox();
  }

  /**
   * @param renderContext {RenderContext2D}
   */
  render(renderContext) {

    if (this.rText.length == 0) {
      return;
    }

    renderContext.pushTransform();
    var o = Point2D.create(this.gameObject.origin);
    o.neg();
    renderContext.position = o;
    o.destroy();
    renderContext.setScale(this.size);
    // Set the stroke and fill styles
    if (this.color !== null) {
      renderContext.lineStyle = this.color;
    }

    renderContext.lineWidth = this.textWeight;
    renderContext.drawPolyline(this.rText);
    renderContext.popTransform();
  }


  //============================================================================
  static chars = null;

  /**
   * @private
   */
  static _precalc() {
    // Pre-render the characters
    VectorText.chars = [];
    var lb = function (glyph) {
      var x1 = Math2.MAX_INT;
      var x2 = -Math2.MAX_INT;
      var y1 = Math2.MAX_INT;
      var y2 = -Math2.MAX_INT;
      for (var p = 0; p < glyph.length; p++) {
        var pt = glyph[p];

        if (pt != null) {
          if (pt.x < x1) {
            x1 = pt.x;
          }
          if (pt.x > x2) {
            x2 = pt.x;
          }
          if (pt.y < y1) {
            y1 = pt.y;
          }
          if (pt.y > y2) {
            y2 = pt.y;
          }
        }
      }

      // Get the center of the bounding box and move all of the points so none are negative
      var b = Rectangle2D.create(0, 0, Math.abs(x1) + x2, Math.abs(y1) + y2);
      var hP = Point2D.create(b.halfWidth + 1, b.halfHeight + 1);
      for (p in glyph) {
        if (glyph[p]) {
          glyph[p].add(hP);
        }
      }
      b.destroy();
      hP.destroy();
    };

    // Convert the character set into adjusted points
    for (var c in VectorText.charSet) {
      var chr = VectorText.charSet[c], newChr = [];

      // Convert to points
      for (var p in chr) {
        if (chr[p]) {
          newChr.push(Point2D.create(chr[p][0], chr[p][1]));
        }
        else {
          newChr.push(null);
        }
      }

      // Adjust the origin of each point to zero
      lb(newChr);
      VectorText.chars.push(newChr);
    }
  }

  /**
   * @private
   */
  static resolved() {
    VectorText._precalc();
  }

  /**
   * The character set
   * @private
   */
  static charSet = [
    [],
    // Space
    [
      [0, -5],
      [0, 3.5],
      null,
      [0, 4.5],
      [-0.5, 4.75],
      [0, 5],
      [0.5, 4.75],
      [0, 4.5]
    ],
    // !
    [
      [-1, -4],
      [-2, -4],
      [-2, -5],
      [-1, -5],
      [-1, -4],
      [-2, -2],
      null,
      [2, -4],
      [1, -4],
      [1, -5],
      [2, -5],
      [2, -4],
      [1, -2]
    ],
    // "
    [
      [-1, -3],
      [-1, 3],
      null,
      [1, -3],
      [1, 3],
      null,
      [-3, -1],
      [3, -1],
      null,
      [-3, 1],
      [3, 1]
    ],
    // #
    [
      [5, -4],
      [-3, -4],
      [-5, -3],
      [-3, 0],
      [3, 0],
      [5, 3],
      [3, 4],
      [-5, 4],
      null,
      [0, -5],
      [0, 5]
    ],
    // $
    [
      [-3, -3],
      [-1, -3],
      [-1, -1],
      [-3, -1],
      [-3, -3],
      null,
      [2, 2],
      [4, 2],
      [4, 4],
      [2, 4],
      [2, 2],
      null,
      [3, -4],
      [-3, 4]
    ],
    // %
    [
      [3, 5],
      [0, -1],
      [-1, -3],
      [0, -4],
      [1, -3],
      [0, -1],
      [-2, 1],
      [-2, 3],
      [-1, 4],
      [1, 4],
      [3, 1]
    ],
    // &
    [
      [-1, -4],
      [-2, -4],
      [-2, -5],
      [-1, -5],
      [-1, -4],
      [-2, -2]
    ],
    // '
    [
      [1, -5],
      [-1, -3],
      [-1, 3],
      [1, 5]
    ],
    // (
    [
      [-1, -5],
      [1, -3],
      [1, 3],
      [-1, 5]
    ],
    // )
    [
      [-3, -3],
      [3, 3],
      null,
      [3, -3],
      [-3, 3],
      null,
      [-3, 0],
      [3, 0],
      null,
      [0, -3],
      [0, 3]
    ],
    // *
    [
      [-4, 0],
      [4, 0],
      null,
      [0, -4],
      [0, 4]
    ],
    // +
    [
      [1, 4],
      [0, 4],
      [0, 3],
      [1, 3],
      [1, 4],
      [0, 5]
    ],
    // ,
    [
      [-4, 1],
      [4, 1]
    ],
    // -
    [
      [0, 4],
      [1, 4],
      [1, 3],
      [0, 3],
      [0, 4]
    ],
    // .
    [
      [5, -5],
      [-5, 5]
    ],
    // /
    //15
    [
      [5, -5],
      [-1, -5],
      [-1, 5],
      [5, 5],
      [5, -5],
      null,
      [5, -5],
      [-1, 5]
    ],
    // 0
    [
      [1, -4],
      [3, -5],
      [3, 5]
    ],
    // 1
    [
      [-5, -3],
      [0, -5],
      [5, -3],
      [-5, 5],
      [5, 5]
    ],
    // 2
    [
      [-5, -5],
      [5, -5],
      [0, -1],
      [5, 2],
      [0, 5],
      [-5, 3]
    ],
    // 3
    [
      [-2, -3],
      [-5, 0],
      [5, 0],
      null,
      [5, -5],
      [5, 5]
    ],
    // 4
    [
      [5, -5],
      [-5, -5],
      [-5, 0],
      [3, 0],
      [5, 2],
      [3, 5],
      [-5, 5]
    ],
    // 5
    [
      [-5, -5],
      [-5, 5],
      [5, 5],
      [5, 0],
      [-5, 0]
    ],
    // 6
    [
      [-5, -5],
      [5, -5],
      [-2, 5]
    ],
    // 7
    [
      [0, 0],
      [-4, -2],
      [0, -5],
      [4, -2],
      [-4, 2],
      [0, 5],
      [4, 2],
      [0, 0]
    ],
    // 8
    [
      [4, 0],
      [-4, 0],
      [-4, -5],
      [4, -5],
      [4, 0],
      [-4, 5]
    ],
    // 9
    //25
    [
      [0, 1],
      [1, 1],
      [1, 0],
      [0, 0],
      [0, 1],
      null,
      [0, 4],
      [1, 4],
      [1, 3],
      [0, 3],
      [0, 4]
    ],
    // :
    [
      [0, 1],
      [1, 1],
      [1, 0],
      [0, 0],
      [0, 1],
      null,
      [1, 4],
      [0, 4],
      [0, 3],
      [1, 3],
      [1, 4],
      [0, 5]
    ],
    // ;
    [
      [4, -5],
      [-2, 0],
      [4, 5]
    ],
    // <
    [
      [-4, -2],
      [4, -2],
      null,
      [-4, 2],
      [4, 2]
    ],
    // =
    [
      [-4, -5],
      [2, 0],
      [-4, 5]
    ],
    // >
    [
      [-3, -3],
      [0, -5],
      [3, -3],
      [0, -1],
      [0, 2],
      null,
      [0, 4],
      [1, 4],
      [1, 3],
      [0, 3],
      [0, 4]
    ],
    // ?
    [
      [3, 5],
      [-3, 5],
      [-5, 3],
      [-5, -3],
      [-3, -5],
      [3, -5],
      [5, -3],
      [5, 2],
      [3, 3],
      [0, 3],
      [0, 0],
      [3, 0]
    ],
    // @
    //32
    [
      [-5, 5],
      [0, -5],
      [5, 5],
      [2, 2],
      [-2, 2]
    ],
    // A
    [
      [-4, 5],
      [-4, -5],
      [3, -5],
      [5, -3],
      [3, 0],
      [-4, 0],
      null,
      [3, 0],
      [5, 3],
      [3, 5],
      [-4, 5]
    ],
    // B
    [
      [5, -3],
      [0, -5],
      [-5, -3],
      [-5, 3],
      [0, 5],
      [5, 3]
    ],
    // C
    [
      [-4, 5],
      [-4, -5],
      [2, -5],
      [4, -3],
      [4, 3],
      [2, 5],
      [-4, 5]
    ],
    // D
    [
      [5, -5],
      [0, -5],
      [-3, -3],
      [0, 0],
      [-3, 3],
      [0, 5],
      [5, 5]
    ],
    // E
    [
      [-4, 5],
      [-4, 0],
      [0, 0],
      [-4, 0],
      [-4, -5],
      [4, -5]
    ],
    // F
    [
      [5, -5],
      [-4, -5],
      [-4, 5],
      [5, 5],
      [5, 1],
      [2, 1]
    ],
    // G
    [
      [-4, 5],
      [-4, -5],
      null,
      [-4, 0],
      [4, 0],
      null,
      [4, -5],
      [4, 5]
    ],
    // H
    [
      [-3, 5],
      [3, 5],
      null,
      [0, 5],
      [0, -5],
      null,
      [-3, -5],
      [3, -5]
    ],
    // I
    [
      [3, -5],
      [3, 3],
      [0, 5],
      [-3, 3]
    ],
    // J
    [
      [-4, 5],
      [-4, -5],
      null,
      [-4, 0],
      [5, -5],
      null,
      [-4, 0],
      [5, 5]
    ],
    // K
    [
      [-4, -5],
      [-4, 5],
      [5, 5]
    ],
    // L
    [
      [-4, 5],
      [-4, -5],
      [0, 0],
      [5, -5],
      [5, 5]
    ],
    // M
    [
      [-4, 5],
      [-4, -5],
      [5, 5],
      [5, -5]
    ],
    // N
    [
      [5, -5],
      [-2, -5],
      [-2, 5],
      [5, 5],
      [5, -5]
    ],
    // O
    [
      [-4, 5],
      [-4, -5],
      [3, -5],
      [5, -3],
      [3, 0],
      [-4, 0]
    ],
    // P
    [
      [-5, 0],
      [0, -5],
      [5, 0],
      [0, 5],
      [-5, 0],
      null,
      [3, 3],
      [5, 5]
    ],
    // Q
    [
      [-4, 5],
      [-4, -5],
      [3, -5],
      [5, -3],
      [3, 0],
      [-4, 0],
      null,
      [3, 0],
      [5, 5]
    ],
    // R
    [
      [5, -5],
      [-3, -5],
      [-5, -3],
      [-3, 0],
      [3, 0],
      [5, 3],
      [3, 5],
      [-5, 5]
    ],
    // S
    [
      [-4, -5],
      [4, -5],
      null,
      [0, -5],
      [0, 5]
    ],
    // T
    [
      [-4, -5],
      [-4, 3],
      [-3, 5],
      [3, 5],
      [5, 3],
      [5, -5]
    ],
    // U
    [
      [-5, -5],
      [0, 5],
      [5, -5]
    ],
    // V
    [
      [-5, -5],
      [-3, 5],
      [0, -3],
      [3, 5],
      [5, -5]
    ],
    // W
    [
      [-4, -5],
      [5, 5],
      null,
      [5, -5],
      [-4, 5]
    ],
    // X
    [
      [-5, -5],
      [0, -2],
      [5, -5],
      null,
      [0, -2],
      [0, 5]
    ],
    // Y
    [
      [-4, -5],
      [5, -5],
      [-4, 5],
      [5, 5]
    ],
    // Z
    //58
    [
      [2, -5],
      [-1, -5],
      [-1, 5],
      [2, 5]
    ],
    // [
    [
      [-5, -5],
      [5, 5]
    ],
    // \
    [
      [-2, -5],
      [1, -5],
      [1, 5],
      [-2, 5]
    ],
    // ]
    [
      [-3, 2],
      [0, -1],
      [3, 2]
    ],
    // ^
    [
      [-5, 5],
      [5, 5]
    ],
    // _
    [
      [1, -4],
      [2, -4],
      [2, -5],
      [1, -5],
      [1, -4],
      [2, -2]
    ],
    // `
    //64
    [
      [5, -3],
      [0, -5],
      [-5, -3],
      [-5, 3],
      [0, 5],
      [5, 3],
      [5, -3],
      null,
      [3, -1],
      [0, -3],
      [-3, -1],
      [-3, 1],
      [0, 3],
      [3, 1]
    ],
    // &copy;
    [
      [5, -3],
      [0, -5],
      [-5, -3],
      [-5, 3],
      [0, 5],
      [5, 3],
      [5, -3],
      null,
      [-3, 2],
      [-3, -2],
      [2, -2],
      [3, -1],
      [2, 0],
      [-3, 0],
      null,
      [2, 0],
      [3, 2]
    ]
  ];
}


