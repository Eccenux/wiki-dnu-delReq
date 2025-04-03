/* eslint-disable no-unused-vars */
/* eslint-disable no-useless-escape */
/* eslint-disable array-bracket-newline */
/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable indent */
/* global $, mw, OO */
/* global moveToSandboxGadget */
// <nowiki>
/**
  Support for quick deletions and closing of deletion requests at Polish Wikipedia.
  
  Info: [[Wikipedia:Narzędzia/DelReqHandler]].

  Source code:
    https://github.com/Eccenux/wiki-dnu-delReq

  Author: [[User:Lupo]], October 2007 - January 2008
    full list of initial authors:
    http://commons.wikimedia.org/w/index.php?title=MediaWiki:Gadget-DelReqHandler.js&action=history

  Adaptation for pl.wiki: [[User:Lampak]], [[User:Wargo]], [[User:Nux]]
    full list of current authors:
    https://pl.wikipedia.org/w/index.php?title=MediaWiki:Gadget-DelReqHandler.js&action=history

  Contains parts of code (possibly modified) of commons:MediaWiki:AjaxQuickDelete.js
    by [[User:Ilmari Karonen]], [[User:DieBuche]]
    full list of authors: http://commons.wikimedia.org/w/index.php?title=MediaWiki:AjaxQuickDelete.js&action=history
*/

