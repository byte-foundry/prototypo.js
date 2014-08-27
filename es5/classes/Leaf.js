define([], function() {
  "use strict";
  var Leaf = function Leaf() {
    var className = arguments[0] !== (void 0) ? arguments[0] : '';
    this.className = className;
    this._children = [];
  };
  ($traceurRuntime.createClass)(Leaf, {
    is: function(className) {
      return this.className.split(' ').indexOf(className) !== -1;
    },
    children: function(className) {
      return className ? this._children.filter((function(child) {
        return child.is(className);
      })) : this._children;
    },
    append: function() {
      var $__2;
      for (var children = [],
          $__1 = 0; $__1 < arguments.length; $__1++)
        children[$__1] = arguments[$__1];
      ($__2 = this._children).push.apply($__2, $traceurRuntime.spread(children));
      return this;
    }
  }, {});
  var $__default = Leaf;
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8yIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzEiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvNiIsImNsYXNzZXMvTGVhZi5qcyIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci83IiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzgiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvOSIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8zIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzAiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvNCIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci81Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLEtBQUssQUFBQyxJQ0FOLFVBQVMsQUFBZ0I7O0FDQXpCLEFBQUksSUFBQSxPQ0FKLFNBQU0sS0FBRyxDQUNLLEFBQWEsQ0FBSTtNQUFqQixVQUFRLDZDQUFJLEdBQUM7QUFDekIsT0FBRyxVQUFVLEVBQUksVUFBUSxDQUFDO0FBQzFCLE9BQUcsVUFBVSxFQUFJLEdBQUMsQ0FBQztFREhtQixBQ0l2QyxDREp1QztBRUF4QyxFQUFDLGVBQWMsWUFBWSxDQUFDLEFBQUM7QURNNUIsS0FBQyxDQUFELFVBQUksU0FBUSxDQUFJO0FBQ2YsV0FBTyxDQUFBLElBQUcsVUFBVSxNQUFNLEFBQUMsQ0FBQyxHQUFFLENBQUMsUUFBUSxBQUFDLENBQUUsU0FBUSxDQUFFLENBQUEsR0FBTSxFQUFDLENBQUEsQ0FBQztJQUM3RDtBQUVBLFdBQU8sQ0FBUCxVQUFVLFNBQVE7QUFDakIsV0FBTyxDQUFBLFNBQVEsRUFDZCxDQUFBLElBQUcsVUFBVSxPQUFPLEFBQUMsRUFBRSxTQUFBLEtBQUk7YUFBSyxDQUFBLEtBQUksR0FBRyxBQUFDLENBQUUsU0FBUSxDQUFFO01BQUEsRUFBRSxDQUFBLENBQ3RELENBQUEsSUFBRyxVQUFVLENBQUM7SUFDaEI7QUFFQSxTQUFLLENBQUwsVUFBUSxBQUFVOztBRWZQLFVBQVMsR0FBQSxXQUFvQixHQUFDO0FBQUcsZUFBb0IsRUFBQSxDQUNoRCxPQUFvQixDQUFBLFNBQVEsT0FBTyxDQUFHLE9BQWtCO0FBQzNELHFCQUFtQyxFQUFJLENBQUEsU0FBUSxNQUFtQixDQUFDO0FBQUEsQUZjL0UsWUFBQSxDQUFBLElBQUcsVUFBVSxrQkdqQmYsQ0FBQSxlQUFjLE9BQU8sQ0hpQkssUUFBTyxDR2pCTyxFSGlCSjtBQUVsQyxXQUFPLEtBQUcsQ0FBQztJQUNaO09DcEJvRjtBR0FyRixBQUFJLElBQUEsQ0FBQSxVQUFTLEVKdUJFLEtJdkJrQixBSnVCZixDSXZCZTtBQ0FqQztBQ0FBLGdCQUF3QjtBQUFFLHVCQUF3QjtJQUFFO0FDQXBELGFBQVMsQ0FBRyxLQUFHO0FBQUEsR0ZBUTtBUEVuQixDREZ1QyxDQUFDO0FHdUJ6QiIsImZpbGUiOiJjbGFzc2VzL0xlYWYuanMiLCJzb3VyY2VSb290IjoiLi4iLCJzb3VyY2VzQ29udGVudCI6WyJkZWZpbmUoJF9fcGxhY2Vob2xkZXJfXzAsICRfX3BsYWNlaG9sZGVyX18xKTsiLCJmdW5jdGlvbigkX19wbGFjZWhvbGRlcl9fMCkge1xuICAgICAgJF9fcGxhY2Vob2xkZXJfXzFcbiAgICB9IiwidmFyICRfX3BsYWNlaG9sZGVyX18wID0gJF9fcGxhY2Vob2xkZXJfXzEiLCJjbGFzcyBMZWFmIHtcblx0Y29uc3RydWN0b3IoIGNsYXNzTmFtZSA9ICcnICkge1xuXHRcdHRoaXMuY2xhc3NOYW1lID0gY2xhc3NOYW1lO1xuXHRcdHRoaXMuX2NoaWxkcmVuID0gW107XG5cdH1cblxuXHRpcyggY2xhc3NOYW1lICkge1xuXHRcdHJldHVybiB0aGlzLmNsYXNzTmFtZS5zcGxpdCgnICcpLmluZGV4T2YoIGNsYXNzTmFtZSApICE9PSAtMTtcblx0fVxuXG5cdGNoaWxkcmVuKCBjbGFzc05hbWUgKSB7XG5cdFx0cmV0dXJuIGNsYXNzTmFtZSA/XG5cdFx0XHR0aGlzLl9jaGlsZHJlbi5maWx0ZXIoIGNoaWxkID0+IGNoaWxkLmlzKCBjbGFzc05hbWUgKSApIDpcblx0XHRcdHRoaXMuX2NoaWxkcmVuO1xuXHR9XG5cblx0YXBwZW5kKCAuLi5jaGlsZHJlbiApIHtcblx0XHR0aGlzLl9jaGlsZHJlbi5wdXNoKCAuLi5jaGlsZHJlbiApO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgTGVhZjsiLCIoJHRyYWNldXJSdW50aW1lLmNyZWF0ZUNsYXNzKSgkX19wbGFjZWhvbGRlcl9fMCwgJF9fcGxhY2Vob2xkZXJfXzEsICRfX3BsYWNlaG9sZGVyX18yKSIsIlxuICAgICAgICAgICAgZm9yICh2YXIgJF9fcGxhY2Vob2xkZXJfXzAgPSBbXSwgJF9fcGxhY2Vob2xkZXJfXzEgPSAwO1xuICAgICAgICAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fMiA8IGFyZ3VtZW50cy5sZW5ndGg7ICRfX3BsYWNlaG9sZGVyX18zKyspXG4gICAgICAgICAgICAgICRfX3BsYWNlaG9sZGVyX180WyRfX3BsYWNlaG9sZGVyX181XSA9IGFyZ3VtZW50c1skX19wbGFjZWhvbGRlcl9fNl07IiwiJHRyYWNldXJSdW50aW1lLnNwcmVhZCgkX19wbGFjZWhvbGRlcl9fMCkiLCJ2YXIgJF9fZGVmYXVsdCA9ICRfX3BsYWNlaG9sZGVyX18wIiwicmV0dXJuICRfX3BsYWNlaG9sZGVyX18wIiwiZ2V0ICRfX3BsYWNlaG9sZGVyX18wKCkgeyByZXR1cm4gJF9fcGxhY2Vob2xkZXJfXzE7IH0iLCJfX2VzTW9kdWxlOiB0cnVlIl19