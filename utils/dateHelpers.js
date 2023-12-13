const unabbreviatedMonths = [2, 3, 4, 5, 6]; // months are zero-indexed

function formatDate(date) {
    const month = date?.getMonth();
    const options = { 
        year: "numeric", 
        month: unabbreviatedMonths.includes(month) ? "long" : "short", 
        day: "numeric" 
    };
    return new Date(date).toLocaleDateString(undefined, options);
}

module.exports = formatDate;
