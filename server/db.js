const pg = require('pg')

// CREATE CLIENT
const client = new pg.Client(process.env.DB_Name  || 'postgress://localhost/acme_reservations')


const uuid = require('uuid')


// CREATE TABLES
const createTables = async () => {
    const SQL = /* SQL */ `
        DROP TABLE IF EXISTS reservations;
        DROP TABLE IF EXISTS restaurants;
        DROP TABLE IF EXISTS customers;
        CREATE TABLE customers(
            id UUID PRIMARY KEY,
            name VARCHAR(50) NOT NULL UNIQUE
        );
        CREATE TABLE restaurants(
            id UUID PRIMARY KEY,
            name VARCHAR(50) NOT NULL UNIQUE
        );
        CREATE TABLE reservations(
            id UUID PRIMARY KEY,
            date DATE NOT NULL,
            party_count INTEGER NOT NULL,
            restaurant_id UUID REFERENCES restaurants(id) NOT NULL,
            customer_id UUID REFERENCES customers(id) NOT NULL
        );
    `;
    await client.query(SQL)
    console.log('tables created');
}

// CREATE CUSTOMER
const createCustomer = async (name) => {
    const SQL = /* SQL */ `
        INSERT INTO customers(id, name) VALUES($1, $2)
        RETURNING *;
    `;
    const response = await client.query(SQL, [uuid.v4(), name])
    return response.rows[0]
}

// CREATE RESTAURANT
const createRestaurant = async (name) => {
    const SQL = /* SQL */ `
        INSERT INTO restaurants(id, name) VALUES($1, $2)
        RETURNING *;
    `;
    const response = await client.query(SQL, [uuid.v4(), name])
    return response.rows[0]
}

// FETCH CUSTOMERS
const fetchCustomers = async() => {
    const SQL = /* SQL */ `
        SELECT * FROM customers;
    `
    const response = await client.query(SQL)
    return response.rows
}

// FETCH RESTAURANTS
const fetchRestaurants = async() => {
    const SQL = /* SQL */ `
        SELECT * FROM restaurants;
    `;
    const response = await client.query(SQL)
    return response.rows
}

// FETCH RESERVATIONS
const fetchReservations = async() => {
    const SQL = /* SQL */ `
        SELECT * FROM reservations;
    `
    const response = await client.query(SQL)
    return response.rows
}

// CREATE RESERVATION
const createReservation = async ({date, party_count, restaurant_id, customer_id}) => {
    const SQL = /* SQL */ `
        INSERT INTO reservations(id, date, party_count, restaurant_id, customer_id)
        VALUES ($1,$2,$3,$4,$5)
        RETURNING *
    `
    const response = await client.query(SQL, [uuid.v4(), date, party_count, restaurant_id, customer_id])
    return response.rows[0]
}

// DELETE RESERVATION 
const destroyReservation = async ({id, customer_id}) => {
    const SQL = /* SQL */ `
        DELETE FROM reservations
        WHERE id=$1 AND customer_id=$2
    `;
    await client.query(SQL, [id, customer_id])
}


module.exports = {
    client,
    createTables,
    createCustomer,
    createRestaurant,
    fetchCustomers,
    fetchRestaurants,
    fetchReservations,
    createReservation,
    destroyReservation
}