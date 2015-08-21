/*!
 *  CanvasInput v1.2.2
 *  http://goldfirestudios.com/blog/108/CanvasInput-HTML5-Canvas-Text-Input
 *
 *  (c) 2013-2015, James Simpson of GoldFire Studios
 *  goldfirestudios.com
 *
 *  MIT License
 */

(function() {
  // create a buffer that stores all inputs so that tabbing
  // between them is made possible.
  var inputs = [];

  // initialize the Canvas Input
  var CanvasInput = window.CanvasInput = function(o) {
    var self = this;

    o = o ? o : {};

    // set up the defaults
    self._canvas = o.canvas || null;
    self._ctx = self._canvas ? self._canvas.getContext('2d') : null;
    self._x = o.x || 0;
    self._y = o.y || 0;
    self._extraX = o.extraX || 0;
    self._extraY = o.extraY || 0;
    self._fontSize = o.fontSize || 14;
    self._fontFamily = o.fontFamily || 'Arial';
    self._fontColor = o.fontColor || '#000';
    self._placeHolderColor = o.placeHolderColor || '#bfbebd';
    self._fontWeight = o.fontWeight || 'normal';
    self._fontStyle = o.fontStyle || 'normal';
    self._readonly = o.readonly || false;
    self._maxlength = o.maxlength || null;
    self._width = o.width || 150;
    self._height = o.height || self._fontSize;
    self._padding = o.padding >= 0 ? o.padding : 5;
    self._borderWidth = o.borderWidth >= 0 ? o.borderWidth : 1;
    self._borderColor = o.borderColor || '#959595';
    self._borderRadius = o.borderRadius >= 0 ? o.borderRadius : 3;
    self._backgroundImage = o.backgroundImage || '';
    self._boxShadow = o.boxShadow || '1px 1px 0px rgba(255, 255, 255, 1)';
    self._innerShadow = o.innerShadow || '0px 0px 4px rgba(0, 0, 0, 0.4)';
    self._selectionColor = o.selectionColor || 'rgba(179, 212, 253, 0.8)';
    self._placeHolder = o.placeHolder || '';
    self._value = (o.value || self._placeHolder) + '';
    self._onsubmit = o.onsubmit || function() {};
    self._onkeydown = o.onkeydown || function() {};
    self._onkeyup = o.onkeyup || function() {};
    self._onfocus = o.onfocus || function() {};
    self._onblur = o.onblur || function() {};
    self._cursor = false;
    self._cursorPos = 0;
    self._hasFocus = false;
    self._selection = [0, 0];
    self._wasOver = false;

    // parse box shadow
    self.boxShadow(self._boxShadow, true);

    // calculate the full width and height with padding, borders and shadows
    self._calcWH();

    // set up the off-DOM canvas
    self._renderCanvas = document.createElement('canvas');
    self._renderCanvas.setAttribute('width', self.outerW);
    self._renderCanvas.setAttribute('height', self.outerH);
    self._renderCtx = self._renderCanvas.getContext('2d');

    // set up another off-DOM canvas for inner-shadows
    self._shadowCanvas = document.createElement('canvas');
    self._shadowCanvas.setAttribute('width', self._width + self._padding * 2);
    self._shadowCanvas.setAttribute('height', self._height + self._padding * 2);
    self._shadowCtx = self._shadowCanvas.getContext('2d');

    // set up the background color
    if (typeof o.backgroundGradient !== 'undefined') {
      self._backgroundColor = self._renderCtx.createLinearGradient(
        0,
        0,
        0,
        self.outerH
      );
      self._backgroundColor.addColorStop(0, o.backgroundGradient[0]);
      self._backgroundColor.addColorStop(1, o.backgroundGradient[1]);
    } else {
      self._backgroundColor = o.backgroundColor || '#fff';
    }

    // set up main canvas events
    if (self._canvas) {
      self._canvas.addEventListener('mousemove', function(e) {
        e = e || window.event;
        self.mousemove(e, self);
      }, false);

      self._canvas.addEventListener('mousedown', function(e) {
        e = e || window.event;
        self.mousedown(e, self);
      }, false);

      self._canvas.addEventListener('mouseup', function(e) {
        e = e || window.event;
        self.mouseup(e, self);
      }, false);
    }

    // set up a global mouseup to blur the input outside of the canvas
    window.addEventListener('mouseup', function(e) {
      e = e || window.event;

      if (self._hasFocus && !self._mouseDown) {
        self.blur();
      }
    }, true);
    
    // create the hidden input element
    self._hiddenInput = document.createElement('input');
    self._hiddenInput.type = 'text';
    self._hiddenInput.style.position = 'absolute';
    self._hiddenInput.style.opacity = 0;
    self._hiddenInput.style.pointerEvents = 'none';
    self._hiddenInput.style.left = (self._x + self._extraX + (self._canvas ? self._canvas.offsetLeft : 0)) + 'px';
    self._hiddenInput.style.top = (self._y + self._extraY + (self._canvas ? self._canvas.offsetTop : 0)) + 'px';
    self._hiddenInput.style.width = self._width + 'px';
    self._hiddenInput.style.height = self._height + 'px';
    self._hiddenInput.style.zIndex = 0;
    if (self._maxlength) {
      self._hiddenInput.maxLength = self._maxlength;
    }
    document.body.appendChild(self._hiddenInput);
    self._hiddenInput.value = self._value;

    // set up the keydown listener
    self._hiddenInput.addEventListener('keydown', function(e) {
      e = e || window.event;

      if (self._hasFocus) {
        self.keydown(e, self);
      }
    });

    // set up the keyup listener
    self._hiddenInput.addEventListener('keyup', function(e) {
      e = e || window.event;

      // update the canvas input state information from the hidden input
      self._value = self._hiddenInput.value;
      self._cursorPos = self._hiddenInput.selectionStart;
      self.render();

      if (self._hasFocus) {
        self._onkeyup(e, self);
      }
    });

    // add this to the buffer
    inputs.push(self);
    self._inputsIndex = inputs.length - 1;

    // draw the text box
    self.render();
  };

  // set up the prototype
  // (methods using standard getter/setter will be added dynamically below the prototype object literal)
  CanvasInput.prototype = {
    /**
     * Get/set the main canvas.
     * @param  {Object} data Canvas reference.
     * @return {Mixed}      CanvasInput or current canvas.
     */
    canvas: function(data) {
      var self = this;

      if (typeof data !== 'undefined') {
        self._canvas = data;
        self._ctx = self._canvas.getContext('2d');

        return self.render();
      } else {
        return self._canvas;
      }
    },

    /**
     * Get/set the background gradient.
     * @param  {Number} data Background gradient.
     * @return {Mixed}      CanvasInput or current background gradient.
     */
    backgroundGradient: function(data) {
      var self = this;

      if (typeof data !== 'undefined') {
        self._backgroundColor = self._renderCtx.createLinearGradient(
          0,
          0,
          0,
          self.outerH
        );
        self._backgroundColor.addColorStop(0, data[0]);
        self._backgroundColor.addColorStop(1, data[1]);

        return self.render();
      } else {
        return self._backgroundColor;
      }
    },

    /**
     * Get/set the box shadow.
     * @param  {String} data     Box shadow in CSS format (1px 1px 1px rgba(0, 0, 0.5)).
     * @param  {Boolean} doReturn (optional) True to prevent a premature render.
     * @return {Mixed}          CanvasInput or current box shadow.
     */
    boxShadow: function(data, doReturn) {
      var self = this;

      if (typeof data !== 'undefined') {
        // parse box shadow
        var boxShadow = data.split('px ');
        self._boxShadow = {
          x: self._boxShadow === 'none' ? 0 : parseInt(boxShadow[0], 10),
          y: self._boxShadow === 'none' ? 0 : parseInt(boxShadow[1], 10),
          blur: self._boxShadow === 'none' ? 0 : parseInt(boxShadow[2], 10),
          color: self._boxShadow === 'none' ? '' : boxShadow[3]
        };

        // take into account the shadow and its direction
        if (self._boxShadow.x < 0) {
          self.shadowL = Math.abs(self._boxShadow.x) + self._boxShadow.blur;
          self.shadowR = self._boxShadow.blur + self._boxShadow.x;
        } else {
          self.shadowL = Math.abs(self._boxShadow.blur - self._boxShadow.x);
          self.shadowR = self._boxShadow.blur + self._boxShadow.x;
        }
        if (self._boxShadow.y < 0) {
          self.shadowT = Math.abs(self._boxShadow.y) + self._boxShadow.blur;
          self.shadowB = self._boxShadow.blur + self._boxShadow.y;
        } else {
          self.shadowT = Math.abs(self._boxShadow.blur - self._boxShadow.y);
          self.shadowB = self._boxShadow.blur + self._boxShadow.y;
        }

        self.shadowW = self.shadowL + self.shadowR;
        self.shadowH = self.shadowT + self.shadowB;

        self._calcWH();

        if (!doReturn) {
          self._updateCanvasWH();

          return self.render();
        }
      } else {
        return self._boxShadow;
      }
    },

    /**
     * Get/set the current text box value.
     * @param  {String} data Text value.
     * @return {Mixed}      CanvasInput or current text value.
     */
    value: function(data) {
      var self = this;

      if (typeof data !== 'undefined') {
        self._value = data + '';
        self._hiddenInput.value = data + '';

        // update the cursor position
        self._cursorPos = self._clipText().length;

        self.render();

        return self;
      } else {
        return (self._value === self._placeHolder) ? '' : self._value;
      }
    },

    /**
     * Set or fire the onsubmit event.
     * @param  {Function} fn Custom callback.
     */
    onsubmit: function(fn) {
      var self = this;

      if (typeof fn !== 'undefined') {
        self._onsubmit = fn;

        return self;
      } else {
        self._onsubmit();
      }
    },

    /**
     * Set or fire the onkeydown event.
     * @param  {Function} fn Custom callback.
     */
    onkeydown: function(fn) {
      var self = this;

      if (typeof fn !== 'undefined') {
        self._onkeydown = fn;

        return self;
      } else {
        self._onkeydown();
      }
    },

    /**
     * Set or fire the onkeyup event.
     * @param  {Function} fn Custom callback.
     */
    onkeyup: function(fn) {
      var self = this;

      if (typeof fn !== 'undefined') {
        self._onkeyup = fn;

        return self;
      } else {
        self._onkeyup();
      }
    },

    /**
     * Place focus on the CanvasInput box, placing the cursor
     * either at the end of the text or where the user clicked.
     * @param  {Number} pos (optional) The position to place the cursor.
     * @return {CanvasInput}
     */
    focus: function(pos) {
      var self = this;

      // only fire the focus event when going from unfocussed
      if (!self._hasFocus) {
        self._onfocus(self);

        // remove focus from all other inputs
        for (var i=0; i<inputs.length; i++) {
          if (inputs[i]._hasFocus) {
            inputs[i].blur();
          }
        }
      }

      // remove selection
      if (!self._selectionUpdated) {
        self._selection = [0, 0];
      } else {
        delete self._selectionUpdated;
      }

      // if this is readonly, don't allow it to get focus
      self._hasFocus = true;
      if (self._readonly) {
        self._hiddenInput.readOnly = true;
        return;
      } else {
        self._hiddenInput.readOnly = false;
      }

      // update the cursor position
      self._cursorPos = (typeof pos === 'number') ? pos : self._clipText().length;

      // clear the placeholder
      if (self._placeHolder === self._value) {
        self._value = '';
        self._hiddenInput.value = '';
      }

      self._cursor = true;

      // set up cursor interval
      if (self._cursorInterval) {
        clearInterval(self._cursorInterval);
      }
      self._cursorInterval = setInterval(function() {
        self._cursor = !self._cursor;
        self.render();
      }, 500);

      // move the real focus to the hidden input
      var hasSelection = (self._selection[0] > 0 || self._selection[1] > 0);
      self._hiddenInput.focus();
      self._hiddenInput.selectionStart = hasSelection ? self._selection[0] : self._cursorPos;
      self._hiddenInput.selectionEnd = hasSelection ? self._selection[1] : self._cursorPos;

      return self.render();
    },

    /**
     * Removes focus from the CanvasInput box.
     * @param  {Object} _this Reference to this.
     * @return {CanvasInput}
     */
    blur: function(_this) {
      var self = _this || this;

      self._onblur(self);

      if (self._cursorInterval) {
        clearInterval(self._cursorInterval);
      }
      self._hasFocus = false;
      self._cursor = false;
      self._selection = [0, 0];
      self._hiddenInput.blur();

      // fill the placeholder
      if (self._value === '') {
        self._value = self._placeHolder;
      }

      return self.render();
    },

    /**
     * Fired with the keydown event to draw the typed characters.
     * @param  {Event}       e    The keydown event.
     * @param  {CanvasInput} self
     * @return {CanvasInput}
     */
    keydown: function(e, self) {
      var keyCode = e.which,
        isShift = e.shiftKey,
        key = null,
        startText, endText;

      // make sure the correct text field is being updated
      if (self._readonly || !self._hasFocus) {
        return;
      }

      // fire custom user event
      self._onkeydown(e, self);

      // add support for Ctrl/Cmd+A selection
      if (keyCode === 65 && (e.ctrlKey || e.metaKey)) {
        self.selectText();
        e.preventDefault();
        return self.render();
      }

      // block keys that shouldn't be processed
      if (keyCode === 17 || e.metaKey || e.ctrlKey) {
        return self;
      }

      if (keyCode === 13) { // enter key
        e.preventDefault();
        self._onsubmit(e, self);
      } else if (keyCode === 9) { // tab key
        e.preventDefault();
        if (inputs.length > 1) {
          var next = (inputs[self._inputsIndex + 1]) ? self._inputsIndex + 1 : 0;
          self.blur();
          setTimeout(function() {
            inputs[next].focus();
          }, 10);
        }
      }

      // update the canvas input state information from the hidden input
      self._value = self._hiddenInput.value;
      self._cursorPos = self._hiddenInput.selectionStart;
      self._selection = [0, 0];

      return self.render();
    },

    /**
     * Fired with the click event on the canvas, and puts focus on/off
     * based on where the user clicks.
     * @param  {Event}       e    The click event.
     * @param  {CanvasInput} self
     * @return {CanvasInput}
     */
    click: function(e, self) {
      var mouse = self._mousePos(e),
        x = mouse.x,
        y = mouse.y;

      if (self._endSelection) {
        delete self._endSelection;
        delete self._selectionUpdated;
        return;
      }

      if (self._canvas && self._overInput(x, y) || !self._canvas) {
        if (self._mouseDown) {
          self._mouseDown = false;
          self.click(e, self);
          return self.focus(self._clickPos(x, y));
        }
      } else {
        return self.blur();
      }
    },

    /**
     * Fired with the mousemove event to update the default cursor.
     * @param  {Event}       e    The mousemove event.
     * @param  {CanvasInput} self
     * @return {CanvasInput}
     */
    mousemove: function(e, self) {
      var mouse = self._mousePos(e),
        x = mouse.x,
        y = mouse.y,
        isOver = self._overInput(x, y);

      if (isOver && self._canvas) {
        self._canvas.style.cursor = 'text';
        self._wasOver = true;
      } else if (self._wasOver && self._canvas) {
        self._canvas.style.cursor = 'default';
        self._wasOver = false;
      }

      if (self._hasFocus && self._selectionStart >= 0) {
        var curPos = self._clickPos(x, y),
          start = Math.min(self._selectionStart, curPos),
          end = Math.max(self._selectionStart, curPos);

        if (!isOver) {
          self._selectionUpdated = true;
          self._endSelection = true;
          delete self._selectionStart;
          self.render();
          return;
        }

        if (self._selection[0] !== start || self._selection[1] !== end) {
          self._selection = [start, end];
          self.render();
        }
      }
    },

    /**
     * Fired with the mousedown event to start a selection drag.
     * @param  {Event} e    The mousedown event.
     * @param  {CanvasInput} self
     */
    mousedown: function(e, self) {
      var mouse = self._mousePos(e),
        x = mouse.x,
        y = mouse.y,
        isOver = self._overInput(x, y);

      // set up the 'click' event
      self._mouseDown = isOver;

      // start the selection drag if inside the input
      if (self._hasFocus && isOver) {
        self._selectionStart = self._clickPos(x, y);
      }
    },

    /**
     * Fired with the mouseup event to end a selection drag.
     * @param  {Event} e    The mouseup event.
     * @param  {CanvasInput} self
     */
    mouseup: function(e, self) {
      var mouse = self._mousePos(e),
        x = mouse.x,
        y = mouse.y;

      // update selection if a drag has happened
      var isSelection = self._clickPos(x, y) !== self._selectionStart;
      if (self._hasFocus && self._selectionStart >= 0 && self._overInput(x, y) && isSelection) {
        self._selectionUpdated = true;
        delete self._selectionStart;
        self.render();
      } else {
        delete self._selectionStart;
      }

      self.click(e, self);
    },

    /**
     * Select a range of text in the input.
     * @param  {Array} range (optional) Leave blank to select all. Format: [start, end]
     * @return {CanvasInput}
     */
    selectText: function(range) {
      var self = this,
        range = range || [0, self._value.length];

      // select the range of text specified (or all if none specified)
      setTimeout(function() {
        self._selection = [range[0], range[1]];
        self._hiddenInput.selectionStart = range[0];
        self._hiddenInput.selectionEnd = range[1];
        self.render();
      }, 1);

      return self;
    },

    /**
     * Helper method to get the off-DOM canvas.
     * @return {Object} Reference to the canvas.
     */
    renderCanvas: function() {
      return this._renderCanvas;
    },

    /**
     * Clears and redraws the CanvasInput on an off-DOM canvas,
     * and if a main canvas is provided, draws it all onto that.
     * @return {CanvasInput}
     */
    render: function() {
      var self = this,
        ctx = self._renderCtx,
        w = self.outerW,
        h = self.outerH,
        br = self._borderRadius,
        bw = self._borderWidth,
        sw = self.shadowW,
        sh = self.shadowH;

      if (!ctx) {
        return;
      }

      // clear the canvas
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      // set up the box shadow
      ctx.shadowOffsetX = self._boxShadow.x;
      ctx.shadowOffsetY = self._boxShadow.y;
      ctx.shadowBlur = self._boxShadow.blur;
      ctx.shadowColor = self._boxShadow.color;

      // draw the border
      if (self._borderWidth > 0) {
        ctx.fillStyle = self._borderColor;
        self._roundedRect(ctx, self.shadowL, self.shadowT, w - sw, h - sh, br);
        ctx.fill();

        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowBlur = 0;
      }

      // draw the text box background
      self._drawTextBox(function() {
        // make sure all shadows are reset
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowBlur = 0;

        // clip the text so that it fits within the box
        var text = self._clipText();

        // draw the selection
        var paddingBorder = self._padding + self._borderWidth + self.shadowT;
        if (self._selection[1] > 0) {
          var selectOffset = self._textWidth(text.substring(0, self._selection[0])),
            selectWidth = self._textWidth(text.substring(self._selection[0], self._selection[1]));

          ctx.fillStyle = self._selectionColor;
          ctx.fillRect(paddingBorder + selectOffset, paddingBorder, selectWidth, self._height);
        }

        // draw the cursor
        if (self._cursor) {
          var cursorOffset = self._textWidth(text.substring(0, self._cursorPos));
          ctx.fillStyle = self._fontColor;
          ctx.fillRect(paddingBorder + cursorOffset, paddingBorder, 1, self._height);
        }

        // draw the text
        var textX = self._padding + self._borderWidth + self.shadowL,
          textY = Math.round(paddingBorder + self._height / 2);

        // only remove the placeholder text if they have typed something
        text = (text === '' && self._placeHolder) ? self._placeHolder : text;

        ctx.fillStyle = (self._value !== '' && self._value !== self._placeHolder) ? self._fontColor : self._placeHolderColor;
        ctx.font = self._fontStyle + ' ' + self._fontWeight + ' ' + self._fontSize + 'px ' + self._fontFamily;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, textX, textY);

        // parse inner shadow
        var innerShadow = self._innerShadow.split('px '),
          isOffsetX = self._innerShadow === 'none' ? 0 : parseInt(innerShadow[0], 10),
          isOffsetY = self._innerShadow === 'none' ? 0 : parseInt(innerShadow[1], 10),
          isBlur = self._innerShadow === 'none' ? 0 : parseInt(innerShadow[2], 10),
          isColor = self._innerShadow === 'none' ? '' : innerShadow[3];

        // draw the inner-shadow (damn you canvas, this should be easier than this...)
        if (isBlur > 0) {
          var shadowCtx = self._shadowCtx,
            scw = shadowCtx.canvas.width,
            sch = shadowCtx.canvas.height;

          shadowCtx.clearRect(0, 0, scw, sch);
          shadowCtx.shadowBlur = isBlur;
          shadowCtx.shadowColor = isColor;

          // top shadow
          shadowCtx.shadowOffsetX = 0;
          shadowCtx.shadowOffsetY = isOffsetY;
          shadowCtx.fillRect(-1 * w, -100, 3 * w, 100);

          // right shadow
          shadowCtx.shadowOffsetX = isOffsetX;
          shadowCtx.shadowOffsetY = 0;
          shadowCtx.fillRect(scw, -1 * h, 100, 3 * h);

          // bottom shadow
          shadowCtx.shadowOffsetX = 0;
          shadowCtx.shadowOffsetY = isOffsetY;
          shadowCtx.fillRect(-1 * w, sch, 3 * w, 100);

          // left shadow
          shadowCtx.shadowOffsetX = isOffsetX;
          shadowCtx.shadowOffsetY = 0;
          shadowCtx.fillRect(-100, -1 * h, 100, 3 * h);

          // create a clipping mask on the main canvas
          self._roundedRect(ctx, bw + self.shadowL, bw + self.shadowT, w - bw * 2 - sw, h - bw * 2 - sh, br);
          ctx.clip();

          // draw the inner-shadow from the off-DOM canvas
          ctx.drawImage(self._shadowCanvas, 0, 0, scw, sch, bw + self.shadowL, bw + self.shadowT, scw, sch);
        }

        // draw to the visible canvas
        if (self._ctx) {
          self._ctx.clearRect(self._x, self._y, ctx.canvas.width, ctx.canvas.height);
          self._ctx.drawImage(self._renderCanvas, self._x, self._y);
        }

        return self;

      });
    },

    /**
     * Destroy this input and stop rendering it.
     */
    destroy: function() {
      var self = this;

      // pull from the inputs array
      var index = inputs.indexOf(self);
      if (index) {
        inputs.splice(index, 1);
      }

      // remove focus
      if (self._hasFocus) {
        self.blur();
      }

      // remove the hidden input box
      document.body.removeChild(self._hiddenInput);

      // remove off-DOM canvas
      self._renderCanvas = null;
      self._shadowCanvas = null;
      self._renderCtx = null;
    },

    /**
     * Draw the text box area with either an image or background color.
     * @param  {Function} fn Callback.
     */
    _drawTextBox: function(fn) {
      var self = this,
        ctx = self._renderCtx,
        w = self.outerW,
        h = self.outerH,
        br = self._borderRadius,
        bw = self._borderWidth,
        sw = self.shadowW,
        sh = self.shadowH;

      // only draw the background shape if no image is being used
      if (self._backgroundImage === '') {
        ctx.fillStyle = self._backgroundColor;
        self._roundedRect(ctx, bw + self.shadowL, bw + self.shadowT, w - bw * 2 - sw, h - bw * 2 - sh, br);
        ctx.fill();

        fn();
      } else {
        var img = new Image();
        img.src = self._backgroundImage;
        img.onload = function() {
          ctx.drawImage(img, 0, 0, img.width, img.height, bw + self.shadowL, bw + self.shadowT, w, h);

          fn();
        };
      }
    },

    /**
     * Deletes selected text in selection range and repositions cursor.
     * @return {Boolean} true if text removed.
     */
    _clearSelection: function() {
      var self = this;

      if (self._selection[1] > 0) {
        // clear the selected contents
        var start = self._selection[0],
          end = self._selection[1];

        self._value = self._value.substr(0, start) + self._value.substr(end);
        self._cursorPos = start;
        self._cursorPos = (self._cursorPos < 0) ? 0 : self._cursorPos;
        self._selection = [0, 0];

        return true;
      }

      return false;
    },

    /**
     * Clip the text string to only return what fits in the visible text box.
     * @param  {String} value The text to clip.
     * @return {String} The clipped text.
     */
    _clipText: function(value) {
      var self = this;
      value = (typeof value === 'undefined') ? self._value : value;

      var textWidth = self._textWidth(value),
        fillPer = textWidth / (self._width - self._padding),
        text = fillPer > 1 ? value.substr(-1 * Math.floor(value.length / fillPer)) : value;

      return text + '';
    },

    /**
     * Gets the pixel width of passed text.
     * @param  {String} text The text to measure.
     * @return {Number}      The measured width.
     */
    _textWidth: function(text) {
      var self = this,
        ctx = self._renderCtx;

      ctx.font = self._fontStyle + ' ' + self._fontWeight + ' ' + self._fontSize + 'px ' + self._fontFamily;
      ctx.textAlign = 'left';

      return ctx.measureText(text).width;
    },

    /**
     * Recalculate the outer width and height of the text box.
     */
    _calcWH: function() {
      var self = this;

      // calculate the full width and height with padding, borders and shadows
      self.outerW = self._width + self._padding * 2 + self._borderWidth * 2 + self.shadowW;
      self.outerH = self._height + self._padding * 2 + self._borderWidth * 2 + self.shadowH;
    },

    /**
     * Update the width and height of the off-DOM canvas when attributes are changed.
     */
    _updateCanvasWH: function() {
      var self = this,
        oldW = self._renderCanvas.width,
        oldH = self._renderCanvas.height;

      // update off-DOM canvas
      self._renderCanvas.setAttribute('width', self.outerW);
      self._renderCanvas.setAttribute('height', self.outerH);
      self._shadowCanvas.setAttribute('width', self._width + self._padding * 2);
      self._shadowCanvas.setAttribute('height', self._height + self._padding * 2);

      // clear the main canvas
      if (self._ctx) {
        self._ctx.clearRect(self._x, self._y, oldW, oldH);
      }
    },

    /**
     * Creates the path for a rectangle with rounded corners.
     * Must call ctx.fill() after calling this to draw the rectangle.
     * @param  {Object} ctx Canvas context.
     * @param  {Number} x   x-coordinate to draw from.
     * @param  {Number} y   y-coordinate to draw from.
     * @param  {Number} w   Width of rectangle.
     * @param  {Number} h   Height of rectangle.
     * @param  {Number} r   Border radius.
     */
    _roundedRect: function(ctx, x, y, w, h, r) {
      if (w < 2 * r) r = w / 2;
      if (h < 2 * r) r = h / 2;

      ctx.beginPath();

      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);

      ctx.closePath();
    },

    /**
     * Checks if a coordinate point is over the input box.
     * @param  {Number} x x-coordinate position.
     * @param  {Number} y y-coordinate position.
     * @return {Boolean}   True if it is over the input box.
     */
    _overInput: function(x, y) {
      var self = this,
        xLeft = x >= self._x + self._extraX,
        xRight = x <= self._x + self._extraX + self._width + self._padding * 2,
        yTop = y >= self._y + self._extraY,
        yBottom = y <= self._y + self._extraY + self._height + self._padding * 2;

      return xLeft && xRight && yTop && yBottom;
    },

    /**
     * Use the mouse's x & y coordinates to determine
     * the position clicked in the text.
     * @param  {Number} x X-coordinate.
     * @param  {Number} y Y-coordinate.
     * @return {Number}   Cursor position.
     */
    _clickPos: function(x, y) {
      var self = this,
        value = self._value;

      // don't count placeholder text in this
      if (self._value === self._placeHolder) {
        value = '';
      }

      // determine where the click was made along the string
      var text = self._clipText(value),
        totalW = 0,
        pos = text.length;

      if (x - (self._x + self._extraX) < self._textWidth(text)) {
        // loop through each character to identify the position
        for (var i=0; i<text.length; i++) {
          totalW += self._textWidth(text[i]);
          if (totalW >= x - (self._x + self._extraX)) {
            pos = i;
            break;
          }
        }
      }

      return pos;
    },

    /**
     * Calculate the mouse position based on the event callback and the elements on the page.
     * @param  {Event} e
     * @return {Object}   x & y values
     */
    _mousePos: function(e) {
      var elm = e.target,
        style = document.defaultView.getComputedStyle(elm, undefined),
        paddingLeft = parseInt(style['paddingLeft'], 10) || 0,
        paddingTop = parseInt(style['paddingLeft'], 10) || 0,
        borderLeft = parseInt(style['borderLeftWidth'], 10) || 0,
        borderTop = parseInt(style['borderLeftWidth'], 10) || 0,
        htmlTop = document.body.parentNode.offsetTop || 0,
        htmlLeft = document.body.parentNode.offsetLeft || 0,
        offsetX = 0,
        offsetY = 0,
        x, y;

      // calculate the total offset
      if (typeof elm.offsetParent !== 'undefined') {
        do {
          offsetX += elm.offsetLeft;
          offsetY += elm.offsetTop;
        } while ((elm = elm.offsetParent));
      }

      // take into account borders and padding
      offsetX += paddingLeft + borderLeft + htmlLeft;
      offsetY += paddingTop + borderTop + htmlTop;

      return {
        x: e.pageX - offsetX,
        y: e.pageY - offsetY
      };
    }
  };
  
  /**
   * Attaches basic getter/setter methods for a given property name to the CanvasInput prototype
   * @param {String}  propName  Name of property for which to create get/set method
   * @param {Boolean} isDimension (optional) Whether this property affects the canvas size
   * @return {Mixed}  CanvasInput or current property value
   */
  function createGetterSetter(propName, isDimension) {
    var privatePropName = '_' + propName;

    CanvasInput.prototype[propName] = function getterSetter(data) {
      var self = this;

      if (typeof data !== 'undefined') {
        self[privatePropName] = data;

        if (isDimension) {
          self._calcWH();
          self._updateCanvasWH();
        }

        return self.render();
      } else {
        return self[privatePropName];
      }
    };
  };

  // properties which use the standard getter/setter method
  var standardProperties = [
    'x', // The pixel position along the x-coordinate.
    'y', // The pixel position along the y-coordinate.
    'extraX', // The extra x-coordinate position (generally used when no canvas is specified).
    'extraY', // The extra y-coordinate position (generally used when no canvas is specified).
    'fontSize',
    'fontFamily',
    'fontColor',
    'placeHolderColor',
    'fontWeight',
    'fontStyle',
    'borderColor',
    'borderRadius',
    'backgroundColor',
    'innerShadow', // In the format of a CSS box shadow (1px 1px 1px rgba(0, 0, 0.5)).
    'selectionColor',
    'placeHolder',
  ];

  standardProperties.forEach(createGetterSetter);

  // properties which use the standard getter/setter method and affect the canvas dimensions
  var standardDimensionProperties = [
    'width',
    'height',
    'padding',
    'borderWidth',
  ];

  standardDimensionProperties.forEach(function(property) {
    createGetterSetter(property, true);
  });
})();
