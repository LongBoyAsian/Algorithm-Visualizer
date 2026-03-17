const arrayContainer = document.getElementById('array-container');
const generateArrayBtn = document.getElementById('generate-array');
const sortBtn = document.getElementById('sort-btn');
const algorithmSelect = document.getElementById('algorithm-select');
const pauseResumeBtn = document.getElementById('pause-resume-btn');
const stopBtn = document.getElementById('stop-btn');
const resetBtn = document.getElementById('reset-btn');
const speedSlider = document.getElementById('speed');
const sizeSlider = document.getElementById('size');
const sizeValueLabel = document.getElementById('size-value');
const speedValueLabel = document.getElementById('speed-value');
const algoDescription = document.getElementById('algo-description');
const timeComplexity = document.getElementById('time-complexity');
const iterationCounter = document.getElementById('iteration-counter');

let array = [];
let animationSpeed = 50;
let arraySize = 50;
let comparisonCount = 0;
let isPaused = false;
let stopSignal = false;

const DEFAULTS = {
    SIZE: 50,
    SPEED: 50,
    ALGO_INDEX: 0
};

// A map to store algorithm names and their corresponding functions
const algorithms = {
    "Bubble Sort": {
        func: bubbleSort,
        description: "Bubble Sort is a simple sorting algorithm that repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order. The pass through the list is repeated until the list is sorted.",
        complexity: "O(n²)"
    },
    // When you add Quick Sort, you'll just add a line here:
    // "Quick Sort": { func: quickSort, description: "...", complexity: "O(n log n)" }, 
};

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

// Function to generate a new random array and render it as bars
function generateArray() {
    array = [];
    arrayContainer.innerHTML = '';

    // Reset comparison counter on new array generation
    comparisonCount = 0;
    iterationCounter.innerText = comparisonCount;
    
    // Create an array of `arraySize` random numbers
    for (let i = 0; i < arraySize; i++) {
        // Generate random numbers between 5 and 100 for varied bar heights
        array.push(Math.floor(Math.random() * 95) + 5);
    }

    // Calculate width for each bar based on the array size and container width
    const barWidth = (arrayContainer.clientWidth / arraySize) - 2; // Subtract 2 for 1px margin on each side

    // Create a div element (a "bar") for each number in the array
    for (let i = 0; i < array.length; i++) {
        const bar = document.createElement('div');
        bar.style.height = `${array[i] * 4}px`; // Scale height for better visualization
        bar.style.width = `${barWidth}px`;
        bar.classList.add('array-bar');
        arrayContainer.appendChild(bar);
    }
    enableControls();
}

// Function to disable controls during sorting to prevent interference
function disableControls() {
    generateArrayBtn.disabled = true;
    sortBtn.disabled = true;
    algorithmSelect.disabled = true;
    sizeSlider.disabled = true;
    pauseResumeBtn.style.display = 'inline-block';
    stopBtn.style.display = 'inline-block';
    pauseResumeBtn.innerText = 'Pause';
    isPaused = false;
    stopSignal = false; // Reset stop signal at the start of every sort
}

// Function to re-enable controls after sorting is complete
function enableControls() {
    generateArrayBtn.disabled = false;
    sortBtn.disabled = false;
    algorithmSelect.disabled = false;
    sizeSlider.disabled = false;
    pauseResumeBtn.style.display = 'none';
    stopBtn.style.display = 'none';
    isPaused = false;
}

// Resets all bars to their default color
function resetAllBarColors() {
    const bars = document.getElementsByClassName('array-bar');
    for (const bar of bars) {
        bar.classList.remove('comparing', 'swapping', 'sorted');
    }
}

// --- Sorting Algorithms ---
// Visually swap two bars in the DOM by swapping their heights
function swapBars(bar1, bar2) {
    const tempHeight = bar1.style.height;
    bar1.style.height = bar2.style.height;
    bar2.style.height = tempHeight;
}

