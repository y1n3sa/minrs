var E00 = {};

window.onload = function () {
    E00.slider  = new MINRS.Slider('rsSlider');
    E00.input   = document.getElementById('rsMaxValue');

    E00.input.onkeyup = function () {
        E00.slider.updateMax(E00.input.value);
    };
};