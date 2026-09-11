# Diabetic Retinopathy — User Interface

A Next.js frontend application for diabetic retinopathy detection and image annotation. This is one component of a distributed system split across three repositories:

| Repository | Responsibility |
|---|---|
| **Preprocessing** | Dataset preparation and image preprocessing |
| **Model Training & Inference** | Machine-learning experimentation, model training, and model serving |
| **Frontend (this repo)** | Browser-based user interaction, image upload, prediction display, and annotation |

This separation distinguishes dataset preparation, machine-learning experimentation and model serving, and browser-based user interaction.

## Prerequisites

This project requires **Node.js** and a package manager. **Yarn** is the recommended package manager (the repository includes a `yarn.lock` file and specifies `yarn@1.22.22` in `package.json`).

### Installing Yarn

```bash
npm install --global yarn
```

Verify the installation:

```bash
yarn --version
```

### Using npm instead

If you prefer npm, you can use it as an alternative:

```bash
npm install
```

## Getting Started

Install dependencies:

```bash
yarn install
```

Start the development server:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Repository Structure

```
.
├── src/
│   ├── components/          # React UI components
│   │   ├── AnnotationCanvas/      # Canvas for drawing annotations
│   │   ├── AnnotationConnector/   # Connects annotations together
│   │   ├── AnnotationList/        # Displays list of annotations
│   │   ├── ImageUploader/         # Image upload interface
│   │   ├── PredictionResult/      # Displays model prediction results
│   │   └── StatusMessage/         # Status/error messages
│   ├── containers/          # Container components
│   │   └── ImageAnalysis/         # Main image analysis orchestrator
│   ├── lib/                 # Utilities and helpers
│   │   ├── annotations/           # Annotation color utilities
│   │   └── api/                   # API client (predictImage)
│   ├── pages/               # Next.js pages and API routes
│   │   ├── api/                   # API routes (predict, hello)
│   │   ├── _app.tsx               # App wrapper
│   │   ├── _document.tsx          # Custom document
│   │   └── index.tsx              # Home page
│   ├── styles/              # Global CSS and styles
│   └── types/               # TypeScript type definitions
│       ├── annotation.ts
│       ├── grade.ts
│       ├── image.ts
│       └── prediction.ts
├── public/                  # Static assets
├── package.json
├── tsconfig.json
├── next.config.ts
└── yarn.lock
```

## Available Scripts

| Command | Description |
|---|---|
| `yarn dev` | Start the Next.js development server |
| `yarn build` | Build the application for production |
| `yarn start` | Start the production server |
| `yarn lint` | Run ESLint |
