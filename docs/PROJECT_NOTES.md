# Project notes

## Platform
Android app (Google Play). The web version stays as the owner's counter-PC view and the design reference.

## Requirements (confirmed)
- Customers can register a service request for a printer, CCTV, computer/laptop, networking or other device. It is saved on their profile.
- The owner is notified by SMS and inside the app when a new request or order arrives.
- The owner updates the status at each repair step. The customer is notified by SMS and inside the app at every step.
- Login options: mobile number or email (Gmail) with a password, or "Continue with Google". New users can create an account (name, mobile number or email, password) or sign up with Google. A one-time code (SMS or email) confirms a new account and resets a forgotten password.

## Roles
- Customer: browse shop, place orders, send repair requests and enquiries, track status
- Owner (Nitish Kamlapuri): see all requests, move them to the next status, add and hide products

## Status steps
- Repair: Received, Diagnosed, In repair, Ready for pickup, Delivered
- Order: Placed, Confirmed, Packed, Out for delivery, Delivered
- Enquiry: New, Quote sent, Closed

## Categories
Laptops (second-hand), Printers, CCTV, Accessories, Networking, Repair

## Starting prices
- Second-hand laptops from Rs 15,000 (Dell, HP, Acer, Lenovo)
- CCTV cameras from Rs 1,199
- Printers from Rs 4,999

## Needed for the real build
- SMS provider for India (sender ID and message templates must be registered under DLT)
- Google sign-in set up through Google Cloud (OAuth client) and the auth service
- Push notifications for the mobile app (Firebase Cloud Messaging)

## Open items
- Owner to send the real product list and photos
- Confirm repair status steps match the shop's process
- Replace placeholder product images with real photos
