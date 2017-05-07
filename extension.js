const St = imports.gi.St;
const Main = imports.ui.main;
const Lang = imports.lang;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Slider = imports.ui.slider;
const Clutter = imports.gi.Clutter;
const GLib = imports.gi.GLib;
const Gio = imports.gi.Gio;
const Util = imports.misc.util;
const Mainloop = imports.mainloop;

//let event = null;

const FreqAudio = new Lang.Class({
    Name: 'FreqAudio',
    Extends: PanelMenu.Button,

    _init: function () {
        this.parent (0.0, "Freq change pulseaudio", false);   

        this.statusLabel = new St.Label ({text: "FreqAudio", y_expand: true, y_align: Clutter.ActorAlign.CENTER});
        let _box = new St.BoxLayout();
        _box.add_actor(this.statusLabel);
        this.actor.add_actor(_box);

        this.activeg = new PopupMenu.PopupSubMenuMenuItem('Sample Rates', false);
        this.menu.addMenuItem (this.activeg);

        let sample1 = new PopupMenu.PopupMenuItem ('44100');
        this.activeg.menu.addMenuItem (sample1);

        sample1.connect ('activate', Lang.bind (this, function () {
            // This works!!
            this.activeg.label.set_text("44100");
        }));
    },

    _read_line: function (dis) {
        let line;
        try {
            dis.seek (0, GLib.SeekType.SET, null);
            [line,] = dis.read_line (null);
        } catch (e) {
            print ("Error: ", e.message);
            this._init_streams ();
        }
        return line;
    },

});


// LOAD PART
// =========


let freqAudio;

function init () {
}

function enable () {
  freqAudio = new FreqAudio;
  // addToStatusArea se refiere a que lo va a añadir a la parte del panel
  // donde esta el estado de las cosas, no en el desplegablel de la esquina.
  Main.panel.addToStatusArea('freqAudio', freqAudio);
}

function disable () {
  freqAudio.destroy();
  //Mainloop.source_remove(event);
  freqAudio = null;
}
