var E01 = {};

window.onload = function () {
    E01.slider      = new MINRS.Slider('rsSlider', {dual: true, ruler: true});
    E01.mininput    = document.getElementById('rsMinValue');
    E01.maxinput    = document.getElementById('rsMaxValue');

    E01.mininput.onkeyup = function () {
        E01.slider.updateMin(E01.mininput.value);
    };

    E01.maxinput.onkeyup = function () {
        E01.slider.updateMax(E01.maxinput.value);
    };
};