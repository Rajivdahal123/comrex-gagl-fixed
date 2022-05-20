import React from 'react';

const validate = value => {
    const regex = /^$|\s+/;
    let error = '';

    if (regex.exec(value) === null) {
        error = '';

        return error;
    }
    error = '* You need to fill it out';

    return error;


};

export { validate };
