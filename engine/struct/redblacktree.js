/**
 * The Render Engine
 * HashContainer
 * 
 * @fileoverview A set of objects which can be used to create a collection
 *               of objects, and to iterate over a container.
 *
 * @author: Brett Fattori (brettf@renderengine.com)
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

// The class this file defines and its required classes
R.Engine.define({
	"class": "R.struct.RedBlackTree",
	"requires": [
		"R.engine.PooledObject"
	]
});

/** 
 * The RedBlackNode is a private class which is used by the RedBlackTree class
 * to contain the data.  It is a simple container with basic structures
 * which are accessed directly.  Modification of this class should be done 
 * with care!!
 */
R.struct.RedBlackNode = Base.extend(/** @scope R.struct.RedBlackNode.prototype */{
	e: null,
	left: null,
	right: null,
	color: 0,
	
	constructor: function(element, left, right) {
		this.element = element;
		this.left = left || null;
		this.right = right || null;
		this.color = 1;	// Starts BLACK
	}	
}, /** @scope R.struct.RedBlackNode.prototype */{
	BLACK: 1,
	RED: 0
});

/**
 * @class An implementation of a RedBlackTree data structure.  RedBlackTree has
 *			 a worst-case time of O(log n) which is fast enough to quickly locate
 *			 objects in the tree.  Duplicates are not allowed in a RedBlackTree.
 *			 <p/>
 *			 Items added to a RedBlackTree must implement a <code>compareTo(t)</code>
 *			 method which returns a Number.  Zero if the value of the item is equal to
 *			 "t", -1 if the value is less than t, 1 if the value is greater than "t".
 *			 <p/>
 *			 References:
 *			   http://www.java-tips.org/java-se-tips/java.lang/red-black-tree-implementation-in-java.html<br/>
 *				http://www.eternallyconfuzzled.com/tuts/datastructures/jsw_tut_rbtree.aspx
 *
 * @param name {String} The name of the container. Default: RBTree
 * @extends R.engine.PooledObject
 * @constructor
 * @description Create a red-black tree object.
 */
