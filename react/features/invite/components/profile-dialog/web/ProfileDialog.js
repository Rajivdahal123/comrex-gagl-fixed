import React, { useCallback, useState } from 'react';

import { Dialog } from '../../../../base/dialog';
import { translate } from '../../../../base/i18n';
import { connect } from '../../../../base/redux';
import { moderatorService } from "../../../../../../service";
import { updateSettings as updateSettingsAction} from "../../../../base/settings";
import { hideEditProfileDialog as hideEditProfileAction} from '../../../../invite';
import { useDispatch } from 'react-redux';

type Props = {
};

function ProfileDialog(props) {
    const {updateSettings, hideEditProfileDialog} = props;
    const dispatch = useDispatch();
    const nameRegx = /^[a-zA-Z\s_\-\']+$/;
    const emailRegx = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    const [errors, setError] = useState({
        fName: '',
        lName: '',
        uName: '',
        email: ''
    })
    const state = APP.store.getState();
    const user = state['features/base/settings'].user;
    const [firstName, setFName] = useState(user.firstName);
    const [lastName, setLName] = useState(user.lastName);
    const [userName, setName] = useState(user.userName);
    const [email, setEmail] = useState(user.email);

    const updateProfile = useCallback(async () => {
        let data = user;
        data.firstName = firstName;
        data.lastName = lastName;
        data.userName = userName;
        data.email = email;
        let result = false;

        if(firstName === '') {
            setError({fName: '* First Name is required'})
        } else if(!nameRegx.test(firstName)) {
            setError({fName: '* No numbers or special characters are allowed'})
        } else if(firstName.length > 30) {
            setError({fName: '* Maximum length is 30 characters'})
        } else if(lastName === '') {
            setError({lName: '* Last Name is required'})
        } else if(!nameRegx.test(lastName)) {
            setError({lName: '* No numbers or special characters are allowed'});
        } else if(lastName.length > 30) {
            setError({lName: '* Maximum length is 30 characters'})
        } else if(userName === '') {
            setError({uName: '* User Name is required'})
        } else if(!nameRegx.test(userName)) {
            setError({uName: '* No numbers or special characters are allowed'});
        } else if(userName.length > 30) {
            setError({uName: '* Maximum length is 30 characters'})
        } else if(email === '') {
            setError({email: '* Email is required'})
        } else if(!emailRegx.test(email)) {
            setError({email: '* Check the format of the email you entered'});
        } else if(email.length > 80) {
            setError({email: '* Maximum length is 80 characters'})
        } else {
            setError({fName: '', lName: '', uName: '', email: ''});
            await moderatorService.updateProfile(data)
            .then(resp => {
                if(resp.data.success) {
                    result = true;
                    props.updateSettingsAction({
                        user: resp.data.moderator
                    });
                } else {
                    if(resp.data.message.includes('username')) {
                        setError({uName: resp.data.message});
                    } else {
                        setError({email: resp.data.message});
                    }
                }
            })
            .catch(err => {

            })
            if(result) {
                props.hideEditProfileDialog();
            }
        }
    }, [firstName, lastName, userName, email, user, props])

    return (
        <Dialog
            isForm = { true }
            cancelKe = { true }
            y = { 'dialog.close' }
            hideCancelButton = { true }
            submitDisabled = { true }
            titleKey="Edit Profile"
            width = { 'medium' }
        >
            <div className = { 'white-line' } />
            <div className = { 'profile-form' }>
                <div className={'input-item'}>
                    <div className={'input-form'}>
                        <p>First Name:</p>
                        <input placeholder="First Name" value={firstName} onChange={e => setFName(e.target.value)}/>
                    </div>
                    <div className={'error'}>{errors.fName}</div>
                </div>
                <div className={'input-item'}>
                    <div className={'input-form'}>
                        <p>Last Name:</p>
                        <input placeholder="Last Name" value={lastName} onChange={e => setLName(e.target.value)}/>
                    </div>
                    <div className={'error'}>{errors.lName}</div>
                </div>
                <div className={'input-item'}>
                    <div className={'input-form'}>
                        <p>UserName:</p>
                        <input placeholder="User Name" value={userName} onChange={e => setName(e.target.value)}/>
                    </div>
                    <div className={'error'}>{errors.uName}</div>
                </div>
                <div className={'input-item'}>
                    <div className={'input-form'}>
                        <p>Email:</p>
                        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}/>
                    </div>
                    <div className={'error'}>{errors.email}</div>
                </div>
                <div className = { 'invite-guest' }>
                    <button
                        className = { 'invite-btn' }
                        onClick = { () => updateProfile() }>Save
                    </button>
                </div>
            </div>
        </Dialog>
    )
}

function mapStateToProps(state, ownProps ) {
    const settings = state['features/base/settings'];
    return {
        user: settings.user
    }
}

const mapDispatchToProps = {
    updateSettings: updateSettingsAction,
    hideEditProfileDialog: hideEditProfileAction
}

export default translate(
    connect(mapStateToProps, mapDispatchToProps)(translate(ProfileDialog))
)