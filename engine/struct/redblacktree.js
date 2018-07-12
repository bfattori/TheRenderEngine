/**
 * The Render Engine
 * RedBlackTree
 *
 * Copyright (c) 2011 Brett Fattori (brettf@renderengine.com)
 */
"use strict";

/**
 * The RedBlackNode is a private class which is used by the RedBlackTree class
 * to contain the data.  It is a simple container with basic structures
 * which are accessed directly.  Modification of this class should be done
 * with care!!
 */
class RedBlackNode {
    constructor(element, left = null, right = null) {
        this.element = element;
        this.left = left;
        this.right = right;
        this.color = RedBlackNode.BLACK;
    }

    static BLACK = 1;
    static RED = 0;
}

/**
 * @class An implementation of a RedBlackTree data structure.  RedBlackTree has
 *             a worst-case time of O(log n) which is fast enough to quickly locate
 *             objects in the tree.  Duplicates are not allowed in a RedBlackTree.
 *             <p/>
 *             Items added to a RedBlackTree must implement a <code>compareTo(t)</code>
 *             method which returns a Number.  Zero if the value of the item is equal to
 *             "t", -1 if the value is less than t, 1 if the value is greater than "t".
 *             <p/>
 *             References:
 *               http://www.java-tips.org/java-se-tips/java.lang/red-black-tree-implementation-in-java.html<br/>
 *                http://www.eternallyconfuzzled.com/tuts/datastructures/jsw_tut_rbtree.aspx
 *
 * @param name {String} The name of the container. Default: RBTree
 * @extends R.engine.PooledObject
 * @constructor
 * @description Create a red-black tree object.
 */
class RedBlackTree extends PooledObject {

        constructor(name = "RedBlackTree") {
            super(name);

            this.nullNode = new RedBlackNode(null);
            this.nullNode.left = this.nullNode.right = this.nullNode;

            this.header = new RedBlackNode(null);
            this.header.left = this.header.right = this.nullNode;
        }

    release() {
        super.release();
        this.nullNode = null;
        this.header = null;
    }

    get className() {
        return "RedBlackTree";
    }

    /**
         * Insert into the tree.  <code>item</code> must implement the <code>compareTo(t)</code>
         * method, otherwise insertion will fail with an assertion.
         *
         * @param item {Object} the item to insert.
         */
        insert(item) {
            Assert(item.compareTo, "Items added to RedBlackTree must implement compareTo() method");
            this.current = this.parent = this.grand = this.header;
            this.nullNode.element = item;

            while (RedBlackTree.compare(item, this.current) != 0) {
                this.great = this.grand;
                this.grand = this.parent;
                this.parent = this.current;
                this.current = RedBlackTree.compare(item, this.current) < 0 ? this.current.left : this.current.right;

                // Check if two red children; fix if so
                if (this.current.left.color === RedBlackNode.RED &&
                    this.current.right.color === RedBlackNode.RED) {
                    this.handleReorient(item);
                }
            }

            // Insertion fails if item already present
            Assert(this.current == this.nullNode, "RedBlackTree duplication exception: " + item.toString());
            this.current = new RedBlackNode(item, this.nullNode, this.nullNode);

            // Attach to parent
            if (RedBlackTree.compare(item, this.parent) < 0) {
                this.parent.left = this.current;
            }
            else {
                this.parent.right = this.current;
            }

            this.handleReorient(item);
        }

        remove(item) {
            R._unsupported("remove()", this);
            // see: http://www.eternallyconfuzzled.com/tuts/datastructures/jsw_tut_rbtree.aspx
        }

        /**
         * Replace the the item in the tree with the new item.
         * @param oldItem {Object} The object to find
         * @param newItem {Object} The object to replace it with
         */
        replace(oldItem, newItem) {
            Assert(newItem.compareTo, "Cannot use replace() in RedBlackTree if item doesn't have compareTo()");
            var node = this.findNode(oldItem);
            if (node) {
                node.element = newItem;
            }
        }

        /**
         * Find the smallest item  the tree.
         * @return the smallest item or null if empty.
         */
        findMin() {
            if (this.isEmpty()) {
                return null;
            }
            else {
                var itr = this.header.right;
                while (itr.left != this.nullNode) {
                    itr = itr.left;
                }

                return itr.element;
            }
        }

