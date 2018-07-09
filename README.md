The Render Engine
=================

The Render Engine started life as a cross-browser, open source game engine written entirely in JavaScript. Designed from the
ground up to be extremely flexible, it boasts an extensive API and uses the newest features of today's modern browsers.
The Render Engine is a framework which is intended to aid in developing your game idea by providing the foundation
and tools to speed up the process of going from idea to finished product.

Reboot
------
I've started to play with the  engine again. Branch 3.0.1 is a work in progress to rewrite the engine in ES6 and eliminate
large portions of code that were meant to be cross-browser compatible. Rather than trying to be a game engine that works everywhere,
I'm rewriting The Render Engine to take advantage of the features in a modern browser and not saddle it
with polyfills to work on every browser.

Check it out here: http://bfattori.github.com/TheRenderEngine/

Concept
-------
When creating games, it is often quite easy to reimplement the same code over-and-over.  You need to do things with
keyboard or mouse input, or you have to render your character to the screen, you might also want to know when two
objects collide.  Instead of rewriting this code (or god forbid, copying it) The Render Engine is based on the idea
of components.


Execution Pipeline
------------------
Each component is intended to perform a discreet task.  These tasks fall into one of the seven types of operations:

   1. Pre-processing
   2. Input
   3. Transform (movement)
   4. Logic
   5. Collision
   6. Rendering
   7. Post-processing

I'm currently working through the pipeline to optimize the flow. The first item was to separate the execution
from rendering. Now component logic and rendering happen in two phases, eventually allowing the use of workers to
process parallelizable functions, speeding up the execution.


How Do I Use This Thing?
------------------------
Understand that what you have here is known as a "game engine".  Just like in a car, you can design a fancy body,
amazing interior, outfit it with chrome 22's, etc.  But until you put an engine in it and wire everything up, that
car is just a concept.  The Render Engine provides you with this "engine" to make your game run.  It also contains
many objects to take care of doing the most mundane things so that you can focus on your game, not the
fundamentals.

Tutorials & Demos
-----------------
The included tutorials and demos are provided to help you understand the framework and how everything works together.
Each tutorial is intended to either build upon a previous tutorial, or provide an introduction to an engine feature.
The demos are meant to be more complete examples of different concepts working together to form a game.


(c)2008-2018 Brett Fattori (bfattori@gmail.com)
MIT Licensed
