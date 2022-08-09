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

const shellVersion = Number.parseInt(imports.misc.config.PACKAGE_VERSION.split('.')[0]);
const Clutter = imports.gi.Clutter;
const Shell = imports.gi.Shell;
const ExtensionUtils = imports.misc.extensionUtils;
const Meta = imports.gi.Meta;
const Main = imports.ui.main;
//const Overview = imports.ui.overview;

const extension = ExtensionUtils.getCurrentExtension();
const Shared = extension.imports.shared;

const display = global.display;

const specialApps = /(Gimp.*)(Docky)/; // Regexp for wm-classes to exclude form effects
const excludeList = []; // an array of wm-class to be excluded from filters

const filters = extension.imports.shared.filters;

var focusAppConnection, switchWorkspaceConnection, trackedWindowsChangedConnection,
	settingChangedConnection, overviewShowingConnection, overviewHidingConnection;

var isExtensionEnabled = false;

var separateBlurOnEachScreen = true;

const settings = Shared.getSettings(Shared.SCHEMA_NAME, extension.dir.get_child('schemas').get_path());

const _shadeBackgrounds = Main.overview._shadeBackgrounds;

function init(){}

function enable(){
	loadSettings();
	
	focusAppConnection = global.display.connect('notify::focus-window', updateApps);
	switchWorkspaceConnection = global.window_manager.connect('switch-workspace', updateApps);
	trackedWindowsChangedConnection = Shell.WindowTracker.get_default().connect('tracked-windows-changed', updateApps);
	
	settingChangedConnection = settings.connect("changed", function(){
		loadSettings();
		updateApps();
		
		overrideOverviewShadeBackgrounds(true);
	});
	
	overviewShowingConnection = Main.overview.connect("showing", function(){
		setOverviewBackgroundFilter(true);
	});
	
	overviewHidingConnection = Main.overview.connect("hidden", function(){
		setOverviewBackgroundFilter(false);
	});
	
	isExtensionEnabled = true;
	updateApps();
	
	overrideOverviewShadeBackgrounds(true);
	
}

function disable(){
    global.display.disconnect(focusAppConnection);
    global.window_manager.disconnect(switchWorkspaceConnection);
    Shell.WindowTracker.get_default().disconnect(trackedWindowsChangedConnection);
    settings.disconnect(settingChangedConnection);
    
    Main.overview.disconnect(overviewShowingConnection);
    Main.overview.disconnect(overviewHidingConnection);
    
	isExtensionEnabled = false;
	updateApps();
	
	overrideOverviewShadeBackgrounds(false);
	
}

function overrideOverviewShadeBackgrounds(flag){
	flag &= settings.get_boolean("overview");
	if (flag) {
		Main.overview._shadeBackgrounds = function(){};
	} else {
		Main.overview._shadeBackgrounds = _shadeBackgrounds;
	}	
}

function setOverviewBackgroundFilter(flag){
	flag &= settings.get_boolean("overview");
	if (flag){
		updateOverviewBackground(true);
	} else {
		updateOverviewBackground(false);
	}
}

function updateOverviewBackground(flag){
	var o = Main.overview;
	var backgrounds = o._backgroundGroup.get_children();
	for (var co=0; co<backgrounds.length; co++)
		applyFilters(backgrounds[co], flag);
}

function updateApps(){
	var runningApps = Shell.AppSystem.get_default().get_running();
	
	for (var co=0; co<runningApps.length; co++)
		updateWindows(runningApps[co]);
}

function updateWindows(app){
	var windows = app.get_windows();
	var activeActor = (display.focus_window)? display.focus_window.get_compositor_private() : null;
	var activeMonitor = (display.focus_window)? display.focus_window.get_monitor() : -1;
		
	for (var co=0; co<windows.length; co++){
		var window = windows[co];
		var actor = window.get_compositor_private();
		if (!actor) continue;
		
		// Fix for issue #4: ignore windows on other screens
		// …if setting is enabled (fix for issue #13)
		if (separateBlurOnEachScreen && window.get_monitor()!=activeMonitor)
			continue;
		
		var flag = (actor!=activeActor) && isExtensionEnabled;
		
		// Fix issue #1: Exclude some windows from effects
		flag = flag && excludeList.indexOf(window.wm_class) < 0;
		
		// Tentative fix for issue #5: prevent Desktop from being blurred
		flag = flag && (window.window_type!=Meta.WindowType.DESKTOP);
		
		// Fix issue #11: Prevent vertically maximized windows from being blurred
		if (shellVersion < 40) {
			flag = flag && (window.get_maximized()!=Meta.MaximizeFlags.VERTICAL);
		}
		
		// Skip always-above windows
        flag = flag && (window.above!=true);

        // Do not blur windows of the same App
		if (display.focus_window && window.find_root_ancestor()==display.focus_window.find_root_ancestor())
			flag = false;
		
		
		// Exclude some special apps (e.g. Gimp)
		if (display.focus_window && display.focus_window.wm_class.match(specialApps))
			flag = flag && !window.wm_class.match(specialApps);
		
		applyFilters(actor, flag);
	}
}

function applyFilters(actor, fl){
	
	for (var co=0; co<filters.length; co++){
		var flag = fl;
		
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
		
		if (ff && (filter.methods!=undefined) && (filter.values!=undefined)
				&& (filter.methods.length == filter.values.length)){
			
			for (var i=0; i<filter.methods.length; i++)
				if (ff[filter.methods[i]]!=undefined)
					ff[filter.methods[i]](filter.values[i]);
		}
	}
}

function loadSettings(){
	
	for (var co=0; co<filters.length; co++){
		var filter = filters[co];
		var key = filter.name.toLowerCase().replace(/\s/g, "-");
		filter.active = settings.get_boolean(key);
		
		if (filter.methods){
			for (var i=0; i<filter.methods.length; i++){
				var kk = key + "-" + filter.methods[i].toLowerCase().replace(/[\s|_]/g, "-");
				
				// FIXME: I'm assuming datatype is double. There should be a way to check this first
				filter.values[i] = settings.get_double(kk);
			}
		}
	}
	
	separateBlurOnEachScreen =
		settings.get_boolean("separate-blur-on-each-screen");
}

