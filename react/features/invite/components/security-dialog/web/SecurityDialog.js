import React, { useCallback, useState } from 'react';
import { translate } from '../../../../base/i18n';
import { connect } from '../../../../base/redux';
import { Dialog } from '../../../../base/dialog';
import { moderatorService } from "../../../../../../service";
import { hideEditSecuirtyDialog as hideEditSecuirtyDialogAction} from '../../../../invite';

function SecurityDialog (props) {
    const { hideEditSecuirtyDialog } = props;
    const state = APP.store.getState();
    const moderator = state['features/base/settings'].user;
    const [newPass, setNewPass] = useState('');
    const [conf, setConf] = useState('');
    const regx = /^(?=.*?[A-Z|a-z])(?=.*?[0-9])(?=.*?[!@#\$&*~]).{6,}$/;
    const [errors, setError] = useState({
        new: '',
        conf: ''
    })

    const updatePass = useCallback(async () => {
        if(newPass !== conf) {
            setError({new: '', conf: '* The passwords do not match'});
        } else {
            if(!regx.test(newPass)) {
                setError({new: '* Passwords must include at least six numbers, letters, and special characters (like ! and &).', conf: ''})
            } else {
                setError({new: '', conf: ''});
                await moderatorService.updatePassword({password: newPass, id: moderator.id})
                .then(resp => {
                })
                .catch(err => {
    
                });
                props.hideEditSecuirtyDialog();
            }
        }
        
    }, [conf, newPass, moderator]);

    return (
        <Dialog 
            isForm = { true }
            cancelKe = { true }
            y = { 'dialog.close' }
            hideCancelButton = { true }
            submitDisabled = { true }
            titleKey="Security"
            width = { 'medium' }
        >
            <div className = { 'white-line' } />
            <div className = { 'security-form' }>
                <div className={'input-form'}>
                    <input placeholder="New Password"  type="password" value={newPass} onChange={e => setNewPass(e.target.value)}/>
                    <div className={'error'}>{errors.new}</div>
                </div>
                <div className={'input-form'}>
                    <input placeholder="Confirm Password" type="password" value={conf} onChange={e => setConf(e.target.value)}/>
                    <div className={'error'}>{errors.conf}</div>
                </div>
            </div>
            <div className = { 'invite-guest' }>
                    <button
                        className = { 'invite-btn' }
                        onClick = { () => updatePass() }>Save
                    </button>
                </div>
        </Dialog>
    )
}

function mapStateToProps(state, ownProps) {
    const settings = state['features/base/settings'];
    return {
        user: settings.user
    }
}

const mapDispatchToProps = {
    hideEditSecuirtyDialog: hideEditSecuirtyDialogAction
}

export default translate(
    connect(mapStateToProps, mapDispatchToProps)(translate(SecurityDialog))
)