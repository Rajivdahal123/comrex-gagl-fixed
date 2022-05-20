// @flow
/* global APP, JitsiMeetJS */
import DropdownMenu, {
    DropdownItem,
    DropdownItemGroup
} from '@atlaskit/dropdown-menu';
import { jitsiLocalStorage } from '@jitsi/js-utils/jitsi-local-storage';
import _ from 'lodash';
import NoSleep from 'nosleep.js';
import React from 'react';

import VideoLayout from '../../../../../modules/UI/videolayout/VideoLayout';
import { meetingService } from '../../../../../service';
import { LogoutButton } from '../../../base/buttons/LogoutButton';
import { getConferenceNameForTitle } from '../../../base/conference';
import { connect, disconnect } from '../../../base/connection';
import { setAudioInputDevice, setAudioOutputDevice } from '../../../base/devices';
import { translate } from '../../../base/i18n';
import { JitsiMediaDevicesEvents, browser } from '../../../base/lib-jitsi-meet';
import {
    getStartWithAudioMuted,
    getStartWithVideoMuted
} from '../../../base/media';
import {
    getLocalParticipant,
    PARTICIPANT_ROLE
} from '../../../base/participants';
import { AccountSettingTopView } from '../../../base/premeeting/components/web/AccountSettingTopView';
import Footer from '../../../base/premeeting/components/web/Footer';
import Preview from '../../../base/premeeting/components/web/Preview';
import { connect as reactReduxConnect } from '../../../base/redux';
import { updateJWTPublish, updateSettings } from '../../../base/settings';
import {
    createLocalTracksF,
    isUserInteractionRequiredForUnmute
} from '../../../base/tracks';
import { setColorAlpha } from '../../../base/util';
import { Chat } from '../../../chat';
import { Filmstrip } from '../../../filmstrip';
import { CalleeInfoContainer } from '../../../invite';
import { LargeVideo } from '../../../large-video';
import { LobbyScreen } from '../../../lobby';
import { mediaPermissionPromptVisibilityChanged } from '../../../overlay';
import { Prejoin, isPrejoinPageVisible } from '../../../prejoin';
import { fullScreenChanged, showToolbox } from '../../../toolbox/actions.web';
import { Toolbox } from '../../../toolbox/components/web';
import { LAYOUTS, getCurrentLayout } from '../../../video-layout';
import { maybeShowSuboptimalExperienceNotification } from '../../functions';
import {
    AbstractConference,
    abstractMapStateToProps
} from '../AbstractConference';
import type { AbstractProps } from '../AbstractConference';

import { default as Notice } from './Notice';


declare var APP: Object;
declare var interfaceConfig: Object;

/**
 * DOM events for when full screen mode has changed. Different browsers need
 * different vendor prefixes.
 *
 * @private
 * @type {Array<string>}
 */
const FULL_SCREEN_EVENTS = [
    'webkitfullscreenchange',
    'mozfullscreenchange',
    'fullscreenchange'
];

/**
 * The CSS class to apply to the root element of the conference so CSS can
 * modify the app layout.
 *
 * @private
 * @type {Object}
 */
const LAYOUT_CLASSNAMES = {
    [LAYOUTS.HORIZONTAL_FILMSTRIP_VIEW]: 'horizontal-filmstrip',
    [LAYOUTS.TILE_VIEW]: 'tile-view',
    [LAYOUTS.VERTICAL_FILMSTRIP_VIEW]: 'vertical-filmstrip'
};

/**
 * The type of the React {@code Component} props of {@link Conference}.
 */
type Props = AbstractProps & {

    /**
     * The alpha(opacity) of the background
     */
    _backgroundAlpha: number,

    /**
     * Whether the local participant is recording the conference.
     */
    _iAmRecorder: boolean,

    /**
     * Returns true if the 'lobby screen' is visible.
     */
    _isLobbyScreenVisible: boolean,

    /**
     * The CSS class to apply to the root of {@link Conference} to modify the
     * application layout.
     */
    _layoutClassName: string,

    /**
     * Name for this conference room.
     */
    _roomName: string,

    /**
     * If prejoin page is visible or not.
     */
    _showPrejoin: boolean,

    dispatch: Function,
    t: Function,
    _conferenceID: number,

    isModerator: boolean,
    locationURL: Object,
    displayUserName: string,
    conferenceLimit: string,
    user: Object,
    conferencePar: Object,
    isOpenChat: boolean,
};

/**
 * The conference page of the Web application.
 */
class Conference extends AbstractConference<Props, *> {
    _onFullScreenChange: Function;
    _onShowToolbar: Function;
    _originalOnShowToolbar: Function;
    _setBackground: Function;

