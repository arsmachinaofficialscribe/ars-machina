Record of how v4.9.3.5 was produced from the v4.9.3.4 package (before this toolkit existed).
- build.py: the one-off build (loader swap, PDF await, nonce removal, v4.9.3.5 tail script, payload split). Superseded by pack.py.
- loader.js / v49350.js: readable sources of the new lazy loader and the v4.9.3.5 script.
- rdt.py / fix.py: matched each polluted spell Target to its printed R/D/T line in the source PDFs.
Future releases: write patches/vX.py against src/ (see README) instead.
