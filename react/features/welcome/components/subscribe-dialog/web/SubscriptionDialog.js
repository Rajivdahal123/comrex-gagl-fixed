import React from 'react';
import { translate } from '../../../../base/i18n';
import { connect } from '../../../../base/redux';
import { Dialog } from '../../../../base/dialog';

const SubscriptionDialog = (props) => {

    const state = APP.store.getState();

    return (
        <Dialog
            isForm = { true }
            cancelKe = { true }
            y = { 'dialog.close' }
            hideCancelButton = { true }
            submitDisabled = { true }
            width = { 'small' }
        >
            <div className={'subscribe-modal'}>
                <h4>Contact your administrator!</h4>
                <div className={'title-underline'}></div>
                <div className={'description'}>Your account is not active.</div>
                <div className={'description'}>Please contact your admin</div>
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
    connect(mapStateToProps, mapDispatchToProps)(translate(SubscriptionDialog))
);