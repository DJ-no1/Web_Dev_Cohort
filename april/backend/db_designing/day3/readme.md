# Clinic Management Database

A structured database design for managing a modern clinic’s operations — from patients and doctors to consultations, diagnostics, and billing.

## Features
- User system with roles (patient, doctor, admin)
- Patient and doctor profiles (1–1 with users)
- Doctor specialties and availability scheduling
- Appointment booking system
- Consultation records (symptoms, diagnosis, notes)
- Prescription management with multiple medicines
- Diagnostic test workflow (prescribed tests to reports)
- Medical history and allergy tracking
- Invoice and payment system with line items

## Core Flow
Patient → Appointment → Consultation →  
→ Prescription / Tests → Reports → Invoice → Payment

## Design Highlights
- Proper 1–1 and 1–many relationships
- Separation of test master data and prescribed tests
- Flexible billing system using invoice line items
- Scalable structure aligned with real-world clinic workflows

