// Assumes globals from script.js: pausableSleep, statusAnnouncer

let huffmanAnimationSpeed = 50;
let huffmanDecodeSpeed = 50;

class HuffmanNode {
    constructor(char, freq, left = null, right = null) {
        this.char = char;
        this.freq = freq;
        this.left = left;
        this.right = right;
        this.id = `hnode-${Math.random().toString(36).substr(2, 9)}`;
        this.x = 0;
        this.y = 0;
        this.element = null;
        this.lineLeft = null;
        this.lineRight = null;
        this.labelLeft = null;
        this.labelRight = null;
    }
}

class HuffmanTree {
    constructor() {
        this.root = null;
        this.container = document.getElementById('huffman-tree-container');
        this.tableBody = document.querySelector('#huffman-table tbody');
        this.scanner = document.getElementById('huffman-text-scanner');
        this.decodeScanner = document.getElementById('huffman-decode-scanner');
        this.decodeInput = document.getElementById('huffman-decode-input');
        this.decodeBtn = document.getElementById('huffman-decode-btn');
        this.decodedOutput = document.getElementById('huffman-decoded-output');
        this.codes = {};
        this.isAnimating = false;
        this.instantMode = false;
        this.currentSpeed = 50;
    }

    async sleep(factor = 9) {
        if (!this.instantMode) {
            await pausableSleep(Math.max(50, 1000 - this.currentSpeed * factor));
        }
    }

    async buildTree(text, instant = false) {
        if (this.isAnimating) return;
        this.isAnimating = true;
        this.instantMode = instant;
        this.currentSpeed = huffmanAnimationSpeed;

        this.container.innerHTML = '';
        this.tableBody.innerHTML = '';
        document.getElementById('huffman-output-text').textContent = '';
        document.getElementById('huffman-orig-size').textContent = '0';
        document.getElementById('huffman-comp-size').textContent = '0';
        
        this.contentWrapper = document.createElement('div');
        this.contentWrapper.style.position = 'relative';
        this.container.appendChild(this.contentWrapper);

        this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.svg.style.overflow = 'visible';
        this.svg.style.position = 'absolute';
        this.svg.style.top = '0';
        this.svg.style.left = '0';
        this.svg.style.width = '100%';
        this.svg.style.height = '100%';
        this.svg.style.pointerEvents = 'none';
        this.contentWrapper.appendChild(this.svg);

        // --- 1. Scanning Phase ---
        this.scanner.style.color = '#333';
        this.scanner.innerHTML = '';

        const spans = [];
        for (let char of text) {
            const span = document.createElement('span');
            span.textContent = char === ' ' ? '\u00A0' : char; // Non-breaking space for visibility
            span.style.padding = '0 2px';
            span.style.borderRadius = '3px';
            span.style.transition = 'background-color 0.2s';
            this.scanner.appendChild(span);
            spans.push(span);
        }

        let forest = [];
        const nodeMap = {};

        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            
            // Highlight span
            spans[i].style.backgroundColor = '#ffc107';
            spans[i].style.color = '#fff';

            if (nodeMap[char]) {
                nodeMap[char].freq += 1;
                if(nodeMap[char].element) {
                    nodeMap[char].element.style.transform = 'translate(-50%, -50%) scale(1.2)';
                    nodeMap[char].element.style.borderColor = '#ffc107';
                }
            } else {
                const newNode = new HuffmanNode(char, 1);
                nodeMap[char] = newNode;
                forest.push(newNode);
            }

            this.drawForest(forest);
            
            await this.sleep(9);

            // Reset highlight
            spans[i].style.backgroundColor = 'transparent';
            spans[i].style.color = 'inherit';
            if (nodeMap[char].element) {
                nodeMap[char].element.style.transform = 'translate(-50%, -50%) scale(1)';
                nodeMap[char].element.style.borderColor = '#8a4a4a';
            }
        }
        
        // Delay after scanning completes
        await this.sleep(9);

        if (forest.length === 0) {
            this.isAnimating = false;
            return;
        }
        
        if (forest.length === 1) {
            forest.push(new HuffmanNode('EOF', 1));
        }

