

CKEDITOR.editorConfig = function (config) {
    config.skin = 'moono-lisa';
    config.toolbarGroups = [
		{ name: 'document', groups: ['mode', 'document', 'doctools'] },
		{ name: 'clipboard', groups: ['clipboard', 'undo'] },
		{ name: 'editing', groups: ['find', 'selection', 'spellchecker', 'editing'] },
		{ name: 'forms', groups: ['forms'] },
		'/',
		{ name: 'basicstyles', groups: ['basicstyles', 'cleanup'] },
		{ name: 'paragraph', groups: ['list', 'indent', 'blocks', 'align', 'bidi', 'paragraph'] },
		{ name: 'links', groups: ['links'] },
		{ name: 'insert', groups: ['insert'] },
		{ name: 'styles', groups: ['styles'] },
		{ name: 'colors', groups: ['colors'] },
		{ name: 'tools', groups: ['tools'] },
		{ name: 'others', groups: ['others'] },
		{ name: 'about', groups: ['about'] }
	];

    config.removeButtons = 'Source,Save,NewPage,Preview,Print,Templates,Paste,PasteText,PasteFromWord,Undo,Redo,Find,Replace,SelectAll,Scayt,Cut,Copy,Form,Radio,Checkbox,TextField,Textarea,Select,Button,ImageButton,HiddenField,CopyFormatting,RemoveFormat,BidiLtr,JustifyLeft,Blockquote,CreateDiv,JustifyCenter,BidiRtl,Language,JustifyRight,JustifyBlock,Image,Flash,HorizontalRule,Smiley,PageBreak,Iframe,Anchor,Styles,Format,Font,FontSize,TextColor,BGColor,ShowBlocks,Maximize,SpecialChar,Strike,Subscript,Superscript,Underline';

    CKEDITOR.on('txtDescription', function (ev) {
        ev.editor.dataProcessor.writer.setRules('br',
         {
             indent: false,
             breakBeforeOpen: false,
             breakAfterOpen: false,
             breakBeforeClose: false,
             breakAfterClose: false
         });
    });

    config.enterMode = CKEDITOR.ENTER_BR;
    config.shiftEnterMode = CKEDITOR.ENTER_BR;

};

