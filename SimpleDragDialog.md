# SimpleDragDialog

A dialog with no dependencies. Works on desktop and mobile.

Deployed as:
https://pl.wikipedia.org/wiki/MediaWiki:Gadget-SimpleDragDialog.js
https://pl.wikipedia.org/wiki/MediaWiki:Gadget-SimpleDragDialog.css

## Create a dialog

Creating a dialog is pretty straight forward:
```js
	/**
	 * @private
	 * @returns {SimpleDragDialog}
	 */
	createDialog ({title='Dialog'}) {
		let form = document.createElement('form');
		let sdd = new SimpleDragDialog();
		sdd.create({content:form, title});
		return sdd;
	}
```

If you plan to add some CSS to your form you might want to add a `dialogClass` option in the `create` function, but you can also add a class to the form:
```js
	createDialog ({title='Dialog'}) {
		let form = document.createElement('form');
		form.classList.add('u-fancy-form');
		let sdd = new SimpleDragDialog();
		sdd.create({content:form, title});
		return sdd;
	}
```

## Showing the dialog

By default create has an option `startHidden=true`. This is because you might want to prepare the dialog content before it is shown.

So once your done creating the form contents you have to `show()` it:
```js
{
	let sdd = new SimpleDragDialog();
	sdd.create({content:'Hi, world', title:'Hello'});
	sdd.show();
	sdd.center(); // optional
}
```

## Centering the dialog

By default the dialog is in the top right corner. You can change that with CSS for all your windows or with the center function:
```
// both X and Y axes
sdd.center();
sdd.center({x:1, y:1});

// left, center
sdd.center({x:0, y:1});
// left, top
sdd.center({x:0, y:0});
// center, top
sdd.center({x:1, y:0});
```

## Elements

The dialog has some useful properties:

| property       | CSS selector         |
|----------------|----------------------|
| `sdd.dialog`   | dialogClass (option) |
| `sdd.header`   | `.u-header`          |
| `sdd.body`     | `.u-body`            |

So you can skip content option in the `create()` and do initialization differently:
```js
{
	let sdd = new SimpleDragDialog();
	sdd.create({title:'Hello'});
	sdd.body.textContent = `Hi ${mw.config.get('wgUserName')}!`;
	sdd.show();
	sdd.center();
}
```
Note: You should avoid using `innerHTML` for user data. Using `textContent` is safer because it helps prevent XSS and some errors.
