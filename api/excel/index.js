const XLSX = require('xlsx')


module.exports = {
    parseXL: function(filepath){
        var workbook = XLSX.readFile(filepath);
        var sheet = workbook.Sheets['Input'];
        console.log(sheet);
        var inputSheetData = XLSX.utils.sheet_to_json(sheet);
        // console.log(inputSheetData);
        let records = [];
        for(let i=0;i<inputSheetData.length;i++){
            records[i] = {};
            for(let k in inputSheetData[i]){
                records[i][k.toLowerCase().replace(/ /g,'')] = inputSheetData[i][k];
            }
        }
        console.log(records);
        return records;
    }
}