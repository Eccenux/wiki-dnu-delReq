// ==UserScript==
// @name         DNU: linki
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       Maciej Nux
// @match        https://pl.wikipedia.org/wiki/Wikipedia:Poczekalnia/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=wikipedia.org
// @grant        none
// ==/UserScript==

mw.hook('userjs.delreq.reader').add(()=>{
	console.log('DNU: linki');

	var sections = document.querySelectorAll('h2 .mw-editsection');
	sections.forEach(section => {
		var divder = section.querySelector('.mw-editsection-divider').cloneNode(true);
		var bracket = section.querySelector('a+.mw-editsection-bracket');
		var href = section.querySelector('a').href.replace(/&[^t]\w+=[^&]+/g, '');
		console.log(href, bracket);
		var nel = document.createElement('a');
		nel.href = href;
		nel.textContent = "podstrona";
		section.insertBefore(divder, bracket);
		section.insertBefore(nel, bracket);
	});
});
