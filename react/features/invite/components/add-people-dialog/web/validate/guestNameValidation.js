import React from 'react';

const guestNameValidate = name => {
    const regex = /(.*[a-z].*)/;
    const textOnly = /^[a-zA-Z .\-_]+$/;
    const maxLength = /^.{1,80}$/;
    let error = '';

    if (name) {
        error = '';
        if (maxLength.exec(name) !== null) {
            error = '';
        } else {
            error = 'Maximum length is 80 characters';

            return error;
        }

        return error;
    }
    error = 'Please enter guest name';

    return error;


};

export { guestNameValidate };
