const customer = require("./db/customer.json");
//console.log(customer);
const fs = require("fs");

const newCustomerData = {
    name: 'Test Customer',
    order_count: 0,
    address: 'Po Box City'
}


fs.writeFile("./db/customer.json",  JSON.stringify(newCustomerData, null, 2), err => {
    if(err){
        console.log(err);
    } else {
        console.log("file successfully written")
    }
});

fs.readFile("./db/customer.json", "utf-8", (err, jsonString) => {
    if (err) {
        console.log(err);
    } else {
        try{
            const data = JSON.parse(jsonString);
            console.log(data.id);
        } catch(error){
            console.log('Error parsing JSON', error);
        }
    }
});
