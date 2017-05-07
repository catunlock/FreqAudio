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

        this.sampleRatesMenu = new PopupMenu.PopupSubMenuMenuItem('Sample Rates', false);
        this.menu.addMenuItem (this.sampleRatesMenu);

        let rates = ["44100", "48000", "96000", "192000"];
        for each (let rate in rates) {
           let rateMenu = new PopupMenu.PopupMenuItem(rate + " Hz");
           this.sampleRatesMenu.menu.addMenuItem(rateMenu);

           rateMenu.connect ('activate', Lang.bind (this, function () {
                //this._change_sample_rate(rate+"sdf");    
                this.sampleRatesMenu.label.set_text("Sample Rate: " + rate + " Hz" );
                }
            )
            );
        }

        /*
        let sample1 = new PopupMenu.PopupMenuItem ('44100 Hz');
        let sample2 = new PopupMenu.PopupMenuItem ('48000 Hz');
        let sample3 = new PopupMenu.PopupMenuItem ('96000 Hz');
        let sample4 = new PopupMenu.PopupMenuItem ('192000 Hz');
        this.sampleRatesMenu.menu.addMenuItem (sample1);
        this.sampleRatesMenu.menu.addMenuItem (sample2);
        this.sampleRatesMenu.menu.addMenuItem (sample3);
        this.sampleRatesMenu.menu.addMenuItem (sample4);

        sample1.connect ('activate', Lang.bind (this, function () {
            this._change_sample_rate("44100");    
        }));

        sample2.connect ('activate', Lang.bind (this, function () {
            this._change_sample_rate("48000");    
        }));

        sample3.connect ('activate', Lang.bind (this, function () {
            this._change_sample_rate("96000");    
        }));

        sample4.connect ('activate', Lang.bind (this, function () {
            this._change_sample_rate("192000");    
        }));

        */
    },

    _change_sample_rate: function(rate) {
        // This works!!
        this.sampleRatesMenu.label.set_text("Sample Rate: " + rate + " Hz" );
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
