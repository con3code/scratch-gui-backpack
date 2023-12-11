#!/bin/sh

REPO_ID=scratch-gui-backpack

mv src/containers/backpack.jsx src/containers/backpack.jsx_orig
mv src/lib/backpack-api.js src/lib/backpack-api.js_orig
mv src/components/modal/modal.css src/components/modal/modal.css_orig
mv src/playground/index.jsx src/playground/index.jsx_orig
mv src/playground/render-gui.jsx src/playground/render-gui.jsx_orig
cp ${REPO_ID}/src/containers/backpack.jsx src/containers/
cp ${REPO_ID}/src/lib/backpack-api.js src/lib/
cp ${REPO_ID}/src/components/modal/modal.css src/components/modal/
cp ${REPO_ID}/src/playground/index.jsx src/playground/
cp ${REPO_ID}/src/playground/render-gui.jsx src/playground/
