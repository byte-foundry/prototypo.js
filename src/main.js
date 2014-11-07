import Font from './classes/Font.js';
import Point from './classes/Point.js';
import Node from './classes/Node.js';
import Segment from './classes/Segment.js';
import Glyph from './classes/Glyph.js';
import Contour from './classes/Contour.js';
import Utils from './classes/Utils.js';
import opentype from './bower_components/opentype.js/opentype.js';

function newFont( fontSrc ) {
	return new Font({src: fontSrc });
}

newFont.Font = Font;
newFont.Point = Point;
newFont.Node = Node;
newFont.Segment = Segment;
newFont.Contour = Contour;
newFont.Glyph = Glyph;
newFont.Utils = Utils;
newFont.opentype = opentype;

export default newFont;