$(document).ready(function() {

if ('object' === typeof DelReqHandler ) {
	return;
}

var isAdmin = mw.config.get('wgUserGroups', []).indexOf('sysop') >= 0;

var DelReqHandler =
{

	/*------------------------------------------------------------------------------------------
	  Deletion request closing: add "[del]" and "[keep]" links to the left of the section edit
	  links of a deletion request. They open the deletion request for editing in a new window
	  (or tab), add "Deleted." or "Kept." plus the signature (four tildes)
	  and don't save and close the
	  window, so that the user may enter an additional comment.
	  ------------------------------------------------------------------------------------------*/

	fakeaction_close_del     : 'close_del',
	fakeaction_close_keep    : 'close_keep',
	fakeaction_close_no_result : 'close_no_result',
	fakeaction_close_repaired : 'close_repaired',
	fakeaction_close_eject   : 'close_eject',
	fakeaction_move_reanimation : 'move_reanimation',
	close_del_summary  : 'Usunięto.',
	close_keep_summary : 'Zostawiono.',
	close_no_result_summary : 'Nie osiągnięto konsensusu.',
	close_eject_summary: 'Wycofano.',
	close_move2repair_summary: 'Przeniesiono do reanimacji.',
	close_repaired_summary: 'Naprawiono.',
	close_draft_summary: 'Przeniesiono do brudnopisu.',
	close_redir_summary: 'Przekierowano do innego artykułu.',
	// Note! Use undescore instead of space
	deletion_request_pages : [
		'Wikipedia:Poczekalnia/artykuły',
		'Wikipedia:Poczekalnia/biografie',
		'Wikipedia:Poczekalnia/kwestie_techniczne',
		'Wikipedia:Poczekalnia/reanimacja',
		'Wikipedia:Poczekalnia/zgłoszenia',
		'Wikipedysta:'+mw.config.get('wgUserName')+'/test_poczekalni',
	], 
	archive_section_line : '<!-- Zakończone dyskusje wstawiaj poniżej tej linii -->',
	reanimation_section_line : '<!-- Nowe zgłoszenia wstawiaj poniżej tej linii. Nie usuwaj tej linii -->',
	archive_edit_summary : '[[$1]] − dyskusja zakończona',
	
	current_pagename : mw.config.get('wgPageName'),
	
	api : new mw.Api(/*{parameters:{errorformat: 'html', formatversion: 2}}*/),
	progressDialog: null,
	windowManager: null,
	
	beginLoading : function()
	{
		var wgAction = mw.config.get('wgAction');
		// mobile edit
		if (location.hash.includes('editor/all')) {
			wgAction = 'edit';
		}
		var notoldid = document.URL.search (/[?&]oldid=/) < 0;
		if ((wgAction == 'view' || wgAction == 'purge') && this.isItDelReqPage() && notoldid)
		{
			var o = this;
			mw.loader.using([ 'oojs-ui-core', 'oojs-ui-windows' ], function() {
				$(document).ready(function() {
					o.closeRequestLinks();				    
				});
			});			
		}
		else if (wgAction == 'edit') {
			this.maybeSetupForm();
		}
	},

	isItDelReqPage : function()
	{
		var current = this.current_pagename.replace(/ /g, '_');
		for (var i = 0; i < this.deletion_request_pages.length; i++)
			if (current.indexOf(this.deletion_request_pages[i]) == 0)
				return true;
		return false;
	},

	isSubpage : function(table, subpage)
	{
		var searched = 'Wikipedia:Poczekalnia/' + table.replace(/ /g, '_') + '/';
		if (subpage.replace(/ /g, '_').indexOf(searched) == 0) {
			return true;
		}
		return false;
	},

	/** Action button (for the section). */
	createActionButton: function(action, button_o, dnuTemplate, subpage, fakeaction) {
			var button = new OO.ui.ButtonWidget(button_o);

			button.$element.click((e) => {
				e.preventDefault();

				if(action == this.actionMap.redirect)
				{
					OO.ui.prompt( 'Podaj stronę docelową przekierowania', { textInput: { placeholder: 'Tytuł docelowy' } } ).done((result) => {
						if ( result !== null && result.length ) {
							this.inputfield = result;
							this.buttonClicked(action, dnuTemplate, subpage, fakeaction);
						}
					});
				}
				else
				{
					if(confirm("Czy na pewno wykonać akcję?"))
					this.buttonClicked(action, dnuTemplate, subpage, fakeaction);
				}
			});
			
			return button;
	},
	
	/** Prepare action links in sections. */
	closeRequestLinks : function ()
	{
		const dnuTemplates = document.querySelectorAll('#bodyContent .sz-ln-dnu');

		let hasItems = false;
		for (let dnuTemplate of dnuTemplates) {
			const subpageEl = dnuTemplate.querySelector('.sz-ln-dnu .dnu-self-page');
			if (!subpageEl) {
				console.warn('[dnu] dnu-self-page not found', {dnuTemplate});
				continue;
			}
			// full subpage title
			const subpage = subpageEl.textContent.trim().replace(/ /g, '_');

			// buttons
			const buttonGroup = this.createButtons(dnuTemplate, subpage);
			$(dnuTemplate).append( $('<div class="dnu-actions">').append(buttonGroup.$element) );

			// done
			// $(dnuTemplate).addClass('header-has-delreq');
			hasItems = true;
		}

		if (hasItems) {
			mw.util.addCSS(/*css*/`
				.dnu-actions .oo-ui-buttonGroupWidget {
					display: flex;
					flex-wrap: wrap;
					align-items: flex-start;
				}
				.dnu-actions .oo-ui-buttonGroupWidget .oo-ui-buttonWidget {
					margin-left: 0 !important;
				}
			`);

			mw.hook('userjs.delreq.reader').fire(DelReqHandler);
		}
	},

	/** Create a group of buttons for the section. */
	createButtons: function (dnuTemplate, subpage) {
		var items = [];
	
		if (isAdmin) {
			items.push(this.createActionButton(this.actionMap.delete, {label: 'Usuń', icon: 'trash', flags: 'destructive', framed: false}, dnuTemplate, subpage, this.fakeaction_close_del));
		}
	
		if (!this.isSubpage('reanimacja', subpage)) {
			items.push(this.createActionButton(this.actionMap.keep, {label: 'zostaw', icon: 'articleCheck', flags: 'progressive', framed: false}, dnuTemplate, subpage, this.fakeaction_close_keep));
			items.push(this.createActionButton(this.actionMap.noResult, {label: 'brak wyniku', icon: 'help', flags: 'progressive', framed: false}, dnuTemplate, subpage, this.fakeaction_close_no_result));
			items.push(this.createActionButton(this.actionMap.toArchive, {label: 'do arch.', icon: 'tray', flags: 'progressive', framed: false}, dnuTemplate, subpage, ''));
			items.push(this.createActionButton(this.actionMap.reject, {label: 'wycofaj', icon: 'undo', flags: 'progressive', framed: false}, dnuTemplate, subpage, ''));
			items.push(this.createActionButton(this.actionMap.draft, {label: 'brudnopis', icon: 'sandbox', flags: 'progressive', framed: false}, dnuTemplate, subpage, 'close_draft'));
			items.push(this.createActionButton(this.actionMap.redirect, {label: 'redir', icon: 'articleRedirect', flags: 'progressive', framed: false}, dnuTemplate, subpage, 'close_redir'));
		} else {
			items.push(this.createActionButton(this.actionMap.repaired, {label: 'naprawiono', icon: 'articleCheck', flags: 'progressive', framed: false}, dnuTemplate, subpage, this.fakeaction_close_repaired));
		}
	
		if (this.isSubpage('artykuły', subpage) || this.isSubpage('biografie', subpage)) {
			// icons?: clock, labFlask, ongoingConversation
			items.push(this.createActionButton(this.actionMap.reanimation, {label: 'reanimacja', icon: 'labFlask', flags: 'progressive', framed: false}, dnuTemplate, subpage, this.fakeaction_move_reanimation));
		}
	
		var buttonGroup = new OO.ui.ButtonGroupWidget({
			items: items,
		});
		return buttonGroup;
	},
		
	/*------------------------------------------------------------------------------------------
	  Links on every non-deleted article mentioned on a deletion request page. The "[del]" link
	  triggers deletion (auto-completed!) of the article, with a deletion summary linking to the
	  deletion request. If the article has a talk page, it is deleted as well. The "[keep]" link
	  automatically removes the "delete" template from the article and adds the "kept" template
	  to the article talk page, both linking back to the deletion request.
	  ------------------------------------------------------------------------------------------*/

	// TODO: use this in other places...
	/** Action map for buttons. */
	actionMap: {
		delete: 0,
		keep: 1,
		noResult: 2,
		repaired: 3,	// used in reanimation
		toArchive: 4,	// move to archive
		reject: 5,
		draft: 6,		// move to user's draft
		redirect: 7,	// replace with redirect
		reanimation: 8,	// move to reanimation
	},
		
	/**
	 * Button action.
	 * 
	 * Called when the user clicked one of the links.
	 *  
	 * @param {Number} action Which of the links has been pressed: see `actionMap`.
	 * @param {Element} dnuTemplate Reference to lnDNU with article titles and action links.
	 * @param {String} sub Subpage of the del request.
	 * @param {String} close_href Edit link for the del req.
	 * @returns 
	 */
	buttonClicked : function (action, dnuTemplate, subpage, fakeaction)
	{
		const articleTitleEl = dnuTemplate.querySelector('.sz-ln-dnu a:first-of-type');
		const articleTitle = !articleTitleEl ? '' : articleTitleEl.textContent.trim();
		if (!articleTitle.length) {
			alert('Nie udało się znaleźć linka w szablonie lnDNU. Spróbuj odświeżyć stronę lub sprawdź czy szablon jest wypełniony poprawnie.');
			console.error('[dnu] close failed.', {action, dnuTemplate, subpage});
			return;
		}

		this.startDate = new Date ();
		this.subpage = subpage;
		this.reason = '[[' + subpage + ']]';
		this.keep_summary = 'Zostawiono po dyskusji: ' + this.reason;
		this.close_href = mw.util.getUrl(subpage, {action:'edit', fakeaction});

		this.pages_to_process = [articleTitle];

		this.tasks = [];
		this.addTask('showProgress');
		
		if(typeof DelReqHandler_debug !== "undefined")
		{
			console.log("[dnu] Omawiane strony: ", this.pages_to_process);
			return;
		}
		
		switch(action)
		{
		case this.actionMap.delete:
			this.addTask('deletePages');
			this.addTask('addSubpageToArchive');
			break;
		case this.actionMap.keep:
			this.addTask('removeTemplate');
			this.template_param = 'zostawiono';
			this.addTask('addSubpageToArchive');
			break;
		case this.actionMap.noResult:
			this.addTask('removeTemplate');
			this.template_param = 'brak wyniku';
			this.addTask('addSubpageToArchive');
			break;
		case this.actionMap.repaired:
			this.addTask('removeTemplate');
			this.template_param = 'naprawiono';
			this.addTask('addSubpageToArchive');
			break;
		case this.actionMap.toArchive:
			this.addTask('addSubpageToArchive');
			break;
		case this.actionMap.reject:
			this.addTask('removeTemplate');
			this.addTask('addSubpageToArchive');
			break;
		case this.actionMap.draft:
			this.addTask('moveToDraft');
			this.addTask('addSubpageToArchive');
			break;
		case this.actionMap.redirect:
			this.addTask('makeRedirect');
			this.addTask('addSubpageToArchive');
			break;
		case this.actionMap.reanimation:
			this.addTask('addSubpageToReanimation');
			break;
		}
		
		this.addTask('removeSubpage');
		this.addTask('openSubpageForEdit');
		this.addTask('reloadPage');

		this.nextTask();
	},
	
	moveToDraft : function ()
	{
		this.page_processed = this.pages_to_process.shift();//TODO: masowo do brudnopisu
		var article = this.page_processed;

		mw.loader.using('ext.gadget.move-to-sandbox', function (){
			moveToSandboxGadget.moveSource = article;
			moveToSandboxGadget.initialReason = 'Przeniesiono do brudnopisu po dyskusji: ' + DelReqHandler.reason;
			moveToSandboxGadget.open( function(status) {
				if(status)
				{
				DelReqHandler.pages_to_process.push(moveToSandboxGadget.moveDestination);
				DelReqHandler.nextTask();
				}
				else
				{
				DelReqHandler.fail('Anulowano przenosiny');
				}
			}, DelReqHandler.reason);
		});
	},
	
	makeRedirect : function ()
	{
		this.page_processed = this.pages_to_process.shift();//TODO: wszystkie strony z jednego zgłoszenia
		
		this.updateProgress('Zamieniam stronę '+this.page_processed+' na przekierowanie');
		
		this.api.postWithEditToken({action: 'edit', title: this.page_processed, summary: 'Zamiana na przekierowanie po dyskusji w '+this.reason, text: '#PATRZ [['+DelReqHandler.inputfield+']]'})
		.fail(function(code, error){
			return DelReqHandler.apiFail( code, error, "makeRedirect" );
		})
		.done(function(data){
			DelReqHandler.nextTask();
		});
	},

	removeTemplate : function()
	{
		if (this.pages_to_process.length == 0)
		{
			this.nextTask();
			return;
		}

		this.page_processed = this.pages_to_process.shift();
		this.updateProgress('Usuwam szablon {{DNU}} ze strony „' + this.page_processed + '”');
		
		var that = this;

		this.api.edit(
		    this.page_processed,
		    function ( revision ) {
		    	var text = revision.content;
		    	
		    	var start = text.indexOf ('\{\{DNU');
				if (start < 0) start = text.indexOf ('\{\{dNU');
				if (start < 0) start = text.indexOf ('\{\{poczSDU');
				if (start < 0) start = text.indexOf ('\{\{PoczSDU');
				if (start < 0) start = text.indexOf ('\{\{PoczSdU');
				if (start < 0) start = text.indexOf ('\{\{poczSdU');
				if (start >= 0) {
					var level = 0;
					var curr = start + 2;
					var end = 0;
					while (curr < text.length && end == 0) {
						var opening = text.indexOf ('\{\{', curr);
						var closing = text.indexOf ('\}\}', curr);
						if (opening >= 0 && opening < closing) {
							level = level + 1;
							curr = opening + 2;
						} else {
							if (closing < 0) {
								// No closing braces found
								curr = text.length;
							} else {
								if (level > 0) level = level - 1;
								else end = closing + 2;
								curr = closing + 2;
							}
						}
					}
					if (end > start) {
						// Also strip whitespace after the "delete" template
						if (start > 0) {
							//text = text.substring (0, start)
							//       + text.substring (end).replace(/^\s*/, '');
		
							var beginning = text.substring(0,start);
							var ending = text.substring(end);
		
							//strip <noinclude>, if the template is the only thing in it
							if (beginning.search(/<noinclude>\s*$/) >= 0
							&& ending.search(/^\s*<\/noinclude>/) >= 0)
							{
								beginning = beginning.replace(/<noinclude>\s*$/, '');
								ending = ending.replace(/^\s*<\/noinclude>/, '');
							}
							else
								ending = ending.replace('^\\s*', '');
							text = beginning + ending;
						} else {
							text = text.substring (end).replace(/^\s*/, '');
						}

						var success = true;
					} else {
						that.addWarning ('Nie znaleziono zamknięcia szablonu na stronie ' + that.page_processed + '.');
					}
				} else {
					that.addWarning ('Nie znaleziono szablonu DNU na stronie ' + that.page_processed + '.');
				}
				
				return {
		            text: text,
		            summary: that.keep_summary
		        };
		    }
		)
		.fail(function(code, error){
			return DelReqHandler.apiFail( code, error, "removeTemplate" );
		})
		.then( function () {
			try {
		    that.addKeepToTalk();
			}
			catch (e) {
				return DelReqHandler.fail(e);
			}
		} );
	},

	addKeepToTalk : function ()
	{
		var talk_title = this.findTalkPage(this.page_processed);
		var text;
		var that = this;

		this.updateProgress('Dodaję szablon {{DNU}} na stronie dyskusji „' + talk_title + '”.');
		
		try {
			text = '\{\{DNU|' + this.template_param + '|zakończenie='
			+ this.formatDate('YYYY-MM-DD');
			text = text + '|podstrona=' + this.subpage + '\}\}\n';
			var success = true;
		} catch (ex) {
			// Swallow
		}
		if (!success) {
			// Huh? Somehow, we couldn't get the date.
			text = '\{\{DNU|' + this.template_param + '|podstrona=' + this.subpage + '\}\}\n';
		}
		
		this.api.postWithEditToken({action: 'edit', title: talk_title, prependtext: text, summary: this.keep_summary})
		.fail(function(code, error){
			return DelReqHandler.apiFail( code, error, "addKeepToTalk" );
		})
		.then( function () {
			try {
		    that.removeTemplate();
			}
		    catch (e) {
				return DelReqHandler.fail(e);
			}
		} );
	},

	//Find the parent page
	//For example if page_name is Wikipedia:DNU/artykuły/zgłoszenie
	//and deletion_request_pages=['Wikipedia:DNU/artykuły', 'Wikipedia:DNU/techniczne']
	//the function should return 'Wikipedia:DNU/artykuły'
	findParentPage : function(page_name)
	{
		var result;
		var subpage = page_name.replace(/ /g, '_');
		for (var i = 0; i < this.deletion_request_pages.length; i++)
		{
			var page = this.deletion_request_pages[i];
			if (subpage.indexOf(page) == 0)
				if (result == null || page.length > result.length)
					result = page;
		}
		return result;
	},

	findTalkPage : function (title) {
		var t = new mw.Title(title);
		return t.getTalkPage().getPrefixedText();
	},

	no_result : false, //says whether 'brak wyniku' should be used as a param of DNU template

	//name of the parent page of a request (i.e. the page where it is (hopefully) included)
	//name of the temorary archive page
	archive_page : '',
	//the subpage which is being moved to archive

	//Moves the given subpage to a temporary archive
	//The archive should be at a page titled like the one with the deletion requests
	//  ended with " załatwione 24".
	//and contain the text spcifed in archive_section_line
	addSubpageToArchive : function()
	{
		this.updateProgress('Dodaję podstronę do archiwum 24...');

		this.parent_page = this.findParentPage(this.subpage);
		this.archive_page = this.parent_page + ' załatwione 24';
		
		const that = this;

		let subpage = that.subpage;
		//if it's possible - strip the prefix
		if (subpage.includes(DelReqHandler.archivePageName)) {
			subpage = subpage.substr(DelReqHandler.archivePageName.length);
		}
		subpage = '{{' + subpage + '}}';

		this.api.edit(
		    this.archive_page,
		    function ( revision ) {
		    	var text = revision.content;
				
				// skip duplicate entries, crucial for multi-article del-requests.
				if (text.includes(subpage)) {
					return text;
				}

				// add after archive_section_line (marker)
				if (text.includes(DelReqHandler.archive_section_line)) {
					text = text.replace(
						   DelReqHandler.archive_section_line,
						   DelReqHandler.archive_section_line + '\n' + subpage
					);
				} else {
					//no archive line - just append
					//do not add an extra line break if the current text ends with one
					text =
					    text
					    + (text[text.length-1] == '\n' ? '' : '\n')
					    + subpage;
				}
		        return {
		            text: text,
		            summary: '+ {{[[' + that.subpage + ']]}}'
		        };
		    }
		)
		.fail(function(code, error){
			return DelReqHandler.apiFail( code, error, "addSubpageToArchive" );
		})
		.then( function () {
		    that.nextTask();
		} );
	},

	/** Moves the given subpage to the Reanimation project. */
	addSubpageToReanimation : function()
	{
		this.updateProgress('Dodaję podstronę do stolika reanimacja...');

		this.parent_page = this.findParentPage(this.subpage);
		this.to_page = 'Wikipedia:Poczekalnia/reanimacja';
		
		var that = this;
		
		this.api.edit(
		    this.to_page,
		    function ( revision ) {
		    	var subpage = that.subpage;
		    	var text = revision.content;

				subpage = '{{' + subpage + '}}';
		
				if (text.indexOf(DelReqHandler.reanimation_section_line) >= 0)
					text = text.replace(
						DelReqHandler.reanimation_section_line,
						DelReqHandler.reanimation_section_line + '\n' + subpage
					);
				else
					//no reanimation line - just append
					//do not add an extra line break if the current text ends with one
					text =
					    text
					    + (text[text.length-1] == '\n' ? '' : '\n')
					    + subpage;

		        return {
		            text: text,
		            summary: '+ {{[[' + that.subpage + ']]}}'
		        };
		    }
		)
		.fail(function(code, error){
			return DelReqHandler.apiFail( code, error, "addSubpageToReanimation" );
		})
		.then( function () {
		    that.nextTask();
		} );
	},

	//removes a subpage inclusion from the main request page
	removeSubpage : function()
	{
		this.updateProgress();
		var that = this;

		this.api.edit(
		    this.parent_page,
		    function ( revision ) {
		    	var text = revision.content;

				//find the subpage inclusion
				var searched = "{{" + that.subpage + "}}\n";
				var idx = text.indexOf(searched);

				if (idx < 0)
				{
					//not found - try with spaces instead of underscores
					searched = searched.replace(/_/g, ' ');
					idx = text.indexOf(searched);
					if (idx < 0)
					{
						//not found - but the inclusion may still look like {{/subpage}}
						if (that.subpage.indexOf(that.subpage) == 0)
						{
							searched = that.subpage.substr(that.parent_page.length);
							searched = "{{" + searched + "}}\n";
							idx = text.indexOf(searched);
		
							if (idx < 0)
							{
								//not found - try with spaces instead of underscores
								searched = searched.replace('_', ' ');
								idx = text.indexOf(searched);
							}
						}
					}
				}
				if (idx >= 0)
				{
					//inclusion found - cut it out
					text = text.substr(0, idx) + text.substr(idx + searched.length);
				}
				
				return {
		            text: text,
		            summary: '- {{[[' + that.subpage + ']]}}'
	        	};
		    }
		)
		.fail(function(code, error){
			// return DelReqHandler.apiFail( code, error, "removeSubpage" );
			alert('Usuwanie podstrony nie udało się (być może nastąpił konflikt). '
				+'\n Usuń potem ręcznie: {{' + that.subpage + '}} '
				+'\n na stronie: ' + this.parent_page
				+'\n\nPozostałe operacje będą kontyunowane.'
			);
			console.error('[dnu]', '[removeSubpage]', code, error);
		    that.nextTask();
		})
		.then( function () {
		    that.nextTask();
		} );
	},

	/*
	* This function will pre-fill the form when closing a request.
	* User must be editting and fakeaction must be set.
	*/
	maybeSetupForm : function()
	{
		var param = mw.util.getParamValue ('fakeaction');
		if (param == null)
			return;

		var summary = null;
		var result_param = null;
		
		switch(param)
		{
			case DelReqHandler.fakeaction_close_del:
				summary = DelReqHandler.close_del_summary;
				result_param = 'usunięto';
			break;
			
			case DelReqHandler.fakeaction_close_keep:
				summary = DelReqHandler.close_keep_summary;
				result_param = 'zostawiono';
			break;
			
			case DelReqHandler.fakeaction_close_no_result:
				summary = DelReqHandler.close_no_result_summary;
				result_param = 'brak wyniku';
			break;
			
			case DelReqHandler.fakeaction_close_repaired:
				summary = DelReqHandler.close_repaired_summary;
				result_param = 'naprawiono';
			break;
			
			case DelReqHandler.fakeaction_close_eject:
				summary = DelReqHandler.close_eject_summary;
				result_param = 'wycofano';
			break;
			
			case 'close_draft':
				summary = DelReqHandler.close_draft_summary;
				result_param = 'zostawiono';//dodać do lnDNU
			break;
			
			case 'close_redir':
				summary = DelReqHandler.close_redir_summary;
				result_param = 'zostawiono';//dodać do lnDNU
			break;

			case DelReqHandler.fakeaction_move_reanimation:
				//summary = DelReqHandler.close_move2repair_summary;
				result_param = 'reanimacja';
			break;

		}
		
		var $summary = $('#wpSummary');
		let getMobileArea = () => document.querySelector('#wikitext-editor');
		let textbox = document.editform && document.editform.wpTextbox1 ? document.editform.wpTextbox1 : getMobileArea();

		// jeśli nie ma, to zakładamy, że musimy poczekać na mobilny edytor
		if (!textbox) {
			var interval = 200, limit = 40, overlimit = function() {
				console.error('[dnu] textbox is undefined, auto-close summary not possible');
				alert(JSON.stringify(summary, result_param));
			};
			waitForCondition(getMobileArea, () => {
				let textbox = document.querySelector('#wikitext-editor');
				this.setupForm($summary, textbox, summary, result_param);
			}, interval, limit, overlimit);
			return;
		}

		this.setupForm($summary, textbox, summary, result_param);
	},
	/** Do actual setup of the edit textbox (when closing). */
	setupForm: function($summary, textbox, summary, result_param) {

		if (summary !== null && result_param !== null) {
			$summary.val(summary);
			
			// Note: The period should follow the bold text, so mobile keyboards switch to sentence-begin mode (capitalize the first letter).
			let text = textbox.value + '\n----\n\'\'\'' + summary.replace(/\.$/, '') + '\'\'\'.  \~\~\~\~';
			text = text.replace(/(\{\{lnDNU)\|rezultat=[^\|]+\|data zakończenia=[^\|]+/g, '$1');
			text = text.replace(/(\{\{lnDNU)/gi, '$1|rezultat=' + result_param + '|data zakończenia=' + this.formatDate("YYYY-MM-DD"));
			textbox.value = text;	

			// Don't close the window so the user can add a comment.
			if (text.scrollHeight > text.clientHeight) {
				text.scrollTop = text.scrollHeight - text.clientHeight;
			}
			textbox.focus();
		} else if (result_param === 'reanimacja') {
			$summary.val(DelReqHandler.close_move2repair_summary);
			
			let text = textbox.value + '\n</div>\n\n\'\'\'Do naprawy:\'\'\'\n\* ...\n\* ...\n\~\~\~\~';
			text = text.replace(/(\}\})(\n+[^\n:])/, '$1\n\n{{licznik czasu|zdarzenie=Czas przewidziany na reanimację|start={{subst:#timel:Y-m-d H:i:s}}|dni=60}}\n\n<div style="padding:20px; background:#dee; border:1px solid #aaa;">\n$2');
			textbox.value = text;	

			// Don't close the window so the user can add a comment.
			if (text.scrollHeight > text.clientHeight) {
				text.scrollTop = text.scrollHeight - text.clientHeight;
			}
			textbox.focus();
		}
	},

	deletePages : function()
	{
		if (this.pages_to_process.length == 0)
		{
			this.nextTask();
			return;
		}

		this.page_processed = this.pages_to_process.shift();

		this.updateProgress('Usuwam stronę ' + this.page_processed + '...');

		this.deletePage(this.page_processed, 'Usunięto po dyskusji: ' + this.reason, 'deleteTalkPage', true);
	},

	deleteTalkPage : function()
	{
		var talk_title = this.findTalkPage(this.page_processed);

		this.updateProgress('Usuwam stronę dyskusji ' + talk_title + '...');

		this.deletePage(talk_title, 'Strona dyskusji artykułu usuniętego po dyskusji: ' + this.reason, 'deletePages', false);
	},


	openSubpageForEdit : function()
	{
		this.updateProgress('Otwieram podstronę zgłoszenia do edycji...');
		if(!window.DelReqPopup)
		{
			//user preferences - open edit in the same window
			location.href = this.close_href;
		}
		else
		{
			window.open(this.close_href, '_blank');
			this.windowManager.closeWindow( this.progressDialog );
			document.body.style.cursor = '';
		}
		this.nextTask();
	},

	/**
	* Once we're all done, reload the page.
	* force - if true, the page will be reloaded no matter user preferences
	**/
	reloadPage : function (force) {
		if (!force && (!window.DelReqPopup || window.DelReqDontReload))
			//user preferences - don't reload when finished
			return;

		if (this.there_are_warnings === true)
		{
			//there were warnings - give the user 3 more seconds to read them
			window.setTimeout(function() {
				DelReqHandler.reloadPage();
			}, 3000);
			this.there_are_warnings = false;
			return;
		}

		//reload
		var title = encodeURIComponent(this.destination || this.current_pagename).
			    replace(/\%3A/g, ':').replace(/\%20/g, '_').
			    replace(/\(/g, '%28').replace(/\)/g, '%29').
			    replace(/\%2F/g, '/');
		location.href = mw.config.get('wgServer') + mw.config.get('wgArticlePath').replace("$1", title);
	},

	deletePage : function (page, reason, callback, must_exists)
	{
		var that = this;
		
		this.api.postWithEditToken({action: 'delete', title: page, reason: reason})
		.fail(function(code, error){
			if(code != 'missingtitle' || must_exists)
				return DelReqHandler.fail("Błąd usuwania strony \""+page+"\":<br />" + error.error.info + "<br />Error code is " + code + ", function: deletePage");
			else
				that[callback]();
		})
		.done(function(data){
			that[callback]();
		});
	},
	
	/**
	* Simple task queue.  addTask() adds a new task to the queue, nextTask() executes
	* the next scheduled task.  Tasks are specified as method names to call.
	**/
	tasks : [],  // list of pending tasks
	currentTask : '',  // current task, for error reporting
	addTask : function ( task ) {
		this.tasks.push( task );
	},
	nextTask : function () {
		var task = this.currentTask = this.tasks.shift();
		try {
			this[task]();
		}
		catch (e) {
			this.fail(e);
		}
	},

	/**
	* For display of progress messages.
	**/
	showProgress : function () {
		document.body.style.cursor = 'wait';

		function MyDialog( config ) {
			MyDialog.super.call( this, config );
		}
		OO.inheritClass( MyDialog, OO.ui.Dialog ); 
		
		MyDialog.static.name = 'myDialog';
		MyDialog.static.title = 'Trwa wykonywanie...';
		
		MyDialog.prototype.initialize = function () {
			MyDialog.super.prototype.initialize.call( this );
			this.content = new OO.ui.PanelLayout( { 
				padded: true,
				expanded: false 
			} );
			this.content.$element.append( '<div><div id="feedbackContainer">Szykuję się do edytowania...</div><div id="ajax-delete-warnings></div></div>' );
			this.$body.append( this.content.$element );
		};
		
		MyDialog.prototype.getBodyHeight = function () {
			return this.content.$element.outerHeight( true );
		};
		
		this.progressDialog = new MyDialog( {
			size: 'medium'
		} );
		
		this.windowManager = new OO.ui.WindowManager();
		$( document.body ).append( this.windowManager.$element );
		
		// Add the window to the window manager using the addWindows() method.
		this.windowManager.addWindows( [ this.progressDialog ] );
		
		this.windowManager.openWindow( this.progressDialog );

		this.nextTask();
	},

	updateProgress : function (message) {
		$('#feedbackContainer').html(message);
	},

	/**
	 * Common API fail handler.
	 * @param {String} code 
	 * @param {Object} errorData API response indicating an error (or an exception result).
	 */
	apiFail : function ( code, errorData, functionName ) {
		console.error('[dnu] API fail:', code, errorData, functionName);
		const codeInfo = typeof code === 'string' || typeof code === 'number' ? code : JSON.stringify(code);
		// const errorInfo =  typeof errorData === 'object' ? this.api.getErrorMessage( errorData ) : JSON.stringify(errorData);
		let errorInfo;
		try{
			errorInfo = JSON.stringify(errorData);
		} catch(e) {
			errorInfo = 'unable to stringify errorData of type: ' + (typeof errorData);
		}		
		return this.fail("API request returned error: " + errorInfo + "; Error code is: " + codeInfo + "; Function: " + functionName);
	},

	/**
      * Crude error handler. Just throws an alert at the user and (if we managed to
      * add the {delete} tag) reloads the page.
      **/
	fail : function ( err ) {
		var that = this;
		document.body.style.cursor = 'default';
		var msg = this.i18n.taskFailure[this.currentTask] || this.i18n.genericFailure;
		var fix = '';//(this.templateAdded ? this.i18n.completeRequestByHand : this.i18n.addTemplateByHand );

		$('#feedbackContainer').html(msg + " " + fix + "<br>" + this.i18n.errorDetails + "<hr>" + mw.html.escape(err) + "<hr><a id=\"feedbackContainerfeedback\" href=\"" + mw.config.get('wgServer') + "/wiki/Dyskusja MediaWiki:Gadget-DelReqHandler.js\">" + this.i18n.errorReport +"</a>");
		$('#feedbackContainer').addClass('ajaxDeleteError');
		this.progressDialog.$body.resize();
		
		$('#feedbackContainerfeedback').click(function(e){
			e.preventDefault();
			
			mw.loader.using('mediawiki.feedback', function(){
				var feedback = new mw.Feedback({
					bugsLink: mw.config.get('wgServer') + "/wiki/Dyskusja MediaWiki:Gadget-DelReqHandler.js",
					title: new mw.Title("Dyskusja MediaWiki:Gadget-DelReqHandler.js")
				});
				var user = mw.config.get('wgUserName');
				var date = new Date().toISOString().substring(0,10);
				feedback.launch({
					subject: 'Problem - ' + date + ' - ' + user,
					message: 'Wyświetla mi błąd podczas usuwania "'+that.page_processed+'" na "'+that.subpage+'"\n<pre>'+err+'</pre>'
				});
			});
		});

		// Allow some time to read the message
		if (this.templateAdded) setTimeout(function() {
			this.reloadPage(true);
		}, 5000);
	},

	there_are_warnings : false,
	addWarning : function(msg)
	{
		$('#ajax-delete-warnings').append('<p><b>UWAGA!</b> ' + msg + '</p>');
		this.there_are_warnings = true;
	},

	/**
	* Very simple date formatter.  Replaces the substrings "YYYY", "MM" and "DD" in a
	* given string with the UTC year, month and day numbers respectively.  Also
	* replaces "MON" with the English full month name and "DAY" with the unpadded day.
	**/
	formatDate : function ( fmt, date ) {
		var pad0 = function ( s ) {
			s = "" + s;
			return (s.length > 1 ? s : "0" + s);
		};  // zero-pad to two digits
		if (!date) date = this.startDate;
		if (!date) date = new Date();
		fmt = fmt.replace( /YYYY/g, date.getUTCFullYear() );
		fmt = fmt.replace( /MM/g, pad0( date.getUTCMonth()+1 ) );
		fmt = fmt.replace( /DD/g, pad0( date.getUTCDate() ) );
		fmt = fmt.replace( /MON/g, this.months[ date.getUTCMonth() ] );
		fmt = fmt.replace( /DAY/g, date.getUTCDate() );
		return fmt;
	},
	months : "styczeń luty marzec kwiecień maj czerwiec lipiec sierpień wrzesień październik listopad grudzień".split(" "),

	i18n : {
		// Errors
		preparingToEdit       : "Szykuję się do edytowania... ",
		genericFailure        : "Wystąpił błąd.",
		taskFailure : {
		},
		errorDetails          : "Szczegółowy opis błędu:",
		errorReport           : "Prześlij zgłoszenie"
	}

}; // End of DelReqHandler

DelReqHandler.beginLoading();

/** Wait for condition (see: pendingChangesHelper). */
function waitForCondition(condition, callback, interval, limit, overlimit) {
	if (condition()) {
		callback();
	} else {
		if (typeof interval !== 'number') {
			interval = 200;
		}
		if (typeof limit !== 'number') {
			limit = false;
		}
		let intervalId = setInterval(function() {
			// console.log('waiting...');
			if (condition()) {
				//console.log('done');
				clearInterval(intervalId);
				callback();
			}
			if (limit !== false) {
				limit--;
				if (limit <= 0) {
					clearInterval(intervalId);
					if (typeof overlimit === 'function') {
						overlimit();
					}
				}
			}
		}, interval);
	}
}

})
// </nowiki>
