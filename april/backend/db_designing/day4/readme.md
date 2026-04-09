eraser link : https://app.eraser.io/workspace/pN2GIWah7sS483oAiBe3

# Parking Management System (Comic-Con Themed)

This project defines a database schema for a parking management system designed for high-traffic events like Comic-Con. It supports vehicle tracking, themed parking zones, session handling, and flexible payments.

---

## Modules

### Vehicle Management
- Manages vehicle categories and vehicles
- Supports different pricing for commercial and standard vehicles

### Event Integration
- Links parking sessions with Comic-Con passes
- Enables benefits like free parking for specific pass types

### Parking Infrastructure
- Organizes parking into zones and spot categories
- Supports special spots (VIP, EV, Cosplayer, oversized)

### Sessions and Transactions
- Tracks entry and exit using parking sessions
- Generates tickets with QR/barcode
- Handles payments with discounts and promo codes

---

## Key Relationships

- A vehicle belongs to a vehicle category
- A parking spot belongs to a zone and a spot category
- A parking session connects vehicle, spot, and pass
- A session has one ticket and multiple payments

---

## Features

- Themed parking zones
- Flexible pricing and discount system
- Support for cosplay prop unloading
- Scalable session and payment tracking

---

## Design Notes

- Payment is modeled as one-to-many with sessions for flexibility
- Ticket is strictly one-to-one with a session
- Supports both pre-booked and walk-in parking scenarios