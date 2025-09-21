# Używanie narzędzi

## Instalacja

Do używania narzędzi do sprawdzania i wdrażania potrzebujesz tylko [Node.js](https://nodejs.org/en)
i zainstalować moduły.

Moduły instalujesz jak zawsze tj. w folderze wykonujesz:
```bash
node i
```

Jeśli chcesz używać [VSCode](https://code.visualstudio.com/), to zainstaluj go i otwórz w nim folder z kodem.
Powinny wysokczyć sugestie instalacji rozszerzeń pomocniczych.

## Wdrożenia

Gadżet jest wdrażany za pomocą [Wikiploy](https://pl.wikipedia.org/wiki/Wikipedia:Wikiploy). Można robić to ręcznie, ale na dłuższą metę wygodniej jest botem.

1. Przygotuj swoje hasło w `bot.config.mjs` (see *Preparing deployment* below).
2. Wdrażać możesz za pomocą [VSCode](https://code.visualstudio.com/), albo z linii poleceń:
```bash
# wdrożenie do przestrzeni użytkownika (podczas testowania zmian)
npm deploy-dev
# pełne wdrożenie
# (opis zmian podaje się przy wdrożeniu)
npm deploy
```

Uwaga! DelReq nie ma wersji (większość gadżetów ma numer wersji).
Tutaj jednak nigdzie nie trzeba zmieniać wersji.

## Hasło bota

Krok 1: Utwórz swojego podużytkownika (np. MojaKsywka@Wikiploy) i jego hasło na stronie Special:BotPasswords:
https://pl.wikipedia.org/wiki/Special:BotPasswords

Krok 2: Uprawnienia, które powinieneś ustawić (jeśli możesz):
https://github.com/Eccenux/Wikiploy/blob/main/assets/Bot%20passwords%20-%20Test%20Wikipedia.png

Krok 3: Utwórz plik `bot.config.mjs` i uzupełnij go o nazwę użytkownika oraz hasło:
```js
/**
	Bot with edit&create rights.
	
	You can create and remove any wiki. E.g. on the test wiki:
	https://test.wikipedia.org/wiki/Special:BotPasswords

	The username will be something like `MyName@Wikiploy` where `Wikiploy` would be a bot name
	(you can choose any bot name but "Wikiploy" would be a good choice to separate it from other things).
	
	The password will be something like `12345abcdefpqrst123456abcdef`.
 */
export const username = '...@...';
export const password = '...';
```
