// The class this file defines and its required classes
R.Engine.define({
    "class":"R.util.console.HTML",
    "requires":[
        "R.debug.ConsoleRef"
    ]
});

/**
 * @class A debug console that will use a pre-defined element to display its output.  The element with the id
 *        "debug-console" will be created an appended to the DOM for you.  This object is created when no other
 *        option is available from the browser, or when developer tools cannot be accessed.
 * @extends R.debug.ConsoleRef
 */
R.util.console.HTML = R.debug.ConsoleRef.extend(/** @scope R.util.console.HTML.prototype **/{

    msgStore:null,

    firstTime:null,

    constructor:function () {
        this.msgStore = [];
        this.firstTime = true;
        $("head", document).append(
            "<style> " +
                "#debug-console { position: absolute; width: 400px; right: 10px; bottom: 5px; height: 98%; border: 1px solid; overflow: auto; " +
                "font-family: 'Lucida Console',Courier; font-size: 8pt; color: black; } " +
                "#debug-console .console-debug, #debug-console .console-info { background: white; } " +
                "#debug-console .console-warn { font-style: italic; background: #00ffff; } " +
                "#debug-console .console-error { color: red; background: yellow; font-weight: bold; } " +
                "</style>"
        );
        $(document).ready(function () {
            $(document.body).append($("<div id='debug-console'><!-- --></div>"));
        });

        // Redirect error logging to the console
        window.onerror = function (err) {
            if (err instanceof Error) {
                this.error(err.message);
            } else {
                this.error(err);
            }
        };
    },

    /** @private */
    clean:function () {
        if ($("#debug-console > span").length > 150) {
            $("#debug-console > span:lt(150)").remove();
        }
    },

    /** @private */
    scroll:function () {
        var w = $("#debug-console")[0];
        if (w) {
            $("#debug-console")[0].scrollTop = w.scrollHeight + 1;
        }
    },

    store:function (type, args) {
        if (!this.firstTime) {
            return;
        }
        if (!document.getElementById("debug-console")) {
            this.msgStore.push({
                t:type,
                a:this.fixArgs(args)
            });
        } else {
            this.firstTime = false;
            for (var i = 0; i < this.msgStore.length; i++) {
                switch (this.msgStore[i].t) {
                    case "i":
                        this.info(this.msgStore[i].a);
                        break;
                    case "d":
                        this.debug(this.msgStore[i].a);
                        break;
                    case "w":
                        this.warn(this.msgStore[i].a);
                        break;
                    case "e":
                        this.error(this.msgStore[i].a);
                        break;
                }
            }
            this.msgStore = null;
        }
    },

    /** @private */
    fixArgs:function (a) {
        var o = this.base(a);
        return o.replace(/\n/g, "<br/>").replace(/ /g, "&nbsp;");
    },

    /**
     * Write a debug message to the console.
     */
    info:function () {
        this.clean();
        this.store("i", arguments);
        $("#debug-console").append($("<div class='console-info'>" + this.fixArgs(arguments) + "</div>"));
        this.scroll();
    },

    /**
     * Write a debug message to the console
     */
    debug:function () {
        this.clean();
        this.store("d", arguments);
        $("#debug-console").append($("<div class='console-debug'>" + this.fixArgs(arguments) + "</div>"));
        this.scroll();
    },

    /**
     * Write a warning message to the console
     */
    warn:function () {
        this.clean();
        this.store("w", arguments);
        $("#debug-console").append($("<div class='console-warn'>" + this.fixArgs(arguments) + "</div>"));
        this.scroll();
    },

    /**
     * Write an error message to the console
     */
    error:function () {
        this.clean();
        this.store("e", arguments);
        $("#debug-console").append($("<div class='console-error'>" + this.fixArgs(arguments) + "</div>"));
        this.scroll();
    },

    /**
     * Get the class name of this object
     *
     * @return {String} The string "R.util.console.HTML"
     */
    getClassName:function () {
        return "R.util.console.HTML";
    }
});
