const arrayContainer = document.getElementById('array-container');
const generateArrayBtn = document.getElementById('generate-array');
const sortBtn = document.getElementById('sort-btn');
const algorithmSelect = document.getElementById('algorithm-select');
const speedSlider = document.getElementById('speed');

let array = [];
let animationSpeed = 50;

// A map to store algorithm names and their corresponding functions
const algorithms = {
    "Bubble Sort": bubbleSort,
    // When you add Quick Sort, you'll just add a line here:
    // "Quick Sort": quickSort, 
};

// --- Core Logic ---

// Utility function to sleep/pause execution for animation
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Function to generate a new random array and render it as bars
function generateArray() {
    array = [];
    arrayContainer.innerHTML = '';
    // Create an array of 50 random numbers
    for (let i = 0; i < 50; i++) {
        // Generate random numbers between 5 and 100 for varied bar heights
        array.push(Math.floor(Math.random() * 95) + 5);
    }

    // Create a div element (a "bar") for each number in the array
    for (let i = 0; i < array.length; i++) {
        const bar = document.createElement('div');
        bar.style.height = `${array[i] * 4}px`; // Scale height for better visualization
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
}

// Function to re-enable controls after sorting is complete
function enableControls() {
    generateArrayBtn.disabled = false;
    sortBtn.disabled = false;
    algorithmSelect.disabled = false;
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
    disableControls();
    const bars = document.getElementsByClassName('array-bar');
    const n = array.length;

    for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            // Highlight bars being compared with 'comparing' class
            bars[j].classList.add('comparing');
            bars[j + 1].classList.add('comparing');

            // Pause execution to make the comparison visible
            await sleep(animationSpeed);

            if (array[j] > array[j + 1]) {
                // Highlight bars being swapped with 'swapping' class
                bars[j].classList.add('swapping');
                bars[j + 1].classList.add('swapping');
                await sleep(animationSpeed);

                // Swap the values in the underlying array
                [array[j], array[j + 1]] = [array[j + 1], array[j]];
                
                // Swap the bars visually
                swapBars(bars[j], bars[j + 1]);
                await sleep(animationSpeed);
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

    enableControls();
}

// --- Event Listeners ---

// Function to populate the algorithm selection dropdown
function populateAlgorithmOptions() {
    for (const algoName in algorithms) {
        const option = document.createElement('option');
        option.value = algoName;
        option.innerText = algoName;
        algorithmSelect.appendChild(option);
    }
}

// Generic function to start the selected sorting algorithm
async function startSort() {
    const selectedAlgorithmName = algorithmSelect.value;
    const sortFunction = algorithms[selectedAlgorithmName];
    if (sortFunction) {
        await sortFunction();
    }
}

// Generate a new array when the button is clicked
generateArrayBtn.addEventListener('click', generateArray);

// Start the selected sort when the button is clicked
sortBtn.addEventListener('click', startSort);

// Update animation speed based on the slider
speedSlider.addEventListener('input', (e) => {
    animationSpeed = 101 - e.target.value;
});

// Initial setup when the page loads
window.onload = () => {
    populateAlgorithmOptions();
    generateArray();
};