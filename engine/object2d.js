/**
 * The Render Engine
 * Object2D
 *
 * @fileoverview An extension of the <tt>HostObject</tt> which is specifically geared
 *               towards 2d game development.
 *
 * @author: Brett Fattori (brettf@renderengine.com)
 * @author: $Author: bfattori $
 * @version: $Revision: 1555 $
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
	"class": "R.engine.Object2D",
	"requires": [
		"R.engine.GameObject",
		"R.collision.OBBHull",
		"R.math.Rectangle2D",
		"R.math.Circle2D",
		"R.math.Point2D",
		"R.math.Vector2D",
		"R.math.Math2D",
		"R.components.Transform2D"
	]
});

/**
 * @class An object for use in a 2d game environment.  If no <tt>transformComponent</tt> is provided,
 * the object will be assigned a {@link R.components.Transform2D Transform2D} component.  This class is the recommended
 * base class for objects used within a 2d game environment, instead of deriving from the base 
 * {@link R.engine.GameObject} class. 
 * 
 * @param name {String} The name of the object
 * @param [transformComponent] {R.components.Transform2D} The transform component to use, or
 *		<code>null</code>.  If the value is <code>null</code>, the object will be assigned a default
 *		{@link R.components.Transform2D Transform2D} component.
 * @extends R.engine.GameObject
 * @constructor
 * @description Create a game object with methods for operating in a 2D context.
 */
