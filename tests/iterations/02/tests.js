var reset = function () {
    document.getElementById('rsSlider').innerHTML = '';
    document.getElementById('rsSlider').className = '';
};

QUnit.test("update single currentMin", function( assert ) {
    var slider  = new MINRS.Slider('rsSlider', {dual: false, start: 120, end: 480, min: 100});
    assert.equal(slider.getMin(), 120);
    slider.updateMin(140);
    assert.equal(slider.getMin(), 120);
    reset();
});

QUnit.test("update single currentMax", function( assert ) {
    var slider  = new MINRS.Slider('rsSlider', {dual: false, start: 120, end: 480, max: 150});
    assert.equal(slider.getMax(), 150);
    slider.updateMax(140);
    assert.equal(slider.getMax(), 140);
    slider.updateMax(170);
    assert.equal(slider.getMax(), 170);
    slider.updateMax(500);
    assert.equal(slider.getMax(), 480);
});