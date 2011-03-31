/**
 * The Render Engine
 * [libname]
 * 
 * [description]
 *
 * @author: Brett Fattori (brettf@renderengine.com)
 *
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

R.Engine.requires("/components/component.image.js");
R.Engine.requires("/components/component.transform2d.js");
R.Engine.requires("/engine.object2d.js");


R.Engine.initObject("FontRender", "Object2D", function() {

// http://catcam.mypets.ws/renderengine/fonts/century_gothic_36.png	
	var FontRender = Object2D.extend({
		
		constructor: function(imageName) {
			this.base();
			this.add(Transform2DComponent.create("move"));
			this.add(ImageComponent.create("fontImg", FontEditor.getImageLoader(), imageName));
			
			this.getComponent("move").setPosition(Point2D.create(0,0));
		},
		
		update: function(renderContext, time) {
			renderContext.pushTransform();
			
			this.base(renderContext, time);
			
			renderContext.popTransform();
		}
		
	});
	
	return FontRender;
})
