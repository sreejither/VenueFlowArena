# FlowVenueArena - Intelligent Stadium Assistant 🏟️

**FlowVenueArena** is a smart, dynamic, mobile-first web application designed to act as a personal concierge and safety assistant for large-scale stadium events. 

## 🎯 Chosen Vertical
**Event & Venue Management (Smart Assistant Persona)**
Large venues suffer from crowd bottlenecks, safety hazards, and confusing layouts. FlowVenueArena solves this by treating the stadium attendees as a live "mesh network." The app acts as an intelligent assistant, actively guiding fans through the stadium based on real-time context.

## 🧠 Approach and Logic
FlowVenueArena moves beyond static maps by implementing **Congestion-Aware Pathfinding**.
1. **The Graph**: The physical stadium is mapped as a node-based network.
2. **Dynamic Edge Weighting**: Every hallway and zone has a "travel cost" assigned to it dynamically based on live crowd occupancy data.
3. **Smart Decision Making**: Using **Dijkstra's Algorithm**, the app calculates the fastest route. If the Food Court goes into a "Red" bottleneck state (>80% capacity), the travel cost rises exponentially, and the assistant automatically reroutes the user through a physically longer, but temporally faster, path.

## ✨ Key Features & Real-World Usability
*   **Interactive SVG Floor Plan**: A custom, touch-friendly top-down representation of the stadium.
*   **Contextual Rerouting**: The assistant monitors zone capacities and updates the "EST. TRAVEL" time dynamically.
*   **Global Intelligence Network**: Anonymized user location data feeds into an analytics dashboard, detecting bottlenecks before they become hazards.
*   **Emergency SOS Protocol**: One-touch security dispatch tied to the user's localized zone.
*   **Premium Glassmorphism UI**: High-contrast, accessibility-friendly dark mode designed explicitly for one-handed mobile use in crowded, dimly lit environments.

## 🛠️ How it Works (Technical)
*   **Frontend**: React (Vite template), optimized for mobile viewports (375x812px shell).
*   **Pathfinding Engine**: Client-side execution of Dijkstra's algorithm prioritizing lowest-cost routes.
*   **Component Architecture**: Clean, functional components with `useMemo` hooks for heavy graph calculations to maintain 60fps animations.

## ☁️ Meaningful Google Services Integration
To achieve this level of intelligence and scalability at a real-world enterprise level, FlowVenueArena relies on the **Google Cloud Ecosystem**:
*   **Google Maps Platform (Geofencing)**: Used to trigger the app's transition from "exterior mapping" to "interior radar" when the user physically breaches the stadium perimeter.
*   **Firebase / Firestore**: Manages the low-latency, real-time WebSocket connections required to sync the occupancy levels of 50,000+ fans concurrently without crashing.
*   **Google Cloud Vertex AI (Predictive)**: Analyzes historical foot-traffic data to forecast bottlenecks (e.g., "Food Court will reach 95% capacity in 15 minutes"), allowing the app to proactively alter routing parameters.

## 🤔 Assumptions Made
*   Users are willing to opt into anonymous location sharing in exchange for faster routing (addressed via the Security Mesh Agreement screen).
*   The venue is outfitted with standard 5G towers or high-density Wi-Fi capable of handling thousands of simultaneous coordinate pings.
*   The mocked data in this prototype represents the data stream that would normally be provided by the real-time Firebase backend.

## 💻 Running the Project
1. Clone the repository.
2. Run `npm install` to load dependencies.
3. Run `npm run dev` to start the local development server.
*Note: For the best experience, toggle your browser's Developer Tools to Mobile View (e.g., iPhone 15 Pro).*
