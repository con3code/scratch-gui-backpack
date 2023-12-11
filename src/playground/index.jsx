// Polyfills
import 'es6-object-assign/auto';
import 'core-js/fn/array/includes';
import 'core-js/fn/promise/finally';
import 'intl'; // For Safari 9

import React from 'react';
import ReactDOM from 'react-dom';

import AppStateHOC from '../lib/app-state-hoc.jsx';
import BrowserModalComponent from '../components/browser-modal/browser-modal.jsx';
import supportedBrowser from '../lib/supported-browser';

import styles from './index.css';

// ?project=https://example.com/project.sb3
    
const onVmInit = vm => {

    // Load a project from a URL. Example: ?project_url=/example.sb3
    let projectLoaded = false;

    // We need to wait the VM start and the default project to be loaded before
    // trying to load the url project, otherwiste we can get a mix of both.
    vm.runtime.on('PROJECT_LOADED', () => {
        if (!projectLoaded) {
            const projectFileMatches = window.location.href.match(/[?&]project=([^&]*)&?/);
            const projectFile = projectFileMatches ? decodeURIComponent(projectFileMatches[1]) : null;
            if (projectFile) {
                fetch(projectFile)
                    .then(response => {
                        if (response.ok) {
                            return response.arrayBuffer();
                        } else {
                            console.error('Failed to fetch project: ' + response.statusText);
                        }
                    })
                    .then(arrayBuffer => {
                        if (arrayBuffer) {
                            projectLoaded = true;
                            vm.loadProject(arrayBuffer)
                                .catch(error => {
                                    projectLoaded = false;
                                    console.error('Failed to load project. ' + error);
                                }
                            );
                        }
                    }
                );
            }
        }
    });
};

const appTarget = document.createElement('div');
appTarget.className = styles.app;
document.body.appendChild(appTarget);

if (supportedBrowser()) {
    // require needed here to avoid importing unsupported browser-crashing code
    // at the top level
    require('./render-gui.jsx').default(appTarget);

} else {
    BrowserModalComponent.setAppElement(appTarget);
    const WrappedBrowserModalComponent = AppStateHOC(BrowserModalComponent, true /* localesOnly */);
    const handleBack = () => {};
    // eslint-disable-next-line react/jsx-no-bind
    ReactDOM.render(<WrappedBrowserModalComponent onBack={handleBack} />, appTarget);
}
