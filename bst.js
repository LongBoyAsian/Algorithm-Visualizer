// This file assumes the following globals are defined in script.js:
// bst, treeContainer, animationSpeed, pausableSleep, statusAnnouncer,
// bstInput, bstInsertBtn, bstSearchBtn, bstDeleteBtn

const NODE_DIAMETER = 40;
const HORIZONTAL_SPACING = 50;
const VERTICAL_SPACING = 70;

class TreeNode {
    constructor(value, id, depth = 0) {
        this.value = value;
        this.left = null;
        this.right = null;
        this.id = `node-${id}`;
        this.depth = depth;
        this.x = 0;
        this.y = 0;
        this.element = null;
        this.line = null;
    }
}

class BinarySearchTree {
    constructor() {
        this.root = null;
        this.nodeIdCounter = 0;
        this.isAnimating = false;
    }

    async insert(value) {
        if (this.isAnimating) return;
        this.isAnimating = true;
        value = parseInt(value);
        if (isNaN(value)) {
            alert("Please enter a valid number.");
            this.isAnimating = false;
            return;
        }

        if (this.root === null) {
            this.root = new TreeNode(value, this.nodeIdCounter++);
            await this.drawTree();
            this.isAnimating = false;
            return;
        }

        let current = this.root;
        while (true) {
            current.element.classList.add('visiting');
            await pausableSleep(animationSpeed * 5);

            if (value < current.value) {
                current.element.classList.remove('visiting');
                if (current.left === null) {
                    current.left = new TreeNode(value, this.nodeIdCounter++, current.depth + 1);
                    await this.drawTree();
                    break;
                }
                current = current.left;
            } else if (value > current.value) {
                current.element.classList.remove('visiting');
                if (current.right === null) {
                    current.right = new TreeNode(value, this.nodeIdCounter++, current.depth + 1);
                    await this.drawTree();
                    break;
                }
                current = current.right;
            } else {
                // Value already exists
                current.element.classList.remove('visiting');
                current.element.classList.add('found');
                await pausableSleep(animationSpeed * 10);
                current.element.classList.remove('found');
                break;
            }
        }
        this.isAnimating = false;
    }

    async search(value) {
        if (this.isAnimating) return;
        this.isAnimating = true;
        value = parseInt(value);
        if (isNaN(value)) {
            alert("Please enter a valid number.");
            this.isAnimating = false;
            return;
        }

        let current = this.root;
        while (current !== null) {
            current.element.classList.add('visiting');
            await pausableSleep(animationSpeed * 5);

            if (value === current.value) {
                current.element.classList.remove('visiting');
                current.element.classList.add('found');
                await pausableSleep(animationSpeed * 10);
                current.element.classList.remove('found');
                this.isAnimating = false;
                return current;
            }
            current.element.classList.remove('visiting');
            current = value < current.value ? current.left : current.right;
        }
        // Not found
        statusAnnouncer.textContent = `Value ${value} not found in tree.`;
        this.isAnimating = false;
        return null;
    }

    async delete(value) {
        if (this.isAnimating) return;
        this.isAnimating = true;
        value = parseInt(value);
        if (isNaN(value)) {
            alert("Please enter a valid number.");
            this.isAnimating = false;
            return;
        }

        this.root = await this.deleteNode(this.root, value);
        await this.drawTree();
        this.isAnimating = false;
    }

    async deleteNode(node, value) {
        if (node === null) {
            statusAnnouncer.textContent = `Value ${value} not found for deletion.`;
            return null;
        }

        node.element.classList.add('visiting');
        await pausableSleep(animationSpeed * 5);
        node.element.classList.remove('visiting');

        if (value < node.value) {
            node.left = await this.deleteNode(node.left, value);
            return node;
        } else if (value > node.value) {
            node.right = await this.deleteNode(node.right, value);
            return node;
        } else {
            // Node to be deleted found
            node.element.classList.add('found');
            await pausableSleep(animationSpeed * 5);

            // Case 1: No child or one child
            if (node.left === null) return node.right;
            if (node.right === null) return node.left;

            // Case 2: Two children
            let successor = node.right;
            while (successor.left !== null) {
                successor.element.classList.add('visiting');
                await pausableSleep(animationSpeed * 5);
                successor.element.classList.remove('visiting');
                successor = successor.left;
            }
            successor.element.classList.add('found');
            await pausableSleep(animationSpeed * 5);

            node.value = successor.value; // Copy successor's value to this node
            node.right = await this.deleteNode(node.right, successor.value); // Delete the successor
            
            successor.element.classList.remove('found');
            return node;
        }
    }

    async drawTree() {
        treeContainer.innerHTML = '';
        if (this.root === null) return;

        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        treeContainer.appendChild(svg);

        this.calculatePositions();

        const queue = [this.root];
        while (queue.length > 0) {
            const node = queue.shift();
            
            // Create node element
            const nodeEl = document.createElement('div');
            nodeEl.classList.add('tree-node');
            nodeEl.id = node.id;
            nodeEl.innerText = node.value;
            nodeEl.style.left = `${node.x}px`;
            nodeEl.style.top = `${node.y}px`;
            treeContainer.appendChild(nodeEl);
            node.element = nodeEl;

            // Create line element
            if (node.parent) {
                const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
                line.setAttribute('x1', node.parent.x);
                line.setAttribute('y1', node.parent.y);
                line.setAttribute('x2', node.x);
                line.setAttribute('y2', node.y);
                line.classList.add('tree-line');
                svg.appendChild(line);
                node.line = line;
            }

            if (node.left) {
                node.left.parent = node;
                queue.push(node.left);
            }
            if (node.right) {
                node.right.parent = node;
                queue.push(node.right);
            }
        }
    }

    calculatePositions() {
        if (this.root === null) return;
        const containerWidth = treeContainer.clientWidth;
        
        let positions = {};
        let nextX = 0;
        // First pass: in-order traversal to determine relative X positions
        function assignX(curr) {
            if (curr === null) return;
            assignX(curr.left);
            positions[curr.id] = nextX;
            nextX += HORIZONTAL_SPACING;
            assignX(curr.right);
        }
        assignX(this.root);

        // The total width of the tree is the final nextX value
        const xOffset = (containerWidth - nextX) / 2;

        // Second pass: assign final X and Y positions
        function assignPositions(curr, depth) {
            if (curr === null) return;
            curr.x = positions[curr.id] + xOffset;
            curr.y = (depth * VERTICAL_SPACING) + 50;
            curr.depth = depth;
            assignPositions(curr.left, depth + 1);
            assignPositions(curr.right, depth + 1);
        }
        assignPositions(this.root, 0);
    }
}

function initBstVisualizer() {
    bst = new BinarySearchTree();

    bstInsertBtn.addEventListener('click', () => {
        if (bst && bstInput.value) {
            bst.insert(bstInput.value);
            bstInput.value = '';
        }
    });

    bstSearchBtn.addEventListener('click', () => {
        if (bst && bstInput.value) {
            bst.search(bstInput.value);
            bstInput.value = '';
        }
    });

    bstDeleteBtn.addEventListener('click', () => {
        if (bst && bstInput.value) {
            bst.delete(bstInput.value);
            bstInput.value = '';
        }
    });
}