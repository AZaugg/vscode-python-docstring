import * as vscode from 'vscode';
import * as indentString from 'indent-string';

export class paramDeclaration {
		constructor(public paramName) {
			this.paramName = paramName;
		}
	}
	
export function getParameterText(paramList: paramDeclaration[], padding: string, docstyle: string, ignoreParameters: string[]): string {
	var textToInsert: string = "";
	textToInsert = textToInsert + '"""';
	const paramsNeedDeclaration = paramList.filter(element => ignoreParameters.indexOf(element.paramName) === -1)

	if (docstyle == 'google') {
		textToInsert = textToInsert + '\ndocstring here\n';
		paramsNeedDeclaration.forEach(element => {
			if (element.paramName != '') {
				textToInsert = textToInsert + padding + ':param ';
				textToInsert = textToInsert + element.paramName + ': \n';
			}
		});
	}
	else if (docstyle == 'numpy') {
        textToInsert = textToInsert + 'Set docstring here.\n';
		textToInsert = textToInsert + '\nParameters';
		textToInsert = textToInsert + '\n----------\n';
		paramsNeedDeclaration.forEach(element => {
			if (element.paramName != '') {
				textToInsert = textToInsert + element.paramName + ': \n';
			}
		});
        textToInsert = textToInsert + '\nReturns\n';
        textToInsert = textToInsert + '-------\n\n';
	}
	textToInsert = textToInsert + '"""';

	return textToInsert;
}

//Assumes that the string passed in starts with ( and continues to ) and does not contain any comments or white space
export function getParameters(text: string): paramDeclaration[] {
	var paramList: paramDeclaration[] = [];
	//Start by looking for the function name declaration
	var index = 0;
	text = text.replace(/\s/g, '');
	//Now we are at the first non whitespace character
	//if it is not a '(' then this is not a valid function declaration
	if (text.charAt(index) == '(') {
		//count the number of matching opening and closing braces. Keep parsing until 0
		var numBraces = 1;
		index++;
		while ((numBraces != 0) && (index != text.length)) {
					
			//Now we are at a non whitespace character. Assume it is the parameter name
			var name: string = '';
			//while ((text.charAt(index) != ':') && (text.charAt(index) != ',') && (text.charAt(index) != ')') && (index < text.length)) {
			while ((text.charAt(index) != ',') && (text.charAt(index) != ')') && (index < text.length)) {
				name = name + text.charAt(index);
				index++;
			}
			if (index < text.length) {		
				//Now we are at a : or a ',', skip then read until a , to get the param type
				var type: string = '';
				//we have a type to process
				if (text.charAt(index) == '(') {
					var startNumBraces = numBraces;
					numBraces++;
					type = type + text.charAt(index);
					index++;
					//we have encountered a function type
					//read all the way through until the numBraces = startNumBraces
					while ((numBraces != startNumBraces) && (index < text.length)) {
						if (text.charAt(index) == ')') {
							numBraces--;
						}
						else if (text.charAt(index) == '(') {
							numBraces++;
						}
						type = type + text.charAt(index);
						index++;
					}
					if (index < text.length) {
						//Now read up to either a , or a )
						while ((text.charAt(index) != ',') && (text.charAt(index) != ')')) {
							type = type + text.charAt(index);
							index++;
						}
						if (text.charAt(index) == ')') {
							numBraces--;
						}
					}
				}
				else {
					while ((text.charAt(index) != ',') && (text.charAt(index) != ')') && (index != text.length)) {
						type = type + text.charAt(index);
						index++;
					}
					if (text.charAt(index) == ')') {
						numBraces--;
					}
				}
				paramList.push(new paramDeclaration(name));
				if (index < text.length) {
					index++;
				}
			}
		}

	}

	return paramList;
}

export function activate(ctx:vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "vscode-python-docstring" is now active!');

	vscode.commands.registerCommand('extension.addPyDocstring', () => {

		var lang = vscode.window.activeTextEditor.document.languageId;
		if ((lang == "python" )) {
			var selection = vscode.window.activeTextEditor.selection;
			var startLine = selection.start.line - 1;
			var selectedText = vscode.window.activeTextEditor.document.getText(selection);
			var outputMessage: string = 'Please select a TypeScript or JavaScript function signature'
			
			if (selectedText.length === 0) {
				vscode.window.showInformationMessage(outputMessage);
				return;
			}
			
			var firstBraceIndex = selectedText.indexOf('(');
			selectedText = selectedText.slice(firstBraceIndex);
			var params: paramDeclaration[] = getParameters(selectedText);

			if (params.length > 0) {
				var docstyle: string = vscode.workspace.getConfiguration().pydocs.style;
				var ignoreParameters: string[] = vscode.workspace.getConfiguration().pydocs.ignoreParameters;
				var spaces_enabled: boolean = vscode.window.activeTextEditor.options.insertSpaces;
				var tabSize : number = vscode.window.activeTextEditor.options.tabSize;
				var padding: string = ''
				if ( spaces_enabled == true ){
					padding = Array(tabSize +1).join(' ');
				}
				else {
					padding = '\t';
				}
				var textToInsert = getParameterText(params, padding, docstyle, ignoreParameters);
				vscode.window.activeTextEditor.edit((editBuilder: vscode.TextEditorEdit) => {

					var pos:vscode.Position;
					pos = new vscode.Position(startLine+2, 5); 
					var line:string = vscode.window.activeTextEditor.document.lineAt(selection.start.line).text;
					var firstNonWhiteSpace :number = vscode.window.activeTextEditor.document.lineAt(selection.start.line).firstNonWhitespaceCharacterIndex;
					var stringToIndent: string = '';


					for (var i = 0; i < firstNonWhiteSpace; i++) {
						if (line.charAt(i) == '\t') {
							stringToIndent = stringToIndent + '\t';
						}
						else if (line.charAt(i) == ' ') {
							stringToIndent = stringToIndent + ' ';
						}
					}
					stringToIndent = padding + stringToIndent;
					textToInsert = indentString(textToInsert, stringToIndent, 1);
					editBuilder.insert(pos, textToInsert);

				}).then(() => {
					
				});
			}
		}
	});
}
