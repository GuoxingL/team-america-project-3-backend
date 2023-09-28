import User from '../models/user.js';
import Event from '../models/event.js';

export async function getEvents(req, res) {
  try {
    // Fetch all events from the database
    const events = await Event.find();
    // Send the events as a JSON response
    res.status(200).json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

export async function createEvent(req, res) {
  console.log(req.body)
  try {
    const { name, address, coordinates, imageUrl, description, userId } = req.body;

    // Check if the provided user ID is valid
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { username } = user; // Get the username of the user

    const newEvent = new Event({
      userId, // Assign the user's ID to the event
      name, // Assign the event name
      author: username, // Assign the user's username to the event
      address,
      coordinates,
      imageUrl,
      description,
    });

    const savedEvent = await newEvent.save();

    // Update the user's document to include the new event
    user.events.push(savedEvent._id); // Add the event's ID to the user's events array
    await user.save();

    res.status(201).json(savedEvent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

export async function deleteEvent(req, res) {
  try {
    const eventId = req.params.id;

    if (!eventId) {
      return res.status(400).json({ message: 'Event ID is required' });
    }

    // Find the event by ID and check if it exists
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const userId = event.userId;

    // Remove the event ID from the user's list of events
    await User.findByIdAndUpdate(userId, {
      $pull: { events: eventId }  // Assuming the user has an 'events' array with event IDs
    });

    // Delete the event
    await Event.findByIdAndDelete(eventId);

    return res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

export async function updateEvent(req, res) {
  console.log('REQBODYYYYYYY', req.body)
  try {
    const userId = req.body.userId
    const eventId = req.params.id; // Assuming you pass the event ID in req.body
    console.log(eventId)
    if (!eventId) {
      return res.status(400).json({ message: 'Event ID are required' });
    }
    // Check if the provided user ID is valid
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Find the event by ID and check if it exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    // Check if the event belongs to the specified user
    if (event.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Event does not belong to this user' });
    }
    // Update the event with the provided data
    const updatedData = {
      name: req.body.name || event.name,
      address: req.body.address || event.address,
      imageUrl: req.body.imageUrl || event.imageUrl,
      description: req.body.details || event.description,
    };
    const updatedEvent = await Event.findByIdAndUpdate(eventId, updatedData, { new: true });
    return res.status(200).json(updatedEvent);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}