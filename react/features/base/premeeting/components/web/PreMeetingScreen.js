// @flow

import React, { PureComponent } from 'react';

import { AudioSettingsButton, VideoSettingsButton } from '../../../../toolbox/components/web';
import { VideoBackgroundButton } from '../../../../virtual-background';
import { checkBlurSupport } from '../../../../virtual-background/functions';
import { Avatar } from '../../../avatar';
import { LogoutButton } from '../../../buttons/LogoutButton';
import { IconLogoComrex, IconUserSm } from '../../../icons';
import { Popover } from '../../../popover';
import { allowUrlSharing } from '../../functions';

import { AccountSettingTopView } from './AccountSettingTopView';
import ConnectionStatus from './ConnectionStatus';
import CopyMeetingUrl from './CopyMeetingUrl';
import Preview from './Preview';


type Props = {

    /**
     * Children component(s) to be rendered on the screen.
     */
    children: React$Node,

    /**
     * Footer to be rendered for the page (if any).
     */
    footer?: React$Node,

    /**
     * The name of the participant.
     */
    name?: string,

    /**
     * Indicates whether the avatar should be shown when video is off
     */
    showAvatar: boolean,

    /**
     * Indicates whether the label and copy url action should be shown
     */
    showConferenceInfo: boolean,

    /**
     * Title of the screen.
     */
    title: string,

    /**
     * The 'Skip prejoin' button to be rendered (if any).
     */
     skipPrejoinButton?: React$Node,

    /**
     * True if the preview overlay should be muted, false otherwise.
     */
    videoMuted?: boolean,

    /**
     * The video track to render as preview (if omitted, the default local track will be rendered).
     */
    videoTrack?: Object,
    showJoinActions: boolean,
}

/**
 * Implements a pre-meeting screen that can be used at various pre-meeting phases, for example
 * on the prejoin screen (pre-connection) or lobby (post-connection).
 */
export default class PreMeetingScreen extends PureComponent<Props> {
    /**
     * Default values for {@code Prejoin} component's properties.
     *
     * @static
     */
    static defaultProps = {
        showAvatar: true,
        showConferenceInfo: true
    };

    /**
     * Implements {@code PureComponent#render}.
     *
     * @inheritdoc
     */
    render() {
        const { name, showAvatar, showConferenceInfo, title, videoMuted, videoTrack, showJoinActions, user, avatarUrl } = this.props;
        const showSharingButton = allowUrlSharing();

        return (
            <div
                className = 'premeeting-screen'
                id = 'lobby-screen'
                style = {{ height: '100%',
                    overflow: 'hidden' }}>
                <ConnectionStatus />
                <Preview
                    videoMuted = { videoMuted }
                    videoTrack = { videoTrack }
                    showJoinActions = { showJoinActions } />
                <div
                    className = 'content'
                    style = {{ overflow: 'auto' }}>
                    <div
                        className = { 'content-body' }
                        style = {{
                            padding: '13px 8px 13px 8px',
                            height: '50px',
                            padding: '0 8px',

                            // maxWidth: 600,
                            // width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            {
                                console.log("inside pre meeting view")
                            }
                        <AccountSettingTopView
                            user = { user }
                            avatarUrl = { avatarUrl } />
                    </div>
                    <div
                        style = {{
                            flex: 1,
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                        <div className = 'content-body p-10 mb-400'>
                            { this.props.children }
                        </div>
                    </div>
                    {/* {showAvatar && videoMuted && (
                        <Avatar
                            className = 'premeeting-screen-avatar'
                            displayName = { name }
                            dynamicColor = { false }
                            participantId = 'local'
                            size = { 80 } />
                    )} */}
                    {/* {showConferenceInfo && (
                        <>
                            <div className = 'title'>
                                { title }
                            </div>
                            {showSharingButton ? <CopyMeetingUrl /> : null}
                        </>
                    )} */}

                    {/* <div className = 'media-btn-container'>
                        <div className = 'toolbox-content'>
                            <div className = 'toolbox-content-items'>
                                <AudioSettingsButton visible = { true } />
                                <VideoSettingsButton visible = { true } />
                                <VideoBackgroundButton visible = { checkBlurSupport() } />
                            </div>
                        </div>
                    </div> */}
                    {/* { this.props.skipPrejoinButton }
                    { this.props.footer } */}
                    <div className = { 'footer-stack' }>
                        <p
                            className = { 'font-size-350' }
                            style = {{
                                fontSize: 12,
                                fontFamily: 'auto',
                                color: '#777777'
                            }}>
                            © 2021 Comrex Corporation. All Rights Reserved
                        </p>
                    </div>
                </div>
            </div>
        );
    }
}
