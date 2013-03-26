/**
 * The Render Engine
 *
 * PhysicsActor object
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
    "class":"R.objects.PhysicsActor",
    "requires":[
        "R.physics.Simulation",

        "R.components.physics.CircleBody",
        "R.components.physics.BoxBody",
        "R.components.physics.PolyBody",
        "R.components.physics.DistanceJoint",
        "R.components.physics.RevoluteJoint",
        "R.components.physics.WeldJoint",
        "R.components.physics.PrismaticJoint",
        "R.components.physics.PulleyJoint",
        "R.components.physics.MouseJoint",

        "R.math.Math2D",
        "R.objects.Object2D",
        "R.resources.loaders.ObjectLoader"
    ]
});

/** @private */
var toP2d = function (arr) {
    return R.math.Point2D.create(arr[0], arr[1]);
};

/** @private */
var getRelativePosition = function (aV, obj) {
    if (R.isArray(aV) && aV.length == 2) {
        // An absolute position
        return toP2d(aV);
    } else {
        // If the array has 3 values, the third is a relative position string
        // and the first two are an offset from that point.  Otherwise, we assume
        // the value is only the position string
        var rel = (R.isArray(aV) && aV.length == 3 ? aV[2] : aV);
        var offs = (R.isArray(aV) && aV.length == 3 ? toP2d(aV) : R.math.Point2D.create(0, 0));
        var rPos = R.math.Point2D.create(0, 0);

        // Calculate the anchor, relative to the position of the object provided
        var bb = obj.getBoundingBox().offset(obj.getPosition());
        var c = obj.getCenter();
        switch (rel.toLowerCase()) {
            case "center":
                rPos.set(obj.getCenter());
                break;
            case "topleft":
                rPos.set(bb.x, bb.y);
                break;
            case "topright":
                rPos.set(bb.x + bb.w, bb.y);
                break;
            case "bottomleft":
                rPos.set(bb.x, bb.y + bb.h);
                break;
            case "bottomright":
                rPos.set(bb.x + bb.w, bb.y + bb.h);
                break;
            case "topcenter":
                rPos.set(c.x, bb.y);
                break;
            case "bottomcenter":
                rPos.set(c.x, bb.y + bb.h);
                break;
            case "leftmiddle":
                rPos.set(bb.x, c.y);
                break;
            case "rightmiddle":
                rPos.set(bb.x + bb.h, c.y);
                break;
        }

        // Perform the offset
        return rPos.add(offs);
    }
};

/** @private */
var makeJoint = function (args) {
    return args[3].create(args[0], args[1], args[2], arguments[1], arguments[2], arguments[3])
};


/**
 * @class A <tt>R.objects.PhysicsActor</tt> is an actor object within a game represented by
 *        a collection of components which can include rigid bodies and joints.
 *        Unlike {@link R.objects.Object2D}, a <code>R.objects.PhysicsActor</code> can associate each rigid
 *        body with its own {@link R.components.Render}.  When the rigid body is updated, the
 *        render component is updated with it.  That way, a physics actor can be comprised
 *        of multiple bodies, each with their own renderer allowing for a complex object
 *        such as a ragdoll with many parts and joints.  A physics actor is used within a
 *        {@link R.physics.Simulation}.
 *        <p/>
 *        A <code>R.objects.PhysicsActor</code> acts just like an {@link R.objects.Object2D}, but it is special
 *        in that it's rigid bodies are animated via a {@link R.physics.Simulation}.  Without being added to a
 *        {@link R.physics.Simulation}, none of the physical bodies will be updated.
 *
 * @param name {String} The name of the actor object
 * @extends R.objects.Object2D
 * @constructor
 * @description Create a physics actor
 */
