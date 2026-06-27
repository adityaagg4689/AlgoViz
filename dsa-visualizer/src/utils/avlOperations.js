// utils/avlOperations.js
export class Node {
  constructor(val) {
    this.val = val;
    this.left = null;
    this.right = null;
    this.height = 1;
    this.id = Math.random().toString(36).substr(2, 9);
  }

  clone() {
    const node = new Node(this.val);
    node.id = this.id; // preserve id through clones
    node.left = this.left ? this.left.clone() : null;
    node.right = this.right ? this.right.clone() : null;
    node.height = this.height;
    return node;
  }
}

const height = (n) => (n ? n.height : 0);
const balance = (n) => height(n.left) - height(n.right);

const rightRotate = (y) => {
  const x = y.left;
  const T2 = x.right;
  x.right = y;
  y.left = T2;
  y.height = Math.max(height(y.left), height(y.right)) + 1;
  x.height = Math.max(height(x.left), height(x.right)) + 1;
  return x;
};

const leftRotate = (x) => {
  const y = x.right;
  const T2 = y.left;
  y.left = x;
  x.right = T2;
  x.height = Math.max(height(x.left), height(x.right)) + 1;
  y.height = Math.max(height(y.left), height(y.right)) + 1;
  return y;
};

export const cloneTree = (node) => {
  if (!node) return null;
  const newNode = new Node(node.val);
  newNode.id = node.id; // preserve id
  newNode.left = cloneTree(node.left);
  newNode.right = cloneTree(node.right);
  newNode.height = node.height;
  return newNode;
};

// BST Insert — also updates heights so the h: badge is correct
export const insertBST = (root, key) => {
  if (!root) return new Node(key);
  if (key < root.val) {
    root.left = insertBST(root.left, key);
  } else if (key > root.val) {
    root.right = insertBST(root.right, key);
  }
  // Fix bug #2: recompute height on the way back up
  root.height = Math.max(height(root.left), height(root.right)) + 1;
  return root;
};

// Build AVL tree from array with step-by-step tracking.
// Fix bug #1: only emit 'completed_insert' steps (one full-tree snapshot per
// inserted value) so .tree is never undefined when the stepper calls setRoot.
export const buildAVLFromArray = async (array) => {
  let root = null;
  const steps = [];

  for (let i = 0; i < array.length; i++) {
    const value = array[i];
    root = insertAVL(root, value); // regular AVL insert keeps tree correct
    steps.push({
      step: i + 1,
      value,
      tree: cloneTree(root),          // always a full-tree snapshot
      message: `Inserted ${value} — tree height: ${root ? root.height : 0}`,
      action: 'completed_insert'
    });
  }

  return { root, steps };
};

// Regular AVL insert (used for random generation and buildAVLFromArray)
export const insertAVL = (root, key) => {
  if (!root) return new Node(key);

  if (key < root.val) {
    root.left = insertAVL(root.left, key);
  } else if (key > root.val) {
    root.right = insertAVL(root.right, key);
  } else {
    return root;
  }

  root.height = Math.max(height(root.left), height(root.right)) + 1;
  const bal = balance(root);

  if (bal > 1 && key < root.left.val) return rightRotate(root);
  if (bal < -1 && key > root.right.val) return leftRotate(root);
  if (bal > 1 && key > root.left.val) {
    root.left = leftRotate(root.left);
    return rightRotate(root);
  }
  if (bal < -1 && key < root.right.val) {
    root.right = rightRotate(root.right);
    return leftRotate(root);
  }

  return root;
};