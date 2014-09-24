import Point from './classes/Point.js';
import Node from './classes/Node.js';
import Glyph from './classes/Glyph.js';
import Contour from './classes/Contour.js';
import fb from './font-builder.js';

fb.build.Point = Point;
fb.build.Node = Node;
fb.build.Contour = Contour;
fb.build.Glyph = Glyph;

export default fb.build;