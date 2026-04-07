// This file assumes the following globals are defined in script.js:
// arrayContainer, generateArrayBtn, sortBtn, algorithmSelect, pauseResumeBtn, stopBtn, resetBtn,
// speedSlider, sizeSlider, sizeValueLabel, speedValueLabel, algoDescription, statusAnnouncer,
// timeComplexity, iterationCounter, array, animationSpeed, arraySize, comparisonCount,
// isPaused, stopSignal, DEFAULTS, pausableSleep

// A map to store algorithm names and their corresponding functions
const algorithms = {
    "Bubble Sort": {
        func: bubbleSort,
        description: "Bubble Sort is a simple sorting algorithm that repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order. The pass through the list is repeated until the list is sorted.\n\nWhen to use: Best for small or nearly-sorted datasets where simplicity is more important than speed.\n\nWhy: It's easy to understand and implement, but its O(n²) complexity makes it very slow for large, random lists.",
        complexity: "O(n²)"
    },
    "Quick Sort": {
        func: quickSort,
        description: "Quick Sort is an efficient, divide-and-conquer sorting algorithm. It works by selecting a 'pivot' element and partitioning the other elements into two sub-arrays, according to whether they are less than or greater than the pivot.\n\nWhen to use: Excellent for large, unsorted datasets where performance is critical.\n\nWhy: It has a very fast average-case performance of O(n log n). However, it's not a stable sort, and its worst-case performance is O(n²), though this is rare with good pivot selection.",
        complexity: "O(n log n)"
    },
    "Merge Sort": {
        func: mergeSort,
        description: "Merge Sort is an efficient, stable, divide-and-conquer sorting algorithm. It works by recursively dividing the unsorted list into n sub-lists, each containing one element, and then repeatedly merging sub-lists to produce new sorted sub-lists until there is only one sub-list remaining.\n\nWhen to use: Ideal for situations where data stability (preserving the order of equal elements) is required, or for sorting large datasets that may not fit into memory (external sorting).\n\nWhy: It guarantees O(n log n) performance in all cases and is stable. Its main drawback is that it requires extra memory (O(n)).",
        complexity: "O(n log n)"
    },
    "Heap Sort": {
        func: heapSort,
        description: "Heap Sort is a comparison-based sorting algorithm that uses a binary heap data structure. It first builds a max-heap from the input data, then repeatedly extracts the maximum element from the heap and moves it to the sorted portion of the array.\n\nWhen to use: A great choice when you need guaranteed O(n log n) performance but cannot afford the extra memory usage of Merge Sort.\n\nWhy: It provides consistent O(n log n) time complexity and sorts in-place (O(1) extra space). It is not a stable sort.",
        complexity: "O(n log n)"
    }
};

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

// Quick Sort Algorithm Visualization
async function quickSort() {
    const bars = document.getElementsByClassName('array-bar');
    await quickSortRecursive(bars, 0, array.length - 1);

    // Final sweep to mark all as sorted
    for (let i = 0; i < bars.length; i++) {
        await pausableSleep(10);
        bars[i].classList.remove('comparing', 'pivot');
        bars[i].classList.add('sorted');
    }
}

async function quickSortRecursive(bars, low, high) {
    if (low < high) {
        let pivotIndex = await partition(bars, low, high);
        await quickSortRecursive(bars, low, pivotIndex - 1);
        await quickSortRecursive(bars, pivotIndex + 1, high);
    }
}

async function partition(bars, low, high) {
    let pivot = array[high];
    bars[high].classList.add('pivot');

    let i = low - 1;

    for (let j = low; j < high; j++) {
        bars[j].classList.add('comparing');
        comparisonCount++;
        iterationCounter.innerText = comparisonCount;
        await pausableSleep(animationSpeed);

        if (array[j] < pivot) {
            i++;
            bars[i].classList.add('swapping');
            bars[j].classList.add('swapping');
            await pausableSleep(animationSpeed);

            [array[i], array[j]] = [array[j], array[i]];
            swapBars(bars[i], bars[j]);
            await pausableSleep(animationSpeed);
            bars[i].classList.remove('swapping');
            bars[j].classList.remove('swapping');
        }
        bars[j].classList.remove('comparing');
    }

    bars[i + 1].classList.add('swapping');
    bars[high].classList.add('swapping');
    await pausableSleep(animationSpeed);

    [array[i + 1], array[high]] = [array[high], array[i + 1]];
    swapBars(bars[i + 1], bars[high]);
    await pausableSleep(animationSpeed);

    bars[high].classList.remove('pivot');
    bars[i + 1].classList.remove('swapping');
    bars[high].classList.remove('swapping');

    return i + 1;
}

