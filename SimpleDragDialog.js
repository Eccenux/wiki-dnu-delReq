/* global mw */
{
	/**
	 * Simple draggable dialog window.
	 * 
	 * To get an instance of this class use `dialog.uSdd`.
	 */
	class SimpleDragDialog {
		constructor() {
			/** ID of the container. */
			this.sddId = 'sdragdialog-dialogs';
		}
		show() {
			this.dialog.classList.remove('hidden');
			this.dialog.style.display = '';
		}
		hide() {
			this.dialog.classList.add('hidden');
			this.dialog.style.display = 'none';
		}
		/** Count of dialogs. */
		dialogsCount() {
			let sddContainer = document.getElementById(this.sddId);
			if (!sddContainer) return 0;
			return sddContainer.querySelectorAll('.sdragdialog-dialog:not(.hidden)').length;
		}
		/**
		 * Creates draggable dialog window.
		 * @param {Object} opt
		 * @param {string} opt.title
		 * @param {string|HTMLElement} opt.content
		 * @param {string|HTMLElement} opt.dialogClass Extra class.
		 * @returns {HTMLElement} Dialog element.
		 */
		create({content = '', title = '', dialogClass = '', startHidden = true} = {}) {
			// container
			const dialog = document.createElement('div'); // OR dialog?
			this.dialog = dialog;
			if (startHidden) {
				this.hide();
			}
			dialog.classList.add('sdragdialog-dialog');
			if (dialogClass) {
				dialog.classList.add(dialogClass);
			}

			// self reference
			dialog.uSdd = this;

			//
			// header (draggeble)
			const header = document.createElement('div');
			header.className = 'u-header';

			const closeBtn = document.createElement('button');
			closeBtn.textContent = '×';
			closeBtn.style.marginLeft = '10px';
			closeBtn.addEventListener('click', ()=>{
				dialog.dispatchEvent(new CustomEvent('dialog:close', {
					detail: { reason: 'button' },
				}));
				dialog.remove();
			});

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
			// elements
			this.dialog = dialog;
			this.header = header;
			this.body = body;

			//
			// finalize
			dialog.appendChild(header);
			dialog.appendChild(body);
			const sddId = this.sddId;
			let sddContainer = document.getElementById(sddId);
			if (!sddContainer) {
				sddContainer = document.createElement('div');
				sddContainer.setAttribute('id', sddId);
				document.body.appendChild(sddContainer);
			}
			sddContainer.appendChild(dialog);

			this.makeDraggable(dialog, header);
			if (this.isMobile()) {
				this.enableDoubleTapMax(dialog, header);
				dialog.style.left = '0';
				dialog.style.right = '0';
				dialog.style.top = '0';
			}

			return dialog;
		}

		isMobile() {
			return window.innerWidth < 420;
		}

		/**
		 * Adds double tap logic to window.
		 * @param {HTMLElement} dialog The dialog to move.
		 * @param {HTMLElement} header Tap/maximize handle.
		 */
		enableDoubleTapMax(dialog, header) {
			const DOUBLE_TAP_DELAY = 300; // ms
			let inTap = false;
			let title = header.querySelector('span');
			title.style.userSelect = 'none';
			title.addEventListener("touchstart", (e) => {
				if(!inTap) {
					inTap = true;
					setTimeout(() => {
						inTap = false;
					}, DOUBLE_TAP_DELAY);
				} else {
					e.preventDefault();
					dialog.style.left = '0';
					dialog.style.right = '0';
					dialog.style.top = '0';
				}
			});
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

			let title = header.querySelector('span');

			// disable scroll
			title.style.touchAction = 'none';

			title.addEventListener('pointerdown', (e) => {
				// prevent text selection / scrolling on touch
				title.setPointerCapture(e.pointerId);

				isDragging = true;
				offsetX = e.clientX - dialog.offsetLeft;
				offsetY = e.clientY - dialog.offsetTop;
			});

			document.addEventListener('pointermove', (e) => {
				if (!isDragging) return;
				dialog.style.right = 'auto';
				dialog.style.bottom = 'auto';
				dialog.style.left = (e.clientX - offsetX) + 'px';
				dialog.style.top = (e.clientY - offsetY) + 'px';
			});

			document.addEventListener('pointerup', (e) => {
				title.releasePointerCapture(e.pointerId);

				isDragging = false;
			});
		}

		/**
		 * Centers the dialog within the viewport.
		 *
		 * Can center horizontally, vertically, or both.
		 *
		 * @param {Object} [options]
		 * @param {boolean} [options.x=true] Center horizontally (X axis).
		 * @param {boolean} [options.y=true] Center vertically (Y axis).
		 */
		center ({x=true, y=true}={}) {
			const dialog = this.dialog;

			const rect = dialog.getBoundingClientRect();
			let offsetX = x ? (window.innerWidth - rect.width) / 2 : 0;
			let offsetY = y ? (window.innerHeight - rect.height) / 2 : 0;

			dialog.style.right = 'auto';
			dialog.style.bottom = 'auto';
			dialog.style.left = offsetX + 'px';
			dialog.style.top = offsetY + 'px';
		}
	}

	// export
	window.SimpleDragDialog = SimpleDragDialog;
	mw.hook('userjs.SimpleDragDialog.ready').fire(SimpleDragDialog);
}
