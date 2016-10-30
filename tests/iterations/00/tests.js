var reset = function () {
    document.getElementById('rsSlider').innerHTML = '';
    document.getElementById('rsSlider').className = '';
};

QUnit.test("default min max with single", function( assert ) {
    var slider  = new MINRS.Slider('rsSlider', {dual: false});
    assert.equal(slider.getStartValue(), 0);
    assert.equal(slider.getEndValue(), 400);
    reset();
});

QUnit.test("default min max with dual", function( assert ) {
    var slider  = new MINRS.Slider('rsSlider', {dual: true});
    assert.equal(slider.getStartValue(), 0);
    assert.equal(slider.getEndValue(), 400);
});