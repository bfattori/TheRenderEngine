/**
 * The Render Engine
 *
 * Simulation object
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

// The class this file defines and its required classes
R.Engine.define({
    "class":"R.physics.Simulation",
    "requires":[
        "R.engine.BaseObject",
        "R.math.Math2D",
        "R.components.physics.BaseBody"
    ],
    "includes":[
        "/libs/Box2dWeb-2.1.a.3.js"
    ]
});

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
 * @param viewport {R.math.Rectangle2D} Your rendering context's viewport
 * @param [gravity] {R.math.Vector2D} The world's gravity vector. default: [0, 650]
 * @extends R.engine.BaseObject
 * @constructor
 * @description Create a physical world for Box2dJS
 */
R.physics.Simulation = function () {
    return R.engine.BaseObject.extend(/** @scope R.physics.Simulation.prototype */{

        world:null,
        gravity:null,
        doSleep:true,
        integrations:0,
        _groundBody:null,

        /** @private */
        constructor:function (name, gravity) {
            this.base(name);
            this.gravity = gravity || R.math.Vector2D.create(0, 10);

            this.doSleep = true;
            this.integrations = R.physics.Simulation.DEFAULT_INTEGRATIONS;
            var b2Gravity = new Box2D.Common.Math.b2Vec2(this.gravity.x, this.gravity.y);

            // Create the world and get the ground body
            this.world = new Box2D.Dynamics.b2World(b2Gravity, this.doSleep);
            this._groundBody = R.components.physics.BaseBody.create("WORLD_GROUND", new Box2D.Dynamics.b2FixtureDef());
            this._groundBody.body = this.world.GetGroundBody();
        },

        destroy:function () {
            this.gravity.destroy();
            this.base();
        },

        release:function () {
            this.worldAABB = null;
            this.gravity = null,
                this.world = null;
            this.base();
        },

        update:function (renderContext, time, dt) {
            this.world.Step(R.physics.Simulation.FIXED_TIMESTEP, this.integrations, this.integrations);
            this.world.ClearForces();
        },

        /**
         * Support method to get the ground body for the world.
         * @return {R.components.physics.BaseBody} The world's ground body
         * @private
         */
        getGroundBody:function () {
            return this._groundBody;
        },

        /**
         * Query the world within the given rectangle returning all of the
         * bodies found.
         * @param rect {R.math.Rectangle2D} The area to query
         * @return {Array} An array of <tt>Box2D.Dynamics.b2Body</tt> objects
         */
        getBodiesInArea:function (rect) {
            var aabb = new Box2D.Collision.b2AABB(), bodies = [];
            aabb.lowerBound.Set(rect.x, rect.y);
            aabb.upperBound.Set(rect.w, rect.h);

            // Query the world
            this.world.QueryAABB(function (fixture) {
                if (fixture.GetBody().GetType() != Box2D.Dynamics.b2Body.b2_staticBody) {
                    bodies.push(fixture.GetBody());
                }
                return true;
            }, aabb);

            return bodies;
        },

        /**
         * Query the world for the body that lies at the given point.
         * @param point {R.math.Point2D} The point to query
         * @return {Box2D.Dynamics.b2Body} The body found, or <tt>null</tt>
         */
        getBodyAtPoint:function (point) {
            var aabb = new Box2D.Collision.b2AABB(), body = null,
                qP = R.clone(point).div(R.physics.Simulation.WORLD_SIZE),
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
        },

        /**
         * Support method to add a body to the simulation.  The body must be one of the
         * box2d-js body types.  This method is intended to be used by {@link R.components.BaseBody}.
         *
         * @param b2jsBodyDef {Box2D.Dynamics.b2BodyDef} A box2d-js Body definition object
         * @param b2jsFixtureDef {Box2D.Dynamics.b2FixtureDef} A box2d-js fixture definition object
         * @private
         */
        addBody:function (b2jsBodyDef, b2jsFixtureDef) {
            var b = this.world.CreateBody(b2jsBodyDef);
            b.CreateFixture(b2jsFixtureDef);
            return b;
        },

        /**
         * Support method to add a joint to the simulation.  The joint must be one of the
         * box2d-js joint types.  This method is intended to be used by {@link R.components.BaseJoint}.
         *
         * @param b2jsJointDef {Box2D.Dynamics.b2JointDef} A box2d-js Joint definition object
         * @private
         */
        addJoint:function (b2jsJointDef) {
            return this.world.CreateJoint(b2jsJointDef);
        },

        /**
         * Support method to remove a body from the simulation.  The body must be one of the
         * box2d-js body types.  This method is intended to be used by {@link R.components.BaseBody}.
         *
         * @param b2jsBody {Box2D.Dynamics.b2Body} A box2d-js Body object
         * @private
         */
        removeBody:function (b2jsBody) {
            this.world.DestroyBody(b2jsBody);
        },

        /**
         * Support method to remove a joint from the simulation.  The joint must be one of the
         * box2d-js joint types.  This method is intended to be used by {@link R.components.BaseJoint}.
         *
         * @param b2jsJoint {Box2D.Dynamics.b2Joint} A box2d-js Joint object
         * @private
         */
        removeJoint:function (b2jsJoint) {
            this.world.DestroyJoint(b2jsJoint);
        },

        /**
         * Set the number of integrations per frame.  A higher number will result
         * in more accurate collisions, but will result in slower performance.
         *
         * @param integrations {Number} The number of integrations per frame
         */
        setIntegrations:function (integrations) {
            this.integrations = integrations || R.physics.Simulation.DEFAULT_INTEGRATIONS;
        },

        /**
         * Get the number of integrations per frame.
         * @return {Number}
         */
        getIntegrations:function () {
            return this.integrations;
        },

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
        addSimpleBoxBody:function (pos, extents, properties) {
            properties = $.extend({ isStatic:true }, properties);

            var bodyDef = R.physics.Simulation.BODY_DEF,
                fixDef = R.physics.Simulation.FIXTURE_DEF;

            bodyDef.type = properties.isStatic ? Box2D.Dynamics.b2Body.b2_staticBody : Box2D.Dynamics.b2Body.b2_dynamicBody;

            fixDef.shape = new Box2D.Collision.Shapes.b2PolygonShape();
            extents.div(R.physics.Simulation.WORLD_SIZE);
            fixDef.shape.SetAsBox(extents.x / 2, extents.y / 2);	// Half-width and height

            // Set the properties
            fixDef.restitution = properties.restitution || R.components.physics.BaseBody.DEFAULT_RESTITUTION;
            fixDef.friction = properties.friction || R.components.physics.BaseBody.DEFAULT_FRICTION;
            fixDef.density = properties.density || 1.0;

            var scaled = R.math.Point2D.create(pos.x, pos.y).div(R.physics.Simulation.WORLD_SIZE);

            bodyDef.position.x = scaled.x;
            bodyDef.position.y = scaled.y;
            scaled.destroy();
            return this.addBody(bodyDef, fixDef);
        },

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
        addSimpleCircleBody:function (pos, radius, properties) {
            properties = $.extend({ isStatic:true }, properties);

            var bodyDef = R.physics.Simulation.BODY_DEF,
                fixDef = R.physics.Simulation.FIXTURE_DEF;

            bodyDef.type = properties.isStatic ? Box2D.Dynamics.b2Body.b2_staticBody : Box2D.Dynamics.b2Body.b2_dynamicBody;

            radius /= R.physics.Simulation.WORLD_SIZE;

            fixDef.shape = new Box2D.Collision.Shapes.b2CircleShape(radius);

            // Set the properties
            fixDef.restitution = properties.restitution || R.components.physics.BaseBody.DEFAULT_RESTITUTION;
            fixDef.friction = properties.friction || R.components.physics.BaseBody.DEFAULT_FRICTION;
            fixDef.density = properties.density || 1.0;

            var scaled = R.math.Point2D.create(pos.x, pos.y).div(R.physics.Simulation.WORLD_SIZE);

            bodyDef.position.x = scaled.x;
            bodyDef.position.y = scaled.y;
            scaled.destroy();
            return this.addBody(bodyDef, fixDef);
        }

    }, /** @scope R.physics.Simulation.prototype */{

        /**
         * Get the class name as a string.
         * @return {String} "R.physics.Simulation"
         */
        getClassName:function () {
            return "R.physics.Simulation";
        },

        /**
         * Reusable definition for fixtures
         * @private
         */
        FIXTURE_DEF:null,

        /**
         * Reusable definition for bodies
         * @private
         */
        BODY_DEF:null,

        /**
         * @private
         */
        resolved:function () {
            // These are reusable, according to Box2d docs
            R.physics.Simulation.FIXTURE_DEF = new Box2D.Dynamics.b2FixtureDef();
            R.physics.Simulation.BODY_DEF = new Box2D.Dynamics.b2BodyDef();
        },

        /**
         * The default number of integrations per frame
         * @type {Number}
         */
        DEFAULT_INTEGRATIONS:10,

        /**
         * The size of the world in meters
         */
        WORLD_SIZE:20,

        /**
         * The world is updated at 60Hz, or 1/60th of a second.  This time step is
         * ideal so that objects do not jitter.  Changing this value can result in
         * some truly odd behavior in the simulation.
         * @type {Number}
         */
        FIXED_TIMESTEP:1 / 60

    });
};
