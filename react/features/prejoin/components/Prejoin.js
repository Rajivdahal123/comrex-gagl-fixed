// @flow
/* global APP, JitsiMeetJS */

import Select from '@atlaskit/select';
import Spinner from '@atlaskit/spinner';
import { jitsiLocalStorage } from '@jitsi/js-utils/jitsi-local-storage';
import React, { Component } from 'react';

import { meetingService } from '../../../../service';
import { createToolbarEvent, sendAnalytics } from '../../analytics';
import { LogoutButton } from '../../base/buttons/LogoutButton';
import { getRoomName } from '../../base/conference';
import { setAudioInputDevice, setAudioOutputDevice } from '../../base/devices';
import { translate } from '../../base/i18n';
import { IconPlus } from '../../base/icons';
import { browser, JitsiMediaDevicesEvents } from '../../base/lib-jitsi-meet';
import { isVideoMutedByUser, MEDIA_TYPE } from '../../base/media';
import { getLocalParticipant } from '../../base/participants';
import {
    ActionButton,
    InputField,
    PreMeetingScreen,
    ToggleButton
} from '../../base/premeeting';
import { connect } from '../../base/redux';
import { getDisplayName, updateSettings } from '../../base/settings';
import { createLocalTracksF, getLocalJitsiVideoTrack } from '../../base/tracks';
import { beginAddPeople as beginAddPeopleAction } from '../../invite';
import { editProfile as editProfileAction, editScurity as editScurityAction } from '../../invite';
import { mediaPermissionPromptVisibilityChanged } from '../../overlay';
import AudioSettingsButton from '../../toolbox/components/web/AudioSettingsButton';
import { isButtonEnabled } from '../../toolbox/functions.web';
import { muteLocal } from '../../video-menu/actions.any';
import {
    joinConference as joinConferenceAction,
    joinConferenceWithoutAudio as joinConferenceWithoutAudioAction,
    setSkipPrejoin as setSkipPrejoinAction,
    setJoinByPhoneDialogVisiblity as setJoinByPhoneDialogVisiblityAction
} from '../actions';
import {
    isDeviceStatusVisible,
    isDisplayNameRequired,
    isJoinByPhoneButtonVisible,
    isJoinByPhoneDialogVisible,
    isPrejoinSkipped
} from '../functions';

import DeviceStatus from './preview/DeviceStatus';


declare var interfaceConfig: Object;

type Props = {

    /**
     * Flag signaling if the 'skip prejoin' button is toggled or not.
     */
    buttonIsToggled: boolean,

    /**
     * Flag signaling if the device status is visible or not.
     */
    deviceStatusVisible: boolean,

    /**
     * If join by phone button should be visible.
     */
    hasJoinByPhoneButton: boolean,

    /**
     * Joins the current meeting.
     */
    joinConference: Function,

    /**
     * Joins the current meeting without audio.
     */
    joinConferenceWithoutAudio: Function,

    /**
     * The name of the user that is about to join.
     */
    name: string,

    /**
     * Updates settings.
     */
    updateSettings: Function,

    /**
     * The name of the meeting that is about to be joined.
     */
    roomName: string,

    /**
     * Sets visibility of the prejoin page for the next sessions.
     */
    setSkipPrejoin: Function,

    /**
     * Sets visibility of the 'JoinByPhoneDialog'.
     */
    setJoinByPhoneDialogVisiblity: Function,

    /**
     * Indicates whether the avatar should be shown when video is off
     */
    showAvatar: boolean,

    /**
     * Flag signaling the visibility of camera preview.
     */
    showCameraPreview: boolean,

    /**
     * If should show an error when joining without a name.
     */
    showErrorOnJoin: boolean,

    /**
     * Flag signaling the visibility of join label, input and buttons
     */
    showJoinActions: boolean,

    /**
     * Flag signaling the visibility of the conference URL section.
     */
    showConferenceInfo: boolean,

    /**
     * If 'JoinByPhoneDialog' is visible or not.
     */
    showDialog: boolean,

    /**
     * Flag signaling the visibility of the skip prejoin toggle
     */
    showSkipPrejoin: boolean,

    /**
     * Used for translation.
     */
    t: Function,

    /**
     * The JitsiLocalTrack to display.
     */
    videoTrack: ?Object,
    dispatch: ?any,
    moderatorMode: string
};

type State = {

    /**
     * Flag controlling the visibility of the error label.
     */
    showError: boolean,

    /**
     * Flag controlling the visibility of the 'join by phone' buttons.
     */
    showJoinByPhoneButtons: boolean,
};

/**
 * This component is displayed before joining a meeting.
 */
