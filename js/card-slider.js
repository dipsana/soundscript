/* CARD SLIDER: Heart of the card sliders. Adds responsive & smooth card slider behavior. */

import { show, hide } from './ui-util.js';
import { } from './gen-main.js';

/* ********************************************** INIT **********************************************

    1. updateMetrics: function to update global metrics
    2. CONTS: all containers
    3. TOTAL_CARDS: total cards per container
    4. CARD_WIDTH
    5. VISIBLE_CARDS
    6. HIDDEN_CARDS
*/

const [updateMetrics, CONTS, TOTAL_CARDS, CARD_WIDTH, VISIBLE_CARDS, HIDDEN_CARDS] = (() => {
    const melody = document.getElementById('melody'),
        conts = melody.querySelectorAll('.cardConT > main'),
        totalCards = [24, 24, 24, 24, 5],
        metrics = {};

    function updateMetrics(i = 0) {
        metrics.contWidth = conts[i].getBoundingClientRect().width;
        metrics.cardWidth = conts[i].querySelector('.CarD').getBoundingClientRect().width;
        if (metrics.contWidth === 0 || metrics.cardWidth === 0) return false;
        metrics.visibleCards = Math.floor(metrics.contWidth / metrics.cardWidth);
        return true;
    }

    return [
        updateMetrics,
        () => conts,
        (i) => totalCards[i],
        () => metrics.cardWidth,
        () => metrics.visibleCards,
        (i) => totalCards[i] - metrics.visibleCards
    ];
})();

// STORE: SLIDER TRANSLATED WIDTH, SLIDER INDICES
const slide = [], prevIdx = [], nextIdx = [];

// GET: MELODY MAIN
const melodyMain = document.querySelector('#melody > main');

/* ******************************************** UTILITIES ******************************************** */

// CALCULATE WIDTH TO BE TRANSLATED:
function calcLeftSlide(i) {
    const canBeShifted = -slide[i] / CARD_WIDTH();
    return VISIBLE_CARDS() > canBeShifted ? canBeShifted * CARD_WIDTH() : VISIBLE_CARDS() * CARD_WIDTH();
}

function calcRightSlide(i) {
    const canBeShifted = HIDDEN_CARDS(i) + slide[i] / CARD_WIDTH();
    return VISIBLE_CARDS() > canBeShifted ? canBeShifted * CARD_WIDTH() : VISIBLE_CARDS() * CARD_WIDTH();
}

// SET SLIDER INDICES
function setSliderIndices(i, prevImg, prevCap, nextImg, nextCap) {
    // Find no. of cards shifted left
    const shiftedLeft = Math.ceil(-slide[i] / (VISIBLE_CARDS() * CARD_WIDTH()));

    // Modify indices
    prevIdx[i] = shiftedLeft + 1;
    nextIdx[i] = Math.ceil(TOTAL_CARDS(i) / VISIBLE_CARDS()) - shiftedLeft;

    // Modify fig cap
    prevCap.innerText = prevIdx[i];
    nextCap.innerText = nextIdx[i];

    // Rotate img if slider idx is 1:
    prevIdx[i] === 1 ? prevImg.classList.add('rotate-y-180') : prevImg.classList.remove('rotate-y-180'); // Prev
    nextIdx[i] === 1 ? nextImg.classList.add('rotate-y-180') : nextImg.classList.remove('rotate-y-180'); // Next
}

// IMAGE SLIDER FUNCTIONS:
function swipeLeft(i, prevImg, prevCap, nextImg, nextCap) {
    // Modify Slide when prevIdx is 1 or > 1 (Content Snapping)
    slide[i] = (prevIdx[i] === 1) ? -HIDDEN_CARDS(i) * CARD_WIDTH() : slide[i] + calcLeftSlide(i);

    setSliderIndices(i, prevImg, prevCap, nextImg, nextCap);

    // Get Show All Btn
    const showAllBtn = melodyMain.querySelector(`.cardConT:nth-child(${i + 1}) > header > button`);
    if (showAllBtn) {
        if (prevIdx[i] === 1) {
            show(showAllBtn); // slider at first position → show button
        } else {
            hide(showAllBtn); // slider shifted → hide button
        }
    }

    // Slide Cards
    const cards = CONTS()[i].querySelectorAll('.CarD');
    for (let j = 0; j < TOTAL_CARDS(i); j++) {
        cards[j].style.transform = `translateX(${slide[i]}px)`;
    }
}

