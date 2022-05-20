import React, { useEffect, useState } from 'react';


const width = 1000;
const maxHeight = 50;
const AudioWave = ({ value, isJigasi }) => {
    if (isJigasi) {
        // console.log('codec value', value);
    }

    // const [ data, setData ] = useState([]);
    // const [ height, setHeight ] = useState(maxHeight);
    // const [ countFake, setCountFake ] = useState(0);
    // const [ strokeWidth, setStrokeWidth ] = useState(1);

    // const getMaxX = () => data[data.length - 1]?.x;

    // const getMaxY = () => data.reduce((max, p) => p.y > max ? p.y : max, data[0].y);

    // const getSvgX = x => (x / getMaxX()) * width;

    // const getSvgY = y => Math.floor(height - ((y / getMaxY()) * height), 10) || 0;

    // const makePath = array => {
    //     if (!array.length) {
    //         return null;
    //     }

    //     let pathD
    //         = `M ${getSvgX(array[0].x)} ${getSvgY(array[0].y)} `;

    //     pathD += array.map((point, i) => `L ${getSvgX(point.x)} ${getSvgY(point.y)} `);
    //     pathD = pathD.replaceAll(',', ''); // firefox - remove all commas from path

    //     return (<path
    //         d = { pathD }
    //         stroke = { value > 0.001 ? 'black' : 'rgb(33, 150, 243)' }
    //         strokeWidth = { strokeWidth }
    //         fill = 'none' />);
    // };

    // const createFakeData = max => {
    //     const results = [];

    //     for (let x = 0; x <= width - 400; x++) {
    //         const y = Math.floor(Math.random() * (max + 1));

    //         results.push({ x,
    //             y });
    //     }

    //     return results;
    // };

    // useEffect(() => {
    //     let newValue = value;

    //     if (value > 0.2) {
    //         setCountFake(0);
    //     } else if (value < 0.1 && countFake) {
    //         newValue = 0.2;
    //         setCountFake(countFake - 1);
    //     }


    //     let ratio = newValue * maxHeight * height;

    //     if (ratio === 0) {
    //         ratio = 1;
    //     }

    //     if (ratio > 50) {
    //         ratio = maxHeight;
    //     }

    //     if (ratio < (maxHeight / 2)) {
    //         setStrokeWidth(0.5);
    //     } else {
    //         setStrokeWidth(0.7);
    //     }
    //     if (ratio > 0 && ratio <= 50) {
    //         setHeight(ratio);
    //     }


    //     setData(createFakeData(ratio));
    // }, [ value ]);

    return (<div
        className = 'audio-wave-box-mask'
        style = {{ width: `${value < 1 ? (1 - (value * 4.5)) * 100 : 0}%` }} />);
};

export default AudioWave;