R.objects.PhysicsActor = function () {
    return R.objects.Object2D.extend(/** @scope R.objects.PhysicsActor.prototype */{

        simulation:null,
        rootBody:null,
        rigidBodies:null,
        joints:null,
        rPos:null,

        /**
         * @private
         */
        constructor:function (name) {
            this.base(name || "PhysicsActor");
            this.rootBody = null;
            this.rigidBodies = null;
            this.rPos = R.math.Point2D.create(0, 0);
            this.simulation = null;
        },

        /**
         * Remove all of the bodies and joints from the simulation before
         * destroying the object.
         */
        destroy:function () {
            if (this.simulation) {
                // Remove bodies and joints from the simulation
                var bodies = this.getRigidBodies();
                for (var b in bodies) {
                    this.simulation.removeBody(bodies[b].getBody());
                }
            }
            this.rPos.destroy();
            this.base();
        },

        /**
         * Get the collection of rigid body components within the actor.
         * @return {Array}
         */
        getRigidBodies:function () {
            if (!this.rigidBodies) {
                this.rigidBodies = this.getObjects(function (el) {
                    return (el instanceof R.components.physics.BaseBody);
                });
            }
            return this.rigidBodies;
        },

        /**
         * Get the collection of joint components within the actor.
         * @return {Array}
         */
        getJoints:function () {
            if (!this.joints) {
                this.joints = this.getObjects(function (el) {
                    return (el instanceof R.components.physics.BaseJoint);
                });
            }
            return this.joints;
        },

        /**
         * Set the rigid body component which is considered to be the root
         * body.  When setting the position of a <tt>R.objects.PhysicsActor</tt>, all positions
         * are calculated relative to where the root body was originally set.
         * <p/>
         * It is not necessary to set the root body if there is only one rigid body
         * in the actor.
         *
         * @param body {R.components.physics.BaseBody} The body to assign as the root
         */
        setRootBody:function (body) {
            Assert(body instanceof R.components.physics.BaseBody, "Root body is not a BaseBodyComponent");
            this.rootBody = body;
            this.setDefaultTransformComponent(body);
        },

        /**
         * Get the root body of the <tt>R.objects.PhysicsActor</tt>.  If no root object has been assigned,
         * the first rigid body component will be used.
         * @return {R.components.physics.BaseBody}
         */
        getRootBody:function () {
            if (!this.rootBody) {
                // Get all of the bodies and select the first to be the root
                this.rootBody = this.getRigidBodies()[0];
                this.setDefaultTransformComponent(this.rootBody);
            }
            return this.rootBody;
        },

        /**
         * Set the position of the actor.  If the actor is comprised of multiple rigid bodies,
         * the position will be set for all rigid bodies and joints, relative to the root body.
         *
         * @param x {Number|R.math.Point2D} The X position, or a <tt>R.math.Point2D</tt>
         * @param y {Number} The Y position, or <tt>null</tt> if X is a <tt>R.math.Point2D</tt>
         */
        setPosition:function (x, y) {
            var pt = R.math.Point2D.create(x, y);
            var pos = R.math.Point2D.create(this.getRootBody().getPosition());
            pt.sub(pos);

            var bodies = this.getRigidBodies();
            for (var b in bodies) {
                var bPos = bodies[b].getPosition();
                bPos.add(pt);
                bodies[b].setPosition(bPos);
            }

            var joints = this.getJoints();
            for (var j in joints) {
                joints[j].offset(pt);
            }

            pt.destroy();
            pos.destroy();
        },

        /**
         * Set the <code>R.physics.Simulation</code> this actor participates within.  When a <code>R.objects.PhysicsActor</code>
         * is part of a running <code>R.physics.Simulation</code>, you must set the simulation so the physics components
         * can be properly added to the simulated world.
         *
         * @param simulation {R.physics.Simulation} The simulation this object is within
         */
        setSimulation:function (simulation) {
            this.simulation = simulation;
        },

        /**
         * Get the <code>R.physics.Simulation</code> this object participates within.
         * @return {R.physics.Simulation}
         */
        getSimulation:function () {
            return this.simulation;
        },

        /**
         * Start simulation of the physical components.
         */
        simulate:function () {
            // Start simulation on bodies first
            var bodies = this.getRigidBodies();
            for (var b in bodies) {
                bodies[b].startSimulation();
            }

            // Follow up with simulation of joints
            var joints = this.getJoints();
            for (var j in joints) {
                if (!(joints[j] instanceof R.components.physics.MouseJoint)) {
                    joints[j].startSimulation();
                }
            }
        },

        /**
         * Add a component to the physics actor.  The components will be
         * sorted based on their type then their priority within that type.
         * Components with a higher priority will be sorted before components
         * with a lower priority.  The sorting order for type is:
         * <ul>
         * <li>Input</li>
         * <li>Transform</li>
         * <li>Logic</li>
         * <li>Collision</li>
         * <li>Rendering</li>
         * </ul>
         *
         * @param component {R.components.Base} A component to add to the host.  If the component is a
         *    {@link R.components.physics.BaseBody} then the render component must be specified.
         * @param [renderComponent] {R.components.Render} The render component if the component is a
         *    {@link R.components.physics.BaseBody}
         */
        add:function (component, renderComponent) {
            if (component instanceof R.components.physics.BaseBody) {

                // Reset the list of rigid bodies so the list will be rebuilt
                this.rigidBodies = null;

                // Assure that there's a renderer for the body and then link the two
                Assert(renderComponent == null || (renderComponent instanceof R.components.Render), "Adding non-render component to rigid body component");

                // Link the two so that when the body (transform) occurs, the renderer does its thing
                component.setRenderComponent(renderComponent);
            }

            if (component instanceof R.components.physics.BaseJoint) {
                // Reset the list of joints so the list will be rebuilt
                this.joints = null;
            }

            // Add the component
            this.base(component);
        },

        /**
         * Update this object within the render context, at the specified timeslice.
         *
         * @param renderContext {R.rendercontexts.AbstractRenderContext} The context the object will be rendered within.
         * @param time {Number} The global time within the engine.
         * @param dt {Number} The delta between the world time and the last time the world was updated
         *          in milliseconds.
         */
        update:function (renderContext, time, dt) {
            // Run the components
            var components = this.iterator();

            renderContext.pushTransform();

            while (components.hasNext()) {
                var nextComponent = components.next();
                var isPhysicsComponent = (nextComponent instanceof R.components.physics.BaseBody);
                if (isPhysicsComponent) {
                    renderContext.pushTransform();
                }
                nextComponent.execute(renderContext, time, dt);
                if (isPhysicsComponent && nextComponent.getRenderComponent() != null) {
                    // Make sure to execute the render component immediately following
                    // the body component.
                    var pt = R.clone(nextComponent.getLocalOrigin()).neg();
                    renderContext.setPosition(pt);

                    /* pragma:DEBUG_START */
                    if (R.Engine.getDebugMode()) {
                        renderContext.drawFilledArc(pt.neg(), 5, 0, 360);
                    } // else {
                    /* pragma:DEBUG_END */
                    nextComponent.getRenderComponent().execute(renderContext, time, dt);
                    /* pragma:DEBUG_START */
                    //}
                    /* pragma:DEBUG_END */

                    pt.destroy();
                }
                if (isPhysicsComponent) {
                    renderContext.popTransform();
                }
            }

            renderContext.popTransform();

            components.destroy();

            // Special case so we can skip the super class (HostObject)
            R.struct.HashContainer.prototype.update.call(this, renderContext, time, dt);
        }

        // TODO: This needs to account for ALL bodies, not just the root body
        /*,getWorldBox: function() {
         var wbox = R.clone(this.base());
         var pt = R.clone(this.getRootBody().getLocalOrigin()).mul(1/this.getRootBody().getScaleX()).neg();
         wbox.offset(pt);
         pt.destroy();
         return wbox;
         }*/

        /** @private */, __noop:function () {
            // This function only serves to make sure that ObjectLoader exists
            // for the static methods below.
            var q = R.resourceloaders.Object.create("dummy");
        }

    }, /** @scope R.objects.PhysicsActor.prototype */{ // Static

        /**
         * Get the class name of this object
         * @return The string <tt>R.objects.PhysicsActor</tt>
         * @type String
         */
        getClassName:function () {
            return "R.objects.PhysicsActor";
        },

        /**
         * Resource loader for physics actor objects
         * @private
         */
        actorLoader:null,

        /**
         * @private
         */
        resolved:function () {
            R.objects.PhysicsActor.actorLoader = R.resources.loaders.ObjectLoader.create("ActorLoader");
        },

        /**
         * Helper method to load a physics object file which describes the objects
         * and joints which comprise the object.  The format consists of "parts"
         * which define the types of physical object ("circle", "box") and other
         * parameters required by each part.  Additionally, the format will load
         * joints which are used to link the parts together.
         * <p/>
         * The actor object is loaded asynchronously which means it isn't immediately
         * available.  You get a reference to the object by calling {@link R.objects.PhysicsActor#get}.
         * <p/>
         * An example <tt>R.objects.PhysicsActor</tt> file can be found in the "/demos/physics2/"
         * demo game.
         *
         * @param name {String} The unique reference name of the actor object
         * @param url {String} The URL where the resource is located
         * @static
         */
        load:function (name, url) {
            R.objects.PhysicsActor.actorLoader.load(name, url);
        },

        /**
         * Determine the ready state of a physics actor loaded with {@link R.objects.PhysicsActor#load}.
         *
         * @param name {String} The unique reference name of the actor object
         * @return {Boolean} <code>true</code> if the object is ready for use
         * @static
         */
        isReady:function (name) {
            return R.objects.PhysicsActor.actorLoader.isReady(name);
        },

        /**
         * Factory method to create an instance of a physics actor by name.
         *
         * @param name {String} The unique reference name of the actor object
         * @param [objName] {String} The name to assign to the instance when created
         * @return {R.objects.PhysicsActor} A new instance of the actor defined by "name"
         * @static
         */
        get:function (name, objName) {

            var def = R.objects.PhysicsActor.actorLoader.get(name),
                actor = R.objects.PhysicsActor.create(objName), jointParts = [], relParts = [], bc, p, part;
            var props = {"friction":"setFriction", "restitution":"setRestitution", "density":"setDensity",
                "static":"setStatic", "rotation":"setRotation"};

            // Loop through the parts and build each component
            for (p in def.parts) {
                part = def.parts[p], bc;
                if (part.type == "circle") {
                    part.radius *= (def.scale ? def.scale : 1);
                    bc = R.components.physics.CircleBody.create(part.name, part.radius);
                } else if (part.type == "box") {
                    var ext = toP2d(part.extents);
                    ext.mul(def.scale ? def.scale : 1);
                    bc = R.components.physics.BoxBody.create(part.name, ext);
                    ext.destroy();
                } else {
                    var points = [];
                    for (var d = 0; d < part.points.length; d++) {
                        points.push(toP2d(parts.points[d]));
                    }
                    bc = R.components.physics.PolyBody.create(part.name, points);
                }

                // Set friction, restitution, or density properties.  Both
                // defaults and per-part
                for (p in props) {
                    if (def[p]) {
                        bc[props[p]](def[p]);
                    }

                    if (part[p]) {
                        bc[props[p]](part[p]);
                    }
                }

                // Add the component to the actor.  We'll let the developer set the renderer
                // for each body component.
                actor.add(bc);

                // Position the parts relative to each other, in world coordinates with the
                // origin at the top left corner of the world
                if (R.isArray(part.position) && part.position.length == 2) {
                    // Set the position of the part in absolute coordinates
                    var pt = toP2d(part.position);
                    pt.mul(def.scale ? def.scale : 1);
                    bc.setPosition(pt);
                    pt.destroy();
                } else if (part.relativeTo) {
                    // The position is either a string or a 3 element array.  In either case
                    // the value contains a relative positioning string and possibly an offset
                    relParts.push(part);
                }

                // Is there a joint defined?  Defer it until later when all the parts are loaded
                // This way we don't have to worry about invalid body references
                if (part.joint) {
                    jointParts.push(part);
                }
            }

            // Now that all the parts are created we need to perform 2 final steps
            // 1) Position any parts that are relative to others
            for (var rp in relParts) {
                // Get the component it is relative to and calculate it's position
                part = relParts[rp];
                var relTo = actor.getComponent(part.relativeTo);
                var rPos = part.position;
                var pos = getRelativePosition(rPos, relTo);
                bc = actor.getComponent(part.name);
                pos.mul(def.scale ? def.scale : 1);
                bc.setPosition(pos);
                pos.destroy();
            }

            // 2) link the parts with any joints that were deferred until now
            for (var j = 0; j < jointParts.length; j++) {
                part = jointParts[j];

                var jc, fromPart = (part.joint.linkFrom ? part.joint.linkFrom : part.name),
                    toPart = (part.joint.linkTo ? part.joint.linkTo : part.name),
                    jointName = fromPart + "_" + toPart, anchor, axis, upLim, lowLim, type, anchor1, anchor2,
                    args = [jointName, actor.getComponent(fromPart), actor.getComponent(toPart)];

                switch (part.joint.type) {
                    case "distance":
                        args.push(R.components.physics.DistanceJoint);
                        anchor1 = part.joint.anchor ? toP2d(part.joint.anchor1) : null;
                        if (anchor1)
                            anchor1.add(actor.getComponent(fromPart).getPosition())
                                .mul(def.scale != undefined ? def.scale : 1);

                        anchor2 = part.joint.anchor ? toP2d(part.joint.anchor2) : null;
                        if (anchor2)
                            anchor2.add(actor.getComponent(fromPart).getPosition())
                                .mul(def.scale != undefined ? def.scale : 1);

                        jc = makeJoint(args, anchor1, anchor2);
                        break;
                    case "revolute":
                        args.push(R.components.physics.RevoluteJoint);
                        anchor = part.joint.anchor ? toP2d(part.joint.anchor) : toP2d([0, 0]);
                        anchor.add(actor.getComponent(fromPart).getPosition());
                        anchor.mul(def.scale != undefined ? def.scale : 1);
                        jc = makeJoint(args, anchor);

                        // Joint rotational limits
                        if (part.joint.maxLim && part.joint.minLim) {
                            upLim = part.joint.maxAngle;
                            lowLim = part.joint.minAngle;
                            jc.setUpperLimitAngle(upLim ? upLim : 0);
                            jc.setLowerLimitAngle(lowLim ? lowLim : 0);
                        }
                        anchor.destroy();
                        break;
                    case "prismatic":
                        args.push(R.components.physics.PrismaticJoint);
                        anchor = part.joint.anchor ? toP2d(part.joint.anchor) : toP2d([0, 0]);
                        anchor.add(actor.getComponent(fromPart).getPosition());
                        anchor.mul(def.scale != undefined ? def.scale : 1);
                        axis = part.joint.axis ? toP2d(part.joint.axis) : R.math.Vector2D.UP;
                        jc = makeJoint(args, anchor, axis);

                        // Joint translation limits
                        if (part.joint.maxLim && part.joint.minLim) {
                            upLim = part.joint.maxLim;
                            lowLim = part.joint.minLim;
                            jc.setUpperLimit(upLim ? upLim : 0);
                            jc.setLowerLimit(lowLim ? lowLim : 0);
                        }
                        anchor.destroy();
                        break;
                    case "weld":
                        args.push(R.components.physics.WeldJoint);
                        anchor = part.joint.anchor ? toP2d(part.joint.anchor) : toP2d([0, 0]);
                        anchor.add(actor.getComponent(fromPart).getPosition());
                        anchor.mul(def.scale != undefined ? def.scale : 1);
                        jc = makeJoint(args, anchor, axis);
                        anchor.destroy();
                        break;
                    case "pulley":
                        args.push(R.components.physics.PulleyJoint);
                        anchor1 = part.joint.anchor1 ? toP2d(part.joint.anchor1) : toP2d([0, 0]);
                        anchor1.add(actor.getComponent(fromPart).getPosition());
                        anchor1.mul(def.scale != undefined ? def.scale : 1);
                        anchor2 = part.joint.anchor2 ? toP2d(part.joint.anchor2) : toP2d([0, 0]);
                        anchor2.add(actor.getComponent(fromPart).getPosition());
                        anchor2.mul(def.scale != undefined ? def.scale : 1);
                        jc = makeJoint(args, anchor1, anchor2, part.joint.ratio);
                        anchor1.destroy();
                        anchor2.destroy();
                        break;
                }

                // Motor force/torque and speed (applies to revolute & prismatic joints
                if (part.joint.motorForce) {
                    jc.setMotorForce(part.joint.motorForce);
                }

                if (part.joint.motorSpeed) {
                    jc.setMotorSpeed(part.joint.motorSpeed);
                }

                // Add the joint to the actor
                actor.add(jc);
            }

            Assert(actor.getComponent(def.root) != null, "'root' of actor definition is not a valid part");
            if (def.root) {
                actor.setRootBody(actor.getComponent(def.root));
            }

            // Done, give them their actor
            return actor;
        }
    });
};
