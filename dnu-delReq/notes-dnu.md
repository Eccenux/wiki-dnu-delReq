## actions stability 
- [x] adding buttons cleanup

## Actions stability 2
### part 1: LnDNU:
- [x] parametr `strona` do `LnDNU`
- [x] dodać przy tworzeniu zgłoszenia
- [x] dodać do istniejących zgł. (bot)
- [x] `closeRequestLinks`: dodać przyciski do `.sz-ln-dnu`.
- [x] strona zgłoszenia z `.sz-ln-dnu .dnu-self-page` z `.textContent`.
- [x] artyukuł z `.sz-ln-dnu a:first-of-type`.
- [x] simple mock.

// simple mock
```js
mw.hook('userjs.delreq.reader').add((dnu)=>{
	console.warn('[dnu-mock]', 'mock of tasks');

	dnu.nextTask = function () {
		console.log('[dnu-mock] nextTask (start)', {subpage:dnu.subpage, close_href:dnu.close_href, pages_to_process:dnu.pages_to_process});
	};
	dnu.addTask = function ( task ) {
		console.log('[dnu-mock] addTask:', task);
	};
});
```

```mediawiki
{{lnDNU|pageTitle|strona={{subst:FULLPAGENAME}} }}
```

### part 2: close dialog:
- [ ] Nowe okienko (OO.ui.prompt?) z możliwością wpisania komentarza.
- [ ] Wstępny komentarz na podstawie akcji (tak jak do tej pory).
- [ ] Info, że podpis będzie dodany automatycznie.
- [ ] Dopiero pod zatwierdzeniu pobranie strony i odpowiednie podmiany, czyli:
	- podmiana lnDNU jak do tej pory, ale dla konkretnego tytułu artykułu.
	- może dodanie też `|klasa=dnu-done`.
	- dopisanie komentarza i podpis (tyldy).
- [ ] Jakiś link do otworzenia zgłoszenia w nowym oknie.
- [ ] Link do otworzenia artu w nowym oknie? Może przynajmniej nazwa, żeby wiedzieć co się komentuje.
- [ ] Nie dodawać linków dla `.dnu-result` różnego od `rezultat-nn`?
- [ ] I co na koniec? Odświeżać stronę? Ukrywać tylko przyciski? Inne?
- [ ] Dodać przycisk "Brak komentarza" (jeśli komentarz już istnieje)? A może powinien być zawsze rezulatat przynajmniej?

```js
// See documentation at: 
// https://doc.wikimedia.org/oojs-ui/master/js/#!/api/OO.ui.MultilineTextInputWidget
new OO.ui.MultilineTextInputWidget( {
	autosize: true,
	value: `'''Rezultat zgłoszenia''' (tytuł art. dla multi?). ...`,
} )
```

## old, re-explore?
- [ ] mock api-tasks?
- [ ] cleanup buttonClicked?
- [ ] mobile edit (fix adding initial comment)


All task-functions:
(showProgress|deletePages|addSubpageToArchive|removeTemplate|moveToDraft|makeRedirect|addSubpageToReanimation|removeSubpage|openSubpageForEdit|reloadPage)[\s:]+function