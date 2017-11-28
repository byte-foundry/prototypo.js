var plumin = require('plumin.js'),
	assign = require('lodash.assign'),
	cloneDeep = require('lodash.clonedeep'),
	Utils = require('./Utils.js'),
	naive = require('./naive.js'),
	find = require('lodash/find');

var paper = plumin.paper,
	psProto = paper.PaperScope.prototype,
	_ = { assign: assign, find: find };

function parametricFont( src ) {
	var font = Utils.fontFromSrc( src );

	Object.keys( src.glyphs ).forEach(function( name ) {
		var glyphSrc = src.glyphs[name];

		Utils.ufoToPaper( glyphSrc );

		var glyph = Utils.glyphFromSrc( glyphSrc, src, naive );

		font.addGlyph( glyph );

		// Create additional paths for skeletons and set ._dependencies
		// appropriately
		naive.annotator( glyph );

		// solvingOrder might be already available (if this is a subcomponent,
		// or precomputed in a worker)
		if ( !glyph.solvingOrder ) {
			glyph.solvingOrder = glyphSrc.solvingOrder =
				Utils.solveDependencyTree( glyph );
		}
	});

	// all glyphs are ready, embed components now
	font.glyphs.forEach(function( _glyph ) {
		if ( _glyph.embedComponents ) {
			_glyph.embedComponents();
		}
	});

	return font;
}

plumin.parametricFont = parametricFont;
plumin.Utils = Utils;
plumin.Utils.naive = naive;

psProto.Font.prototype.update = function( params, set ) {
	var font = this;
	var subset = this.getGlyphSubset(set);

	if (params.altList) {
		Object.keys(params.altList).forEach((unicode) => {
			const charMap = font.charMap;
			if (charMap[unicode] && charMap[unicode].name !== params.altList[unicode]) {
				var oldGlyph = charMap[unicode];
				font.setAlternateFor(unicode, params.altList[unicode]);

				var index = subset.indexOf(oldGlyph);
				if (index !== -1) {
					subset[index] = charMap[unicode];
				}
			}
		});
	}

	Utils.updateParameters( font, params );

	// Additionally, we must update the params of indiv group
	Utils.updateIndividualParameters( font, params );

	Utils.updateProperties( font, params );

	Utils.updateXscenderProperties( font, params );

	subset.map(function( glyph ) {
		return glyph.update( params );
	}, this);

	// We no longer support font transforms. Transforms should happen at the
	// glyph level, where they can be individualized.

	return this;
};

psProto.Font.prototype.resetComponents = function() {
	this.glyphs.forEach(function( glyph ) {
		glyph.resetComponents(this.src);
	}.bind(this));
}

psProto.Path.prototype._drawOld = psProto.Path.prototype._draw;
psProto.Path.prototype._draw = function(ctx, param, viewMatrix, strokeMatrix) {
	if (this.applyMatrix) {
		var realViewMatrix = new psProto.Matrix(
			this.view.zoom / window.devicePixelRatio,
			viewMatrix.b / window.devicePixelRatio,
			viewMatrix.c / window.devicePixelRatio,
			this.view.zoom / window.devicePixelRatio,
			(-this.view.center.x + this.view.bounds.width / 2) * this.view.zoom / window.devicePixelRatio,
			(-this.view.center.y + this.view.bounds.height / 2) * this.view.zoom / window.devicePixelRatio);
		realViewMatrix.a = realViewMatrix.a * this.parent.globalMatrix.a;
		realViewMatrix.d = realViewMatrix.d * this.parent.globalMatrix.d;
		realViewMatrix.tx = realViewMatrix.tx + this.parent.globalMatrix.tx * this.view.zoom / window.devicePixelRatio;
		realViewMatrix.ty = realViewMatrix.ty + this.parent.globalMatrix.ty * this.view.zoom / window.devicePixelRatio;
		this._drawOld(ctx, param, realViewMatrix, realViewMatrix);
	} else {
		this._drawOld(ctx, param, realViewMatrix, strokeMatrix);
	}
};

psProto.CompoundPath.prototype._drawOld = psProto.CompoundPath.prototype._draw;
psProto.CompoundPath.prototype._draw = function(ctx, param, viewMatrix) {
	var realViewMatrix = new psProto.Matrix(
		this.view.zoom / window.devicePixelRatio,
		viewMatrix.b / window.devicePixelRatio,
		viewMatrix.c / window.devicePixelRatio,
		this.view.zoom / window.devicePixelRatio,
		(-this.view.center.x + this.view.bounds.width / 2) * this.view.zoom / window.devicePixelRatio,
		(-this.view.center.y + this.view.bounds.height / 2) * this.view.zoom / window.devicePixelRatio);
	realViewMatrix.a = realViewMatrix.a * this.parent.globalMatrix.a;
	realViewMatrix.d = realViewMatrix.d * this.parent.globalMatrix.d;
	realViewMatrix.tx = realViewMatrix.tx + this.parent.globalMatrix.tx * this.view.zoom / window.devicePixelRatio;
	realViewMatrix.ty = realViewMatrix.ty + this.parent.globalMatrix.ty * this.view.zoom / window.devicePixelRatio;
	this._drawOld(ctx, param, realViewMatrix, realViewMatrix);
};

