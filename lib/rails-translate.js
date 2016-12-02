'use babel';

import { CompositeDisposable } from 'atom';

export default {
  subscriptions: null,

  activate(state) {
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'rails-translate:translate': () => this.translate()
    }));
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  translate() {
    var editor = atom.workspace.getActiveTextEditor();
    var selection = editor.getSelectedText();
    var key = selection.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s/g, '_')
    var scopes = editor.cursors[0].getScopeDescriptor().scopes;
    var range = editor.getSelectedBufferRange();
    if (scopes.includes('meta.embedded.line.erb')) {
        range.start.column = range.start.column - 1;
        range.end.column = range.end.column + 1;
        editor.setSelectedBufferRange(range);
        editor.insertText("t('"+key+"')");
    }
    else if (scopes.includes('string.quoted.single.ruby')) {
        range.start.column = range.start.column - 1;
        range.end.column = range.end.column + 1;
        editor.setSelectedBufferRange(range);
        editor.insertText("I18n.t('"+key+"')");
    } else {
        editor.insertText("<%= t '"+key+"' %>");
    }
    atom.clipboard.write(key + ": " + selection);
  }
};
