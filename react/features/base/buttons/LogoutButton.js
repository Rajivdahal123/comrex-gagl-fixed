import DropdownMenu, {
    DropdownItem,
    DropdownItemGroup
} from '@atlaskit/dropdown-menu';
import React from 'react';
import { useDispatch } from 'react-redux';
import { disconnect } from '../connection';
import { EditProfile, IconUserSm } from '../icons';
import { updateSettings } from '../settings';

const LogoutButton = ({isMod, avatarUrl, handleProfile, handleSecurity}) => {
    const _isModerator = isMod;
    // const avatarUrl = props.avatarUrl;
    const dispatch = useDispatch();

    const handleLogout = () => {
        console.log("inside handle logout")
        dispatch(updateSettings({
            user: ''
        }));
        // dispatch(disconnect(true));
    };

    return (
        <div className = { 'logout-button' }>
            <DropdownMenu
                className = { 'dropdown-menu-logout-btn' }
                triggerButtonProps = {{
                    component: () => (
                        <div
                            style = {{
                                width: 35
                            }}>
                            {_isModerator ? (avatarUrl ?
                                <div className='wrap-avatar-account'><img className="avatar-account"
                                          src={avatarUrl}/></div> : <IconUserSm
                                color = { 'white' } />) : <EditProfile color = { 'white' } />}
                        </div>
                    )
                }}
                position = { 'bottom right' }
                triggerType = 'button' >
                <DropdownItemGroup>
                    <DropdownItem
                        onClick = { handleProfile}>Profile</DropdownItem>
                    <DropdownItem
                        onClick = { handleSecurity}>Security</DropdownItem>
                    <DropdownItem
                        onClick = { handleLogout }>Logout</DropdownItem>
                </DropdownItemGroup>
            </DropdownMenu>
        </div>

    );
};

export { LogoutButton };
