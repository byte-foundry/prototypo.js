define([], function() {
  "use strict";
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
        var has = true;
        Array.prototype.slice.call(arguments, 0).forEach((function(tag) {
          if (self._tags.indexOf(tag) === -1) {
            has = false;
          }
        }));
        return has;
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8yIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzEiLCJjbGFzc2VzL0NsYXNzaWZ5LmpzIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzMiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMCIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci80IiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsS0FBSyxBQUFDLElDQU4sVUFBUyxBQUFnQjs7QUNBekIsU0FBUyxTQUFPLENBQUcsQUFBUTtNQUFSLEtBQUcsNkNBQUksR0FBQztBQUMxQixPQUFLLENBQUMsSUFBRyxLQUFLLENBQUk7QUFDakIsU0FBRyxLQUFLLEVBQUksR0FBQyxDQUFDO0lBQ2Y7QUFBQSxBQUNJLE1BQUEsQ0FBQSxJQUFHLEVBQUksS0FBRyxDQUFDO0FBRWYsT0FBRyxNQUFNLEVBQUksQ0FBQSxNQUFPLEtBQUcsS0FBSyxDQUFBLEdBQU0sU0FBTyxDQUFBLENBQ3hDLENBQUEsSUFBRyxLQUFLLE1BQU0sQUFBQyxDQUFDLEdBQUUsQ0FBQyxDQUFBLENBQ25CLENBQUEsSUFBRyxLQUFLLENBQUM7QUFFVixPQUFHLEtBQUssRUFBSSxDQUFBLElBQUcsS0FBSyxDQUFDO0FBRXJCLE9BQUcsS0FBSyxFQUFJO0FBQ1gsUUFBRSxDQUFGLFVBQUcsQUFBQztBQUNILFlBQUksVUFBVSxNQUFNLEtBQUssQUFBQyxDQUFDLFNBQVEsQ0FBRyxFQUFBLENBQUMsUUFBUSxBQUFDLEVBQUMsU0FBQSxHQUFFLENBQUs7QUFDdkQsYUFBSyxJQUFHLE1BQU0sUUFBUSxBQUFDLENBQUUsR0FBRSxDQUFFLENBQUEsR0FBTSxFQUFDLENBQUEsQ0FBSTtBQUN2QyxlQUFHLE1BQU0sS0FBSyxBQUFDLENBQUUsR0FBRSxDQUFFLENBQUM7VUFDdkI7QUFBQSxRQUNELEVBQUMsQ0FBQztNQUNIO0FBQ0EsV0FBSyxDQUFMLFVBQU0sQUFBQztBQUNOLFlBQUksVUFBVSxNQUFNLEtBQUssQUFBQyxDQUFDLFNBQVEsQ0FBRyxFQUFBLENBQUMsUUFBUSxBQUFDLEVBQUMsU0FBQSxHQUFFLENBQUs7QUFDdkQsQUFBSSxZQUFBLENBQUEsQ0FBQSxFQUFJLENBQUEsSUFBRyxNQUFNLFFBQVEsQUFBQyxDQUFFLEdBQUUsQ0FBRSxDQUFDO0FBQ2pDLGFBQUssQ0FBQSxJQUFNLEVBQUMsQ0FBQSxDQUFJO0FBQ2YsZUFBRyxNQUFNLE9BQU8sQUFBQyxDQUFFLENBQUEsQ0FBRyxFQUFBLENBQUUsQ0FBQztVQUMxQjtBQUFBLFFBQ0QsRUFBQyxDQUFDO01BQ0g7QUFDQSxRQUFFLENBQUYsVUFBRyxBQUFDO0FBQ0gsQUFBSSxVQUFBLENBQUEsR0FBRSxFQUFJLEtBQUcsQ0FBQztBQUVkLFlBQUksVUFBVSxNQUFNLEtBQUssQUFBQyxDQUFDLFNBQVEsQ0FBRyxFQUFBLENBQUMsUUFBUSxBQUFDLEVBQUMsU0FBQSxHQUFFLENBQUs7QUFDdkQsYUFBSyxJQUFHLE1BQU0sUUFBUSxBQUFDLENBQUUsR0FBRSxDQUFFLENBQUEsR0FBTSxFQUFDLENBQUEsQ0FBSTtBQUN2QyxjQUFFLEVBQUksTUFBSSxDQUFDO1VBQ1o7QUFBQSxRQUNELEVBQUMsQ0FBQztBQUVGLGFBQU8sSUFBRSxDQUFDO01BQ1g7SUFDRCxDQUFDO0VBQ0Y7QUN4Q0EsQUFBSSxJQUFBLENBQUEsVUFBUyxFRDBDRSxTQzFDa0IsQUQwQ1gsQ0MxQ1c7QUNBakM7QUNBQSxnQkFBd0I7QUFBRSx1QkFBd0I7SUFBRTtBQ0FwRCxhQUFTLENBQUcsS0FBRztBQUFBLEdGQVE7QUhFbkIsQ0RGdUMsQ0FBQztBRTBDckIiLCJmaWxlIjoiY2xhc3Nlcy9DbGFzc2lmeS5qcyIsInNvdXJjZVJvb3QiOiIuLiIsInNvdXJjZXNDb250ZW50IjpbImRlZmluZSgkX19wbGFjZWhvbGRlcl9fMCwgJF9fcGxhY2Vob2xkZXJfXzEpOyIsImZ1bmN0aW9uKCRfX3BsYWNlaG9sZGVyX18wKSB7XG4gICAgICAkX19wbGFjZWhvbGRlcl9fMVxuICAgIH0iLCJmdW5jdGlvbiBDbGFzc2lmeSggYXJncyA9IHt9ICkge1xuXHRpZiAoICFhcmdzLnRhZ3MgKSB7XG5cdFx0YXJncy50YWdzID0gW107XG5cdH1cblx0dmFyIHNlbGYgPSB0aGlzO1xuXG5cdHRoaXMuX3RhZ3MgPSB0eXBlb2YgYXJncy50YWdzID09PSAnc3RyaW5nJyA/XG5cdFx0YXJncy50YWdzLnNwbGl0KCcgJyk6XG5cdFx0YXJncy50YWdzO1xuXG5cdHRoaXMudHlwZSA9IGFyZ3MudHlwZTtcblxuXHR0aGlzLnRhZ3MgPSB7XG5cdFx0YWRkKCkge1xuXHRcdFx0QXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAwKS5mb3JFYWNoKHRhZyA9PiB7XG5cdFx0XHRcdGlmICggc2VsZi5fdGFncy5pbmRleE9mKCB0YWcgKSA9PT0gLTEgKSB7XG5cdFx0XHRcdFx0c2VsZi5fdGFncy5wdXNoKCB0YWcgKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fSxcblx0XHRyZW1vdmUoKSB7XG5cdFx0XHRBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDApLmZvckVhY2godGFnID0+IHtcblx0XHRcdFx0dmFyIGkgPSBzZWxmLl90YWdzLmluZGV4T2YoIHRhZyApO1xuXHRcdFx0XHRpZiAoIGkgIT09IC0xICkge1xuXHRcdFx0XHRcdHNlbGYuX3RhZ3Muc3BsaWNlKCBpLCAxICk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH0sXG5cdFx0aGFzKCkge1xuXHRcdFx0dmFyIGhhcyA9IHRydWU7XG5cblx0XHRcdEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMCkuZm9yRWFjaCh0YWcgPT4ge1xuXHRcdFx0XHRpZiAoIHNlbGYuX3RhZ3MuaW5kZXhPZiggdGFnICkgPT09IC0xICkge1xuXHRcdFx0XHRcdGhhcyA9IGZhbHNlO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblxuXHRcdFx0cmV0dXJuIGhhcztcblx0XHR9XG5cdH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IENsYXNzaWZ5OyIsInZhciAkX19kZWZhdWx0ID0gJF9fcGxhY2Vob2xkZXJfXzAiLCJyZXR1cm4gJF9fcGxhY2Vob2xkZXJfXzAiLCJnZXQgJF9fcGxhY2Vob2xkZXJfXzAoKSB7IHJldHVybiAkX19wbGFjZWhvbGRlcl9fMTsgfSIsIl9fZXNNb2R1bGU6IHRydWUiXX0=