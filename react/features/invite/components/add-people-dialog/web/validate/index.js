/* eslint-disable max-len */
import React from 'react';

const emailValidation = email => {
    const regex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const maxLength = /^.{1,80}$/;
    let error = '';

    if (regex.exec(email) !== null) {
        error = '';

        if (maxLength.exec(email) !== null) {
            error = '';
        } else {
            error = 'Maximum length is 80 characters';

            return error;
        }

        return error;

    }
    if (email) {
        error = 'Check the format of the email you entered';
    } else {
        error = 'Please enter guest email';
    }


    return error;


};

export { emailValidation };
