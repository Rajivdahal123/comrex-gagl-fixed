// @flow

import Spinner from '@atlaskit/spinner';

import { IconHangup } from '../../icons';

import AbstractButton from './AbstractButton';
import type { Props } from './AbstractButton';

/**
 * An abstract implementation of a button for disconnecting a conference.
 */
export default class AbstractHangupButton<P : Props, S: *>
    extends AbstractButton<P, S> {

    icon = IconHangup;

    /**
     * Change disconnecting icon instead of hangup icon when user leaves meeting.
     *
     * @private
     * @returns {string}
     */
    _getIcon() {
        return this.state?.loading ? Spinner : IconHangup;
    }


    /**
     * Handles clicking / pressing the button, and disconnects the conference.
     *
     * @protected
     * @returns {void}
     */
    _handleClick() {
        this._doHangup();
    }

    /**
     * Helper function to perform the actual hangup action.
     *
     * @protected
     * @returns {void}
     */
    _doHangup() {
        // To be implemented by subclass.
    }
}
