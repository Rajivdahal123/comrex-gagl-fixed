import React from 'react';
import { translate } from '../../../../base/i18n';
import { connect } from '../../../../base/redux';
import { Dialog } from '../../../../base/dialog';

const ForgotPassDialog = (props) => {

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
                <h4>Forgot Password!</h4>
                <div className={'title-underline'}></div>
                <div className={'description'}>You will receive an email to reset the password.</div>
            </div>
        </Dialog>
    )
}

function mapStateToProps(state, ownProps) {
    
}

const mapDispatchToProps = {

}

export default translate(
    connect(mapStateToProps, mapDispatchToProps)(translate(ForgotPassDialog))
);