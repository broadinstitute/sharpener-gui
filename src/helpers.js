import React from "react";

export const tap = (data, message="") => {
    console.log(message, data);
    return data;
};

// TODO: i'm using this function in a stupid way
// export const sigFig = (number, sigfig) => {
//     function precise(number, sigFig) {
//         return Number.parseFloat(number).toPrecision(sigFig);
//     }
//     return Number(number) == number && Number(number) % 1 !== 0 ? precise(number, sigfig) : number;
// };


export const pluralize = (length, word) => {
    return length + ' ' + word + (length > 1 ? "s" : length <= 0 ? "s" : '')
};

export const underscoreToSpaces = (string) => {
    return string.split('_').join(' ');
};

export const formatAbbreviations = (gla) => {
    return gla.replace(/_/g, " ")
        .replace(/Id/gi, "ID")
        .replace(/Hgnc/gi, "HGNC")
        .replace(/Mygene/gi, "MyGene")
        .replace(/Mim/gi, "MIM");
};

export const resolveGeneListName = (transaction, passive=false) => {
    // convert the gene list's transaction into a name
    if(!passive) {
        return ""
    } else {
        return ""
    }
};

export const flatten = function(arr, result = []) {
    for (let i = 0, length = arr.length; i < length; i++) {
        const value = arr[i];
        if (Array.isArray(value)) {
            flatten(value, result);
        } else {
            result.push(value);
        }
    }
    return result;
};

export const hashCode = (string) => {
    let hash = 0;
    if (string.length === 0) {
        return hash;
    }
    for (let i = 0; i < string.length; i++) {
        const char = string.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
};

export function geneListTitleOf(transaction) {
    return transaction.frequency.value + " – " + transaction.frequency.name
}