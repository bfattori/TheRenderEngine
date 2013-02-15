/**
 * The Render Engine
 * Math3D
 *
 * @fileoverview A static 3D math library with several helper methods.
 *
 * @author: Brett Fattori (brettf@renderengine.com)
 * @author: $Author: bfattori@gmail.com $
 * @version: $Revision: 1570 $
 *
 * Copyright (c) 2011 Brett Fattori (brettf@renderengine.com)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 */

// The class this file defines and its required classes
R.Engine.define({
	"class": "R.math.Math3D",
	"requires": [
		"R.math.Point2D",
      "R.math.Point3D",
		"R.math.Vector2D",
      "R.math.Vector3D"
    ],

    "includes": [
        "/../engine/libs/sylvester.js"
    ]
});

/**
 * @class A static class with methods and fields that are helpful
 * when dealing with two dimensional mathematics.
 *
 * @static
 */
R.math.Math3D = /** @scope R.math.Math3D.prototype */{

   /**
    * The 30&deg; isometic projection (NEN/ISO)
    * @type {Number}
    */
   ISOMETRIC_PROJECTION: 1,

   /**
    * The dimetric 1:2 top projection
    * @type {Number}
    */
   DIMETRIC_TOP_PROJECTION: 2,

   /**
    * The dimetric 1:2 side projection
    * @type {Number}
    */
   DIMETRIC_SIDE_PROJECTION: 3,

   /**
    * Project a 2d point to 3d, using one of three projection types: {@link R.math.Math3D#ISOMETRIC_PROJECTION}
    * <i>(default)</i>, {@link R.math.Math3D#DIMETRIC_SIDE_PROJECTION}, or
    * {@link R.math.Math3D#DIMETRIC_TOP_PROJECTION}.
    * <p/>
    * Reference: <a href="http://www.compuphase.com/axometr.htm">http://www.compuphase.com/axometr.htm</a>
    *
    * @param point2d {R.math.Point2D} The point to project into 3 dimensions
    * @param height {Number} The height of the ground.  We must use a particular height to
    * 		extrapolate our 3D coordinates from.  If the ground is considered level, this can remain zero.
    * @param projectionType {Number} One of the three projection types in {@link R.math.Math2D}
    * @return {R.math.Point3D} This point, projected into 3 dimensions
    */
   project: function(point2d, height, projectionType){
      height = height || 0;
      projectionType = projectionType || R.math.Math3D.ISOMETRIC_PROJECTION;
      var pt = R.math.Point3D.create(0, 0, 0);
      switch (projectionType) {
         case R.math.Math3D.ISOMETRIC_PROJECTION:
            pt.set(0.5 * point2d.x + point2d.y - height, -(0.5 * point2d.x) + point2d.y - height, height);
            break;
         case R.math.Math3D.DIMETRIC_SIDE_PROJECTION:
            pt.set(point2d.x + (2 * (point2d.y - height)), 4 * point2d.y - height, height);
            break;
         case R.math.Math3D.DIMETRIC_TOP_PROJECTION:
            pt.set(point2d.x - ((point2d.y - height) / 2), 2 * (point2d.y - height), height);
            break;
      }
      return pt;
   },

   /**
    * Project a 3d point to a 2d point, using one of three projection
    * types: {@link R.math.Math3D#ISOMETRIC_PROJECTION} <i>(default)</i>, {@link R.math.Math3D#DIMETRIC_SIDE_PROJECTION}, or
    * {@link R.math.Math3D#DIMETRIC_TOP_PROJECTION}.
    * <p/>
    * Reference: http://www.compuphase.com/axometr.htm
    *
    * @param point3d {R.math.Point3D} The point to project into 2 dimensions
    * @param projectionType {Number} One of the three projection types in {@link R.math.Math2D}
    * @return {R.math.Point2D} This point, projected into 2 dimensions
    */
   unproject: function(point3d, projectionType){
      projectionType = projectionType || R.math.Math3D.ISOMETRIC_PROJECTION;
      var pt = R.math.Point2D.create(0, 0);
      switch (projectionType) {
         case R.math.Math3D.ISOMETRIC_PROJECTION:
            pt.set(point3d.x - point3d.z, point3d.y + ((point3d.x + point3d.z) / 2));
            break;
         case R.math.Math3D.DIMETRIC_SIDE_PROJECTION:
            pt.set(point3d.x + (point3d.z / 2), point3d.y + (point3d.z / 4));
            break;
         case R.math.Math3D.DIMETRIC_TOP_PROJECTION:
            pt.set(point3d.x + (point3d.z / 4), point3d.y + (point3d.z / 2));
            break;
      }
      return pt;
   }

};