// Bubble Sort Algorithm Visualization
async function bubbleSort() {
    const bars = document.getElementsByClassName('array-bar');
    const n = array.length;

    for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            // Highlight bars being compared with 'comparing' class
            bars[j].classList.add('comparing');
            bars[j + 1].classList.add('comparing');

            // Increment and update counter for each comparison
            comparisonCount++;
            iterationCounter.innerText = comparisonCount;

            // Pause execution to make the comparison visible
            await pausableSleep(animationSpeed);

            if (array[j] > array[j + 1]) {
                // Highlight bars being swapped with 'swapping' class
                bars[j].classList.add('swapping');
                bars[j + 1].classList.add('swapping');
                await pausableSleep(animationSpeed);

                // Swap the values in the underlying array
                [array[j], array[j + 1]] = [array[j + 1], array[j]];
                
                // Swap the bars visually
                swapBars(bars[j], bars[j + 1]);
                await pausableSleep(animationSpeed);
            }

            // Remove highlights after comparison/swap
            bars[j].classList.remove('comparing', 'swapping');
            bars[j + 1].classList.remove('comparing', 'swapping');
        }
        // Mark the last bar in the pass as sorted
        bars[n - 1 - i].classList.add('sorted');
    }
    // Mark the first bar as sorted (it's sorted by the end of the loop)
    if (n > 0) {
        bars[0].classList.add('sorted');
    }

}

// --- UI and Event Listeners ---

// Function to populate the algorithm selection dropdown
function populateAlgorithmOptions() {
    for (const algoName in algorithms) {
        const option = document.createElement('option');
        option.value = algoName;
        option.innerText = algoName;
        algorithmSelect.appendChild(option);
    }
}

// Updates the info panel with details of the selected algorithm
function updateInfoPanel() {
    const selectedAlgorithmName = algorithmSelect.value;
    const algoData = algorithms[selectedAlgorithmName];
    if (algoData) {
        algoDescription.innerText = algoData.description;
        timeComplexity.innerText = algoData.complexity;
    }
}

// Generic function to start the selected sorting algorithm
async function startSort() {
    comparisonCount = 0;
    iterationCounter.innerText = comparisonCount;
    
    disableControls();
    const selectedAlgorithmName = algorithmSelect.value;

    if (algorithms[selectedAlgorithmName]) {
        try {
            await algorithms[selectedAlgorithmName].func();
        } catch (e) {
            if (e.message !== "SortStopped") {
                throw e; // Re-throw any unexpected errors
            }
            // If the error is our specific "SortStopped" signal, we handle it.
            console.log("Sort stopped by user.");
            resetAllBarColors(); // Clean up partial coloring
        } finally {
            // This block runs whether the sort finished or was stopped
            enableControls();
        }
    }
}

generateArrayBtn.addEventListener('click', generateArray);
sortBtn.addEventListener('click', startSort);
resetBtn.addEventListener('click', resetToDefaults);
pauseResumeBtn.addEventListener('click', () => {
    isPaused = !isPaused;
    pauseResumeBtn.innerText = isPaused ? 'Resume' : 'Pause';
});
stopBtn.addEventListener('click', () => {
    stopSignal = true;
    // If paused, un-pause to allow the algorithm to hit the stop signal check
    isPaused = false; 
});
algorithmSelect.addEventListener('change', updateInfoPanel);

/**
 * A helper function to set up a range slider's event listener.
 * It updates a label with the slider's value and runs a custom callback.
 * @param {object} config
 * @param {HTMLInputElement} config.slider The slider element.
 * @param {HTMLElement} config.label The element to display the value in.
 * @param {function(string): void} config.onUpdate A callback function to run on update.
 */
function setupSlider({ slider, label, onUpdate }) {
    slider.addEventListener('input', (e) => {
        const value = e.target.value;
        label.innerText = value;
        onUpdate(value);
    });
}

// Initial setup when the page loads
window.onload = () => {
    populateAlgorithmOptions();

    // Setup slider event listeners for subsequent changes
    setupSlider({
        slider: sizeSlider,
        label: sizeValueLabel,
        onUpdate: (value) => {
            arraySize = parseInt(value);
            generateArray();
        }
    });
    setupSlider({
        slider: speedSlider,
        label: speedValueLabel,
        onUpdate: (value) => {
            animationSpeed = 101 - parseInt(value);
        }
    });

    // Set the initial state of the application to the defaults
    resetToDefaults();
};