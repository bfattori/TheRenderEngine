// Load all required engine components
R.Engine.define({
    "class": "GameOfLife",
    "requires": [
        "R.engine.Game"
    ]
});

/**
 * @class Game of Life
 *
 * Interesting seeds:
 *      4001389056
 */
var GameOfLife = function () {
    return R.engine.Game.extend({

        world: null,

        LIVE_CELL: 1,
        DEAD_CELL: 2,
        BORN_CELL: 3,

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

        checkbox: null,
        doStep: false,

        /**
         * Called to set up the game, download any resources, and initialize
         * the game to its running state.
         */
        setup: function () {
            GameOfLife.seedWorld(R.engine.Support.getNumericParam('width', 30),
                R.engine.Support.getNumericParam('height', 30),
                R.engine.Support.getNumericParam('seed', R.lang.Math2.randomInt()));

            GameOfLife.checkbox = $("input.pause");
        },

        seedWorld: function(worldWidth, worldHeight, seed) {
            R.lang.Math2.seed(seed);

            GameOfLife.cellWidth = Math.floor(GameOfLife.playWidth / worldWidth);
            GameOfLife.cellHeight = Math.floor(GameOfLife.playHeight / worldHeight);

            // Drop a few dynamic styles
            var cellStyle = 'div.cell { width: ' + GameOfLife.cellWidth + 'px; height: ' + GameOfLife.cellHeight + 'px; ' +
                'float: left; position: relative; padding: 0; margin: 0; line-height: 7px; border-top: 1px solid; ' +
                'border-left: 1px solid; } ' +
                'div.cell.alive { background-color: black; } ' +
                'div.cell.dead { background-color: none; } ';

            var worldStyle = 'div.world { width: ' + (GameOfLife.playWidth + (worldWidth - GameOfLife.cellWidth)) +  'px; height: ' +
                (GameOfLife.playHeight + (worldHeight - GameOfLife.cellHeight)) + 'px; ' +
                'border: 1px solid blue; }';

            var styles = "<style type='text/css'>" + cellStyle + worldStyle + "</style>";
            $("head").append(styles);

            GameOfLife.world = [];
            for (var cell = 0; cell < worldWidth * worldHeight; cell++) {
                var cellState = R.lang.Math2.randomRange(GameOfLife.LIVE_CELL, GameOfLife.DEAD_CELL, true);
                GameOfLife.world[cell] = {
                    state: cellState,
                    nextState: cellState,
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

            world.click(function(ev) {
                GameOfLife.createCell(ev);
            });

            for (var x = 0; x < 8; x++) {
                GameOfLife.surroundingCells[x] = R.math.Point2D.create(0,0);
            }


        },

        createCell: function(ev) {
            $(ev.target).addClass("alive").removeClass("dead");
            GameOfLife.world[$("div.cell").index(ev.target)].nextState = GameOfLife.BORN_CELL;
        },

        applyRules: function() {
            for (var cell = 0; cell < GameOfLife.world.length; cell++) {

                // Get the cell
                var theCell = GameOfLife.world[cell];
                var isAlive = (theCell.state === GameOfLife.LIVE_CELL);

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
                for (var idx = 0; idx < GameOfLife.surroundingCells.length; idx++) {
                    if (GameOfLife.surroundingCells[idx].x == -1) {
                        GameOfLife.surroundingCells[idx].setX(GameOfLife.xDivisions - 1);
                    } else if (GameOfLife.surroundingCells[idx].x > GameOfLife.xDivisions - 1) {
                        GameOfLife.surroundingCells[idx].setX(0);
                    }

                    if (GameOfLife.surroundingCells[idx].y < 0) {
                        GameOfLife.surroundingCells[idx].setY(GameOfLife.yDivisions - 1);
                    } else if (GameOfLife.surroundingCells[idx].y > GameOfLife.yDivisions - 1) {
                        GameOfLife.surroundingCells[idx].setY(0);
                    }

                    var neighborCell = GameOfLife.getCell(GameOfLife.surroundingCells[idx]);

                    if (GameOfLife.world[neighborCell].state === GameOfLife.LIVE_CELL) {
                        liveNeighbors++;
                    }
                }

                // Run the rules
                if (isAlive && liveNeighbors < 2 || liveNeighbors > 3) {
                    // Lonely or overcrowded
                    theCell.nextState = GameOfLife.DEAD_CELL;
                }

                if (!isAlive && liveNeighbors === 3) {
                    // Reproduction
                    theCell.nextState = GameOfLife.BORN_CELL;
                }

                // Clean up
                cellPoint.destroy();
            }
        },

        getCell: function(point) {
            return ((point.y * GameOfLife.xDivisions) + point.x);
        },

        getCoordinates: function(cell) {
            var y = Math.floor(cell / GameOfLife.xDivisions);
            var x = (cell % GameOfLife.xDivisions);
            return R.math.Point2D.create(x, y);
        },

        step: function() {
            GameOfLife.doStep = true;
        },

        tick: function(time, dt) {
            var cell;

            if (GameOfLife.checkbox[0].checked && !GameOfLife.doStep) {
                return;
            }

            GameOfLife.doStep = false;

            // Process rules
            GameOfLife.applyRules();

            // End cycle
            for (cell = 0; cell < GameOfLife.world.length; cell++) {
                if (GameOfLife.world[cell].nextState == GameOfLife.DEAD_CELL) {
                    GameOfLife.world[cell].element.removeClass("alive").addClass("dead");
                    GameOfLife.world[cell].state = GameOfLife.DEAD_CELL;
                    GameOfLife.world[cell].nextState = null;
                } else if (GameOfLife.world[cell].nextState == GameOfLife.BORN_CELL) {
                    GameOfLife.world[cell].element.addClass("alive").removeClass("dead");
                    GameOfLife.world[cell].state = GameOfLife.LIVE_CELL;
                    GameOfLife.world[cell].nextState = null;
                }
            }
        }

    });
};