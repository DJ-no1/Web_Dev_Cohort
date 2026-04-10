Smart Elevator Management System – DB Schema

This project defines a structured database schema for managing a smart elevator system in modern buildings, focusing on infrastructure, real-time operations, and analytics.

Overview

The system models:

Building infrastructure (floors, shafts)
Elevator configuration and capabilities
Real-time elevator state and ride handling
Maintenance and anomaly tracking
1. Physical Infrastructure
Building: Core entity with location, floors, and eco settings
Floor: Linked to building, includes security and designation
Elevator_Shaft: Physical shafts inside buildings
2. Elevator Configuration
Elevator: Defines capacity, type, and performance
Elevator_Floor_Coverage: Maps which floors each elevator serves (supports express elevators)
3. Real-Time Operations
Elevator_Current_State: Live telemetry (floor, load, direction, temperature, etc.)
Floor_Request: User requests (source to destination, ADA support, AI-predicted)
Ride_Allocation: Maps requests to elevators with performance metrics such as wait time, energy usage, and passenger estimates
4. Logs and Monitoring
Maintenance_Log: Tracks repairs, costs, and technician activity
Anomaly_Log: AI-detected issues such as delays or abnormal behavior
Key Features
Real-time elevator tracking
AI-based request prediction and anomaly detection
Energy efficiency monitoring (regenerative systems)
Flexible ride allocation system
Maintenance and diagnostics support
Use Cases
Smart buildings and IoT systems
High-rise traffic optimization
Energy-efficient infrastructure
Predictive maintenance systems