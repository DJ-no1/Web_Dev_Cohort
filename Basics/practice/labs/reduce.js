const numbers = [1, 2, 3, 4, 5];
const sum = numbers.reduce((accumulator, currentValue) => {
  return accumulator + currentValue;
}, 0);
console.log(sum); // Output: 15
















// Example 2: Count occurrences of items
const fruits = ["apple", "banana", "apple", "orange", "banana", "apple"];
const fruitCount = fruits.reduce((accumulator, fruit) => {
  accumulator[fruit] = (accumulator[fruit] || 0) + 1;
  return accumulator;
}, {});
console.log(fruitCount); // Output: { apple: 3, banana: 2, orange: 1 }

// Example 3: Flatten a nested array
const nested = [
  [1, 2],
  [3, 4],
  [5, 6],
];
const flattened = nested.reduce((accumulator, currentArray) => {
  return accumulator.concat(currentArray);
}, []);
console.log(flattened); // Output: [1, 2, 3, 4, 5, 6]


// Custom reduce implementation
function customReduce(array, callback, initialValue) {
    let accumulator = initialValue;
    for (let i = 0; i < array.length; i++) {
        accumulator = callback(accumulator, array[i], i, array);
    }
    return accumulator;
}

// Test it
const testNumbers = [10, 20, 30];
const result = customReduce(testNumbers, (acc, val) => acc + val, 0);
console.log(result); // Output: 60