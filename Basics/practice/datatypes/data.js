// function availableSabzi(shoppingList, priceList) {
//   const available = shoppingList.filter(
//     (item) => priceList[item] !== undefined,
//   );
//   console.log("available :>> ", available);
//   console.log(Array.isArray(available));
//   console.log(typeof available);
//   return available;
// }

// availableSabzi(["aloo", "tamatar", "bhindi"], { aloo: 30, bhindi: 50 });

// Expected:
// ["aloo", "bhindi"]


function affordableSabzi(priceList) {
  // your logic
    const affordable = Object.keys(priceList).filter((sabzi) => priceList[sabzi] <= 80);


    console.log('affordable :>> ', affordable);

    return affordable;
}



affordableSabzi([{kiwi:20, mango: 40} , { aloo: 10, tamatar: 100, bhindi: 20 }  ]);

// Expected:
// ["aloo", "bhindi"]


