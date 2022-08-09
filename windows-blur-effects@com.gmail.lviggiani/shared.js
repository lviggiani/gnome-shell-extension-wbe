const Clutter = imports.gi.Clutter;
const Gtk = imports.gi.Gtk;

const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;

const Gettext = imports.gettext.domain('windows-blur-effects');
const _ = Gettext.gettext;

var SCHEMA_NAME = "org.gnome.shell.extensions.wbe";

var filters = [
         { 
        	 name: _("Desaturate"),
        	 effect: Clutter.DesaturateEffect,
        	 methods: ["set_factor"],
        	 values: [1],
        	 widgets: [createDesaturateWidget],
        	 active: true
         },
         {
        	 name: _("Brightness and Contrast"),
        	 effect: Clutter.BrightnessContrastEffect,
        	 methods: ["set_brightness", "set_contrast"],
        	 values: [-0.3, -0.3],
        	 widgets: [createBnCWidget, createBnCWidget],
        	 active: true
         },
         { 
        	 name: _("Blur"),
        	 effect: Clutter.BlurEffect,
        	 active: true
         }
];

function createBnCWidget(){
	return Gtk.Scale.new_with_range(Gtk.Orientation.HORIZONTAL,-1.0,1.0,0.01);
}

function createDesaturateWidget(){
	return Gtk.Scale.new_with_range(Gtk.Orientation.HORIZONTAL,0.0,1.0,0.01);
}

function getSettings(schemaName, schemaDir) {

    // Extension installed in .local
    if (GLib.file_test(schemaDir + '/' + schemaName + ".gschema.xml", GLib.FileTest.EXISTS)) {
    	var schemaSource = Gio.SettingsSchemaSource.new_from_directory(schemaDir,
                                  Gio.SettingsSchemaSource.get_default(),
                                  false);
    	var schema = schemaSource.lookup(schemaName, false);

        return new Gio.Settings({ settings_schema: schema });
    }
    /*
    // Extension installed system-wide
    else {
        if (Gio.Settings.list_schemas().indexOf(schemaName) == -1)
            throw "Schema \"%s\" not found.".format(schemaName);
        return new Gio.Settings({ schema: schemaName });
    }
    */
}
