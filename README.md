# iStock - Precision Livestock Management Platform

An AI-powered livestock health and nutrition application that provides farmers with immediate, citable diagnostic and treatment advice. Built with React, TypeScript, Firebase, and modern web technologies.

![Chat Page](screenshots/Chat%20Page.png)

## Overview

iStock is a comprehensive platform designed to help farmers manage livestock health and nutrition more effectively. The application combines artificial intelligence with veterinary knowledge to provide instant, reliable advice on livestock health issues, while also offering tools for optimizing feed rations to reduce costs and improve animal nutrition.

## Features

### AI-Powered Health Consultation

Ask questions about livestock health and receive immediate, evidence-based advice with source citations. The system uses Retrieval-Augmented Generation (RAG) technology to search through veterinary documents and provide accurate, citable responses.

**How it works:**
- Enter your question about livestock health, symptoms, diseases, or treatments
- The AI searches through a comprehensive database of veterinary knowledge
- Receive detailed answers with source citations and confidence scores
- All conversations are saved to your health records for future reference

### Feed Optimization

Calculate least-cost feed rations based on available ingredients and nutritional requirements. Optimize feed costs while ensuring your livestock receive proper nutrition.

**How it works:**
- Select your target animal type (Dairy Cattle, Beef Cattle, or Calf)
- Add ingredients from your library or create new ones with nutritional values and prices
- The system calculates the optimal feed ration that meets nutritional requirements at the lowest cost
- View detailed breakdowns showing the percentage of each ingredient and total cost per unit

### Ingredient Library

Manage and save feed ingredients with their complete nutritional information for quick access during feed optimization.

**How it works:**
- Create ingredient profiles with nutritional values (protein, energy, fiber, fat)
- Set unit prices for cost calculations
- Save frequently used ingredients for easy access
- Edit or update ingredient information as needed

### Health Records

View and manage your complete chat history and health consultations. Access past conversations and diagnoses whenever you need them.

**How it works:**
- All health consultations are automatically saved
- Browse your chat history organized by date
- Search through past conversations
- Reference previous diagnoses and treatment recommendations

### User Profiles

Personalized experience with user names and preferences. Your data is securely stored and accessible across devices.

**How it works:**
- Create an account to save your data
- Set your display name and preferences
- All your consultations, feed optimizations, and ingredients are saved to your profile
- Access your data from any device when logged in

### Dark Mode

Beautiful dark and light themes for comfortable viewing in any environment.

### Responsive Design

Works seamlessly on desktop, tablet, and mobile devices, so you can access iStock wherever you are.

### Accessibility

WCAG 2.1 Level AA compliant with full keyboard navigation and screen reader support, ensuring the platform is accessible to all users.

## How It Works

### Health Consultation Process

1. **Ask a Question**: Type your question about livestock health, symptoms, or treatments in the chat interface
2. **AI Processing**: The system searches through veterinary knowledge databases to find relevant information
3. **Response Generation**: An AI assistant synthesizes the information into a clear, actionable answer
4. **Source Citations**: Each response includes citations to the source materials used
5. **Save to Records**: The conversation is automatically saved to your health records

### Feed Optimization Process

1. **Select Animal Type**: Choose the type of livestock you're feeding (Dairy Cattle, Beef Cattle, or Calf)
2. **Add Ingredients**: Select ingredients from your library or add new ones with nutritional values and prices
3. **Calculate Ration**: The system uses optimization algorithms to determine the least-cost combination
4. **Review Results**: View the recommended feed ration with ingredient percentages and total cost
5. **Save Optimization**: Save successful optimizations for future reference

### Data Management

- All your data is securely stored in the cloud
- Health consultations, feed optimizations, and ingredient libraries are synced across devices
- Your information is private and only accessible to you
- Data is backed up automatically

## Technology

iStock is built with modern web technologies to ensure reliability, performance, and security:

- **Frontend**: React 18.2 with TypeScript 5.9
- **Styling**: Tailwind CSS with Radix UI components
- **Backend**: Firebase (Authentication and Firestore database)
- **AI**: Vertex AI RAG Engine for health consultations
- **State Management**: React Context API and TanStack Query

## Use Cases

- **Diagnosing Symptoms**: Get immediate advice when livestock show concerning symptoms
- **Treatment Planning**: Access evidence-based treatment protocols and recommendations
- **Feed Cost Reduction**: Optimize feed rations to reduce costs while maintaining nutrition
- **Nutritional Planning**: Plan balanced diets for different types of livestock
- **Knowledge Reference**: Access veterinary knowledge quickly when needed
- **Record Keeping**: Maintain a searchable history of health consultations and feed optimizations
