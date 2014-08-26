prototypo-core
==============

Parametric-glyph engine

Install
-------

bower install prototypo

Getting started
---------------

	typeface = prototypo(fontValues, cmap);

	typeface.builder()
		.use(default())
		.use(linker());

	typeface.processor()
		.use(default())
		.use(naiveExpand())
		.use(hobbySplines())
		.use(naiveCurviness())

	// ... and in your code
	typeface.update('string of characters to update');