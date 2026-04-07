// --- DOM Element Selection ---
const arrayContainer = document.getElementById('array-container');
const generateArrayBtn = document.getElementById('generate-array');
const sortBtn = document.getElementById('sort-btn');
const visualizerSelect = document.getElementById('visualizer-select');
const sortingVisualizer = document.getElementById('sorting-visualizer');
const bstVisualizer = document.getElementById('bst-visualizer');
const bstInput = document.getElementById('bst-input');
const bstInsertBtn = document.getElementById('bst-insert');
const bstGenerateBtn = document.getElementById('bst-generate');
const bstSearchBtn = document.getElementById('bst-search');
const bstDeleteBtn = document.getElementById('bst-delete');
const bstClearBtn = document.getElementById('bst-clear');
const treeContainer = document.getElementById('tree-container');
const algorithmSelect = document.getElementById('algorithm-select');
const pauseResumeBtn = document.getElementById('pause-resume-btn');
const stopBtn = document.getElementById('stop-btn');
const resetBtn = document.getElementById('reset-btn');
const speedSlider = document.getElementById('speed');
const sizeSlider = document.getElementById('size');
const sizeValueLabel = document.getElementById('size-value');
const speedValueLabel = document.getElementById('speed-value');
const algoDescription = document.getElementById('algo-description');
const statusAnnouncer = document.getElementById('status-announcer');
const timeComplexity = document.getElementById('time-complexity');
const iterationCounter = document.getElementById('iteration-counter');

// --- Global State ---
let array = [];
let animationSpeed = 50;
let arraySize = 50;
let comparisonCount = 0;
let isPaused = false;
let stopSignal = false;
let bst = null; // To hold the BinarySearchTree instance

// --- Constants ---
const DEFAULTS = {
    SIZE: 50,
    SPEED: 50,
    ALGO_INDEX: 0
};

// A map to store algorithm names and their corresponding functions
// Note: The 'algorithms' map is now defined in sorting.js

// --- Core Logic ---

// Utility function to sleep/pause execution for animation
async function pausableSleep(ms) {
    // If a stop is signaled, throw an error to exit the algorithm
    if (stopSignal) throw new Error("SortStopped");
    // This loop will continuously check the pause state
    while (isPaused) {
        // A short delay to prevent the loop from freezing the browser
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    // Once unpaused, perform the original animation delay
    if (ms > 0) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// --- UI and Event Listeners ---

function switchVisualizer(visualizerType) {
    // Update the dropdown to reflect the current view
    visualizerSelect.value = visualizerType;

    if (visualizerType === 'sorting') {
        sortingVisualizer.classList.remove('hidden');
        bstVisualizer.classList.add('hidden');
    } else { // 'bst'
        sortingVisualizer.classList.add('hidden');
        bstVisualizer.classList.remove('hidden');
        if (bst === null) {
            // The BST is initialized only when first switched to.
            initBstVisualizer();
        }
    }
}

visualizerSelect.addEventListener('change', (e) => {
    const selectedVisualizer = e.target.value;
    localStorage.setItem('selectedVisualizer', selectedVisualizer);
    switchVisualizer(selectedVisualizer);
});

// Initial setup when the page loads
window.onload = () => {
    // Always initialize the sorting visualizer as it's the default and its controls are part of the main UI
    initSortingVisualizer();

    const savedVisualizer = localStorage.getItem('selectedVisualizer');
    switchVisualizer(savedVisualizer || 'sorting');
};