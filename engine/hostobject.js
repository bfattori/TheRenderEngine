/**
 * The Render Engine
 * HostObject
 *
 * @fileoverview An object which contains components.  This is a base
 *               class for most in-game objects.
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
	"class": "R.engine.HostObject",
	"requires": [
		"R.engine.GameObject"
	]
});

/**
 * @class A host object is a container for components.  Each component within
 *        the host provides a portion of the overall functionality.  A host object
 *        can have any number of components of any type within it.  Components provide
 *        functionality for things like rendering, collision detection, effects, or 
 *        transformations. This way, an object can be anything, depending on it's components.
 *        <p/>
 *        A <tt>HostObject</tt> is the logical foundation for all in-game objects.  It is
 *        through this mechanism that game objects can be created without having to manipulate
 *        large, monolithic objects.  A <tt>HostObject</tt> contains {@link R.components.Base Components},
 *        which are the building blocks for complex functionality and ease of development.
 *        <p/>
 *        By building a <tt>HostObject</tt> from multiple components, the object gains the
 *        component's functionality without having to necessarily implement anything.  Many
 *        components already exist in the engine, but you are only limited by your imagination
 *        when it comes to developing new components.
 *			 <p/>
 *			 <i>This class has been deprecated.  Use {@link R.engine.GameObject} instead.</i>
 *
 * @extends R.engine.GameObject
 * @constructor
 * @description Create a host object.
 * @deprecated
 */
R.engine.HostObject = function(){
	return R.engine.GameObject.extend(/** @scope R.engine.HostObject.prototype */{});
}