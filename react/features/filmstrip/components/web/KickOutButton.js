/* @flow */

import React from 'react';

import { translate } from '../../../base/i18n';
import { IconHangup } from '../../../base/icons';
import { PARTICIPANT_ROLE } from '../../../base/participants';
import { connect } from '../../../base/redux';
import HangupButton from '../../../toolbox/components/HangupButton';
import { ToolbarButton } from '../../../toolbox/components/web';
import AbstractKickButton, { type Props } from '../../../video-menu/components/AbstractKickButton';

/**
 * Implements a React {@link Component} which displays a button for kicking out
 * a participant from the conference.
 *
 * NOTE: At the time of writing this is a button that doesn't use the
 * {@code AbstractButton} base component, but is inherited from the same
 * super class ({@code AbstractKickButton} that extends {@code AbstractButton})
 * for the sake of code sharing between web and mobile. Once web uses the
 * {@code AbstractButton} base component, this can be fully removed.
 */
class KickButton extends AbstractKickButton {
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
        const { participantID, t, isLocal, _localParticipant, isJigasi } = this.props;

        const disabled = _localParticipant.role !== PARTICIPANT_ROLE.MODERATOR;

        return (
            isLocal ? <HangupButton customClass = 'hangup-or-kick-button' />
                : <ToolbarButton
                    accessibilityLabel = { t('toolbar.accessibilityLabel.hangup') }
                    disabled = { disabled }
                    className = { 'button_recordding background-hangup' }
                    icon = { IconHangup }
                    key = 'hangup'
                    onClick = { disabled ? undefined : this._handleClick }
                    tooltip = { t('thumbnail.hangup') } />

        // <VideoMenuButton
        //     buttonText = { t('videothumbnail.kick') }
        //     displayClass = 'kicklink'
        //     icon = { IconKick }
        //     id = { `ejectlink_${participantID}` }
        //     // eslint-disable-next-line react/jsx-handler-names
        //     onClick = { this._handleClick } />
        );
    }

    _handleClick: () => void;
}

/**
 * Maps (parts of) the redux state to the component's props.
 *
 * @param {Object} state - The redux state.
 * @private
 * @returns {{
 *     _localParticipant: Object
 * }}
 */
function _mapStateToProps(state: Object) {
    const localParticipant = state['features/base/participants'].find(p => p.local);

    return {
        _localParticipant: localParticipant
    };
}

export default translate(connect(_mapStateToProps)(KickButton));