R.engine.Object2D = function(){
	return R.engine.GameObject.extend(/** @scope R.engine.Object2D.prototype */{
	
		/** @private */
		zIndex: 1,
		
		/** @private */
		bBox: null,
		AABB: null,
		wBox: null,
		wCircle: null,
		lastPosition: null,
      lastRenderPosition: null,
		origin: null,
		collisionHull: null,
		genHull: null,
		defaultTxfmComponent: null,
		
		// Current origin/negative-origin matrices
		oMtx: null,
		oMtxN: null,
		
		/** @private */
		constructor: function(name, transformComponent){
			this.base(name);
			this.lastPosition = R.math.Point2D.create(5, 5);
         this.lastRenderPosition = R.math.Point2D.create(5, 5);
			this.bBox = R.math.Rectangle2D.create(0, 0, 1, 1);
			this.AABB = R.math.Rectangle2D.create(0, 0, 1, 1);
			this.wBox = R.math.Rectangle2D.create(0, 0, 1, 1);
			this.wCircle = R.math.Circle2D.create(0, 0, 1);
			this.zIndex = 0;
			this.origin = R.math.Point2D.create(0, 0);
			this.collisionHull = null;
			this.genHull = false;
			
			// Assign a default 2d transformation component to store position information
			this.defaultTxfmComponent = transformComponent != null ? transformComponent : R.components.Transform2D.create("dTxfm__");
			this.add(this.defaultTxfmComponent);
						
			// Initialize the matrices
			this.oMtx = R.math.Math2D.identityMatrix();
			this.oMtxN = R.math.Math2D.identityMatrix();
		},
		
		/**
		 * Destroy the object.
		 */
		destroy: function(){
			this.bBox.destroy();
			this.wBox.destroy();
			this.wCircle.destroy();
			this.lastPosition.destroy();
         this.lastRenderPosition.destroy();
			if (this.collisionHull) {
				this.collisionHull.destroy();
			}
			this.base();
		},
		
		/**
		 * Release the object back into the pool.
		 */
		release: function(){
			this.base();
			this.zIndex = 1;
			this.bBox = null;
			this.wBox = null;
			this.wCircle = null;
			this.lastPosition = null;
         this.lastRenderPosition = null;
			this.collisionHull = null;
			this.genHull = null;
			
			// Free the matrices
			this.oMtx = null;
			this.oMtxN = null;
		},
		
		/**
		 * Get the transformation matrix for this object
		 * @return {Matrix}
		 */
		getTransformationMatrix: function(){
			// Translation
			var p = this.getRenderPosition();
			var tMtx = $M([[1, 0, p.x], [0, 1, p.y], [0, 0, 1]]);
			tMtx = tMtx.multiply(this.oMtxN);
			
			// Rotation
			var a = this.getRotation();
			var rMtx;
			if (a != 0) {
				// Move the origin
				rMtx = this.oMtx.dup();
				// Rotate
				rMtx = rMtx.multiply(Matrix.Rotation(R.math.Math2D.degToRad(a), R.engine.Object2D.ROTATION_AXIS));
				// Move the origin back
				rMtx = rMtx.multiply(this.oMtxN);
			}
			else {
				// Set to identity
				rMtx = R.math.Math2D.identityMatrix();
			}
			
			// Scale
			var sX = this.getScaleX();
			var sY = this.getScaleY();
			var sMtx = $M([[sX, 0, 0], [0, sY, 0], [0, 0, 1]]);
			
			return tMtx.multiply(rMtx).multiply(sMtx);
		},
		
		/**
		 * Set the render origin of the object.  The render origin is where the object will be
		 * centered around when drawing position and rotation.
		 *
		 * @param x {Number|R.math.Point2D} The X coordinate or the render origin (default: 0,0 - top left corner)
		 * @param y {Number} The Y coordinate or <code>null</code> if X is a <code>Point2D</code>
		 */
		setOrigin: function(x, y){
			this.origin.set(x, y);
			
			var pX = x;
			var pY = y;
			
			if (x instanceof R.math.Point2D) {
				pX = x.x;
				pY = x.y;
			}
			
			this.oMtx.setElements([[1, 0, pX], [0, 1, pY], [0, 0, 1]]);
			this.oMtxN.setElements([[1, 0, -pX], [0, 1, -pY], [0, 0, 1]]);
			
			this.markDirty();
		},
		
		/**
		 * Get the render origin of the object.
		 * @return {R.math.Point2D}
		 */
		getOrigin: function(){
			return this.origin;
		},
		
		/**
		 * Set the bounding box of this object
		 *
		 * @param width {Number|R.math.Rectangle2D} The width, or the rectangle that completely encompasses
		 *                           		this object.
		 * @param height {Number} If width is a number, this is the height
		 */
		setBoundingBox: function(width, height){
			if (width instanceof R.math.Rectangle2D) {
				this.bBox.set(width);
			}
			else {
				this.bBox.set(0, 0, width, height);
			}
			
			if (this.genHull) {
				// Do this so a new collision hull is generated
				this.collisionHull = null;
				this.genHull = false;
			}
			
			this.markDirty();
		},
		
		/**
		 * Get the object's local bounding box.
		 * @return {R.math.Rectangle2D} The object bounding rectangle
		 */
		getBoundingBox: function(){
			return this.bBox;
		},
		
		/**
		 * [ABSTRACT] Get the object's local bounding circle.
		 * @return {R.math.Circle2D} The object bounding circle
		 */
		getBoundingCircle: function(){
			return null;
		},
		
		/**
		 * Get the object's bounding box in world coordinates.
		 * @return {R.math.Rectangle2D} The world bounding rectangle
		 */
		getWorldBox: function(){
         // TODO: Should probably also check to see if the
         // bounding box has changed size or origin has moved
         if (this.getRenderPosition().equals(this.lastRenderPosition)) {
            return this.wBox;
         }

			this.wBox.set(this.getBoundingBox());
			var rPos = R.math.Point2D.create(this.getRenderPosition());
			rPos.sub(this.origin);
			this.wBox.offset(rPos);
			rPos.destroy();
         this.lastRenderPosition.set(this.getRenderPosition());
			return this.wBox;
		},
		
		/**
		 * Get the object's bounding circle in world coordinates.  If {@link #getBoundingCircle} returns
		 * null, the bounding circle will be approximated using {@link #getBoundingBox}.
		 *
		 * @return {R.math.Circle2D} The world bounding circle
		 */
		getWorldCircle: function(){
			var c = this.getBoundingCircle();
			
			if (c === null) {
				c = R.math.Circle2D.approximateFromRectangle(this.getBoundingBox());
				this.wCircle.set(c);
				c.destroy();
			} else {
				this.wCircle.set(c);
			}
			
			var rPos = R.math.Point2D.create(this.getRenderPosition());
			rPos.sub(this.origin);
			this.wCircle.offset(rPos);
			rPos.destroy();
			return this.wCircle;
		},
		
		/**
		 * Get an axis aligned world bounding box for the object.  This bounding box
		 * is ensured to encompass the entire object.
		 * @return {R.math.Rectangle2D}
		 */
		getAABB: function(){
			// Start with the world bounding box and transform it
			var bb = R.math.Rectangle2D.create(this.getBoundingBox());
			
			// Transform the world box
			var txfm = this.getTransformationMatrix();
			
			var p1 = bb.getTopLeft();
			var p2 = R.math.Point2D.create(bb.getTopLeft());
			p2.x += bb.getDims().x;
			var p3 = bb.getBottomRight();
			var p4 = R.math.Point2D.create(bb.getTopLeft());
			p4.y += bb.getDims().y;
			var pts = [p1.transform(txfm), p2.transform(txfm), p3.transform(txfm), p4.transform(txfm)];
			
			// Now find the AABB
			var x1 = R.lang.Math2.MAX_INT;
			var x2 = -R.lang.Math2.MAX_INT;
			var y1 = x1;
			var y2 = x2;
			
			for (var p in pts) {
				var pt = pts[p];
				if (pt.x < x1) 
					x1 = pt.x;
				if (pt.x > x2) 
					x2 = pt.x;
				if (pt.y < y1) 
					y1 = pt.y;
				if (pt.y > y2) 
					y2 = pt.y;
			}
			
			bb.destroy();
			p2.destroy();
			p3.destroy();
			
			this.AABB.set(x1, y1, x2 - x1, y2 - y1);
			return this.AABB;
		},
		
		/**
		 * Set the convex hull used for collision.  The {@link R.components.ConvexCollider ConvexCollider} component
		 * uses the collision hull to perform the collision testing.
		 * @param convexHull {R.collision.ConvexHull} The convex hull object
		 */
		setCollisionHull: function(convexHull){
			Assert(convexHull instanceof R.collision.ConvexHull, "setCollisionHull() - not ConvexHull!");
			this.collisionHull = convexHull;
			this.collisionHull.setGameObject(this);
			this.genHull = false;
			this.markDirty();
		},
		
		/**
		 * Get the convex hull used for collision testing with a {@link R.components.ConvexCollider ConvexCollider}
		 * component.  If no collision hull has been assigned, a simple {@link R.collision.OBBHull OBBHull} will
		 * be created and returned.
		 *
		 * @return {R.collision.ConvexHull}
		 */
		getCollisionHull: function(){
			if (this.collisionHull == null) {
				this.collisionHull = R.collision.OBBHull.create(this.getBoundingBox());
				this.genHull = true;
			}
			
			return this.collisionHull;
		},
		
		/**
		 * Get the default transform component.
		 * @return {R.components.Transform2D}
		 */
		getDefaultTransformComponent: function() {
			return this.defaultTxfmComponent;
		},
		
		/**
		 * Set the position of the object
		 * @param point {R.math.Point2D|Number} The position of the object, or a simple X coordinate
		 * @param [y] {Number} A Y coordinate if <tt>point</tt> is a number
		 */
		setPosition: function(point, y){
			this.getDefaultTransformComponent().getPosition().set(point, y);
			this.markDirty();
		},
		
		/**
		 * Get the position of the object.
		 * @return {R.math.Point2D} The position
		 */
		getPosition: function(){
			return this.getDefaultTransformComponent().getPosition();
		},
		
		/**
		 * Get the render position of the object.
		 * @return {R.math.Point2D}
		 */
		getRenderPosition: function(){
			return this.getDefaultTransformComponent().getRenderPosition();
		},
		
		/**
		 * Get the last position the object was rendered at.
		 * @return {R.math.Point2D}
		 */
		getLastPosition: function(){
			return this.getDefaultTransformComponent().getLastPosition();
		},
		
		/**
		 * Set the rotation of the object
		 * @param angle {Number} The rotation angle
		 */
		setRotation: function(angle){
			this.getDefaultTransformComponent().setRotation(angle)
			this.markDirty();
		},
		
		/**
		 * Get the rotation of the object
		 * @return {Number} Angle in degrees
		 */
		getRotation: function(){
			return this.getDefaultTransformComponent().getRotation();
		},
		
		/**
		 * Get the world adjusted rotation of the object
		 * @return {Number} Angle in degrees
		 */
		getRenderRotation: function() {
			return this.getDefaultTransformComponent().getRenderRotation();
		},
		
		/**
		 * Set the scale of the object along the X and Y axis in the scaling matrix
		 * @param scaleX {Number} The scale along the X axis
		 * @param [scaleY] {Number} Optional scale along the Y axis.  If no value is provided
		 *		<tt>scaleX</tt> will be used to perform a uniform scale.
		 */
		setScale: function(scaleX, scaleY){
			this.getDefaultTransformComponent().setScale(scaleX, scaleY);
			this.markDirty();
		},
		
		/**
		 * Get the uniform scale of the object.  If the object is using a non-uniform
		 * scale, only the X scale is returned.
		 * @return {Number}
		 */
		getScale: function(){
			return this.getScaleX();
		},
		
		/**
		 * Get the scale of the object along the X axis
		 * @return {Number}
		 */
		getScaleX: function(){
			return this.getDefaultTransformComponent().getScaleX();
		},
		
		/**
		 * Get the scale of the object along the Y axis.
		 * @return {Number}
		 */
		getScaleY: function(){
			return this.getDefaultTransformComponent().getScaleY();
		},
		
		/**
		 * Set the depth at which this object will render to
		 * the context.  The lower the z-index, the further
		 * away from the front the object will draw.
		 *
		 * @param zIndex {Number} The z-index of this object
		 */
		setZIndex: function(zIndex){
			if (this.getRenderContext() && this.getRenderContext().swapBins) {
				this.getRenderContext().swapBins(this, this.zIndex, zIndex);
			}
			this.zIndex = zIndex;
			if (this.getRenderContext()) {
				this.getRenderContext().sort();
			}
			this.markDirty();
		},
		
		/**
		 * Get the depth at which this object will render to
		 * the context.
		 *
		 * @return {Number}
		 */
		getZIndex: function(){
			return this.zIndex;
		},
		
		/**
		 * When editing objects, this method returns an object which
		 * contains the properties with their getter and setter methods.
		 * @return {Object} The properties object
		 */
		getProperties: function(){
			var self = this;
			var prop = this.base(self);
			return $.extend(prop, {
				"ZIndex": [function(){
					return self.getZIndex();
				}, function(i){
					self.setZIndex(i);
				}, true],
				"BoundingBox": [function(){
					return self.getBoundingBox().toString();
				}, null, false],
				"WorldBox": [function(){
					return self.getWorldBox().toString();
				}, null, false],
				"Position": [function(){
					return self.getPosition().toString();
				}, function(i){
					var p = i.split(",");
					self.setPosition(R.math.Point2D.create(p[0], p[1]));
				}, true],
				"Origin": [function(){
					return self.getOrigin().toString();
				}, function(i){
					var p = i.split(",");
					self.setOrigin(p[0], p[1]);
				}, true],
				"RenderPos": [function(){
					return self.getRenderPosition().toString()
				}, null, false],
				"Rotation": [function(){
					return self.getRotation();
				}, function(i){
					self.setRotation(i);
				}, true],
				"ScaleX": [function(){
					return self.getScaleX();
				}, function(i){
					self.setScale(i, self.getScaleY());
				}, true],
				"ScaleY": [function(){
					return self.getScaleY();
				}, function(i){
					self.setScale(self.getScaleX(), i);
				}, true]
			});
		}
				
	}, /** @scope R.engine.Object2D.prototype */ {
		/**
		 * Get the class name of this object
		 *
		 * @return {String} "R.engine.Object2D"
		 */
		getClassName: function(){
			return "R.engine.Object2D";
		},
		
		/**
		 * The axis of rotation
		 * @private
		 */
		ROTATION_AXIS: $V([0, 0, 1])
	});
	
}