        // --- 2. Build Tree Phase ---
        while (forest.length > 1) {
            forest.sort((a, b) => a.freq - b.freq);

            this.drawForest(forest);
            await this.sleep(8);

            const left = forest.shift();
            const right = forest.shift();

            if(left.element) { left.element.style.borderColor = '#ffc107'; left.element.style.borderWidth = '3px'; }
            if(right.element) { right.element.style.borderColor = '#ffc107'; right.element.style.borderWidth = '3px'; }
            await this.sleep(8);

            const parent = new HuffmanNode(left.char + right.char, left.freq + right.freq, left, right);
            forest.push(parent);

            this.drawForest(forest, parent);
            
            if(left.element) { left.element.style.borderColor = '#8a4a4a'; left.element.style.borderWidth = '2px'; }
            if(right.element) { right.element.style.borderColor = '#8a4a4a'; right.element.style.borderWidth = '2px'; }
            
            await this.sleep(8);
        }

        this.root = forest[0];
        if (this.root.element) {
            this.root.element.classList.remove('merged');
            this.root.element.style.backgroundColor = '#28a745';
            this.root.element.style.borderColor = '#1e7e34';
        }
        
        this.drawForest([this.root]);

        // --- 3. Encoding and Table ---
        this.codes = {};
        this.generateCodes(this.root, "");
        this.populateTable(text);

        let encodedStr = "";
        for (let char of text) {
            encodedStr += this.codes[char];
        }
        
        document.getElementById('huffman-output-text').textContent = encodedStr;
        
        const origSize = text.length * 8;
        const compSize = encodedStr.length;
        document.getElementById('huffman-orig-size').textContent = origSize;
        document.getElementById('huffman-comp-size').textContent = compSize;
        
        this.decodeInput.disabled = false;
        this.decodeBtn.disabled = false;
        this.decodeInput.value = encodedStr;

