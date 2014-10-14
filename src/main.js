import Font from './classes/Font.js';
import Point from './classes/Point.js';
import Node from './classes/Node.js';
import Glyph from './classes/Glyph.js';
import Contour from './classes/Contour.js';

function newFont( fontSrc ) {
	return new Font( fontSrc );
}

newFont.Font = Font;
newFont.Point = Point;
newFont.Node = Node;
newFont.Contour = Contour;
newFont.Glyph = Glyph;

export default newFont;