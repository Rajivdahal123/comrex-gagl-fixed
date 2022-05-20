import React from 'react';

import { IconChatControll, IconAudio, IconConnect, IconFrag, IconStats, Icon } from '../base/icons';


const ControllerMeeting = () => {
    const handleMuted = () => {

    };

    return (
        <div className = { 'controller-meeting' }>
            <div className = { 'invite-button' }>
                <button className = { 'invite-button-styled' }>
                    <p style = {{ fontWeight: 700 }}>INVITE</p>
                </button>
            </div>
            <div className = { 'connect-button' }>
                <button className = { 'connect-button-styled' }>
                    <Icon
                        src = { IconConnect }
                        size = { 15 } />
                    <p style = {{ fontWeight: 700 }}>CONNECT CODEC</p>
                </button>
            </div>
            <div className = { 'mute-button' }>
                <button className = { 'mute-button-styled' }>
                    <p style = {{ fontWeight: 700 }}>MUTE</p>
                </button>
            </div>
            <div className = { 'chat-button' }>
                <button className = { 'chat-button-styled' }>
                    <Icon
                        src = { IconChatControll }
                        size = { 15 } />
                    <p style = {{ fontWeight: 700 }}>CHAT</p>
                </button>
            </div>
            <div className = { 'stats-for-nerds' }>
                <button className = { 'stats-for-nerds-styled' }>
                    <Icon
                        src = { IconStats }
                        size = { 15 } />
                    <p style = {{ fontWeight: 700 }}>STATS FOR NERDS</p>
                </button>
            </div>
            <div className = { 'audio-setup' }>
                <button className = { 'audio-setup-styled' }>
                    <Icon
                        src = { IconAudio }
                        size = { 15 } />
                    <p style = {{ fontWeight: 700 }}>AUDIO SETUP</p>
                </button>

            </div>
            <div className = { 'frag' }>
                <button className = { 'frag-styled' }>
                    <Icon
                        src = { IconFrag }
                        size = { 15 } />
                </button>

            </div>
            <div className = { 'leave-room' }>
                <button className = { 'leave-styled' }>
                    <p style = {{ fontWeight: 700 }}>LEAVE ROOM</p>
                </button>

            </div>
        </div>
    );
};

export { ControllerMeeting };
