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
const Gtk = imports.gi.Gtk;
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
        
        Gtk.IconTheme.get_default().append_search_path(Me.dir.get_child('icons').get_path());

		this.updateIcon = new St.Icon({icon_name: "freq", style_class: 'system-status-icon'});

        let _box = new St.BoxLayout();
        _box.add_actor(this.updateIcon);
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
        this.updateStatus();

        this.menuEstatus = new PopupMenu.PopupSubMenuMenuItem('Status');
		this.menuEstatus.menu.box.add(this.statusLabel);
        this.menu.addMenuItem (this.menuEstatus);


        // Checking the previous state
        let cmd_property_rate = GLib.spawn_command_line_sync (EXTENSIONDIR + "/getProperty " + PROPERTY_SAMPLE_RATE);
        if(cmd_property_rate[0]) {
            let str_property_rate = cmd_property_rate[1].toString().split("\n")[0];
            if (str_property_rate != "") {
                this.sampleRatesMenu.label.set_text("Sample Rate: " + str_property_rate + " Hz" );
            }
        }


        let cmd_property_format = GLib.spawn_command_line_sync (EXTENSIONDIR + "/getProperty " + PROPERTY_FORMAT);
        if(cmd_property_format[0]) {
            let str_property_format = cmd_property_format[1].toString().split("\n")[0];
            if (str_property_format != "") {
                this.formatMenu.label.set_text("Format: " + str_property_format);
            }
        }


        let cmd_property_sampler = GLib.spawn_command_line_sync (EXTENSIONDIR + "/getProperty " + PROPERTY_SAMPLER);
        if(cmd_property_sampler[0]) {
            let str_property_sampler = cmd_property_sampler[1].toString().split("\n")[0];
            if (str_property_sampler != "") {
                this.samplerMenu.label.set_text("Sampler: " + str_property_sampler);
            }
        }
    },

    _change_sample_rate: function(rate) {
        // This works!!
        this.sampleRatesMenu.label.set_text("Sample Rate: " + rate + " Hz" );
        changer_output = GLib.spawn_command_line_sync (EXTENSIONDIR + "/genericChanger " + PROPERTY_SAMPLE_RATE+ " " + rate);
        if(! changer_output[0]) {
            this.sampleRatesMenu.label.set_text("Failed Setting Sample Rate.");
        }
        this.updateStatus();
    },

    _change_format: function(format) {
        this.formatMenu.label.set_text("Format: " + format);
        changer_output = GLib.spawn_command_line_sync (EXTENSIONDIR + "/genericChanger " + PROPERTY_FORMAT+ " " + format);
        if(! changer_output[0]) {
            this.formatMenu.label.set_text("Failed Setting Format.");
        }
        this.updateStatus();
    },

    _change_sampler: function(sampler) {
        this.samplerMenu.label.set_text("Sampler: " + sampler);
        changer_output = GLib.spawn_command_line_sync (EXTENSIONDIR + "/genericChanger " + PROPERTY_SAMPLER + " " + sampler);
        if(! changer_output[0]) {
            this.samplerMenu.label.set_text("Failed Setting Sampler.");
        }
        this.updateStatus();
    },

    updateStatus: function() {
        let cmd_status = GLib.spawn_command_line_sync (CMD_STATUS);
        this.statusLabel.set_text(cmd_status[1].toString());
    },

});


// LOAD PART
// =========


let freqAudio;

function init () {
}

function enable () {
  freqAudio = new FreqAudio;
  Main.panel.addToStatusArea('freqAudio', freqAudio);
}

function disable () {
  freqAudio.destroy();
  freqAudio = null;
}