psProto.Font.prototype.changeCursorsToManual = function(glyphUnicode, cursors) {
	var font = this;

	// TODO manage alternates
	font.altMap[glyphUnicode][0].changeCursorsToManual(cursors);
}

psProto.Font.prototype.setAlternatesFor = function(unicode, glyphName) {
	var font = this;
	var glyph = font.charMap[unicode].src;
	var nextGlyph = font.children[glyphName].src;
	var result = [];

	(glyph.relatedGlyphs || []).forEach(function(name) {
		var relatedGlyph = font.children[name].src;
		var alternateName = relatedGlyph.name.replace(relatedGlyph.base || relatedGlyph.name, nextGlyph.base || nextGlyph.name);

		if (font.children[alternateName]) { // checking alternate's existence
			font.setAlternateFor(
				relatedGlyph.unicode,
				alternateName
			);
			result.push({
				glyph: relatedGlyph.unicode,
				name: alternateName
			});
		}
	});

	font.setAlternateFor(unicode, glyphName);
	result.push({
		glyph: unicode,
		name: glyphName
	});

	return result;
};

/* Update the shape of the glyph, according to formula and parameters
 * 0. before running, nodes have already been created by ParametricFont
 *   (including expanded ones thanks to naive.expandSkeletons). And static
 *   properties have been copied over to those nodes
 * 1. We use the solving order to calculate all node properties
 * 2. transform contours
 * 3. Update components and transform them
 */
psProto.Glyph.prototype.update = function( _params ) {
	var glyph = this,
		font = glyph.parent,
		matrix,
		subset = font.subset,
		params;

	if (_params) {
		this.oldParams = _params;
	} else if (this.oldParams) {
		_params = this.oldParams;
	} else {
		return;
	}

	if (_params.altList && font.charMap && subset) {
		const unicode = _.find(Object.keys(_params.altList), (o) => {
			return parseInt(o) === this.ot.unicode;
		});
		if (unicode && this.name !== _params.altList[unicode].name) {
			const charMap = font.charMap;
			if (charMap[unicode] && charMap[unicode].name !== _params.altList[unicode]) {
				var index = subset.indexOf(charMap[unicode]);
				font.setAlternateFor(unicode, _params.altList[unicode]);

				subset[index] = charMap[unicode];
				charMap[unicode].update(_params, subset);
				return charMap[unicode];
			}
		}
	}

	// 0. calculate local parameters
	if ( _params['indiv_glyphs'] &&
			Object.keys( _params['indiv_glyphs'] )
				.indexOf( '' + glyph.ot.unicode ) !== -1 ) {

		var indivParam = {};

		Object.keys( _params ).forEach(function( param ) {
			if ( typeof _params[param] === 'number' ) {
				var groups = _params['indiv_group_param'][
						_params['indiv_glyphs'][glyph.ot.unicode]
					] || {},
					multiplier = groups[param + '_rel'] || {
						state: 'relative',
						value: 1
					};

				indivParam[param] = groups[param] ||
					( multiplier.state === 'relative' ?
						(multiplier.value * _params[param]) :
						(multiplier.value + _params[param])
					);
			}
		});

		params = _.assign( {}, _params, indivParam, glyph.parentParameters );
	} else {
		params = _.assign( {}, _params, glyph.parentParameters );
	}

	Utils.updateParameters( glyph, params );

	// original values backup
	glyph.baseSpacingLeft = params.spacingLeft;
	glyph.baseSpacingRight = params.spacingRight;

	// if we have special properties to compute
	if (params.glyphSpecialProps && params.glyphSpecialProps[glyph.ot.unicode]) {
		var propsToUpdate = params.glyphSpecialProps[glyph.ot.unicode];

		Object.keys(propsToUpdate).forEach(function(property) {
			params[property] = params[property] + propsToUpdate[property];
		});
	}

	glyph.spacingLeft = params.spacingLeft;
	glyph.spacingRight = params.spacingRight;

	// parentParameters always overwrite glyph parameters. Use aliases
	// (e.g. _width) to let glyph have the final word
	_.assign( params, glyph.parentParameters );

	if (params.glyphComponentChoice && params.glyphComponentChoice[glyph.ot.unicode]) {
		var componentsChoices = params.glyphComponentChoice[glyph.ot.unicode];
		Object.keys(componentsChoices).forEach(function(key) {
			var componentFilter = glyph.components.filter(function(comp) {
				return comp.componentId === key;
			});
			if (componentFilter.length > 0) {
				var component = componentFilter[0];
				var availableComponent = (
					glyph.src.components.find(function(compAvail) { return compAvail.id === key}) ||
					{ base: [] }
				).base.indexOf(componentsChoices[key]) !== -1;

				if (component.chosen !== componentsChoices[key] && availableComponent) {
					glyph.changeComponent(key, componentsChoices[key]);
				}
			}
		});
	}

	// 1. calculate node properties

	if (_params.manualChanges) {
		params.manualChanges = cloneDeep(_params.manualChanges[glyph.name]);
	}
	Utils.updateProperties( glyph, params );

	// 2. transform contours
	this.contours.forEach(function(contour) {
		// a. transform the nodes
		contour.nodes.forEach(function(node) {
			if ( node.transforms ) {
				matrix = Utils.transformsToMatrix(
					node.transforms.slice(0), node.transformOrigin
				);

				if ( contour.skeleton !== true ) {
					node.transform(matrix);

				// when dealing with a skeleton, modify only the matrix of
				// expanded items
				} else {
					node.expandedTo.forEach(function( _node ) {
						_node.transform(matrix);
					});
				}
			}
		});

		// b. transform the contour
		// prepare and update outlines and expanded contours, but not
		// skeletons
		if ( contour.transforms ) {
			matrix = Utils.transformsToMatrix(
				contour.transforms.slice(0), contour.transformOrigin
			);

			if ( contour.skeleton !== true ) {
				// We don't want to apply the transforms immediatly on contours,
				// otherwise the transformation will add-up on each update.
				contour.applyMatrix = false;
				contour.matrix = matrix;

			// when dealing with a skeleton, modify only the matrix of
			// expanded items
			} else {
				contour.expandedTo.forEach(function( _contour ) {
					_contour.applyMatrix = false;
					_contour.matrix = matrix;
				});
			}
		}
	}, this);

	// 3. update components and transform components
	if ( this.components.length && font ) {
		// subcomponents have the parent component as their parent
		// so search for the font
		while ( !('glyphs' in font) ) {
			font = font.parent;
		}

		this.components.forEach(function(component) {
			component.update( params );

			if ( component.transforms ) {
				matrix = Utils.transformsToMatrix(
					component.transforms.slice(0), component.transformOrigin
				);

				component.applyMatrix = false;
				component.matrix = matrix;
			}
		}, this);
	}

	// 4. transform whole glyph
	if ( glyph.transforms ) {

		matrix = Utils.transformsToMatrix(
			glyph.transforms.slice(0), glyph.transformOrigin
		);

		glyph.applyMatrix = false;
		glyph.matrix = matrix;
	}

	glyph.glyphWidth = glyph.bounds.width;

	return this;
};

