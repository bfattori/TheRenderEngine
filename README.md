The Render Engine
=================

** This project is no longer maintained **
There are many, more powerful and more up-to-date JavaScript game engines out there. If you're looking to learn JavaScript and gaming, take a look at The Render Engine as it has many useful things already figured out.

The Render Engine is a cross-browser, open source game engine written entirely in JavaScript. Designed from the
ground up to be extremely flexible, it boasts an extensive API and uses the newest features of today's modern browsers.
The Render Engine is a framework which is intended to aid in developing your game idea by providing the foundation
and tools to speed up the process of going from idea to finished product.

Check it out here: http://bfattori.github.com/TheRenderEngine/

The Render Engine supports:
   * Chrome
   * Firefox
   * Internet Explorer 9.0+
   * Opera
   * Safari

Concept
-------
When creating games, it is often quite easy to reimplement the same code over-and-over.  You need to do things with
keyboard or mouse input, or you have to render your character to the screen, you might also want to know when two
objects collide.  Instead of rewriting this code (or god forbid, copying it) The Render Engine is based on the idea
of components.

Each component is intended to perform a discreet task.  These tasks fall into one of the five types of operations:

   1. Input
   2. Transform (movement)
   3. Logic
   4. Collision
   5. Rendering

These operations execute from the top down for each game object.  First an object processes its inputs, then moves,
next it performs any logic, the next step is to check collisions, then it renders.  Each game object can have as many
of *each type* of component within it.  The components can be assigned a priority, with a higher priority executing
before a lower priority.  This way, each game object can delegate a majority of its operation to these reusble
components which frees you up to work on the game-specific implementation of your game object.

How Do I Use This Thing?
------------------------
Understand that what you have here is known as a "game engine".  Just like in a car, you can design a fancy body,
amazing interior, outfit it with chrome 22's, etc.  But until you put an engine in it and wire everything up, that
car is just a concept.  The Render Engine provides you with this "engine" to make your game run.  It also contains
many objects which will take care of doing the most mundane things so that you can focus on your game, not the
fundamentals.

Tutorials & Demos
-----------------
The included tutorials and demos are provided to help you understand the framework and how everything works together.
Each tutorial is intended to either build upon a previous tutorial, or provide an introduction to an engine feature.
The demos are meant to be more complete examples of different concepts working together to form a game.


(c)2008-2013 Brett Fattori (bfattori@gmail.com)
MIT Licensed
