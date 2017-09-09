# vscode-python-docstrings
An inspired vscode extentions for creating python docstring on new functions/methods.

## Features:
 - Inspects function parameters and creates a params stub per param

## Usage:
- High light the entire function definition
- Bring up the command palette 
   - OSX: &#8984; + Shift + P
   - Windows: Ctrl + SHift + P
   - Linux: Ctrl + SHift + P
- Add Py Docstring

## Things to do
 - Setup keyboard shortcuts
 - Get return type
 - Clean up code
 - Update comments on change
 - Discover raised exceptions

## Known issues
 - If EOF is directly below a function definition, comments will fail to appear
 - If line underneeth a function definition is not empty you may yet badly formated docstring

## Mentions
Thanks to the guys at [Microsoft](ttps://github.com/Microsoft/vscode-comment) for providing working code that I could bastardise to get this working.
