![CanvasInput](http://goldfirestudios.com/proj/canvasinput/logo.png "CanvasInput")

## Description
[**CanvasInput**](http://goldfirestudios.com/blog/108/CanvasInput-HTML5-Canvas-Text-Input) recreates and improves a full DOM <input> element within HTML5 Canvas.

More documentation, examples and demos can be found at **[CanvasInput](http://goldfirestudios.com/blog/108/CanvasInput-HTML5-Canvas-Text-Input)**.

### Features
* Closest recreation of a DOM input in canvas to date
* Full CSS-type styling
* Text selection
* Tab between inputs
* Full native copy/paste support
* Text place holder support
* Readonly property support
* Auto text scrolling
* Uses an off-DOM canvas for efficiency
* Supports all keyboard types
* Caps lock support

### Browser Compatibility
Tested in the following browsers/versions:
* Google Chrome
* Internet Explorer 9.0+
* Firefox
* Safari
* Opera
* Most mobile browsers

## Documentation

### Examples

##### Most basic, default text box:
```html
<canvas id="canvas" width="200" height="50"></canvas>
```
```javascript
var input = new CanvasInput({
  canvas: document.getElementById('canvas')
});
```

##### More styling options:
```html
<canvas id="canvas" width="350" height="50"></canvas>
```
```javascript
var input = new CanvasInput({
  canvas: document.getElementById('canvas'),
  fontSize: 18,
  fontFamily: 'Arial',
  fontColor: '#212121',
  fontWeight: 'bold',
  width: 300,
  padding: 8,
  borderWidth: 1,
  borderColor: '#000',
  borderRadius: 3,
  boxShadow: '1px 1px 0px #fff',
  innerShadow: '0px 0px 5px rgba(0, 0, 0, 0.5)',
  placeHolder: 'Enter message here...'
});
```

### Properties
* **canvas**: `Object` *(`null` by default)* Specify a canvas element to draw the text box to (the off-DOM canvas can be accessed through a helper method if you want to leave this blank and handle it on your own).
* **x**: `Number` *(`0` by default)* X-coordinate position on the canvas.
* **y**: `Number` *(`0` by default)* Y-coordinate position on the canvas.
* **extraX**: `Number` *(`0` by default)* This is an optional x-value for use when no canvas is passed into CanvasInput.
* **extraY**: `Number` *(`0` by default)* This is an optional y-value for use when no canvas is passed into CanvasInput.
* **fontSize**: `Number` *(`14` by default)* Text font size.
* **fontFamily**: `String` *(`Arial` by default)* Text font family.
* **fontColor**: `String` *(`#000` by default)* Text color.
* **placeHolderColor**: `String` *(`#bfbebd` by default)* Place holder text color.
* **fontWeight**: `String` *(`normal` by default)* Font weight such as `bold` or `normal`.
* **fontStyle**: `String` *(`normal` by default)* Font style such as `italic` or `normal`.
* **fontShadowColor**: `String` *(`''` by default)* Shadow color for both placeholder and value text.
* **fontShadowBlur**: `String` *(`0` by default)* Shadow blur for both placeholder and value text.
* **fontShadowOffsetX**: `String` *(`0` by default)* Shadow x-offset for both placeholder and value text.
* **fontShadowOffsetY**: `String` *(`0` by default)* Shadow y-offset for both placeholder and value text.
* **readonly**: `Boolean` *(`false` by default)* Set to `true` to disable user input.
* **maxlength**: `Number` *(`null` by default)* Sets the max length of characters.
* **width**: `Number` *(`150` by default)* The width of the text box (just like in the DOM, padding, borders and shadows add onto this width).
* **height**: `Number` *(`14` by default)* The height of the text box (just like in the DOM, padding, borders and shadows add onto this height).
* **padding**: `Number` *(`5` by default)* The padding in pixels around all 4 sides of the text input area.
* **borderWidth**: `Number` *(`1` by default)* Size of the border.
* **borderColor**: `String` *(`#959595` by default)* Color of the border.
* **borderRadius**: `Number` *(`3` by default)* Create rounded corners by setting a border radius.
* **backgroundImage**: `String` *(`''` by default)* Use an image instead of styling for the background (it is usually best to set `borderWidth` to 0, `backgroundColor` to 'none' and the inner and box shadows to 'none' when using this).
* **backgroundColor**: `String` *(`#fff` by default)* Sets the background color of the text box.
* **backgroundGradient**: `Array` *(`['', '']` by default)* Instead of a single background color, you can set a gradient of two colors.
* **boxShadow**: `String` *(`1px 1px 0px rgba(255, 255, 255, 1)` by default)* Define a box shadow just as you would with CSS.
* **innerShadow**: `String` *(`0px 0px 4px rgba(0, 0, 0, 0.4)` by default)* Define an inner-shadow just as you would with the box shadow.
* **selectionColor**: `String` *(`rgba(179, 212, 253, 0.8)` by default)* The default color for the text selection highlight.
* **placeHolder**: `String` *(`''` by default)* The default place holder text. This text will disappear when the user focusses on the input.
* **value**: `String` *(`''` by default)* Set the default value for an input.
* **onsubmit**: `Function` *(`function() {}` by default)* Callback fires when user hits the enter key.
* **onkeydown**: `Function` *(`function() {}` by default)* Callback fires on key down.
* **onkeyup**: `Function` *(`function() {}` by default)* Callback fires on key up.
* **onfocus**: `Function` *(`function() {}` by default)* Callback fires on focus.
* **onblur**: `Function` *(`function() {}` by default)* Callback fires on blur (un-focus).

### Methods
In addition to getter/setter methods for each of the above properties, the following methods have also been made available.

* **focus**: Sets the focus on the input box (focus must already be on the canvas element).
  * *pos*: `Number` (optional) Set the default character position for the cursor. Goes to the end by default.
* **blur**: Removes the focus from the text input box.
* **renderCanvas**: Returns the off-DOM canvas, allowing you to draw its contents to whatever canvas you would like (or do whatever else with the data that you want). 
* **render**: This rerenders the full input box.
* **selectText**: Select part or all of the text in the input box programmatically.
  * *range*: `Array` (optional) Leave empty to select all text, or pass range values in this form: `[start, end]`.
* **destroy**: Destroy the input and stop rendering it.

## License

Copyright (c) 2013-2017 James Simpson and GoldFire Studios, Inc.

Released under the MIT License.