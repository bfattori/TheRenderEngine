/*
 * This is the bare minimum "game" that The Render Engine can run.
 */
class EmptyGame extends Game {
  setup() {
    $("body", document)
      .append($("<i>" + RenderEngine.toString() + "</i><span> is " +
        (RenderEngine.running ? "running" : "not running") + "...</span>"));
  }
}
