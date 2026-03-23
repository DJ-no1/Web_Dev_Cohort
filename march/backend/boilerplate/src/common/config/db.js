import mongoose from "mongoose";

const connectionDB = async () => {

    const conn = await mongoose.connect(process.env.MONGODB_URI)

    //inside this conn there is a mongoose object 

    console.log(`MongoDB Connected : ${conn.connection.host}`)
    // 
    
}

export default connectionDB


/*

What exactly is conn?

According to Mongoose documentation:

mongoose.connect() returns a Mongoose instance (same singleton), but now it's connected to MongoDB.

So:

conn === mongoose // true

Yes — it literally returns the same mongoose object, just now connected.

🧠 What’s inside conn?

The most useful thing inside it is:

conn.connection

This is the actual database connection object.

📦 Important properties inside conn.connection

Here are the key things you can access:

1. Host (what you're using)
conn.connection.host

👉 Example: "localhost" or cluster URL

2. Port
conn.connection.port

👉 Example: 27017

3. Database name
conn.connection.name

👉 Example: "myDatabase"

4. Connection state
conn.connection.readyState

Values:

0 → disconnected
1 → connected
2 → connecting
3 → disconnecting
5. Full connection object
console.log(conn.connection)

This includes:

client (MongoDB driver)
db instance
collections
config
event listeners
🧪 If you log conn directly
console.log(conn);

You’ll see a huge object, including:

.connection → active DB connection
.models → all registered models
.Schema → schema constructor
.connections → array of connections
.plugins → applied plugins
⚠️ Important clarification

Many devs assume:

const conn = mongoose.connect(...)

means:

👉 “conn is the database connection”

❌ Not exactly.

✔️ Correct understanding:

conn = mongoose instance
conn.connection = actual DB connection
💡 Clean mental model

Think like this:

mongoose (library)
   ↓ connect()
mongoose (now connected)
   ↓
.connection → actual DB tunnel
🚀 Why your code works
console.log(`MongoDB connected: ${conn.connection.host}`)

Because:

conn.connection → gives connection object
.host → gives hostname
🧠 Pro tip (used in production)

You don’t even need conn:

await mongoose.connect(process.env.MONGODB_URI);

console.log(mongoose.connection.host);

Same result. Cleaner.


*/