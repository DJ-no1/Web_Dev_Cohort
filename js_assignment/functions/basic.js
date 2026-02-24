// function greet(){
//   console.log(`'Hello, World!'`)
// }


// const flimset = {
//     crew: "Anand",
//     prepareProps(){
//         console.log(`Preparing props with ${this.crew}`);

//         function arrangeChairs(){
//             console.log(`Arranging chairs with ${this.crew}`);
//         }
//     }
// }


// Array.prototype.flating = function(arr){
// this.arr = arr;
// for (let i = 0; i < this.arr.length; i++){
//     if(Array.isArray(this.arr[i])){
//         this.flating(this.arr[i]);
//     } else {
//         console.log(this.arr[i]);
//     }
// }


// }

// const arr = [1, 2, [3, 4], [5, [6, 7]]];

// let result = arr.flating(arr);
// console.log(result);
let arr = [1, 2, [3, 4], [5, [6, 7]]];

for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr[i].length; j++) {
        console.log(arr[i][j]);
    }
}
// let fruits = ["Apple", "Orange", "Plum"];

// for (let fruit of fruits) {
//   alert( fruit );
// }


function customFlat(arr) {
    let result = [];
    
    for (let item of arr) {
        if (Array.isArray(item)) {
            result = result.concat(customFlat(item));
        } else {
            result.push(item);
        }
    }
    
    return result;
}

let humans = [1, 2, [3, 4], [5, [6, 7, 8, [4, 5, 6]]]];

let flatHumans = customFlat(humans);
console.log(flatHumans);

let arr1 = [1, 2, 3];
let arr2 = [4, 5, 6];


let concaaa = arr1.concat(arr2);
console.log(concaaa);


