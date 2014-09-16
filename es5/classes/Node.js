define(['./Point.js'], function($__0) {
  "use strict";
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  var Point = $__0.default;
  function Node(args) {
    var coords;
    if (args.x !== undefined || args.y !== undefined) {
      coords = {
        x: args.x,
        y: args.y
      };
    }
    Point.prototype.constructor.apply(this, [coords]);
    this.lCtrl = new Point(args.lCtrl);
    this.lCtrl.tags.add('control');
    this.rCtrl = new Point(args.rCtrl);
    this.rCtrl.tags.add('control');
    this.onLine = args.onLine, this.onSegment = args.onSegment;
    this.src = args.src;
  }
  Node.prototype = Object.create(Point.prototype);
  Node.prototype.constructor = Node;
  var $__default = Node;
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8yIiwiY2xhc3Nlcy9Ob2RlLmpzIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzEiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvNiIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8zIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzAiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvNCIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci81Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLEtBQUssQUFBQyxFQ0FZLFlBQVcsRUNBN0IsVUFBUyxJQUFnQjs7QUNBekIsS0FBSSxLQUFpQixHQUFLLEVBQUMsZUFBMkI7QUFDMUMsU0FBb0IsRUFBQyxPQUFNLE1BQW1CLENBQUMsQ0FBQTtBQUFBLElGRHBELE1BQUk7QUFFWCxTQUFTLEtBQUcsQ0FBRyxJQUFHLENBQUk7QUFDckIsQUFBSSxNQUFBLENBQUEsTUFBSyxDQUFDO0FBQ1YsT0FBSyxJQUFHLEVBQUUsSUFBTSxVQUFRLENBQUEsRUFBSyxDQUFBLElBQUcsRUFBRSxJQUFNLFVBQVEsQ0FBSTtBQUNuRCxXQUFLLEVBQUk7QUFDUixRQUFBLENBQUcsQ0FBQSxJQUFHLEVBQUU7QUFDUixRQUFBLENBQUcsQ0FBQSxJQUFHLEVBQUU7QUFBQSxNQUNULENBQUM7SUFDRjtBQUFBLEFBRUEsUUFBSSxVQUFVLFlBQVksTUFBTSxBQUFDLENBQUUsSUFBRyxDQUFHLEVBQUUsTUFBSyxDQUFFLENBQUUsQ0FBQztBQUVyRCxPQUFHLE1BQU0sRUFBSSxJQUFJLE1BQUksQUFBQyxDQUFFLElBQUcsTUFBTSxDQUFFLENBQUM7QUFDcEMsT0FBRyxNQUFNLEtBQUssSUFBSSxBQUFDLENBQUMsU0FBUSxDQUFDLENBQUM7QUFFOUIsT0FBRyxNQUFNLEVBQUksSUFBSSxNQUFJLEFBQUMsQ0FBRSxJQUFHLE1BQU0sQ0FBRSxDQUFDO0FBQ3BDLE9BQUcsTUFBTSxLQUFLLElBQUksQUFBQyxDQUFDLFNBQVEsQ0FBQyxDQUFDO0FBRTlCLE9BQUcsT0FBTyxFQUFJLENBQUEsSUFBRyxPQUFPLENBQ3hCLENBQUEsSUFBRyxVQUFVLEVBQUksQ0FBQSxJQUFHLFVBQVUsQ0FBQztBQUMvQixPQUFHLElBQUksRUFBSSxDQUFBLElBQUcsSUFBSSxDQUFDO0VBQ3BCO0FBQUEsQUFFQSxLQUFHLFVBQVUsRUFBSSxDQUFBLE1BQUssT0FBTyxBQUFDLENBQUMsS0FBSSxVQUFVLENBQUMsQ0FBQztBQUMvQyxLQUFHLFVBQVUsWUFBWSxFQUFJLEtBQUcsQ0FBQztBR3pCakMsQUFBSSxJQUFBLENBQUEsVUFBUyxFSDJCRSxLRzNCa0IsQUgyQmYsQ0czQmU7QUNBakM7QUNBQSxnQkFBd0I7QUFBRSx1QkFBd0I7SUFBRTtBQ0FwRCxhQUFTLENBQUcsS0FBRztBQUFBLEdGQVE7QUhFbkIsQ0ZGdUMsQ0FBQztBQzJCekIiLCJmaWxlIjoiY2xhc3Nlcy9Ob2RlLmpzIiwic291cmNlUm9vdCI6Ii4uIiwic291cmNlc0NvbnRlbnQiOlsiZGVmaW5lKCRfX3BsYWNlaG9sZGVyX18wLCAkX19wbGFjZWhvbGRlcl9fMSk7IiwiaW1wb3J0IFBvaW50IGZyb20gJy4vUG9pbnQuanMnO1xuXG5mdW5jdGlvbiBOb2RlKCBhcmdzICkge1xuXHR2YXIgY29vcmRzO1xuXHRpZiAoIGFyZ3MueCAhPT0gdW5kZWZpbmVkIHx8IGFyZ3MueSAhPT0gdW5kZWZpbmVkICkge1xuXHRcdGNvb3JkcyA9IHtcblx0XHRcdHg6IGFyZ3MueCxcblx0XHRcdHk6IGFyZ3MueVxuXHRcdH07XG5cdH1cblxuXHRQb2ludC5wcm90b3R5cGUuY29uc3RydWN0b3IuYXBwbHkoIHRoaXMsIFsgY29vcmRzIF0gKTtcblxuXHR0aGlzLmxDdHJsID0gbmV3IFBvaW50KCBhcmdzLmxDdHJsICk7XG5cdHRoaXMubEN0cmwudGFncy5hZGQoJ2NvbnRyb2wnKTtcblxuXHR0aGlzLnJDdHJsID0gbmV3IFBvaW50KCBhcmdzLnJDdHJsICk7XG5cdHRoaXMuckN0cmwudGFncy5hZGQoJ2NvbnRyb2wnKTtcblxuXHR0aGlzLm9uTGluZSA9IGFyZ3Mub25MaW5lLFxuXHR0aGlzLm9uU2VnbWVudCA9IGFyZ3Mub25TZWdtZW50O1xuXHR0aGlzLnNyYyA9IGFyZ3Muc3JjO1xufVxuXG5Ob2RlLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUG9pbnQucHJvdG90eXBlKTtcbk5vZGUucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gTm9kZTtcblxuZXhwb3J0IGRlZmF1bHQgTm9kZTsiLCJmdW5jdGlvbigkX19wbGFjZWhvbGRlcl9fMCkge1xuICAgICAgJF9fcGxhY2Vob2xkZXJfXzFcbiAgICB9IiwiaWYgKCEkX19wbGFjZWhvbGRlcl9fMCB8fCAhJF9fcGxhY2Vob2xkZXJfXzEuX19lc01vZHVsZSlcbiAgICAgICAgICAgICRfX3BsYWNlaG9sZGVyX18yID0ge2RlZmF1bHQ6ICRfX3BsYWNlaG9sZGVyX18zfSIsInZhciAkX19kZWZhdWx0ID0gJF9fcGxhY2Vob2xkZXJfXzAiLCJyZXR1cm4gJF9fcGxhY2Vob2xkZXJfXzAiLCJnZXQgJF9fcGxhY2Vob2xkZXJfXzAoKSB7IHJldHVybiAkX19wbGFjZWhvbGRlcl9fMTsgfSIsIl9fZXNNb2R1bGU6IHRydWUiXX0=