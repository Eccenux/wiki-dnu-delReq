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

### part 2a: basic mobile support:
Wsparcie dla mobilnego edytora. Haksior przed lepszym rozwiązaniem (lepsze = okienko dialogowe do zamykania).
- [x] Debug.
- [x] Test zamknięcia zgłoszenia (bez mock).
- [x] Test zamykania.

Przykładowy URL mobilny (fakeaction dodane przez DelReq):
https://pl.m.wikipedia.org/w/index.php?title=Wikipedia%3APoczekalnia%2Fartyku%C5%82y%2F2024%3A09%3A09%3AChamp_%28kryptozoologia%29&fakeaction=close_del#/editor/all

### part 2b: close dialog:

Opowieść użytecznicza:
https://pl.m.wikipedia.org/wiki/Dyskusja_wikipedysty:Nux?markasread=29163559&markasreadwiki=plwiki#c-AramilFeraxa-20240924085100-MediaWiki:Gadget-DelReqHandler.js

- [ ] BTW. po anulowaniu przenoszenia do brudnopisu występuje błąd, którego nie można zamknąć.
	Zmienić to na okienko informacje w stylu obsługi zamykania nominacji CW (takie OO.ui).
	Sprawdzić czy ESC działa.
- [ ] BTW. przy przenoszenie do brudnopisu, po anulowaniu nie powinno tego traktować jak błąd. Zamiast tego dać ogólne okienko -- "Operacja anulowana. Żadne zmiany nie zostały jeszcze wykonane." (bo w sumie to nie jest oczywiste).
- [ ] BTW. przy przenoszenie do brudnopisu, po anulowaniu nie powinno tego traktować jak błąd.
...
- [ ] Zaadaptować okienko z przenoszenia do brudnopisu.
	- [ ] W tytule okienka dodać informację o wykonywanej akcji.
		Tytuł: "Przygotowanie do zamknięcia".
		Akcja: ... (tylko etykieta, bez możliwości zmiany).
	- [ ] Zmiast wiadomości dla użytkownika. "Podsumowanie dyskusji"
- [ ] Dodatkowy, zwijany HTML z treścią dyskusji (tagi summary/details?).
- [ ] Testy i dostosowanie scroll dla wersji mobilnej -- poszukać jakiejś długiej dyskusji. Lepsze będzie przewijanie wnętrza dialogu, przewijanie details, czy bardzo wysoki dialog?
- [ ] Może też dodatkowo link do otworzenia zgłoszenia w nowym oknie?
- [ ] Link do otworzenia artu w nowym oknie? Może przynajmniej nazwa, żeby wiedzieć co się komentuje.
- [ ] Przy otwieraniu okna wstawić wstępny komentarz na podstawie akcji (tak jak do tej pory, tj. usunięto w boldzie itp).
- [ ] Info, że podpis będzie dodany automatycznie.
- [ ] Dopiero pod zatwierdzeniu pobranie strony i odpowiednie podmiany, czyli:
	- podmiana lnDNU jak do tej pory, ale dla konkretnego tytułu artykułu (wspracie dla masowych zgtłoszeń).
	- wykrycie i usunięcie końcowych tyld oraz minusów (`/-*~~~+/`).
	- dopisanie komentarza i podpis (tyldy).
- [ ] I co na koniec?
	Odświeżać stronę? Chyba nie, bo mogę być w różnych miejscach strony...
	Ukrywać tylko przyciski? Samo ukrycie może nie być wystarczające. Nie będzie widać czy się udało na pewno.
	Ukrycie i dopisek "Pomyślnie zamknięto [zgłoszenie]" (z linkiem do zgłoszenia ustawionym na target_blank).
- [ ] Zmiana również przenoszenia do brudnopisu, tam też jest podsumowanie. Czyli najpierw okienko z akcją wiadomość, a potem podsumowanie.
...
- [ ] I jak już będzie można wszystko anulować, to wyłączyć to początkowe potwierdzenie ("Czy na pewno wykonać akcję?").
- [ ] Dodać przycisk "Brak komentarza" (jeśli komentarz już istnieje)? A może powinien być zawsze rezulatat przynajmniej?
- [ ] Ukryć/wyszarzyć przyciski dla `(.dnu-result).textContent != 'rezultat-nn'`. A może pokazać jakieś info w zamian?
- [ ] Nie dodawać linków dla `.dnu-done`? A może wg rezulatatu (linki tylko dla klasy `rezultat-nn`)?

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