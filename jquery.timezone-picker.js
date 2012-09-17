(function($) {
  $.fn.timezonePicker = function(opts) {
    opts = $.extend({}, $.fn.timezonePicker.defaults, opts);

    $(this).each(function(index, imgElement) {
      var mapElement = document.getElementsByName(imgElement.useMap.replace(/^#/, ''))[0];
      var selectedTimzone = opts.selectedTimzone;
      var $pin = null;

      // Wrap the img tag in a relatively positioned DIV for the pin.
      $(imgElement).wrap('<div class="timezone-picker"></div>').parent().css({
        position: 'relative'
      });

      // Add the pin.
      if (opts.pinUrl) {
        $pin = $('<img src="' + opts.pinUrl + '" />').appendTo(imgElement.parentNode).css('display', 'none');
      }
      else if (opts.pin) {
        $pin = $(imgElement).parent().parent().find(opts.pin).appendTo(imgElement.parentNode).css('display', 'none');
      }

      // Main event handler when a timezone is clicked.
      $(mapElement).find('area').click(function() {
        var areaElement = this;
        // Enable the pin adjustment.
        if ($pin) {
          $pin.css('display', 'block');
          var pinCoords = $(areaElement).attr('data-pin').split(',');
          var pinWidth = parseInt($pin.width() / 2);
          var pinHeight = $pin.height();

          $pin.css({
            position: 'absolute',
            left: (pinCoords[0] - pinWidth) + 'px',
            top: (pinCoords[1] - pinHeight) + 'px'
          });
        }
        // Update the target select list.
        if (opts.target) {
          var timezoneName = $(areaElement).attr('data-timezone');
          if (timezoneName) $(opts.target).val(timezoneName);
        }
        if (opts.countryTarget) {
          var countryName = $(areaElement).attr('data-country');
          if (countryName) $(opts.countryTarget).val(countryName);
        }

        return false;
      });

      // Adjust the timezone if the target changes.
      if (opts.target) {
        $(opts.target).bind('change', function() {
          updateTimezone($(this).val());
        });
      }

      var updateTimezone = function(newTimezone) {
        selectedTimzone = newTimezone;
        $pin.css('display', 'none');
        $(mapElement).find('area').each(function(m, areaElement) {
          if (areaElement.getAttribute('data-timezone') === selectedTimzone) {
            $(areaElement).triggerHandler('click');
            return false;
          }
        });
      };

      // Bind resize event to scale the image map.
      var resizeMap = function() {
        $(mapElement).find('area').each(function(m, areaElement) {

          // Save the original coordinates for further resizing.
          if (!areaElement.originalCoords) {
            areaElement.originalCoords = {
              timezone: areaElement.getAttribute('data-timezone'),
              country: areaElement.getAttribute('data-country'),
              coords: areaElement.getAttribute('coords'),
              pin: areaElement.getAttribute('data-pin'),
            };
          }
          var rescale = imgElement.width/imgElement.getAttribute('width');

          // Adjust the coords attribute.
          var originalCoords = areaElement.originalCoords.coords.split(',');
          var newCoords = new Array();
          for (var j = 0; j < originalCoords.length; j++) {
            newCoords[j] = Math.round(parseInt(originalCoords[j]) * rescale);
          }
          areaElement.setAttribute('coords', newCoords.join(','));

          // Adjust the pin coordinates.
          var pinCoords = areaElement.originalCoords.pin.split(',');
          pinCoords[0] = Math.round(parseInt(pinCoords[0]) * rescale);
          pinCoords[1] = Math.round(parseInt(pinCoords[1]) * rescale);
          areaElement.setAttribute('data-pin', pinCoords.join(','));

          // Fire the change handler on the target.
          if (opts.target) {
            $(opts.target).triggerHandler('change');
          }

        });
      };

      // This is very expensive, so only run if enabled.
      if (opts.responsive) {
        var resizeTimeout = null;
        $(window).resize(function() {
          if (resizeTimeout) {
            clearTimeout(resizeTimeout);
          }
          resizeTimeout = setTimeout(resizeMap, 200);
        });
      }

      // Give the page a slight time to load before selecting the default
      // timezone on the map.
      setTimeout(function() {
        if (opts.responsive && parseInt(imgElement.width) !== parseInt(imgElement.getAttribute('width'))) {
          resizeMap();
        }
        else if (opts.maphilight && $.fn.maphilight) {
          $(imgElement).maphilight(opts);
        }
        if (opts.target) {
          $(opts.target).triggerHandler('change');
        }
      }, 500);

    });
  };

  $.fn.timezonePicker.defaults = {
    // Selector for the pin that should be used. This selector only works in the
    // immediate parent of the image map img tag.
    pin: '.timezone-pin',
    // Specify a URL for the pin image instead of using a DOM element.
    pinUrl: null,
    // Preselect a particular timezone.
    selectedTimzone: null,
    // Pass through options to the jQuery maphilight plugin.
    maphilight: true,
    // Selector for the select list, textfield, or hidden to update upon click.
    target: null,
    // Selector for the select list, textfield, or hidden to update upon click
    // with the specified country.
    countryTarget: null,
    // If this map should automatically adjust its size if scaled. Note that
    // this can be very expensive computationally and will likely have a delay
    // on resize. The maphilight library also is incompatible with this setting
    // and will be disabled.
    responsive: false,

    // Default options passed along to the maphilight plugin.
    fade: false,
    stroke: true,
    strokeColor: 'FFFFFF',
    strokeOpacity: 0.4,
    fillColor: 'FFFFFF',
    fillOpacity: 0.4,
    groupBy: 'data-offset'
  };
})(jQuery);