
import React from 'react';


import { LogoutButton } from '../../../buttons/LogoutButton';
import { IconLogoComrex } from '../../../icons';


const AccountSettingTopView = isMod => (
    <div
        className = { 'account-setting-header' }>
        <div
            className = { `account-comrex account-comrex-500 ${isMod.length === undefined && !isMod.isMod ? 'account-comrex-no-mod' : ''}` }>
            <a
                href = { 'https://www.comrex.com/' }
                target = { '_blank' }>
                <IconLogoComrex
                    style = {{
                        marginRight: 10,
                        // height: '100%',
                        width: 150
                    }} />
            </a>
            <img
                src = '../../../../../../images/gagl.png'
                style = {{ height: 59 }} />
        </div>
        {isMod.isMod && <div
            className = { 'account-setting-menu hide-mod-setting' }>

            <div
                className = { 'account-setting-dropdown' }>
                <div
                    style = {{ marginRight: 10 }}
                    className = { 'account-display-name' }>Hi, {isMod.displayName}
                </div>
                <LogoutButton
                    isMod = { isMod.isMod }
                    moderator={isMod}
                    avatarUrl = { isMod.avatarUrl } />
            </div>
        </div>}
    </div>
)
;

export { AccountSettingTopView };
