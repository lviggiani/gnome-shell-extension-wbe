const Clutter = imports.gi.Clutter;
const Gtk = imports.gi.Gtk;

const filters = [
         { 
        	 name: "Desaturate",
        	 effect: Clutter.DesaturateEffect,
        	 methods: ["set_factor"],
        	 values: [1],
        	 widgets: [createDesaturateWidget],
        	 active: true
         },
         {
        	 name: "Brightness and Contrast",
        	 effect: Clutter.BrightnessContrastEffect,
        	 methods: ["set_brightness", "set_contrast"],
        	 values: [-0.3, -0.3],
        	 widgets: [createBnCWidget, createBnCWidget],
        	 active: true
         },
         { 
        	 name: "Blur",
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