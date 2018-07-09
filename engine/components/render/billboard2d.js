/**
 * The Render Engine
 * BillboardComponent
 *
 * Copyright (c) 2011 Brett Fattori (brettf@renderengine.com)
 */
"use strict";

/**
 * @class The billboard component renders the contents of an image which
 *        was generated by a linked render component.  When the contents
 *        of the linked component are re-rendered, the contents of the
 *        image are updated.  The best usage of this component is for infrequently
 *        changing vector drawn objects.  For example:
 *        <pre>
 *     // Add component to draw the object
 *     this.add(R.components.Billboard2D.create("draw", R.components.Vector2D.create("vector")));
 *        </pre>
 *        Accessing the <tt>R.components.Vector2D</tt> within the <tt>R.components.Billboard2D</tt>
 *        is as simple as calling {@link #getComponent}.  If the contents of the linked
 *        component are updated, you will need to call {@link #regenerate} to recreate the
 *        billboard image.
 *
 *
 * @param name {String} The name of the component
 * @param renderComponent {RenderComponent} A render component to create the billboard from
 * @param priority {Number} The priority of the component between 0.0 and 1.0
 * @constructor
 * @extends RenderComponent
 * @description Creates a 2d billboard component.
 */
class Billboard2DComponent extends RenderComponent {

  static REDRAW = 0;
  static DRAWN = 1;

  /**
   * A temporary context to which all billboards will render their
   * bitmaps.
   * @private
   */
  static tempContext = null;

  constructor(name, priority = 0.1, renderComponent) {
    Assert(renderComponent instanceof RenderComponent ||
      renderComponent instanceof AbstractTextRenderer, "Attempt to assign a non-render component to a billboard component");
    super(name, priority);
    this._mode = Billboard2DComponent.REDRAW;
    this._renderComponent = renderComponent;
    this._billboard = null;
  }

  /**
   * Destroy the object
   */
  destroy() {
    this.renderComponent.destroy();
    super.destroy();
  }

  release() {
    super.release();
    this._mode = null;
    this._renderComponent = null;
    this._billboard = null;
  }

  /**
   * Get the class name of this object
   *
   * @return {String} "Billboard2DComponent"
   */
  get className() {
    return "Billboard2DComponent";
  }

  /**
   * Establishes the link between this component and its game object.
   * When you assign components to a game object, it will call this method
   * so that each component can refer to its game object, the same way
   * a game object can refer to a component with {@link R.engine.GameObject#getComponent}.
   *
   * @param gameObject {GameObject} The object which hosts this component
   */
  set gameObject(gameObject) {
    this.renderComponent.gameObject = gameObject;
    super.gameObject = gameObject;
  }

  /**
   * Call this method when the linked render component has been updated
   * to force the billboard to be redrawn.
   */
  regenerate() {
    this._mode = Billboard2DComponent.REDRAW;
    this.gameObject.markDirty();
  }

  /**
   * Get the linked render component.
   * @return {RenderComponent}
   */
  get renderComponent() {
    return this._renderComponent;
  }

  get mode() {
    return this._mode;
  }

  /**
   * Draws the contents of the billboard to the render context.  This
   * component operates in one of two modes.  When the contents of the
   * subclassed component are redrawing, a temporary render context is created
   * to which the component renders.  The second mode is where the contents
   * of the context from the first mode are rendered instead of performing
   * all of the operations required to render the component.  This component
   * is only good if the contents don't change often.
   *
   * @param renderContext {RenderContext2D} The rendering context
   */
  render(renderContext) {
    if (!super.render(renderContext)) {
      return;
    }

    // Get the host object's bounding box
    var hostBox = this.gameObject.boundingBox;
    var origin = Point2D.create(this.gameObject.origin);

    if (this._mode == Billboard2DComponent.REDRAW) {
      // We'll match the type of context the component is rendering to
      //var ctx = this.getGameObject().getRenderContext().constructor;

      if (!this._billboard) {
        // Due to pooling, we don't need to recreate this each time
        this._billboard = document.createElement("img");
      }

      this._billboard.setAttribute("src", RenderUtil.renderComponentToImage(CanvasContext, this.renderComponent, hostBox.width, hostBox.height, null, origin));
      this._billboard.setAttribute("width", hostBox.width);
      this._billboard.setAttribute("height", hostBox.height);
      this._mode = Billboard2DComponent.DRAWN;
    }

    // Render the billboard.  If the bounding box's origin is negative in
    // either X or Y, we'll need to move the transformation there before rendering the object
    this.transformOrigin(renderContext, true);
    renderContext.drawImage(this.gameObject.boundingBox, this._billboard[0], this.gameObject);

    // Debug the billboard image box
    if (RenderEngine.debugMode) {
      renderContext.lineStyle = "green";
      renderContext.drawRectangle(this.gameObject.boundingBox, this.gameObject);
    }

    this.transformOrigin(renderContext, false);
    origin.destroy();
  }

}
