import React from 'react';
import ReactDOM from 'react-dom';
import {compose} from 'redux';

import AppStateHOC from '../lib/app-state-hoc.jsx';
import GUI from '../containers/gui.jsx';
import HashParserHOC from '../lib/hash-parser-hoc.jsx';
import log from '../lib/log.js';

const onClickLogo = () => {
    window.location = 'https://scratch.mit.edu';
};

const handleTelemetryModalCancel = () => {
    log('User canceled telemetry modal');
};

const handleTelemetryModalOptIn = () => {
    log('User opted into telemetry');
};

const handleTelemetryModalOptOut = () => {
    log('User opted out of telemetry');
};

/*
 * Render the GUI playground. This is a separate function because importing anything
 * that instantiates the VM causes unsupported browsers to crash
 * {object} appTarget - the DOM element to render to
 */
export default appTarget => {
    GUI.setAppElement(appTarget);

    // note that redux's 'compose' function is just being used as a general utility to make
    // the hierarchy of HOC constructor calls clearer here; it has nothing to do with redux's
    // ability to compose reducers.
    const WrappedGui = compose(
        AppStateHOC,
        HashParserHOC
    )(GUI);

    // TODO a hack for testing the backpack, allow backpack host to be set by url param
    //const backpackHostMatches = window.location.href.match(/[?&]backpack_host=([^&]*)&?/);
    //const backpackHost = backpackHostMatches ? backpackHostMatches[1] : null;
    const backpackHost = 'scr_bp';

    const scratchDesktopMatches = window.location.href.match(/[?&]isScratchDesktop=([^&]+)/);
    let simulateScratchDesktop;
    if (scratchDesktopMatches) {
        try {
            // parse 'true' into `true`, 'false' into `false`, etc.
            simulateScratchDesktop = JSON.parse(scratchDesktopMatches[1]);
        } catch {
            // it's not JSON so just use the string
            // note that a typo like "falsy" will be treated as true
            simulateScratchDesktop = scratchDesktopMatches[1];
        }
    }


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
    

    if (process.env.NODE_ENV === 'production' && typeof window === 'object') {
        // Warn before navigating away
        window.onbeforeunload = () => true;
    }

    ReactDOM.render(
        // important: this is checking whether `simulateScratchDesktop` is truthy, not just defined!
        simulateScratchDesktop ?
            <WrappedGui
                canEditTitle
                isScratchDesktop
                showTelemetryModal
                canSave={false}
                onTelemetryModalCancel={handleTelemetryModalCancel}
                onTelemetryModalOptIn={handleTelemetryModalOptIn}
                onTelemetryModalOptOut={handleTelemetryModalOptOut}
            /> :
            <WrappedGui
                canEditTitle
                backpackVisible
                showComingSoon={false}
                backpackHost={backpackHost}
                canSave={false}
                onClickLogo={onClickLogo}
                onVmInit={onVmInit}
            />,
        appTarget);
};
