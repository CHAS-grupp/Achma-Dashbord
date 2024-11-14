/* // seed.js (bytt från .mjs till .js för att använda CommonJS)



require('dotenv').config(); // Ladda .env-filen
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/Users');
const Customer = require('./models/Customer');
const Invoice = require('./models/Invoice');
const Revenue = require('./models/Revenue');
const { invoices, customers, revenue, users } = require('../app/lib/placeholder-data.js');

// Anslut till MongoDB
const uri = process.env.DATABASE;

mongoose.connect(uri)
  .then(() => console.log('Connected successfully to MongoDB'))
  .catch((error) => console.error('Connection error:', error));

async function seedUsers() {
  try {
    // Skapa användare med hashade lösenord
    const insertedUsers = await Promise.all(
      users.map(async (user) => {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        return User.updateOne(
          { email: user.email },
          { $setOnInsert: { ...user, password: hashedPassword } },
          { upsert: true }
        );
      })
    );
    console.log(`Seeded ${insertedUsers.length} users`);
  } catch (error) {
    console.error('Error seeding users:', error);
  }
}

async function seedCustomers() {
  try {
    const insertedCustomers = await Promise.all(
      customers.map((customer) =>
        Customer.updateOne(
          { email: customer.email },
          { $setOnInsert: customer },
          { upsert: true }
        )
      )
    );
    console.log(`Seeded ${insertedCustomers.length} customers`);
  } catch (error) {
    console.error('Error seeding customers:', error);
  }
}

async function seedInvoices() {
  try {
    const insertedInvoices = await Promise.all(
      invoices.map((invoice) =>
        Invoice.updateOne(
          { id: invoice.id },
          { $setOnInsert: invoice },
          { upsert: true }
        )
      )
    );
    console.log(`Seeded ${insertedInvoices.length} invoices`);
  } catch (error) {
    console.error('Error seeding invoices:', error);
  }
}

async function seedRevenue() {
  try {
    const insertedRevenue = await Promise.all(
      revenue.map((rev) =>
        Revenue.updateOne(
          { month: rev.month },
          { $setOnInsert: rev },
          { upsert: true }
        )
      )
    );
    console.log(`Seeded ${insertedRevenue.length} revenue`);
  } catch (error) {
    console.error('Error seeding revenue:', error);
  }
}

async function main() {
  try {
    await seedUsers();
    await seedCustomers();
    await seedInvoices();
    await seedRevenue();
    console.log('Database seeding completed');
  } catch (err) {
    console.error('An error occurred during seeding:', err);
  } finally {
    mongoose.connection.close(); // Stäng anslutningen
  }
}

main();



 */


// seed.js
require('dotenv').config(); // Ladda .env-filen
const connectDB = require('../scripts/db'); // Importera den uppdaterade anslutningsfunktionen
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/Users');
const Customer = require('./models/Customer');
const Invoice = require('./models/Invoice');
const Revenue = require('./models/Revenue');
const { invoices, customers, revenue, users } = require('../app/lib/placeholder-data.js');

async function seedUsers() {
  try {
    const insertedUsers = await Promise.all(
      users.map(async (user) => {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        return User.updateOne(
          { email: user.email },
          { $setOnInsert: { ...user, password: hashedPassword } },
          { upsert: true }
        );
      })
    );
    console.log(`Seeded ${insertedUsers.length} users`);
  } catch (error) {
    console.error('Error seeding users:', error);
  }
}

async function seedCustomers() {
  try {
    const insertedCustomers = await Promise.all(
      customers.map((customer) =>
        Customer.updateOne(
          { email: customer.email },
          { $setOnInsert: customer },
          { upsert: true }
        )
      )
    );
    console.log(`Seeded ${insertedCustomers.length} customers`);
  } catch (error) {
    console.error('Error seeding customers:', error);
  }
}

async function seedInvoices() {
  try {
    const insertedInvoices = await Promise.all(
      invoices.map((invoice) => {
        // Skapar ett nytt ObjectId om det inte redan finns
        return Invoice.updateOne(
          { _id: invoice._id || new mongoose.Types.ObjectId() },
          { $setOnInsert: { ...invoice } },
          { upsert: true }
        );
      })
    );
    console.log(`Seeded ${insertedInvoices.length} invoices`);
  } catch (error) {
    console.error('Error seeding invoices:', error);
  }
}

async function seedRevenue() {
  try {
    const insertedRevenue = await Promise.all(
      revenue.map((rev) =>
        Revenue.updateOne(
          { month: rev.month },
          { $setOnInsert: rev },
          { upsert: true }
        )
      )
    );
    console.log(`Seeded ${insertedRevenue.length} revenue`);
  } catch (error) {
    console.error('Error seeding revenue:', error);
  }
}

async function main() {
  try {
    // Anslut till databasen
    await connectDB();

    // Rensa gamla index om de finns
    await Invoice.collection.dropIndexes().catch((error) => {
      if (error.codeName === 'IndexNotFound') {
        console.log('No indexes to drop on Invoices.');
      } else {
        console.error('Error dropping indexes:', error);
      }
    });

    // Seeda databasen
    await seedUsers();
    await seedCustomers();
    await seedInvoices();
    await seedRevenue();
    console.log('Database seeding completed');
  } catch (err) {
    console.error('An error occurred during seeding:', err);
  } finally {
    // Stäng anslutningen endast om den är ansluten
    if (mongoose.connection.readyState !== 0) {
      try {
        await mongoose.connection.close(); // Använd await istället för callback
        console.log('MongoDB connection closed.');
      } catch (closeError) {
        console.error('Failed to close MongoDB connection:', closeError);
      }
    }
  }
}

main();