        /**
         * Find the largest item in the tree.
         * @return the largest item or null if empty.
         */
        findMax() {
            if (this.isEmpty()) {
                return null;
            }
            else {
                var itr = this.header.right;
                while (itr.right != this.nullNode) {
                    itr = itr.right;
                }

                return itr.element;
            }
        }

        /**
         * Find an item in the tree. The item "x" must implement the <code>compareTo(t)</code>method.
         * @param x {Object} the item to search for.
         * @return {Object} the matching item or <code>null</code> if not found.
         */
        find(x) {
            Assert(x.compareTo, "Cannot use find() in RedBlackTree if item doesn't have compareTo()");
            var node = this.findNode(x);
            return node.element;
        }

        /**
         * Find the node containing an item in the tree.
         * The item "x" must implement the <code>compareTo(t)</code>method.
         * @param x {Object} the item to search for.
         * @return {RedBlackNode} the matching node or <code>null</code> if not found.
         */
        findNode(x) {
            Assert(x.compareTo, "Cannot use findNode() in RedBlackTree if item doesn't have compareTo()");
            this.nullNode.element = x;
            this.current = this.header.right;

            for (; ;) {
                if (x.compareTo(this.current.element) < 0) {
                    this.current = this.current.left;
                }
                else if (x.compareTo(this.current.element) > 0) {
                    this.current = this.current.right;
                }
                else if (this.current != this.nullNode) {
                    return this.current;
                }
                else {
                    return null;
                }
            }
        }

        /**
         * Make the tree logically empty.
         */
        makeEmpty () {
            this.header.right = this.nullNode;
        }

        /**
         * Test if the tree is logically empty.
         * @return true if empty, false otherwise.
         */
        isEmpty () {
            return this.header.right == this.nullNode;
        }

        /**
         * Internal routine that is called during an insertion
         * if a node has two red children. Performs flip and rotations.
         * @param item the item being inserted.
         * @private
         */
        handleReorient(item) {
            // Do the color flip
            this.current.color = RedBlackNode.RED;
            this.current.left.color = RedBlackNode.BLACK;
            this.current.right.color = RedBlackNode.BLACK;

            if (this.parent.color === RedBlackNode.RED) { // Have to rotate
                this.grand.color = RedBlackNode.RED;
                if ((RedBlackTree.compare(item, this.grand) < 0) !=
                    (RedBlackTree.compare(item, this.parent) < 0)) {
                    this.parent = this.rotate(item, this.grand); // Start double rotate
                }
                this.current = this.rotate(item, this.great);
                this.current.color = RedBlackNode.BLACK;
            }
            this.header.right.color = RedBlackNode.BLACK;
        }

        /**
         * Internal routine that performs a single or double rotation.
         * Because the result is attached to the parent, there are four cases.
         * Called by handleReorient.
         * @param item the item in handleReorient.
         * @param prnt the parent of the root of the rotated subtree.
         * @return the root of the rotated subtree.
         * @private
         */
        static rotate(item, prnt) {
            if (RedBlackTree.compare(item, prnt) < 0) {
                return prnt.left = RedBlackTree.compare(item, prnt.left) < 0 ? RedBlackTree.rotateWithLeftChild(prnt.left) : RedBlackTree.rotateWithRightChild(prnt.left);
            }
            else {
                return prnt.right = RedBlackTree.compare(item, prnt.right) < 0 ? RedBlackTree.rotateWithLeftChild(prnt.right) : RedBlackTree.rotateWithRightChild(prnt.right);
            }
        }


        /**
         * Compare item and t.element, using compareTo, with
         * caveat that if t is header, then item is always larger.
         * This routine is called if is possible that t is header.
         * If it is not possible for t to be header, use compareTo directly.
         */
        static compare(item, t) {
            if (t === null) {
                return 1;
            }
            else {
                return item.compareTo(t.element);
            }
        }

        /**
         * Rotate binary tree node with left child.
         */
        static rotateWithLeftChild(k2) {
            var k1 = k2.left;
            k2.left = k1.right;
            k1.right = k2;
            return k1;
        }

        /**
         * Rotate binary tree node with right child.
         */
        static rotateWithRightChild(k1) {
            var k2 = k1.right;
            k1.right = k2.left;
            k2.left = k1;
            return k2;
        }
    }
