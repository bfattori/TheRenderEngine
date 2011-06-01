
// Extend LevelEditor with object editing functionality
LevelEditor.extend({

   //=====================================================================================================
   // CREATORS

   /**
    * Create a sprite actor object
    * @param actorName {String} The canonical name of the sprite
    * @private
    */
   createActor: function(actorName) {
      var ctx = LevelEditor.gameRenderContext;
      var actor = R.objects.SpriteActor.create();

      // Set the sprite given the canonical name for it
      actor.setSprite(LevelEditor.getSpriteForName(actorName));

      // Adjust for scroll
      var s = ctx.getHorizontalScroll();

      var vPort = LevelEditor.gameRenderContext.getViewport().get();
      var hCenter = Math.floor(vPort.w / 2), vCenter = Math.floor(vPort.h / 2);
      var pT = R.math.Point2D.create(hCenter + s, vCenter);
      actor.setPosition(pT);
      actor.setZIndex(LevelEditor.nextZ++);

      ctx.add(actor);
      LevelEditor.setSelected(actor);

      // Add the actor to the tree
      $("#editPanel div.sceneGraph").jstree("create", "#sg_actors", "last", {
         "attr": { "id": actor.getId() },
         "data": actor.getName() + " [" + actor.getId() + "]"
      }, false, true);
      LevelEditor.dirty = true;
   },

   /**
    * Create a collision box to impede movement
    * @param {Object} game
    * @private
    */
   createCollisionBox: function() {
      var ctx = LevelEditor.gameRenderContext;
      var cbox = R.objects.Fixture.create();

      // Adjust for scroll
      var s = ctx.getHorizontalScroll();
      var vPort = ctx.getViewport();
      var hCenter = Math.floor(vPort.w / 2), vCenter = Math.floor(vPort.h / 2);
      var pT = R.math.Point2D.create(hCenter + s, vCenter);

      cbox.setPosition(pT);
      cbox.setBoxSize(80, 80);
      cbox.setZIndex(LevelEditor.nextZ++);
      ctx.add(cbox);
      LevelEditor.setSelected(cbox);

      // Add the box to the tree
      $("#editPanel div.sceneGraph").jstree("create", "#sg_fixture", "last", {
         "attr": { "id": cbox.getId() },
         "data": cbox.getName() + " [" + cbox.getId() + "]"
      }, false, true);
      LevelEditor.dirty = true;
   },

   /**
    * Create a collision box that when touched triggers an action
    * @param {Object} game
    * @private
    */
   createTriggerBox: function() {
      var ctx = LevelEditor.gameRenderContext;
      var cbox = R.objects.Fixture.create();

      // Adjust for scroll
      var s = ctx.getHorizontalScroll();
      var vPort = ctx.getViewport();
      var hCenter = Math.floor(vPort.w / 2), vCenter = Math.floor(vPort.h / 2);
      var pT = R.math.Point2D.create(hCenter + s, vCenter);

      cbox.setPosition(pT);
      cbox.setBoxSize(80, 80);
      cbox.setZIndex(LevelEditor.nextZ++);
      cbox.setType(R.objects.Fixture.TYPE_TRIGGER);
      ctx.add(cbox);
      LevelEditor.setSelected(cbox);

      // Add the box to the tree
      $("#editPanel div.sceneGraph").jstree("create", "#sg_trigger", "last", {
         "attr": { "id": cbox.getId() },
         "data": cbox.getName() + " [" + cbox.getId() + "]"
      }, false, true);
      LevelEditor.dirty = true;
   },

   //=====================================================================================================
   // EDITOR METHODS

   /**
    * Copy an object and all of its properties into a new object of the same type
    * @param obj {Object2D} The object to copy
    * @private
    */
   copyObject: function(obj) {
      obj = obj || LevelEditor.currentSelectedObject;
      if (obj != null) {
         var original = obj;

         // What type of object is this?
         if (obj instanceof R.objects.SpriteActor) {
            // Create a new actor
            var cName = LevelEditor.getSpriteCanonicalName(obj.getSprite());
            LevelEditor.createActor(cName);
         } else if (obj instanceof R.objects.Fixture) {
            LevelEditor.createCollisionBox();
         }
         /* else if (obj instanceof TriggerBox) {

          }*/

         var bean = LevelEditor.currentSelectedObject.getProperties(), origProps = original.getProperties();

         for (var p in bean) {
            // Regardless if the editable flag is true, if there is a setter, we'll
            // call it to copy the value over.
            if (bean[p][1]) {
               if (bean[p][1].multi && bean[p][1].multi === true) {
                  // Multi-option
                  bean[p][1].fn(origProps[p][0]());
               } else if (bean[p][1].checkbox && bean[p][1].checkbox === true) {
                  // Checkbox toggle
               } else if (bean[p][1].editor && bean[p][1].editor === true) {
                  // Custom editor
                  bean[p][1].fn(origProps[p][0]());
               } else {
                  // Single value
                  bean[p][1](origProps[p][0]());
               }
            }
         }

         // If the object isn't in the current viewport, move it to the viewport's center
         // otherwise, offset it by half width and height down and to the right
         var newObj = LevelEditor.currentSelectedObject,
         ctx = LevelEditor.gameRenderContext, s = ctx.getHorizontalScroll(), pT;

         if (!ctx.getViewport().isIntersecting(newObj.getWorldBox())) {
            var vPort = LevelEditor.gameRenderContext.getViewport();
            var hCenter = Math.floor(vPort.w / 2), vCenter = Math.floor(vPort.h / 2);
            pT = R.math.Point2D.create(hCenter + s, vCenter);
         } else {
            var offs = R.math.Point2D.create(newObj.getBoundingBox().getHalfWidth() + s, newObj.getBoundingBox().getHalfHeight());
            pT = R.math.Point2D.create(newObj.getRenderPosition()).add(offs);
            offs.destroy();
         }

         newObj.setPosition(pT);
         pT.destroy();

         // Make sure the label in the tree matches the new object's name and Id
         $("#editPanel div.sceneGraph").jstree("set_text", "#" + newObj.getId(), newObj.getName() + " [" + newObj.getId() + "]");
      }
   },

   /**
    * Select the object which is at the given coordinates
    * @param {Object} x
    * @param {Object} y
    * @private
    */
   selectObject: function(x, y) {
      LevelEditor.deselectObject();

      // Adjust for context location
      var ctx = LevelEditor.gameRenderContext;
      x -= LevelEditor.contextOffset.left;
      y -= LevelEditor.contextOffset.top;

      // Check to see if this object falls on top of an object
      var pt = R.math.Point2D.create(x, y);
      var itr = ctx.iterator();
      itr.reverse();
      while (itr.hasNext()) {
         var obj = itr.next();
         if (obj.isEditable && obj.getWorldBox().containsPoint(pt)) {
            LevelEditor.setSelected(obj);
            break;
         }
      }
      itr.destroy();
      pt.destroy();
   },

   /**
    * Deselect the given object, or the currently selected object if "obj" is null
    * @param {Object} obj
    * @private
    */
   deselectObject: function(obj) {
      var objId;
      if (obj == null) {
         if (LevelEditor.currentSelectedObject) {
            objId = LevelEditor.currentSelectedObject.getId();
            LevelEditor.currentSelectedObject.setEditing(false);
            LevelEditor.currentSelectedObject = null;
         }
      } else {
         obj.setEditing(false);
         objId = obj.getId();
      }

      // Deselect node in tree
      $("#editPanel div.sceneGraph").jstree("deselect_node", "#" + objId);
   },

   /**
    * Delete the given object, or delete the currently selected object if "obj" is null
    * @param {Object} obj
    * @private
    */
   deleteObject: function(obj) {
      var objId;
      if (obj == null) {
         if (LevelEditor.currentSelectedObject) {
            objId = LevelEditor.currentSelectedObject.getId();
            LevelEditor.getGame().getRenderContext().remove(LevelEditor.currentSelectedObject);
            LevelEditor.currentSelectedObject.destroy();
            LevelEditor.currentSelectedObject = null;
         }
      } else {
         objId = obj.getId();
         LevelEditor.getGame().getRenderContext().remove(obj);
         obj.destroy();
      }
      LevelEditor.createPropertiesTable(null);

      // Update the scene graph tree
      $("#editPanel div.sceneGraph").jstree("remove", "#" + objId);
      LevelEditor.dirty = true;
   },

   /**
    * Select an object by its Id
    * @param {Object} objId
    * @private
    */
   selectById: function(objId) {
      LevelEditor.setSelected(LevelEditor.getObjectById(objId));
   },

   /**
    * Set the selected object
    * @param {Object} obj
    * @private
    */
   setSelected: function(obj) {
      LevelEditor.deselectObject();

      if (obj) {
         // Update the selection in the tree
         $("#editPanel div.sceneGraph").jstree("select_node", "#" + obj.getId());
      }

      LevelEditor.currentSelectedObject = obj;
      if (obj) {
         // Scroll the editor window to the object
         obj.setEditing(true);
      }
      LevelEditor.createPropertiesTable(obj);
   },

   /**
    * Move the currently selected object relative to the given coordinates
    * @param {Object} x
    * @param {Object} y
    * @private
    */
   moveSelected: function(x, y) {
      // Adjust for scroll and if the context was moved in the dom
      x += LevelEditor.gameRenderContext.getHorizontalScroll() - LevelEditor.contextOffset.left;
      y += LevelEditor.gameRenderContext.getVerticalScroll() - LevelEditor.contextOffset.top;

      var viewWidth = LevelEditor.gameRenderContext.getViewport().w;

      if (LevelEditor.currentSelectedObject) {
         var grid = viewWidth / LevelEditor.gridSize;
         x = x - x % LevelEditor.gridSize;
         y = y - y % LevelEditor.gridSize;
         var pt = R.math.Point2D.create(x, y);
         LevelEditor.currentSelectedObject.setPosition(pt);
         pt.destroy();
      }
   }
});
