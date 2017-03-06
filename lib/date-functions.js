'use strict';
function getMonday(d) {
    var day = d.getDay();
    if (day === 1) {
        d.setHours(0, 0, 0);
        return d;
    }
    var diff = d.getDate() - day + (day == 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    monday.setHours(0, 0, 0);
    return monday;
}

function getSunday(d) {
    const monday = getMonday(d);
    var diff = monday.getDate() + 6;
    const sunday = new Date(d.setDate(diff));
    sunday.setHours(23, 55, 55);
    return sunday;
}

function getWeekDates(monday) {
    return Array(7).fill(1).reduce(function(newArray, singleItem, index) {
        const mondayClone = new Date(monday);
        var diff = mondayClone.getDate() + index;
        return newArray.concat(new Date(mondayClone.setDate(diff)));
    }, []);
}

module.exports = {
    getMonday: getMonday,
    getSunday: getSunday,
    getWeekDates: getWeekDates
};
