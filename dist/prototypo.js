(function (root, factory) {
	if (typeof define === 'function' && define.amd) {
		//Allow using this built library as an AMD module
		//in another project. That other project will only
		//see this AMD call, not the internal modules in
		//the closure below.
		define([], factory);
	} else {
		//Browser globals case. Just assign the
		//result to a property on the global.
		root.prototypo = factory();
	}
}(this, function () {

// Object.mixin polyfill for IE9+
if ( !Object.mixin ) {
	Object.mixin = function( target, source ) {
		var props = Object.getOwnPropertyNames(source),
			p,
			descriptor,
			length = props.length;

		for (p = 0; p < length; p++) {
			descriptor = Object.getOwnPropertyDescriptor(source, props[p]);
			Object.defineProperty(target, props[p], descriptor);
		}

		return target;
	};
}
/**
 * @license almond 0.3.0 Copyright (c) 2011-2014, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/almond for details
 */
//Going sloppy to avoid 'use strict' string cost, but strict practices should
//be followed.
/*jslint sloppy: true */
/*global setTimeout: false */

var requirejs, require, define;
(function (undef) {
    var main, req, makeMap, handlers,
        defined = {},
        waiting = {},
        config = {},
        defining = {},
        hasOwn = Object.prototype.hasOwnProperty,
        aps = [].slice,
        jsSuffixRegExp = /\.js$/;

    function hasProp(obj, prop) {
        return hasOwn.call(obj, prop);
    }

    /**
     * Given a relative module name, like ./something, normalize it to
     * a real name that can be mapped to a path.
     * @param {String} name the relative name
     * @param {String} baseName a real name that the name arg is relative
     * to.
     * @returns {String} normalized name
     */
    function normalize(name, baseName) {
        var nameParts, nameSegment, mapValue, foundMap, lastIndex,
            foundI, foundStarMap, starI, i, j, part,
            baseParts = baseName && baseName.split("/"),
            map = config.map,
            starMap = (map && map['*']) || {};

        //Adjust any relative paths.
        if (name && name.charAt(0) === ".") {
            //If have a base name, try to normalize against it,
            //otherwise, assume it is a top-level require that will
            //be relative to baseUrl in the end.
            if (baseName) {
                //Convert baseName to array, and lop off the last part,
                //so that . matches that "directory" and not name of the baseName's
                //module. For instance, baseName of "one/two/three", maps to
                //"one/two/three.js", but we want the directory, "one/two" for
                //this normalization.
                baseParts = baseParts.slice(0, baseParts.length - 1);
                name = name.split('/');
                lastIndex = name.length - 1;

                // Node .js allowance:
                if (config.nodeIdCompat && jsSuffixRegExp.test(name[lastIndex])) {
                    name[lastIndex] = name[lastIndex].replace(jsSuffixRegExp, '');
                }

                name = baseParts.concat(name);

                //start trimDots
                for (i = 0; i < name.length; i += 1) {
                    part = name[i];
                    if (part === ".") {
                        name.splice(i, 1);
                        i -= 1;
                    } else if (part === "..") {
                        if (i === 1 && (name[2] === '..' || name[0] === '..')) {
                            //End of the line. Keep at least one non-dot
                            //path segment at the front so it can be mapped
                            //correctly to disk. Otherwise, there is likely
                            //no path mapping for a path starting with '..'.
                            //This can still fail, but catches the most reasonable
                            //uses of ..
                            break;
                        } else if (i > 0) {
                            name.splice(i - 1, 2);
                            i -= 2;
                        }
                    }
                }
                //end trimDots

                name = name.join("/");
            } else if (name.indexOf('./') === 0) {
                // No baseName, so this is ID is resolved relative
                // to baseUrl, pull off the leading dot.
                name = name.substring(2);
            }
        }

        //Apply map config if available.
        if ((baseParts || starMap) && map) {
            nameParts = name.split('/');

            for (i = nameParts.length; i > 0; i -= 1) {
                nameSegment = nameParts.slice(0, i).join("/");

                if (baseParts) {
                    //Find the longest baseName segment match in the config.
                    //So, do joins on the biggest to smallest lengths of baseParts.
                    for (j = baseParts.length; j > 0; j -= 1) {
                        mapValue = map[baseParts.slice(0, j).join('/')];

                        //baseName segment has  config, find if it has one for
                        //this name.
                        if (mapValue) {
                            mapValue = mapValue[nameSegment];
                            if (mapValue) {
                                //Match, update name to the new value.
                                foundMap = mapValue;
                                foundI = i;
                                break;
                            }
                        }
                    }
                }

                if (foundMap) {
                    break;
                }

                //Check for a star map match, but just hold on to it,
                //if there is a shorter segment match later in a matching
                //config, then favor over this star map.
                if (!foundStarMap && starMap && starMap[nameSegment]) {
                    foundStarMap = starMap[nameSegment];
                    starI = i;
                }
            }

            if (!foundMap && foundStarMap) {
                foundMap = foundStarMap;
                foundI = starI;
            }

            if (foundMap) {
                nameParts.splice(0, foundI, foundMap);
                name = nameParts.join('/');
            }
        }

        return name;
    }

    function makeRequire(relName, forceSync) {
        return function () {
            //A version of a require function that passes a moduleName
            //value for items that may need to
            //look up paths relative to the moduleName
            var args = aps.call(arguments, 0);

            //If first arg is not require('string'), and there is only
            //one arg, it is the array form without a callback. Insert
            //a null so that the following concat is correct.
            if (typeof args[0] !== 'string' && args.length === 1) {
                args.push(null);
            }
            return req.apply(undef, args.concat([relName, forceSync]));
        };
    }

    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(depName) {
        return function (value) {
            defined[depName] = value;
        };
    }

    function callDep(name) {
        if (hasProp(waiting, name)) {
            var args = waiting[name];
            delete waiting[name];
            defining[name] = true;
            main.apply(undef, args);
        }

        if (!hasProp(defined, name) && !hasProp(defining, name)) {
            throw new Error('No ' + name);
        }
        return defined[name];
    }

    //Turns a plugin!resource to [plugin, resource]
    //with the plugin being undefined if the name
    //did not have a plugin prefix.
    function splitPrefix(name) {
        var prefix,
            index = name ? name.indexOf('!') : -1;
        if (index > -1) {
            prefix = name.substring(0, index);
            name = name.substring(index + 1, name.length);
        }
        return [prefix, name];
    }

    /**
     * Makes a name map, normalizing the name, and using a plugin
     * for normalization if necessary. Grabs a ref to plugin
     * too, as an optimization.
     */
    makeMap = function (name, relName) {
        var plugin,
            parts = splitPrefix(name),
            prefix = parts[0];

        name = parts[1];

        if (prefix) {
            prefix = normalize(prefix, relName);
            plugin = callDep(prefix);
        }

        //Normalize according
        if (prefix) {
            if (plugin && plugin.normalize) {
                name = plugin.normalize(name, makeNormalize(relName));
            } else {
                name = normalize(name, relName);
            }
        } else {
            name = normalize(name, relName);
            parts = splitPrefix(name);
            prefix = parts[0];
            name = parts[1];
            if (prefix) {
                plugin = callDep(prefix);
            }
        }

        //Using ridiculous property names for space reasons
        return {
            f: prefix ? prefix + '!' + name : name, //fullName
            n: name,
            pr: prefix,
            p: plugin
        };
    };

    function makeConfig(name) {
        return function () {
            return (config && config.config && config.config[name]) || {};
        };
    }

    handlers = {
        require: function (name) {
            return makeRequire(name);
        },
        exports: function (name) {
            var e = defined[name];
            if (typeof e !== 'undefined') {
                return e;
            } else {
                return (defined[name] = {});
            }
        },
        module: function (name) {
            return {
                id: name,
                uri: '',
                exports: defined[name],
                config: makeConfig(name)
            };
        }
    };

    main = function (name, deps, callback, relName) {
        var cjsModule, depName, ret, map, i,
            args = [],
            callbackType = typeof callback,
            usingExports;

        //Use name if no relName
        relName = relName || name;

        //Call the callback to define the module, if necessary.
        if (callbackType === 'undefined' || callbackType === 'function') {
            //Pull out the defined dependencies and pass the ordered
            //values to the callback.
            //Default to [require, exports, module] if no deps
            deps = !deps.length && callback.length ? ['require', 'exports', 'module'] : deps;
            for (i = 0; i < deps.length; i += 1) {
                map = makeMap(deps[i], relName);
                depName = map.f;

                //Fast path CommonJS standard dependencies.
                if (depName === "require") {
                    args[i] = handlers.require(name);
                } else if (depName === "exports") {
                    //CommonJS module spec 1.1
                    args[i] = handlers.exports(name);
                    usingExports = true;
                } else if (depName === "module") {
                    //CommonJS module spec 1.1
                    cjsModule = args[i] = handlers.module(name);
                } else if (hasProp(defined, depName) ||
                           hasProp(waiting, depName) ||
                           hasProp(defining, depName)) {
                    args[i] = callDep(depName);
                } else if (map.p) {
                    map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
                    args[i] = defined[depName];
                } else {
                    throw new Error(name + ' missing ' + depName);
                }
            }

            ret = callback ? callback.apply(defined[name], args) : undefined;

            if (name) {
                //If setting exports via "module" is in play,
                //favor that over return value and exports. After that,
                //favor a non-undefined return value over exports use.
                if (cjsModule && cjsModule.exports !== undef &&
                        cjsModule.exports !== defined[name]) {
                    defined[name] = cjsModule.exports;
                } else if (ret !== undef || !usingExports) {
                    //Use the return value from the function.
                    defined[name] = ret;
                }
            }
        } else if (name) {
            //May just be an object definition for the module. Only
            //worry about defining if have a module name.
            defined[name] = callback;
        }
    };

    requirejs = require = req = function (deps, callback, relName, forceSync, alt) {
        if (typeof deps === "string") {
            if (handlers[deps]) {
                //callback in this case is really relName
                return handlers[deps](callback);
            }
            //Just return the module wanted. In this scenario, the
            //deps arg is the module name, and second arg (if passed)
            //is just the relName.
            //Normalize module name, if it contains . or ..
            return callDep(makeMap(deps, callback).f);
        } else if (!deps.splice) {
            //deps is a config object, not an array.
            config = deps;
            if (config.deps) {
                req(config.deps, config.callback);
            }
            if (!callback) {
                return;
            }

            if (callback.splice) {
                //callback is an array, which means it is a dependency list.
                //Adjust args if there are dependencies
                deps = callback;
                callback = relName;
                relName = null;
            } else {
                deps = undef;
            }
        }

        //Support require(['a'])
        callback = callback || function () {};

        //If relName is a function, it is an errback handler,
        //so remove it.
        if (typeof relName === 'function') {
            relName = forceSync;
            forceSync = alt;
        }

        //Simulate async callback;
        if (forceSync) {
            main(undef, deps, callback, relName);
        } else {
            //Using a non-zero value because of concern for what old browsers
            //do, and latest browsers "upgrade" to 4 if lower value is used:
            //http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html#dom-windowtimers-settimeout:
            //If want a value immediately, use require('id') instead -- something
            //that works in almond on the global level, but not guaranteed and
            //unlikely to work in other AMD implementations.
            setTimeout(function () {
                main(undef, deps, callback, relName);
            }, 4);
        }

        return req;
    };

    /**
     * Just drops the config on the floor, but returns req in case
     * the config return value is used.
     */
    req.config = function (cfg) {
        return req(cfg);
    };

    /**
     * Expose module registry for debugging and tooling
     */
    requirejs._defined = defined;

    define = function (name, deps, callback) {

        //This module may not have dependencies
        if (!deps.splice) {
            //deps is not an array, so probably means
            //an object literal or factory function for
            //the value. Adjust args.
            callback = deps;
            deps = [];
        }

        if (!hasProp(defined, name) && !hasProp(waiting, name)) {
            waiting[name] = [name, deps, callback];
        }
    };

    define.amd = {
        jQuery: true
    };
}());

define("../bower_components/almond/almond", function(){});

define('classes/Classify.js',[], function() {
  
  function Classify() {
    var args = arguments[0] !== (void 0) ? arguments[0] : {};
    if (!args.tags) {
      args.tags = [];
    }
    var self = this;
    this._tags = typeof args.tags === 'string' ? args.tags.split(' ') : args.tags;
    this.type = args.type;
    this.tags = {
      add: function() {
        Array.prototype.slice.call(arguments, 0).forEach((function(tag) {
          if (self._tags.indexOf(tag) === -1) {
            self._tags.push(tag);
          }
        }));
      },
      remove: function() {
        Array.prototype.slice.call(arguments, 0).forEach((function(tag) {
          var i = self._tags.indexOf(tag);
          if (i !== -1) {
            self._tags.splice(i, 1);
          }
        }));
      },
      has: function() {
        var _has = true;
        Array.prototype.slice.call(arguments, 0).forEach((function(tag) {
          if (self._tags.indexOf(tag) === -1) {
            _has = false;
          }
        }));
        return _has;
      }
    };
  }
  var $__default = Classify;
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci82IiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzUiLCJjbGFzc2VzL0NsYXNzaWZ5LmpzIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzAiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMyIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsS0FBSyxBQUFDLElDQU4sVUFBUyxBQUFnQjs7QUNBekIsU0FBUyxTQUFPLENBQUcsQUFBUTtNQUFSLEtBQUcsNkNBQUksR0FBQztBQUMxQixPQUFLLENBQUMsSUFBRyxLQUFLLENBQUk7QUFDakIsU0FBRyxLQUFLLEVBQUksR0FBQyxDQUFDO0lBQ2Y7QUFBQSxBQUNJLE1BQUEsQ0FBQSxJQUFHLEVBQUksS0FBRyxDQUFDO0FBRWYsT0FBRyxNQUFNLEVBQUksQ0FBQSxNQUFPLEtBQUcsS0FBSyxDQUFBLEdBQU0sU0FBTyxDQUFBLENBQ3hDLENBQUEsSUFBRyxLQUFLLE1BQU0sQUFBQyxDQUFDLEdBQUUsQ0FBQyxDQUFBLENBQ25CLENBQUEsSUFBRyxLQUFLLENBQUM7QUFFVixPQUFHLEtBQUssRUFBSSxDQUFBLElBQUcsS0FBSyxDQUFDO0FBRXJCLE9BQUcsS0FBSyxFQUFJO0FBQ1gsUUFBRSxDQUFGLFVBQUcsQUFBQztBQUNILFlBQUksVUFBVSxNQUFNLEtBQUssQUFBQyxDQUFDLFNBQVEsQ0FBRyxFQUFBLENBQUMsUUFBUSxBQUFDLEVBQUMsU0FBQSxHQUFFLENBQUs7QUFDdkQsYUFBSyxJQUFHLE1BQU0sUUFBUSxBQUFDLENBQUUsR0FBRSxDQUFFLENBQUEsR0FBTSxFQUFDLENBQUEsQ0FBSTtBQUN2QyxlQUFHLE1BQU0sS0FBSyxBQUFDLENBQUUsR0FBRSxDQUFFLENBQUM7VUFDdkI7QUFBQSxRQUNELEVBQUMsQ0FBQztNQUNIO0FBQ0EsV0FBSyxDQUFMLFVBQU0sQUFBQztBQUNOLFlBQUksVUFBVSxNQUFNLEtBQUssQUFBQyxDQUFDLFNBQVEsQ0FBRyxFQUFBLENBQUMsUUFBUSxBQUFDLEVBQUMsU0FBQSxHQUFFLENBQUs7QUFDdkQsQUFBSSxZQUFBLENBQUEsQ0FBQSxFQUFJLENBQUEsSUFBRyxNQUFNLFFBQVEsQUFBQyxDQUFFLEdBQUUsQ0FBRSxDQUFDO0FBQ2pDLGFBQUssQ0FBQSxJQUFNLEVBQUMsQ0FBQSxDQUFJO0FBQ2YsZUFBRyxNQUFNLE9BQU8sQUFBQyxDQUFFLENBQUEsQ0FBRyxFQUFBLENBQUUsQ0FBQztVQUMxQjtBQUFBLFFBQ0QsRUFBQyxDQUFDO01BQ0g7QUFDQSxRQUFFLENBQUYsVUFBRyxBQUFDO0FBQ0gsQUFBSSxVQUFBLENBQUEsSUFBRyxFQUFJLEtBQUcsQ0FBQztBQUVmLFlBQUksVUFBVSxNQUFNLEtBQUssQUFBQyxDQUFDLFNBQVEsQ0FBRyxFQUFBLENBQUMsUUFBUSxBQUFDLEVBQUMsU0FBQSxHQUFFLENBQUs7QUFDdkQsYUFBSyxJQUFHLE1BQU0sUUFBUSxBQUFDLENBQUUsR0FBRSxDQUFFLENBQUEsR0FBTSxFQUFDLENBQUEsQ0FBSTtBQUN2QyxlQUFHLEVBQUksTUFBSSxDQUFDO1VBQ2I7QUFBQSxRQUNELEVBQUMsQ0FBQztBQUVGLGFBQU8sS0FBRyxDQUFDO01BQ1o7SUFDRCxDQUFDO0VBQ0Y7QUN4Q0EsQUFBSSxJQUFBLENBQUEsVUFBUyxFRDBDRSxTQzFDa0IsQUQwQ1gsQ0MxQ1c7QUNBakM7QUNBQSxnQkFBd0I7QUFBRSx1QkFBd0I7SUFBRTtBQ0FwRCxhQUFTLENBQUcsS0FBRztBQUFBLEdGQVE7QUhFbkIsQ0RGdUMsQ0FBQztBRTBDckIiLCJmaWxlIjoiY2xhc3Nlcy9DbGFzc2lmeS5qcyIsInNvdXJjZVJvb3QiOiIuLiIsInNvdXJjZXNDb250ZW50IjpbImRlZmluZSgkX19wbGFjZWhvbGRlcl9fMCwgJF9fcGxhY2Vob2xkZXJfXzEpOyIsImZ1bmN0aW9uKCRfX3BsYWNlaG9sZGVyX18wKSB7XG4gICAgICAkX19wbGFjZWhvbGRlcl9fMVxuICAgIH0iLCJmdW5jdGlvbiBDbGFzc2lmeSggYXJncyA9IHt9ICkge1xuXHRpZiAoICFhcmdzLnRhZ3MgKSB7XG5cdFx0YXJncy50YWdzID0gW107XG5cdH1cblx0dmFyIHNlbGYgPSB0aGlzO1xuXG5cdHRoaXMuX3RhZ3MgPSB0eXBlb2YgYXJncy50YWdzID09PSAnc3RyaW5nJyA/XG5cdFx0YXJncy50YWdzLnNwbGl0KCcgJyk6XG5cdFx0YXJncy50YWdzO1xuXG5cdHRoaXMudHlwZSA9IGFyZ3MudHlwZTtcblxuXHR0aGlzLnRhZ3MgPSB7XG5cdFx0YWRkKCkge1xuXHRcdFx0QXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAwKS5mb3JFYWNoKHRhZyA9PiB7XG5cdFx0XHRcdGlmICggc2VsZi5fdGFncy5pbmRleE9mKCB0YWcgKSA9PT0gLTEgKSB7XG5cdFx0XHRcdFx0c2VsZi5fdGFncy5wdXNoKCB0YWcgKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fSxcblx0XHRyZW1vdmUoKSB7XG5cdFx0XHRBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDApLmZvckVhY2godGFnID0+IHtcblx0XHRcdFx0dmFyIGkgPSBzZWxmLl90YWdzLmluZGV4T2YoIHRhZyApO1xuXHRcdFx0XHRpZiAoIGkgIT09IC0xICkge1xuXHRcdFx0XHRcdHNlbGYuX3RhZ3Muc3BsaWNlKCBpLCAxICk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH0sXG5cdFx0aGFzKCkge1xuXHRcdFx0dmFyIF9oYXMgPSB0cnVlO1xuXG5cdFx0XHRBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDApLmZvckVhY2godGFnID0+IHtcblx0XHRcdFx0aWYgKCBzZWxmLl90YWdzLmluZGV4T2YoIHRhZyApID09PSAtMSApIHtcblx0XHRcdFx0XHRfaGFzID0gZmFsc2U7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXG5cdFx0XHRyZXR1cm4gX2hhcztcblx0XHR9XG5cdH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IENsYXNzaWZ5OyIsInZhciAkX19kZWZhdWx0ID0gJF9fcGxhY2Vob2xkZXJfXzAiLCJyZXR1cm4gJF9fcGxhY2Vob2xkZXJfXzAiLCJnZXQgJF9fcGxhY2Vob2xkZXJfXzAoKSB7IHJldHVybiAkX19wbGFjZWhvbGRlcl9fMTsgfSIsIl9fZXNNb2R1bGU6IHRydWUiXX0=;
define('classes/Point.js',['./Classify.js'], function($__0) {
  
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  var Classify = $__0.default;
  function Point(x, y) {
    Classify.prototype.constructor.call(this);
    if (!x && x !== 0) {
      this.coords = new Float32Array([x, y]);
    } else if (x.constructor === Array || x.constructor === Float32Array) {
      this.coords = new Float32Array(x);
    } else if (typeof x === 'object' && ('x' in x || 'y' in x)) {
      this.coords = new Float32Array([x.x, x.y]);
    } else {
      this.coords = new Float32Array([x, y]);
    }
  }
  Point.prototype = Object.create(Classify.prototype);
  Point.prototype.constructor = Point;
  Object.mixin(Point.prototype, {
    get x() {
      return this.coords[0];
    },
    set x(x) {
      this.coords[0] = x;
    },
    get y() {
      return this.coords[1];
    },
    set y(y) {
      this.coords[1] = y;
    },
    set: function(x, y) {
      this.coords[0] = x;
      this.coords[1] = y;
    },
    transform: function(m) {
      var coords0 = this.coords[0];
      this.coords[0] = m[0] * coords0 + m[2] * this.coords[1] + m[4];
      this.coords[1] = m[1] * coords0 + m[3] * this.coords[1] + m[5];
      return this;
    },
    toString: function() {
      return (isNaN(this.coords[0]) ? 'NaN' : Math.round(this.coords[0])) + ' ' + (isNaN(this.coords[1]) ? 'NaN' : Math.round(this.coords[1]));
    },
    toJSON: function() {
      return this.toString();
    },
    _: function(x, y) {
      if (x === undefined || x === null) {
        this.coords[0] = x;
        this.coords[1] = y;
      } else if (x.constructor === Array || x.constructor === Float32Array) {
        this.coords[0] = x[0];
        this.coords[1] = x[1];
      } else if (typeof x === 'object' && ('x' in x || 'y' in x)) {
        this.coords[0] = x.x;
        this.coords[1] = x.y;
      } else {
        this.coords[0] = x;
        this.coords[1] = y;
      }
      return this;
    },
    translate: function(x, y) {
      var p = x instanceof Point ? x : new Point(x, y);
      if (!isNaN(p.coords[0])) {
        this.coords[0] += p.coords[0];
      }
      if (!isNaN(p.coords[1])) {
        this.coords[1] += p.coords[1];
      }
      return this;
    },
    translateX: function(x) {
      this.coords[0] += x;
      return this;
    },
    translateY: function(y) {
      this.coords[1] += y;
      return this;
    }
  });
  Point.prototype.onLine = function(knownCoord, p1, p2) {
    var origin = p1,
        vector = [p2.x - p1.x, p2.y - p1.y];
    if (knownCoord === 'x') {
      this.coords[1] = (this.coords[0] - origin.x) / vector[0] * vector[1] + origin.y;
    } else {
      this.coords[0] = (this.coords[1] - origin.y) / vector[1] * vector[0] + origin.x;
    }
  };
  var $__default = Point;
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci82IiwiY2xhc3Nlcy9Qb2ludC5qcyIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci81IiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzQiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMCIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8zIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzEiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxLQUFLLEFBQUMsRUNBZSxlQUFjLEVDQW5DLFVBQVMsSUFBZ0I7O0FDQXpCLEtBQUksS0FBaUIsR0FBSyxFQUFDLGVBQTJCO0FBQzFDLFNBQW9CLEVBQUMsT0FBTSxNQUFtQixDQUFDLENBQUE7QUFBQSxJRkRwRCxTQUFPO0FBRWQsU0FBUyxNQUFJLENBQUcsQ0FBQSxDQUFHLENBQUEsQ0FBQSxDQUFJO0FBQ3RCLFdBQU8sVUFBVSxZQUFZLEtBQUssQUFBQyxDQUFFLElBQUcsQ0FBRSxDQUFDO0FBRTNDLE9BQUssQ0FBQyxDQUFBLENBQUEsRUFBSyxDQUFBLENBQUEsSUFBTSxFQUFBLENBQUk7QUFDcEIsU0FBRyxPQUFPLEVBQUksSUFBSSxhQUFXLEFBQUMsQ0FBQyxDQUFDLENBQUEsQ0FBRyxFQUFBLENBQUMsQ0FBQyxDQUFDO0lBRXZDLEtBQU8sS0FBSyxDQUFBLFlBQVksSUFBTSxNQUFJLENBQUEsRUFBSyxDQUFBLENBQUEsWUFBWSxJQUFNLGFBQVcsQ0FBSTtBQUN2RSxTQUFHLE9BQU8sRUFBSSxJQUFJLGFBQVcsQUFBQyxDQUFDLENBQUEsQ0FBQyxDQUFDO0lBRWxDLEtBQU8sS0FBSyxNQUFPLEVBQUEsQ0FBQSxHQUFNLFNBQU8sQ0FBQSxFQUFLLEVBQUUsR0FBRSxHQUFLLEVBQUEsQ0FBQSxF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QUFLLEVBQUUsQ0FBQztJQUNsRixLQUFPO0FBQ04sU0FBRyxPQUFPLENBQUUsQ0FBQSxDQUFDLEVBQUksQ0FBQSxDQUFFLElBQUcsT0FBTyxDQUFFLENBQUEsQ0FBQyxFQUFJLENBQUEsTUFBSyxFQUFFLENBQUUsRUFBSSxDQUFBLE1BQUssQ0FBRSxDQUFBLENBQUMsQ0FBQSxDQUFJLENBQUEsTUFBSyxDQUFFLENBQUEsQ0FBQyxDQUFBLENBQUksQ0FBQSxNQUFLLEVBQUUsQ0FBQztJQUNsRjtBQUFBLEVBQ0QsQ0FBQztBRy9IRCxBQUFJLElBQUEsQ0FBQSxVQUFTLEVIaUlFLE1HaklrQixBSGlJZCxDR2pJYztBQ0FqQztBQ0FBLGdCQUF3QjtBQUFFLHVCQUF3QjtJQUFFO0FDQXBELGFBQVMsQ0FBRyxLQUFHO0FBQUEsR0ZBUTtBSEVuQixDRkZ1QyxDQUFDO0FDb094QyIsImZpbGUiOiJjbGFzc2VzL1BvaW50LmpzIiwic291cmNlUm9vdCI6Ii4uIiwic291cmNlc0NvbnRlbnQiOlsiZGVmaW5lKCRfX3BsYWNlaG9sZGVyX18wLCAkX19wbGFjZWhvbGRlcl9fMSk7IiwiaW1wb3J0IENsYXNzaWZ5IGZyb20gJy4vQ2xhc3NpZnkuanMnO1xuXG5mdW5jdGlvbiBQb2ludCggeCwgeSApIHtcblx0Q2xhc3NpZnkucHJvdG90eXBlLmNvbnN0cnVjdG9yLmNhbGwoIHRoaXMgKTtcblxuXHRpZiAoICF4ICYmIHggIT09IDAgKSB7XG5cdFx0dGhpcy5jb29yZHMgPSBuZXcgRmxvYXQzMkFycmF5KFt4LCB5XSk7XG5cblx0fSBlbHNlIGlmICggeC5jb25zdHJ1Y3RvciA9PT0gQXJyYXkgfHwgeC5jb25zdHJ1Y3RvciA9PT0gRmxvYXQzMkFycmF5ICkge1xuXHRcdHRoaXMuY29vcmRzID0gbmV3IEZsb2F0MzJBcnJheSh4KTtcblxuXHR9IGVsc2UgaWYgKCB0eXBlb2YgeCA9PT0gJ29iamVjdCcgJiYgKCAneCcgaW4geCB8fCAneScgaW4geCApICkge1xuXHRcdHRoaXMuY29vcmRzID0gbmV3IEZsb2F0MzJBcnJheShbeC54LCB4LnldKTtcblxuXHR9IGVsc2Uge1xuXHRcdHRoaXMuY29vcmRzID0gbmV3IEZsb2F0MzJBcnJheShbeCwgeV0pO1xuXG5cdH1cbn1cblxuUG9pbnQucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShDbGFzc2lmeS5wcm90b3R5cGUpO1xuUG9pbnQucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gUG9pbnQ7XG5cbk9iamVjdC5taXhpbihQb2ludC5wcm90b3R5cGUsIHtcblxuXHQvLyAueCBhbmQgLnkgYXJlIG1vcmUgY29udmVuaWVudCB0aGFuIC5jb29yZHNbMF0gYW5kIC5jb29yZHNbMV1cblx0Z2V0IHgoKSB7XG5cdFx0cmV0dXJuIHRoaXMuY29vcmRzWzBdO1xuXHR9LFxuXHRzZXQgeCggeCApIHtcblx0XHR0aGlzLmNvb3Jkc1swXSA9IHg7XG5cdH0sXG5cdGdldCB5KCkge1xuXHRcdHJldHVybiB0aGlzLmNvb3Jkc1sxXTtcblx0fSxcblx0c2V0IHkoIHkgKSB7XG5cdFx0dGhpcy5jb29yZHNbMV0gPSB5O1xuXHR9LFxuXG5cdHNldCh4LCB5KSB7XG5cdFx0dGhpcy5jb29yZHNbMF0gPSB4O1xuXHRcdHRoaXMuY29vcmRzWzFdID0geTtcblx0fSxcblxuXHR0cmFuc2Zvcm0oIG0gKSB7XG5cdFx0dmFyIGNvb3JkczAgPSB0aGlzLmNvb3Jkc1swXTtcblx0XHR0aGlzLmNvb3Jkc1swXSA9IG1bMF0gKiBjb29yZHMwICsgbVsyXSAqIHRoaXMuY29vcmRzWzFdICsgbVs0XTtcblx0XHR0aGlzLmNvb3Jkc1sxXSA9IG1bMV0gKiBjb29yZHMwICsgbVszXSAqIHRoaXMuY29vcmRzWzFdICsgbVs1XTtcblxuXHRcdHJldHVybiB0aGlzO1xuXHR9LFxuXG5cdHRvU3RyaW5nKCkge1xuXHRcdHJldHVybiAoIGlzTmFOKCB0aGlzLmNvb3Jkc1swXSApID8gJ05hTicgOiBNYXRoLnJvdW5kKCB0aGlzLmNvb3Jkc1swXSApICkgK1xuXHRcdFx0JyAnICtcblx0XHRcdCggaXNOYU4oIHRoaXMuY29vcmRzWzFdICkgPyAnTmFOJyA6IE1hdGgucm91bmQoIHRoaXMuY29vcmRzWzFdICkgKTtcblx0fSxcblxuXHR0b0pTT04oKSB7XG5cdFx0cmV0dXJuIHRoaXMudG9TdHJpbmcoKTtcblx0fSxcblxuXG5cblx0Ly8gVGhlIGZvbGxvd2luZyBtZXRob2RzIGFyZSBkZXByZWNhdGVkXG5cblx0Ly8gYSBzZXR0ZXIgZm9yIHgveSBjb29yZGluYXRlcyB0aGF0IGJlaGF2ZXMgZXhhY3RseSBsaWtlIHRoZSBjb25zdHJ1Y3RvclxuXHRfKHgsIHkpIHtcblx0XHRpZiAoIHggPT09IHVuZGVmaW5lZCB8fMKgeCA9PT0gbnVsbCApIHtcblx0XHRcdHRoaXMuY29vcmRzWzBdID0geDtcblx0XHRcdHRoaXMuY29vcmRzWzFdID0geTtcblxuXHRcdH0gZWxzZSBpZiAoIHguY29uc3RydWN0b3IgPT09IEFycmF5IHx8IHguY29uc3RydWN0b3IgPT09IEZsb2F0MzJBcnJheSApIHtcblx0XHRcdHRoaXMuY29vcmRzWzBdID0geFswXTtcblx0XHRcdHRoaXMuY29vcmRzWzFdID0geFsxXTtcblxuXHRcdH0gZWxzZSBpZiAoIHR5cGVvZiB4ID09PSAnb2JqZWN0JyAmJiAoICd4JyBpbiB4IHx8ICd5JyBpbiB4ICkgKSB7XG5cdFx0XHR0aGlzLmNvb3Jkc1swXSA9IHgueDtcblx0XHRcdHRoaXMuY29vcmRzWzFdID0geC55O1xuXG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuY29vcmRzWzBdID0geDtcblx0XHRcdHRoaXMuY29vcmRzWzFdID0geTtcblxuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXHR9LFxuXG5cdHRyYW5zbGF0ZSggeCwgeSApIHtcblx0XHR2YXIgcCA9IHggaW5zdGFuY2VvZiBQb2ludCA/XG5cdFx0XHRcdHg6XG5cdFx0XHRcdG5ldyBQb2ludCggeCwgeSApO1xuXG5cdFx0aWYgKCAhaXNOYU4oIHAuY29vcmRzWzBdICkgKSB7XG5cdFx0XHR0aGlzLmNvb3Jkc1swXSArPSBwLmNvb3Jkc1swXTtcblx0XHR9XG5cdFx0aWYgKCAhaXNOYU4oIHAuY29vcmRzWzFdICkgKSB7XG5cdFx0XHR0aGlzLmNvb3Jkc1sxXSArPSBwLmNvb3Jkc1sxXTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fSxcblxuXHR0cmFuc2xhdGVYKCB4ICkge1xuXHRcdHRoaXMuY29vcmRzWzBdICs9IHg7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cblx0dHJhbnNsYXRlWSggeSApIHtcblx0XHR0aGlzLmNvb3Jkc1sxXSArPSB5O1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG59KTtcblxuUG9pbnQucHJvdG90eXBlLm9uTGluZSA9IGZ1bmN0aW9uKCBrbm93bkNvb3JkLCBwMSwgcDIgKSB7XG5cdHZhciBvcmlnaW4gPSBwMSxcblx0XHR2ZWN0b3IgPSBbXG5cdFx0XHRwMi54IC0gcDEueCxcblx0XHRcdHAyLnkgLSBwMS55XG5cdFx0XTtcblxuXHRpZiAoIGtub3duQ29vcmQgPT09ICd4JyApIHtcblx0XHR0aGlzLmNvb3Jkc1sxXSA9ICggdGhpcy5jb29yZHNbMF0gLSBvcmlnaW4ueCApIC8gdmVjdG9yWzBdICogdmVjdG9yWzFdICsgb3JpZ2luLnk7XG5cdH0gZWxzZSB7XG5cdFx0dGhpcy5jb29yZHNbMF0gPSAoIHRoaXMuY29vcmRzWzFdIC0gb3JpZ2luLnkgKSAvIHZlY3RvclsxXSAqIHZlY3RvclswXSArIG9yaWdpbi54O1xuXHR9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBQb2ludDtcblxuXHQvLyBcdHJldHVybiBQb2ludDtcblx0Ly8gfSk7XG5cblx0Ly8gc29tZSBmdW5jdGlvbnMgbmVlZCB0byBiZSBhZGRlZCB0byB0aGUgcHJvdG90eXBlIGF0IHJ1bnRpbWUgdG8gYXZvaWQgY2lyY3VsYXIgZGVwZW5kZW5jeVxuXHQvKi5ydW4oZnVuY3Rpb24oUG9pbnQsIHBvaW50T24pIHtcblx0XHRQb2ludC5wcm90b3R5cGUub24gPSBwb2ludE9uO1xuXHR9KVxuXG5cdC5mYWN0b3J5KCdwb2ludE9uJywgZnVuY3Rpb24oIFBvaW50LCBsaW5lTGluZUludGVyc2VjdGlvbiApIHtcblx0XHQvLyB0aGlzIHJlZ2V4cCBpcyBkdXBsaWNhdGVkIGluIFNlZ21lbnQuanNcblx0XHR2YXIgcnN0cmFpZ2h0ID0gL1tMVk1IXS87XG5cblx0XHRyZXR1cm4gZnVuY3Rpb24oIGFyZ3MgKSB7XG5cdFx0XHR2YXIgb3JpZ2luLFxuXHRcdFx0XHR2ZWN0b3I7XG5cblx0XHRcdC8vIGhhbmRsZSBjYXNlcyB3aGVyZSBhcmdzIHJlZmVycyB0byB1bmRlZmluZWQgZGF0YVxuXHRcdFx0aWYgKCBhcmdzID09PSB1bmRlZmluZWQgfHwgKCBhcmdzLmNvbnN0cnVjdG9yID09PSBBcnJheSAmJiAoIGFyZ3NbMF0gPT09IHVuZGVmaW5lZCB8fCBhcmdzWzFdID09PSB1bmRlZmluZWQgKSApICkge1xuXHRcdFx0XHRyZXR1cm4gdGhpcztcblx0XHRcdH1cblxuXHRcdFx0Ly8gcG9pbnQgb24gYSBzZWdtZW50XG5cdFx0XHRpZiAoICFpc05hTiggdGhpcy5jb29yZHNbMF0gKSB8fCAhaXNOYU4oIHRoaXMuY29vcmRzWzFdICkgKSB7XG5cblx0XHRcdFx0Ly8gcG9pbnQgb24gYSBzdHJhaWdodCBsaW5lXG5cdFx0XHRcdGlmICggKCBhcmdzLmNvbW1hbmQgIT09IHVuZGVmaW5lZCAmJiByc3RyYWlnaHQudGVzdChhcmdzLmNvbW1hbmQpICkgfHxcblx0XHRcdFx0XHRhcmdzLmNvbnN0cnVjdG9yID09PSBBcnJheSApIHtcblx0XHRcdFx0XHQvLyBzZWdtZW50IGZyb20gdHdvIHBvaW50c1xuXHRcdFx0XHRcdGlmICggYXJncy5jb25zdHJ1Y3RvciA9PT0gQXJyYXkgKSB7XG5cdFx0XHRcdFx0XHRvcmlnaW4gPSBhcmdzWzBdO1xuXHRcdFx0XHRcdFx0dmVjdG9yID0gW1xuXHRcdFx0XHRcdFx0XHRhcmdzWzFdLnggLSBhcmdzWzBdLngsXG5cdFx0XHRcdFx0XHRcdGFyZ3NbMV0ueSAtIGFyZ3NbMF0ueVxuXHRcdFx0XHRcdFx0XTtcblxuXHRcdFx0XHRcdC8vIFNlZ21lbnQgaW5zdGFuY2Vcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0b3JpZ2luID0gYXJncy5zdGFydDtcblx0XHRcdFx0XHRcdHZlY3RvciA9IFtcblx0XHRcdFx0XHRcdFx0YXJncy5lbmQueCAtIGFyZ3Muc3RhcnQueCxcblx0XHRcdFx0XHRcdFx0YXJncy5lbmQueSAtIGFyZ3Muc3RhcnQueVxuXHRcdFx0XHRcdFx0XTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpZiAoIHRoaXMuY29vcmRzWzBdICkge1xuXHRcdFx0XHRcdFx0dGhpcy5jb29yZHNbMV0gPSAoIHRoaXMuY29vcmRzWzBdIC0gb3JpZ2luLnggKSAvIHZlY3RvclswXSAqIHZlY3RvclsxXSArIG9yaWdpbi55O1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHR0aGlzLmNvb3Jkc1swXSA9ICggdGhpcy5jb29yZHNbMV0gLSBvcmlnaW4ueSApIC8gdmVjdG9yWzFdICogdmVjdG9yWzBdICsgb3JpZ2luLng7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0cmV0dXJuIHRoaXM7XG5cblx0XHRcdFx0Ly8gcG9pbnQgb24gYSBjdXJ2ZVxuXHRcdFx0XHR9IGVsc2Uge1xuXG5cdFx0XHRcdH1cblxuXHRcdFx0Ly8gaW50ZXJzZWN0aW9uXG5cdFx0XHR9IGVsc2UgaWYgKCBhcmdzLmNvbnN0cnVjdG9yID09PSBBcnJheSAmJiBhcmdzLmxlbmd0aCA9PT0gMiApIHtcblxuXHRcdFx0XHQvLyBsaW5lLWxpbmUgaW50ZXJzZWN0aW9uXG5cdFx0XHRcdGlmIChcdCggYXJnc1swXS5jb25zdHJ1Y3RvciA9PT0gQXJyYXkgfHwgcnN0cmFpZ2h0LnRlc3QoYXJnc1swXS5jb21tYW5kKSApICYmXG5cdFx0XHRcdFx0XHQoIGFyZ3NbMV0uY29uc3RydWN0b3IgPT09IEFycmF5IHx8IHJzdHJhaWdodC50ZXN0KGFyZ3NbMV0uY29tbWFuZCkgKSApIHtcblxuXHRcdFx0XHRcdHZhciBwMSA9IGFyZ3NbMF0uY29uc3RydWN0b3IgPT09IEFycmF5ID9cblx0XHRcdFx0XHRcdFx0KCBhcmdzWzBdWzBdIGluc3RhbmNlb2YgUG9pbnQgP1xuXHRcdFx0XHRcdFx0XHRcdGFyZ3NbMF1bMF06XG5cdFx0XHRcdFx0XHRcdFx0bmV3IFBvaW50KCBhcmdzWzBdWzBdICkgKTpcblx0XHRcdFx0XHRcdFx0YXJnc1swXS5zdGFydCxcblx0XHRcdFx0XHRcdHAyID0gYXJnc1swXS5jb25zdHJ1Y3RvciA9PT0gQXJyYXkgP1xuXHRcdFx0XHRcdFx0XHQoIGFyZ3NbMF1bMV0gaW5zdGFuY2VvZiBQb2ludCA/XG5cdFx0XHRcdFx0XHRcdFx0YXJnc1swXVsxXTpcblx0XHRcdFx0XHRcdFx0XHRuZXcgUG9pbnQoIGFyZ3NbMF1bMV0gKSApOlxuXHRcdFx0XHRcdFx0XHRhcmdzWzBdLmVuZCxcblx0XHRcdFx0XHRcdHAzID0gYXJnc1sxXS5jb25zdHJ1Y3RvciA9PT0gQXJyYXkgP1xuXHRcdFx0XHRcdFx0XHQoIGFyZ3NbMV1bMF0gaW5zdGFuY2VvZiBQb2ludCA/XG5cdFx0XHRcdFx0XHRcdFx0YXJnc1sxXVswXTpcblx0XHRcdFx0XHRcdFx0XHRuZXcgUG9pbnQoIGFyZ3NbMV1bMF0gKSApOlxuXHRcdFx0XHRcdFx0XHRhcmdzWzFdLnN0YXJ0LFxuXHRcdFx0XHRcdFx0cDQgPSBhcmdzWzFdLmNvbnN0cnVjdG9yID09PSBBcnJheSA/XG5cdFx0XHRcdFx0XHRcdCggYXJnc1sxXVsxXSBpbnN0YW5jZW9mIFBvaW50ID9cblx0XHRcdFx0XHRcdFx0XHRhcmdzWzFdWzFdOlxuXHRcdFx0XHRcdFx0XHRcdG5ldyBQb2ludCggYXJnc1sxXVsxXSApICk6XG5cdFx0XHRcdFx0XHRcdGFyZ3NbMV0uZW5kO1xuXG5cdFx0XHRcdFx0cmV0dXJuIHRoaXMuXyggbGluZUxpbmVJbnRlcnNlY3Rpb24oIHAxLCBwMiwgcDMsIHA0ICkgKTtcblxuXHRcdFx0XHQvLyBjdXJ2ZS1jdXJ2ZSBpbnRlcnNlY3Rpb25cblx0XHRcdFx0fSBlbHNlIGlmICggYXJnc1swXS5jb21tYW5kID09PSAnQycgJiYgYXJnc1sxXS5jb21tYW5kID09PSAnQycgKSB7XG5cblx0XHRcdFx0Ly8gbGluZS1jdXJ2ZSBvciBjdXJ2ZS1saW5lIGludGVyc2VjdGlvblxuXHRcdFx0XHR9IGVsc2Uge1xuXG5cdFx0XHRcdH1cblxuXHRcdFx0fVxuXHRcdH07XG5cdH0pKi8iLCJmdW5jdGlvbigkX19wbGFjZWhvbGRlcl9fMCkge1xuICAgICAgJF9fcGxhY2Vob2xkZXJfXzFcbiAgICB9IiwiaWYgKCEkX19wbGFjZWhvbGRlcl9fMCB8fCAhJF9fcGxhY2Vob2xkZXJfXzEuX19lc01vZHVsZSlcbiAgICAgICAgICAgICRfX3BsYWNlaG9sZGVyX18yID0ge2RlZmF1bHQ6ICRfX3BsYWNlaG9sZGVyX18zfSIsInZhciAkX19kZWZhdWx0ID0gJF9fcGxhY2Vob2xkZXJfXzAiLCJyZXR1cm4gJF9fcGxhY2Vob2xkZXJfXzAiLCJnZXQgJF9fcGxhY2Vob2xkZXJfXzAoKSB7IHJldHVybiAkX19wbGFjZWhvbGRlcl9fMTsgfSIsIl9fZXNNb2R1bGU6IHRydWUiXX0=;
define('classes/Node.js',['./Point.js'], function($__0) {
  
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  var Point = $__0.default;
  function Node(args) {
    var coords;
    if (args && (args.x !== undefined || args.y !== undefined)) {
      coords = {
        x: args.x,
        y: args.y
      };
    }
    Point.prototype.constructor.apply(this, [coords]);
    this.lCtrl = new Point(args && args.lCtrl);
    this.lCtrl.tags.add('control');
    this.rCtrl = new Point(args && args.rCtrl);
    this.rCtrl.tags.add('control');
    this.src = args && args.src;
  }
  Node.prototype = Object.create(Point.prototype);
  Node.prototype.constructor = Node;
  Node.prototype.transform = function(m, withCtrls) {
    var coords0 = this.coords[0];
    this.coords[0] = m[0] * coords0 + m[2] * this.coords[1] + m[4];
    this.coords[1] = m[1] * coords0 + m[3] * this.coords[1] + m[5];
    if (withCtrls) {
      coords0 = this.lCtrl.coords[0];
      this.lCtrl.coords[0] = m[0] * coords0 + m[2] * this.lCtrl.coords[1] + m[4];
      this.lCtrl.coords[1] = m[1] * coords0 + m[3] * this.lCtrl.coords[1] + m[5];
      coords0 = this.rCtrl.coords[0];
      this.rCtrl.coords[0] = m[0] * coords0 + m[2] * this.rCtrl.coords[1] + m[4];
      this.rCtrl.coords[1] = m[1] * coords0 + m[3] * this.rCtrl.coords[1] + m[5];
    }
    return this;
  };
  Node.prototype.update = function(params, contours, anchors, nodes) {
    for (var i in this.src) {
      var attr = this.src[i];
      if (typeof attr === 'object' && attr.updater) {
        var args = [contours, anchors, nodes];
        attr.parameters.forEach((function(name) {
          return args.push(params[name]);
        }));
        this[i] = attr.updater.apply({}, args);
      }
      if (i === 'onLine') {
        var knownCoord = this.src.x === undefined ? 'y' : 'x',
            p1 = nodes[this.src.onLine[0].operation.replace(/[^\d]/g, '')],
            p2 = nodes[this.src.onLine[1].operation.replace(/[^\d]/g, '')];
        this.onLine(knownCoord, p1, p2);
      }
    }
  };
  var $__default = Node;
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci82IiwiY2xhc3Nlcy9Ob2RlLmpzIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzUiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvNCIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8wIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzMiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMSIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8yIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLEtBQUssQUFBQyxFQ0FZLFlBQVcsRUNBN0IsVUFBUyxJQUFnQjs7QUNBekIsS0FBSSxLQUFpQixHQUFLLEVBQUMsZUFBMkI7QUFDMUMsU0FBb0IsRUFBQyxPQUFNLE1BQW1CLENBQUMsQ0FBQTtBQUFBLElGRHBELE1BQUk7QUFFWCxTQUFTLEtBQUcsQ0FBRyxJQUFHLENBQUk7QUFDckIsQUFBSSxNQUFBLENBQUEsTUFBSyxDQUFDO0FBQ1YsT0FBSyxJQUFHLEdBQUssRUFBRSxJQUFHLEVBQUUsSUFBTSxVQUFRLENBQUEsRUFBSyxDQUFBLElBQUcsRUFBRSxJQUFNLFVBQVEsQ0FBRSxDQUFJO0FBQy9ELFdBQUssRUFBSTtBQUNSLFFBQUEsQ0FBRyxDQUFBLElBQUcsRUFBRTtBQUNSLFFBQUEsQ0FBRyxDQUFBLElBQUcsRUFBRTtBQUFBLE1BQ1QsQ0FBQztJQUNGO0FBQUEsQUFFQSxRQUFJLFVBQVUsWUFBWSxNQUFNLEFBQUMsQ0FBRSxJQUFHLENBQUcsRUFBRSxNQUFLLENBQUUsQ0FBRSxDQUFDO0FBRXJELE9BQUcsTUFBTSxFQUFJLElBQUksTUFBSSxBQUFDLENBQUUsSUFBRyxHQUFLLENBQUEsSUFBRyxNQUFNLENBQUUsQ0FBQztBQUM1QyxPQUFHLE1BQU0sS0FBSyxJQUFJLEFBQUMsQ0FBQyxTQUFRLENBQUMsQ0FBQztBQUU5QixPQUFHLE1BQU0sRUFBSSxJQUFJLE1BQUksQUFBQyxDQUFFLElBQUcsR0FBSyxDQUFBLElBQUcsTUFBTSxDQUFFLENBQUM7QUFDNUMsT0FBRyxNQUFNLEtBQUssSUFBSSxBQUFDLENBQUMsU0FBUSxDQUFDLENBQUM7QUFFOUIsT0FBRyxJQUFJLEVBQUksQ0FBQSxJQUFHLEdBQUssQ0FBQSxJQUFHLElBQUksQ0FBQztFQUM1QjtBQUFBLEFBRUEsS0FBRyxVQUFVLEVBQUksQ0FBQSxNQUFLLE9BQU8sQUFBQyxDQUFDLEtBQUksVUFBVSxDQUFDLENBQUM7QUFDL0MsS0FBRyxVQUFVLFlBQVksRUFBSSxLQUFHLENBQUM7QUFFakMsS0FBRyxVQUFVLFVBQVUsRUFBSSxVQUFVLENBQUEsQ0FBRyxDQUFBLFNBQVEsQ0FBSTtBQUNuRCxBQUFJLE1BQUEsQ0FBQSxPQUFNLEVBQUksQ0FBQSxJQUFHLE9BQU8sQ0FBRSxDQUFBLENBQUMsQ0FBQztBQUM1QixPQUFHLE9BQU8sQ0FBRSxDQUFBLENBQUMsRUFBSSxDQUFBLENBQUEsQ0FBRSxDQUFBLENBQUMsRUFBSSxRQUFNLENBQUEsQ0FBSSxDQUFBLENBQUEsQ0FBRSxDQUFBLENBQUMsRUFBSSxDQUFBLElBQUcsT0FBTyxDQUFFLENBQUEsQ0FBQyxDQUFBLENBQUksQ0FBQSxDQUFBLENBQUUsQ0FBQSxDQUFDLENBQUM7QUFDOUQsT0FBRyxPQUFPLENBQUUsQ0FBQSxDQUFDLEVBQUksQ0FBQSxDQUFBLENBQUUsQ0FBQSxDQUFDLEVBQUksUUFBTSxDQUFBLENBQUksQ0FBQSxDQUFBLENBQUUsQ0FBQSxDQUFDLEVBQUksQ0FBQSxJQUFHLE9BQU8sQ0FBRSxDQUFBLENBQUMsQ0FBQSxDQUFJLENBQUEsQ0FBQSxDQUFFLENBQUEsQ0FBQyxDQUFDO0FBRTlELE9BQUssU0FBUSxDQUFJO0FBQ2hCLFlBQU0sRUFBSSxDQUFBLElBQUcsTUFBTSxPQUFPLENBQUUsQ0FBQSxDQUFDLENBQUM7QUFDOUIsU0FBRyxNQUFNLE9BQU8sQ0FBRSxDQUFBLENBQUMsRUFBSSxDQUFBLENBQUEsQ0FBRSxDQUFBLENBQUMsRUFBSSxRQUFNLENBQUEsQ0FBSSxDQUFBLENBQUEsQ0FBRSxDQUFBLENBQUMsRUFBSSxDQUFBLElBQUcsTUFBTSxPQUFPLENBQUUsQ0FBQSxDQUFDLENBQUEsQ0FBSSxDQUFBLENBQUEsQ0FBRSxDQUFBLENBQUMsQ0FBQztBQUMxRSxTQUFHLE1BQU0sT0FBTyxDQUFFLENBQUEsQ0FBQyxFQUFJLENBQUEsQ0FBQSxDQUFFLENBQUEsQ0FBQyxFQUFJLFFBQU0sQ0FBQSxDQUFJLENBQUEsQ0FBQSxDQUFFLENBQUEsQ0FBQyxFQUFJLENBQUEsSUFBRyxNQUFNLE9BQU8sQ0FBRSxDQUFBLENBQUMsQ0FBQSxDQUFJLENBQUEsQ0FBQSxDQUFFLENBQUEsQ0FBQyxDQUFDO0FBRTFFLFlBQU0sRUFBSSxDQUFBLElBQUcsTUFBTSxPQUFPLENBQUUsQ0FBQSxDQUFDLENBQUM7QUFDOUIsU0FBRyxNQUFNLE9BQU8sQ0FBRSxDQUFBLENBQUMsRUFBSSxDQUFBLENBQUEsQ0FBRSxDQUFBLENBQUMsRUFBSSxRQUFNLENBQUEsQ0FBSSxDQUFBLENBQUEsQ0FBRSxDQUFBLENBQUMsRUFBSSxDQUFBLElBQUcsTUFBTSxPQUFPLENBQUUsQ0FBQSxDQUFDLENBQUEsQ0FBSSxDQUFBLENBQUEsQ0FBRSxDQUFBLENBQUMsQ0FBQztBQUMxRSxTQUFHLE1BQU0sT0FBTyxDQUFFLENBQUEsQ0FBQyxFQUFJLENBQUEsQ0FBQSxDQUFFLENBQUEsQ0FBQyxFQUFJLFFBQU0sQ0FBQSxDQUFJLENBQUEsQ0FBQSxDQUFFLENBQUEsQ0FBQyxFQUFJLENBQUEsSUFBRyxNQUFNLE9BQU8sQ0FBRSxDQUFBLENBQUMsQ0FBQSxDQUFJLENBQUEsQ0FBQSxDQUFFLENBQUEsQ0FBQyxDQUFDO0lBQzNFO0FBQUEsQUFFQSxTQUFPLEtBQUcsQ0FBQztFQUNaLENBQUM7QUFFRCxLQUFHLFVBQVUsT0FBTyxFQUFJLFVBQVUsTUFBSyxDQUFHLENBQUEsUUFBTyxDQUFHLENBQUEsT0FBTSxDQUFHLENBQUEsS0FBSTtBQUNoRSxRQUFVLEdBQUEsQ0FBQSxDQUFBLENBQUEsRUFBSyxDQUFBLElBQUcsSUFBSSxDQUFJO0FBQ3pCLEFBQUksUUFBQSxDQUFBLElBQUcsRUFBSSxDQUFBLElBQUcsSUFBSSxDQUFFLENBQUEsQ0FBQyxDQUFDO0FBRXRCLFNBQUssTUFBTyxLQUFHLENBQUEsR0FBTSxTQUFPLENBQUEsRUFBSyxDQUFBLElBQUcsUUFBUSxDQUFJO0FBQy9DLEFBQUksVUFBQSxDQUFBLElBQUcsRUFBSSxFQUFFLFFBQU8sQ0FBRyxRQUFNLENBQUcsTUFBSSxDQUFFLENBQUM7QUFDdkMsV0FBRyxXQUFXLFFBQVEsQUFBQyxFQUFDLFNBQUEsSUFBRztlQUFLLENBQUEsSUFBRyxLQUFLLEFBQUMsQ0FBRSxNQUFLLENBQUUsSUFBRyxDQUFDLENBQUU7UUFBQSxFQUFFLENBQUM7QUFDM0QsV0FBRyxDQUFFLENBQUEsQ0FBQyxFQUFJLENBQUEsSUFBRyxRQUFRLE1BQU0sQUFBQyxDQUFFLEVBQUMsQ0FBRyxLQUFHLENBQUUsQ0FBQztNQUN6QztBQUFBLEFBRUEsU0FBSyxDQUFBLElBQU0sU0FBTyxDQUFJO0FBQ3JCLEFBQUksVUFBQSxDQUFBLFVBQVMsRUFBSSxDQUFBLElBQUcsSUFBSSxFQUFFLElBQU0sVUFBUSxDQUFBLENBQUksSUFBRSxFQUFJLElBQUU7QUFDbkQsYUFBQyxFQUFJLENBQUEsS0FBSSxDQUFHLElBQUcsSUFBSSxPQUFPLENBQUUsQ0FBQSxDQUFDLFVBQVUsUUFBUSxBQUFDLENBQUMsUUFBTyxDQUFHLEdBQUMsQ0FBQyxDQUFFO0FBQy9ELGFBQUMsRUFBSSxDQUFBLEtBQUksQ0FBRyxJQUFHLElBQUksT0FBTyxDQUFFLENBQUEsQ0FBQyxVQUFVLFFBQVEsQUFBQyxDQUFDLFFBQU8sQ0FBRyxHQUFDLENBQUMsQ0FBRSxDQUFDO0FBRWpFLFdBQUcsT0FBTyxBQUFDLENBQUUsVUFBUyxDQUFHLEdBQUMsQ0FBRyxHQUFDLENBQUUsQ0FBQztNQUNsQztBQUFBLElBQ0Q7QUFBQSxFQUNELENBQUM7QUc3REQsQUFBSSxJQUFBLENBQUEsVUFBUyxFSCtERSxLRy9Ea0IsQUgrRGYsQ0cvRGU7QUNBakM7QUNBQSxnQkFBd0I7QUFBRSx1QkFBd0I7SUFBRTtBQ0FwRCxhQUFTLENBQUcsS0FBRztBQUFBLEdGQVE7QUhFbkIsQ0ZGdUMsQ0FBQztBQytEekIiLCJmaWxlIjoiY2xhc3Nlcy9Ob2RlLmpzIiwic291cmNlUm9vdCI6Ii4uIiwic291cmNlc0NvbnRlbnQiOlsiZGVmaW5lKCRfX3BsYWNlaG9sZGVyX18wLCAkX19wbGFjZWhvbGRlcl9fMSk7IiwiaW1wb3J0IFBvaW50IGZyb20gJy4vUG9pbnQuanMnO1xuXG5mdW5jdGlvbiBOb2RlKCBhcmdzICkge1xuXHR2YXIgY29vcmRzO1xuXHRpZiAoIGFyZ3MgJiYgKCBhcmdzLnggIT09IHVuZGVmaW5lZCB8fCBhcmdzLnkgIT09IHVuZGVmaW5lZCApICkge1xuXHRcdGNvb3JkcyA9IHtcblx0XHRcdHg6IGFyZ3MueCxcblx0XHRcdHk6IGFyZ3MueVxuXHRcdH07XG5cdH1cblxuXHRQb2ludC5wcm90b3R5cGUuY29uc3RydWN0b3IuYXBwbHkoIHRoaXMsIFsgY29vcmRzIF0gKTtcblxuXHR0aGlzLmxDdHJsID0gbmV3IFBvaW50KCBhcmdzICYmIGFyZ3MubEN0cmwgKTtcblx0dGhpcy5sQ3RybC50YWdzLmFkZCgnY29udHJvbCcpO1xuXG5cdHRoaXMuckN0cmwgPSBuZXcgUG9pbnQoIGFyZ3MgJiYgYXJncy5yQ3RybCApO1xuXHR0aGlzLnJDdHJsLnRhZ3MuYWRkKCdjb250cm9sJyk7XG5cblx0dGhpcy5zcmMgPSBhcmdzICYmIGFyZ3Muc3JjO1xufVxuXG5Ob2RlLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUG9pbnQucHJvdG90eXBlKTtcbk5vZGUucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gTm9kZTtcblxuTm9kZS5wcm90b3R5cGUudHJhbnNmb3JtID0gZnVuY3Rpb24oIG0sIHdpdGhDdHJscyApIHtcblx0dmFyIGNvb3JkczAgPSB0aGlzLmNvb3Jkc1swXTtcblx0dGhpcy5jb29yZHNbMF0gPSBtWzBdICogY29vcmRzMCArIG1bMl0gKiB0aGlzLmNvb3Jkc1sxXSArIG1bNF07XG5cdHRoaXMuY29vcmRzWzFdID0gbVsxXSAqIGNvb3JkczAgKyBtWzNdICogdGhpcy5jb29yZHNbMV0gKyBtWzVdO1xuXG5cdGlmICggd2l0aEN0cmxzICkge1xuXHRcdGNvb3JkczAgPSB0aGlzLmxDdHJsLmNvb3Jkc1swXTtcblx0XHR0aGlzLmxDdHJsLmNvb3Jkc1swXSA9IG1bMF0gKiBjb29yZHMwICsgbVsyXSAqIHRoaXMubEN0cmwuY29vcmRzWzFdICsgbVs0XTtcblx0XHR0aGlzLmxDdHJsLmNvb3Jkc1sxXSA9IG1bMV0gKiBjb29yZHMwICsgbVszXSAqIHRoaXMubEN0cmwuY29vcmRzWzFdICsgbVs1XTtcblxuXHRcdGNvb3JkczAgPSB0aGlzLnJDdHJsLmNvb3Jkc1swXTtcblx0XHR0aGlzLnJDdHJsLmNvb3Jkc1swXSA9IG1bMF0gKiBjb29yZHMwICsgbVsyXSAqIHRoaXMuckN0cmwuY29vcmRzWzFdICsgbVs0XTtcblx0XHR0aGlzLnJDdHJsLmNvb3Jkc1sxXSA9IG1bMV0gKiBjb29yZHMwICsgbVszXSAqIHRoaXMuckN0cmwuY29vcmRzWzFdICsgbVs1XTtcblx0fVxuXG5cdHJldHVybiB0aGlzO1xufTtcblxuTm9kZS5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oIHBhcmFtcywgY29udG91cnMsIGFuY2hvcnMsIG5vZGVzICkge1xuXHRmb3IgKCB2YXIgaSBpbiB0aGlzLnNyYyApIHtcblx0XHR2YXIgYXR0ciA9IHRoaXMuc3JjW2ldO1xuXG5cdFx0aWYgKCB0eXBlb2YgYXR0ciA9PT0gJ29iamVjdCcgJiYgYXR0ci51cGRhdGVyICkge1xuXHRcdFx0dmFyIGFyZ3MgPSBbIGNvbnRvdXJzLCBhbmNob3JzLCBub2RlcyBdO1xuXHRcdFx0YXR0ci5wYXJhbWV0ZXJzLmZvckVhY2gobmFtZSA9PiBhcmdzLnB1c2goIHBhcmFtc1tuYW1lXSApICk7XG5cdFx0XHR0aGlzW2ldID0gYXR0ci51cGRhdGVyLmFwcGx5KCB7fSwgYXJncyApO1xuXHRcdH1cblxuXHRcdGlmICggaSA9PT0gJ29uTGluZScgKSB7XG5cdFx0XHR2YXIga25vd25Db29yZCA9IHRoaXMuc3JjLnggPT09IHVuZGVmaW5lZCA/ICd5JyA6ICd4Jyxcblx0XHRcdFx0cDEgPSBub2Rlc1sgdGhpcy5zcmMub25MaW5lWzBdLm9wZXJhdGlvbi5yZXBsYWNlKC9bXlxcZF0vZywgJycpIF0sXG5cdFx0XHRcdHAyID0gbm9kZXNbIHRoaXMuc3JjLm9uTGluZVsxXS5vcGVyYXRpb24ucmVwbGFjZSgvW15cXGRdL2csICcnKSBdO1xuXG5cdFx0XHR0aGlzLm9uTGluZSgga25vd25Db29yZCwgcDEsIHAyICk7XG5cdFx0fVxuXHR9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBOb2RlOyIsImZ1bmN0aW9uKCRfX3BsYWNlaG9sZGVyX18wKSB7XG4gICAgICAkX19wbGFjZWhvbGRlcl9fMVxuICAgIH0iLCJpZiAoISRfX3BsYWNlaG9sZGVyX18wIHx8ICEkX19wbGFjZWhvbGRlcl9fMS5fX2VzTW9kdWxlKVxuICAgICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzIgPSB7ZGVmYXVsdDogJF9fcGxhY2Vob2xkZXJfXzN9IiwidmFyICRfX2RlZmF1bHQgPSAkX19wbGFjZWhvbGRlcl9fMCIsInJldHVybiAkX19wbGFjZWhvbGRlcl9fMCIsImdldCAkX19wbGFjZWhvbGRlcl9fMCgpIHsgcmV0dXJuICRfX3BsYWNlaG9sZGVyX18xOyB9IiwiX19lc01vZHVsZTogdHJ1ZSJdfQ==;
define('classes/Contour.js',['./Classify.js', './Node.js'], function($__0,$__2) {
  
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  var Classify = $__0.default;
  var Node = $__2.default;
  function Contour() {
    Classify.prototype.constructor.apply(this);
    this.nodes = [];
  }
  Contour.prototype = Object.create(Classify.prototype);
  Contour.prototype.constructor = Contour;
  Contour.prototype.addNode = function(args) {
    var node = new Node(args);
    this.nodes.push(node);
    return node;
  };
  Contour.prototype.transform = function(m) {
    this.nodes.forEach((function(node) {
      return node.transform(m);
    }));
    return this;
  };
  Contour.prototype.link = function() {
    var i = this.nodes.length;
    if (i > 1) {
      this.nodes[0].prev = this.nodes[i - 1];
      this.nodes[i - 1].next = this.nodes[0];
    }
    while (i--) {
      if (this.nodes[i + 1]) {
        this.nodes[i].next = this.nodes[i + 1];
      }
      if (this.nodes[i - 1]) {
        this.nodes[i].prev = this.nodes[i - 1];
      }
    }
  };
  Contour.prototype.update = function(params, contours, anchors) {
    var $__4 = this;
    this.nodes.forEach((function(node) {
      return node.update(params, contours, anchors, $__4.nodes);
    }));
  };
  var $__default = Contour;
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci82IiwiY2xhc3Nlcy9Db250b3VyLmpzIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzUiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvNCIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8wIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzMiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMSIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8yIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLEtBQUssQUFBQyxFQ0FlLGVBQWMsQ0FDbEIsWUFBVSxFQ0QzQixVQUFTLFNBQWdCOztBQ0F6QixLQUFJLEtBQWlCLEdBQUssRUFBQyxlQUEyQjtBQUMxQyxTQUFvQixFQUFDLE9BQU0sTUFBbUIsQ0FBQyxDQUFBO0FBRDNELEFBQzJELEtBRHZELEtBQWlCLEdBQUssRUFBQyxlQUEyQjtBQUMxQyxTQUFvQixFQUFDLE9BQU0sTUFBbUIsQ0FBQyxDQUFBO0FBQUEsSUZEcEQsU0FBTztJQUNQLEtBQUc7QUFFVixTQUFTLFFBQU0sQ0FBQyxBQUFDLENBQUU7QUFDbEIsV0FBTyxVQUFVLFlBQVksTUFBTSxBQUFDLENBQUUsSUFBRyxDQUFFLENBQUM7QUFFNUMsT0FBRyxNQUFNLEVBQUksR0FBQyxDQUFDO0VBTWhCO0FBQUEsQUFFQSxRQUFNLFVBQVUsRUFBSSxDQUFBLE1BQUssT0FBTyxBQUFDLENBQUMsUUFBTyxVQUFVLENBQUMsQ0FBQztBQUNyRCxRQUFNLFVBQVUsWUFBWSxFQUFJLFFBQU0sQ0FBQztBQUV2QyxRQUFNLFVBQVUsUUFBUSxFQUFJLFVBQVUsSUFBRyxDQUFJO0FBQzVDLEFBQUksTUFBQSxDQUFBLElBQUcsRUFBSSxJQUFJLEtBQUcsQUFBQyxDQUFFLElBQUcsQ0FBRSxDQUFDO0FBQzNCLE9BQUcsTUFBTSxLQUFLLEFBQUMsQ0FBRSxJQUFHLENBQUUsQ0FBQztBQUN2QixTQUFPLEtBQUcsQ0FBQztFQUNaLENBQUM7QUFFRCxRQUFNLFVBQVUsVUFBVSxFQUFJLFVBQVUsQ0FBQTtBQUN2QyxPQUFHLE1BQU0sUUFBUSxBQUFDLEVBQUMsU0FBQSxJQUFHO1dBQUssQ0FBQSxJQUFHLFVBQVUsQUFBQyxDQUFDLENBQUEsQ0FBQztJQUFBLEVBQUMsQ0FBQztBQUU3QyxTQUFPLEtBQUcsQ0FBQztFQUNaLENBQUM7QUFFRCxRQUFNLFVBQVUsS0FBSyxFQUFJLFVBQVEsQUFBQyxDQUFFO0FBQ25DLEFBQUksTUFBQSxDQUFBLENBQUEsRUFBSSxDQUFBLElBQUcsTUFBTSxPQUFPLENBQUM7QUFFekIsT0FBSyxDQUFBLEVBQUksRUFBQSxDQUFJO0FBQ1osU0FBRyxNQUFNLENBQUUsQ0FBQSxDQUFDLEtBQUssRUFBSSxDQUFBLElBQUcsTUFBTSxDQUFFLENBQUEsRUFBSSxFQUFBLENBQUMsQ0FBQztBQUN0QyxTQUFHLE1BQU0sQ0FBRSxDQUFBLEVBQUksRUFBQSxDQUFDLEtBQUssRUFBSSxDQUFBLElBQUcsTUFBTSxDQUFFLENBQUEsQ0FBQyxDQUFDO0lBQ3ZDO0FBQUEsQUFFQSxVQUFRLENBQUEsRUFBRSxDQUFJO0FBQ2IsU0FBSyxJQUFHLE1BQU0sQ0FBRSxDQUFBLEVBQUksRUFBQSxDQUFDLENBQUk7QUFDeEIsV0FBRyxNQUFNLENBQUUsQ0FBQSxDQUFDLEtBQUssRUFBSSxDQUFBLElBQUcsTUFBTSxDQUFFLENBQUEsRUFBSSxFQUFBLENBQUMsQ0FBQztNQUN2QztBQUFBLEFBQ0EsU0FBSyxJQUFHLE1BQU0sQ0FBRSxDQUFBLEVBQUksRUFBQSxDQUFDLENBQUk7QUFDeEIsV0FBRyxNQUFNLENBQUUsQ0FBQSxDQUFDLEtBQUssRUFBSSxDQUFBLElBQUcsTUFBTSxDQUFFLENBQUEsRUFBSSxFQUFBLENBQUMsQ0FBQztNQUN2QztBQUFBLElBQ0Q7QUFBQSxFQUNELENBQUM7QUFFRCxRQUFNLFVBQVUsT0FBTyxFQUFJLFVBQVUsTUFBSyxDQUFHLENBQUEsUUFBTyxDQUFHLENBQUEsT0FBTTs7QUFDNUQsT0FBRyxNQUFNLFFBQVEsQUFBQyxFQUFDLFNBQUEsSUFBRztXQUFLLENBQUEsSUFBRyxPQUFPLEFBQUMsQ0FBRSxNQUFLLENBQUcsU0FBTyxDQUFHLFFBQU0sQ0FBRyxXQUFTLENBQUU7SUFBQSxFQUFDLENBQUM7RUFDakYsQ0FBQztBR2pERCxBQUFJLElBQUEsQ0FBQSxVQUFTLEVIbURFLFFHbkRrQixBSG1EWixDR25EWTtBQ0FqQztBQ0FBLGdCQUF3QjtBQUFFLHVCQUF3QjtJQUFFO0FDQXBELGFBQVMsQ0FBRyxLQUFHO0FBQUEsR0ZBUTtBSEVuQixDRkZ1QyxDQUFDO0FDbUR0QiIsImZpbGUiOiJjbGFzc2VzL0NvbnRvdXIuanMiLCJzb3VyY2VSb290IjoiLi4iLCJzb3VyY2VzQ29udGVudCI6WyJkZWZpbmUoJF9fcGxhY2Vob2xkZXJfXzAsICRfX3BsYWNlaG9sZGVyX18xKTsiLCJpbXBvcnQgQ2xhc3NpZnkgZnJvbSAnLi9DbGFzc2lmeS5qcyc7XG5pbXBvcnQgTm9kZSBmcm9tICcuL05vZGUuanMnO1xuXG5mdW5jdGlvbiBDb250b3VyKCkge1xuXHRDbGFzc2lmeS5wcm90b3R5cGUuY29uc3RydWN0b3IuYXBwbHkoIHRoaXMgKTtcblxuXHR0aGlzLm5vZGVzID0gW107XG5cdC8vIGlmICggYXJncy5ub2RlcyApIHtcblx0Ly8gXHRhcmdzLm5vZGVzLmZvckVhY2gobm9kZSA9PiB7XG5cdC8vIFx0XHR0aGlzLm5vZGVzLnB1c2goIG5ldyBOb2RlKCBub2RlICkgKVxuXHQvLyBcdH0pO1xuXHQvLyB9XG59XG5cbkNvbnRvdXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShDbGFzc2lmeS5wcm90b3R5cGUpO1xuQ29udG91ci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBDb250b3VyO1xuXG5Db250b3VyLnByb3RvdHlwZS5hZGROb2RlID0gZnVuY3Rpb24oIGFyZ3MgKSB7XG5cdHZhciBub2RlID0gbmV3IE5vZGUoIGFyZ3MgKTtcblx0dGhpcy5ub2Rlcy5wdXNoKCBub2RlICk7XG5cdHJldHVybiBub2RlO1xufTtcblxuQ29udG91ci5wcm90b3R5cGUudHJhbnNmb3JtID0gZnVuY3Rpb24oIG0gKSB7XG5cdHRoaXMubm9kZXMuZm9yRWFjaChub2RlID0+IG5vZGUudHJhbnNmb3JtKG0pKTtcblxuXHRyZXR1cm4gdGhpcztcbn07XG5cbkNvbnRvdXIucHJvdG90eXBlLmxpbmsgPSBmdW5jdGlvbigpIHtcblx0dmFyIGkgPSB0aGlzLm5vZGVzLmxlbmd0aDtcblxuXHRpZiAoIGkgPiAxICkge1xuXHRcdHRoaXMubm9kZXNbMF0ucHJldiA9IHRoaXMubm9kZXNbaSAtIDFdO1xuXHRcdHRoaXMubm9kZXNbaSAtIDFdLm5leHQgPSB0aGlzLm5vZGVzWzBdO1xuXHR9XG5cblx0d2hpbGUgKCBpLS0gKSB7XG5cdFx0aWYgKCB0aGlzLm5vZGVzW2kgKyAxXSApIHtcblx0XHRcdHRoaXMubm9kZXNbaV0ubmV4dCA9IHRoaXMubm9kZXNbaSArIDFdO1xuXHRcdH1cblx0XHRpZiAoIHRoaXMubm9kZXNbaSAtIDFdICkge1xuXHRcdFx0dGhpcy5ub2Rlc1tpXS5wcmV2ID0gdGhpcy5ub2Rlc1tpIC0gMV07XG5cdFx0fVxuXHR9XG59O1xuXG5Db250b3VyLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiggcGFyYW1zLCBjb250b3VycywgYW5jaG9ycyApIHtcblx0dGhpcy5ub2Rlcy5mb3JFYWNoKG5vZGUgPT4gbm9kZS51cGRhdGUoIHBhcmFtcywgY29udG91cnMsIGFuY2hvcnMsIHRoaXMubm9kZXMgKSk7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBDb250b3VyOyIsImZ1bmN0aW9uKCRfX3BsYWNlaG9sZGVyX18wKSB7XG4gICAgICAkX19wbGFjZWhvbGRlcl9fMVxuICAgIH0iLCJpZiAoISRfX3BsYWNlaG9sZGVyX18wIHx8ICEkX19wbGFjZWhvbGRlcl9fMS5fX2VzTW9kdWxlKVxuICAgICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzIgPSB7ZGVmYXVsdDogJF9fcGxhY2Vob2xkZXJfXzN9IiwidmFyICRfX2RlZmF1bHQgPSAkX19wbGFjZWhvbGRlcl9fMCIsInJldHVybiAkX19wbGFjZWhvbGRlcl9fMCIsImdldCAkX19wbGFjZWhvbGRlcl9fMCgpIHsgcmV0dXJuICRfX3BsYWNlaG9sZGVyX18xOyB9IiwiX19lc01vZHVsZTogdHJ1ZSJdfQ==;
define('classes/Glyph.js',['./Classify.js', './Contour.js'], function($__0,$__2) {
  
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  var Classify = $__0.default;
  var Contour = $__2.default;
  function Glyph() {
    Classify.prototype.constructor.apply(this);
    this.contours = [];
    this.anchors = [];
  }
  Glyph.prototype = Object.create(Classify.prototype);
  Glyph.prototype.constructor = Glyph;
  Glyph.prototype.addContour = function(args) {
    var contour = new Contour(args);
    this.contours.push(contour);
    return contour;
  };
  Glyph.prototype.addAnchor = function(args) {
    var node = new Node(args);
    this.nodes.push(node);
    return node;
  };
  Glyph.prototype.update = function(params) {
    var $__4 = this;
    this.anchors.forEach((function(anchor) {
      return anchor.update(params, $__4.contours, $__4.anchors);
    }));
    this.contours.forEach((function(contour) {
      return contour.update(params, $__4.contours, $__4.anchors);
    }));
  };
  var $__default = Glyph;
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci82IiwiY2xhc3Nlcy9HbHlwaC5qcyIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci81IiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzQiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMCIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8zIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzEiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxLQUFLLEFBQUMsRUNBZSxlQUFjLENBQ2YsZUFBYSxFQ0RqQyxVQUFTLFNBQWdCOztBQ0F6QixLQUFJLEtBQWlCLEdBQUssRUFBQyxlQUEyQjtBQUMxQyxTQUFvQixFQUFDLE9BQU0sTUFBbUIsQ0FBQyxDQUFBO0FBRDNELEFBQzJELEtBRHZELEtBQWlCLEdBQUssRUFBQyxlQUEyQjtBQUMxQyxTQUFvQixFQUFDLE9BQU0sTUFBbUIsQ0FBQyxDQUFBO0FBQUEsSUZEcEQsU0FBTztJQUNQLFFBQU07QUFFYixTQUFTLE1BQUksQ0FBQyxBQUFDLENBQUU7QUFDaEIsV0FBTyxVQUFVLFlBQVksTUFBTSxBQUFDLENBQUUsSUFBRyxDQUFFLENBQUM7QUFFNUMsT0FBRyxTQUFTLEVBQUksR0FBQyxDQUFDO0FBQ2xCLE9BQUcsUUFBUSxFQUFJLEdBQUMsQ0FBQztFQU1sQjtBQUFBLEFBRUEsTUFBSSxVQUFVLEVBQUksQ0FBQSxNQUFLLE9BQU8sQUFBQyxDQUFDLFFBQU8sVUFBVSxDQUFDLENBQUM7QUFDbkQsTUFBSSxVQUFVLFlBQVksRUFBSSxNQUFJLENBQUM7QUFFbkMsTUFBSSxVQUFVLFdBQVcsRUFBSSxVQUFVLElBQUcsQ0FBSTtBQUM3QyxBQUFJLE1BQUEsQ0FBQSxPQUFNLEVBQUksSUFBSSxRQUFNLEFBQUMsQ0FBRSxJQUFHLENBQUUsQ0FBQztBQUNqQyxPQUFHLFNBQVMsS0FBSyxBQUFDLENBQUUsT0FBTSxDQUFFLENBQUM7QUFDN0IsU0FBTyxRQUFNLENBQUM7RUFDZixDQUFDO0FBRUQsTUFBSSxVQUFVLFVBQVUsRUFBSSxVQUFVLElBQUcsQ0FBSTtBQUM1QyxBQUFJLE1BQUEsQ0FBQSxJQUFHLEVBQUksSUFBSSxLQUFHLEFBQUMsQ0FBRSxJQUFHLENBQUUsQ0FBQztBQUMzQixPQUFHLE1BQU0sS0FBSyxBQUFDLENBQUUsSUFBRyxDQUFFLENBQUM7QUFDdkIsU0FBTyxLQUFHLENBQUM7RUFDWixDQUFDO0FBRUQsTUFBSSxVQUFVLE9BQU8sRUFBSSxVQUFVLE1BQUs7O0FBWXZDLE9BQUcsUUFBUSxRQUFRLEFBQUMsRUFBQyxTQUFBLE1BQUs7V0FBSyxDQUFBLE1BQUssT0FBTyxBQUFDLENBQUUsTUFBSyxDQUFHLGNBQVksQ0FBRyxhQUFXLENBQUU7SUFBQSxFQUFDLENBQUM7QUFDcEYsT0FBRyxTQUFTLFFBQVEsQUFBQyxFQUFDLFNBQUEsT0FBTTtXQUFLLENBQUEsT0FBTSxPQUFPLEFBQUMsQ0FBRSxNQUFLLENBQUcsY0FBWSxDQUFHLGFBQVcsQ0FBRTtJQUFBLEVBQUMsQ0FBQztFQUN4RixDQUFDO0FHNUNELEFBQUksSUFBQSxDQUFBLFVBQVMsRUg4Q0UsTUc5Q2tCLEFIOENkLENHOUNjO0FDQWpDO0FDQUEsZ0JBQXdCO0FBQUUsdUJBQXdCO0lBQUU7QUNBcEQsYUFBUyxDQUFHLEtBQUc7QUFBQSxHRkFRO0FIRW5CLENGRnVDLENBQUM7QUM4Q3hCIiwiZmlsZSI6ImNsYXNzZXMvR2x5cGguanMiLCJzb3VyY2VSb290IjoiLi4iLCJzb3VyY2VzQ29udGVudCI6WyJkZWZpbmUoJF9fcGxhY2Vob2xkZXJfXzAsICRfX3BsYWNlaG9sZGVyX18xKTsiLCJpbXBvcnQgQ2xhc3NpZnkgZnJvbSAnLi9DbGFzc2lmeS5qcyc7XG5pbXBvcnQgQ29udG91ciBmcm9tICcuL0NvbnRvdXIuanMnO1xuXG5mdW5jdGlvbiBHbHlwaCgpIHtcblx0Q2xhc3NpZnkucHJvdG90eXBlLmNvbnN0cnVjdG9yLmFwcGx5KCB0aGlzICk7XG5cblx0dGhpcy5jb250b3VycyA9IFtdO1xuXHR0aGlzLmFuY2hvcnMgPSBbXTtcblx0Ly8gaWYgKCBhcmdzLmNvbnRvdXJzICkge1xuXHQvLyBcdGFyZ3MuY29udG91cnMuZm9yRWFjaChjb250b3VyID0+IHtcblx0Ly8gXHRcdHRoaXMuY29udG91cnMucHVzaCggbmV3IENvbnRvdXIoIGNvbnRvdXIgKSApO1xuXHQvLyBcdH0pO1xuXHQvLyB9XG59XG5cbkdseXBoLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoQ2xhc3NpZnkucHJvdG90eXBlKTtcbkdseXBoLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEdseXBoO1xuXG5HbHlwaC5wcm90b3R5cGUuYWRkQ29udG91ciA9IGZ1bmN0aW9uKCBhcmdzICkge1xuXHR2YXIgY29udG91ciA9IG5ldyBDb250b3VyKCBhcmdzICk7XG5cdHRoaXMuY29udG91cnMucHVzaCggY29udG91ciApO1xuXHRyZXR1cm4gY29udG91cjtcbn07XG5cbkdseXBoLnByb3RvdHlwZS5hZGRBbmNob3IgPSBmdW5jdGlvbiggYXJncyApIHtcblx0dmFyIG5vZGUgPSBuZXcgTm9kZSggYXJncyApO1xuXHR0aGlzLm5vZGVzLnB1c2goIG5vZGUgKTtcblx0cmV0dXJuIG5vZGU7XG59O1xuXG5HbHlwaC5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oIHBhcmFtcyApIHtcblx0Ly8gdGhpcy5zcmMuc29ydGVkUHJvcHMuZm9yRWFjaChpZCA9PiB7XG5cdC8vIFx0aWQgPSBpZC5zcGxpdCgnLicpO1xuXHQvLyBcdHZhciBjb250b3VyID0gdGhpcy5jb250b3VycyhpZFswXSk7XG5cblx0Ly8gXHRjb250b3VyLm5vZGVzW2lkWzFdXS51cGRhdGUoIGlkWzJdLCB7XG5cdC8vIFx0XHRwYXJhbXM6IHBhcmFtcyxcblx0Ly8gXHRcdGdseXBoOiB0aGlzLFxuXHQvLyBcdFx0Y29udG91cjogY29udG91clxuXHQvLyBcdH0pO1xuXHQvLyB9KTtcblxuXHR0aGlzLmFuY2hvcnMuZm9yRWFjaChhbmNob3IgPT4gYW5jaG9yLnVwZGF0ZSggcGFyYW1zLCB0aGlzLmNvbnRvdXJzLCB0aGlzLmFuY2hvcnMgKSk7XG5cdHRoaXMuY29udG91cnMuZm9yRWFjaChjb250b3VyID0+IGNvbnRvdXIudXBkYXRlKCBwYXJhbXMsIHRoaXMuY29udG91cnMsIHRoaXMuYW5jaG9ycyApKTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IEdseXBoOyIsImZ1bmN0aW9uKCRfX3BsYWNlaG9sZGVyX18wKSB7XG4gICAgICAkX19wbGFjZWhvbGRlcl9fMVxuICAgIH0iLCJpZiAoISRfX3BsYWNlaG9sZGVyX18wIHx8ICEkX19wbGFjZWhvbGRlcl9fMS5fX2VzTW9kdWxlKVxuICAgICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzIgPSB7ZGVmYXVsdDogJF9fcGxhY2Vob2xkZXJfXzN9IiwidmFyICRfX2RlZmF1bHQgPSAkX19wbGFjZWhvbGRlcl9fMCIsInJldHVybiAkX19wbGFjZWhvbGRlcl9fMCIsImdldCAkX19wbGFjZWhvbGRlcl9fMCgpIHsgcmV0dXJuICRfX3BsYWNlaG9sZGVyX18xOyB9IiwiX19lc01vZHVsZTogdHJ1ZSJdfQ==;
define('classes/Font.js',['./Glyph.js'], function($__0) {
  
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  var Glyph = $__0.default;
  function Font() {
    this.glyphs = {};
  }
  Font.prototype.addGlyph = function(name, args) {
    return (this.glyphs[name] = new Glyph(args));
  };
  var $__default = Font;
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci82IiwiY2xhc3Nlcy9Gb250LmpzIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzUiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvNCIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8wIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzMiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMSIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8yIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLEtBQUssQUFBQyxFQ0FZLFlBQVcsRUNBN0IsVUFBUyxJQUFnQjs7QUNBekIsS0FBSSxLQUFpQixHQUFLLEVBQUMsZUFBMkI7QUFDMUMsU0FBb0IsRUFBQyxPQUFNLE1BQW1CLENBQUMsQ0FBQTtBQUFBLElGRHBELE1BQUk7QUFFWCxTQUFTLEtBQUcsQ0FBQyxBQUFDLENBQUU7QUFDZixPQUFHLE9BQU8sRUFBSSxHQUFDLENBQUM7RUFDakI7QUFBQSxBQUVBLEtBQUcsVUFBVSxTQUFTLEVBQUksVUFBVSxJQUFHLENBQUcsQ0FBQSxJQUFHLENBQUk7QUFDaEQsU0FBTyxFQUFFLElBQUcsT0FBTyxDQUFFLElBQUcsQ0FBQyxFQUFJLElBQUksTUFBSSxBQUFDLENBQUUsSUFBRyxDQUFFLENBQUUsQ0FBQztFQUNqRCxDQUFDO0FHUkQsQUFBSSxJQUFBLENBQUEsVUFBUyxFSFVFLEtHVmtCLEFIVWYsQ0dWZTtBQ0FqQztBQ0FBLGdCQUF3QjtBQUFFLHVCQUF3QjtJQUFFO0FDQXBELGFBQVMsQ0FBRyxLQUFHO0FBQUEsR0ZBUTtBSEVuQixDRkZ1QyxDQUFDO0FDVXpCIiwiZmlsZSI6ImNsYXNzZXMvRm9udC5qcyIsInNvdXJjZVJvb3QiOiIuLiIsInNvdXJjZXNDb250ZW50IjpbImRlZmluZSgkX19wbGFjZWhvbGRlcl9fMCwgJF9fcGxhY2Vob2xkZXJfXzEpOyIsImltcG9ydCBHbHlwaCBmcm9tICcuL0dseXBoLmpzJztcblxuZnVuY3Rpb24gRm9udCgpIHtcblx0dGhpcy5nbHlwaHMgPSB7fTtcbn1cblxuRm9udC5wcm90b3R5cGUuYWRkR2x5cGggPSBmdW5jdGlvbiggbmFtZSwgYXJncyApIHtcblx0cmV0dXJuICggdGhpcy5nbHlwaHNbbmFtZV0gPSBuZXcgR2x5cGgoIGFyZ3MgKSApO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgRm9udDsiLCJmdW5jdGlvbigkX19wbGFjZWhvbGRlcl9fMCkge1xuICAgICAgJF9fcGxhY2Vob2xkZXJfXzFcbiAgICB9IiwiaWYgKCEkX19wbGFjZWhvbGRlcl9fMCB8fCAhJF9fcGxhY2Vob2xkZXJfXzEuX19lc01vZHVsZSlcbiAgICAgICAgICAgICRfX3BsYWNlaG9sZGVyX18yID0ge2RlZmF1bHQ6ICRfX3BsYWNlaG9sZGVyX18zfSIsInZhciAkX19kZWZhdWx0ID0gJF9fcGxhY2Vob2xkZXJfXzAiLCJyZXR1cm4gJF9fcGxhY2Vob2xkZXJfXzAiLCJnZXQgJF9fcGxhY2Vob2xkZXJfXzAoKSB7IHJldHVybiAkX19wbGFjZWhvbGRlcl9fMTsgfSIsIl9fZXNNb2R1bGU6IHRydWUiXX0=;
define('font-builder.js',['./classes/Font.js'], function($__0) {
  
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  var Font = $__0.default;
  function createUpdaters(branch) {
    if (branch.constructor === Object && typeof branch.operation === 'string') {
      var args = ['coutours', 'anchors', 'nodes'].concat(branch.parameters).concat('return ' + branch.operation);
      return (branch.updater = Function.apply(null, args));
    }
    if (branch.constructor === Object) {
      for (var i in branch) {
        createUpdaters(branch[i]);
      }
    }
    if (branch.constructor === Array) {
      branch.forEach((function(subBranch) {
        return createUpdaters(subBranch);
      }));
    }
  }
  function builder(src) {
    var font = new Font(),
        name,
        glyphSrc,
        glyph;
    for (name in src.glyphs) {
      glyphSrc = src.glyphs[name];
      glyph = font.addGlyph(name, glyphSrc);
      glyphSrc.anchor && glyphSrc.anchor.forEach((function(anchorSrc) {
        createUpdaters(anchorSrc);
        glyph.addAnchor({src: anchorSrc});
      }));
      glyphSrc.outline && glyphSrc.outline.contour && glyphSrc.outline.contour.forEach((function(contourSrc) {
        var contour = glyph.addContour({src: contourSrc});
        contourSrc.point.forEach((function(pointSrc) {
          createUpdaters({src: pointSrc});
          contour.addNode({src: pointSrc});
        }));
      }));
    }
    return font;
  }
  var $__default = {
    build: builder,
    updater: createUpdaters
  };
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci82IiwiZm9udC1idWlsZGVyLmpzIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzUiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvNCIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8wIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzMiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMSIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8yIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLEtBQUssQUFBQyxFQ0lXLG1CQUFrQixFQ0puQyxVQUFTLElBQWdCOztBQ0F6QixLQUFJLEtBQWlCLEdBQUssRUFBQyxlQUEyQjtBQUMxQyxTQUFvQixFQUFDLE9BQU0sTUFBbUIsQ0FBQyxDQUFBO0FBQUEsSUZHcEQsS0FBRztBQUdWLFNBQVMsZUFBYSxDQUFHLE1BQUs7QUFDN0IsT0FBSyxNQUFLLFlBQVksSUFBTSxPQUFLLENBQUEsRUFBSyxDQUFBLE1BQU8sT0FBSyxVQUFVLENBQUEsR0FBTSxTQUFPLENBQUk7QUFDNUUsQUFBSSxRQUFBLENBQUEsSUFBRyxFQUFJLENBQUEsQ0FBQyxVQUFTLENBQUcsVUFBUSxDQUFHLFFBQU0sQ0FBQyxPQUNsQyxBQUFDLENBQUUsTUFBSyxXQUFXLENBQUUsT0FDckIsQUFBQyxDQUFFLFNBQVEsRUFBSSxDQUFBLE1BQUssVUFBVSxDQUFFLENBQUM7QUFFekMsV0FBTyxFQUFFLE1BQUssUUFBUSxFQUFJLENBQUEsUUFBTyxNQUFNLEFBQUMsQ0FBRSxJQUFHLENBQUcsS0FBRyxDQUFFLENBQUUsQ0FBQztJQUN6RDtBQUFBLEFBRUEsT0FBSyxNQUFLLFlBQVksSUFBTSxPQUFLLENBQUk7QUFDcEMsVUFBVSxHQUFBLENBQUEsQ0FBQSxDQUFBLEVBQUssT0FBSyxDQUFJO0FBQ3ZCLHFCQUFhLEFBQUMsQ0FBRSxNQUFLLENBQUUsQ0FBQSxDQUFDLENBQUUsQ0FBQztNQUM1QjtBQUFBLElBQ0Q7QUFBQSxBQUVBLE9BQUssTUFBSyxZQUFZLElBQU0sTUFBSSxDQUFJO0FBQ25DLFdBQUssUUFBUSxBQUFDLEVBQUMsU0FBQSxTQUFRO2FBQUssQ0FBQSxjQUFhLEFBQUMsQ0FBRSxTQUFRLENBQUU7TUFBQSxFQUFDLENBQUM7SUFDekQ7QUFBQSxFQUNEO0FBRUEsU0FBUyxRQUFNLENBQUcsR0FBRTtBQUNuQixBQUFJLE1BQUEsQ0FBQSxJQUFHLEVBQUksSUFBSSxLQUFHLEFBQUMsRUFBQztBQUNuQixXQUFHO0FBQ0gsZUFBTztBQUNQLFlBQUksQ0FBQztBQUVOLFFBQU0sSUFBRyxHQUFLLENBQUEsR0FBRSxPQUFPLENBQUk7QUFDMUIsYUFBTyxFQUFJLENBQUEsR0FBRSxPQUFPLENBQUUsSUFBRyxDQUFDLENBQUM7QUFFM0IsVUFBSSxFQUFJLENBQUEsSUFBRyxTQUFTLEFBQUMsQ0FBRSxJQUFHLENBQUcsU0FBTyxDQUFFLENBQUM7QUFFdkMsYUFBTyxPQUFPLEdBQ2QsQ0FBQSxRQUFPLE9BQU8sUUFBUSxBQUFDLEVBQUMsU0FBQSxTQUFRLENBQUs7QUFDcEMscUJBQWEsQUFBQyxDQUFFLFNBQVEsQ0FBRSxDQUFDO0FBRTNCLFlBQUksVUFBVSxBQUFDLENBQUMsQ0FBRSxHQUFFLENBQUcsVUFBUSxDQUFFLENBQUMsQ0FBQztNQUNwQyxFQUFDLENBQUM7QUFFRixhQUFPLFFBQVEsR0FDZixDQUFBLFFBQU8sUUFBUSxRQUFRLENBQUEsRUFDdkIsQ0FBQSxRQUFPLFFBQVEsUUFBUSxRQUFRLEFBQUMsRUFBQyxTQUFBLFVBQVM7QUFDekMsQUFBSSxVQUFBLENBQUEsT0FBTSxFQUFJLENBQUEsS0FBSSxXQUFXLEFBQUMsQ0FBQyxDQUFFLEdBQUUsQ0FBRyxXQUFTLENBQUUsQ0FBQyxDQUFDO0FBRW5ELGlCQUFTLE1BQU0sUUFBUSxBQUFDLEVBQUMsU0FBQSxRQUFPLENBQUs7QUFDcEMsdUJBQWEsQUFBQyxDQUFDLENBQUUsR0FBRSxDQUFHLFNBQU8sQ0FBRSxDQUFDLENBQUM7QUFFakMsZ0JBQU0sUUFBUSxBQUFDLENBQUMsQ0FBRSxHQUFFLENBQUcsU0FBTyxDQUFFLENBQUMsQ0FBQztRQUNuQyxFQUFDLENBQUM7TUFHSCxFQUFDLENBQUM7SUFDSDtBQUFBLEFBRUEsU0FBTyxLQUFHLENBQUM7RUFDWjtBRzdEQSxBQUFJLElBQUEsQ0FBQSxVQUFTLEVIK0RFO0FBQ2QsUUFBSSxDQUFHLFFBQU07QUFDYixVQUFNLENBQUcsZUFBYTtBQUFBLEVHakVVLEFIa0VqQyxDR2xFaUM7QUNBakM7QUNBQSxnQkFBd0I7QUFBRSx1QkFBd0I7SUFBRTtBQ0FwRCxhQUFTLENBQUcsS0FBRztBQUFBLEdGQVE7QUhFbkIsQ0ZGdUMsQ0FBQztBQ2tFM0MiLCJmaWxlIjoiZm9udC1idWlsZGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiZGVmaW5lKCRfX3BsYWNlaG9sZGVyX18wLCAkX19wbGFjZWhvbGRlcl9fMSk7IiwiLy8gVE9ETzogd2l0aG91dCB0aGlzIGZsYWcsIGl0IHNlZW1zIHRoYXQganNoaW50IGRvZXNuJ3QgbGlrZSBhcnJvdyBmdW5jdGlvbnMuXG4vLyBGaW5kIG91dCB3aGF0IHRoZSByZWFsIHByb2JsZW0gaXNcbi8qanNoaW50IC1XMDMwICovXG5cbmltcG9ydCBGb250IGZyb20gJy4vY2xhc3Nlcy9Gb250LmpzJztcbi8vIGltcG9ydCBHbHlwaCBmcm9tICcuL2NsYXNzZXMvR2x5cGguanMnO1xuXG5mdW5jdGlvbiBjcmVhdGVVcGRhdGVycyggYnJhbmNoICkge1xuXHRpZiAoIGJyYW5jaC5jb25zdHJ1Y3RvciA9PT0gT2JqZWN0ICYmIHR5cGVvZiBicmFuY2gub3BlcmF0aW9uID09PSAnc3RyaW5nJyApIHtcblx0XHR2YXIgYXJncyA9IFsnY291dG91cnMnLCAnYW5jaG9ycycsICdub2RlcyddXG5cdFx0XHRcdC5jb25jYXQoIGJyYW5jaC5wYXJhbWV0ZXJzIClcblx0XHRcdFx0LmNvbmNhdCggJ3JldHVybiAnICsgYnJhbmNoLm9wZXJhdGlvbiApO1xuXG5cdFx0cmV0dXJuICggYnJhbmNoLnVwZGF0ZXIgPSBGdW5jdGlvbi5hcHBseSggbnVsbCwgYXJncyApICk7XG5cdH1cblxuXHRpZiAoIGJyYW5jaC5jb25zdHJ1Y3RvciA9PT0gT2JqZWN0ICkge1xuXHRcdGZvciAoIHZhciBpIGluIGJyYW5jaCApIHtcblx0XHRcdGNyZWF0ZVVwZGF0ZXJzKCBicmFuY2hbaV0gKTtcblx0XHR9XG5cdH1cblxuXHRpZiAoIGJyYW5jaC5jb25zdHJ1Y3RvciA9PT0gQXJyYXkgKSB7XG5cdFx0YnJhbmNoLmZvckVhY2goc3ViQnJhbmNoID0+IGNyZWF0ZVVwZGF0ZXJzKCBzdWJCcmFuY2ggKSk7XG5cdH1cbn1cblxuZnVuY3Rpb24gYnVpbGRlciggc3JjICkge1xuXHR2YXIgZm9udCA9IG5ldyBGb250KCksXG5cdFx0bmFtZSxcblx0XHRnbHlwaFNyYyxcblx0XHRnbHlwaDtcblxuXHRmb3IgKCBuYW1lIGluIHNyYy5nbHlwaHMgKSB7XG5cdFx0Z2x5cGhTcmMgPSBzcmMuZ2x5cGhzW25hbWVdO1xuXG5cdFx0Z2x5cGggPSBmb250LmFkZEdseXBoKCBuYW1lLCBnbHlwaFNyYyApO1xuXG5cdFx0Z2x5cGhTcmMuYW5jaG9yICYmXG5cdFx0Z2x5cGhTcmMuYW5jaG9yLmZvckVhY2goYW5jaG9yU3JjID0+IHtcblx0XHRcdGNyZWF0ZVVwZGF0ZXJzKCBhbmNob3JTcmMgKTtcblxuXHRcdFx0Z2x5cGguYWRkQW5jaG9yKHsgc3JjOiBhbmNob3JTcmMgfSk7XG5cdFx0fSk7XG5cblx0XHRnbHlwaFNyYy5vdXRsaW5lICYmXG5cdFx0Z2x5cGhTcmMub3V0bGluZS5jb250b3VyICYmXG5cdFx0Z2x5cGhTcmMub3V0bGluZS5jb250b3VyLmZvckVhY2goY29udG91clNyYyA9PiB7XG5cdFx0XHR2YXIgY29udG91ciA9IGdseXBoLmFkZENvbnRvdXIoeyBzcmM6IGNvbnRvdXJTcmMgfSk7XG5cblx0XHRcdGNvbnRvdXJTcmMucG9pbnQuZm9yRWFjaChwb2ludFNyYyA9PiB7XG5cdFx0XHRcdGNyZWF0ZVVwZGF0ZXJzKHsgc3JjOiBwb2ludFNyYyB9KTtcblxuXHRcdFx0XHRjb250b3VyLmFkZE5vZGUoeyBzcmM6IHBvaW50U3JjIH0pO1xuXHRcdFx0fSk7XG5cblx0XHRcdC8vIFRPRE86IGNoZWNrIGlmIGNvdW50b3VyIGlzIG9wZW4gb3IgY2xvc2VkXG5cdFx0fSk7XG5cdH1cblxuXHRyZXR1cm4gZm9udDtcbn1cblxuZXhwb3J0IGRlZmF1bHQge1xuXHRidWlsZDogYnVpbGRlcixcblx0dXBkYXRlcjogY3JlYXRlVXBkYXRlcnNcbn07IiwiZnVuY3Rpb24oJF9fcGxhY2Vob2xkZXJfXzApIHtcbiAgICAgICRfX3BsYWNlaG9sZGVyX18xXG4gICAgfSIsImlmICghJF9fcGxhY2Vob2xkZXJfXzAgfHwgISRfX3BsYWNlaG9sZGVyX18xLl9fZXNNb2R1bGUpXG4gICAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fMiA9IHtkZWZhdWx0OiAkX19wbGFjZWhvbGRlcl9fM30iLCJ2YXIgJF9fZGVmYXVsdCA9ICRfX3BsYWNlaG9sZGVyX18wIiwicmV0dXJuICRfX3BsYWNlaG9sZGVyX18wIiwiZ2V0ICRfX3BsYWNlaG9sZGVyX18wKCkgeyByZXR1cm4gJF9fcGxhY2Vob2xkZXJfXzE7IH0iLCJfX2VzTW9kdWxlOiB0cnVlIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9;
define('main',['./classes/Point.js', './classes/Node.js', './classes/Glyph.js', './classes/Contour.js', './font-builder.js'], function($__0,$__2,$__4,$__6,$__8) {
  
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  if (!$__4 || !$__4.__esModule)
    $__4 = {default: $__4};
  if (!$__6 || !$__6.__esModule)
    $__6 = {default: $__6};
  if (!$__8 || !$__8.__esModule)
    $__8 = {default: $__8};
  var Point = $__0.default;
  var Node = $__2.default;
  var Glyph = $__4.default;
  var Contour = $__6.default;
  var fb = $__8.default;
  fb.build.Point = Point;
  fb.build.Node = Node;
  fb.build.Contour = Contour;
  fb.build.Glyph = Glyph;
  var $__default = fb.build;
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci82IiwibWFpbi5qcyIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci81IiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzQiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMCIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8zIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzEiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxLQUFLLEFBQUMsRUNBWSxvQkFBbUIsQ0FDcEIsb0JBQWtCLENBQ2pCLHFCQUFtQixDQUNqQix1QkFBcUIsQ0FDMUIsb0JBQWtCLEVDSmpDLFVBQVMsd0JBQWdCOztBQ0F6QixLQUFJLEtBQWlCLEdBQUssRUFBQyxlQUEyQjtBQUMxQyxTQUFvQixFQUFDLE9BQU0sTUFBbUIsQ0FBQyxDQUFBO0FBRDNELEFBQzJELEtBRHZELEtBQWlCLEdBQUssRUFBQyxlQUEyQjtBQUMxQyxTQUFvQixFQUFDLE9BQU0sTUFBbUIsQ0FBQyxDQUFBO0FBRDNELEFBQzJELEtBRHZELEtBQWlCLEdBQUssRUFBQyxlQUEyQjtBQUMxQyxTQUFvQixFQUFDLE9BQU0sTUFBbUIsQ0FBQyxDQUFBO0FBRDNELEFBQzJELEtBRHZELEtBQWlCLEdBQUssRUFBQyxlQUEyQjtBQUMxQyxTQUFvQixFQUFDLE9BQU0sTUFBbUIsQ0FBQyxDQUFBO0FBRDNELEFBQzJELEtBRHZELEtBQWlCLEdBQUssRUFBQyxlQUEyQjtBQUMxQyxTQUFvQixFQUFDLE9BQU0sTUFBbUIsQ0FBQyxDQUFBO0FBQUEsSUZEcEQsTUFBSTtJQUNKLEtBQUc7SUFDSCxNQUFJO0lBQ0osUUFBTTtJQUNOLEdBQUM7QUFFUixHQUFDLE1BQU0sTUFBTSxFQUFJLE1BQUksQ0FBQztBQUN0QixHQUFDLE1BQU0sS0FBSyxFQUFJLEtBQUcsQ0FBQztBQUNwQixHQUFDLE1BQU0sUUFBUSxFQUFJLFFBQU0sQ0FBQztBQUMxQixHQUFDLE1BQU0sTUFBTSxFQUFJLE1BQUksQ0FBQztBR1R0QixBQUFJLElBQUEsQ0FBQSxVQUFTLEVIV0UsQ0FBQSxFQUFDLE1HWGlCLEFIV1gsQ0dYVztBQ0FqQztBQ0FBLGdCQUF3QjtBQUFFLHVCQUF3QjtJQUFFO0FDQXBELGFBQVMsQ0FBRyxLQUFHO0FBQUEsR0ZBUTtBSEVuQixDRkZ1QyxDQUFDO0FDV3JCIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyJkZWZpbmUoJF9fcGxhY2Vob2xkZXJfXzAsICRfX3BsYWNlaG9sZGVyX18xKTsiLCJpbXBvcnQgUG9pbnQgZnJvbSAnLi9jbGFzc2VzL1BvaW50LmpzJztcbmltcG9ydCBOb2RlIGZyb20gJy4vY2xhc3Nlcy9Ob2RlLmpzJztcbmltcG9ydCBHbHlwaCBmcm9tICcuL2NsYXNzZXMvR2x5cGguanMnO1xuaW1wb3J0IENvbnRvdXIgZnJvbSAnLi9jbGFzc2VzL0NvbnRvdXIuanMnO1xuaW1wb3J0IGZiIGZyb20gJy4vZm9udC1idWlsZGVyLmpzJztcblxuZmIuYnVpbGQuUG9pbnQgPSBQb2ludDtcbmZiLmJ1aWxkLk5vZGUgPSBOb2RlO1xuZmIuYnVpbGQuQ29udG91ciA9IENvbnRvdXI7XG5mYi5idWlsZC5HbHlwaCA9IEdseXBoO1xuXG5leHBvcnQgZGVmYXVsdCBmYi5idWlsZDsiLCJmdW5jdGlvbigkX19wbGFjZWhvbGRlcl9fMCkge1xuICAgICAgJF9fcGxhY2Vob2xkZXJfXzFcbiAgICB9IiwiaWYgKCEkX19wbGFjZWhvbGRlcl9fMCB8fCAhJF9fcGxhY2Vob2xkZXJfXzEuX19lc01vZHVsZSlcbiAgICAgICAgICAgICRfX3BsYWNlaG9sZGVyX18yID0ge2RlZmF1bHQ6ICRfX3BsYWNlaG9sZGVyX18zfSIsInZhciAkX19kZWZhdWx0ID0gJF9fcGxhY2Vob2xkZXJfXzAiLCJyZXR1cm4gJF9fcGxhY2Vob2xkZXJfXzAiLCJnZXQgJF9fcGxhY2Vob2xkZXJfXzAoKSB7IHJldHVybiAkX19wbGFjZWhvbGRlcl9fMTsgfSIsIl9fZXNNb2R1bGU6IHRydWUiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=;

require(["main"]);
	//The modules for your project will be inlined above
	//this snippet. Ask almond to synchronously require the
	//module value for 'main' here and return it as the
	//value to use for the public API for the built file.
	return require('main').default;
}));