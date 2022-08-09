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
const gtkVersion = Gtk.get_major_version();
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
	
	var exp = new Gtk.Expander(gtkVersion < 4 ? {
		label : _(label),
		expanded : true,
		margin : 6,
		hexpand : true
	} : {
		label : _(label),
		expanded : true,
		margin_top : 6,
		margin_bottom : 6,
		margin_start : 6,
		margin_end : 6,
		hexpand : true
	});

	var hbox = new Gtk.Box({
		orientation : Gtk.Orientation.HORIZONTAL,
		spacing : 50
	});
	if (gtkVersion < 4) {
		exp.add(hbox);
	} else {
		exp.set_child(hbox);
	}

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

	if (gtkVersion < 4) {
		hbox.pack_end(sw, false, false, 0);
	} else {
		hbox.append(sw);
	}

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
				if (gtkVersion < 4) {
					w.connect('format-value', function(widget, value) {
						return Math.round(value * 100) + "%";
					});
				} else {
					w.set_draw_value(true);
					w.set_format_value_func(function(widget, value) {
						return Math.round(value * 100) + "%                        ";
					});
				}
				w.connect('value-changed', function(widget) {
					settings.set_double(widget.name, widget.get_value());
				});
				break;
			}

			if (gtkVersion < 4) {
				hbox.pack_start(w, true, true, 0);
			} else {
				hbox.prepend(w);
			}
		}
	}

	enableGroup(sw);

	if (gtkVersion < 4) {
		parent.add(exp);
	} else {
		parent.append(exp);
	}
}

function buildPrefsWidget(){
	
	var ret = (gtkVersion < 4) ? new Gtk.Grid({orientation: Gtk.Orientation.VERTICAL, margin_bottom: 50}) 
		: new Gtk.Box({orientation: Gtk.Orientation.VERTICAL, spacing: 25});
	
	for (var co=0; co<filters.length; co++){
		var key = filters[co].name.toLowerCase().replace(/\s/g, "-");
		addPrefWidget(ret, key, filters[co].name, filters[co].widgets, filters[co].methods);
	}

	addPrefWidget(ret, "overview", _("Apply to Overview"), null, null);
	addPrefWidget(ret, "separate-blur-on-each-screen", _("Do not blur last active window on each screen"), null, null);
	if (gtkVersion < 4) {
		ret.show_all();
	}
	return ret;
}

function enableGroup(widget){
	if (gtkVersion < 4) {
		widget.parent.foreach(function(w){
			if (w!=widget)
				w.sensitive = widget.active;
		});
	} else {
		var w = widget.parent.get_first_child();
		while (w) {
			if (w!=widget) {
				w.sensitive = widget.active;
			}
			w = w.get_next_sibling();
		}
    }
}