    /**
     * Initializes a new Conference instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        // Throttle and bind this component's mousemove handler to prevent it
        // from firing too often.
        this._originalOnShowToolbar = this._onShowToolbar;
        this._onShowToolbar = _.throttle(
            () => this._originalOnShowToolbar(),
            100,
            {
                leading: true,
                trailing: false
            }
        );

        // Bind event handler so it is only bound once for every instance.
        this._onFullScreenChange = this._onFullScreenChange.bind(this);
        this._setBackground = this._setBackground.bind(this);

        // this.handleLogout = this.handleLogout.bind(this);
    }

    /**
     * Start the connection and get the UI ready for the conference.
     *
     * @inheritdoc
     */
    componentDidMount() {
        const noSleep = new NoSleep();

        noSleep.enable();
        jitsiLocalStorage.setItem('inviteItems', JSON.stringify([
            {
                content: '6010',
                description: 'Calling outside the US? Please make sure you start with the country code!',
                filterValues: [ '6010', '6010' ],
                isDisabled: false,
                item: {
                    allowed: true,
                    country: '1',
                    number: '6010',
                    originalEntry: '6010',
                    showCountryCodeReminder: true,
                    type: 'phone'

                },
                value: '6010'
            }
        ]));

        const token = this.props.locationURL.searchParams.get('jwt');

        if (token) {
            meetingService.getMember(this.props._roomName, token).then(res => {
                const moderator = res.data.members.find(item => item.role === 'moderator');
                const member = res.data.members.find(item => item.meeting_panther.token === token);
                const dataUpdateSettings = {
                    emailModerator: moderator.email,
                    mode: res.data.mode
                };

                // if (member) {
                //     dataUpdateSettings.displayName = member.display_name;
                // }
                this.props.dispatch(updateSettings(dataUpdateSettings));

                this.props.dispatch({
                    type: 'UPDATE_MEETING',
                    meeting: res.data
                });

                const memberGuest = res.data.meeting_panther;

                if (memberGuest) {
                    this.props.dispatch(updateJWTPublish(memberGuest.token));
                }

                document.title = `${res.data.name} | ${interfaceConfig.APP_NAME}`;
                this._start(!(res.data.mode === 'silent' && member?.role === 'moderator'));
            })
            .catch(error => {
                window.location.href = window.location.origin;
            });
        } else {
            window.location.href = window.location.origin;
        }
    }

    /**
     * Calls into legacy UI to update the application layout, if necessary.
     *
     * @inheritdoc
     * returns {void}
     */
    componentDidUpdate(prevProps) {
        if (this.props.conferencePar !== prevProps.conferencePar) {
            meetingService.getMeeting(this.props._roomName).then(res => {
                if (res.data.codec) {
                    jitsiLocalStorage.setItem('codec', JSON.stringify(res.data.codec));
                }
                this.props.dispatch({
                    type: 'UPDATE_CODEC',
                    codec: res.data.codec
                });
            })
                .catch(e => {
                    console.log(e);
                });
        }
        if (
            this.props._shouldDisplayTileView
            === prevProps._shouldDisplayTileView
        ) {
            return;
        }

        // TODO: For now VideoLayout is being called as LargeVideo and Filmstrip
        // sizing logic is still handled outside of React. Once all components
        // are in react they should calculate size on their own as much as
        // possible and pass down sizings.
        VideoLayout.refreshLayout();
    }

    /**
     * Disconnect from the conference when component will be
     * unmounted.
     *
     * @inheritdoc
     */
    componentWillUnmount() {
        APP.UI.unbindEvents();

        FULL_SCREEN_EVENTS.forEach(name =>
            document.removeEventListener(name, this._onFullScreenChange)
        );

        APP.conference.isJoined() && this.props.dispatch(disconnect());
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        const {
            _iAmRecorder,
            _isLobbyScreenVisible,
            _layoutClassName,
            _showPrejoin,
            _conferenceID,

            // _isModerator,
            displayUserName,
            conferenceLimit,
            user,
            conferencePar,
            avatarUrl,
            isOpenChat,
            _roomName,
            isModerator: _isModerator
        } = this.props;

        const hideLabels = _iAmRecorder;

        return (
            <div
                className = { 'conference-flex' }>
                <Preview />
                <div
                    style = {{ width: '100%' }}
                    className = { 'vertical-filmstrip' }
                    id = 'videoconference_page'
                    onMouseMove = { this._onShowToolbar }
                    ref = { this._setBackground }>
                    <Notice />
                    <div
                        style = {{
                            display: 'flex',
                            zIndex: 1,
                            overflow: 'auto'
                        }}
                        id = 'videospace'
                        className = { `conference-content ${isOpenChat ? 'chat-active' : ''}` }>
                        <div className = { `conference-content-body ${isOpenChat ? 'open-chat' : ''}` }>
                            <div
                                className = { 'conference-header' }>
                                <AccountSettingTopView
                                    user = { user }
                                    show = { _roomName }
                                    isMod = { _isModerator }
                                    avatarUrl = { avatarUrl }
                                    displayName = { displayUserName } />
                            </div>
                            <div style = {{ display: 'none' }}>
                                <LargeVideo />
                            </div>
                            {_isModerator && <div
                                className = { 'account-setting-menu-display mod-setting-mobile w-100 mb-10' }>

                                <div
                                    className = { 'account-setting-dropdown' }>
                                    {this.props.displayUserName && <div
                                        className = { 'account-display-name' }>Hi, {this.props.displayUserName}</div>}
                                    <LogoutButton
                                        isMod = { _isModerator }
                                        avatarUrl = { avatarUrl } />


                                </div>

                            </div>}

                            {/* <KnockingParticipantList /> */}

                            <div
                                className = { 'conference-body' }>
                                <div
                                    className = { 'conference-container conference-container-500' }>
                                    {/* <ConferenceTimer />*/}
                                    <Filmstrip />
                                </div>
                                { _isLobbyScreenVisible
                                || <Toolbox />
                                }
                            </div>
                        </div>

                        <div
                            className = { `${isOpenChat ? 'open-chat' : ''}` }
                            style = {{
                                width: '100%',
                                zIndex: 1
                            }} >
                            <Footer />
                        </div>

                    </div>
                    <Chat />

                    {this.renderNotificationsContainer()}

                    <CalleeInfoContainer />

                    {_showPrejoin && <Prejoin />}
                </div>
            </div>
        );
    }

