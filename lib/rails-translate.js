'use babel';

import RailsTranslateView from './rails-translate-view';
import { CompositeDisposable } from 'atom';

export default {

  railsTranslateView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.railsTranslateView = new RailsTranslateView(state.railsTranslateViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.railsTranslateView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'rails-translate:translate': () => this.translate()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.railsTranslateView.destroy();
  },

  serialize() {
    return {
      railsTranslateViewState: this.railsTranslateView.serialize()
    };
  },

  toggle() {
    return (
      this.modalPanel.isVisible() ?
      this.modalPanel.hide() :
      this.modalPanel.show()
    );
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
