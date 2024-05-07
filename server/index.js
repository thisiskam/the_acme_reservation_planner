// server set up
const { client,
        createTables,
        createCustomer,
        createRestaurant,
        fetchCustomers,
        fetchRestaurants,
        fetchReservations,
        createReservation,
        destroyReservation
 } = require('./db')
const express = require('express')
const app = express()
app.use(express.json())
app.use(require('morgan')('dev'));


// get customers
app.get('/api/customers', async (req, res, next) => {
    try {
        res.send(await fetchCustomers())
    } catch(error) {
        next(error)
    }
})


// get restaurants
app.get('/api/restaurants', async (req, res, next) => {
    try {
        res.send(await fetchRestaurants())
    } catch(error) {
        next(error)
    }
})


// get reservations
app.get('/api/reservations', async (req, res, next) => {
    try {
        res.send(await fetchReservations())
    } catch(error) {
        next(error)
    }
})

// post a restaurant
app.post('/api/customers/:id/reservations', async (req, res, next) => {
    try {
        res.status(201).send(await createReservation({
            date: req.body.date,
            party_count: req.body.party_count,
            restaurant_id: req.body.restaurant_id,
            customer_id: req.params.id
        }))
    } catch(error) {
        next(error)
    }
})

// delete a restaurant
app.delete('/api/customers/:customer_id/reservations/:id', async (req, res, next) => {
    try {
        await destroyReservation({
            id: req.params.id,
            customer_id: req.params.customer_id
        })
        res.sendStatus(204)
    } catch(error) {
        next(error)
    }
})

// handle errors
app.use((error, req, res, next) => {
    res.status(res.status || 500).send({ error: error });
  });


// INIT
const init = async () => {
    // get client
    await client.connect(console.log('connected'))

    // create tables
    await createTables()

    // create customers and restaurants
    const [chelsea, max, tim, michelle, osteria, allgarb, taste_of_tokyo] = await Promise.all([
        createCustomer('chelsea'),
        createCustomer('max'),
        createCustomer('tim'),
        createCustomer('michelle'),
        createRestaurant('osteria'),
        createRestaurant('allgarb'),
        createRestaurant('taste of tokyo')
    ])

    // fetch customers/restaurants
    await fetchCustomers()
    await fetchRestaurants()
    await fetchReservations()

    // create reservations
    const [reservation1, reservation2, reservation3, reservation4, reservation5] = await Promise.all([
        createReservation({
            date: '06/18/2024',
            party_count: 5,
            customer_id: chelsea.id,
            restaurant_id: allgarb.id,
        }),
        createReservation({
            date: '06/1/2024',
            party_count: 12,
            customer_id: max.id,
            restaurant_id: taste_of_tokyo.id,
        }),
        createReservation({
            date: '05/13/2024',
            party_count: 2,
            customer_id: tim.id,
            restaurant_id: osteria.id,
        }),
        createReservation({
            date: '05/28/2024',
            party_count: 4,
            customer_id: michelle.id,
            restaurant_id: allgarb.id,
        }),
        createReservation({
            date: '07/02/2024',
            party_count: 7,
            customer_id: chelsea.id,
            restaurant_id: allgarb.id,
        })
    ]);

    // destroy reservation

    await destroyReservation({id: reservation1.id, customer_id: reservation1.customer_id});

    // listening on port...
    const port = process.env.PORT || 3005
    app.listen(port, console.log(`listening on port ${port}`))
}

init ()