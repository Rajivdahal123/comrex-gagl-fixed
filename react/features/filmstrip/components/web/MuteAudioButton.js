/* @flow */

import React from 'react';

import { translate } from '../../../base/i18n';
import {
    IconMicDisabled,
    IconMicrophone
} from '../../../base/icons';
import { PARTICIPANT_ROLE } from '../../../base/participants';
import { connect } from '../../../base/redux';
import AudioMuteButton from '../../../toolbox/components/AudioMuteButton';
import { ToolbarButton } from '../../../toolbox/components/web';
import AbstractMuteButton, {
    _mapStateToProps,
    type Props
} from '../../../video-menu/components/AbstractMuteButton';

/**
 * Implements a React {@link Component} which displays a button for audio muting
 * a participant in the conference.
 *
 * NOTE: At the time of writing this is a button that doesn't use the
 * {@code AbstractButton} base component, but is inherited from the same
 * super class ({@code AbstractMuteButton} that extends {@code AbstractButton})
 * for the sake of code sharing between web and mobile. Once web uses the
 * {@code AbstractButton} base component, this can be fully removed.
 */
class MuteAudioButton extends AbstractMuteButton {
    /**
     * Instantiates a new {@code Component}.
     *
     * @inheritdoc
     */
    constructor(props: Props) {
        super(props);

        this._handleClick = this._handleClick.bind(this);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        const { _audioTrackMuted, t, isLocal, _localParticipant, isJigasi, participant, tracks } = this.props;
        let disabled = isJigasi;

        if (_localParticipant.role !== PARTICIPANT_ROLE.MODERATOR && _localParticipant.id !== participant?.id) {
            disabled = true;
        }

        const track = tracks.find(tr => tr.participantId === participant?.id);

        if (_localParticipant.role === PARTICIPANT_ROLE.MODERATOR && _localParticipant.id !== participant?.id) {
            if (participant?.enable) {
                disabled = true;
            }
        }

        if (_localParticipant.id === participant?.id && !participant?.enable && track?.muted) {
            disabled = true;
        }

        if (!track) {
            disabled = true;
        }

        return (
            isLocal
                ? <AudioMuteButton
                    customClass = { 'toolbox-audio-toggle' }
                    disabled = { disabled } />
                : <ToolbarButton
                    accessibilityLabel = { t('toolbar.accessibilityLabel.audio') }
                    icon = { _audioTrackMuted ? IconMicDisabled : IconMicrophone }
                    key = 'mute'
                    disabled = { disabled }
                    onClick = { this._handleClick }
                    className = 'button_recordding'
                    tooltip = { t('thumbnail.mute') } />


        // <VideoMenuButton
        //     buttonText = { t(muteConfig.translationKey) }
        //     displayClass = { muteConfig.muteClassName }
        //     icon = { IconMicDisabled }
        //     id = { `mutelink_${participantID}` }
        //     // eslint-disable-next-line react/jsx-handler-names
        //     onClick = { this._handleClick } />
        );
    }

    _handleClick: () => void;
}

export default translate(connect(_mapStateToProps)(MuteAudioButton));