        this.isAnimating = false;
    }

    async decode(binaryStr, instant = false) {
        if (this.isAnimating || !this.root) return;
        this.isAnimating = true;
        this.instantMode = instant;
        this.currentSpeed = huffmanDecodeSpeed;
        this.decodedOutput.textContent = '';
        
        this.decodeScanner.style.color = '#333';
        this.decodeScanner.innerHTML = '';
        const spans = [];
        for (let bit of binaryStr) {
            const span = document.createElement('span');
            span.textContent = bit;
            span.style.padding = '0 2px';
            span.style.borderRadius = '3px';
            span.style.transition = 'background-color 0.2s';
            this.decodeScanner.appendChild(span);
            spans.push(span);
        }
        
        let currentNode = this.root;
        
        // Initial highlight of root
        if(currentNode.element) {
            currentNode.element.style.borderColor = '#28a745';
            currentNode.element.style.borderWidth = '4px';
        }
        await this.sleep(9);

        let currentBitGroup = [];

        for (let i = 0; i < binaryStr.length; i++) {
            let bit = binaryStr[i];
            
            // Un-highlight current
            if(currentNode.element) {
                currentNode.element.style.borderColor = currentNode === this.root ? '#1e7e34' : '#8a4a4a';
                currentNode.element.style.borderWidth = '2px';
            }
            
            if (bit === '0' && currentNode.left) {
                currentNode = currentNode.left;
            } else if (bit === '1' && currentNode.right) {
                currentNode = currentNode.right;
            } else {
                // Invalid bit or invalid tree path, abort
                break;
            }
            
            // Highlight bit in scanner
            spans[i].style.backgroundColor = '#ffc107';
            spans[i].style.color = '#fff';
            currentBitGroup.push(spans[i]);
            
            // Highlight current
            if(currentNode.element) {
                currentNode.element.style.borderColor = '#28a745';
                currentNode.element.style.borderWidth = '4px';
            }
            await this.sleep(9);
            
            // If leaf node
            if (!currentNode.left && !currentNode.right) {
                // Flash leaf
                if(currentNode.element) {
                    currentNode.element.style.transform = 'translate(-50%, -50%) scale(1.2)';
                    currentNode.element.style.backgroundColor = '#ffc107';
                }
                
                if (currentNode.char !== 'EOF') {
                    this.decodedOutput.textContent += currentNode.char;
                }
                
                await this.sleep(9);
                
                // Reset leaf
                if(currentNode.element) {
                    currentNode.element.style.transform = 'translate(-50%, -50%) scale(1)';
                    currentNode.element.style.backgroundColor = 'white';
                    currentNode.element.style.borderColor = '#8a4a4a';
                    currentNode.element.style.borderWidth = '2px';
                }
                
                // Clear highlighted bit group
                for (let s of currentBitGroup) {
                    s.style.backgroundColor = 'transparent';
                    s.style.color = 'inherit';
                }
                currentBitGroup = [];
                
                // Reset to root
                currentNode = this.root;
                if(currentNode.element) {
                    currentNode.element.style.borderColor = '#28a745';
                    currentNode.element.style.borderWidth = '4px';
                }
                await this.sleep(9);
            }
        }
        
        // Final cleanup
        if(currentNode && currentNode.element) {
            currentNode.element.style.borderColor = currentNode === this.root ? '#1e7e34' : '#8a4a4a';
            currentNode.element.style.borderWidth = '2px';
        }
        
        await this.sleep(9);
        
        this.isAnimating = false;
    }

    generateCodes(node, prefix) {
        if (!node) return;
        if (!node.left && !node.right) {
            this.codes[node.char] = prefix;
            return;
        }
        this.generateCodes(node.left, prefix + "0");
        this.generateCodes(node.right, prefix + "1");
    }

    populateTable(text) {
        const freqs = {};
        for (let char of text) freqs[char] = (freqs[char] || 0) + 1;
        
        for (let char in freqs) {
            const tr = document.createElement('tr');
            const displayChar = char === ' ' ? 'Space' : char;
            tr.innerHTML = `
                <td>'${displayChar}'</td>
                <td>${freqs[char]}</td>
                <td><strong style="color: #4a4a8a;">${this.codes[char]}</strong></td>
            `;
            this.tableBody.appendChild(tr);
        }
    }

    drawForest(forest, newParent = null) {
        const spacing = 60;
        let nextX = 50;
        const positions = {};
        
        const assignX = (node) => {
            if (!node) return;
            assignX(node.left);
            positions[node.id] = nextX;
            nextX += spacing;
            assignX(node.right);
        };
        
        forest.forEach(root => assignX(root));
        const totalWidth = nextX;

        const getDepth = (node) => {
            if (!node) return 0;
            return 1 + Math.max(getDepth(node.left), getDepth(node.right));
        };
        const maxDepth = Math.max(0, ...forest.map(getDepth));
        const requiredHeight = maxDepth * 60 + 100;

        const containerWidth = this.container.clientWidth;
        
        // Native scroll scaling
        const logicalWidth = Math.max(containerWidth, totalWidth + 50);
        
        this.contentWrapper.style.width = `${logicalWidth}px`;
        this.contentWrapper.style.height = `${Math.max(this.container.clientHeight, requiredHeight)}px`;

        const offsetX = Math.max(0, (logicalWidth - totalWidth) / 2);

        const assignY = (node, depth) => {
            if (!node) return;
            node.x = positions[node.id] + offsetX;
            node.y = depth * 60 + 50;
            assignY(node.left, depth + 1);
            assignY(node.right, depth + 1);
        };
        
        forest.forEach(root => assignY(root, 0));
        
        const traverseAndDraw = (node) => {
            if (!node) return;
            
            if (!node.element) {
                node.element = document.createElement('div');
                node.element.classList.add('huffman-node');
                if (node === newParent) {
                    node.element.classList.add('merged');
                }
                
                let charDisplay = (!node.left && !node.right) ? (node.char === ' ' ? "'Spc'" : `'${node.char}'`) : "";
                
                node.element.innerHTML = `<span class="char">${charDisplay}</span><span class="freq">${node.freq}</span>`;
                this.contentWrapper.appendChild(node.element);
            } else if (node === newParent) {
                 node.element.classList.add('merged');
            }
            
            // Only update freq display if it's a leaf node to show the scan count dynamically
            if (!node.left && !node.right) {
                 node.element.querySelector('.freq').textContent = node.freq;
            }
            
            node.element.style.left = `${node.x}px`;
            node.element.style.top = `${node.y}px`;
            
            if (node.left) {
                if (!node.lineLeft) {
                    node.lineLeft = document.createElementNS("http://www.w3.org/2000/svg", "line");
                    node.lineLeft.classList.add('tree-line');
                    node.lineLeft.setAttribute('x1', node.x);
                    node.lineLeft.setAttribute('y1', node.y);
                    node.lineLeft.setAttribute('x2', node.left.x);
                    node.lineLeft.setAttribute('y2', node.left.y);
                    this.svg.appendChild(node.lineLeft);
                } else {
                    node.lineLeft.setAttribute('x1', node.x);
                    node.lineLeft.setAttribute('y1', node.y);
                    node.lineLeft.setAttribute('x2', node.left.x);
                    node.lineLeft.setAttribute('y2', node.left.y);
                }
                
                if (!node.labelLeft) {
                    node.labelLeft = document.createElement('div');
                    node.labelLeft.classList.add('edge-label');
                    node.labelLeft.textContent = '0';
                    node.labelLeft.style.left = `${(node.x + node.left.x) / 2}px`;
                    node.labelLeft.style.top = `${(node.y + node.left.y) / 2}px`;
                    this.contentWrapper.appendChild(node.labelLeft);
                } else {
                    node.labelLeft.style.left = `${(node.x + node.left.x) / 2}px`;
                    node.labelLeft.style.top = `${(node.y + node.left.y) / 2}px`;
                }
            }
            if (node.right) {
                if (!node.lineRight) {
                    node.lineRight = document.createElementNS("http://www.w3.org/2000/svg", "line");
                    node.lineRight.classList.add('tree-line');
                    node.lineRight.setAttribute('x1', node.x);
                    node.lineRight.setAttribute('y1', node.y);
                    node.lineRight.setAttribute('x2', node.right.x);
                    node.lineRight.setAttribute('y2', node.right.y);
                    this.svg.appendChild(node.lineRight);
                } else {
                    node.lineRight.setAttribute('x1', node.x);
                    node.lineRight.setAttribute('y1', node.y);
                    node.lineRight.setAttribute('x2', node.right.x);
                    node.lineRight.setAttribute('y2', node.right.y);
                }
                
                if (!node.labelRight) {
                    node.labelRight = document.createElement('div');
                    node.labelRight.classList.add('edge-label');
                    node.labelRight.textContent = '1';
                    node.labelRight.style.left = `${(node.x + node.right.x) / 2}px`;
                    node.labelRight.style.top = `${(node.y + node.right.y) / 2}px`;
                    this.contentWrapper.appendChild(node.labelRight);
                } else {
                    node.labelRight.style.left = `${(node.x + node.right.x) / 2}px`;
                    node.labelRight.style.top = `${(node.y + node.right.y) / 2}px`;
                }
            }
            
            traverseAndDraw(node.left);
            traverseAndDraw(node.right);
        };
        
        forest.forEach(root => traverseAndDraw(root));
    }
}

