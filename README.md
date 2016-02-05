gnome-shell-extension-wbe
=========================

Apply effects on Windows in backgound (not focused).

- Desaturation filter 0 to 100%
- Brightness adjustment -100% to 100%
- Contrast adjustment -100% to 100%
- Blur effect
- NEW: apply filters in Overview mode

Please report any bugs and/or feature requests here:

https://github.com/lviggiani/gnome-shell-extension-wbe/issues

![Alt text](./screenshot.png?raw=true "Optional Title")

Credits: credits also go to  Florian Mounier aka paradoxxxzero which I got the inspiration and some code hinting from.
You may find his original project here:

https://github.com/paradoxxxzero/gnome-shell-focus-effects-extension
(please do not report any issues on this)

CHANGES:

Version 9:
- Added support to Docky
- Various translations

Version 8:
- Apply filters to the Overview mode desktop

Version 7:
- Fixed the issue causing troubles to other extensions (thanks to UshakovVasilii patch)
- Do not blur any windows belonging to the active App

Version 6:
- Skip aways above windows (Felipe Morales)
- Skip vertically maximized windows (Felipe Morales)
- Multilanguage support and German translation (Jonnius)

Version 5:
- Fixed behaviour with child windows
- Added suppor to other cases (e.g. Gimp in multi window mode)

Version 4:
- fixed issue #6: implemented user preferences
- bug fixes

Version 3:
- fixed issue #1: Ability to exclude windows
- fixed issue #4: Added multi-display support
- tentative fix for issue #5: prevent destkop from being blurred (e.g. with conky). For this I need testing on gnome prior to 3.14 as I cant reproduce here.

Version 2:
- fixed issue with Windows of the same application (added patch from Kevin MacMartin, thanks man!)

