import React from 'react';
import { translate } from '../../../../base/i18n';
import { connect } from '../../../../base/redux';
import { Dialog } from '../../../../base/dialog';

const AlertDialog = (props) => {

    const state = APP.store.getState();
    const alertState = state['features/invite'].alertState;

    return (
        <Dialog
            isForm = { true }
            cancelKe = { true }
            y = { 'dialog.close' }
            hideCancelButton = { true }
            submitDisabled = { true }
            width = { 'small' }
        >
            <div className={'alert-modal'}>
                <h4>The changes have been saved successfully!</h4>
            </div>
        </Dialog>
    )
}

function mapStateToProps(state, ownProps) {
    const invite = state['features/invite'];
    return {
        alertState: invite.alertState
    }
}

const mapDispatchToProps = {

}

export default translate(
    connect(mapStateToProps, mapDispatchToProps)(translate(AlertDialog))
);