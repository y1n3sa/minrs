var reset = function () {
    document.getElementById('rsSlider').innerHTML = '';
    document.getElementById('rsSlider').className = '';
};

QUnit.test("min max with single", function( assert ) {
    var slider  = new MINRS.Slider('rsSlider', {dual: false, start: 120, end: 480});
    assert.equal(slider.getStartValue(), 120);
    assert.equal(slider.getEndValue(), 480);
    reset();
});

QUnit.test("min max with dual", function( assert ) {
    var slider  = new MINRS.Slider('rsSlider', {dual: true, start: 120, end: 480});
    assert.equal(slider.getStartValue(), 120);
    assert.equal(slider.getEndValue(), 480);
});