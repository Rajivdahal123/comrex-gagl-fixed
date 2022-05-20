// @flow

import email from '@atlaskit/icon/glyph/email';
import { AtlasKitThemeProvider } from '@atlaskit/theme';
import React, { useEffect, useState, useRef } from 'react';

import { meetingService } from '../../../../../../service';
import { createInviteDialogEvent, sendAnalytics } from '../../../../analytics';
import { getInviteURL } from '../../../../base/connection';
import { Dialog } from '../../../../base/dialog';
import { translate } from '../../../../base/i18n';
import { Icon, IconAdd, IconClose } from '../../../../base/icons';
import { JitsiRecordingConstants } from '../../../../base/lib-jitsi-meet';
import { connect } from '../../../../base/redux';
import { isVpaasMeeting } from '../../../../billing-counter/functions';
import EmbedMeetingTrigger from '../../../../embed-meeting/components/EmbedMeetingTrigger';
import { getActiveSession } from '../../../../recording';
import { sendIntoUserList, updateDialInNumbers } from '../../../actions';
import {
    _getDefaultPhoneNumber,
    getInviteText,
    isAddPeopleEnabled,
    isDialOutEnabled,
    sharingFeatures,
    isSharingEnabled
} from '../../../functions';


import CopyMeetingLinkSection from './CopyMeetingLinkSection';
import DialInSection from './DialInSection';
import InviteByEmailSection from './InviteByEmailSection';
import InviteContactsSection from './InviteContactsSection';
import LiveStreamSection from './LiveStreamSection';
import { emailValidation } from './validate';
import { guestNameValidate } from './validate/guestNameValidation';
import axios from 'axios';

declare var interfaceConfig: Object;

type Props = {

    /**
     * The object representing the dialIn feature.
     */
    _dialIn: Object,

    /**
     * Whether or not embed meeting should be visible.
     */
    _embedMeetingVisible: boolean,

    /**
     * Whether or not dial in number should be visible.
     */
    _dialInVisible: boolean,

    /**
     * Whether or not url sharing button should be visible.
     */
    _urlSharingVisible: boolean,

    /**
     * Whether or not email sharing features should be visible.
     */
    _emailSharingVisible: boolean,

    /**
     * The meeting invitation text.
     */
    _invitationText: string,

    /**
     * Whether or not invite contacts should be visible.
     */
    _inviteContactsVisible: boolean,

    /**
     * The current url of the conference to be copied onto the clipboard.
     */
    _inviteUrl: string,

    /**
     * The current known URL for a live stream in progress.
     */
    _liveStreamViewURL: string,

    /**
     * The default phone number.
     */
    _phoneNumber: ?string,

    /**
     * Invoked to obtain translated strings.
     */
    t: Function,

    /**
     * Method to update the dial in numbers.
     */
    updateNumbers: Function,

    _room: ?string,
    roomCode: string,
    isCodec: ?string

};

/**
 * Invite More component.
 *
 * @returns {React$Element<any>}
 */
