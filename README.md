```javascript
const bst = new BST({
    comparator: (value, nodeValue) => {
        return value - nodeValue;
    }
});
const insertion = [92, 9, 6, 37, 66, 27, 74, 54, 30, 53, 80, 15, 36, 71, 40, 57, 49, 56, 23]
insertion.forEach(v => { bst.insert(v) });

bst.inOrder((value, node) => {
    console.log(value);
})
bst.remove(6);

const node = bst.search(27);
console.log(node);

bst.clear();
```
