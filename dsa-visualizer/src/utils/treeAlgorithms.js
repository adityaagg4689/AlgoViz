// utils/treeAlgorithms.js
import { Node, insertBST, insertAVL } from './avlOperations';

export const generateRandomTree = (treeType, count = 15) => {
  const values = Array.from({ length: count }, () => 
    Math.floor(Math.random() * 100) + 1
  );
  
  let root = null;
  
  switch(treeType) {
    case 'binary':
      root = generateBinaryTree(values);
      break;
    case 'bst':
      values.forEach(val => { root = insertBST(root, val); });
      break;
    case 'avl':
      values.forEach(val => { root = insertAVL(root, val); });
      break;
    default:
      root = generateBinaryTree(values);
  }
  
  return root;
};

const generateBinaryTree = (values) => {
  if (values.length === 0) return null;
  
  const createNode = (index) => {
    if (index >= values.length) return null;
    const node = new Node(values[index]);
    node.left  = createNode(2 * index + 1);
    node.right = createNode(2 * index + 2);
    node.height = Math.max(
      node.left  ? node.left.height  : 0,
      node.right ? node.right.height : 0
    ) + 1;
    return node;
  };
  
  return createNode(0);
};

// Returns node IDs in traversal order (fix bug #3: use id not val)
export const traverseTree = (root, type) => {
  const result = [];
  
  const traversals = {
    inorder: (node) => {
      if (!node) return;
      traversals.inorder(node.left);
      result.push(node.id);        // ← id, not val
      traversals.inorder(node.right);
    },
    preorder: (node) => {
      if (!node) return;
      result.push(node.id);
      traversals.preorder(node.left);
      traversals.preorder(node.right);
    },
    postorder: (node) => {
      if (!node) return;
      traversals.postorder(node.left);
      traversals.postorder(node.right);
      result.push(node.id);
    }
  };
  
  if (traversals[type]) traversals[type](root);
  return result;
};