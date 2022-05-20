import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { translate } from '../../../base/i18n';
import { ToolbarButton } from '../../../toolbox/components';

interface RequestUnmuteButtonProps {
    onClick?: () => void
}

const RequestUnmuteButton: FC<RequestUnmuteButtonProps> = ({ onClick = () => {} }) => {
    const { t } = useTranslation();

    return (
        <ToolbarButton
            accessibilityLabel = { t('toolbar.accessibilityLabel.requestUnmute') }
            className = { 'toolbox-audio-toggle request-button' }
            isRequest = { true }
            key = 'requestUnmute'
            label = { '!' }
            onClick = { onClick }
            tooltip = { t('thumbnail.requestUnmute') } />
    );
};

export default translate(RequestUnmuteButton);
