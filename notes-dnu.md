## actions stability 
- [x] adding buttons cleanup

## Actions stability 2
### part 1: LnDNU:
- [x] parametr `strona` do `LnDNU`
- [x] dodać przy tworzeniu zgłoszenia
- [x] dodać do istniejących zgł. (bot)
- [x] `closeRequestLinks`: dodać przyciski do `.sz-ln-dnu`.
- [x] strona zgłoszenia z `.sz-ln-dnu .dnu-self-page` z `.textContent`.
- [x] artykuł z `.sz-ln-dnu a:first-of-type`.
- [x] simple mock.

// simple mock
```js
mw.hook('userjs.delreq.reader').add((dnu)=>{
	console.warn('[dnu-mock]', 'mock of tasks');

	dnu.nextTask = function () {
		console.log('[dnu-mock] nextTask (start)', {subpage:dnu.subpage, close_data:dnu.close_data, pages_to_process:dnu.pages_to_process});
	};
	dnu.addTask = function ( task ) {
		console.log('[dnu-mock] addTask:', task);
	};
});
```

```mediawiki
{{lnDNU|pageTitle|strona={{subst:FULLPAGENAME}} }}
```

### part 2a: basic mobile support:
Wsparcie dla mobilnego edytora. Haksior przed lepszym rozwiązaniem (lepsze = okienko dialogowe do zamykania).
- [x] Debug.
- [x] Test zamknięcia zgłoszenia (bez mock).
- [x] Test zamykania.

Przykładowy URL mobilny (fakeaction dodane przez DelReq):
https://pl.m.wikipedia.org/w/index.php?title=Wikipedia%3APoczekalnia%2Fartyku%C5%82y%2F2024%3A09%3A09%3AChamp_%28kryptozoologia%29&fakeaction=close_del#/editor/all

### part 3: dialog save (close via popup, not edit page)

Opowieść użytkownika o zamykaniu wielu zgłoszeń (zwłaszcza multi):
https://pl.wikipedia.org/wiki/Dyskusja_wikipedysty:Nux/Archiwum/53#c-AramilFeraxa-20240924085100-MediaWiki:Gadget-DelReqHandler.js

#### Formularz zamykania
- [x] refsTB.createDraggableDialog -> SimpleDragDialog
- [x] Adaptacja CSS do okienka dialogowego (prefix `sdragdialog-` zamist `refstb-`)
- Formularz:
	- [x] this.maybeSetupForm(); -> zalążek obsługi edycji -> closingEditOpen()
	- [x] otwarcie okienka
	- [x] wstawienie bazowego info
	- [x] nowe wdrażanie wikiploy-dev.
	- [x] podpięcie otwierania do... openSubpageForEdit()?
- Zapis:
	- [x] pobranie danych bieżącej dyskusji (`this.api.edit`?);
	- [x] przerobione setupForm na closingEditSubmit.
- Dodatki formularza:
	- [x] link do podstrony dyskusji + do jej edycji
	- [x] info po udanym zapisie

#### BTW i wykończenia
- [x] BTW. poprawka obsługi reanimacji (źle otacza divem, brak koloru dla dark mode).
- [x] BTW. poprawka obsługi błędów (obecnie blokują zgłaszanie problemów, potencjał na XSS...).
- [ ] Testy i dostosowanie scroll dla wersji mobilnej.
	- Czy się ładnie rozciąga?
	- Przewijanie: wnętrza dialogu, czy ze stroną? (ograniczanie wysokiego dialogu)?
- [ ] Test przenoszenia do brudnopisu. Czy tam działa podsumowanie? Najpierw okienko z akcją przenoszenia, a potem podsumowanie aka werdykt.
- [ ] Roll gadżetu.
- [ ] Nowe zależności dla gadżetu.
- [ ] Aktualizacja docs.
- [ ] Info na WP:TO.

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