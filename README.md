# minrs
Minimal javascript CSS3 range slider

*   Requires no js framework
*   Supported Safari 9.1+,Chrome 49+,Firefox49+
*   Supports responsive designs

### Install

```
bower install --save minrs
```

### Options
*   dual    - (Default: false)    -
*   end     -   End value
*   start   -   Start value
*   min     -   Minumum value (for dual)
*   max     -   Maximum value

| Name          | Description   | Default|
| :-----------: |:-------------:| :----: |
| dual          | Both minumum value and maximum value can be changed | false  |
| end      | End value      |   400  |
| start | Start value      |    0 |
| min      | Minumum value      |   0  |
| max | Maximum value      |    0 |
| ruler | To create a ruler below the slider      |    false |


### Usage
##### Dynamic Creation
```
new MINRS.Slider(element|elementid, [options]);
```

######Example:
```
var slider  = new MINRS.Slider('rsSlider', {dual: true});
```


##### Html Element
```
<min-rs options='[options]'></min-rs>
```

######Example:
```
<min-rs options='{"dual": true, "min": 30, "max": 100, "start": 10, "end": 130, "ruler": true}'></min-rs>
```

#####Live Examples
https://y1n3sa.github.io/minrs/