    /**
     * Sets custom background opacity based on config. It also applies the
     * opacity on parent element, as the parent element is not accessible directly,
     * only though it's child.
     *
     * @param {Object} element - The DOM element for which to apply opacity.
     *
     * @private
     * @returns {void}
     */
    _setBackground(element) {
        if (!element) {
            return;
        }

        if (this.props._backgroundAlpha !== undefined) {
            const elemColor = element.style.background;
            const alphaElemColor = setColorAlpha(
                elemColor,
                this.props._backgroundAlpha
            );

            element.style.background = alphaElemColor;
            if (element.parentElement) {
                const parentColor = element.parentElement.style.background;
                const alphaParentColor = setColorAlpha(
                    parentColor,
                    this.props._backgroundAlpha
                );

                element.parentElement.style.background = alphaParentColor;
            }
        }
    }

    /**
     * Updates the Redux state when full screen mode has been enabled or
     * disabled.
     *
     * @private
     * @returns {void}
     */
    _onFullScreenChange() {
        this.props.dispatch(fullScreenChanged(APP.UI.isFullScreen()));
    }

    /**
     * Displays the toolbar.
     *
     * @private
     * @returns {void}
     */
    _onShowToolbar() {
        this.props.dispatch(showToolbox());
    }

    /**
     * Until we don't rewrite UI using react components
     * we use UI.start from old app. Also method translates
     * component right after it has been mounted.
     *
     * @inheritdoc
     */
    _start(syncDevice) {
        APP.UI.start();

        APP.UI.registerListeners();
        APP.UI.bindEvents();

        FULL_SCREEN_EVENTS.forEach(name =>
            document.addEventListener(name, this._onFullScreenChange)
        );

        const { dispatch, t } = this.props;

        dispatch(connect(syncDevice));

        maybeShowSuboptimalExperienceNotification(dispatch, t);
    }
}

/**
 * Maps (parts of) the Redux state to the associated props for the
 * {@code Conference} component.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {Props}
 */

function _mapStateToProps(state) {
    const dialIn = state['features/invite'];

    const isModerator
        = getLocalParticipant(state)?.role === PARTICIPANT_ROLE.MODERATOR;

    const { locationURL } = state['features/base/connection'];
    const user = state['features/base/settings'].user;
    const displayName = state['features/base/settings'].displayName;
    const conferenceLimit = state['features/base/participants'].length;
    const conferencePar = state['features/base/participants'];
    const isOpenChat = state['features/chat'].isOpen;


    return {
        _conferenceID: dialIn.conferenceID,
        ...abstractMapStateToProps(state),
        _iAmRecorder: state['features/base/config'].iAmRecorder,
        _backgroundAlpha: state['features/base/config'].backgroundAlpha,
        _isLobbyScreenVisible:
            state['features/base/dialog']?.component === LobbyScreen,
        _layoutClassName: LAYOUT_CLASSNAMES[getCurrentLayout(state)],
        _roomName: state['features/base/conference'].room,
        _showPrejoin: isPrejoinPageVisible(state),

        isModerator,
        locationURL,
        displayUserName: user?.userName,
        conferenceLimit,
        user,
        conferencePar,
        avatarUrl: getLocalParticipant(state)?.loadableAvatarUrl,
        isOpenChat
    };
}
export default reactReduxConnect(_mapStateToProps)(translate(Conference));