R.struct.RedBlackTree = function(){
	return R.engine.PooledObject.extend(/** @scope R.struct.RedBlackTree.prototype */{
	
		nullNode: null,
		current: null,
		parent: null,
		grand: null,
		great: null,
		header: null,
		
		/** @private */
		constructor: function(name){
			this.base(name || "RBTree");

			this.nullNode = new R.struct.RedBlackNode(null);
			this.nullNode.left = this.nullNode.right = this.nullNode;

         this.header = new R.struct.RedBlackNode(null);
         this.header.left = this.header.right = this.nullNode;
		},
		
		/**
		 * Insert into the tree.  <code>item</code> must implement the <code>compareTo(t)</code>
		 * method, otherwise insertion will fail with an assertion.
		 *
		 * @param item {Object} the item to insert.
		 */
		insert: function(item){
			Assert(item.compareTo, "Items added to RedBlackTree must implement compareTo() method");
			this.current = this.parent = this.grand = this.header;
			this.nullNode.element = item;
			
			while (R.struct.RedBlackTree.compare(item, this.current) != 0) {
				this.great = this.grand;
				this.grand = this.parent;
				this.parent = this.current;
				this.current = R.struct.RedBlackTree.compare(item, this.current) < 0 ? this.current.left : this.current.right;
				
				// Check if two red children; fix if so
				if (this.current.left.color == R.struct.RedBlackNode.RED &&
				this.current.right.color == R.struct.RedBlackNode.RED) {
					this.handleReorient(item);
				}
			}
			
			// Insertion fails if item already present
			Assert(this.current == this.nullNode, "RedBlackTree duplication exception: " + item.toString());
			this.current = new R.struct.RedBlackNode(item, this.nullNode, this.nullNode);
			
			// Attach to parent
			if (R.struct.RedBlackTree.compare(item, this.parent) < 0) {
				this.parent.left = this.current;
			}
			else {
				this.parent.right = this.current;
			}
			
			this.handleReorient(item);
		},
		
		remove: function(item){
			R._unsupported("remove()", this);
			// see: http://www.eternallyconfuzzled.com/tuts/datastructures/jsw_tut_rbtree.aspx
		},
		
		/**
		 * Replace the the item in the tree with the new item.
		 * @param oldItem {Object} The object to find
		 * @param newItem {Object} The object to replace it with
		 */
		replace: function(oldItem, newItem){
			Assert(newItem.compareTo, "Cannot use replace() in RedBlackTree if item doesn't have compareTo()");
			var node = this.findNode(oldItem);
			if (node) {
				node.element = newItem;
			}
		},
		
		/**
		 * Find the smallest item  the tree.
		 * @return the smallest item or null if empty.
		 */
		findMin: function(){
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
		},
		
		/**
		 * Find the largest item in the tree.
		 * @return the largest item or null if empty.
		 */
		findMax: function(){
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
		},
		
		/**
		 * Find an item in the tree. The item "x" must implement the <code>compareTo(t)</code>method.
		 * @param x {Object} the item to search for.
		 * @return {Object} the matching item or <code>null</code> if not found.
		 */
		find: function(x){
			Assert(x.compareTo, "Cannot use find() in RedBlackTree if item doesn't have compareTo()");
			var node = this.findNode(x);
			return node.element;
		},
		
		/**
		 * Find the node containing an item in the tree.
		 * The item "x" must implement the <code>compareTo(t)</code>method.
		 * @param x {Object} the item to search for.
		 * @return {RedBlackNode} the matching node or <code>null</code> if not found.
		 */
		findNode: function(x){
			Assert(x.compareTo, "Cannot use findNode() in RedBlackTree if item doesn't have compareTo()");
			this.nullNode.element = x;
			this.current = this.header.right;
			
			for (;;) {
				if (x.compareTo(this.current.element) < 0) {
					this.current = this.current.left;
				}
				else 
					if (x.compareTo(current.element) > 0) {
						this.current = this.current.right;
					}
					else 
						if (current != nullNode) {
							return this.current;
						}
						else {
							return null;
						}
			}
		},
		
		/**
		 * Make the tree logically empty.
		 */
		makeEmpty: function(){
			this.header.right = this.nullNode;
		},
		
		/**
		 * Test if the tree is logically empty.
		 * @return true if empty, false otherwise.
		 */
		isEmpty: function(){
			return this.header.right == this.nullNode;
		},
		
		/**
		 * Internal routine that is called during an insertion
		 * if a node has two red children. Performs flip and rotations.
		 * @param item the item being inserted.
		 * @private
		 */
		handleReorient: function(item){
			// Do the color flip
			this.current.color = R.struct.RedBlackNode.RED;
			this.current.left.color = R.struct.RedBlackNode.BLACK;
			this.current.right.color = R.struct.RedBlackNode.BLACK;
			
			if (this.parent.color == R.struct.RedBlackNode.RED) { // Have to rotate
				this.grand.color = R.struct.RedBlackNode.RED;
				if ((R.struct.RedBlackTree.compare(item, this.grand) < 0) !=
				(R.struct.RedBlackTree.compare(item, this.parent) < 0)) {
					this.parent = this.rotate(item, this.grand); // Start double rotate
				}
				this.current = this.rotate(item, this.great);
				this.current.color = R.struct.RedBlackNode.BLACK;
			}
			this.header.right.color = R.struct.RedBlackNode.BLACK;
		},
		
		/**
		 * Internal routine that performs a single or double rotation.
		 * Because the result is attached to the parent, there are four cases.
		 * Called by handleReorient.
		 * @param item the item in handleReorient.
		 * @param parent the parent of the root of the rotated subtree.
		 * @return the root of the rotated subtree.
		 * @private
		 */
		rotate: function(item, prnt){
			if (R.struct.RedBlackTree.compare(item, prnt) < 0) {
				return prnt.left = R.struct.RedBlackTree.compare(item, prnt.left) < 0 ? R.struct.RedBlackTree.rotateWithLeftChild(prnt.left) : R.struct.RedBlackTree.rotateWithRightChild(prnt.left);
			}
			else {
				return prnt.right = R.struct.RedBlackTree.compare(item, prnt.right) < 0 ? R.struct.RedBlackTree.rotateWithLeftChild(prnt.right) : R.struct.RedBlackTree.rotateWithRightChild(prnt.right);
			}
		}
		
	}, /** @scope R.struct.RedBlackTree.prototype */{
	
		getClassName: function(){
			return "R.struct.RedBlackTree";
		},
		
		/**
		 * Compare item and t.element, using compareTo, with
		 * caveat that if t is header, then item is always larger.
		 * This routine is called if is possible that t is header.
		 * If it is not possible for t to be header, use compareTo directly.
		 * @private
		 */
		compare: function(item, t){
			if (t == header) {
				return 1;
			}
			else {
				return item.compareTo(t.element);
			}
		},
		
		/**
		 * Rotate binary tree node with left child.
		 */
		rotateWithLeftChild: function(k2){
			var k1 = k2.left;
			k2.left = k1.right;
			k1.right = k2;
			return k1;
		},
		
		/**
		 * Rotate binary tree node with right child.
		 */
		rotateWithRightChild: function(k1){
			var k2 = k1.right;
			k1.right = k2.left;
			k2.left = k1;
			return k2;
		}
	});
	
};