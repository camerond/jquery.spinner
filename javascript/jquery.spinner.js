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
      },
      dataList: null,
    }, options);

    var padZeros = function(val, padding) {
      var negative = '';
      if(parseInt(val, 10) < 0) {
        negative = '-';
        val = Math.abs(parseInt(val, 10)) + '';
      }
      while (val.length < padding) {
        val = '0' + val;
      }
      return negative + val;
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
      dataList      = options.dataList,
      index         = 0,
      setState      = function () {
        $increment.removeClass('disabled').unbind('mouseup').bind('mouseup', increment);
        $decrement.removeClass('disabled').unbind('mouseup').bind('mouseup', decrement);
        max !== null && $this.data('val') >= max && $increment.addClass('disabled').unbind('mouseup');
        min !== null && $this.data('val') <= min && $decrement.addClass('disabled').unbind('mouseup');
      },
      increment     = function (decrement) {
        if(decrement === true) {
          if(min !== null && $this.data('val') <= min) { return false; }
          $decrement.addClass('active');
        } else {
          if(max !== null && $this.data('val') >= max) { return false; }
          $increment.addClass('active');
        }
        setTimeout(function () {
          $controls.find('div').removeClass('active');
        }, 100);
        var multiplier = (decrement === true) ? -1 : 1,
            newVal = $this.data('val') + (step * multiplier);

        if (newVal % step) {
          newVal -= newVal % step + step;
        }
        if (loop) {
          if (max !== null && newVal > max) {
            newVal = min;
          } else if (min !== null && newVal < min) {
            newVal = max;
          }
          $this.data('val', newVal);
        } else {
          if(!dataList || dataList[newVal]) {
            $this.data('val', newVal);
          }
          setState();
        }
        setValue();
        $this.trigger('focus.' + options.namespace);
      },

      setValue = function () {
        if(dataList) {
          $this.val(dataList[$this.data('val')].value);
        } else {
          $this.val(padZeros($this.data('val'), pad));
        }
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
          "40": decrement,
          "9" : function () {}
        };
        if (e.keyCode in actions) { 
          actions[e.keyCode](); 
        } else {
          return false;
        }
      });

      if($this.attr('list')) {
        dataList = [];
        $('datalist#' + $this.attr('list') + ' option').each(function () {
          dataList.push({
            value: $(this).attr('value') || $(this).text(),
            label: $(this).text()
          });
        });
        $this.attr('list', null);
        min = 0;
        max = dataList.length - 1;
      } 
      
      $this.data('val', 0);
      setValue();

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
