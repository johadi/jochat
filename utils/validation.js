/**
 * Created by ILYASANATE on 05/04/2017.
 */
let isRealString=(str)=>{
    return typeof str ==='string' && str.trim().length > 0;
};
let isImageAvailable=(path)=>{
    return path.length > 0
}
let realValue=(str)=>{
    return str.trim().toLowerCase()
};
module.exports={isRealString,realValue,isImageAvailable};