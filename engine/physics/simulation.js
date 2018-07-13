/**
 * The Render Engine
 * Simulation
 *
 * Copyright (c) 2008-2018 Brett Fattori (bfattori@gmail.com)
 */
"use strict";

/**
 * @class A representation of a physical world.  This object is used to
 *        introduce Box2dWeb physics into your game by creating a world
 *        which supports the physical structures provided by Box2dWeb.  You
 *        will need to create an <tt>R.physics.Simulation</tt> before you can utilize
 *        physics in a game.
 *        <p/>
 *        See either "/demos/physics/" or "/demos/physics2" for examples
 *        of utilizing the <tt>R.physics.Simulation</tt> object with rigid body components.
 *
 * @param name {String} The name of the object
 * @param [gravity] {Vector2D} The world's gravity vector. default: [0, 650]
 * @extends BaseObject
 * @constructor
 * @description Create a physical world for Box2dJS
 */
class Simulation extends BaseObject {

  static FIXTURE_DEF = null;
  static BODY_DEF = null;

  /**
   * The default number of integrations per frame
   * @type {Number}
   */
  static DEFAULT_INTEGRATIONS = 10;

  /**
   * The size of the world in meters
   */
  static WORLD_SIZE = 20;

  /**
   * The world is updated at 60Hz, or 1/60th of a second.  This time step is
   * ideal so that objects do not jitter.  Changing this value can result in
   * some truly odd behavior in the simulation.
   * @type {Number}
   */
  static FIXED_TIMESTEP = 1 / 60;

  constructor(name, gravity = Vector2D.create(0, 10)) {
    super(name);
    var b2Gravity = new Box2D.Common.Math.b2Vec2(this.gravity.x, this.gravity.y);
    this.physOpts = {
      gravity: gravity,

      doSleep: true,
      integrations: Simulation.DEFAULT_INTEGRATIONS,

      // Create the world and get the ground body
      world: new Box2D.Dynamics.b2World(b2Gravity, true),
      groundBody: BaseRigidBody.create("WORLD_GROUND", new Box2D.Dynamics.b2FixtureDef())
    };
    this.physOpts.groundBody.body = world.GetGroundBody();
  }

  destroy() {
    this.physOpts.gravity.destroy();
    super.destroy();
  }

  release() {
    super.release();
    this.physOpts = null;
  }

  /**
   * Get the class name as a string.
   * @return {String} "R.physics.Simulation"
   */
  get className() {
    return "Simulation";
  }

  static resolved() {
    // These are reusable, according to Box2d docs
    Simulation.FIXTURE_DEF = new Box2D.Dynamics.b2FixtureDef();
    Simulation.BODY_DEF = new Box2D.Dynamics.b2BodyDef();
  }

  update(time, dt) {
    this.physOpts.world.Step(Simulation.FIXED_TIMESTEP, this.integrations, this.integrations);
    this.physOpts.world.ClearForces();
  }

  /**
   * Support method to get the ground body for the world.
   * @return {BaseRigidBody} The world's ground body
   * @private
   */
  get groundBody() {
    return this.physOpts._groundBody;
  }

  /**
   * Query the world within the given rectangle returning all of the
   * bodies found.
   * @param rect {Rectangle2D} The area to query
   * @return {Array} An array of <tt>Box2D.Dynamics.b2Body</tt> objects
   */
  getBodiesInArea(rect) {
    var aabb = new Box2D.Collision.b2AABB(), bodies = [];
    aabb.lowerBound.Set(rect.x, rect.y);
    aabb.upperBound.Set(rect.width, rect.height);

    // Query the world
    this.world.QueryAABB(function (fixture) {
      if (fixture.GetBody().GetType() !== Box2D.Dynamics.b2Body.b2_staticBody) {
        bodies.push(fixture.GetBody());
      }
      return true;
    }, aabb);

    return bodies;
  }

  /**
   * Query the world for the body that lies at the given point.
   * @param point {Point2D} The point to query
   * @return {Box2D.Dynamics.b2Body} The body found, or <tt>null</tt>
   */
  getBodyAtPoint(point) {
    var aabb = new Box2D.Collision.b2AABB(), body = null,
      qP = R.clone(point).div(Simulation.WORLD_SIZE),
      b2P = new Box2D.Common.Math.b2Vec2(qP.x, qP.y);

    aabb.lowerBound.Set(qP.x - 0.001, qP.y - 0.001);
    aabb.upperBound.Set(qP.x + 0.001, qP.y + 0.001);

    qP.destroy();

    // Query the world
    this.world.QueryAABB(function (fixture) {
      if (fixture.GetBody().GetType() != Box2D.Dynamics.b2Body.b2_staticBody &&
        fixture.GetShape().TestPoint(fixture.GetBody().GetTransform(), b2P)) {
        body = fixture.GetBody();
        return false;
      }
      return true;
    }, aabb);

    return body;
  }

  /**
   * Support method to add a body to the simulation.  The body must be one of the
   * box2d-js body types.  This method is intended to be used by {@link BaseRigidBody}.
   *
   * @param b2jsBodyDef {Box2D.Dynamics.b2BodyDef} A box2d-js Body definition object
   * @param b2jsFixtureDef {Box2D.Dynamics.b2FixtureDef} A box2d-js fixture definition object
   * @private
   */
  addBody(b2jsBodyDef, b2jsFixtureDef) {
    var b = this.world.CreateBody(b2jsBodyDef);
    b.CreateFixture(b2jsFixtureDef);
    return b;
  }

