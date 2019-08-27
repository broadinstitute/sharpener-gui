import React from "react";

export const tap = (data) => {
    console.log(data);
    return data;
};

export const properCase = (string) => {
    const fillwords = [
        "a", "with", "for"
    ];
    string = underscoreToSpaces(string);
    return string.split(' ').map(function(word){
        return !fillwords.includes(word) ? word.charAt(0).toUpperCase() + word.substr(1).toLowerCase() : word;
    }).join(' ');
};

export const pluralize = (length, word) => {
    return length + ' ' + word + (length > 1 ? "s" : length <= 0 ? "s" : '')
};

export const underscoreToSpaces = (string) => {
    return string.split('_').join(' ');
}