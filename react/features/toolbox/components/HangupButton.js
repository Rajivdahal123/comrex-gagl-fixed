// @flow

import Spinner from '@atlaskit/spinner';
import _ from 'lodash';

import { createToolbarEvent, sendAnalytics } from '../../analytics';
import { appNavigate } from '../../app/actions';
import { kickedOut } from '../../base/conference';
import { disconnect } from '../../base/connection';
import { translate } from '../../base/i18n';
import { IconHangup } from '../../base/icons';
import {
    getLocalParticipant,
    kickParticipant,
    PARTICIPANT_ROLE
} from '../../base/participants';
import { connect } from '../../base/redux';
import { AbstractHangupButton } from '../../base/toolbox/components';
import type { AbstractButtonProps } from '../../base/toolbox/components';

/**
 * The type of the React {@code Component} props of {@link HangupButton}.
 */
type Props = AbstractButtonProps & {

    /**
     * The redux {@code dispatch} function.
     */
    dispatch: Function
};

/**
 * Component that renders a toolbar button for leaving the current conference.
 *
 * @extends AbstractHangupButton
 */
class HangupButton extends AbstractHangupButton<Props, *> {
    _hangup: Function;

    accessibilityLabel = 'toolbar.accessibilityLabel.hangup';
    label = 'toolbar.hangup';
    tooltip = 'toolbar.hangup';

    /**
     * Initializes a new HangupButton instance.
     *
     * @param {Props} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props: Props) {
        super(props);

        this._hangup = _.once(() => {
            this.setState({
                loading: true
            });
            sendAnalytics(createToolbarEvent('hangup'));

            // FIXME: these should be unified.
            if (navigator.product === 'ReactNative') {
                this.props.dispatch(appNavigate(undefined));
            } else {
                if (this.props._isModerator) {
                    this.props._participants.forEach(p => {
                        APP.store.dispatch(kickParticipant(p.id));
                    });

                    // APP.conference.leaveRoomAndDisconnect();
                    // window.href.location = '/';
                }


                this.props.dispatch(disconnect(true));
            }
            this.setState({
                loading: false
            });
        });
    }

    /**
     * Helper function to perform the actual hangup action.
     *
     * @override
     * @protected
     * @returns {void}
     */
    _doHangup() {
        this._hangup();
    }
}

/**
 * Maps part of the redux state to the component's props.
 *
 * @param {Object} state - The redux store/state.
 * @param {Props} ownProps - The component's own props.
 * @returns {Object}
 */
function _mapStateToProps(state) {
    const participants = state['features/base/participants'];
    const conference = state['features/base/conference'];
    const isModerator
        = getLocalParticipant(state).role === PARTICIPANT_ROLE.MODERATOR;

    return {
        _participants: participants,
        _isModerator: isModerator,
        _conference: conference
    };
}

export default translate(connect(_mapStateToProps)(HangupButton));
