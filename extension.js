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
const ExtensionUtils = imports.misc.extensionUtils;
const ExtensionSystem = imports.ui.extensionSystem;
const Me = ExtensionUtils.getCurrentExtension ();
const EXTENSIONDIR = Me.dir.get_path ();
const PROPERTY_SAMPLE_RATE = "default-sample-rate"
const PROPERTY_FORMAT = "default-sample-format";
const PROPERTY_SAMPLER = "resample-method";
const CMD_STATUS = EXTENSIONDIR + "/getPulseStatus"
const CMD_GET_RESAMPLERS = "pulseaudio --dump-resample-methods"
const RATES = ["44100", "48000", "96000", "192000"];
const FORMAT = ["u8", "s16le", "s16be", "s24le", "s24be2", "s24-32le", "s24-32be2" ,"s32le", "s32be", "float32le", "float32be",
 "ulaw", "alaw"];

const FreqAudio = new Lang.Class({
    Name: 'FreqAudio',
    Extends: PanelMenu.Button,

    _init: function () {
        this.parent (0.0, "Freq change pulseaudio", false);   

        this.statusLabel = new St.Label ({text: "FreqAudio", y_expand: true, y_align: Clutter.ActorAlign.CENTER});
        let _box = new St.BoxLayout();
        _box.add_actor(this.statusLabel);
        this.actor.add_actor(_box);

        this.sampleRatesMenu = new PopupMenu.PopupSubMenuMenuItem('Sample Rate (Hz)', false);
        this.menu.addMenuItem (this.sampleRatesMenu);

        for (let i = 0; i < RATES.length; i++) {
            let menuItem = new PopupMenu.PopupMenuItem (RATES[i]);
            this.sampleRatesMenu.menu.addMenuItem (menuItem);
             menuItem.connect ('activate', Lang.bind (this, function (object, event) {
                this._change_sample_rate(object.label.text);    
            }));
        }
        
        this.formatMenu = new PopupMenu.PopupSubMenuMenuItem('Format', false);
        this.menu.addMenuItem (this.formatMenu);

        for (let i = 0; i < FORMAT.length; i++) {
            let menuItem = new PopupMenu.PopupMenuItem (FORMAT[i]);
            this.formatMenu.menu.addMenuItem (menuItem);
             menuItem.connect ('activate', Lang.bind (this, function (object, event) {
                this._change_format(object.label.text);    
            }));
        }

        this.samplerMenu = new PopupMenu.PopupSubMenuMenuItem('Sampler', false);
        this.menu.addMenuItem (this.samplerMenu);

        let cmd_sampler = GLib.spawn_command_line_sync (CMD_GET_RESAMPLERS);
        let samplers_available = cmd_sampler[1].toString().split("\n");

        for (let i = 0; i < samplers_available.length; i++) {
            let menuItem = new PopupMenu.PopupMenuItem (samplers_available[i]);
            this.samplerMenu.menu.addMenuItem (menuItem);
            menuItem.connect ('activate', Lang.bind (this, function (object, event) {
                this._change_sampler(object.label.text);    
            }));
        }

        this.statusLabel = new St.Label();
        let cmd_status = GLib.spawn_command_line_sync (CMD_STATUS);
        this.statusLabel.set_text(cmd_status[1].toString());

        this.menuEstatus = new PopupMenu.PopupSubMenuMenuItem('Status');
		this.menuEstatus.menu.box.add(this.statusLabel);
        this.menu.addMenuItem (this.menuEstatus);
    },

    _change_sample_rate: function(rate) {
        // This works!!
        this.sampleRatesMenu.label.set_text("Sample Rate: " + rate + " Hz" );
        changer_output = GLib.spawn_command_line_sync (EXTENSIONDIR + "/genericChanger " + PROPERTY_SAMPLE_RATE+ " " + rate);
        if(! changer_output[0]) {
            this.sampleRatesMenu.label.set_text("Failed Setting Sample Rate.");
        }
    },

    _change_format: function(format) {
        this.formatMenu.label.set_text("Format: " + format);
        changer_output = GLib.spawn_command_line_sync (EXTENSIONDIR + "/genericChanger " + PROPERTY_FORMAT+ " " + format);
        if(! changer_output[0]) {
            this.formatMenu.label.set_text("Failed Setting Format.");
        }
    },

    _change_sampler: function(sampler) {
        this.samplerMenu.label.set_text("Sampler: " + sampler);
        changer_output = GLib.spawn_command_line_sync (EXTENSIONDIR + "/genericChanger " + PROPERTY_SAMPLER + " " + sampler);
        if(! changer_output[0]) {
            this.samplerMenu.label.set_text("Failed Setting Sampler.");
        }
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