// Merge Sort Algorithm Visualization
async function mergeSort() {
    const bars = document.getElementsByClassName('array-bar');
    await mergeSortRecursive(bars, 0, array.length - 1);

    // Final sweep to mark all as sorted
    for (let i = 0; i < bars.length; i++) {
        await pausableSleep(10);
        bars[i].classList.add('sorted');
    }
}

async function mergeSortRecursive(bars, left, right) {
    if (left >= right) {
        return;
    }
    const mid = Math.floor((left + right) / 2);
    await mergeSortRecursive(bars, left, mid);
    await mergeSortRecursive(bars, mid + 1, right);
    await merge(bars, left, mid, right);
}

async function merge(bars, left, mid, right) {
    let n1 = mid - left + 1;
    let n2 = right - mid;

    let leftArray = new Array(n1);
    let rightArray = new Array(n2);

    for (let i = 0; i < n1; i++) leftArray[i] = array[left + i];
    for (let j = 0; j < n2; j++) rightArray[j] = array[mid + 1 + j];

    let i = 0, j = 0, k = left;

    while (i < n1 && j < n2) {
        comparisonCount++;
        iterationCounter.innerText = comparisonCount;
        bars[k].classList.add('comparing');
        await pausableSleep(animationSpeed);

        if (leftArray[i] <= rightArray[j]) {
            array[k] = leftArray[i];
            bars[k].style.height = `${leftArray[i] * 4}px`;
            i++;
        } else {
            array[k] = rightArray[j];
            bars[k].style.height = `${rightArray[j] * 4}px`;
            j++;
        }
        bars[k].classList.remove('comparing');
        k++;
    }

    while (i < n1) array[k++] = leftArray[i++];
    while (j < n2) array[k++] = rightArray[j++];

    // Visually update the remaining bars that were copied without comparison
    for (let idx = left; idx <= right; idx++) {
        bars[idx].style.height = `${array[idx] * 4}px`;
    }
}

// Heap Sort Algorithm Visualization
async function heapSort() {
    const bars = document.getElementsByClassName('array-bar');
    const n = array.length;

    // Build max heap (rearrange array)
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
        await heapify(bars, n, i);
    }

    // One by one extract an element from heap
    for (let i = n - 1; i > 0; i--) {
        // Move current root to end
        bars[0].classList.add('swapping');
        bars[i].classList.add('swapping');
        await pausableSleep(animationSpeed);

        [array[0], array[i]] = [array[i], array[0]];
        swapBars(bars[0], bars[i]);
        
        await pausableSleep(animationSpeed);
        bars[0].classList.remove('swapping');
        bars[i].classList.remove('swapping');
        bars[i].classList.add('sorted');

        // call max heapify on the reduced heap
        await heapify(bars, i, 0);
    }

    if (n > 0) {
        bars[0].classList.add('sorted');
    }
}

async function heapify(bars, n, i) {
    let largest = i; // Initialize largest as root
    let left = 2 * i + 1;
    let right = 2 * i + 2;

    bars[i].classList.add('pivot'); // Use pivot color to show the root of the subtree

    // If left child is larger than root
    if (left < n) {
        bars[left].classList.add('comparing');
        await pausableSleep(animationSpeed);
        comparisonCount++;
        iterationCounter.innerText = comparisonCount;
        if (array[left] > array[largest]) {
            largest = left;
        }
        bars[left].classList.remove('comparing');
    }

    // If right child is larger than largest so far
    if (right < n) {
        bars[right].classList.add('comparing');
        await pausableSleep(animationSpeed);
        comparisonCount++;
        iterationCounter.innerText = comparisonCount;
        if (array[right] > array[largest]) {
            largest = right;
        }
        bars[right].classList.remove('comparing');
    }

    // If largest is not root
    if (largest !== i) {
        [array[i], array[largest]] = [array[largest], array[i]];
        swapBars(bars[i], bars[largest]);
        await pausableSleep(animationSpeed);
        await heapify(bars, n, largest);
    }
    bars[i].classList.remove('pivot');
}

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
        // Announce the change for screen readers if the panel is not focused
        if (document.activeElement !== algorithmSelect) {
            statusAnnouncer.textContent = `Selected ${selectedAlgorithmName}. Complexity: ${algoData.complexity}.`;
        }
        algoDescription.innerText = algoData.description;
        timeComplexity.innerText = algoData.complexity;
    }
}

