import {
    Dialog,
    FillScreen,
    dialogWidth,
    dialogHeight,
    PositionerAbsolute,
    PositionerRelative
} from '@atlaskit/modal-dialog/dist/es2019/styled/Modal.js';
import { N0, DN50 } from '@atlaskit/theme/colors';
import { themed } from '@atlaskit/theme/components';
import React from 'react';

const ThemedDialog = props => {

    let backgroundColor = themed({ light: N0,
        dark: DN50 })({ theme: { mode: 'dark' } });

    if (props.isChromeless) {
        backgroundColor = 'transparent';
    }

    if (props.backgroundColor) {
        backgroundColor = props.backgroundColor;
    }

    const style = { backgroundColor };

    const invitePopup = { backgroundColor: 'white' };

    return (<Dialog
        { ...props }
        aria-modal = { true }
        style = { invitePopup }
        theme = {{ mode: 'dark' }} />);
};

export { ThemedDialog as Dialog, FillScreen, dialogWidth, dialogHeight, PositionerAbsolute, PositionerRelative };
