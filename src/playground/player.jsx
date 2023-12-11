import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import {connect} from 'react-redux';
import {compose} from 'redux';

import Box from '../components/box/box.jsx';
import GUI from '../containers/gui.jsx';
import HashParserHOC from '../lib/hash-parser-hoc.jsx';
import AppStateHOC from '../lib/app-state-hoc.jsx';

import {setPlayer} from '../reducers/mode';

if (process.env.NODE_ENV === 'production' && typeof window === 'object') {
    // Warn before navigating away
    window.onbeforeunload = () => true;
}

import styles from './player.css';


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


const Player = ({isPlayerOnly, onSeeInside, projectId}) => (
    <Box className={classNames(isPlayerOnly ? styles.stageOnly : styles.editor)}>
        {isPlayerOnly && <button onClick={onSeeInside}>{'See inside'}</button>}
        <GUI
            canEditTitle
            enableCommunity
            isPlayerOnly={isPlayerOnly}
            projectId={projectId}
            onVmInit={onVmInit}
        />
    </Box>
);

Player.propTypes = {
    isPlayerOnly: PropTypes.bool,
    onSeeInside: PropTypes.func,
    projectId: PropTypes.string
};

const mapStateToProps = state => ({
    isPlayerOnly: state.scratchGui.mode.isPlayerOnly
});

const mapDispatchToProps = dispatch => ({
    onSeeInside: () => dispatch(setPlayer(false))
});

const ConnectedPlayer = connect(
    mapStateToProps,
    mapDispatchToProps
)(Player);

// note that redux's 'compose' function is just being used as a general utility to make
// the hierarchy of HOC constructor calls clearer here; it has nothing to do with redux's
// ability to compose reducers.
const WrappedPlayer = compose(
    AppStateHOC,
    HashParserHOC
)(ConnectedPlayer);

const appTarget = document.createElement('div');
document.body.appendChild(appTarget);

ReactDOM.render(<WrappedPlayer isPlayerOnly />, appTarget);

function resizerender() {
    ReactDOM.render(<WrappedPlayer isPlayerOnly isFullScreen />, appTarget);
}
setTimeout(resizerender, 1500);
