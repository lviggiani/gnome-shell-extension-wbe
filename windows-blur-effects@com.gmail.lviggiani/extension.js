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

const Clutter = imports.gi.Clutter;
const Shell = imports.gi.Shell;

const display = global.display;

const excludeList = [
                     "Gnome-terminal"
                     ]; // an array of wm-class to be excluded from filters

const filters = [
         { 
        	 name: "desaturate",
        	 effect: Clutter.DesaturateEffect,
        	 property: "factor",
        	 value: 1,
        	 startValue: 0,
        	 active: true
         },
         {
        	 name: "brightness",
        	 effect: Clutter.BrightnessContrastEffect,
        	 property: "brightness",
        	 value: new Clutter.Color({ red: 100, green: 100, blue: 100, alpha: 255}),
        	 active: true
         },
         { 
        	 name: "blur",
        	 effect: Clutter.BlurEffect,
        	 active: true
         }
];

var focusAppConnection, switchWorkspaceConnection;

var isExtensionEnabled = false;

function init(){}

function enable(){
	focusAppConnection = global.display.connect('notify::focus-window', updateApps);
	switchWorkspaceConnection = global.window_manager.connect('switch-workspace', updateApps);
		
	isExtensionEnabled = true;
	updateApps();
}

function disable(){
    global.display.disconnect(focusAppConnection);
    global.window_manager.disconnect(switchWorkspaceConnection);
    
	isExtensionEnabled = false;
	updateApps();
}

function updateApps(){
	var runningApps = Shell.AppSystem.get_default().get_running();
	
	for (var co=0; co<runningApps.length; co++)
		updateWindows(runningApps[co]);
}

function updateWindows(app){
	var windows = app.get_windows();
	var activeActor = (display.focus_window)? display.focus_window.get_compositor_private() : null;
	var activeScreen = (display.focus_window)? display.focus_window.get_screen() : null;
		
	for (var co=0; co<windows.length; co++){
		var window = windows[co];
		var actor = window.get_compositor_private();
		if (!actor) continue;
		
		// Fix for issue #4: ignore windows on other screens
		if (window.get_screen()!=activeScreen) continue;
		
		var flag = (actor!=activeActor) && isExtensionEnabled;
		
		// Fix issue #1: Exclude some windows from effects
		flag = flag && !excludeList.contains(window.wm_class);
		
		applyFilters(actor, flag);
	}
}

function applyFilters(actor, flag){
	for (var co=0; co<filters.length; co++){
		var filter = filters[co];
		flag = flag && filter.active;
		
		var ff = actor.get_effect(filter.name);
		if (flag){
			if (!ff)
				actor.add_effect_with_name(filter.name, (ff = new filter.effect()));
		} else {
			if (ff)
				actor.remove_effect_by_name(filter.name);
		}
		
		if (ff && (filter.property!=undefined) && (filter.value!=undefined) && (ff[filter.property]!=undefined)){	
			ff[filter.property] = filter.value;
		}
	}
}

Array.prototype.contains = function(obj) {
    var i = this.length;
    while (i--) {
        if (this[i] === obj) {
            return true;
        }
    }
    return false;
}
