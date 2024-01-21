const express = require("express");          // used to create the server and API
const bodyparser = require("body-parser");   // used to server accept JSON formet data
const app_server = express();                // Created a server "app_server" using express();

// configure the bodyparser
app_server.use(bodyparser.json()); 

// defining a port and listening to port with express server 
const PORT = 8000;
app_server.listen(PORT, () => {
  console.log("Server started successfully!");
});

let rooms = [
    {
        roomId: 'MS37',
        seats: "10",
        amenities: 'AC',
        onehourprice: '250'
    }
];

let bookings = [
    {
        customername: "Madesh",
        bookedDate: "20230910",
        startTime: "12:00pm",
        endTime: "11:59am",
        bookingID: "MS1",
        roomId: "M37",
        status: "booked",
    }
];

let customers = [
    {
        name: 'Madesh',
        bookings: [
            {
                customername: "Madesh",
                bookedDate: "20230910",
                startTime: "12:00pm",
                endTime: "11:59am",
                bookingID: "MS1",
                roomId: "M37",
                status: "booked",
            }
        ]
    }
];

// Middleware to check if the server is working
app_server.all("/app", (req, res, next) => {
    res.status(200).json({
        message: "server is working"
    });
});

// Endpoint to view all rooms and their details
app_server.get('/rooms', (req, res) => {
    res.status(200).json({
        RoomsList: rooms,
        message: "room details fetched successfully"
    });
});

// API endpoint for creating a room
app_server.post('/rooms/create', (req, res) => {
    const room = req.body;
    const existsRoomId = rooms.find(data => data.roomId === room.roomId);

    if (existsRoomId !== undefined) {
        return res.status(400).json({
            message: "room already exists"
        });
    } else {
        rooms.push(room);
        res.status(200).json({
            message: "room created"
        });
    }
});

// API endpoint for creating a booking
app_server.post("/booking/create/:id", (req, res) => {
    try {
        const { id } = req.params;
        const bookRoom = req.body;
        const date = new Date();
        const dateFormat = date.toLocaleDateString();
        const existsRoomId = rooms.find(data => data.roomId === id);

        if (existsRoomId === undefined) {
            return res.status(400).json({ 
                message: "room does not exist", 
                Rooms: rooms 
            });
        }

        const roomBookings = bookings.filter(data => data.roomId === id);  // here this code checking whether the room id existing or not for this it checks existing room id and new id.

        if (roomBookings.length > 0) {
            const dateConflict = roomBookings.some(data => data.bookedDate === bookRoom.bookedDate);

            if (!dateConflict) {
                const newID = "MS" + (bookings.length + 1);
                const newBooking = { ...bookRoom, bookingID: newID, roomId: id, status: "booked", bookedDate: dateFormat };
                bookings.push(newBooking);
                
                const customerDetails = customers.find(customer => customer.name === newBooking.customername);

                if (customerDetails) {
                    customerDetails.bookings.push(newBooking);
                } else {
                    customers.push({ name: newBooking.customername, bookings: [newBooking] });
                }

                return res.status(201).json({ 
                    message: "hall booked", 
                    Bookings: bookings, 
                    added: newBooking 
                });
            } else {
                return res.status(400).json({ 
                    message: "hall already booked for this date, choose another hall", 
                    Bookings: bookings 
                });
            }
        } else {
            const newID = "MS" + (bookings.length + 1);
            const newBooking = { ...bookRoom, bookingID: newID, roomId: id, status: "booked", booked_On: dateFormat };
            bookings.push(newBooking);
            
            const customerDetails = customers.find(customer => customer.name === newBooking.customername);

            if (customerDetails) {
                customerDetails.bookings.push(newBooking);
            } else {
                customers.push({ name: newBooking.customername, bookings: [newBooking] });
            }

            return res.status(201).json({ 
                message: "hall booked successfully", 
                Bookings: bookings, 
                added: newBooking 
            });
        }
    } catch (error) {
        res.status(400).json({ message: "error", error: error, data: bookings });
    }
});

// API endpoint to view all booked rooms
app_server.get('/bookedrooms', (req, res) => {
    const bookedRooms = bookings.map(booking => {
        const { roomId, status, customername, bookedDate, startTime, endTime } = booking;
        return { roomId, status, customername, bookedDate, startTime, endTime };
    });

    res.status(200).json(bookedRooms);
});

// API endpoint to list all customers with booked data
app_server.get('/customers', (req, res) => {
    const customerBookings = customers.map(customer => {
        const { name, bookings } = customer;
        const customerDetails = bookings.map(booking => {
            const { roomId, bookedDate, startTime, endTime } = booking;
            return { name, roomId, bookedDate, startTime, endTime };
        });

        return customerDetails;
    });

    res.json(customerBookings);
});

// API endpoint to list how many times a user booked a room
app_server.get('/customer/:name', (req, res) => {
    const { name } = req.params;
    const customer = customers.find(customer => customer.name === name);

    if (!customer) {
        res.status(404).json({ error: 'Customer not found' });
        return;
    }

    const customerBookings = customer.bookings.map(booking => {
        const { customername, roomId, startTime, endTime, bookingID, status, bookedDate, booked_On } = booking;
        return { customername, roomId, startTime, endTime, bookingID, status, bookedDate, booked_On };
    });

    res.json(customerBookings);
});