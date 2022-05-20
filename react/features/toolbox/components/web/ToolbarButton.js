/* @flow */

import React from 'react';

import { Icon, IconArrowDown, IconArrowUp } from '../../../base/icons';
import { Tooltip } from '../../../base/tooltip';
import AbstractToolbarButton from '../AbstractToolbarButton';
import type { Props as AbstractToolbarButtonProps } from '../AbstractToolbarButton';

/**
 * The type of the React {@code Component} props of {@link ToolbarButton}.
 */
type Props = AbstractToolbarButtonProps & {

    /**
     * The text to display in the tooltip.
     */
    tooltip: string,

    /**
     * From which direction the tooltip should appear, relative to the
     * button.
     */
    tooltipPosition: string,
    isRequest: boolean
};

/**
 * Represents a button in the toolbar.
 *
 * @extends AbstractToolbarButton
 */
class ToolbarButton extends AbstractToolbarButton<Props> {
    /**
     * Default values for {@code ToolbarButton} component's properties.
     *
     * @static
     */
    static defaultProps = {
        tooltipPosition: 'top'
    };

    /**
     * Initializes a new {@code ToolbarButton} instance.
     *
     * @inheritdoc
     */
    constructor(props: Props) {
        super(props);
        this._onKeyDown = this._onKeyDown.bind(this);
    }

    _onKeyDown: (Object) => void;

    /**
     * Handles 'Enter' key on the button to trigger onClick for accessibility.
     * We should be handling Space onKeyUp but it conflicts with PTT.
     *
     * @param {Object} event - The key event.
     * @private
     * @returns {void}
     */
    _onKeyDown(event) {
        // If the event coming to the dialog has been subject to preventDefault
        // we don't handle it here.
        if (event.defaultPrevented) {
            return;
        }

        if (event.key === 'Enter') {
            event.preventDefault();
            event.stopPropagation();
            this.props.onClick();
        }
    }

    /**
     * Renders the button of this {@code ToolbarButton}.
     *
     * @param {Object} children - The children, if any, to be rendered inside
     * the button. Presumably, contains the icon of this {@code ToolbarButton}.
     * @protected
     * @returns {ReactElement} The button of this {@code ToolbarButton}.
     */
    _renderButton(icon, label) {
        return (
            <div
                aria-label = { this.props.accessibilityLabel }
                aria-pressed = { this.props.toggled }
                className = { `toolbox-button flex-row ${this.props.className} ${this.props.disabled ? 'disable-audio-setting' : 'hover-button'} ${this.props.disabled && 'disabled-button'} ${this.props.noInvite && 'disabled-button-invite'} ` }
                onClick = { this.props.disabled || this.props.noInvite ? undefined : this.props.onClick }
                onKeyDown = { this._onKeyDown }
                role = 'button'
                style = {{
                    position: 'relative',

                    // backgroundColor: "#296592",
                    borderRadius: 4
                }}
                tabIndex = { 0 }>
                {icon && (
                    <div>
                        {label ? (
                            <Tooltip
                                content = { !this.props.disabled && this.props.tooltip }
                                position = { this.props.tooltipPosition }>
                                {icon}
                            </Tooltip>
                        ) : (
                            <Tooltip
                                content = { !this.props.disabled && this.props.tooltip }
                                position = { this.props.tooltipPosition }>
                                {icon}
                            </Tooltip>
                        )}
                    </div>
                )}
                {label && (
                    this.props.isRequest ? <Tooltip
                        content = { !this.props.disabled && this.props.tooltip }
                        position = { this.props.tooltipPosition }>
                        <div
                            style = {{
                                paddingRight: 8,
                                paddingLeft: icon ? 0 : 10
                            }}>
                            {label}
                        </div>
                    </Tooltip>
                        : <div
                            style = {{
                                paddingRight: 8,
                                paddingLeft: icon ? 0 : 10
                            }}>
                            {label}
                        </div>
                )}
                {
                    this.props.arrow ? <div
                        style = {{
                            position: 'absolute',
                            width: '100%',
                            bottom: 0
                        }}>
                        <Icon
                            src = { this.props.toggled ? IconArrowUp : IconArrowDown }
                            size = { 10 } />
                    </div> : null
                }
            </div>
        );
    }

    /**
     * Renders the icon of this {@code ToolbarButton}.
     *
     * @inheritdoc
     */
    _renderIcon() {
        return this.props.icon && !this.props.hiddenIcon ? (
            <div
                className = { `icon-button ${this.props.toggled ? 'toggled' : ''}` }>
                <Icon src = { this.props.icon } />
            </div>
        ) : null;
    }

    /**
     * Renders the icon of this {@code ToolbarButton}.
     *
     * @inheritdoc
     */
    _renderLabel() {
        return this.props.label ? (
            <span
                style = {{
                    fontSize: 13,
                    textTransform: 'uppercase',
                    fontWeight: 'bold'
                }}>
                {this.props.label}
            </span>
        ) : null;
    }
}

export default ToolbarButton;
