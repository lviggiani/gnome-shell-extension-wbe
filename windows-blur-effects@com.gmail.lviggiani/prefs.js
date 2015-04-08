/**
 * windows-blur-effects@com.gmail.lviggiani
 * Apply effects to windows on blur
 * 
 * Copyright © 2014 Luca Viggiani, All rights reserved
 *
 * This is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3.0 of the License, or (at your option) any later version.

 * This software is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details:
 * 
 * https://www.gnu.org/licenses/lgpl.html
 * 
 * AUTHOR: Luca Viggiani (lviggiani@gmail.com)
 * PROJECT SITE: https://github.com/lviggiani/gnome-shell-extension-wbe
 * 
 * CREDITS: credits also go to  Florian Mounier aka paradoxxxzero which I got
 * the inspiration and some code hinting from. You may find his original
 * project here:
 * 
 * https://github.com/paradoxxxzero/gnome-shell-focus-effects-extension
 *
 */

const Gtk = imports.gi.Gtk;
const ExtensionUtils = imports.misc.extensionUtils;

const extension = ExtensionUtils.getCurrentExtension();

const Gettext = imports.gettext.domain('windows-blur-effects');
const _ = Gettext.gettext;
const Convenience = extension.imports.convenience;

const Shared = extension.imports.shared;
const filters = Shared.filters;

const settings = Shared.getSettings(Shared.SCHEMA_NAME, extension.dir.get_child('schemas').get_path());

function init(){
	Convenience.initTranslations("windows-blur-effects");
}

function addPrefWidget(parent, key, label, widgets, methods){
	
	var exp = new Gtk.Expander({
		label : label,
		expanded : true,
		margin : 6,
		hexpand : true
	});

	var hbox = new Gtk.Box({
		orientation : Gtk.Orientation.HORIZONTAL,
		spacing : 50
	});
	exp.add(hbox);

	var sw = new Gtk.Switch({
		active : settings.get_boolean(key),
		halign : Gtk.Align.END,
		valign : Gtk.Align.START
	});

	sw.name = key;

	sw.connect("notify::active", function(widget) {
		settings.set_boolean(widget.name, widget.active);
		enableGroup(widget);
	});

	hbox.pack_end(sw, false, false, 0);

	if (widgets) {
		for (var i = 0; i < widgets.length; i++) {
			var w = widgets[i]();

			var kk = key
					+ "-"
					+ methods[i].toLowerCase().replace(/[\s|_]/g,
							"-");
			w.name = kk;

			switch (w.constructor.name) {
			case "Gtk_Scale":
				w.set_value(settings.get_double(kk));
				w.connect('format-value', function(widget, value) {
					return Math.round(value * 100) + "%";
				});

				w.connect('value-changed', function(widget) {
					settings.set_double(widget.name, widget.get_value());
				});
				break;
			}

			hbox.pack_start(w, true, true, 0);
		}
	}

	enableGroup(sw);

	parent.add(exp);
}

function buildPrefsWidget(){
	
	var ret = new Gtk.Grid({orientation: Gtk.Orientation.VERTICAL, margin_bottom: 50});
	
	for (var co=0; co<filters.length; co++){
		var key = filters[co].name.toLowerCase().replace(/\s/g, "-");
		addPrefWidget(ret, key, filters[co].name, filters[co].widgets, filters[co].methods);
	}

	addPrefWidget(ret, "overview", "Apply to Overview", null, null);
	ret.show_all();
	return ret;
}

function enableGroup(widget){
	widget.parent.foreach(function(w){
		if (w!=widget)
			w.sensitive = widget.active;
	});
}