function swipeRight(i, prevImg, prevCap, nextImg, nextCap) {
    // Modify Slide when nextIdx is
    if (nextIdx[i] === 1) { // 1
        const remaining = TOTAL_CARDS(i) - HIDDEN_CARDS(i) - VISIBLE_CARDS();
        slide[i] = remaining ? slide[i] - remaining * CARD_WIDTH() : 0; // Content Snapping
    } else { // or > 1
        slide[i] -= calcRightSlide(i);
    }

    setSliderIndices(i, prevImg, prevCap, nextImg, nextCap);

    // Update show-all button visibility based on slider position
    const showAllBtn = melodyMain.querySelector(`.cardConT:nth-child(${i + 1}) > header > button`);
    if (showAllBtn) {
        if (prevIdx[i] === 1) {
            show(showAllBtn);
        } else {
            hide(showAllBtn);
        }
    }

    // Slide Cards
    const cards = CONTS()[i].querySelectorAll('.CarD');
    for (let j = 0; j < TOTAL_CARDS(i); j++) {
        cards[j].style.transform = `translateX(${slide[i]}px)`;
    }
}

// ADD SLIDER: NEXT/PREV BTNS WITH ON CLICK EVENT LISTENERS: SWIPE LEFT & SWIPE RIGHT
function addBtns(i) {
    const prev = CONTS()[i].querySelector('.prevBtN'), prevImg = document.createElement('img'), prevCap = document.createElement('figcaption'),
        next = CONTS()[i].querySelector('.nextBtN'), nextImg = document.createElement('img'), nextCap = document.createElement('figcaption');

    // Btn: Title & Img
    prev.title = prev.ariaLabel = 'Previous';
    next.title = next.ariaLabel = 'Next';

    prevImg.src = './assets/icons/prev.svg';
    prevImg.alt = '[PREV]';
    nextImg.src = './assets/icons/next.svg';
    nextImg.alt = '[NEXT]';

    // Append: Image + Caption
    prev.append(prevImg, prevCap);
    next.append(nextCap, nextImg);

    // Set Slider Indices (prevIdx & nextIdx)
    setSliderIndices(i, prevImg, prevCap, nextImg, nextCap);

    // Resize Observer for cardContainer to updateMetrics & setSliderIndices
    const sliderResizeObserver = new ResizeObserver(() => {
        if (!updateMetrics(i)) return;
        setSliderIndices(i, prevImg, prevCap, nextImg, nextCap);
    });
    sliderResizeObserver.observe(CONTS()[i]); // Start Observing

    // Event Listeners:
    prev.addEventListener('click', () => swipeLeft(i, prevImg, prevCap, nextImg, nextCap));
    next.addEventListener('click', () => swipeRight(i, prevImg, prevCap, nextImg, nextCap));

    // Make cards swipe-able
    let startX = 0;
    CONTS()[i].addEventListener('touchstart', e => startX = e.touches[0].clientX);
    CONTS()[i].addEventListener('touchend', e => {
        const endX = e.changedTouches[0].clientX;
        const diff = startX < (window.innerWidth / 2) ? startX - endX : endX - startX;
        if (diff > 50) swipeLeft(i, prevImg, prevCap, nextImg, nextCap);
        if (diff < -50) swipeRight(i, prevImg, prevCap, nextImg, nextCap);
    });
}

/* ********************************************* MAIN ********************************************** */

// INIT CARD SLIDER
updateMetrics();

// GEN SLIDER BTNS
for (let i = 0; i < CONTS().length; i++) {
    slide.push(0);
    addBtns(i);
}

console.log('Running Card Slider...🏃‍♂️');