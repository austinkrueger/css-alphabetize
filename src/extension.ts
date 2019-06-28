import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    'extension.CSSAlphabetize',
    () => {
      const activeEditor = vscode.window.activeTextEditor;
      const extensions: string[] = ['css']; // add scss, less, sass later!
      if (activeEditor) {
        const openDoc: vscode.TextDocument = activeEditor.document;
        if (!extensions.includes(openDoc.languageId)) {
          vscode.window.showErrorMessage(
            'Please run this command within a CSS file.'
          );
        } else {
          if (!activeEditor.selection.isSingleLine) {
            // grab selection from editor
            const selection = activeEditor.selection;
            // run it through the alphabetize method
            const output = alphabetizeCSS(openDoc, selection);
            // replace selected text with alphabetized text
            activeEditor.edit(builder => builder.replace(selection, output));
            // save that file!
            openDoc
              .save()
              .then(() =>
                vscode.window.showInformationMessage(
                  'Your CSS has just been alphabetized!'
                )
              );
          } else {
            // create selection of entire page
            const eof = openDoc.lineCount - 1;
            const selection = new vscode.Selection(
              0,
              0,
              eof,
              openDoc.lineAt(eof).text.length
            );
            // run new selection through alphabetize method
            const output = alphabetizeCSS(openDoc, selection);
            // replace selected text with alphabetized text
            activeEditor.edit(builder => builder.replace(selection, output));
            // save that file!
            openDoc
              .save()
              .then(() =>
                vscode.window.showInformationMessage(
                  'Your CSS has just been alphabetized!'
                )
              );
          }
        }
      }
    }
  );
  context.subscriptions.push(disposable);
}

export function deactivate() {}

export function alphabetizeCSS(openDoc: any, selection: any): string {
  const start_line = selection.start.line;
  const end_line = selection.end.line;
  const set_list: any[] = [];
  let set_count = 0;
  for (let i = start_line; i < end_line + 1; i++) {
    const curr_line = openDoc.lineAt(i);
    if (curr_line.text.includes('{')) {
      const rule_set: any = {
        start: '',
        end: '',
        rules: {}
      };
      rule_set['start'] = curr_line.text;
      set_list.push(rule_set);
    } else if (curr_line.text.includes('}')) {
      set_list[set_count]['end'] = curr_line.text;
      set_count += 1;
    } else if (curr_line.text.trim().length === 0) {
      continue;
    } else {
      if (set_list.length === 0) {
        const rule_set: any = {
          start: '',
          end: '',
          rules: {}
        };
        set_list.push(rule_set);
      }
      const split_line = curr_line.text.split(':');
      set_list[set_count]['rules'][split_line[0].trim()] = [
        split_line[1].trim()
      ];
    }
  }
  let output_str = '';
  set_list.forEach(rule_set => {
    if (rule_set['start'] !== '') {
      output_str += `${rule_set['start']}\n`;
    }
    const rulekeys = Object.getOwnPropertyNames(rule_set['rules']);
    rulekeys.sort();
    rulekeys.forEach(key => {
      output_str += `\t${key}: ${rule_set['rules'][key]}\n`;
    });
    if (rule_set['end'] !== '') {
      output_str += `${rule_set['end']}\n\n`;
    }
  });

  return output_str;
}