class Prejoin extends Component<Props, State> {
    /**
     * Default values for {@code Prejoin} component's properties.
     *
     * @static
     */
    static defaultProps = {
        showConferenceInfo: true,
        showJoinActions: true,
        showSkipPrejoin: true
    };

    /**
     * Initializes a new {@code Prejoin} instance.
     *
     * @inheritdoc
     */
    constructor(props) {
        super(props);

        this.state = {
            showError: false,
            showJoinByPhoneButtons: false,
            name: jitsiLocalStorage.getItem('gaglTitleName'),
            loading: false,
            error: false,
            isCodec: true,
            moderatorMode: {
                label: this.props.moderatorMode.toUpperCase(),
                value: this.props.moderatorMode
            },
            userCreated: props.userCreated
        };

        APP.store.subscribe(() => {
            this.setState({
                userCreated: APP.store['features/base/settings']?.user
            })
        })

        this._closeDialog = this._closeDialog.bind(this);
        this._showDialog = this._showDialog.bind(this);
        this._onJoinButtonClick = this._onJoinButtonClick.bind(this);
        this._onToggleButtonClick = this._onToggleButtonClick.bind(this);
        this._onDropdownClose = this._onDropdownClose.bind(this);
        this._onOptionsClick = this._onOptionsClick.bind(this);
        this._setName = this._setName.bind(this);
        this._onToolbarOpenInvite = this._onToolbarOpenInvite.bind(this);
        this._openProfileModal = this._openProfileModal.bind(this);
        this.handleOpenCodec = this.handleOpenCodec.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    _onToolbarOpenInvite: () => void;

    /**
     * Creates an analytics toolbar event and dispatches an action for opening
     * the modal for inviting people directly into the conference.
     *
     * @private
     * @returns {void}
     */
    _onToolbarOpenInvite() {
        sendAnalytics(createToolbarEvent('invite'));

        this.props.beginAddPeople(null, false, true, false);
    }

    _openProfileModal: () => void;

    _openProfileModal() {
        this.props.editProfile();
    }

    _openSecurityModal: () => void;

    _openSecurityModal() {
        this.props.editScurity();
    }

    _onJoinButtonClick: () => void;

    /**
     * Handler for the join button.
     *
     * @param {Object} e - The synthetic event.
     * @returns {void}
     */
    _onJoinButtonClick() {
        const room = this.props.roomId;
        const { userInviteList, userCreated, onSubmit } = this.props;
        console.log("inside onjoin buttonclicked")
        this.setState({
            error: !this.state.name
        });
        jitsiLocalStorage.setItem('gaglTitleName', this.state.name);
        if (this.state.name) {
            this.setState({
                isLoading: true
            });
            meetingService
                .createMeeting({
                    name: this.state.name,
                    code: room,
                    mode: this.state.moderatorMode.value,
                    members: userInviteList.map(item => {
                        return {
                            email: item.email,
                            name: item.name
                        };
                    }),
                    user_created: userCreated
                })
                .then(res => {
                    console.log("response",res)
                    const moderator = res.data.members.find(item => item.role === 'moderator');
                    if (moderator) {
                        window.location.href = moderator.meeting_panther?.fullURL;
                    }
                    // if (onSubmit) {
                    //     onSubmit(room);
                    // }
                })
                .catch(error => {
                    console.log({ error });
                })
                .finally(() => {
                    this.setState({
                        isLoading: false
                    });
                });
        }
    }

    _onToggleButtonClick: () => void;

    /**
     * Handler for the toggle button.
     *
     * @param {Object} e - The synthetic event.
     * @returns {void}
     */
    _onToggleButtonClick() {
        this.props.setSkipPrejoin(!this.props.buttonIsToggled);
    }

    _onDropdownClose: () => void;

    /**
     * Closes the dropdown.
     *
     * @returns {void}
     */
    _onDropdownClose() {
        this.setState({
            showJoinByPhoneButtons: false
        });
    }

    _onOptionsClick: () => void;

    /**
     * Displays the join by phone buttons dropdown.
     *
     * @param {Object} e - The synthetic event.
     * @returns {void}
     */
    _onOptionsClick(e) {
        e.stopPropagation();

        this.setState({
            showJoinByPhoneButtons: !this.state.showJoinByPhoneButtons
        });
    }

    _setName: () => void;

    /**
     * Sets the guest participant name.
     *
     * @param {string} displayName - Participant name.
     * @returns {void}
     */
    _setName(name) {
        this.setState({
            name: name.slice(0, 200)
        });
    }

    _closeDialog: () => void;

    /**
     * Closes the join by phone dialog.
     *
     * @returns {undefined}
     */
    _closeDialog() {
        this.props.setJoinByPhoneDialogVisiblity(false);
    }

    _showDialog: () => void;

    /**
     * Displays the dialog for joining a meeting by phone.
     *
     * @returns {undefined}
     */
    _showDialog() {
        this.props.setJoinByPhoneDialogVisiblity(true);
        this._onDropdownClose();
    }
    handleOpenCodec() {
        sendAnalytics(createToolbarEvent('invite'));
        this.props.beginAddPeople('', true, false, true);
    }
    handleChange(value) {
        this.setState({ moderatorMode: value });
        if (value.value === 'silent') {
            APP.store.dispatch(muteLocal(true, MEDIA_TYPE.AUDIO, 'local', true));
        } else {
            APP.store.dispatch(muteLocal(false, MEDIA_TYPE.AUDIO,'local', true));
        }
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        const {
            name,
            showAvatar,
            showCameraPreview,
            showConferenceInfo,
            showJoinActions,
            t,
            videoTrack,
            page,
            roomId,
            userCreated,
            avatarUrl
        } = this.props;
        const {
            _onJoinButtonClick,
            _setName
        } = this;
        const { showError, loading } = this.state;
        const mode = [
            {
                label: 'participant'.toUpperCase(),
                value: 'participant'
            },
            {
                label: 'silent'.toUpperCase(),
                value: 'silent'
            },
            {
                label: 'producer'.toUpperCase(),
                value: 'producer',
                isDisabled: true
            }
        ];
console.log("inside prejoinnnn")
        return (
            <>
                {loading ? (
                    <div
                        style = {{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            backgroundColor: 'rgba(0,0,0,0.2)',
                            zIndex: 100,
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                        <Spinner size = 'medium' />
                    </div>
                )
                    : page === 'welcome' && (
                        <PreMeetingScreen
                            footer = { this._renderFooter() }
                            name = { name }
                            avatarUrl = { avatarUrl }
                            user = { userCreated.userName }
                            showAvatar = { showAvatar }
                            showConferenceInfo = { showConferenceInfo }
                            showJoinActions = { showJoinActions }
                            skipPrejoinButton = { this._renderSkipPrejoinButton() }
                            title = { t('prejoin.joinMeeting') }
                            videoMuted = { !showCameraPreview }
                            videoTrack = { videoTrack }>
                            <div
                                className = { 'account-setting-dropdown account-setting-custom' }>
                                <div
                                    style = {{ marginRight: 10 }}
                                    className = { 'account-display-custom' }>Hi, {userCreated.userName}
                                </div>
                                <LogoutButton
                                    isMod = { true }
                                    avatarUrl = { avatarUrl }
                                    handleProfile={() => this._openProfileModal()}
                                    handleSecurity={() => this._openSecurityModal()}/>
                            </div>
                            {showJoinActions && (
                                <div>
                                    <div className = 'flex-row jus-between padding-codec'>
                                        {/* <div className = 'login-setup'>*/}
                                        {/*   {t('login.audioSetup')}*/}
                                        {/* </div>*/}
                                        {/*<div*/}
                                        {/*    className = 'login-setup mt-600'*/}
                                        {/*    onClick = { this.handleOpenCodec }>*/}
                                        {/*    {t('login.codecSetup')}*/}
                                        {/*</div>*/}
                                    </div>
                                    <div className = 'prejoin-input-area-container prejoin-input-area-logged-in'>
                                        <div className = 'start-meeting-label'>
                                            {/* {t('login.startMeeting')} */}
                                        </div>
                                        <div style = {{ height: 20 }} />
                                        {/* <CopyMeetingUrl roomId = { roomId } />*/}

                                        <div style = {{ height: 10 }} />
                                        <div className = { 'input-field-premeeting' }>
                                            <InputField
                                                autoFocus = { true }
                                                className = { showError ? 'error' : '' }
                                                hasError = { showError }
                                                onChange = { _setName }
                                                placeHolder = { t(
                                                    'dialog.enterMeetingTitle'
                                                ) }
                                                value = { this.state.name } />
                                            {this.state.error && <div style = {{ color: 'red' }}>{ t(
                                                'dialog.meetingError'
                                            ) }
                                            </div>}
                                        </div>

                                        <div style = {{ height: 10 }} />
                                        <ActionButton
                                            className = 'button-invite'
                                            hasOptions = { true }
                                            onClick = { this._onToolbarOpenInvite }
                                            OptionsIcon = { IconPlus }
                                            testId = 'prejoin.invite.joinMeeting'
                                            type = 'primary'>
                                            {t('addPeople.title')}
                                        </ActionButton>
                                        <div className = { 'select-mode' }>
                                            <Select
                                                inputId = 'multi-select-example'
                                                className = 'multi-select'
                                                classNamePrefix = 'react-select'
                                                options = { mode }
                                                value = { this.state.moderatorMode }
                                                onChange = { value => this.handleChange(value) }
                                                isMulti = { false }
                                                isSearchable = { false }
                                                placeholder = 'Choose a mode of moderator before you start a meeting' />
                                        </div>
                                        <div
                                            className = 'prejoin-preview-dropdown-container'
                                            style = {{ marginTop: 20 }}>
                                            <ActionButton
                                                className = 'button-login-meeting'
                                                onClick = { this.state.isLoading ? undefined : _onJoinButtonClick }
                                                testId = 'prejoin.joinMeeting'
                                                type = 'primary'>
                                                {t('login.startMeeting')}
                                            </ActionButton>
                                        </div>
                                        <div
                                            className = 'toolbox-content-items'
                                            style = {{
                                                marginTop: 20,
                                                marginBottom: 10
                                            }}>
                                            {/*<AudioSettingsButton*/}
                                            {/*    isShowPopup = { true }*/}
                                            {/*    visible = { true } />*/}
                                            {/* <VideoSettingsButton visible = { true } />*/}
                                        </div>
                                        <div className = 'prejoin-bottom-info' />
                                    </div>
                                </div>
                            )}
                            {/* {showDialog && (*/}
                            {/* <JoinByPhoneDialog*/}
                            {/* joinConferenceWithoutAudio = { joinConferenceWithoutAudio }*/}
                            {/* onClose = { _closeDialog } />*/}
                            {/* )}*/}
                        </PreMeetingScreen>
                    )
                }
            </>
        );
    }

    /**
     * Renders the screen footer if any.
     *
     * @returns {React$Element}
     */
    _renderFooter() {
        return this.props.deviceStatusVisible && <DeviceStatus />;
    }

    /**
     * Renders the 'skip prejoin' button.
     *
     * @returns {React$Element}
     */
    _renderSkipPrejoinButton() {
        const { buttonIsToggled, t, showSkipPrejoin } = this.props;

        if (!showSkipPrejoin) {
            return null;
        }

        return (
            <div className = 'prejoin-checkbox-container'>
                <ToggleButton
                    isToggled = { buttonIsToggled }
                    onClick = { this._onToggleButtonClick }>
                    {t('prejoin.doNotShow')}
                </ToggleButton>
            </div>
        );
    }
}

/**
 * Maps (parts of) the redux state to the React {@code Component} props.
 *
 * @param {Object} state - The redux state.
 * @param {Object} ownProps - The props passed to the component.
 * @returns {Object}
 */
function mapStateToProps(state, ownProps): Object {
    const name = getDisplayName(state);
    const showErrorOnJoin = isDisplayNameRequired(state) && !name;
    const { showJoinActions } = ownProps;
    const isInviteButtonEnabled = isButtonEnabled('invite', state);
    const userInviteList = state['features/invite'].invitedUserList;
    const settings = state['features/base/settings'];
    const { locationURL } = state['features/base/connection'];
    const moderatorMode = state['features/base/settings'].mode;


    // Hide conference info when interfaceConfig is available and the invite button is disabled.
    // In all other cases we want to preserve the behaviour and control the the conference info
    // visibility through showJoinActions.
    const showConferenceInfo
        = typeof isInviteButtonEnabled === 'undefined'
        || isInviteButtonEnabled === true
            ? showJoinActions
            : false;

    return {
        locationURL,
        userCreated: settings.user,
        userInviteList,
        buttonIsToggled: isPrejoinSkipped(state),
        name,
        deviceStatusVisible: isDeviceStatusVisible(state),
        roomName: getRoomName(state),
        showDialog: isJoinByPhoneDialogVisible(state),
        showErrorOnJoin,
        hasJoinByPhoneButton: isJoinByPhoneButtonVisible(state),
        showCameraPreview: !isVideoMutedByUser(state),
        showConferenceInfo,
        avatarUrl: getLocalParticipant(state).loadableAvatarUrl,
        videoTrack: getLocalJitsiVideoTrack(state),
        moderatorMode
    };
}

const mapDispatchToProps = {
    joinConferenceWithoutAudio: joinConferenceWithoutAudioAction,
    joinConference: joinConferenceAction,
    setJoinByPhoneDialogVisiblity: setJoinByPhoneDialogVisiblityAction,
    setSkipPrejoin: setSkipPrejoinAction,
    updateSettings,
    beginAddPeople: beginAddPeopleAction,
    editProfile: editProfileAction,
    editScurity: editScurityAction,
};

export default connect(mapStateToProps, mapDispatchToProps)(translate(Prejoin));
