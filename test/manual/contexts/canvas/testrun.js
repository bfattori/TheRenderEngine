
R.Engine.requires("/rendercontexts/context.canvascontext.js");
R.Engine.requires("/engine.math2d.js");

R.Engine.initObject("TestRunner", null, function() {

	var TestRunner = Base.extend({
		
		constructor: null,

		viewRect: Rectangle2D.create(0,0,400,400),
		
		run: function() {
			// Set up a canvas for a simple object
			var ctx = CanvasContext.create("context", 400, 400);
			ctx.setBackgroundColor("black");
			ctx.setStatic(true);
			ctx.setFontSize(36);
			
			R.Engine.getDefaultContext().add(ctx);
			
			// Draw some shapes
			ctx.setLineStyle("yellow");
			for (var x = 0; x < 3; x++) {
				ctx.setLineWidth(x + 1);
				ctx.drawRectangle(Rectangle2D.create(10 + (x * 30), 5, 20, 20));
			}

			ctx.setFillStyle("yellow");
			for (var x = 3; x < 6; x++) {
				ctx.drawFilledRectangle(Rectangle2D.create(10 + (x * 30), 5, 20, 20));
			}

			ctx.setLineStyle("orange");
			for (var x = 0; x < 3; x++) {
				ctx.setLineWidth(x + 1);
				ctx.drawCircle(Point2D.create(20 + (x * 30), 40), 10);
			}

			ctx.setFillStyle("orange");
			for (var x = 3; x < 6; x++) {
				ctx.drawFilledCircle(Point2D.create(20 + (x * 30), 40), 10);
			}

			ctx.setFillStyle("orange");
			for (var x = 6; x < 9; x++) {
				ctx.drawFilledArc(Point2D.create(20 + (x * 30), 40), 10, Math2D.degToRad(x * 8), 5.45);
			}
			
			ctx.setLineStyle("green");
			ctx.setLineWidth(1);
			ctx.strokeText(Point2D.create(10, 80), "Stroked Text Testing");

			ctx.setFillStyle("green");
			ctx.drawText(Point2D.create(10, 110), "Filled Text Testing");

		}
		
	});

	R.engine.Support.whenReady(TestRunner, function() {
		TestRunner.run();
	});

	return TestRunner;	
});

