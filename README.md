# **AI-Powered Business Review Platform**  

A modern alternative to Trustpilot — combining community-driven business reviews with AI-powered summaries and moderation.  
Built with **FastAPI**, **PostgreSQL**, **SQLModel**, and **React/Next.js**.  

---

## 📌 **Table of Contents**  
- [Overview](#overview)  
- [Features](#features)  
- [Tech Stack](#tech-stack)  

---

## 📝 Overview

This platform allows users to discover, evaluate, and engage with businesses.  
It’s designed to help people make informed decisions through detailed reviews, ratings, and AI-generated summaries — saving time while keeping reviews authentic.  

**Key objectives:**  
- Provide a reliable review system for customers.  
- Give businesses a chance to respond to feedback.  
- Use AI to summarize and moderate reviews for clarity and safety.  

---

## 🚀 **Features**  

### **User Features**  
- Browse businesses by category.  
- Read and write reviews.  
- Vote on reviews (“This is useful” feature).  
- AI-generated review summaries for quick insights.  

### **Business Features**  
- Claim and manage business profiles.  
- Respond to customer reviews.  

### **AI Features**  
- Automated review summarization.  
- Intelligent review moderation (detects spam, hate speech, etc.).  

### **Roles & Permissions**  
- **Visitor** – Can browse businesses across different categories and see reviews.  
- **Registered User** – Can write reviews and vote. 
- **Admin** – Manage users, businesses, categories and reviews.  
- **Supervisor** – Respond to customers' feedback.  

---

## Tech Stack 

**Frontend:**  
- [Next.js](https://nextjs.org/) (React)  
- Axios (API communication)  
- Tailwind CSS (styling)  

**Backend:**  
- [FastAPI](https://fastapi.tiangolo.com/)  
- PostgreSQL + SQLModel  
- JWT Authentication  

**AI & NLP:**  
- Review summarization model (via API)  
- Text moderation model  