// Generic function to start the selected sorting algorithm
async function startSort() {
    comparisonCount = 0;
    iterationCounter.innerText = comparisonCount;
    
    const selectedAlgorithmName = algorithmSelect.value;
    disableControls();
    statusAnnouncer.textContent = `Sort started using ${selectedAlgorithmName}.`;

    if (algorithms[selectedAlgorithmName]) {
        try {
            await algorithms[selectedAlgorithmName].func();
        } catch (e) {
            if (e.message !== "SortStopped") {
                throw e; // Re-throw any unexpected errors
            }
            // If the error is our specific "SortStopped" signal, we handle it.
            console.log("Sort stopped by user.");
            statusAnnouncer.textContent = 'Sort stopped by user.';
            resetAllBarColors(); // Clean up partial coloring
        } finally {
            // This block runs whether the sort finished or was stopped
            enableControls();
            // Announce completion only if it wasn't stopped
            if (!stopSignal) {
                statusAnnouncer.textContent = `Sort complete. Total comparisons: ${comparisonCount}.`;
            }
        }
    }
}

/**
 * A helper function to set up a range slider's event listener.
 * It updates a label with the slider's value and runs a custom callback.
 * @param {object} config
 * @param {HTMLInputElement} config.slider The slider element.
 * @param {HTMLElement} config.label The element to display the value in.
 * @param {function(string): void} config.onUpdate A callback function to run on update.
 * @param {(function(string): string)|undefined} config.formatValueText A function to format the aria-valuetext.
 */
function setupSlider({ slider, label, onUpdate, formatValueText }) {
    slider.addEventListener('input', (e) => {
        const value = e.target.value;
        label.innerText = value;
        if (formatValueText) {
            slider.setAttribute('aria-valuetext', formatValueText(value));
        }
        onUpdate(value);
    });
}

// Resets all controls and the array to their default initial state
function resetToDefaults() {
    // Set slider and select values
    sizeSlider.value = DEFAULTS.SIZE;
    speedSlider.value = DEFAULTS.SPEED;
    algorithmSelect.selectedIndex = DEFAULTS.ALGO_INDEX;

    // Update labels
    sizeValueLabel.innerText = DEFAULTS.SIZE;
    speedValueLabel.innerText = DEFAULTS.SPEED;

    // Update ARIA values
    sizeSlider.setAttribute('aria-valuetext', `${DEFAULTS.SIZE} elements`);
    speedSlider.setAttribute('aria-valuetext', `Speed ${DEFAULTS.SPEED}`);

    // Update global state
    arraySize = DEFAULTS.SIZE;
    animationSpeed = 101 - DEFAULTS.SPEED;

    // Update info panel
    updateInfoPanel();

    // Generate a new array with the default settings
    generateArray();
}

function initSortingVisualizer() {
    populateAlgorithmOptions();

    // Setup slider event listeners for subsequent changes
    setupSlider({
        slider: sizeSlider,
        label: sizeValueLabel,
        formatValueText: (value) => `${value} elements`,
        onUpdate: (value) => {
            arraySize = parseInt(value);
            generateArray();
        }
    });

    setupSlider({
        slider: speedSlider,
        label: speedValueLabel,
        formatValueText: (value) => `Speed ${value}`,
        onUpdate: (value) => {
            animationSpeed = 101 - parseInt(value);
        }
    });

    generateArrayBtn.addEventListener('click', generateArray);
    sortBtn.addEventListener('click', startSort);
    resetBtn.addEventListener('click', resetToDefaults);
    pauseResumeBtn.addEventListener('click', () => {
        isPaused = !isPaused;
        pauseResumeBtn.innerText = isPaused ? 'Resume' : 'Pause';
        pauseResumeBtn.setAttribute('aria-pressed', isPaused);
    });
    stopBtn.addEventListener('click', () => {
        stopSignal = true;
        // If paused, un-pause to allow the algorithm to hit the stop signal check
        isPaused = false; 
    });
    algorithmSelect.addEventListener('change', updateInfoPanel);

    // Set the initial state of the application to the defaults
    resetToDefaults();
}