function AddPeopleDialog({
    _dialIn,
    _embedMeetingVisible,
    _dialInVisible,
    _urlSharingVisible,
    _emailSharingVisible,
    _invitationText,
    _inviteContactsVisible,
    _inviteUrl,
    _liveStreamViewURL,
    _phoneNumber,
    t,
    sendIntoUserList,
    updateNumbers, _room, roomCode, isCodec, isInvite, isAddNumber }: Props) {
    const [ isSubmit, setIsSubmit ] = useState(false);
    const [previousMembers,setPreviousMembers]=useState([false])
    const [currentState,setCurrentState]=useState(null)
    const refs = useRef([]);

    const [ membersInvite, setMembersInvite ] = useState([ {
        name: '',
        email: ''
    } ]);

    const [oldMembersInvite,setOldMembersInvite]=useState([
        {
           name:"",
           email:""
        }
    ])
    console.log("members invite from usestate",membersInvite)
    const handleChange = (value, name, index,from) => {
        console.log("index is",index)
        if(from){
            const newMembersInvite = [ ...membersInvite ];
            if(newMembersInvite.length<=1 && !newMembersInvite[0].name.split("").length){
            newMembersInvite[index]["name"] = value.name;
            newMembersInvite[index]["email"] = value.email;
            newMembersInvite[index][`error_name`] = undefined;
            newMembersInvite[index][`error_email`] = undefined;
            }
            else{
                newMembersInvite.push({name:value.name,email:value.email})
            }
            return setMembersInvite(newMembersInvite);
        }
        const newMembersInvite = [ ...membersInvite ];
        newMembersInvite[index][name] = value;
        newMembersInvite[index][`error_${name}`] = undefined;
        console.log("new members invite is",newMembersInvite)
        setMembersInvite(newMembersInvite);
    };

    const addMemberInvite = () => {
        setMembersInvite([ ...membersInvite, { name: '',
            email: '' } ]);
    };

    const removeMemberInvite = index => {
        setMembersInvite(membersInvite.filter((_, i) => index !== i));
    };

    const handleInvite = () => {
        let isValid = true;
        const newMembersInvite = membersInvite.map(item => {
            const validEmail = emailValidation(item.email);
            const validName = guestNameValidate(item.name);

            item.error_email = validEmail;
            item.error_name = validName;

            if (validEmail || validName) {
                isValid = false;
            }
            return item;
        });

        setMembersInvite(newMembersInvite);

        if (isValid) {
            const members_add = newMembersInvite.map(item => {
                return { name: item.name,
                    email: item.email };
            });
            const code = roomCode;

            if (code) {
                meetingService.updateMembers(code, { members_add })
                    .then(res => {
                        console.log('res', res);
                    })
                    .catch(error => {
                        console.log('error', error);
                    })
                ;
            } else {
                sendIntoUserList(members_add);
            }
            setIsSubmit(true);
        }
    };

    const handleKeyDown = e => {
        if (e.keyCode === 9) {
            addMemberInvite();
        }
        if (e.keyCode === 13) {
            handleInvite();
        }
    };
    const handleKeySendInvite = e => {
        if (e.keyCode === 13) {
            handleInvite();
        }
    };

    const fetchPreviousMembers=()=>{
        console.log("inside fetch users member")
        axios.get(`http://localhost:4000/api/meeting/get-all-previous-members`)
        .then(res =>{
            console.log("response",res)
            const members=res.data.members.filter((item,index)=>{
                if(item.role==="guest"){
                    return true
                }
            })
            setPreviousMembers(members)
            console.log("person is",members)
        })
        .catch(err=>{
            console.log("error occurred",err)
        })
    }
    /**
     * Updates the dial-in numbers.
     */
    useEffect(() => {
        if (!_dialIn.numbers) {
            updateNumbers();
        }
        // request for previous joined members
        fetchPreviousMembers()
    }, []);

    /**
     * Sends analytics events when the dialog opens/closes.
     *
     * @returns {void}
     */
    useEffect(() => {
        sendAnalytics(createInviteDialogEvent(
            'invite.dialog.opened', 'dialog'));

        return () => {
            sendAnalytics(createInviteDialogEvent(
                'invite.dialog.closed', 'dialog'));
        };
    }, []);

    const inviteSubject = t('addPeople.inviteMoreMailSubject', {
        appName: interfaceConfig.APP_NAME
    });
    const isChromeless = true;


    return (
        <Dialog
            isForm = { true }
            cancelKe = { true }
            y = { 'dialog.close' }
            hideCancelButton = { true }
            submitDisabled = { true }
            titleKey = { isSubmit === false ? `${isCodec ? 'addPeople.connectCodec' : 'addPeople.inviteMorePrompt'}` : 'Your invitation was sent successfully' }
            width = { 'medium' }>
            <div className = { 'white-line' } />
            { isSubmit === false && !isCodec && isInvite ? <div>
                <div className = { 'share-link' }>
                    {_urlSharingVisible && (_room || roomCode)
                        ? <CopyMeetingLinkSection
                            room = { _room }
                            url = { _inviteUrl } /> : null}
                </div>
                <div className = { 'invitation' }>
                    <p
                        style = {{ color: 'rgb(116, 116, 116)',
                            marginBottom: 10 }}>{t('addPeople.shareInvite')}</p>
                            <div style={{fontSize:"15px",color:"black"}}>Choose previous members</div>

                            {/* start of adding previous members */}
                            {
                                oldMembersInvite.map((item,index)=>{
                                   return  <select style={{width:"100%",height:"2rem",marginBottom:"30px",border:"1px solid #dee0e0",backgroundColor:"white"}}
                                   onChange = { event => handleChange(JSON.parse(event.target.value),null, index,"old") }
                                   value={""}
                                >
                                    {
                                        previousMembers.map((item,index)=>{
                                            if(item){
                                                return <option value={JSON.stringify(item)}>{item.email}</option>
                                            }
                                        })
                                    }

                                </select>
                                })
                            }
                                     {/* <div
                        onClick = { () => addOldmemberInvite() }
                        style = {{
                            width: 24,
                            height: 24,
                            borderRadius: 12,
                            border: '1px solid #b8c7e0',
                            cursor: 'pointer',
                            boxSizing: 'border-box',
                            position:"relative",
                            bottom:"20px"
                        }}>
                        <IconAdd fill = '#b8c7e0' />
                                    </div> */}

             {/* end of adding previous members */}

                    {
                        membersInvite.map((item, index) => (
                            <div
                                style = {{
                                    display: 'flex',
                                    alignItems: 'center',
                                    marginBottom: 5
                                }}>
                                    {
                                        console.log("members invite are",item)
                                    }

                                <div
                                    style = {{
                                        flex: 1
                                    }}>
                                    <input
                                        key = { index }
                                        type = 'text'
                                        value ={ item.name }
                                        onKeyDown = { e => handleKeySendInvite(e) }

                                        ref = { element => {
                                            refs.current[index] = element;
                                        } }
                                        className = { 'guest-input' }
                                        placeholder = { 'Guest Name' }
                                        onChange = { event => handleChange(event.target.value, 'name', index) } />
                                    <p
                                        style = {{ color: 'red',
                                            height: 15 }}>{item.error_name}</p>
                                </div>
                                <div
                                    style = {{
                                        flex: 2,
                                        marginLeft: 15
                                    }}>
                                    <input
                                        type = 'text'
                                        value = { item.email }
                                        className = { 'share-input' }
                                        onKeyDown = { e => handleKeyDown(e) }
                                        placeholder = { 'Enter email to share invitation' }
                                        onChange = { event => handleChange(event.target.value, 'email', index) } />
                                    <p
                                        style = {{ color: 'red',
                                            height: 15 }}>{item.error_email}</p>
                                </div>
                                {
                                    membersInvite.length <= 1 ? null
                                        : <div
                                            onClick = { () => removeMemberInvite(index) }
                                            style = {{
                                                width: 24,
                                                height: 24,
                                                borderRadius: 12,
                                                border: '1px solid #b8c7e0',
                                                marginLeft: 15,
                                                cursor: 'pointer',
                                                marginBottom: 15,
                                                boxSizing: 'border-box'
                                            }}>
                                            <IconClose fill = '#b8c7e0' />
                                        </div>
                                }
                            </div>
                        ))
                    }
                    <div
                        onClick = { () => addMemberInvite() }
                        style = {{
                            width: 24,
                            height: 24,
                            borderRadius: 12,
                            border: '1px solid #b8c7e0',
                            cursor: 'pointer',
                            boxSizing: 'border-box'
                        }}>
                        <IconAdd fill = '#b8c7e0' />
                    </div>
                </div>
                <div className = { 'invite-guest' }>
                    <button
                        className = { 'invite-btn' }
                        onClick = { () => handleInvite() }>INVITE
                    </button>
                </div>
            </div> : <div>
                {/* {!isCodec && <div className = { 'share-link' }>*/}
                {/*    {_urlSharingVisible*/}
                {/*        ? <CopyMeetingLinkSection*/}
                {/*            url = { _inviteUrl }*/}
                {/*            room = { _room } /> : null}*/}
                {/* </div>}*/}
            </div>}
            {isCodec && !isInvite && <div className = 'invite-more-dialog'>
                <InviteContactsSection isAddNumber = { isAddNumber } />
                {/* {_urlSharingVisible*/}
                {/*   ? <CopyMeetingLinkSection url = { _inviteUrl } /> : null}*/}
                {/* /!* {*!/*/}
                {/*    _emailSharingVisible*/}
                {/*        ? <InviteByEmailSection*/}
                {/*            inviteSubject = { inviteSubject }*/}
                {/*            inviteText = { _invitationText } />*/}
                {/*        : null*/}
                {/* }*/}
                {/* {_embedMeetingVisible && <EmbedMeetingTrigger />}*/}
                {/* <div className = 'invite-more-dialog separator' />*/}
                {/* {*/}
                {/*    _liveStreamViewURL*/}
                {/*    && <LiveStreamSection liveStreamViewURL = { _liveStreamViewURL } />*/}
                {/* }*/}
                {/* {*/}
                {/*    _phoneNumber*/}
                {/*    && _dialInVisible*/}
                {/*    && <DialInSection*/}
                {/*        _dialInfoPageUrl = { '' }*/}
                {/*        phoneNumber = { _phoneNumber } />*/}
                {/* }*/}
            </div>}
        </Dialog>
    );
}

