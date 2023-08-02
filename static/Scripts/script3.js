/**
 * @file
 * External links js file.
 */

(function ($, Drupal, drupalSettings) {

    'use strict';
  
    Drupal.extlink = Drupal.extlink || {};
  
    Drupal.extlink.attach = function (context, drupalSettings) {
      if (typeof drupalSettings.data === 'undefined' || !drupalSettings.data.hasOwnProperty('extlink')) {
        return;
      }
  
      // Define the jQuery method (either 'append' or 'prepend') of placing the
      // icon, defaults to 'append'.
      var extIconPlacement = 'append';
      if (drupalSettings.data.extlink.extIconPlacement && drupalSettings.data.extlink.extIconPlacement != '0') {
            extIconPlacement = drupalSettings.data.extlink.extIconPlacement;
          }
  
      // Strip the host name down, removing ports, subdomains, or www.
      var pattern = /^(([^\/:]+?\.)*)([^\.:]{1,})((\.[a-z0-9]{1,253})*)(:[0-9]{1,5})?$/;
      var host = window.location.host.replace(pattern, '$2$3$6');
      var subdomain = window.location.host.replace(host, '');
  
      // Determine what subdomains are considered internal.
      var subdomains;
      if (drupalSettings.data.extlink.extSubdomains) {
        subdomains = '([^/]*\\.)?';
      }
      else if (subdomain === 'www.' || subdomain === '') {
        subdomains = '(www\\.)?';
      }
      else {
        subdomains = subdomain.replace('.', '\\.');
      }
  
      // Whitelisted domains.
      var whitelistedDomains = false;
      if (drupalSettings.data.extlink.whitelistedDomains) {
        whitelistedDomains = [];
        for (var i = 0; i < drupalSettings.data.extlink.whitelistedDomains.length; i++) {
          whitelistedDomains.push(new RegExp('^https?:\\/\\/' + drupalSettings.data.extlink.whitelistedDomains[i].replace(/(\r\n|\n|\r)/gm,'') + '.*$', 'i'));
        }
      }
  
      // Build regular expressions that define an internal link.
      var internal_link = new RegExp('^https?://([^@]*@)?' + subdomains + host, 'i');
  
      // Extra internal link matching.
      var extInclude = false;
      if (drupalSettings.data.extlink.extInclude) {
        extInclude = new RegExp(drupalSettings.data.extlink.extInclude.replace(/\\/, '\\'), 'i');
      }
  
      // Extra external link matching.
      var extExclude = false;
      if (drupalSettings.data.extlink.extExclude) {
        extExclude = new RegExp(drupalSettings.data.extlink.extExclude.replace(/\\/, '\\'), 'i');
      }
  
      // Extra external link CSS selector exclusion.
      var extCssExclude = false;
      if (drupalSettings.data.extlink.extCssExclude) {
        extCssExclude = drupalSettings.data.extlink.extCssExclude;
      }
  
      // Extra external link CSS selector explicit.
      var extCssExplicit = false;
      if (drupalSettings.data.extlink.extCssExplicit) {
        extCssExplicit = drupalSettings.data.extlink.extCssExplicit;
      }
  
      // Find all links which are NOT internal and begin with http as opposed
      // to ftp://, javascript:, etc. other kinds of links.
      // When operating on the 'this' variable, the host has been appended to
      // all links by the browser, even local ones.
      // In jQuery 1.1 and higher, we'd use a filter method here, but it is not
      // available in jQuery 1.0 (Drupal 5 default).
      var external_links = [];
      var mailto_links = [];
      $('a:not([data-extlink]), area:not([data-extlink])', context).each(function (el) {
        try {
          var url = '';
          if (typeof this.href == 'string') {
            url = this.href.toLowerCase();
          }
          // Handle SVG links (xlink:href).
          else if (typeof this.href == 'object') {
            url = this.href.baseVal;
          }
          if (url.indexOf('http') === 0
            && ((!internal_link.test(url) && !(extExclude && extExclude.test(url))) || (extInclude && extInclude.test(url)))
            && !(extCssExclude && $(this).is(extCssExclude))
            && !(extCssExclude && $(this).parents(extCssExclude).length > 0)
            && !(extCssExplicit && $(this).parents(extCssExplicit).length < 1)) {
            var match = false;
            if (whitelistedDomains) {
              for (var i = 0; i < whitelistedDomains.length; i++) {
                if (whitelistedDomains[i].test(url)) {
                  match = true;
                  break;
                }
              }
            }
            if (!match) {
              external_links.push(this);
            }
          }
          // Do not include area tags with begin with mailto: (this prohibits
          // icons from being added to image-maps).
          else if (this.tagName !== 'AREA'
            && url.indexOf('mailto:') === 0
            && !(extCssExclude && $(this).parents(extCssExclude).length > 0)
            && !(extCssExplicit && $(this).parents(extCssExplicit).length < 1)) {
            mailto_links.push(this);
          }
        }
        // IE7 throws errors often when dealing with irregular links, such as:
        // <a href="node/10"></a> Empty tags.
        // <a href="http://user:pass@example.com">example</a> User:pass syntax.
        catch (error) {
          return false;
        }
      });
  
      if (drupalSettings.data.extlink.extClass !== '0' && drupalSettings.data.extlink.extClass !== '') {
        Drupal.extlink.applyClassAndSpan(external_links, drupalSettings.data.extlink.extClass, extIconPlacement);
      }
  
      if (drupalSettings.data.extlink.mailtoClass !== '0' && drupalSettings.data.extlink.mailtoClass !== '') {
        Drupal.extlink.applyClassAndSpan(mailto_links, drupalSettings.data.extlink.mailtoClass, extIconPlacement);
      }
  
      if (drupalSettings.data.extlink.extTarget) {
        // Apply the target attribute to all links.
        $(external_links).filter(function () {
          // Filter out links with target set if option specified.
          return !(drupalSettings.data.extlink.extTargetNoOverride && $(this).is('a[target]'));
        }).attr({target: '_blank'});
  
        // Add noopener rel attribute to combat phishing.
        $(external_links).attr('rel', function (i, val) {
          // If no rel attribute is present, create one with the value noopener.
          if (val === null || typeof val === 'undefined') {
            return 'noopener';
          }
          // Check to see if rel contains noopener. Add what doesn't exist.
          if (val.indexOf('noopener') > -1) {
            if (val.indexOf('noopener') === -1) {
              return val + ' noopener';
            }
            // Noopener exists. Nothing needs to be added.
            else {
              return val;
            }
          }
          // Else, append noopener to val.
          else {
            return val + ' noopener';
          }
        });
      }
  
      if (drupalSettings.data.extlink.extNofollow) {
        $(external_links).attr('rel', function (i, val) {
          // When the link does not have a rel attribute set it to 'nofollow'.
          if (val === null || typeof val === 'undefined') {
            return 'nofollow';
          }
          var target = 'nofollow';
          // Change the target, if not overriding follow.
          if (drupalSettings.data.extlink.extFollowNoOverride) {
            target = 'follow';
          }
          if (val.indexOf(target) === -1) {
            return val + ' nofollow';
          }
          return val;
        });
      }
  
      if (drupalSettings.data.extlink.extNoreferrer) {
        $(external_links).attr('rel', function (i, val) {
          // When the link does not have a rel attribute set it to 'noreferrer'.
          if (val === null || typeof val === 'undefined') {
            return 'noreferrer';
          }
          if (val.indexOf('noreferrer') === -1) {
            return val + ' noreferrer';
          }
          return val;
        });
      }
      // Add to the title attr of ext link a 'New window' value for screen reader.
      if (drupalSettings.data.extlink.extTargetAppendNewWindow) {
        var $links = $(external_links);
        var length = $links.length;
        var i;
        for (i = 0; i < length; i++) {
          var $link = $($links[i]);
          if ($link.attr('target') === '_blank') {
            if ($link.attr('title') !== undefined) {
              var old_title = $link.attr('title');
              //Check if the attribute title has already the 'New Window' as value.
              if (old_title.indexOf(Drupal.t('New Window')) === -1) {
                $link.attr('title', old_title + ' ' + Drupal.t('(New window)'));
              }
            }
            else {
              $link.attr('title', Drupal.t('(New window)'));
            }
          }
        }
      }
  
      Drupal.extlink = Drupal.extlink || {};
  
      // Set up default click function for the external links popup. This should be
      // overridden by modules wanting to alter the popup.
      Drupal.extlink.popupClickHandler = Drupal.extlink.popupClickHandler || function () {
        if (drupalSettings.data.extlink.extAlert) {
          return confirm(drupalSettings.data.extlink.extAlertText);
        }
      };
  
      $(external_links).off("click.extlink");
      $(external_links).on("click.extlink", function (e) {
        return Drupal.extlink.popupClickHandler(e, this);
      });
    };
  
    /**
     * Apply a class and a trailing <span> to all links not containing images.
     *
     * @param {object[]} links
     *   An array of DOM elements representing the links.
     * @param {string} class_name
     *   The class to apply to the links.
     * @param {string} icon_placement
     *   'append' or 'prepend' the icon to the link.
     */
    Drupal.extlink.applyClassAndSpan = function (links, class_name, icon_placement) {
      var $links_to_process;
      if (drupalSettings.data.extlink.extImgClass) {
        $links_to_process = $(links);
      }
      else {
        var links_with_images = $(links).find('img, svg').parents('a');
        $links_to_process = $(links).not(links_with_images);
      }
  
      if (class_name !== '0') {
        $links_to_process.addClass(class_name);
      }
  
      // Add data-extlink attribute.
      $links_to_process.attr('data-extlink', '');
  
      var i;
      var length = $links_to_process.length;
      for (i = 0; i < length; i++) {
        var $link = $($links_to_process[i]);
        if (drupalSettings.data.extlink.extUseFontAwesome) {
          if (class_name === drupalSettings.data.extlink.mailtoClass) {
            $link[icon_placement]('<span class="fa-' + class_name + ' extlink"><span class="' + drupalSettings.data.extlink.extFaMailtoClasses + '" aria-label="' + drupalSettings.data.extlink.mailtoLabel + '"></span></span>');
          }
          else {
            $link[icon_placement]('<span class="fa-' + class_name + ' extlink"><span class="' + drupalSettings.data.extlink.extFaLinkClasses + '" aria-label="' + drupalSettings.data.extlink.extLabel + '"></span></span>');
          }
        }
        else {
          if (class_name === drupalSettings.data.extlink.mailtoClass) {
            $link[icon_placement]('<svg focusable="false" class="' + class_name + '" role="img" aria-label="' + drupalSettings.data.extlink.mailtoLabel + '" xmlns="http://www.w3.org/2000/svg" viewBox="0 10 70 20"><metadata><sfw xmlns="http://ns.adobe.com/SaveForWeb/1.0/"><sliceSourceBounds y="-8160" x="-8165" width="16389" height="16384" bottomLeftOrigin="true"/><optimizationSettings><targetSettings targetSettingsID="0" fileFormat="PNG24Format"><PNG24Format transparency="true" filtered="false" interlaced="false" noMatteColor="false" matteColor="#FFFFFF"/></targetSettings></optimizationSettings></sfw></metadata><title>' + drupalSettings.data.extlink.mailtoLabel + '</title><path d="M56 14H8c-1.1 0-2 0.9-2 2v32c0 1.1 0.9 2 2 2h48c1.1 0 2-0.9 2-2V16C58 14.9 57.1 14 56 14zM50.5 18L32 33.4 13.5 18H50.5zM10 46V20.3l20.7 17.3C31.1 37.8 31.5 38 32 38s0.9-0.2 1.3-0.5L54 20.3V46H10z"/></svg>');
          }
          else {
            $link[icon_placement]('<svg focusable="false" class="' + class_name + '" role="img" aria-label="' + drupalSettings.data.extlink.extLabel + '" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 40"><metadata><sfw xmlns="http://ns.adobe.com/SaveForWeb/1.0/"><sliceSourceBounds y="-8160" x="-8165" width="16389" height="16384" bottomLeftOrigin="true"/><optimizationSettings><targetSettings targetSettingsID="0" fileFormat="PNG24Format"><PNG24Format transparency="true" filtered="false" interlaced="false" noMatteColor="false" matteColor="#FFFFFF"/></targetSettings></optimizationSettings></sfw></metadata><title>' + drupalSettings.data.extlink.extLabel + '</title><path d="M48 26c-1.1 0-2 0.9-2 2v26H10V18h26c1.1 0 2-0.9 2-2s-0.9-2-2-2H8c-1.1 0-2 0.9-2 2v40c0 1.1 0.9 2 2 2h40c1.1 0 2-0.9 2-2V28C50 26.9 49.1 26 48 26z"/><path d="M56 6H44c-1.1 0-2 0.9-2 2s0.9 2 2 2h7.2L30.6 30.6c-0.8 0.8-0.8 2 0 2.8C31 33.8 31.5 34 32 34s1-0.2 1.4-0.6L54 12.8V20c0 1.1 0.9 2 2 2s2-0.9 2-2V8C58 6.9 57.1 6 56 6z"/></svg>');
          }
        }
      }
    };
  
    Drupal.behaviors.extlink = Drupal.behaviors.extlink || {};
    Drupal.behaviors.extlink.attach = function (context, drupalSettings) {
      // Backwards compatibility, for the benefit of modules overriding extlink
      // functionality by defining an "extlinkAttach" global function.
      if (typeof extlinkAttach === 'function') {
        extlinkAttach(context);
      }
      else {
        Drupal.extlink.attach(context, drupalSettings);
      }
    };
  
  })(jQuery, Drupal, drupalSettings);
  ;
  /**
   * @file
   * Webform behaviors.
   */
  
  (function ($, Drupal) {
  
    'use strict';
  
    // Trigger Drupal's attaching of behaviors after the page is
    // completely loaded.
    // @see https://stackoverflow.com/questions/37838430/detect-if-page-is-load-from-back-button
    // @see https://stackoverflow.com/questions/20899274/how-to-refresh-page-on-back-button-click/20899422#20899422
    var isChrome = (/chrom(e|ium)/.test(window.navigator.userAgent.toLowerCase()));
    if (isChrome) {
      // Track back button in navigation.
      // @see https://stackoverflow.com/questions/37838430/detect-if-page-is-load-from-back-button
      var backButton = false;
      if (window.performance) {
        var navEntries = window.performance.getEntriesByType('navigation');
        if (navEntries.length > 0 && navEntries[0].type === 'back_forward') {
          backButton = true;
        }
        else if (window.performance.navigation
          && window.performance.navigation.type === window.performance.navigation.TYPE_BACK_FORWARD) {
          backButton = true;
        }
      }
  
      // If the back button is pressed, delay Drupal's attaching of behaviors.
      if (backButton) {
        var attachBehaviors = Drupal.attachBehaviors;
        Drupal.attachBehaviors = function (context, settings) {
          setTimeout(function (context, settings) {
            attachBehaviors(context, settings);
          }, 300);
        };
      }
    }
  
  })(jQuery, Drupal);
  ;
  /**
  * DO NOT EDIT THIS FILE.
  * See the following change record for more information,
  * https://www.drupal.org/node/2815083
  * @preserve
  **/
  (function ($, once) {
    var deprecatedMessageSuffix = "is deprecated in Drupal 9.3.0 and will be removed in Drupal 10.0.0. Use the core/once library instead. See https://www.drupal.org/node/3158256";
    var originalJQOnce = $.fn.once;
    var originalJQRemoveOnce = $.fn.removeOnce;
    $.fn.once = function jQueryOnce(id) {
      Drupal.deprecationError({
        message: "jQuery.once() ".concat(deprecatedMessageSuffix)
      });
      return originalJQOnce.apply(this, [id]);
    };
    $.fn.removeOnce = function jQueryRemoveOnce(id) {
      Drupal.deprecationError({
        message: "jQuery.removeOnce() ".concat(deprecatedMessageSuffix)
      });
      return originalJQRemoveOnce.apply(this, [id]);
    };
    var drupalOnce = once;
    function augmentedOnce(id, selector, context) {
      originalJQOnce.apply($(selector, context), [id]);
      return drupalOnce(id, selector, context);
    }
    function remove(id, selector, context) {
      originalJQRemoveOnce.apply($(selector, context), [id]);
      return drupalOnce.remove(id, selector, context);
    }
    window.once = Object.assign(augmentedOnce, drupalOnce, {
      remove: remove
    });
  })(jQuery, once);;
  /**
  * DO NOT EDIT THIS FILE.
  * See the following change record for more information,
  * https://www.drupal.org/node/2815083
  * @preserve
  **/
  (function ($, Drupal) {
    var states = {
      postponed: []
    };
    Drupal.states = states;
    function invert(a, invertState) {
      return invertState && typeof a !== 'undefined' ? !a : a;
    }
    function _compare2(a, b) {
      if (a === b) {
        return typeof a === 'undefined' ? a : true;
      }
      return typeof a === 'undefined' || typeof b === 'undefined';
    }
    function ternary(a, b) {
      if (typeof a === 'undefined') {
        return b;
      }
      if (typeof b === 'undefined') {
        return a;
      }
      return a && b;
    }
    Drupal.behaviors.states = {
      attach: function attach(context, settings) {
        var $states = $(context).find('[data-drupal-states]');
        var il = $states.length;
        var _loop = function _loop(i) {
          var config = JSON.parse($states[i].getAttribute('data-drupal-states'));
          Object.keys(config || {}).forEach(function (state) {
            new states.Dependent({
              element: $($states[i]),
              state: states.State.sanitize(state),
              constraints: config[state]
            });
          });
        };
        for (var i = 0; i < il; i++) {
          _loop(i);
        }
        while (states.postponed.length) {
          states.postponed.shift()();
        }
      }
    };
    states.Dependent = function (args) {
      var _this = this;
      $.extend(this, {
        values: {},
        oldValue: null
      }, args);
      this.dependees = this.getDependees();
      Object.keys(this.dependees || {}).forEach(function (selector) {
        _this.initializeDependee(selector, _this.dependees[selector]);
      });
    };
    states.Dependent.comparisons = {
      RegExp: function RegExp(reference, value) {
        return reference.test(value);
      },
      Function: function Function(reference, value) {
        return reference(value);
      },
      Number: function Number(reference, value) {
        return typeof value === 'string' ? _compare2(reference.toString(), value) : _compare2(reference, value);
      }
    };
    states.Dependent.prototype = {
      initializeDependee: function initializeDependee(selector, dependeeStates) {
        var _this2 = this;
        this.values[selector] = {};
        Object.keys(dependeeStates).forEach(function (i) {
          var state = dependeeStates[i];
          if ($.inArray(state, dependeeStates) === -1) {
            return;
          }
          state = states.State.sanitize(state);
          _this2.values[selector][state.name] = null;
          $(selector).on("state:".concat(state), {
            selector: selector,
            state: state
          }, function (e) {
            _this2.update(e.data.selector, e.data.state, e.value);
          });
          new states.Trigger({
            selector: selector,
            state: state
          });
        });
      },
      compare: function compare(reference, selector, state) {
        var value = this.values[selector][state.name];
        if (reference.constructor.name in states.Dependent.comparisons) {
          return states.Dependent.comparisons[reference.constructor.name](reference, value);
        }
        return _compare2(reference, value);
      },
      update: function update(selector, state, value) {
        if (value !== this.values[selector][state.name]) {
          this.values[selector][state.name] = value;
          this.reevaluate();
        }
      },
      reevaluate: function reevaluate() {
        var value = this.verifyConstraints(this.constraints);
        if (value !== this.oldValue) {
          this.oldValue = value;
          value = invert(value, this.state.invert);
          this.element.trigger({
            type: "state:".concat(this.state),
            value: value,
            trigger: true
          });
        }
      },
      verifyConstraints: function verifyConstraints(constraints, selector) {
        var result;
        if ($.isArray(constraints)) {
          var hasXor = $.inArray('xor', constraints) === -1;
          var len = constraints.length;
          for (var i = 0; i < len; i++) {
            if (constraints[i] !== 'xor') {
              var constraint = this.checkConstraints(constraints[i], selector, i);
              if (constraint && (hasXor || result)) {
                return hasXor;
              }
              result = result || constraint;
            }
          }
        } else if ($.isPlainObject(constraints)) {
          for (var n in constraints) {
            if (constraints.hasOwnProperty(n)) {
              result = ternary(result, this.checkConstraints(constraints[n], selector, n));
              if (result === false) {
                return false;
              }
            }
          }
        }
        return result;
      },
      checkConstraints: function checkConstraints(value, selector, state) {
        if (typeof state !== 'string' || /[0-9]/.test(state[0])) {
          state = null;
        } else if (typeof selector === 'undefined') {
          selector = state;
          state = null;
        }
        if (state !== null) {
          state = states.State.sanitize(state);
          return invert(this.compare(value, selector, state), state.invert);
        }
        return this.verifyConstraints(value, selector);
      },
      getDependees: function getDependees() {
        var cache = {};
        var _compare = this.compare;
        this.compare = function (reference, selector, state) {
          (cache[selector] || (cache[selector] = [])).push(state.name);
        };
        this.verifyConstraints(this.constraints);
        this.compare = _compare;
        return cache;
      }
    };
    states.Trigger = function (args) {
      $.extend(this, args);
      if (this.state in states.Trigger.states) {
        this.element = $(this.selector);
        if (!this.element.data("trigger:".concat(this.state))) {
          this.initialize();
        }
      }
    };
    states.Trigger.prototype = {
      initialize: function initialize() {
        var _this3 = this;
        var trigger = states.Trigger.states[this.state];
        if (typeof trigger === 'function') {
          trigger.call(window, this.element);
        } else {
          Object.keys(trigger || {}).forEach(function (event) {
            _this3.defaultTrigger(event, trigger[event]);
          });
        }
        this.element.data("trigger:".concat(this.state), true);
      },
      defaultTrigger: function defaultTrigger(event, valueFn) {
        var oldValue = valueFn.call(this.element);
        this.element.on(event, $.proxy(function (e) {
          var value = valueFn.call(this.element, e);
          if (oldValue !== value) {
            this.element.trigger({
              type: "state:".concat(this.state),
              value: value,
              oldValue: oldValue
            });
            oldValue = value;
          }
        }, this));
        states.postponed.push($.proxy(function () {
          this.element.trigger({
            type: "state:".concat(this.state),
            value: oldValue,
            oldValue: null
          });
        }, this));
      }
    };
    states.Trigger.states = {
      empty: {
        keyup: function keyup() {
          return this.val() === '';
        },
        change: function change() {
          return this.val() === '';
        }
      },
      checked: {
        change: function change() {
          var checked = false;
          this.each(function () {
            checked = $(this).prop('checked');
            return !checked;
          });
          return checked;
        }
      },
      value: {
        keyup: function keyup() {
          if (this.length > 1) {
            return this.filter(':checked').val() || false;
          }
          return this.val();
        },
        change: function change() {
          if (this.length > 1) {
            return this.filter(':checked').val() || false;
          }
          return this.val();
        }
      },
      collapsed: {
        collapsed: function collapsed(e) {
          return typeof e !== 'undefined' && 'value' in e ? e.value : !this.is('[open]');
        }
      }
    };
    states.State = function (state) {
      this.pristine = state;
      this.name = state;
      var process = true;
      do {
        while (this.name.charAt(0) === '!') {
          this.name = this.name.substring(1);
          this.invert = !this.invert;
        }
        if (this.name in states.State.aliases) {
          this.name = states.State.aliases[this.name];
        } else {
          process = false;
        }
      } while (process);
    };
    states.State.sanitize = function (state) {
      if (state instanceof states.State) {
        return state;
      }
      return new states.State(state);
    };
    states.State.aliases = {
      enabled: '!disabled',
      invisible: '!visible',
      invalid: '!valid',
      untouched: '!touched',
      optional: '!required',
      filled: '!empty',
      unchecked: '!checked',
      irrelevant: '!relevant',
      expanded: '!collapsed',
      open: '!collapsed',
      closed: 'collapsed',
      readwrite: '!readonly'
    };
    states.State.prototype = {
      invert: false,
      toString: function toString() {
        return this.name;
      }
    };
    var $document = $(document);
    $document.on('state:disabled', function (e) {
      if (e.trigger) {
        $(e.target).closest('.js-form-item, .js-form-submit, .js-form-wrapper').toggleClass('form-disabled', e.value).find('select, input, textarea').prop('disabled', e.value);
      }
    });
    $document.on('state:required', function (e) {
      if (e.trigger) {
        if (e.value) {
          var label = "label".concat(e.target.id ? "[for=".concat(e.target.id, "]") : '');
          var $label = $(e.target).attr({
            required: 'required',
            'aria-required': 'true'
          }).closest('.js-form-item, .js-form-wrapper').find(label);
          if (!$label.hasClass('js-form-required').length) {
            $label.addClass('js-form-required form-required');
          }
        } else {
          $(e.target).removeAttr('required aria-required').closest('.js-form-item, .js-form-wrapper').find('label.js-form-required').removeClass('js-form-required form-required');
        }
      }
    });
    $document.on('state:visible', function (e) {
      if (e.trigger) {
        $(e.target).closest('.js-form-item, .js-form-submit, .js-form-wrapper').toggle(e.value);
      }
    });
    $document.on('state:checked', function (e) {
      if (e.trigger) {
        $(e.target).closest('.js-form-item, .js-form-wrapper').find('input').prop('checked', e.value).trigger('change');
      }
    });
    $document.on('state:collapsed', function (e) {
      if (e.trigger) {
        if ($(e.target).is('[open]') === e.value) {
          $(e.target).find('> summary').trigger('click');
        }
      }
    });
  })(jQuery, Drupal);;
  /**
   * @file
   * Extends core/misc/states.js.
   */
  (function($) {
  
    // Unbind core state.js from document first so we can then override below.
    $(document).unbind('state:disabled');
  
    /**
     * Global state change handlers. These are bound to "document" to cover all
     * elements whose state changes. Events sent to elements within the page
     * bubble up to these handlers. We use this system so that themes and modules
     * can override these state change handlers for particular parts of a page.
     */
    $(document).bind('state:disabled', function(e) {
      // Only act when this change was triggered by a dependency and not by the
      // element monitoring itself.
      if (e.trigger) {
        $(e.target)
          .attr('disabled', e.value)
          .closest('.form-item, .form-submit, .form-wrapper').toggleClass('form-disabled', e.value)
          .find(':input').attr('disabled', e.value);
  
        // Note: WebKit nightlies don't reflect that change correctly.
        // See https://bugs.webkit.org/show_bug.cgi?id=23789
      }
    });
  
  })(jQuery);
  ;
  /**
   * @file
   * JavaScript behaviors for custom webform #states.
   */
  
  (function ($, Drupal, once) {
  
    'use strict';
  
    Drupal.webform = Drupal.webform || {};
    Drupal.webform.states = Drupal.webform.states || {};
    Drupal.webform.states.slideDown = Drupal.webform.states.slideDown || {};
    Drupal.webform.states.slideDown.duration = 'slow';
    Drupal.webform.states.slideUp = Drupal.webform.states.slideUp || {};
    Drupal.webform.states.slideUp.duration = 'fast';
  
    /* ************************************************************************ */
    // jQuery functions.
    /* ************************************************************************ */
  
    /**
     * Check if an element has a specified data attribute.
     *
     * @param {string} data
     *   The data attribute name.
     *
     * @return {boolean}
     *   TRUE if an element has a specified data attribute.
     */
    $.fn.hasData = function (data) {
      return (typeof this.data(data) !== 'undefined');
    };
  
    /**
     * Check if element is within the webform or not.
     *
     * @return {boolean}
     *   TRUE if element is within the webform.
     */
    $.fn.isWebform = function () {
      return $(this).closest('form.webform-submission-form, form[id^="webform"], form[data-is-webform]').length ? true : false;
    };
  
    /**
     * Check if element is to be treated as a webform element.
     *
     * @return {boolean}
     *   TRUE if element is to be treated as a webform element.
     */
    $.fn.isWebformElement = function () {
      return ($(this).isWebform() || $(this).closest('[data-is-webform-element]').length) ? true : false;
    };
  
    /* ************************************************************************ */
    // Trigger.
    /* ************************************************************************ */
  
    // The change event is triggered by cut-n-paste and select menus.
    // Issue #2445271: #states element empty check not triggered on mouse
    // based paste.
    // @see https://www.drupal.org/node/2445271
    Drupal.states.Trigger.states.empty.change = function change() {
      return this.val() === '';
    };
  
    /* ************************************************************************ */
    // Dependents.
    /* ************************************************************************ */
  
    // Apply solution included in #1962800 patch.
    // Issue #1962800: Form #states not working with literal integers as
    // values in IE11.
    // @see https://www.drupal.org/project/drupal/issues/1962800
    // @see https://www.drupal.org/files/issues/core-states-not-working-with-integers-ie11_1962800_46.patch
    //
    // This issue causes pattern, less than, and greater than support to break.
    // @see https://www.drupal.org/project/webform/issues/2981724
    var states = Drupal.states;
    Drupal.states.Dependent.prototype.compare = function compare(reference, selector, state) {
      var value = this.values[selector][state.name];
  
      var name = reference.constructor.name;
      if (!name) {
        name = $.type(reference);
  
        name = name.charAt(0).toUpperCase() + name.slice(1);
      }
      if (name in states.Dependent.comparisons) {
        return states.Dependent.comparisons[name](reference, value);
      }
  
      if (reference.constructor.name in states.Dependent.comparisons) {
        return states.Dependent.comparisons[reference.constructor.name](reference, value);
      }
  
      return _compare2(reference, value);
    };
    function _compare2(a, b) {
      if (a === b) {
        return typeof a === 'undefined' ? a : true;
      }
  
      return typeof a === 'undefined' || typeof b === 'undefined';
    }
  
    // Adds pattern, less than, and greater than support to #state API.
    // @see http://drupalsun.com/julia-evans/2012/03/09/extending-form-api-states-regular-expressions
    Drupal.states.Dependent.comparisons.Object = function (reference, value) {
      if ('pattern' in reference) {
        return (new RegExp(reference['pattern'])).test(value);
      }
      else if ('!pattern' in reference) {
        return !((new RegExp(reference['!pattern'])).test(value));
      }
      else if ('less' in reference) {
        return (value !== '' && parseFloat(reference['less']) > parseFloat(value));
      }
      else if ('less_equal' in reference) {
        return (value !== '' && parseFloat(reference['less_equal']) >= parseFloat(value));
      }
      else if ('greater' in reference) {
        return (value !== '' && parseFloat(reference['greater']) < parseFloat(value));
      }
      else if ('greater_equal' in reference) {
        return (value !== '' && parseFloat(reference['greater_equal']) <= parseFloat(value));
      }
      else if ('between' in reference || '!between' in reference) {
        if (value === '') {
          return false;
        }
  
        var between = reference['between'] || reference['!between'];
        var betweenParts = between.split(':');
        var greater = betweenParts[0];
        var less = (typeof betweenParts[1] !== 'undefined') ? betweenParts[1] : null;
        var isGreaterThan = (greater === null || greater === '' || parseFloat(value) >= parseFloat(greater));
        var isLessThan = (less === null || less === '' || parseFloat(value) <= parseFloat(less));
        var result = (isGreaterThan && isLessThan);
        return (reference['!between']) ? !result : result;
      }
      else {
        return reference.indexOf(value) !== false;
      }
    };
  
    /* ************************************************************************ */
    // States events.
    /* ************************************************************************ */
  
    var $document = $(document);
  
    $document.on('state:required', function (e) {
      if (e.trigger && $(e.target).isWebformElement()) {
        var $target = $(e.target);
        // Fix #required file upload.
        // @see Issue #2860529: Conditional required File upload field don't work.
        toggleRequired($target.find('input[type="file"]'), e.value);
  
        // Fix #required for radios and likert.
        // @see Issue #2856795: If radio buttons are required but not filled form is nevertheless submitted.
        if ($target.is('.js-form-type-radios, .js-form-type-webform-radios-other, .js-webform-type-radios, .js-webform-type-webform-radios-other, .js-webform-type-webform-entity-radios, .webform-likert-table')) {
          $target.toggleClass('required', e.value);
          toggleRequired($target.find('input[type="radio"]'), e.value);
        }
  
        // Fix #required for checkboxes.
        // @see Issue #2938414: Checkboxes don't support #states required.
        // @see checkboxRequiredhandler
        if ($target.is('.js-form-type-checkboxes, .js-form-type-webform-checkboxes-other, .js-webform-type-checkboxes, .js-webform-type-webform-checkboxes-other')) {
          $target.toggleClass('required', e.value);
          var $checkboxes = $target.find('input[type="checkbox"]');
          if (e.value) {
            // Add event handler.
            $checkboxes.on('click', statesCheckboxesRequiredEventHandler);
            // Initialize and add required attribute.
            checkboxesRequired($target);
          }
          else {
            // Remove event handler.
            $checkboxes.off('click', statesCheckboxesRequiredEventHandler);
            // Remove required attribute.
            toggleRequired($checkboxes, false);
          }
        }
  
        // Fix #required for tableselect.
        // @see Issue #3212581: Table select does not trigger client side validation
        if ($target.is('.js-webform-tableselect')) {
          $target.toggleClass('required', e.value);
          var isMultiple = $target.is('[multiple]');
          if (isMultiple) {
            // Checkboxes.
            var $tbody = $target.find('tbody');
            var $checkboxes = $tbody.find('input[type="checkbox"]');
            copyRequireMessage($target, $checkboxes);
            if (e.value) {
              $checkboxes.on('click change', statesCheckboxesRequiredEventHandler);
              checkboxesRequired($tbody);
            }
            else {
              $checkboxes.off('click change ', statesCheckboxesRequiredEventHandler);
              toggleRequired($tbody, false);
            }
          }
          else {
            // Radios.
            var $radios = $target.find('input[type="radio"]');
            copyRequireMessage($target, $radios);
            toggleRequired($radios, e.value);
          }
        }
  
        // Fix required label for elements without the for attribute.
        // @see Issue #3145300: Conditional Visible Select Other not working.
        if ($target.is('.js-form-type-webform-select-other, .js-webform-type-webform-select-other')) {
          var $select = $target.find('select');
          toggleRequired($select, e.value);
          copyRequireMessage($target, $select);
        }
        if ($target.find('> label:not([for])').length) {
          $target.find('> label').toggleClass('js-form-required form-required', e.value);
        }
  
        // Fix required label for checkboxes and radios.
        // @see Issue #2938414: Checkboxes don't support #states required
        // @see Issue #2731991: Setting required on radios marks all options required.
        // @see Issue #2856315: Conditional Logic - Requiring Radios in a Fieldset.
        // Fix #required for fieldsets.
        // @see Issue #2977569: Hidden fieldsets that become visible with conditional logic cannot be made required.
        if ($target.is('.js-webform-type-radios, .js-webform-type-checkboxes, fieldset')) {
          $target.find('legend span.fieldset-legend:not(.visually-hidden)').toggleClass('js-form-required form-required', e.value);
        }
  
        // Issue #2986017: Fieldsets shouldn't have required attribute.
        if ($target.is('fieldset')) {
          $target.removeAttr('required aria-required');
        }
      }
    });
  
    $document.on('state:checked', function (e) {
      if (e.trigger) {
        $(e.target).trigger('change');
      }
    });
  
    $document.on('state:readonly', function (e) {
      if (e.trigger && $(e.target).isWebformElement()) {
        $(e.target).prop('readonly', e.value).closest('.js-form-item, .js-form-wrapper').toggleClass('webform-readonly', e.value).find('input, textarea').prop('readonly', e.value);
  
        // Trigger webform:readonly.
        $(e.target).trigger('webform:readonly')
          .find('select, input, textarea, button').trigger('webform:readonly');
      }
    });
  
    $document.on('state:visible state:visible-slide', function (e) {
      if (e.trigger && $(e.target).isWebformElement()) {
        if (e.value) {
          $(':input', e.target).addBack().each(function () {
            restoreValueAndRequired(this);
            triggerEventHandlers(this);
          });
        }
        else {
          // @see https://www.sitepoint.com/jquery-function-clear-form-data/
          $(':input', e.target).addBack().each(function () {
            backupValueAndRequired(this);
            clearValueAndRequired(this);
            triggerEventHandlers(this);
          });
        }
      }
    });
  
    $document.on('state:visible-slide', function (e) {
      if (e.trigger && $(e.target).isWebformElement()) {
        var effect = e.value ? 'slideDown' : 'slideUp';
        var duration = Drupal.webform.states[effect].duration;
        $(e.target).closest('.js-form-item, .js-form-submit, .js-form-wrapper')[effect](duration);
      }
    });
    Drupal.states.State.aliases['invisible-slide'] = '!visible-slide';
  
    $document.on('state:disabled', function (e) {
      if (e.trigger && $(e.target).isWebformElement()) {
        // Make sure disabled property is set before triggering webform:disabled.
        // Copied from: core/misc/states.js
        $(e.target)
          .prop('disabled', e.value)
          .closest('.js-form-item, .js-form-submit, .js-form-wrapper').toggleClass('form-disabled', e.value)
          .find('select, input, textarea, button').prop('disabled', e.value);
  
        // Never disable hidden file[fids] because the existing values will
        // be completely lost when the webform is submitted.
        var fileElements = $(e.target)
          .find(':input[type="hidden"][name$="[fids]"]');
        if (fileElements.length) {
          // Remove 'disabled' attribute from fieldset which will block
          // all disabled elements from being submitted.
          if ($(e.target).is('fieldset')) {
            $(e.target).prop('disabled', false);
          }
          fileElements.removeAttr('disabled');
        }
  
        // Trigger webform:disabled.
        $(e.target).trigger('webform:disabled')
          .find('select, input, textarea, button').trigger('webform:disabled');
      }
    });
  
    /* ************************************************************************ */
    // Behaviors.
    /* ************************************************************************ */
  
    /**
     * Adds HTML5 validation to required checkboxes.
     *
     * @type {Drupal~behavior}
     *
     * @see https://www.drupal.org/project/webform/issues/3068998
     */
    Drupal.behaviors.webformCheckboxesRequired = {
      attach: function (context) {
        $(once('webform-checkboxes-required', '.js-form-type-checkboxes.required, .js-form-type-webform-checkboxes-other.required, .js-webform-type-checkboxes.required, .js-webform-type-webform-checkboxes-other.required, .js-webform-type-webform-radios-other.checkboxes', context))
          .each(function () {
            var $element = $(this);
            $element.find('input[type="checkbox"]').on('click', statesCheckboxesRequiredEventHandler);
            setTimeout(function () {checkboxesRequired($element);});
          });
      }
    };
  
    /**
     * Adds HTML5 validation to required radios.
     *
     * @type {Drupal~behavior}
     *
     * @see https://www.drupal.org/project/webform/issues/2856795
     */
    Drupal.behaviors.webformRadiosRequired = {
      attach: function (context) {
        $(once('webform-radios-required', '.js-form-type-radios, .js-form-type-webform-radios-other, .js-webform-type-radios, .js-webform-type-webform-radios-other, .js-webform-type-webform-entity-radios, .js-webform-type-webform-scale', context))
          .each(function () {
            var $element = $(this);
            setTimeout(function () {radiosRequired($element);});
          });
      }
    };
  
   /**
     * Adds HTML5 validation to required table select.
     *
     * @type {Drupal~behavior}
     *
     * @see https://www.drupal.org/project/webform/issues/2856795
     */
    Drupal.behaviors.webformTableSelectRequired = {
      attach: function (context) {
        $(once('webform-tableselect-required','.js-webform-tableselect.required', context))
          .each(function () {
            var $element = $(this);
            var $tbody = $element.find('tbody');
            var isMultiple = $element.is('[multiple]');
  
            if (isMultiple) {
              // Check all checkbox triggers checkbox 'change' event on
              // select and deselect all.
              // @see Drupal.tableSelect
              $tbody.find('input[type="checkbox"]').on('click change', function () {
                checkboxesRequired($tbody);
              });
            }
  
            setTimeout(function () {
              isMultiple ? checkboxesRequired($tbody) : radiosRequired($element);
            });
          });
      }
    };
  
    /**
     * Add HTML5 multiple checkboxes required validation.
     *
     * @param {jQuery} $element
     *   An jQuery object containing HTML5 radios.
     *
     * @see https://stackoverflow.com/a/37825072/145846
     */
    function checkboxesRequired($element) {
      var $firstCheckbox = $element.find('input[type="checkbox"]').first();
      var isChecked = $element.find('input[type="checkbox"]').is(':checked');
      toggleRequired($firstCheckbox, !isChecked);
      copyRequireMessage($element, $firstCheckbox);
    }
  
    /**
     * Add HTML5 radios required validation.
     *
     * @param {jQuery} $element
     *   An jQuery object containing HTML5 radios.
     *
     * @see https://www.drupal.org/project/webform/issues/2856795
     */
    function radiosRequired($element) {
      var $radios = $element.find('input[type="radio"]');
      var isRequired = $element.hasClass('required');
      toggleRequired($radios, isRequired);
      copyRequireMessage($element, $radios);
    }
  
    /* ************************************************************************ */
    // Event handlers.
    /* ************************************************************************ */
  
    /**
     * Trigger #states API HTML5 multiple checkboxes required validation.
     *
     * @see https://stackoverflow.com/a/37825072/145846
     */
    function statesCheckboxesRequiredEventHandler() {
      var $element = $(this).closest('.js-webform-type-checkboxes, .js-webform-type-webform-checkboxes-other');
      checkboxesRequired($element);
    }
  
    /**
     * Trigger an input's event handlers.
     *
     * @param {element} input
     *   An input.
     */
    function triggerEventHandlers(input) {
      var $input = $(input);
      var type = input.type;
      var tag = input.tagName.toLowerCase();
      // Add 'webform.states' as extra parameter to event handlers.
      // @see Drupal.behaviors.webformUnsaved
      var extraParameters = ['webform.states'];
      if (type === 'checkbox' || type === 'radio') {
        $input
          .trigger('change', extraParameters)
          .trigger('blur', extraParameters);
      }
      else if (tag === 'select') {
        // Do not trigger the onchange event for Address element's country code
        // when it is initialized.
        // @see \Drupal\address\Element\Country
        if ($input.closest('.webform-type-address').length) {
          if (!$input.data('webform-states-address-initialized')
            && $input.attr('autocomplete') === 'country'
            && $input.val() === $input.find("option[selected]").attr('value')) {
            return;
          }
          $input.data('webform-states-address-initialized', true);
        }
  
        $input
          .trigger('change', extraParameters)
          .trigger('blur', extraParameters);
      }
      else if (type !== 'submit' && type !== 'button' && type !== 'file') {
        // Make sure input mask is removed and then reset when value is restored.
        // @see https://www.drupal.org/project/webform/issues/3124155
        // @see https://www.drupal.org/project/webform/issues/3202795
        var hasInputMask = ($.fn.inputmask && $input.hasClass('js-webform-input-mask'));
        hasInputMask && $input.inputmask('remove');
  
        $input
          .trigger('input', extraParameters)
          .trigger('change', extraParameters)
          .trigger('keydown', extraParameters)
          .trigger('keyup', extraParameters)
          .trigger('blur', extraParameters);
  
        hasInputMask && $input.inputmask();
      }
    }
  
    /* ************************************************************************ */
    // Backup and restore value functions.
    /* ************************************************************************ */
  
    /**
     * Backup an input's current value and required attribute
     *
     * @param {element} input
     *   An input.
     */
    function backupValueAndRequired(input) {
      var $input = $(input);
      var type = input.type;
      var tag = input.tagName.toLowerCase(); // Normalize case.
  
      // Backup required.
      if ($input.prop('required') && !$input.hasData('webform-required')) {
        $input.data('webform-required', true);
      }
  
      // Backup value.
      if (!$input.hasData('webform-value')) {
        if (type === 'checkbox' || type === 'radio') {
          $input.data('webform-value', $input.prop('checked'));
        }
        else if (tag === 'select') {
          var values = [];
          $input.find('option:selected').each(function (i, option) {
            values[i] = option.value;
          });
          $input.data('webform-value', values);
        }
        else if (type !== 'submit' && type !== 'button') {
          $input.data('webform-value', input.value);
        }
      }
    }
  
    /**
     * Restore an input's value and required attribute.
     *
     * @param {element} input
     *   An input.
     */
    function restoreValueAndRequired(input) {
      var $input = $(input);
  
      // Restore value.
      var value = $input.data('webform-value');
      if (typeof value !== 'undefined') {
        var type = input.type;
        var tag = input.tagName.toLowerCase(); // Normalize case.
  
        if (type === 'checkbox' || type === 'radio') {
          $input.prop('checked', value);
        }
        else if (tag === 'select') {
          $.each(value, function (i, option_value) {
            // Prevent "Syntax error, unrecognized expression" error by
            // escaping single quotes.
            // @see https://forum.jquery.com/topic/escape-characters-prior-to-using-selector
            option_value = option_value.replace(/'/g, "\\\'");
            $input.find("option[value='" + option_value + "']").prop('selected', true);
          });
        }
        else if (type !== 'submit' && type !== 'button') {
          input.value = value;
        }
        $input.removeData('webform-value');
      }
  
      // Restore required.
      var required = $input.data('webform-required');
      if (typeof required !== 'undefined') {
        if (required) {
          $input.prop('required', true);
        }
        $input.removeData('webform-required');
      }
    }
  
    /**
     * Clear an input's value and required attributes.
     *
     * @param {element} input
     *   An input.
     */
    function clearValueAndRequired(input) {
      var $input = $(input);
  
      // Check for #states no clear attribute.
      // @see https://css-tricks.com/snippets/jquery/make-an-jquery-hasattr/
      if ($input.closest('[data-webform-states-no-clear]').length) {
        return;
      }
  
      // Clear value.
      var type = input.type;
      var tag = input.tagName.toLowerCase(); // Normalize case.
      if (type === 'checkbox' || type === 'radio') {
        $input.prop('checked', false);
      }
      else if (tag === 'select') {
        if ($input.find('option[value=""]').length) {
          $input.val('');
        }
        else {
          input.selectedIndex = -1;
        }
      }
      else if (type !== 'submit' && type !== 'button') {
        input.value = (type === 'color') ? '#000000' : '';
      }
  
      // Clear required.
      $input.prop('required', false);
    }
  
    /* ************************************************************************ */
    // Helper functions.
    /* ************************************************************************ */
  
    /**
     * Toggle an input's required attributes.
     *
     * @param {element} $input
     *   An input.
     * @param {boolean} required
     *   Is input required.
     */
    function toggleRequired($input, required) {
      var isCheckboxOrRadio = ($input.attr('type') === 'radio' || $input.attr('type') === 'checkbox');
      if (required) {
        if (isCheckboxOrRadio) {
          $input.attr({'required': 'required'});
        }
        else {
          $input.attr({'required': 'required', 'aria-required': 'true'});
        }
      }
      else {
        if (isCheckboxOrRadio) {
          $input.removeAttr('required');
        }
        else {
          $input.removeAttr('required aria-required');
        }
      }
    }
  
    /**
     * Copy the clientside_validation.module's message.
     *
     * @param {jQuery} $source
     *   The source element.
     * @param {jQuery} $destination
     *   The destination element.
     */
    function copyRequireMessage($source, $destination) {
      if ($source.attr('data-msg-required')) {
        $destination.attr('data-msg-required', $source.attr('data-msg-required'));
      }
    }
  
  })(jQuery, Drupal, once);
  ;
  /**
   * @file
   * JavaScript behaviors for custom webform #states.
   */
  
  (function ($, Drupal) {
  
    'use strict';
  
    $(document).on('state:required', function (e) {
      if (e.trigger && $(e.target).isWebform()) {
        var $target = $(e.target);
  
        // @see Issue #2856315: Conditional Logic - Requiring Radios in a Fieldset.
        // Fix #required for fieldsets.
        if ($target.is('.js-form-wrapper.panel')) {
          if (e.value) {
            $target.find('.panel-heading .panel-title').addClass('js-form-required form-required');
          }
          else {
            $target.find('.panel-heading .panel-title').removeClass('js-form-required form-required');
          }
        }
  
      }
    });
  
  })(jQuery, Drupal);
  ;
  /**
   * @file
   * CKEditor Accordion functionality.
   */
  
  (function ($, Drupal, drupalSettings) {
    'use strict';
    Drupal.behaviors.ckeditorAccordion = {
      attach: function (context, settings) {
  
        // Create accordion functionality if the required elements exist is available.
        var $ckeditorAccordion = $('.ckeditor-accordion');
        if ($ckeditorAccordion.length > 0) {
          // Create simple accordion mechanism for each tab.
          $ckeditorAccordion.each(function () {
            var $accordion = $(this);
            if ($accordion.hasClass('styled')) {
              return;
            }
            // The first one is the correct one.
            if (!drupalSettings.ckeditorAccordion.accordionStyle.collapseAll) {
              $accordion.children('dt:first').addClass('active');
              $accordion.children('dd:first').addClass('active');
              $accordion.children('dd:first').css('display', 'block');
            }
            // Turn the accordion tabs to links so that the content is accessible & can be traversed using keyboard.
            $accordion.children('dt').each(function () {
              var $tab = $(this);
              var tabText = $tab.text().trim();
              var toggleClass = $tab.hasClass('active') ? ' active' : '';
              $tab('<span class="ckeditor-accordion-toggle' + toggleClass + '"></span><a class="ckeditor-accordion-toggler" href="#" role="button">' + tabText + '</a>');
            });
            $accordion.children('dd').each(function () {
              var $content = $(this);
              $content.addClass('closed');
            });
            // Wrap the accordion in a div element so that quick edit function shows the source correctly.
            $accordion.addClass('styled').removeClass('ckeditor-accordion').wrap('<div class="ckeditor-accordion-container"></div>');
  
            // Trigger an ckeditorAccordionAttached event to let other frameworks know that the accordion has been attached.
            $accordion.trigger('ckeditorAccordionAttached');
          });
  
          // Add click event to body once because quick edits & ajax calls might reset the HTML.
          $('body').once('ckeditorAccordionToggleEvent').on('click', '.ckeditor-accordion-toggler', function (e) {
            var $t = $(this).parent();
            var $parent = $t.parent();
  
            // Clicking on open element, close it.
            if ($t.hasClass('active')) {
              $t.removeClass('active');
              $t.next().slideUp(300,function(){
                $t.next().removeClass('active')
                    .addClass('closed')
                    .slideDown(0);
              });
            }
            else {
              // Remove active classes.
              $parent.children('dt.active').removeClass('active').children('a').removeClass('active');
              $parent.children('dd.active').slideUp('fast', function () {
                $(this).removeClass('active').addClass('closed').slideDown(0);
              });
              // Show the selected tab.
              $t.addClass('active');
              //$t.next().addClass('active').removeClass('hidden');
              $t.next().slideUp(0,function(){
                $t.next().removeClass('closed')
                  .addClass('active')
                  .slideDown(300);
              });
            }
  
            // Don't add hash to url.
            e.preventDefault();
          });
          //Add extra AX functionality
          $(document).keydown(function(e) {
            if ($('dt a.ckeditor-accordion-toggler').is(":focus")) {
              var parent = $(this).closest('div.ckeditor-accordion-container');
              if (e.which == 35) {
                /*Last item select*/
                e.preventDefault();
                $('dt a.ckeditor-accordion-toggler:focus').parent().siblings('dt').last().find('a.ckeditor-accordion-toggler').focus();
              }
              if (e.which == 36) {
                /*First item select*/
                e.preventDefault();
                $('dt a.ckeditor-accordion-toggler:focus').parent().siblings('dt').first().find('a.ckeditor-accordion-toggler').focus();
              }
              if (e.which == 40) {
                /*Next item select*/
                e.preventDefault();
                $('dt a.ckeditor-accordion-toggler:focus').parent().nextAll('dt').eq(0).find('a.ckeditor-accordion-toggler').focus();
              }
              if (e.which == 38) {
                /*Previous item select*/
                e.preventDefault();
                $('dt a.ckeditor-accordion-toggler:focus').parent().prevAll('dt').eq(0).find('a.ckeditor-accordion-toggler').focus();
              }
              if (e.which == 32) { 
                e.preventDefault(); 
                var $t = $('dt a.ckeditor-accordion-toggler:focus');
                var $parent = $t.parent();
                // Clicking on open element, close it.
                if ($t.hasClass('active')) {
                  $t.removeClass('active');
                  $t.next().slideUp();
                }
                else {
                  // Remove active classes.
                  $parent.children('dt.active').removeClass('active').children('a').removeClass('active');
                  $parent.children('dd.active').slideUp(function () {
                    $(this).removeClass('active');
                  });
                  // Show the selected tab.
                  $t.addClass('active');
                  $t.next().slideDown(300).addClass('active');
                }
                
              }
            }
          });
        }
      }
    };
  })(jQuery, Drupal, drupalSettings);
  ;
  (function ($, Drupal, drupalSettings) {
    'use strict';
    Drupal.behaviors.form_actions = {
      attach: function (context, settings) {
        $('form#ferry-boarding-status select#ferry-boarding-status-list').change(function() {
          var s = $(this).val();
          $('form#ferry-boarding-status').attr('action', s);
        });
      }
    }
  })(jQuery, Drupal, drupalSettings);;