psProto.Glyph.prototype.resetComponents = function() {
	if (this.src) {
		this.src.components.forEach(function(componentSrc) {
			if (Array.isArray(componentSrc.base)) {
				this.changeComponent(componentSrc.id, componentSrc.base[0]);
			}
		}.bind(this));
	}
}

psProto.Glyph.prototype.changeComponent = function(componentId, componentName) {
	var glyph = this;
	//We remove the old components
	var componentToDelete = glyph.components.filter(function(comp) { return comp.componentId === componentId })[0];
	//And remove its handle from the view
	componentToDelete.contours.forEach(function(contour) {
		contour.fullySelected = false;
	});
	//And add the correct components
	var componentSrc = glyph.src.components.filter(function(comp) { return comp.id === componentId })[0];
	glyph.solvingOrder = undefined;
	glyph.src.solvingOrder = undefined;
	Utils.selectGlyphComponent(
		glyph,
		componentSrc,
		componentName,
		glyph.parent.src,
		Utils.naive,
		componentId, glyph.components.indexOf(componentToDelete));
	glyph.solvingOrder = glyph.src.solvingOrder = Utils.solveDependencyTree(glyph);
	glyph.update();
}

// Before updating SVG or OpenType data, we must determine paths exports
// directions. Basically, everything needs to be clockwise.
// this method needs to be called only after the first update, otherwise the
// directions won't be known
psProto.Outline.prototype.prepareDataUpdate = function() {
	if ( this.isPrepared ) {
		return;
	}

	this.children.forEach(function(contour) {
		// expanded contours are handled from their skeleton
		if ( contour.expandedFrom || contour.exportReversed) {
			return;
		}

		if ( contour.skeleton !== true) {
			contour.exportReversed = !contour.isClockwise();

		} else if ( !contour.expandedTo[1] ) {
			contour.expandedTo[0].exportReversed =
				!contour.expandedTo[0].isClockwise();

		} else {
			var isClockwise = contour.isClockwise();

			contour.expandedTo[0].exportReversed = !isClockwise;
			contour.expandedTo[1].exportReversed = !isClockwise;
		}
	});

	this.isPrepared = true;
};

// for the following plumin methods, the outline must be prepared beforehand
// to be usable in prototypo.js
[ 'updateSVGData', 'updateOTCommands', 'combineTo' ].forEach(function(name) {
	var method = paper.PaperScope.prototype.Outline.prototype[ name ];

	psProto.Outline.prototype[ name ] = function() {
		if ( !this.isPrepared ) {
			this.prepareDataUpdate();
			this.isPrepared = true;
		}

		return method.apply( this, arguments );
	};
});

plumin.cloneDeep = cloneDeep;

module.exports = plumin;
