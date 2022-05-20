// @flow

import React, { Component } from 'react';

import { isMobileBrowser } from '../../../base/environment/utils';
import { translate } from '../../../base/i18n';
import { IconArrowUp } from '../../../base/icons';
import JitsiMeetJS from '../../../base/lib-jitsi-meet/_';
import { PARTICIPANT_ROLE } from '../../../base/participants';
import { connect } from '../../../base/redux';
import { ToolboxButtonWithIcon } from '../../../base/toolbox/components';
import { AudioSettingsPopup, toggleAudioSettings } from '../../../settings';
import { isAudioSettingsButtonDisabled } from '../../functions';
import AudioMuteButton from '../AudioMuteButton';

type Props = {

    /**
     * Indicates whether audio permissions have been granted or denied.
     */
    hasPermissions: boolean,

    /**
     * Click handler for the small icon. Opens audio options.
     */
    onAudioOptionsClick: Function,

    /**
     * If the button should be disabled.
     */
    isDisabled: boolean,

    /**
     * Used for translation.
     */
    t: Function,

    /**
     * Flag controlling the visibility of the button.
     * AudioSettings popup is disabled on mobile browsers.
     */
    visible: boolean,
    settings: any,
    isShowPopup: boolean,
    tracks: Array,
    participant: Object,
};

/**
 * Button used for audio & audio settings.
 *
 * @returns {ReactElement}
 */
class AudioSettingsButton extends Component<Props> {

    /**
     * Implements React's {@link Component#render}.
     *
     * @inheritdoc
     */
    render() {
        const { hasPermissions, isDisabled, onAudioOptionsClick, t, visible, showCustom, customClass, settings, tracks, participant, _localParticipant } = this.props;
        const track = tracks.find(tr => tr.participantId === participant?.id);
        let disabled = false;

        if (!track) {
            disabled = true;
        }
        if (_localParticipant.role === PARTICIPANT_ROLE.MODERATOR && _localParticipant.id !== participant?.id) {
            if (participant?.enable) {
                disabled = true;
            }
        }
        if (_localParticipant.role !== PARTICIPANT_ROLE.MODERATOR && _localParticipant.id !== participant?.id) {
            disabled = true;
        }

        if (_localParticipant.id === participant?.id && !participant?.enable && track?.muted) {
            disabled = true;
        }
        const settingsDisabled = !hasPermissions
            || isDisabled
            || !JitsiMeetJS.mediaDevices.isMultipleAudioInputSupported();

        return visible
            ? this.props.isShowPopup
                ? (settings.mode === 'participant' || !settings.user === true) && <AudioSettingsPopup>
                    <ToolboxButtonWithIcon
                        icon = { IconArrowUp }
                        iconDisabled = { settingsDisabled }
                        iconTooltip = { t('toolbar.audioSettings') }
                        onIconClick = { onAudioOptionsClick }>
                        <AudioMuteButton
                            customClass = { customClass ? customClass : 'hide-button-900 hide-icon-900' }
                            showCustom = { showCustom } />
                    </ToolboxButtonWithIcon>
                </AudioSettingsPopup> : <AudioMuteButton
                    disabled = { disabled }
                    customClass = { customClass ? customClass : `hide-button-900 hide-icon-900 ${disabled && 'audio-disable'}` }
                    showCustom = { showCustom } />
            : <AudioMuteButton
                disabled = { disabled }
                customClass = { `${disabled ? 'audio-disable' : 'background-theme-2'}  hide-button-900 hide-icon-900` }
                showCustom = { showCustom } />;
    }
}

/**
 * Function that maps parts of Redux state tree into component props.
 *
 * @param {Object} state - Redux state.
 * @returns {Object}
 */
function mapStateToProps(state) {
    const { permissions = {} } = state['features/base/devices'];
    const settings = state['features/base/settings'];
    const localParticipant = state['features/base/participants'].find(p => p.local);
    const participants = state['features/base/participants'];
    const tracks = state['features/base/tracks'];

    return {
        hasPermissions: permissions.audio,
        _localParticipant: localParticipant,
        participant: participants.find(p => p.id === localParticipant.id),
        tracks,
        isDisabled: isAudioSettingsButtonDisabled(state),
        visible: !isMobileBrowser(),
        settings
    };
}

const mapDispatchToProps = {
    onAudioOptionsClick: toggleAudioSettings
};

export default translate(connect(
    mapStateToProps,
    mapDispatchToProps,
)(AudioSettingsButton));
