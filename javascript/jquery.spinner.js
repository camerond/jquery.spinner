(function($) {

  $.fn.spinner = function(options) {

    var options = $.extend( {
      namespace: 'jQSpinner',
      forceNumber: true,
      min: null,
      max: null,
      step: 1,
      pad: 0,
      offsetTop: 0,
      offsetLeft: 0,
      loop: true,
      autohide: true,
      labels: {
        top: '+',
        bottom: '-'
      }
    }, options);

    var padZeros = function(val, padding) {
      while (val.length < padding) {
        val = '0' + val;
      }
      return val;
    }

    return this.each(function () {

      var $this     = $(this),
      $controls     = $('<div />', { "class": options.namespace + "-controls" }).hide(),
      $increment    = $('<div></div>', { "class": "up" }).text(options.labels.top),
      $decrement    = $('<div></div>', { "class": "down" }).text(options.labels.bottom),
      min           = $this.attr('min')   !== undefined ? parseInt($this.attr('min'), 10)   : $this.data('min')  !== undefined ? parseInt($this.data('min'), 10)  : options.min,
      max           = $this.attr('max')   !== undefined ? parseInt($this.attr('max'), 10)   : $this.data('max')  !== undefined ? parseInt($this.data('max'), 10)  : options.max,
      step          = $this.attr('step')  !== undefined && $this.attr('step') != 'any' ? parseInt($this.attr('step'), 10)  : $this.data('step') !== undefined ? parseInt($this.data('step'), 10) : options.step,
      pad           = $this.data('pad')   !== undefined ? parseInt($this.data('pad'), 10)   : options.pad,
      loop          = ($this.data('loop') !== undefined && $this.data('loop') === false) || (min == null || max === null) ? false : options.loop,
      setState      = function () {
        $increment.removeClass('disabled').unbind('mouseup').bind('mouseup', increment);
        $decrement.removeClass('disabled').unbind('mouseup').bind('mouseup', decrement);
        max !== null && parseInt($this.val(), 10) >= max && $increment.addClass('disabled').unbind('mouseup');
        min !== null && parseInt($this.val(), 10) <= min && $decrement.addClass('disabled').unbind('mouseup');
      },
      increment     = function (decrement) {
        if(decrement === true) {
          $decrement.addClass('active');
        } else {
          $increment.addClass('active');
        }
        setTimeout(function () {
          $controls.find('div').removeClass('active');
        }, 100);
        var multiplier = (decrement === true) ? -1 : 1,
            newVal = parseInt($this.val(), 10) + (step * multiplier);

        if (newVal % step) {
          newVal -= newVal % step + step;
        }
        if (loop) {
          if (max !== null && newVal > max) {
            newVal = min;
          } else if (min !== null && newVal < min) {
            newVal = max;
          }
          $this.val(newVal);
        } else {
          $this.val(newVal);
          setState();
        }
        
        if(pad) {
          $this.val(padZeros($this.val(), pad));
        }

        $this.trigger('focus.' + options.namespace);
      },

      decrement  = function () {
        increment(true);
      };

      $increment.bind('mousedown.' + options.namespace, false).bind('mouseup.' + options.namespace, increment);
      $decrement.bind('mousedown.' + options.namespace, false).bind('mouseup.' + options.namespace, decrement);
      $controls.append($increment);
      $controls.append($decrement);
      $this.parent().append($controls);

      $this.bind('keydown.' + options.namespace, function (e) {
        var actions = {
          "38": increment,
          "40": decrement
        };
        if (e.keyCode in actions) { actions[e.keyCode](); }
      });

      options.forceNumber && $this.bind('change.' + options.namespace + ' keyup.' + options.namespace, function () {
        $this.val($this.val().replace(/[^0-9\-]/g, ''));
      });

      $this.bind('focus.' + options.namespace, function () {
        if ($controls.is('.active')) {
          return true;
        }
        var left          = this.offsetLeft,
            top           = this.offsetTop,
            height        = $this.outerHeight(),
            width         = $increment.width() || $this.outerWidth(),
            parentHeight  = $this.parent().height();
        $this.css({zIndex: 16});

        $increment.css({
          position: 'absolute',
          top: top - $increment.outerHeight() + options.offsetTop,
          left: left + options.offsetLeft,
          width: width
        });

        $decrement.css({
          position: 'absolute',
          top: top + height - options.offsetTop,
          left: left + options.offsetLeft,
          width: width
        });
        $controls.show().addClass('active');
      });
      if(options.autohide) {
        $this.bind('blur.' + options.namespace, function () {
          $controls.hide().removeClass('active');
        });
      }
      $this.focus().blur();

      if(!$this.val()) {
        $this.val($this.data('min') || '0');
      }
      
      $this.val(padZeros($this.val(), pad));
      if(!loop) {
        setState();
      }

    });

  }

})(jQuery)
