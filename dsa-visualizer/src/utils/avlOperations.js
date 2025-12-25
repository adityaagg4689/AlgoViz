// utils/avlOperations.js
export class Node {
  constructor(val) {
    this.val = val;
    this.left = null;
    this.right = null;
    this.height = 1;
    this.id = Math.random().toString(36).substr(2, 9);
  }

  // Helper to clone node
  clone() {
    const node = new Node(this.val);
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

// Clone tree function
export const cloneTree = (node) => {
  if (!node) return null;
  
  const newNode = new Node(node.val);
  newNode.left = cloneTree(node.left);
  newNode.right = cloneTree(node.right);
  newNode.height = node.height;
  
  return newNode;
};

// BST Insert
export const insertBST = (root, key) => {
  if (!root) return new Node(key);
  
  if (key < root.val) {
    root.left = insertBST(root.left, key);
  } else if (key > root.val) {
    root.right = insertBST(root.right, key);
  }
  
  return root;
};

// AVL Insert with step tracking
export const insertAVLWithSteps = (root, key, steps = []) => {
  let step = { value: key, action: 'insert', treeBefore: cloneTree(root) };
  
  if (!root) {
    const newNode = new Node(key);
    step.treeAfter = newNode;
    step.message = `Created new node with value ${key}`;
    steps.push(step);
    return newNode;
  }
  
  step.message = `Inserting ${key}...`;
  
  if (key < root.val) {
    step.message = `Inserting ${key} to left subtree of ${root.val}`;
    steps.push(step);
    root.left = insertAVLWithSteps(root.left, key, steps);
  } else if (key > root.val) {
    step.message = `Inserting ${key} to right subtree of ${root.val}`;
    steps.push(step);
    root.right = insertAVLWithSteps(root.right, key, steps);
  } else {
    step.message = `Value ${key} already exists`;
    steps.push(step);
    return root;
  }
  
  root.height = Math.max(height(root.left), height(root.right)) + 1;
  
  const bal = balance(root);
  
  step = { 
    value: key, 
    action: 'balance_check', 
    treeBefore: cloneTree(root),
    balance: bal 
  };
  
  // Left Left Case
  if (bal > 1 && key < root.left.val) {
    step.message = `Unbalanced (${bal}). Performing Right Rotation`;
    step.action = 'rotate_right';
    steps.push(step);
    return rightRotate(root);
  }
  
  // Right Right Case
  if (bal < -1 && key > root.right.val) {
    step.message = `Unbalanced (${bal}). Performing Left Rotation`;
    step.action = 'rotate_left';
    steps.push(step);
    return leftRotate(root);
  }
  
  // Left Right Case
  if (bal > 1 && key > root.left.val) {
    step.message = `Unbalanced (${bal}). Performing Left-Right Rotation`;
    step.action = 'rotate_left_right';
    steps.push(step);
    root.left = leftRotate(root.left);
    return rightRotate(root);
  }
  
  // Right Left Case
  if (bal < -1 && key < root.right.val) {
    step.message = `Unbalanced (${bal}). Performing Right-Left Rotation`;
    step.action = 'rotate_right_left';
    steps.push(step);
    root.right = rightRotate(root.right);
    return leftRotate(root);
  }
  
  step.message = `Tree balanced. Height: ${root.height}`;
  step.treeAfter = cloneTree(root);
  steps.push(step);
  
  return root;
};

// Build AVL tree from array with step-by-step tracking
export const buildAVLFromArray = async (array) => {
  let root = null;
  const steps = [];
  
  for (let i = 0; i < array.length; i++) {
    const value = array[i];
    
    root = insertAVLWithSteps(root, value, steps);
    
    // Capture final state after each insertion
    if (steps.length > 0) {
      const lastStep = steps[steps.length - 1];
      steps.push({
        step: i + 1,
        value: value,
        tree: cloneTree(root),
        message: `After inserting ${value}: ${lastStep.message || 'Completed'}`,
        action: 'completed_insert'
      });
    }
  }
  
  // Filter to show only important steps
  const importantSteps = steps.filter(step => 
    step.action === 'completed_insert' || 
    step.action.includes('rotate') ||
    step.action === 'balance_check'
  );
  
  return { root, steps: importantSteps };
};

// Regular AVL insert (for random generation)
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