/**
 * Maps (parts of) the Redux state to the associated props for the
 * {@code AddPeopleDialog} component.
 *
 * @param {Object} state - The Redux state.
 * @param {Object} ownProps - The properties explicitly passed to the component.
 * @private
 * @returns {Props}
 */
function mapStateToProps(state, ownProps) {
    const currentLiveStreamingSession
        = getActiveSession(state, JitsiRecordingConstants.mode.STREAM);
    const { iAmRecorder } = state['features/base/config'];
    const addPeopleEnabled = isAddPeopleEnabled(state);
    const dialOutEnabled = isDialOutEnabled(state);
    const hideInviteContacts = iAmRecorder || (!addPeopleEnabled && !dialOutEnabled);
    const dialIn = state['features/invite'];
    const phoneNumber = dialIn && dialIn.numbers ? _getDefaultPhoneNumber(dialIn.numbers) : undefined;
    const room = state['features/base/dialog'].componentProps?.roomId;
    const roomCode = state['features/base/conference'].room;
    const isCodec = state['features/base/dialog'].componentProps?.isCodec;


    return {
        invitedUserList: state['features/invite'].invitedUserList,
        _dialIn: dialIn,
        _embedMeetingVisible: !isVpaasMeeting(state) && isSharingEnabled(sharingFeatures.embed),
        _dialInVisible: isSharingEnabled(sharingFeatures.dialIn),
        _urlSharingVisible: isSharingEnabled(sharingFeatures.url),
        _emailSharingVisible: isSharingEnabled(sharingFeatures.email),
        _invitationText: getInviteText({ state,
            phoneNumber,
            t: ownProps.t }),
        _inviteContactsVisible: interfaceConfig.ENABLE_DIAL_OUT && !hideInviteContacts,
        _inviteUrl: getInviteURL(state),
        _liveStreamViewURL:
            currentLiveStreamingSession
                && currentLiveStreamingSession.liveStreamViewURL,
        _phoneNumber: phoneNumber,
        _room: room,
        roomCode,
        isCodec
    };
}

/**
 * Maps dispatching of some action to React component props.
 *
 * @param {Function} dispatch - Redux action dispatcher.
 * @returns {Props}
 */
const mapDispatchToProps = {
    updateNumbers: updateDialInNumbers,
    sendIntoUserList

};

export default translate(
    connect(mapStateToProps, mapDispatchToProps)(AddPeopleDialog)
);
