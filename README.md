# 🚀 COSMIC PODS: Space Habitat Simulator

**Design life beyond Earth.**  
Cosmic Pods is an interactive 3D simulator that allows users to **design, arrange, and optimize space habitats** for astronauts living on the Moon, Mars, or orbital stations.  
It’s an educational yet powerful tool to visualize **efficient, comfortable, and safe habitat layouts**—all inside your browser.

---

## 🌌 Overview

Creating sustainable homes in space requires balancing **life support, power, communication, and human comfort**—all within tight physical limits.

**COSMIC PODS** transforms this complex process into a **hands-on 3D simulation** where users can:
- Build modular habitats using drag-and-drop interaction  
- Arrange systems logically within a limited volume  
- Receive **real-time efficiency scores**  
- Capture snapshots and export **PDF reports**  
- Experience immersive orbital environments in 3D  

This project was developed for the **NASA Space Apps Challenge 2025**, under the theme *"Design a Visual Tool for Space Habitats."*

---

## 🧠 What It Does

The simulator lets users:
- 🧩 Place modules such as **Power Pods, Crew Quarters, Labs, Storage, and Medical Bays**
- 🪐 Design inside a **3D orbital environment**
- ⚙️ Get **instant scoring feedback** for:
  - Efficiency (power/resource connectivity)
  - Comfort (crew space and layout)
  - Safety (redundancy and module spacing)
  - Balance (symmetry and structure)
- 📸 Capture **snapshot images** and **PDF score reports**
- 🔄 Re-arrange modules freely for continuous improvement

---

## 🧩 Scoring System Explained

| Metric | Description | Points |
|---------|--------------|--------|
| **Energy Efficiency** | Based on proximity to power modules | +25 |
| **Comfort** | Evaluates access to living and recreation zones | +25 |
| **Safety & Redundancy** | Distance between critical modules | +25 |
| **Spatial Balance** | Symmetry and even distribution | +25 |

🏆 **Total Score:** 0–100  
Users start at **0**, and each correct placement dynamically increases the score.  
Removing or overlapping modules decreases the total—promoting **smart design decisions**.

---

## 🧭 Tech Stack

| Technology | Purpose |
|-------------|----------|
| **React.js (v18)** | Frontend framework |
| **Three.js / React Three Fiber** | Real-time 3D rendering |
| **@react-three/drei** | Camera, lighting, and physics helpers |
| **GSAP** | Smooth animations and transitions |
| **TailwindCSS** | Responsive design system |
| **JavaScript (ES6)** | Logic and state management |
| **ReportLab (Python)** | Generates PDF reports (optional) |

---

## ⚙️ Installation & Setup

To run locally:

```bash
# Clone this repository
git clone https://github.com/gopalkrishnarathod20/COSMIC-PODS.git

# Go inside the folder
cd COSMIC-PODS

# Install dependencies
npm install

# Start the development server
npm run dev

--
Design & Inspiration

This project’s visuals and creative direction were inspired by the following amazing sources and creators:

Source / Creator	Contribution
Adrian	UI/UX layout inspiration
ChatGPT	Error solutions and development guidance
Perplexity.ai	Video concepts and creative references
Google Gemini	AI-generated images and ideas
Compiler United Team	Design, development, and overall direction

