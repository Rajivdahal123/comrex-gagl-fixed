/* @flow */

import React from 'react';

import { Dialog } from '../../../base/dialog';
import { translate } from '../../../base/i18n';
import { connect } from '../../../base/redux';
import AbstractMuteRemoteParticipantDialog
    from '../AbstractMuteRemoteParticipantDialog';

/**
 * A React Component with the contents for a dialog that asks for confirmation
 * from the user before muting a remote participant.
 *
 * @extends Component
 */
class MuteRemoteParticipantDialog extends AbstractMuteRemoteParticipantDialog {
    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        const track = this.props.tracks.find(tr => tr.participantId === this.props.participantID);

        const isMuted = track ? track.muted : true;

        return (
            <Dialog
                okKey = { `${isMuted ? 'dialog.unmuteParticipantButton' : 'dialog.muteParticipantButton'}` }
                onSubmit = { this._onSubmit }
                titleKey = { `${isMuted ? 'dialog.unmuteParticipantTitle' : 'dialog.muteParticipantTitle'}` }
                width = 'small'>
                <div>
                    { `${isMuted ? this.props.t('dialog.unmuteParticipantBody')
                        : this.props.t('dialog.muteParticipantBody')}` }
                </div>
            </Dialog>
        );
    }

    _onSubmit: () => boolean;
}

export default translate(connect()(MuteRemoteParticipantDialog));
