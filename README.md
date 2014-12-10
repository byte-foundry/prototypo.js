prototypo.js
============

Font and type-design library with built-in canvas rendering and OTF export.
Based on [paper.js](https://github.com/paperjs/paper.js)'s API and [opentype.js](https://github.com/nodebox/opentype.js) capabilities.

Install
-------

bower install prototypo

Getting started
---------------

	// prototypo fonts are stored in a json formats that follows UFO3 spec (docs pending)
	var fontSrc = require('font.ufo.json'),
		prototypo = require('prototypo');

	font = prototypo( fontSrc );

	// ... and in your code
	typeface.update('string of characters to update');

Algo de dessin paramétrique :
Je parcours mon objet en essayant de calculer chacune des propriétés
Quand je rencontre une propriété que je ne peux pas calculer, je la stock dans une liste

unsolvedList = {
	'a': true,
	'b.c': true,
	'd.0': true
}

Quand j'ai fini de parcourir mon objet, je parcours la unsolvedList en esayant à nouveau de la résoudre.
Quand je résoud un propriété, je la stock dans un tableau à une dimension solvingList
solvingList.push( 'b.c' );
Il faut faire autant de tour que nécessaire pour supprimer tous les éléments de unsolvedList.
À chaque tour il faut que la taille de solvingList change !

Lors des updates suivantes on n'aura pas besoin de la unsolvedList, solvingList sera suffisant en théorie.