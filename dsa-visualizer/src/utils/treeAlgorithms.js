// utils/treeAlgorithms.js - Add AVL specific generation
import { Node, insertBST, insertAVL, cloneTree } from './avlOperations';

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
      values.forEach(val => {
        root = insertBST(root, val);
      });
      break;
    case 'avl':
      values.forEach(val => {
        root = insertAVL(root, val);
      });
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
    node.left = createNode(2 * index + 1);
    node.right = createNode(2 * index + 2);
    // Calculate height for binary tree
    node.height = Math.max(
      node.left ? node.left.height : 0,
      node.right ? node.right.height : 0
    ) + 1;
    return node;
  };
  
  return createNode(0);
};

export const traverseTree = (root, type) => {
  const result = [];
  
  const traversals = {
    inorder: (node) => {
      if (!node) return;
      traversals.inorder(node.left);
      result.push(node.val);
      traversals.inorder(node.right);
    },
    preorder: (node) => {
      if (!node) return;
      result.push(node.val);
      traversals.preorder(node.left);
      traversals.preorder(node.right);
    },
    postorder: (node) => {
      if (!node) return;
      traversals.postorder(node.left);
      traversals.postorder(node.right);
      result.push(node.val);
    }
  };
  
  if (traversals[type]) {
    traversals[type](root);
  }
  
  return result;
};