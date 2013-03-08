/**
 * The Render Engine
 *
 * An extension to the engine for metrics processing and display.
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

//====================================================================================================
//====================================================================================================
//                                     METRICS MANAGEMENT
//====================================================================================================
//====================================================================================================
/**
 * @class A static class to be used to measure metrics of engine and game performance.  A
 *          visual profiler is provided which graphs runtime values of the engine, such as
 *          load and visible objects.  Additionally a metrics window is provided to show
 *          sampled metric data from parts of the engine, as well as user-defined metrics.
 * @static
 */
R.debug.Metrics = Base.extend(/** @scope R.debug.Metrics.prototype */{
    constructor:null,

    /*
     * Metrics tracking/display
     */
    metrics:{}, // Tracked metrics
    metricDisplay:null, // The metric display object
    profileDisplay:null, // The profile display object
    metricSampleRate:10, // Frames between samples
    lastMetricSample:10, // Last sample frame
    showMetricsWindow:false, // Metrics display flag
    showMetricsProfile:false, // Metrics profile graph display flag
    vObj:0, // Visible objects
    droppedFrames:0, // Non-rendered frames/frames dropped
    profilePos:0,
    profiles:{},


    /**
     * Toggle the display of the metrics window.  Any metrics
     * that are being tracked will be reported in this window.
     * @memberOf R.debug.Metrics
     */
    toggleMetrics:function () {
        R.debug.Metrics.showMetricsWindow = !R.debug.Metrics.showMetricsWindow;
    },

    /**
     * Show the metrics window
     * @memberOf R.debug.Metrics
     */
    showMetrics:function () {
        R.debug.Metrics.showMetricsWindow = true;
    },

    /**
     * Show a graph of the engine profile
     * @memberOf R.debug.Metrics
     */
    showProfile:function () {
        R.debug.Metrics.showMetricsProfile = true;
    },

    /**
     * Hide the metrics window
     * @memberOf R.debug.Metrics
     */
    hideMetrics:function () {
        R.debug.Metrics.showMetricsWindow = false;
    },

    manMetrics:function () {
        if ($("div.metric-button.minimize").length > 0) {
            $("div.metric-button.minimize").removeClass("minimize").addClass("maximize").attr("title", "maximize");
            $("div.metrics").css("height", 17);
            $("div.metrics .items").hide();
        } else {
            $("div.metric-button.maximize").removeClass("maximize").addClass("minimize").attr("title", "minimize");
            $("div.metrics .items").show();
            $("div.metrics").css("height", "auto");
        }
    },

    /**
     * Creates a button for the metrics window
     * @private
     */
    metricButton:function (cssClass, fn) {
        return $("<div class='metric-button " + cssClass + "' title='" + cssClass + "'><!-- --></div>").click(fn);
    },

    /**
     * Render the metrics window
     * @private
     */
    render:function () {

        if (R.debug.Metrics.showMetricsWindow && !R.debug.Metrics.metricDisplay) {
            R.debug.Metrics.metricDisplay = $("<div/>").addClass("metrics");
            R.debug.Metrics.metricDisplay.append(R.debug.Metrics.metricButton("run", function () {
                R.Engine.run();
            }));
            R.debug.Metrics.metricDisplay.append(R.debug.Metrics.metricButton("step", function () {
                R.Engine.step();
            }));
            R.debug.Metrics.metricDisplay.append(R.debug.Metrics.metricButton("pause", function () {
                R.Engine.pause();
            }));
            R.debug.Metrics.metricDisplay.append(R.debug.Metrics.metricButton("shutdown", function () {
                R.Engine.shutdown();
            }));

            R.debug.Metrics.metricDisplay.append(R.debug.Metrics.metricButton("close", function () {
                R.debug.Metrics.hideMetrics();
            }));
            R.debug.Metrics.metricDisplay.append(R.debug.Metrics.metricButton("minimize", function () {
                R.debug.Metrics.manMetrics();
            }));

            R.debug.Metrics.metricDisplay.append($("<div class='items'/>"));
            R.debug.Metrics.metricDisplay.appendTo($("body"));
        }

        if ((this.showMetricsWindow || this.showMetricsProfile) && this.lastMetricSample-- == 0) {
            // Basic engine metrics
            R.debug.Metrics.add("FPS", R.Engine.getFPS(), false, "#");
            R.debug.Metrics.add("aFPS", R.Engine.getActualFPS(), true, "#");
            R.debug.Metrics.add("availTime", R.Engine.fpsClock, false, "#ms");
            R.debug.Metrics.add("frames", R.Engine.totalFrames, false, "#");
            R.debug.Metrics.add("frameGenTime", R.Engine.frameTime, true, "#ms");
            R.debug.Metrics.add("engineLoad", Math.floor(R.Engine.getEngineLoad() * 100), true, "#%");
            R.debug.Metrics.add("vObj", R.Engine.vObj, false, "#");
            R.debug.Metrics.add("rObj", R.Engine.rObjs, false, "#");
            R.debug.Metrics.add("droppedFrames", R.Engine.droppedFrames, false, "#");
            R.debug.Metrics.add("upTime", Math.floor((R.Engine.worldTime - R.Engine.upTime) / 1000), false, "# sec");
            R.debug.Metrics.add("pclRebuilds", R.Engine.pclRebuilds, false, "#");

            R.debug.Metrics.update();
            R.debug.Metrics.lastMetricSample = R.debug.Metrics.metricSampleRate;
        }

        if (R.debug.Metrics.showMetricsProfile && R.engine.Support.sysInfo().browser == "msie" &&
            parseFloat(R.engine.Support.sysInfo().version) < 9) {
            // Profiler not supported in IE
            R.debug.Metrics.showMetricsProfile = false;
        }

        if (R.debug.Metrics.showMetricsProfile && !R.debug.Metrics.profileDisplay) {
            R.debug.Metrics.profileDisplay = $("<canvas width='150' height='100'/>").addClass("engine-profile");
            R.debug.Metrics.profileDisplay.appendTo($("body"));
            R.debug.Metrics.profileDisplay[0].getContext('2d').save();
        }
    },

    /**
     * Set the interval at which metrics are sampled by the system.
     * The default is for metrics to be calculated every 10 engine frames.
     *
     * @param sampleRate {Number} The number of ticks between samples
     * @memberOf R.debug.Metrics
     */
    setSampleRate:function (sampleRate) {
        R.debug.Metrics.lastMetricSample = 1;
        R.debug.Metrics.metricSampleRate = sampleRate;
    },

    /**
     * Add a metric to the game engine that can be displayed
     * while it is running.  If smoothing is selected, a 3 point
     * running average will be used to smooth out jitters in the
     * value that is shown.  For the <tt>fmt</tt> argument,
     * you can provide a string which contains the pound sign "#"
     * that will be used to determine where the calculated value will
     * occur in the formatted string.
     *
     * @param metricName {String} The name of the metric to track
     * @param value {String/Number} The value of the metric.
     * @param smoothing {Boolean} <tt>true</tt> to use 3 point average smoothing
     * @param fmt {String} The way the value should be formatted in the display (e.g. "#ms")
     * @memberOf R.debug.Metrics
     */
    add:function (metricName, value, smoothing, fmt) {
        if (smoothing) {
            var vals = R.debug.Metrics.metrics[metricName] ? R.debug.Metrics.metrics[metricName].values : [];
            if (vals.length == 0) {
                // Init
                vals.push(value);
                vals.push(value);
                vals.push(value);
            }
            vals.shift();
            vals.push(value);
            var v = Math.floor((vals[0] + vals[1] + vals[2]) * 0.33);
            R.debug.Metrics.metrics[metricName] = { val:(fmt ? fmt.replace("#", v) : v), values:vals, act:v };
        } else {
            R.debug.Metrics.metrics[metricName] = { val:(fmt ? fmt.replace("#", value) : value), act:value };
        }
    },

    /**
     * Remove a metric from the display
     *
     * @param metricName {String} The name of the metric to remove
     * @memberOf R.debug.Metrics
     */
    remove:function (metricName) {
        R.debug.Metrics.metrics[metricName] = null;
        delete R.debug.Metrics.metrics[metricName];
    },

    /**
     * Updates the display of the metrics window.
     * @private
     * @memberOf R.debug.Metrics
     */
    update:function () {
        var h = "", ctx;
        if (R.debug.Metrics.showMetricsProfile) {
            ctx = R.debug.Metrics.profileDisplay[0].getContext('2d');
            ctx.save();
            ctx.translate(147, 0);
        }

        for (var m in R.debug.Metrics.metrics) {
            if (R.debug.Metrics.showMetricsWindow) {
                h += m + ": " + R.debug.Metrics.metrics[m].val + "<br/>";
            }
            if (R.debug.Metrics.showMetricsProfile) {
                switch (m) {
                    case "engineLoad":
                        this.drawProfilePoint("#ffff00", R.debug.Metrics.metrics[m].act);
                        break;
                    case "vObj":
                        this.drawProfilePoint("#339933", R.debug.Metrics.metrics[m].act);
                        break;
                    case "rObj":
                        this.drawProfilePoint("#ff00ff", R.debug.Metrics.metrics[m].act);
                        break;
                    case "poolLoad" :
                        this.drawProfilePoint("#a0a0ff", R.debug.Metrics.metrics[m].act);
                        break;
                }
            }
        }
        if (R.debug.Metrics.showMetricsWindow) {
            $(".items", R.debug.Metrics.metricDisplay).html(h);
        }
        if (R.debug.Metrics.showMetricsProfile) {
            ctx.restore();
            R.debug.Metrics.moveProfiler();
        }
    },

    /**
     * @private
     */
    drawProfilePoint:function (color, val) {
        var ctx = R.debug.Metrics.profileDisplay[0].getContext('2d');
        ctx.strokeStyle = color;
        try {
            if (!isNaN(val)) {
                ctx.beginPath();
                ctx.moveTo(0, R.debug.Metrics.profiles[color] || 100);
                ctx.lineTo(1, (100 - val < 1 ? 1 : 100 - val));
                ctx.closePath();
                ctx.stroke();
                R.debug.Metrics.profiles[color] = (100 - val < 1 ? 1 : 100 - val);
            }
        } catch (ex) {

        }
    },

    /**
     * @private
     */
    moveProfiler:function () {
        var ctx = R.debug.Metrics.profileDisplay[0].getContext('2d');
        var imgData = ctx.getImageData(1, 0, 149, 100);
        ctx.save();
        ctx.translate(-1, 0);
        ctx.putImageData(imgData, 0, 0);
        ctx.restore();
    },

    /**
     * Run the metrics display.
     * @private
     * @memberOf R.debug.Metrics
     */
    doMetrics:function () {
        // Output any metrics
        if (R.debug.Metrics.showMetricsWindow || R.debug.Metrics.showMetricsProfile) {
            R.debug.Metrics.render();
        } else if (!R.debug.Metrics.showMetricsWindow && R.debug.Metrics.metricDisplay) {
            R.debug.Metrics.metricDisplay.remove();
            R.debug.Metrics.metricDisplay = null;
        }
    }

});

if (R.engine.Support.checkBooleanParam("metrics")) {
    R.debug.Metrics.showMetrics();
}

if (R.engine.Support.checkBooleanParam("profile")) {
    R.debug.Metrics.showProfile();
}

