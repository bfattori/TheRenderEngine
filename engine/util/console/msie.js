

/**
 * @class A console reference to the MSIE console.
 * @extends R.debug.ConsoleRef
 */
R.util.console.MSIE = R.debug.ConsoleRef.extend(/** @scope R.util.console.MSIE.prototype **/{

   constructor: function() {
   },

   /**
    * Write a debug message to the console
    */
   info: function() {
      console.log(this.fixArgs(arguments));
   },

   /**
    * Write a debug message to the console
    */
   debug: function() {
      console.info(this.fixArgs(arguments));
   },

   /**
    * Write a warning message to the console
    */
   warn: function() {
      console.warn(this.fixArgs(arguments));
   },

   /**
    * Write an error message to the console
    */
   error: function() {
      console.error(this.fixArgs(arguments));
   },

   /**
    * Get the class name of this object
    *
    * @return {String} The string "R.util.console.MSIE"
    */
   getClassName: function() {
      return "R.util.console.MSIE";
   }
});