function initHuffmanVisualizer() {
    huffmanTree = new HuffmanTree();
    
    const genBtn = document.getElementById('huffman-generate');
    const clearBtn = document.getElementById('huffman-clear-btn');
    const input = document.getElementById('huffman-input');
    const speedSlider = document.getElementById('huffman-speed');
    const speedValue = document.getElementById('huffman-speed-value');
    
    const decodeSpeedSlider = document.getElementById('huffman-decode-speed');
    const decodeSpeedValue = document.getElementById('huffman-decode-speed-value');
    
    const savedSpeed = localStorage.getItem('huffmanSpeed');
    const savedDecodeSpeed = localStorage.getItem('huffmanDecodeSpeed');
    
    if (savedSpeed) {
        huffmanAnimationSpeed = parseInt(savedSpeed);
        speedSlider.value = huffmanAnimationSpeed;
        speedValue.textContent = huffmanAnimationSpeed;
    } else {
        huffmanAnimationSpeed = parseInt(speedSlider.value);
    }
    
    if (savedDecodeSpeed) {
        huffmanDecodeSpeed = parseInt(savedDecodeSpeed);
        decodeSpeedSlider.value = huffmanDecodeSpeed;
        decodeSpeedValue.textContent = huffmanDecodeSpeed;
    } else {
        huffmanDecodeSpeed = parseInt(decodeSpeedSlider.value);
    }
    
    speedSlider.addEventListener('input', (e) => {
        huffmanAnimationSpeed = parseInt(e.target.value);
        speedValue.textContent = huffmanAnimationSpeed;
        localStorage.setItem('huffmanSpeed', huffmanAnimationSpeed);
    });

    decodeSpeedSlider.addEventListener('input', (e) => {
        huffmanDecodeSpeed = parseInt(e.target.value);
        decodeSpeedValue.textContent = huffmanDecodeSpeed;
        localStorage.setItem('huffmanDecodeSpeed', huffmanDecodeSpeed);
    });

    genBtn.addEventListener('click', async () => {
        const text = input.value;
        if (!text) {
            alert("Please enter text to encode.");
            return;
        }
        
        localStorage.setItem('huffmanInputText', text);
        localStorage.removeItem('huffmanDecodeText');
        
        genBtn.disabled = true;
        huffmanTree.decodeInput.disabled = true;
        huffmanTree.decodeBtn.disabled = true;
        
        try {
            await huffmanTree.buildTree(text);
        } catch (e) {
            if (e.message !== "SortStopped") {
                console.error("Huffman encoding error:", e);
            }
        } finally {
            genBtn.disabled = false;
            huffmanTree.isAnimating = false;
        }
    });

    const decodeBtn = document.getElementById('huffman-decode-btn');
    const decodeInput = document.getElementById('huffman-decode-input');
    
    decodeBtn.addEventListener('click', async () => {
        const binStr = decodeInput.value;
        if (!binStr) return;
        
        localStorage.setItem('huffmanDecodeText', binStr);
        
        decodeBtn.disabled = true;
        genBtn.disabled = true;
        
        try {
            await huffmanTree.decode(binStr);
        } catch (e) {
            if (e.message !== "SortStopped") {
                console.error("Huffman decoding error:", e);
            }
        } finally {
            decodeBtn.disabled = false;
            genBtn.disabled = false;
            huffmanTree.isAnimating = false;
        }
    });

    clearBtn.addEventListener('click', () => {
        localStorage.removeItem('huffmanInputText');
        localStorage.removeItem('huffmanDecodeText');
        
        input.value = 'algorithm visualizer';
        huffmanTree.container.innerHTML = '';
        huffmanTree.tableBody.innerHTML = '';
        document.getElementById('huffman-output-text').textContent = '';
        document.getElementById('huffman-orig-size').textContent = '0';
        document.getElementById('huffman-comp-size').textContent = '0';
        huffmanTree.decodeInput.value = '';
        huffmanTree.decodeInput.disabled = true;
        huffmanTree.decodeBtn.disabled = true;
        huffmanTree.decodeScanner.innerHTML = 'Waiting for binary string...';
        huffmanTree.decodeScanner.style.color = '#aaa';
        huffmanTree.decodedOutput.textContent = '';
        huffmanTree.scanner.innerHTML = 'Enter text above and click Generate to begin...';
        huffmanTree.scanner.style.color = '#aaa';
        
        huffmanTree.root = null;
        huffmanTree.codes = {};
        huffmanTree.isAnimating = false;
    });

    // Auto-restore
    const savedInput = localStorage.getItem('huffmanInputText');
    const savedDecode = localStorage.getItem('huffmanDecodeText');
    
    if (savedInput) {
        input.value = savedInput;
        setTimeout(async () => {
            genBtn.disabled = true;
            await huffmanTree.buildTree(savedInput, true);
            genBtn.disabled = false;
            
            if (savedDecode) {
                huffmanTree.decodeInput.value = savedDecode;
                decodeBtn.disabled = true;
                await huffmanTree.decode(savedDecode, true);
                decodeBtn.disabled = false;
            }
        }, 100);
    }
}
