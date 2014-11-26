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
const Shared = extension.imports.shared;
const filters = Shared.filters;

function init(){}

function buildPrefsWidget(){
	
	var settings = Shared.getSettings(Shared.SCHEMA_NAME, extension.dir.get_child('schemas').get_path());
	
	var ret = new Gtk.Grid({orientation: Gtk.Orientation.VERTICAL, margin_bottom: 50});
	
	for (var co=0; co<filters.length; co++){
		var exp = new Gtk.Expander({
					label: filters[co].name,
					expanded: true,
					margin: 6,
					hexpand: true});
		
		var hbox = new Gtk.Box({orientation: Gtk.Orientation.HORIZONTAL, spacing: 50});
		exp.add(hbox);
		
		var key = filters[co].name.toLowerCase().replace(/\s/g, "-");
		
		var sw = new Gtk.Switch({ 
			active: settings.get_boolean(key), 
			halign: Gtk.Align.END, valign: Gtk.Align.START });
		
		sw.name = key;
		
		sw.connect("notify::active", function(widget){
			settings.set_boolean(widget.name, widget.active);
			enableGroup(widget);
		});
		
		hbox.pack_end(sw, false, false, 0);
		
		if (filters[co].widgets){
			for (var i=0; i<filters[co].widgets.length; i++){
				var w = filters[co].widgets[i]();
				
				var kk = key + "-" + filters[co].methods[i].toLowerCase().replace(/[\s|_]/g, "-");
				w.name = kk;
				
				switch (w.constructor.name){
				case "Gtk_Scale":
					w.set_value(settings.get_double(kk));
					w.connect('format-value', function(widget, value){
						return Math.round(value * 100) + "%";
					});
					
					w.connect('value-changed', function(widget){
						settings.set_double(widget.name, widget.get_value());
					});
					break;
				}
				
				hbox.pack_start(w,true,true,0);
			}
		}
		
		enableGroup(sw);
		
		ret.add(exp);
	}

	ret.show_all();
	return ret;
}

function enableGroup(widget){
	widget.parent.foreach(function(w){
		if (w!=widget)
			w.sensitive = widget.active;
	});
}