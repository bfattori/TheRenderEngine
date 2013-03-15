// Load all required engine components
R.Engine.define({
    "class": "GameOfLife",
    "requires": [
        "R.engine.Game"
    ]
});

/**
 * @class Game of Life
 */
var GameOfLife = function () {
    return R.engine.Game.extend({

        world: null,

        LIVE_CELL: 1,
        DEAD_CELL: 2,
        CELL_DIED: 3,
        CELL_BORN: 4,

        cellWidth: 0,
        cellHeight: 0,

        playWidth: 500,
        playHeight: 500,

        xDivisions: 0,
        yDivisions: 0,

        surroundingCells: [],

        TOP_LEFT: R.math.Point2D.create(-1, -1),
        TOP_CENTER: R.math.Point2D.create(0, -1),
        TOP_RIGHT: R.math.Point2D.create(1, -1),
        LEFT: R.math.Point2D.create(-1, 0),
        RIGHT: R.math.Point2D.create(1, 0),
        BOTTOM_LEFT: R.math.Point2D.create(-1, 1),
        BOTTOM_CENTER: R.math.Point2D.create(0, 1),
        BOTTOM_RIGHT: R.math.Point2D.create(1, 1),

        /**
         * Called to set up the game, download any resources, and initialize
         * the game to its running state.
         */
        setup: function () {
            GameOfLife.seedWorld(R.engine.Support.getNumericParam('width', 30),
                R.engine.Support.getNumericParam('height', 30),
                R.engine.Support.getNumericParam('seed', R.lang.Math2.randomInt()));
        },

        seedWorld: function(worldWidth, worldHeight, seed) {
            R.lang.Math2.seed(seed);

            GameOfLife.cellWidth = Math.floor(GameOfLife.playWidth / worldWidth);
            GameOfLife.cellHeight = Math.floor(GameOfLife.playHeight / worldHeight);

            // Drop a few dynamic styles
            var cellStyle = 'div.cell { width: ' + GameOfLife.cellWidth + 'px; height: ' + GameOfLife.cellHeight + 'px; ' +
                'float: left; position: relative; padding: 0; margin: 0; line-height: 7px; } ' +
                'div.cell.alive { background-color: black; } ' +
                'div.cell.dead { background-color: none; } ';

            var worldStyle = 'div.world { width: ' + (GameOfLife.playWidth + 1) +  'px; height: ' +
                (GameOfLife.playHeight + 1) + 'px; ' +
                'border: 1px solid black; }';

            var styles = "<style type='text/css'>" + cellStyle + worldStyle + "</style>";
            $("head").append(styles);

            GameOfLife.world = [];
            for (var cell = 0; cell < worldWidth * worldHeight; cell++) {
                var cellState = R.lang.Math2.randomRange(GameOfLife.LIVE_CELL, GameOfLife.DEAD_CELL, true);
                GameOfLife.world[cell] = {
                    state: cellState,
                    element: $("<div>").addClass("cell").addClass(cellState === GameOfLife.LIVE_CELL ? 'alive' : 'dead')
                };
            }

            GameOfLife.xDivisions = worldWidth;
            GameOfLife.yDivisions = worldHeight;

            // Draw out the cells
            var world = $("<div class='world'>");
            for (cell = 0; cell < GameOfLife.world.length; cell++) {
                world.append(GameOfLife.world[cell].element);
            }

            $("body", document).append(world).append($("<div>").html("seed: " + seed));

            for (var x = 0; x < 8; x++) {
                GameOfLife.surroundingCells[x] = R.math.Point2D.create(0,0);
            }


        },

        applyRules: function(cell) {
            var surroundingCells = [];

            // Get the cell
            var theCell = GameOfLife.world[cell];
            var isAlive = (theCell.state == GameOfLife.LIVE_CELL);

            // Cell loc
            var cellPoint = GameOfLife.getCoordinates(cell);

            // Surrounding cells
            GameOfLife.surroundingCells[0].set(cellPoint).add(GameOfLife.TOP_LEFT);
            GameOfLife.surroundingCells[1].set(cellPoint).add(GameOfLife.TOP_CENTER);
            GameOfLife.surroundingCells[2].set(cellPoint).add(GameOfLife.TOP_RIGHT);
            GameOfLife.surroundingCells[3].set(cellPoint).add(GameOfLife.LEFT);
            GameOfLife.surroundingCells[4].set(cellPoint).add(GameOfLife.RIGHT);
            GameOfLife.surroundingCells[5].set(cellPoint).add(GameOfLife.BOTTOM_LEFT);
            GameOfLife.surroundingCells[6].set(cellPoint).add(GameOfLife.BOTTOM_CENTER);
            GameOfLife.surroundingCells[7].set(cellPoint).add(GameOfLife.BOTTOM_RIGHT);

            // Determine which neighbors are alive
            var liveNeighbors = 0;
            for (var sCell = 0; sCell < GameOfLife.surroundingCells.length; sCell++) {
                if (GameOfLife.surroundingCells[sCell].x == -1) {
                    GameOfLife.surroundingCells[sCell].x = GameOfLife.xDivisions - 1;
                }

                if (GameOfLife.surroundingCells[sCell].x > GameOfLife.xDivisions - 1) {
                    GameOfLife.surroundingCells[sCell].x = 0;
                }

                if (GameOfLife.surroundingCells[sCell].y < 0) {
                    GameOfLife.surroundingCells[sCell].y = GameOfLife.yDivisions - 1;
                }

                if (GameOfLife.surroundingCells[sCell].y > GameOfLife.yDivisions - 1) {
                    GameOfLife.surroundingCells[sCell].y = 0;
                }

                var neighborCell = GameOfLife.getCell(GameOfLife.surroundingCells[sCell]);

                if (GameOfLife.world[neighborCell].state == GameOfLife.LIVE_CELL) {
                    liveNeighbors++;
                }
            }

            // Run the rules
            if (isAlive && liveNeighbors < 2) {
                theCell.state = GameOfLife.CELL_DIED;
            } else if (isAlive && (liveNeighbors == 2 || liveNeighbors == 3)) {
                // Lives on
            } else if (isAlive && liveNeighbors > 3) {
                theCell.state = GameOfLife.CELL_DIED;
            } else if (!isAlive && liveNeighbors == 3) {
                theCell.state = GameOfLife.CELL_BORN;
            }

            // Clean up
            cellPoint.destroy();
        },

        getCell: function(point) {
            return (point.y * GameOfLife.yDivisions + point.x);
        },

        getCoordinates: function(cell) {
            var y = Math.floor(cell / GameOfLife.xDivisions);
            var x = (cell % GameOfLife.xDivisions);
            return R.math.Point2D.create(x, y);
        },

        tick: function(time, dt) {
            var cell;

            // Process rules
            for (cell = 0; cell < GameOfLife.world.length; cell++) {
                GameOfLife.applyRules(cell);
            }

            // End cycle
            for (cell = 0; cell < GameOfLife.world.length; cell++) {
                if (GameOfLife.world[cell].state == GameOfLife.CELL_DIED) {
                    GameOfLife.world[cell].element.removeClass("alive").addClass("dead");
                    GameOfLife.world[cell].state = GameOfLife.DEAD_CELL;
                }

                if (GameOfLife.world[cell].state == GameOfLife.CELL_BORN) {
                    GameOfLife.world[cell].element.addClass("alive").removeClass("dead");
                    GameOfLife.world[cell].state = GameOfLife.LIVE_CELL;
                }
            }
        }

    });
};