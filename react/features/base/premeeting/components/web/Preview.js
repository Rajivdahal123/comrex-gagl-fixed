// @flow

import React from 'react';

import {
    joinConference as joinConferenceAction
} from '../../../../../features/prejoin/actions';
import { Video } from '../../../media';
import { getLocalParticipant, getParticipantById } from '../../../participants';
import { connect } from '../../../redux';
import { getLocalVideoTrack } from '../../../tracks';

import { AccountSettingTopView } from './AccountSettingTopView';


export type Props = {

    /**
     * Flag controlling whether the video should be flipped or not.
     */
    flipVideo: boolean,

    /**
     * Flag signaling the visibility of camera preview.
     */
    videoMuted: boolean,

    /**
     * The JitsiLocalTrack to display.
     */
    videoTrack: ?Object,

    joinConference: Function,

    showJoinActions: boolean

};

/**
 * Component showing the video preview and device status.
 *
 * @param {Props} props - The props of the component.
 * @returns {ReactElement}
 */
function Preview(props: Props) {
    const { videoMuted, videoTrack, flipVideo, joinConference, showJoinActions } = props;
    const className = flipVideo ? 'flipVideoX' : '';

    return (
        <div
            id = 'preview'
            style = {{
                display: 'flex',
                flexDirection: 'column'
            }}>
            <div className = { 'top-stack' }>
                {/* <AccountSettingTopView />*/}
            </div>
            <div className = { 'mid-stack' } />
            <div className = { 'divider' } />
            <div className = { 'bot-stack' } />
            {/* <Video
                    className = { className }
                    videoTrack = {{ jitsiTrack: videoTrack }} /> */}
        </div>
    );

}

/**
 * Maps part of the Redux state to the props of this component.
 *
 * @param {Object} state - The Redux state.
 * @param {Props} ownProps - The own props of the component.
 * @returns {Props}
 */
function _mapStateToProps(state, ownProps) {
    return {
        flipVideo: state['features/base/settings'].localFlipX,
        videoMuted: ownProps.videoTrack
            ? ownProps.videoMuted
            : state['features/base/media'].video.muted,
        videoTrack:
            ownProps.videoTrack
            || (getLocalVideoTrack(state['features/base/tracks']) || {})
                .jitsiTrack
    };
}
const mapDispatchToProps = {
    joinConference: joinConferenceAction
};

export default connect(_mapStateToProps, mapDispatchToProps)(Preview);