  /**
   * Support method to add a joint to the simulation.  The joint must be one of the
   * box2d-js joint types.  This method is intended to be used by {@link BaseJoint}.
   *
   * @param b2jsJointDef {Box2D.Dynamics.b2JointDef} A box2d-js Joint definition object
   * @private
   */
  addJoint(b2jsJointDef) {
    return this.world.CreateJoint(b2jsJointDef);
  }

  /**
   * Support method to remove a body from the simulation.  The body must be one of the
   * box2d-js body types.  This method is intended to be used by {@link BaseRigidBody}.
   *
   * @param b2jsBody {Box2D.Dynamics.b2Body} A box2d-js Body object
   * @private
   */
  removeBody(b2jsBody) {
    this.world.DestroyBody(b2jsBody);
  }

  /**
   * Support method to remove a joint from the simulation.  The joint must be one of the
   * box2d-js joint types.  This method is intended to be used by {@link BaseJoint}.
   *
   * @param b2jsJoint {Box2D.Dynamics.b2Joint} A box2d-js Joint object
   * @private
   */
  removeJoint(b2jsJoint) {
    this.world.DestroyJoint(b2jsJoint);
  }

  /**
   * Set the number of integrations per frame.  A higher number will result
   * in more accurate collisions, but will result in slower performance.
   *
   * @param integrations {Number} The number of integrations per frame
   */
  set integrations(integrations) {
    this.physOpts.integrations = integrations || Simulation.DEFAULT_INTEGRATIONS;
  }

  /**
   * Get the number of integrations per frame.
   * @return {Number}
   */
  get integrations() {
    return this.physOpt.integrations;
  }

  /**
   * Add a simple box body to the simulation.  The body doesn't have a visual
   * representation, but exists in the simulation and can be interacted with.
   *
   * @param pos {R.math.Point2D} The position where the body's top/left is located
   * @param extents {R.math.Point2D} The width and height of the body
   * @param properties {Object} An object with up to three properties: <ul>
   *       <li>restitution - The bounciness of the body</li>
   *         <li>friction - Friction against this body</li>
   *         <li>density - The density of the object (default: 0)</li>
   *         <li>isStatic - <tt>false</tt> for a dynamic body (default: <tt>true</tt>)</li></ul>
   *
   * @return {Box2D.Dynamics.b2Body} A Box2dWeb body definition object representing the box
   */
  addSimpleBoxBody(pos, extents, properties) {
    properties = _.extend({isStatic: true}, properties);

    var bodyDef = Simulation.BODY_DEF,
      fixDef = Simulation.FIXTURE_DEF;

    bodyDef.type = properties.isStatic ? Box2D.Dynamics.b2Body.b2_staticBody : Box2D.Dynamics.b2Body.b2_dynamicBody;

    fixDef.shape = new Box2D.Collision.Shapes.b2PolygonShape();
    extents.div(Simulation.WORLD_SIZE);
    fixDef.shape.SetAsBox(extents.x / 2, extents.y / 2);	// Half-width and height

    // Set the properties
    fixDef.restitution = properties.restitution || BaseRigidBody.DEFAULT_RESTITUTION;
    fixDef.friction = properties.friction || BaseRigidBody.DEFAULT_FRICTION;
    fixDef.density = properties.density || 1.0;

    var scaled = Point2D.create(pos.x, pos.y).div(Simulation.WORLD_SIZE);

    bodyDef.position.x = scaled.x;
    bodyDef.position.y = scaled.y;
    scaled.destroy();
    return this.addBody(bodyDef, fixDef);
  }

  /**
   * Add a simple circle body to the simulation.  The body doesn't have a visual
   * representation, but exists in the simulation and can be interacted with.
   *
   * @param pos {Point2D} The position where the body's center is located
   * @param radius {Point2D} The radius of the circle body
   * @param properties {Object} An object with up to three properties: <ul>
   *       <li>restitution - The bounciness of the body</li>
   *         <li>friction - Friction against this body</li>
   *         <li>density - The density of the object (default: 0)</li>
   *         <li>isStatic - <tt>false</tt> for a dynamic body (default: <tt>true</tt>)</li></ul>
   *
   * @return {b2BodyDef} A Box2D-JS body definition object representing the circle
   */
  addSimpleCircleBody(pos, radius, properties) {
    properties = _.extend({isStatic: true}, properties);

    var bodyDef = Simulation.BODY_DEF,
      fixDef = Simulation.FIXTURE_DEF;

    bodyDef.type = properties.isStatic ? Box2D.Dynamics.b2Body.b2_staticBody : Box2D.Dynamics.b2Body.b2_dynamicBody;

    radius /= Simulation.WORLD_SIZE;

    fixDef.shape = new Box2D.Collision.Shapes.b2CircleShape(radius);

    // Set the properties
    fixDef.restitution = properties.restitution || BaseRigidBody.DEFAULT_RESTITUTION;
    fixDef.friction = properties.friction || BaseRigidBody.DEFAULT_FRICTION;
    fixDef.density = properties.density || 1.0;

    var scaled = Point2D.create(pos.x, pos.y).div(Simulation.WORLD_SIZE);

    bodyDef.position.x = scaled.x;
    bodyDef.position.y = scaled.y;
    scaled.destroy();
    return this.addBody(bodyDef, fixDef);
  }

}


