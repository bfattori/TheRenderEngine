/**
 * The Render Engine
 * Events
 *
 * Copyright (c) 2018 Brett Fattori (brettf@renderengine.com)
 */
"use strict";

/**
 * @class A static object for uniformly handling events within all browser
 *        platforms.  The event engine is an abstraction of the jQuery event
 *        system.  Methods are provided for adding and removing events in
 *        a programmatic way.  Additionally the engine has key codes for
 *        common keys which aren't part of the letters or numbers.
 *        <p/>
 *        While the engine provides a low-level way to attach events, when
 *        working with game objects methods are provided to manage events
 *        better than with the engine itself.
 *        <p/>
 *        Adding an event:
 * <pre>
 * var t = $(".myElement");
 * R.engine.Events.setHandler(t, "click", function(event) {
 *    MyObject.evtHandler();
 * });
 * </pre>
 * @see R.engine.BaseObject#addEvent
 * @see R.engine.BaseObject#removeEvent
 */
class Events {

    /**
     * Set an event handler on a target.  The handler function will
     * be called whenever the event occurs.
     *
     * @param target {String/jQuery} The target for the event.  This should either be a
     *                               CSS selector, or a jQuery object.
     * @param [data] {Array} Optional data to pass to the handler when it is invoked.
     * @param name {String} The event to handle.  ie: "click" or "mouseover"
     * @param handler {Function} The handler function to assign to the target
     * @memberof R.engine.Events
     */
    static setHandler(target, data, name, handler) {
        if (typeof data == "string") {
            handler = name;
            name = data;
            data = null;
        }

        if (target == document.body) {
            target = document;
        }

        jQuery(target).bind(name, data || handler, handler);
    }

    /**
     * Clear an event handler that was previously assigned to the target.  If no
     * specific handler is assigned, all event handlers will be removed from the target.
     *
     * @param target {String/jQuery} The target for the event.  This should either be a
     *                               CSS selector, or a jQuery object.
     * @param name {String} The event to handle.  ie: "click" or "mouseover"
     * @param handler {Function} The handler function to unassign from the target
     * @memberof R.engine.Events
     */
    static clearHandler(target, name, handler) {
        if (target == document.body) {
            target = document;
        }
        jQuery(target).unbind(name, handler);
    }

    /**
     * Get the key code for the provided character.  The value returned
     * will be for the uppercase key value, unless the second argument is
     * set to <code>true</code> which will return the exact key code for the
     * provided character.
     * @param charStr {String} A single character to get the key code for
     * @param [literal] {Boolean} <code>true</code> to return the literal code without
     *        first converting the character to lower case.
     * @return {Number} The key code for the given character
     * @memberof R.engine.Events
     */
    static keyCodeForChar(charStr, literal) {
        return (literal ? charStr : charStr.toUpperCase()).charCodeAt(0);
    }

    /**
     * Returns true if the key pressed is either the lower or upper case version of
     * the key specified in "keyStr".
     * @param eventObj
     * @param keyStr
     */
    static isKey(eventObj, keyStr) {
        return (eventObj.which == R.engine.Events.keyCodeForChar(keyStr) ||
            eventObj.which == R.engine.Events.keyCodeForChar(keyStr, true));
    }

    //====================================================================================================================
    // MOUSE BUTTON CONSTANTS

    /** No mouse button pressed.
     * @type {Number}
     */
    static MOUSE_NO_BUTTON = -1;

    /** Left mouse button.
     * @type {Number}
     */
    static MOUSE_LEFT_BUTTON = 1;

    /** Right mouse button.
     * @type {Number}
     */
    static MOUSE_RIGHT_BUTTON = 3;

    /** Middle mouse button.
     * @type {Number}
     */
    static MOUSE_MIDDLE_BUTTON = 2;

    //====================================================================================================================
    // KEY CODE CONSTANTS

    /** Constant for the "Tab" key
     * @type {Number}
     */
    static KEYCODE_TAB = 9;

    /** Constant for the "Enter" key
     * @type {Number}
     */
    static KEYCODE_ENTER = 13;

    /** Constant for the "Delete" key
     * @type {Number}
     */
    static KEYCODE_DELETE = 46;

    /** Constant for the "Space" key
     * @type {Number}
     */
    static KEYCODE_SPACE = 32;

    /** Constant for the "Backspace"
     * @type {Number}
     */
    static KEYCODE_BACKSPACE = 8;

    /** Constant for the "Up" key
     * @type {Number}
     */
    static KEYCODE_UP_ARROW = 38;

    /** Constant for the "Down" key
     * @type {Number}
     */
    static KEYCODE_DOWN_ARROW = 40;

    /** Constant for the "Left" key
     * @type {Number}
     */
    static KEYCODE_LEFT_ARROW = 37;

    /** Constant for the "RIGHT" key
     * @type {Number}
     */
    static KEYCODE_RIGHT_ARROW = 39;

    /** Constant for the "Plus" key
     * @type {Number}
     */
    static KEYCODE_KEYPAD_PLUS = 61;

    /** Constant for the "Minus" key
     * @type {Number}
     */
    static KEYCODE_KEYPAD_MINUS = 109;

    /** Constant for the "Home" key
     * @type {Number}
     */
    static KEYCODE_HOME = 36;

    /** Constant for the "End" key
     * @type {Number}
     */
    static KEYCODE_END = 35;

    /** Constant for the "F1" key
     * @type {Number}
     */
    static KEYCODE_F1 = 112;

    /** Constant for the "F2" key
     * @type {Number}
     */
    static KEYCODE_F2 = 113;

    /** Constant for the "F3" key
     * @type {Number}
     */
    static KEYCODE_F3 = 114;

    /** Constant for the "F4" key
     * @type {Number}
     */
    static KEYCODE_F4 = 115;

    /** Constant for the "F5" key
     * @type {Number}
     */
    static KEYCODE_F5 = 116;

    /** Constant for the "F6" key
     * @type {Number}
     */
    static KEYCODE_F6 = 117;

    /** Constant for the "F7" key
     * @type {Number}
     */
    static KEYCODE_F7 = 118;

    /** Constant for the "F8" key
     * @type {Number}
     */
    static KEYCODE_F8 = 119;

    /** Constant for the "F9" key
     * @type {Number}
     */
    static KEYCODE_F9 = 120;

    /** Constant for the "F10" key
     * @type {Number}
     */
    static KEYCODE_F10 = 121;

    /** Constant for the "F11" key
     * @type {Number}
     */
    static KEYCODE_F11 = 122;

    /** Constant for the "F12" key
     * @type {Number}
     */
    static KEYCODE_F12 = 123;

    /** Constant for the "Context Menu" key (Windows)
     * @type {Number}
     */
    static KEYCODE_MENU = 93;

    /** Constant for the "Windows" key (Windows)
     * @type {Number}
     */
    static KEYCODE_WINDOW = 91

}
