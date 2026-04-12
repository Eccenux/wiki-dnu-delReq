# SimpleDragDialog

A dialog with no dependencies. Works on desktop and mobile.

Deployed as:
https://pl.wikipedia.org/wiki/MediaWiki:Gadget-SimpleDragDialog.js
https://pl.wikipedia.org/wiki/MediaWiki:Gadget-SimpleDragDialog.css

<!-- TOC -->

- [Create a dialog](#create-a-dialog)
- [Showing the dialog](#showing-the-dialog)
- [Centering the dialog](#centering-the-dialog)
- [Elements](#elements)
- [Events](#events)
	- [Close dialog](#close-dialog)
	- [Submit and close as a Promise](#submit-and-close-as-a-promise)
- [Styles](#styles)

<!-- /TOC -->

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

| property       | CSS selector         | Notes                       |
|----------------|----------------------|-----------------------------|
| `sdd.dialog`   | dialogClass (option) | main container              |
| `sdd.header`   | `.u-header`          | title and window buttons    |
|                | `.u-title`           | also a drag handle          |
| `sdd.body`     | `.u-body`            | body that can be replaced   |

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

## Events

### Close dialog

Handling default close event (e.g. for default close button):
```js
sdd.dialog.addEventListener('dialog:close', (e) => {
	console.debug('Dialog closed:', e.detail.reason);
});
```

Custom close button:
```js
form.querySelector('.u-done').addEventListener('click', () => {
	sdd.dialog.remove();
});
```

If you are going to re-use the dialog you should hide it:
```js
form.querySelector('.u-done').addEventListener('click', () => {
	sdd.hide();
});
```
Using `show()/hide()` is useful when you want to keep the state of the form (i.e., preserve values entered by the user for the next time). You can also consider this when it takes a long time to initialize the dialog.

### Submit and close as a Promise

By default, `sdd.create()` is not a Promise; it just returns a dialog for you to set up.

When you are mostly done with the setup, you can create a Promise and wait for the SDD result like this:
```js
let result = await new Promise((resolve, reject) => {
	// form submit
	let submit = (e)=>{
		e.preventDefault();
		resolve('submit');
	};
	form.querySelector('.u-submit').addEventListener('click', submit);
	form.addEventListener('submit', submit);

	// standard close
	sdd.dialog.addEventListener('dialog:close', (e) => {
		resolve('cancel');
	});

	// now show the dialog
	sdd.show();
	sdd.center({x:1,y:0});
});
```

What happens here?

First, there is a common submit function used for both `form.submit` and any custom buttons. It calls `resolve` with the text `submit`, but you could return an object if you want.
```js
	let submit = (e)=>{
		e.preventDefault();
		resolve('submit'); // can return almost anything you want
	};
```

Hook up the function. The example below assumes your form has `<input type="submit" class="u-submit">` or `<button class="u-submit">...</button>` or similar.
```js
	form.querySelector('.u-submit').addEventListener('click', submit);
	form.addEventListener('submit', submit);
```

Note that dialog is shown within the Promise like this:
```js
	sdd.show();
	sdd.center({x:1,y:0});
```

Keep in mind that any code after the Promise will not be executed until `resolve` or `reject` is called. In the example above, the browser will proceed only after the user submits the form or closes the dialog. This means you need to set up everything before the Promise or inside it.

## Styles

The dialog has basic styles built in (in `SimpleDragDialog.css`).

For an example of custom look for form elements, see `DelReqHandler.css`.