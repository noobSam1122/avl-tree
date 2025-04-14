// AVL Tree
export default class BST {
    constructor(config) {
        this.root = null;
        this.nodeCount = 0;
        this.comparator = config.comparator;
    }
    insert(value) {
        if (!this.root) {
            this.root = new Node(value);
            this.nodeCount++;
            return;
        }
        this.#insert(value, this.root);
    }
    #insert(value, startingNode) {
        const dif = this.comparator(value, startingNode.value);
        if (dif === undefined) {
            throw new Error(`Cannot insert, comparator does not return value.`);
        }
        if (dif < 0) {
            if (!startingNode.left) {
                const node = new Node(value);
                startingNode.left = node;
                node.parent = startingNode;
                this.#checkForBalanceAfterInsert(node);
                this.nodeCount++;
                return;
            }
            this.#insert(value, startingNode.left);
        } else if (dif > 0) {
            if (!startingNode.right) {
                const node = new Node(value);
                startingNode.right = node;
                node.parent = startingNode;
                this.#checkForBalanceAfterInsert(node);
                this.nodeCount++;
                return;
            }
            this.#insert(value, startingNode.right);
        } else {
            startingNode.count++;
            return;
        }
    }
    has(value) {
        return this.search(value) !== null;
    }
    predecessor(startingNode) {
        if (!startingNode.left) {
            return startingNode;
        }
        let current = startingNode.left;
        while (current.right) {
            current = current.right;
        }
        return current;
    }
    successor(startingNode) {
        if (!startingNode.right) {
            return null;
        }
        let current = startingNode.right;
        while (current.left) {
            current = current.left;
        }
        return current;
    }
    #checkForBalanceAfterInsert(newNode) {
        const nodeStack = [newNode.parent];
        let tempParent = newNode;
        const path = [];
        let rh = -1, lh = -1;
        while (nodeStack.length) {
            const node = nodeStack.pop();
            if (node.left === tempParent) {
                path.push(1)
            } else if (node.right === tempParent) {
                path.push(-1);
            }
            if (node.left) {
                lh = node.left.h;
            }
            if (node.right) {
                rh = node.right.h;
            }
            const h = Math.max(lh, rh) + 1;
            if (node.h === h) break; //插入更新時：如果目前節點的高度沒有改變，則停止向上回溯父節點。
            node.h = h;
            if (Math.abs(lh - rh) > 1) {
                this.#rotate(path, node);
                break;
            }
            if (node.parent) {
                nodeStack.push(node.parent);
            }
            tempParent = node;
            rh = -1;
            lh = -1;
        }

    }
    #checkForBalanceAfterDelete(startingNode) {
        if (!startingNode) startingNode = this.root;
        const nodeStack = [startingNode];
        let rh = -1, lh = -1;
        while (nodeStack.length) {
            const node = nodeStack.pop();
            if (node.left) {
                lh = node.left.h;
            }
            if (node.right) {
                rh = node.right.h;
            }
            const h = Math.max(lh, rh) + 1;
            const bf = this.#getBF(node);
            if (node.h === h && bf >= -1 && bf < 1) { //刪除更新時：如果目前節點的高度沒有改變，且平衡值在[-1, 1] 區間則停止回溯
                break;
            }
            node.h = h;
            if (Math.abs(lh - rh) > 1) {
                if (lh >= rh) {
                    const leftChildBF = this.#getBF(node.left);
                    if (leftChildBF > 0) {
                        this.#LL(node);
                    } else {
                        this.#LR(node);
                    }
                } else {
                    const rightChildBF = this.#getBF(node.right);
                    if (rightChildBF > 0) {
                        this.#RL(node);
                    } else {
                        this.#RR(node);
                    }
                }
                break;
            }
            if (node.parent) {
                nodeStack.push(node.parent);
            }
            rh = -1;
            lh = -1;
        }
    }
    #getBF(node) {
        let rh = -1, lh = -1;
        if (node.left) {
            lh = node.left.h;
        }
        if (node.right) {
            rh = node.right.h;
        }
        return lh - rh;
    }
    #recalculateHeight(node) {
        if (node === null) node = this.root;
        let lh = -1, rh = -1;
        this.postOrder((value, node) => {
            if (node.left) {
                lh = node.left.h;
            }
            if (node.right) {
                rh = node.right.h;
            }
            node.h = Math.max(lh, rh) + 1;
            lh = -1, rh = -1;

        }, node);
    }
    #rotate(path, pivot) {
        const a = path.length - 1, b = path.length - 2;
        if (path[a] === 1 && path[b] === 1) { //LL
            this.#LL(pivot);
        } else if (path[a] === -1 && path[b] === -1) {// RR
            this.#RR(pivot);
        } else if (path[a] === 1 && path[b] === -1) { //LR
            this.#LR(pivot);
        } else { // RL
            this.#RL(pivot);

        }
    }
    #LL(pivot) {
        const pivotNext = pivot.left, temp = pivotNext.right;
        pivotNext.right = pivot;
        pivot.left = temp;
        if (temp !== null) {
            temp.parent = pivot;
        }
        if (pivot === this.root) {
            this.root = pivotNext;
            pivotNext.parent = null;
            pivot.parent = this.root;
        } else {
            const pp = pivot.parent;
            pivotNext.parent = pp;
            pivot.parent = pivotNext;
            pp.left === pivot ? pp.left = pivotNext : pp.right = pivotNext;
        }
        this.#recalculateHeight(pivotNext.parent);
    }
    #RR(pivot) {
        const pivotNext = pivot.right, temp = pivotNext.left;
        pivotNext.left = pivot;
        pivot.right = temp;
        if (temp !== null) {
            temp.parent = pivot;
        }
        if (pivot === this.root) {
            this.root = pivotNext;
            pivotNext.parent = null;
            pivot.parent = this.root;
        } else {
            const pp = pivot.parent;
            pivotNext.parent = pp;
            pivot.parent = pivotNext;
            pp.right === pivot ? pp.right = pivotNext : pp.left = pivotNext;
        }
        this.#recalculateHeight(pivotNext.parent);
    }
    #LR(pivot) {
        const pivotNext = pivot.left, temp = pivotNext.right;

        if (this.root === pivot) {
            this.root = temp;
            temp.parent = null;
        } else {
            const pp = pivot.parent;
            pp.left === pivot ? pp.left = temp : pp.right = temp;
            temp.parent = pp;
        }
        pivotNext.right = temp.left;
        pivot.left = temp.right;
        if (temp.right !== null) {
            temp.right.parent = pivot;
        } if (temp.left !== null) {
            temp.left.parent = pivotNext;
        }

        temp.right = pivot;
        temp.left = pivotNext;
        pivot.parent = temp;
        pivotNext.parent = temp;

        this.#recalculateHeight(temp.parent);
    }
    #RL(pivot) {
        const pivotNext = pivot.right, temp = pivotNext.left;

        if (this.root === pivot) {
            this.root = temp;
            temp.parent = null;
        } else {
            const pp = pivot.parent;
            pp.right === pivot ? pp.right = temp : pp.left = temp;
            temp.parent = pp;
        }
        pivotNext.left = temp.right;
        pivot.right = temp.left;
        if (temp.left !== null) {
            temp.left.parent = pivot;
        } if (temp.right !== null) {
            temp.right.parent = pivotNext;
        }
        temp.left = pivot;
        temp.right = pivotNext;
        pivot.parent = temp;
        pivotNext.parent = temp;

        this.#recalculateHeight(temp.parent);
    }
    preOrder(fn, node = this.root) {
        if (!node) return;
        fn(node.value, node);
        this.preOrder(fn, node.left);
        this.preOrder(fn, node.right);
    }
    inOrder(fn, node = this.root) {
        if (!node) return;
        this.inOrder(fn, node.left);
        fn(node.value, node);
        this.inOrder(fn, node.right);
    }
    postOrder(fn, node = this.root) {
        if (node === null) return;
        this.postOrder(fn, node.left);
        this.postOrder(fn, node.right);
        fn(node.value, node);
    }
    #halfTree(startingNode, isLeftTree, includeSelf = false) {
        const result = [];
        if (startingNode === null) {
            throw new Error('The starting node for finding left children is null.');
        }
        let current;
        const nodeStack = [];
        if (isLeftTree) {
            if (!startingNode.left) return result;
            current = startingNode.left;
        } else {
            if (!startingNode.right) return result;
            current = startingNode.right;
        }
        nodeStack.push(current);
        while (nodeStack.length) {
            if (current.left) {
                nodeStack.push(current.left);
                current = current.left;
                continue
            }
            current = nodeStack.pop();
            result.push(current)
            if (current.right) {
                nodeStack.push(current.right);
                current = current.right;
                continue;
            }
        }
        if (includeSelf) {
            if (isLeftTree) {
                result.push(startingNode);
            } else {
                result.unshift(startingNode);
            }
        }
        return result;
    }
    treeLeft(startingNode) {
        return this.#halfTree(startingNode, true);
    }
    treeRight(startingNode) {
        return this.#halfTree(startingNode, false);
    }
    match(predicate) {
        if (this.root === null) return null;
        return this.#match(this.root, predicate);
    }
    /**                                                                          
     *   
     * @param {*} startingNode - returns the first match of the tree node which satisfies the predicate
     * @param {*} predicate - returns the value of, [<0,=0,>0], <0 indicate left search, >0 indicate right search, =0 indicates match the criteria, will return the node
     * @returns 
     */
    #match(startingNode, predicate) {
        let dif = predicate(startingNode.value, startingNode);
        // search left
        if (dif < 0) {
            if (startingNode.left) {
                return this.#match(startingNode.left, predicate);
            }
            return null;
        }
        // search right
        else if (dif > 0) {
            if (startingNode.right) {
                return this.#match(startingNode.right, predicate);
            }
            return null;
        } else if (dif === 0) {
            return startingNode;
        } else {
            throw new Error("match() should return -1, 0 , 1 to indicate the return condition")
        }
    }
    search(value) {
        let current = this.root;
        while (current !== null) {
            const diff = this.comparator(value, current.value);

            if (diff === undefined) {
                throw new Error("The callback function of search() must return a value which is '< 0 or = 0 or > 0' to indicate search direction and result.");
            }
            if (diff === 0) {
                return current;
            }
            if (diff < 0) {
                current = current.left;
            } else {
                current = current.right;
            }
        }
        return null;
    }
    remove(value) {
        if (value instanceof Node) {
            this.#delete(value);
            this.nodeCount--;
            return value;
        }
        const node = this.search(value);
        if (node) {
            this.#delete(node);
            this.nodeCount--;
            return node;
        }
        return null;
    }
    clear() {
        const nodes = this.sort();
        for (let node of nodes) {
            this.#deRefValue(node);
            node.left = null;
            node.right = null;
            node.parent = null;
            node.value = null;
            node = null;
        }
        this.nodeCount = 0;
        this.root = null;
    }
    #delete(node) {
        const np = node.parent;
        const isRoot = np === null;

        if (!node.left && !node.right) {
            if (isRoot) {
                this.#deRefValue(this.root);
                this.root = null;
                return;
            }
            node.parent = null;
            if (np.right === node) {
                np.right = null;
            } else {
                np.left = null;
            }
            this.#deRefValue(node);
            this.#checkForBalanceAfterDelete(np);
            return;
        }
        if (node.right && !node.left) {
            if (isRoot) {
                this.root = node.right;
                this.root.parent = null;
            } else {
                node.right.parent = np;
                np.right === node ? np.right = node.right : np.left = node.right;
            }
            node.right = null;
            node.parent = null;
            this.#deRefValue(node);
            this.#checkForBalanceAfterDelete(np);
            return;
        }
        if (node.left && !node.right) {
            if (isRoot) {
                this.root = node.left;
                this.root.parent = null;
            } else {
                node.left.parent = np;
                np.left === node ? np.left = node.left : np.right = node.left;
            }
            node.left = null;
            node.parent = null;
            this.#deRefValue(node);
            this.#checkForBalanceAfterDelete(np);
            return;
        }

        // has left and right child
        const pred = this.predecessor(node);
        node.value = pred.value;
        node.value.__NODE_REF__ = node;
        pred.value = null;
        this.#delete(pred);
    }
    sort() {
        const nodes = [];
        this.inOrder(v => {
            nodes.push(v);
        })
        return nodes;
    }
    #deRefValue(value) {
        if (value instanceof Node) {
            this.#deRefValue(value.value);
            return;
        }
        if (value !== null && value.hasOwnProperty('__NODE_REF__')) {
            value.__NODE_REF__ = null;
            delete value.__NODE_REF__;
            return;
        }
    }
}
class Node {
    constructor(v) {
        this.left = null;
        this.right = null;
        this.value = v;
        this.count = 1;
        this.parent = null;
        this.h = 0;
        if (typeof this.value === 'object') {
            this.value.__NODE_REF__ = this;
        }

    }
}
