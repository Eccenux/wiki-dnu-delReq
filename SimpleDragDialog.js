class SimpleDragDialog {
	/**
	 * Creates draggable dialog window.
	 * @param {Object} opt
	 * @param {string} opt.title
	 * @param {string|HTMLElement} opt.content
	 * @returns {HTMLElement} Dialog.
	 */
	create({content = '', title = ''} = {}) {
		// container
		const dialog = document.createElement('div'); // OR dialog?
		dialog.style.display = 'none';

		//
		// header (draggeble)
		const header = document.createElement('div');
		header.className = 'u-header';

		const closeBtn = document.createElement('button');
		closeBtn.textContent = '×';
		closeBtn.style.marginLeft = '10px';
		closeBtn.onclick = () => dialog.remove();

		const titleEl = document.createElement('span');
		titleEl.textContent = title;

		header.appendChild(titleEl);
		header.appendChild(closeBtn);

		//
		// content
		const body = document.createElement('div');
		body.className = 'u-body';

		if (typeof content === 'string') {
			body.innerHTML = content;
		} else {
			body.appendChild(content);
		}

		//
		// finalize
		dialog.appendChild(header);
		dialog.appendChild(body);
		let citedialogs = document.getElementById( 'sdragdialog-dialogs' );
		citedialogs.appendChild(dialog);

		this.makeDraggable(dialog, header)

		return dialog;
	}
	/**
	 * Adds drag logic to window.
	 * @param {HTMLElement} dialog The dialog to move.
	 * @param {HTMLElement} header Drag handle.
	 */
	makeDraggable (dialog, header) {
		let isDragging = false;
		let offsetX = 0;
		let offsetY = 0;

		header.addEventListener('mousedown', (e) => {
			isDragging = true;
			offsetX = e.clientX - dialog.offsetLeft;
			offsetY = e.clientY - dialog.offsetTop;
			document.body.style.userSelect = 'none';
		});

		document.addEventListener('mousemove', (e) => {
			if (!isDragging) return;
			dialog.style.right = 'auto';
			dialog.style.bottom = 'auto';
			dialog.style.left = (e.clientX - offsetX) + 'px';
			dialog.style.top = (e.clientY - offsetY) + 'px';
		});

		document.addEventListener('mouseup', () => {
			isDragging = false;
			document.body.style.userSelect = '';
		});
	}
}